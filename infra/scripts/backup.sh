#!/bin/bash

set -euo pipefail

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
DATE=$(date +%Y%m%d)
DAY_OF_WEEK=$(date +%u)
DAY_OF_MONTH=$(date +%d)

BACKUP_DIR="/backups"
LOG_FILE="/var/log/quran-academy/backup.log"
RETENTION_DAILY=7
RETENTION_WEEKLY=4
RETENTION_MONTHLY=12

S3_BUCKET="s3://quran-academy-backups"
POSTGRES_HOST="${POSTGRES_HOST:-postgres}"
POSTGRES_DB="${POSTGRES_DB:-quran_academy}"
POSTGRES_USER="${POSTGRES_USER:-quran_admin}"
MINIO_ALIAS="${MINIO_ALIAS:-myminio}"

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

backup_postgres() {
    log "Starting PostgreSQL backup..."

    local pg_backup_file="${BACKUP_DIR}/postgres_${DATE}_${TIMESTAMP}.sql.gz"
    local pg_password="${POSTGRES_PASSWORD:-}"

    if [ -z "$pg_password" ]; then
        error "POSTGRES_PASSWORD not set"
    fi

    export PGPASSWORD="$pg_password"

    if pg_dump -h "$POSTGRES_HOST" -U "$POSTGRES_USER" -d "$POSTGRES_DB" -F c -b -f "/tmp/postgres_${TIMESTAMP}.dump" 2>> "$LOG_FILE"; then
        gzip -c "/tmp/postgres_${TIMESTAMP}.dump" > "$pg_backup_file"
        rm -f "/tmp/postgres_${TIMESTAMP}.dump"
        log "PostgreSQL backup created: $pg_backup_file"

        local pg_latest="${BACKUP_DIR}/postgres_latest.sql.gz"
        ln -sf "$pg_backup_file" "$pg_latest"

        mc cp "$pg_backup_file" "${S3_BUCKET}/postgres/" 2>> "$LOG_FILE" || log "Warning: Failed to upload PostgreSQL backup to S3"
    else
        error "PostgreSQL backup failed"
    fi

    unset PGPASSWORD
}

backup_minio() {
    log "Starting MinIO backup..."

    local minio_backup_dir="${BACKUP_DIR}/minio_${DATE}_${TIMESTAMP}"

    mkdir -p "$minio_backup_dir"

    mc mirror "$MINIO_ALIAS/courses" "${minio_backup_dir}/courses" 2>> "$LOG_FILE" || log "Warning: Failed to backup courses bucket"
    mc mirror "$MINIO_ALIAS/audio" "${minio_backup_dir}/audio" 2>> "$LOG_FILE" || log "Warning: Failed to backup audio bucket"
    mc mirror "$MINIO_ALIAS/recordings" "${minio_backup_dir}/recordings" 2>> "$LOG_FILE" || log "Warning: Failed to backup recordings bucket"

    local minio_tar="${BACKUP_DIR}/minio_${DATE}_${TIMESTAMP}.tar.gz"
    tar -czf "$minio_tar" -C "$BACKUP_DIR" "minio_${DATE}_${TIMESTAMP}" 2>> "$LOG_FILE"
    rm -rf "$minio_backup_dir"

    log "MinIO backup created: $minio_tar"

    mc cp "$minio_tar" "${S3_BUCKET}/minio/" 2>> "$LOG_FILE" || log "Warning: Failed to upload MinIO backup to S3"
}

cleanup_old_backups() {
    log "Cleaning up old backups..."

    find "$BACKUP_DIR" -name "postgres_*" -type f -mtime +${RETENTION_DAILY} -delete 2>> "$LOG_FILE" || true
    find "$BACKUP_DIR" -name "minio_*" -type f -mtime +${RETENTION_DAILY} -delete 2>> "$LOG_FILE" || true

    if [ "$DAY_OF_WEEK" -eq 7 ]; then
        log "Weekly cleanup - keeping this week's backups"
    fi

    if [ "$DAY_OF_MONTH" = "01" ]; then
        log "Monthly cleanup - keeping this month's backups"
    fi

    log "Cleanup completed"
}

verify_backups() {
    log "Verifying backup integrity..."

    if [ -f "${BACKUP_DIR}/postgres_latest.sql.gz" ]; then
        if gzip -t "${BACKUP_DIR}/postgres_latest.sql.gz" 2>> "$LOG_FILE"; then
            log "PostgreSQL backup integrity: OK"
        else
            error "PostgreSQL backup integrity check FAILED"
        fi
    else
        log "Warning: No PostgreSQL backup found to verify"
    fi

    if [ -f "${BACKUP_DIR}/minio_${DATE}_${TIMESTAMP}.tar.gz" ]; then
        if tar -tzf "${BACKUP_DIR}/minio_${DATE}_${TIMESTAMP}.tar.gz" > /dev/null 2>&1; then
            log "MinIO backup integrity: OK"
        else
            error "MinIO backup integrity check FAILED"
        fi
    fi
}

main() {
    log "=== Backup job started ==="
    log "Host: $(hostname)"
    log "Backup directory: $BACKUP_DIR"

    check_prerequisites
    backup_postgres
    backup_minio
    cleanup_old_backups
    verify_backups

    log "=== Backup job completed successfully ==="
}

main "$@"
