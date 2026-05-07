#!/bin/bash
set -euo pipefail

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
DATE=$(date +%Y%m%d)
LOG_FILE="/var/log/quran-academy/restore.log"

BACKUP_DIR="${BACKUP_DIR:-/backups}"
S3_BUCKET="${S3_BUCKET:-s3://quran-academy-backups}"
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
    if ! command -v pg_restore &> /dev/null; then
        error "pg_restore not found. Install postgresql-client."
    fi

    if ! command -v mc &> /dev/null; then
        error "mc (MinIO Client) not found. Install minio-client."
    fi
}

list_available_backups() {
    log "Available PostgreSQL backups:"
    ls -lh "${BACKUP_DIR}"/postgres_*.sql.gz 2>/dev/null || log "No local PostgreSQL backups found"

    log "Available MinIO backups:"
    ls -lh "${BACKUP_DIR}"/minio_*.tar.gz 2>/dev/null || log "No local MinIO backups found"

    if command -v mc &> /dev/null; then
        log "S3 PostgreSQL backups:"
        mc ls "${S3_BUCKET}/postgres/" 2>/dev/null || true
        log "S3 MinIO backups:"
        mc ls "${S3_BUCKET}/minio/" 2>/dev/null || true
    fi
}

restore_postgres() {
    local backup_file="${1:-}"
    local pg_password="${POSTGRES_PASSWORD:-}"

    if [ -z "$pg_password" ]; then
        read -sp "Enter PostgreSQL password: " pg_password
        echo
    fi

    if [ -z "$backup_file" ]; then
        backup_file=$(ls -t "${BACKUP_DIR}"/postgres_*.sql.gz 2>/dev/null | head -1)
        if [ -z "$backup_file" ]; then
            error "No PostgreSQL backup found"
        fi
    fi

    log "Restoring PostgreSQL from: $backup_file"

    export PGPASSWORD="$pg_password"

    local temp_dir="/tmp/restore_${TIMESTAMP}"
    mkdir -p "$temp_dir"

    log "Decompressing backup..."
    gunzip -c "$backup_file" > "${temp_dir}/restore.sql"

    log "Verifying backup integrity..."
    if ! pg_restore --schema-only -h "$POSTGRES_HOST" -U "$POSTGRES_USER" -d "$POSTGRES_DB" \
        --dbname=postgres://${POSTGRES_USER}:${pg_password}@${POSTGRES_HOST}/${POSTGRES_DB} \
        "${temp_dir}/restore.sql" 2>&1 | head -20; then
        log "Warning: Schema verification showed warnings"
    fi

    log "Dropping existing connections..."
    psql -h "$POSTGRES_HOST" -U "$POSTGRES_USER" -d "$POSTGRES_DB" \
        -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = '$POSTGRES_DB' AND pid <> pg_backend_pid();" \
        2>/dev/null || true

    log "Restoring database..."
    psql -h "$POSTGRES_HOST" -U "$POSTGRES_USER" -d "$POSTGRES_DB" \
        -f "${temp_dir}/restore.sql" 2>> "$LOG_FILE"

    rm -rf "$temp_dir"
    unset PGPASSWORD

    log "PostgreSQL restore completed successfully"
}

restore_minio() {
    local backup_file="${1:-}"

    if [ -z "$backup_file" ]; then
        backup_file=$(ls -t "${BACKUP_DIR}"/minio_*.tar.gz 2>/dev/null | head -1)
        if [ -z "$backup_file" ]; then
            error "No MinIO backup found"
        fi
    fi

    log "Restoring MinIO from: $backup_file"

    local temp_dir="/tmp/restore_minio_${TIMESTAMP}"
    mkdir -p "$temp_dir"

    log "Extracting backup..."
    tar -xzf "$backup_file" -C "$temp_dir"

    local extracted_dir=$(find "$temp_dir" -mindepth 1 -maxdepth 1 -type d | head -1)

    log "Syncing courses bucket..."
    mc mirror "${extracted_dir}/courses" "${MINIO_ALIAS}/courses" --overwrite 2>> "$LOG_FILE" || \
        log "Warning: Failed to restore courses bucket"

    log "Syncing audio bucket..."
    mc mirror "${extracted_dir}/audio" "${MINIO_ALIAS}/audio" --overwrite 2>> "$LOG_FILE" || \
        log "Warning: Failed to restore audio bucket"

    log "Syncing recordings bucket..."
    mc mirror "${extracted_dir}/recordings" "${MINIO_ALIAS}/recordings" --overwrite 2>> "$LOG_FILE" || \
        log "Warning: Failed to restore recordings bucket"

    rm -rf "$temp_dir"
    log "MinIO restore completed successfully"
}

health_check() {
    log "Running health checks..."

    log "Checking PostgreSQL..."
    if pg_isready -h "$POSTGRES_HOST" -U "$POSTGRES_USER" -d "$POSTGRES_DB" 2>> "$LOG_FILE"; then
        log "PostgreSQL: OK"
    else
        error "PostgreSQL health check failed"
    fi

    log "Checking MinIO..."
    if mc ready "${MINIO_ALIAS}" 2>> "$LOG_FILE"; then
        log "MinIO: OK"
    else
        error "MinIO health check failed"
    fi

    log "Checking Docker containers..."
    docker ps --filter "name=quran_academy" --format "{{.Names}}: {{.Status}}" 2>> "$LOG_FILE" || true

    log "Health checks completed"
}

main() {
    log "========================================="
    log "Quran Academy Restore Script"
    log "========================================="

    check_prerequisites

    if [ ! -d "$BACKUP_DIR" ]; then
        mkdir -p "$BACKUP_DIR"
    fi

    if [ ! -d "$(dirname "$LOG_FILE")" ]; then
        mkdir -p "$(dirname "$LOG_FILE")"
    fi

    case "${1:-list}" in
        list)
            list_available_backups
            ;;
        postgres)
            restore_postgres "${2:-}"
            health_check
            ;;
        minio)
            restore_minio "${2:-}"
            health_check
            ;;
        all)
            restore_postgres "${2:-}"
            restore_minio "${3:-}"
            health_check
            ;;
        help|--help|-h)
            echo "Usage: $0 [action] [backup_file]"
            echo ""
            echo "Actions:"
            echo "  list              - List available backups"
            echo "  postgres [file]  - Restore PostgreSQL (uses latest if no file specified)"
            echo "  minio [file]     - Restore MinIO (uses latest if no file specified)"
            echo "  all [pg_file] [minio_file] - Restore both"
            echo "  help             - Show this help"
            echo ""
            echo "Examples:"
            echo "  $0 list"
            echo "  $0 postgres /backups/postgres_20260115_120000.sql.gz"
            echo "  $0 all"
            ;;
        *)
            error "Unknown action: $1. Use '$0 help' for usage."
            ;;
    esac

    log "========================================="
    log "Restore operation completed"
    log "========================================="
}

main "$@"
