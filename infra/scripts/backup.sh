#!/bin/bash

set -euo pipefail

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
DATE=$(date +%Y%m%d)
DAY_OF_WEEK=$(date +%u)
DAY_OF_MONTH=$(date +%d)
HOUR=$(date +%H)

BACKUP_DIR="${BACKUP_DIR:-/backups}"
LOG_FILE="/var/log/quran-academy/backup.log"
RETENTION_DAILY=7
RETENTION_WEEKLY=4
RETENTION_MONTHLY=12

S3_BUCKET="${S3_BUCKET:-s3://quran-academy-backups}"
RCLONE_REMOTE="${RCLONE_REMOTE:-}"
POSTGRES_HOST="${POSTGRES_HOST:-postgres}"
POSTGRES_DB="${POSTGRES_DB:-quran_academy}"
POSTGRES_USER="${POSTGRES_USER:-quran_admin}"
MINIO_ALIAS="${MINIO_ALIAS:-myminio}"

BACKUP_TYPE="${1:-full}"

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

error() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] ERROR: $1" | tee -a "$LOG_FILE" >&2
    exit 1
}

check_prerequisites() {
    if ! command -v pg_dump &> /dev/null; then
        error "pg_dump not found. Install postgresql-client."
    fi

    if ! command -v mc &> /dev/null; then
        error "mc (MinIO Client) not found. Install minio-client."
    fi

    if [ ! -d "$BACKUP_DIR" ]; then
        mkdir -p "$BACKUP_DIR" || error "Failed to create backup directory: $BACKUP_DIR"
    fi

    if [ ! -d "$(dirname "$LOG_FILE")" ]; then
        mkdir -p "$(dirname "$LOG_FILE")" || error "Failed to create log directory"
    fi
}

backup_postgres_full() {
    log "Starting full PostgreSQL backup..."

    local pg_backup_file="${BACKUP_DIR}/postgres_full_${DATE}_${TIMESTAMP}.sql.gz"
    local pg_password="${POSTGRES_PASSWORD:-}"

    if [ -z "$pg_password" ]; then
        error "POSTGRES_PASSWORD not set"
    fi

    export PGPASSWORD="$pg_password"

    if pg_dump -h "$POSTGRES_HOST" -U "$POSTGRES_USER" -d "$POSTGRES_DB" -F c -b -f "/tmp/postgres_full_${TIMESTAMP}.dump" 2>> "$LOG_FILE"; then
        gzip -c "/tmp/postgres_full_${TIMESTAMP}.dump" > "$pg_backup_file"
        rm -f "/tmp/postgres_full_${TIMESTAMP}.dump"
        log "PostgreSQL full backup created: $pg_backup_file"

        local pg_latest="${BACKUP_DIR}/postgres_latest.sql.gz"
        ln -sf "$pg_backup_file" "$pg_latest"

        mc cp "$pg_backup_file" "${S3_BUCKET}/postgres/" 2>> "$LOG_FILE" || log "Warning: Failed to upload PostgreSQL backup to S3"
    else
        error "PostgreSQL full backup failed"
    fi

    unset PGPASSWORD
}

backup_postgres_incremental() {
    log "Starting incremental PostgreSQL backup..."

    local pg_backup_file="${BACKUP_DIR}/postgres_incr_${DATE}_${TIMESTAMP}.sql.gz"
    local pg_password="${POSTGRES_PASSWORD:-}"

    if [ -z "$pg_password" ]; then
        error "POSTGRES_PASSWORD not set"
    fi

    export PGPASSWORD="$pg_password"

    local last_backup=$(ls -t "${BACKUP_DIR}"/postgres_full_*.sql.gz 2>/dev/null | head -1)

    if [ -z "$last_backup" ]; then
        log "No full backup found, creating full backup instead..."
        backup_postgres_full
        return
    fi

    local last_backup_time=$(stat -c %Y "$last_backup" 2>/dev/null || echo "0")

    if pg_dump -h "$POSTGRES_HOST" -U "$POSTGRES_USER" -d "$POSTGRES_DB" -F c -b -f "/tmp/postgres_incr_${TIMESTAMP}.dump" 2>> "$LOG_FILE"; then
        gzip -c "/tmp/postgres_incr_${TIMESTAMP}.dump" > "$pg_backup_file"
        rm -f "/tmp/postgres_incr_${TIMESTAMP}.dump"
        log "PostgreSQL incremental backup created: $pg_backup_file"

        mc cp "$pg_backup_file" "${S3_BUCKET}/postgres/incremental/" 2>> "$LOG_FILE" || log "Warning: Failed to upload PostgreSQL incremental backup to S3"
    else
        error "PostgreSQL incremental backup failed"
    fi

    unset PGPASSWORD
}

