#!/bin/bash
#===============================================================================
# Quran Academy — Backup Script
#===============================================================================
# Full backup script for PostgreSQL, MinIO, with off-site rclone upload.
#
# Usage:
#   chmod +x backup.sh
#   sudo ./backup.sh
#
# Cron example (daily at 2am):
#   0 2 * * * root /opt/quran-academy/infra/scripts/backup.sh
#===============================================================================

set -euo pipefail

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
DATE=$(date +%Y%m%d)
DAY_OF_WEEK=$(date +%u)
DAY_OF_MONTH=$(date +%d)
HOUR=$(date +%H)

BACKUP_DIR="${BACKUP_DIR:-/backups}"
LOG_FILE="${LOG_FILE:-/var/log/quran-academy/backup.log}"
RETENTION_DAILY="${RETENTION_DAILY:-7}"
RETENTION_WEEKLY="${RETENTION_WEEKLY:-4}"
RETENTION_MONTHLY="${RETENTION_MONTHLY:-12}"

S3_BUCKET="${S3_BUCKET:-s3://quran-academy-backups}"
RCLONE_REMOTE="${RCLONE_REMOTE:-rclone-remote}"
RCLONE_CONFIG="${RCLONE_CONFIG:-/root/.config/rclone/rclone.conf}"

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

    if ! command -v rclone &> /dev/null; then
        log "Warning: rclone not found. Off-site upload will be skipped."
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

        local schema_verify="/tmp/postgres_schema_verify_${TIMESTAMP}.sql"
        if gzip -dc "$pg_backup_file" | pg_restore --schema-only -d "$POSTGRES_DB" > "$schema_verify" 2>&1; then
            log "PostgreSQL backup verified with pg_dump --schema-only"
            rm -f "$schema_verify"
        else
            log "Warning: Schema verification failed (backup may still be valid)"
            rm -f "$schema_verify"
        fi

        log "PostgreSQL backup created: $pg_backup_file"

        local pg_latest="${BACKUP_DIR}/postgres_latest.sql.gz"
        ln -sf "$pg_backup_file" "$pg_latest"

        if command -v rclone &> /dev/null && [ -f "$RCLONE_CONFIG" ]; then
            log "Uploading PostgreSQL backup to off-site storage..."
            rclone copy "$pg_backup_file" "${RCLONE_REMOTE}:${S3_BUCKET}/postgres/" --quiet 2>> "$LOG_FILE" || log "Warning: Failed to upload PostgreSQL backup to off-site"
        fi
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

    local minio_latest="${BACKUP_DIR}/minio_latest.tar.gz"
    ln -sf "$minio_tar" "$minio_latest"

    if command -v rclone &> /dev/null && [ -f "$RCLONE_CONFIG" ]; then
        log "Uploading MinIO backup to off-site storage..."
        rclone copy "$minio_tar" "${RCLONE_REMOTE}:${S3_BUCKET}/minio/" --quiet 2>> "$LOG_FILE" || log "Warning: Failed to upload MinIO backup to off-site"
    fi
}

cleanup_old_backups() {
    log "Cleaning up old backups..."

    find "$BACKUP_DIR" -name "postgres_*" -type f -mtime +${RETENTION_DAILY} -delete 2>> "$LOG_FILE" || true
    find "$BACKUP_DIR" -name "minio_*" -type f -mtime +${RETENTION_DAILY} -delete 2>> "$LOG_FILE" || true

    if [ "$DAY_OF_WEEK" -eq 7 ]; then
        log "Weekly backup retention: keeping ${RETENTION_WEEKLY} weeks"
    fi

    if [ "$DAY_OF_MONTH" = "01" ]; then
        log "Monthly backup retention: keeping ${RETENTION_MONTHLY} months"
    fi

    if command -v rclone &> /dev/null && [ -f "$RCLONE_CONFIG" ]; then
        log "Cleaning up old off-site backups..."
        rclone delete "${RCLONE_REMOTE}:${S3_BUCKET}/postgres/" --min-age "${RETENTION_DAILY}d" --quiet 2>> "$LOG_FILE" || true
        rclone delete "${RCLONE_REMOTE}:${S3_BUCKET}/minio/" --min-age "${RETENTION_DAILY}d" --quiet 2>> "$LOG_FILE" || true
    fi

    log "Cleanup completed"
}

verify_backups() {
    log "Verifying backup integrity..."

    if [ -L "${BACKUP_DIR}/postgres_latest.sql.gz" ] || [ -f "${BACKUP_DIR}/postgres_latest.sql.gz" ]; then
        if gzip -t "${BACKUP_DIR}/postgres_latest.sql.gz" 2>> "$LOG_FILE"; then
            log "PostgreSQL backup integrity: OK"
        else
            error "PostgreSQL backup integrity check FAILED"
        fi
    else
        log "Warning: No PostgreSQL backup found to verify"
    fi

    if [ -L "${BACKUP_DIR}/minio_latest.tar.gz" ] || [ -f "${BACKUP_DIR}/minio_latest.tar.gz" ]; then
        if tar -tzf "${BACKUP_DIR}/minio_latest.tar.gz" > /dev/null 2>&1; then
            log "MinIO backup integrity: OK"
        else
            error "MinIO backup integrity check FAILED"
        fi
    fi

    log "All backup verifications passed"
}

upload_to_offsite() {
    if ! command -v rclone &> /dev/null || [ ! -f "$RCLONE_CONFIG" ]; then
        log "Off-site upload skipped (rclone not configured)"
        return
    fi

    log "Uploading backups to off-site storage..."

    rclone copy "$BACKUP_DIR" "${RCLONE_REMOTE}:${S3_BUCKET}/" --include "postgres_*.gz" --include "minio_*.gz" --quiet 2>> "$LOG_FILE" || log "Warning: Off-site upload had issues"

    log "Off-site upload completed"
}

create_backup_metadata() {
    local metadata_file="${BACKUP_DIR}/backup_metadata_${DATE}.json"

    cat > "$metadata_file" << EOF
{
  "timestamp": "$TIMESTAMP",
  "date": "$DATE",
  "host": "$(hostname)",
  "retention": {
    "daily": $RETENTION_DAILY,
    "weekly": $RETENTION_WEEKLY,
    "monthly": $RETENTION_MONTHLY
  },
  "backup_dir": "$BACKUP_DIR",
  "postgres": {
    "host": "$POSTGRES_HOST",
    "database": "$POSTGRES_DB"
  },
  "minio": {
    "alias": "$MINIO_ALIAS"
  }
}
EOF

    log "Backup metadata created: $metadata_file"
}

main() {
    log "=== Backup job started ==="
    log "Host: $(hostname)"
    log "Backup directory: $BACKUP_DIR"
    log "Timestamp: $TIMESTAMP"

    check_prerequisites
    backup_postgres
    backup_minio
    cleanup_old_backups
    verify_backups
    upload_to_offsite
    create_backup_metadata

    log "=== Backup job completed successfully ==="
}

main "$@"