backup_postgres() {
    case "$BACKUP_TYPE" in
        full)
            backup_postgres_full
            ;;
        incr|incremental)
            backup_postgres_incremental
            ;;
        *)
            if [ "$HOUR" = "02" ]; then
                backup_postgres_full
            else
                backup_postgres_incremental
            fi
            ;;
    esac
}

backup_minio() {
    log "Starting MinIO backup..."

    local minio_backup_dir="${BACKUP_DIR}/minio_${DATE}_${TIMESTAMP}"

    mkdir -p "$minio_backup_dir"

    log "Syncing courses bucket..."
    mc mirror "$MINIO_ALIAS/courses" "${minio_backup_dir}/courses" 2>> "$LOG_FILE" || log "Warning: Failed to backup courses bucket"

    log "Syncing audio bucket..."
    mc mirror "$MINIO_ALIAS/audio" "${minio_backup_dir}/audio" 2>> "$LOG_FILE" || log "Warning: Failed to backup audio bucket"

    log "Syncing recordings bucket..."
    mc mirror "$MINIO_ALIAS/recordings" "${minio_backup_dir}/recordings" 2>> "$LOG_FILE" || log "Warning: Failed to backup recordings bucket"

    local minio_tar="${BACKUP_DIR}/minio_${DATE}_${TIMESTAMP}.tar.gz"
    tar -czf "$minio_tar" -C "$BACKUP_DIR" "minio_${DATE}_${TIMESTAMP}" 2>> "$LOG_FILE"
    rm -rf "$minio_backup_dir"

    log "MinIO backup created: $minio_tar"

    mc cp "$minio_tar" "${S3_BUCKET}/minio/" 2>> "$LOG_FILE" || log "Warning: Failed to upload MinIO backup to S3"

    local minio_latest="${BACKUP_DIR}/minio_latest.tar.gz"
    ln -sf "$minio_tar" "$minio_latest"
}

encrypt_backup() {
    local backup_file="$1"
    local encrypt_password="${BACKUP_ENCRYPT_PASSWORD:-}"

    if [ -z "$encrypt_password" ]; then
        log "Warning: BACKUP_ENCRYPT_PASSWORD not set, skipping encryption"
        return
    fi

    if ! command -v gpg &> /dev/null; then
        log "Warning: gpg not found, skipping encryption"
        return
    fi

    log "Encrypting backup: $backup_file"

    local encrypted_file="${backup_file}.gpg"
    echo "$encrypt_password" | gpg --batch --yes --passphrase-fd 0 -c -o "$encrypted_file" "$backup_file" 2>> "$LOG_FILE"

    if [ -f "$encrypted_file" ]; then
        log "Encrypted backup created: $encrypted_file"
        rm -f "$backup_file"
    else
        log "Warning: Encryption failed for $backup_file"
    fi
}

backup_offsite_rclone() {
    local remote="${RCLONE_REMOTE:-}"

    if [ -z "$remote" ]; then
        log "Warning: RCLONE_REMOTE not set, skipping offsite backup"
        return
    fi

    if ! command -v rclone &> /dev/null; then
        log "Warning: rclone not found, skipping offsite backup"
        return
    fi

    log "Starting offsite backup to $remote..."

    local latest_postgres=$(ls -t "${BACKUP_DIR}"/postgres_*.sql.gz 2>/dev/null | head -1)
    local latest_minio=$(ls -t "${BACKUP_DIR}"/minio_*.tar.gz 2>/dev/null | head -1)

    if [ -n "$latest_postgres" ]; then
        log "Uploading PostgreSQL backup to $remote..."
        rclone copy "$latest_postgres" "$remote:/quran-academy-backups/postgres/" --progress 2>> "$LOG_FILE" || log "Warning: Failed to upload PostgreSQL backup to offsite"
    fi

    if [ -n "$latest_minio" ]; then
        log "Uploading MinIO backup to $remote..."
        rclone copy "$latest_minio" "$remote:/quran-academy-backups/minio/" --progress 2>> "$LOG_FILE" || log "Warning: Failed to upload MinIO backup to offsite"
    fi

    log "Offsite backup completed"
}

cleanup_old_backups() {
    log "Cleaning up old backups..."

    find "$BACKUP_DIR" -name "postgres_full_*" -type f -mtime +${RETENTION_DAILY} -delete 2>> "$LOG_FILE" || true
    find "$BACKUP_DIR" -name "postgres_incr_*" -type f -mtime +${RETENTION_DAILY} -delete 2>> "$LOG_FILE" || true
    find "$BACKUP_DIR" -name "minio_*" -type f -mtime +${RETENTION_DAILY} -delete 2>> "$LOG_FILE" || true

    if [ "$DAY_OF_WEEK" -eq 7 ]; then
        log "Weekly cleanup - keeping this week's backups"
        find "$BACKUP_DIR" -name "postgres_full_*" -type f -mtime +$((RETENTION_DAILY * 2)) -delete 2>> "$LOG_FILE" || true
    fi

    if [ "$DAY_OF_MONTH" = "01" ]; then
        log "Monthly cleanup - keeping this month's backups"
        find "$BACKUP_DIR" -name "postgres_full_*" -type f -mtime +$((RETENTION_MONTHLY * 30)) -delete 2>> "$LOG_FILE" || true
    fi

    log "Cleanup completed"
}

verify_backups() {
    log "Verifying backup integrity..."

    local latest_postgres=$(ls -t "${BACKUP_DIR}"/postgres_*.sql.gz 2>/dev/null | head -1)

    if [ -n "$latest_postgres" ]; then
        if gzip -t "$latest_postgres" 2>> "$LOG_FILE"; then
            log "PostgreSQL backup integrity: OK"

            log "Verifying PostgreSQL schema..."
            local pg_password="${POSTGRES_PASSWORD:-}"
            if [ -n "$pg_password" ]; then
                export PGPASSWORD="$pg_password"
                gunzip -c "$latest_postgres" | pg_restore --schema-only -h "$POSTGRES_HOST" -U "$POSTGRES_USER" -d "$POSTGRES_DB" 2>> "$LOG_FILE" | head -20 || log "Schema verification completed with warnings"
                unset PGPASSWORD
            fi
        else
            error "PostgreSQL backup integrity check FAILED"
        fi
    else
        log "Warning: No PostgreSQL backup found to verify"
    fi

    local latest_minio=$(ls -t "${BACKUP_DIR}"/minio_*.tar.gz 2>/dev/null | head -1)

    if [ -n "$latest_minio" ]; then
        if tar -tzf "$latest_minio" > /dev/null 2>&1; then
            log "MinIO backup integrity: OK"
        else
            error "MinIO backup integrity check FAILED"
        fi
    fi
}

restore_test() {
    log "Running restore test procedure..."

    local latest_postgres=$(ls -t "${BACKUP_DIR}"/postgres_*.sql.gz 2>/dev/null | head -1)

    if [ -z "$latest_postgres" ]; then
        log "Warning: No backup found for restore test"
        return
    fi

    log "Restore test: Checking if backup is restorable..."
    local pg_password="${POSTGRES_PASSWORD:-}"

    if [ -n "$pg_password" ]; then
        export PGPASSWORD="$pg_password"

        local temp_restore_db="quran_academy_restore_test_$$"

        if psql -h "$POSTGRES_HOST" -U "$POSTGRES_USER" -d "postgres" -c "CREATE DATABASE $temp_restore_db" 2>> "$LOG_FILE"; then
            log "Restore test: Created temporary database $temp_restore_db"

            if gunzip -c "$latest_postgres" | pg_restore -h "$POSTGRES_HOST" -U "$POSTGRES_USER" -d "$temp_restore_db" --schema-only 2>> "$LOG_FILE" | tail -5; then
                log "Restore test: Schema validation PASSED"

                psql -h "$POSTGRES_HOST" -U "$POSTGRES_USER" -d "postgres" -c "DROP DATABASE $temp_restore_db" 2>> "$LOG_FILE"
                log "Restore test: Cleaned up temporary database"
            else
                log "Restore test: Schema validation FAILED - backup may be corrupted"
                psql -h "$POSTGRES_HOST" -U "$POSTGRES_USER" -d "postgres" -c "DROP DATABASE $temp_restore_db" 2>> "$LOG_FILE" || true
            fi
        else
            log "Restore test: Could not create temporary database - may indicate permission issues"
        fi

        unset PGPASSWORD
    fi
}

main() {
    log "=== Backup job started ==="
    log "Host: $(hostname)"
    log "Backup directory: $BACKUP_DIR"
    log "Backup type: $BACKUP_TYPE"

    check_prerequisites
    backup_postgres
    backup_minio
    encrypt_backup "${BACKUP_DIR}/postgres_latest.sql.gz" || true
    encrypt_backup "${BACKUP_DIR}/minio_latest.tar.gz" || true
    backup_offsite_rclone
    cleanup_old_backups
    verify_backups

    if [ "$BACKUP_TYPE" = "verify" ] || [ "$DAY_OF_WEEK" = "0" ]; then
        restore_test
    fi

    log "=== Backup job completed successfully ==="
}

main "$@"
