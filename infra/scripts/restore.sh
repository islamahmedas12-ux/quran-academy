#!/bin/bash
#===============================================================================
# Quran Academy — Restore Script
#===============================================================================
# This script restores PostgreSQL and MinIO from backups.
#
# Usage:
#   chmod +x restore.sh
#   sudo ./restore.sh [postgres|minio|all] [backup_file]
#
# Examples:
#   sudo ./restore.sh postgres /backups/postgres_latest.sql.gz
#   sudo ./restore.sh minio /backups/minio_latest.tar.gz
#   sudo ./restore.sh all
#===============================================================================

set -euo pipefail

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] [INFO] $1" | tee -a "$LOG_FILE"
}

error() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] [ERROR] $1" | tee -a "$LOG_FILE" >&2
    exit 1
}

BACKUP_DIR="${BACKUP_DIR:-/backups}"
LOG_FILE="${LOG_FILE:-/var/log/quran-academy/restore.log}"
POSTGRES_HOST="${POSTGRES_HOST:-postgres}"
POSTGRES_DB="${POSTGRES_DB:-quran_academy}"
POSTGRES_USER="${POSTGRES_USER:-quran_admin}"
MINIO_ALIAS="${MINIO_ALIAS:-myminio}"

check_prerequisites() {
    if ! command -v pg_restore &> /dev/null; then
        error "pg_restore not found. Install postgresql-client."
    fi

    if ! command -v mc &> /dev/null; then
        error "mc (MinIO Client) not found. Install minio-client."
    fi

    if [ ! -d "$(dirname "$LOG_FILE")" ]; then
        mkdir -p "$(dirname "$LOG_FILE")"
    fi
}

#-------------------------------------------------------------------------------
# PostgreSQL Restore
#-------------------------------------------------------------------------------
restore_postgres() {
    local backup_file="${1:-}"
    local pg_password="${POSTGRES_PASSWORD:-}"

    if [ -z "$pg_password" ]; then
        error "POSTGRES_PASSWORD not set"
    fi

    if [ -z "$backup_file" ]; then
        backup_file="${BACKUP_DIR}/postgres_latest.sql.gz"
    fi

    if [ ! -f "$backup_file" ]; then
        error "Backup file not found: $backup_file"
    fi

    log "=== Starting PostgreSQL Restore ==="
    log "Backup file: $backup_file"
    log "Database: $POSTGRES_DB"

    export PGPASSWORD="$pg_password"

    log "Verifying backup integrity..."
    if ! gzip -t "$backup_file" 2>> "$LOG_FILE"; then
        error "Backup file is corrupted: $backup_file"
    fi

    log "Creating database backup of current state (just in case)..."
    local pre_backup="${BACKUP_DIR}/pre_restore_$(date +%Y%m%d_%H%M%S).dump"
    pg_dump -h "$POSTGRES_HOST" -U "$POSTGRES_USER" -d "$POSTGRES_DB" -F c -f "$pre_backup" 2>> "$LOG_FILE" || true

    log "Dropping existing connections..."
    psql -h "$POSTGRES_HOST" -U "$POSTGRES_USER" -d postgres -c "SELECT pg_terminate_backend(pg_stat_activity.pid) FROM pg_stat_activity WHERE pg_stat_activity.datname = '$POSTGRES_DB' AND pid <> pg_backend_pid();" 2>> "$LOG_FILE" || true

    log "Dropping and recreating database..."
    psql -h "$POSTGRES_HOST" -U "$POSTGRES_USER" -d postgres -c "DROP DATABASE IF EXISTS $POSTGRES_DB;" 2>> "$LOG_FILE"
    psql -h "$POSTGRES_HOST" -U "$POSTGRES_USER" -d postgres -c "CREATE DATABASE $POSTGRES_DB;" 2>> "$LOG_FILE"

    log "Restoring database from backup..."
    local temp_file="/tmp/restore_$$_$(basename "$backup_file")"
    gunzip -c "$backup_file" > "$temp_file"

    pg_restore -h "$POSTGRES_HOST" -U "$POSTGRES_USER" -d "$POSTGRES_DB" --no-owner --no-acl "$temp_file" 2>> "$LOG_FILE"

    rm -f "$temp_file"

    log "Verifying restored schema..."
    if psql -h "$POSTGRES_HOST" -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "SELECT COUNT(*) FROM information_schema.tables;" 2>> "$LOG_FILE" | grep -q "[0-9]"; then
        log "PostgreSQL restore completed successfully"
    else
        error "PostgreSQL restore verification failed"
    fi

    unset PGPASSWORD
}

#-------------------------------------------------------------------------------
# MinIO Restore
#-------------------------------------------------------------------------------
restore_minio() {
    local backup_file="${1:-}"

    if [ -z "$backup_file" ]; then
        backup_file="${BACKUP_DIR}/minio_latest.tar.gz"
    fi

    if [ ! -f "$backup_file" ]; then
        error "Backup file not found: $backup_file"
    fi

    log "=== Starting MinIO Restore ==="
    log "Backup file: $backup_file"

    log "Verifying backup integrity..."
    if ! tar -tzf "$backup_file" > /dev/null 2>&1; then
        error "Backup file is corrupted: $backup_file"
    fi

    local restore_dir="/tmp/minio_restore_$$"
    mkdir -p "$restore_dir"

    log "Extracting backup..."
    tar -xzf "$backup_file" -C "$restore_dir"

    local extracted_dir=$(find "$restore_dir" -mindepth 1 -maxdepth 1 -type d | head -n 1)

    log "Restoring MinIO buckets..."

    if [ -d "${extracted_dir}/courses" ]; then
        log "Restoring courses bucket..."
        mc mirror "${extracted_dir}/courses" "${MINIO_ALIAS}/courses" 2>> "$LOG_FILE" || log "Warning: Failed to restore courses bucket"
    fi

    if [ -d "${extracted_dir}/audio" ]; then
        log "Restoring audio bucket..."
        mc mirror "${extracted_dir}/audio" "${MINIO_ALIAS}/audio" 2>> "$LOG_FILE" || log "Warning: Failed to restore audio bucket"
    fi

    if [ -d "${extracted_dir}/recordings" ]; then
        log "Restoring recordings bucket..."
        mc mirror "${extracted_dir}/recordings" "${MINIO_ALIAS}/recordings" 2>> "$LOG_FILE" || log "Warning: Failed to restore recordings bucket"
    fi

    rm -rf "$restore_dir"

    log "MinIO restore completed successfully"
}

#-------------------------------------------------------------------------------
# Health Check
#-------------------------------------------------------------------------------
health_check() {
    log "=== Running Health Check ==="

    log "Checking PostgreSQL..."
    if pg_isready -h "$POSTGRES_HOST" -U "$POSTGRES_USER" > /dev/null 2>&1; then
        log "PostgreSQL: OK"
    else
        log "PostgreSQL: FAILED"
    fi

    log "Checking MinIO..."
    if mc alias list "$MINIO_ALIAS" > /dev/null 2>&1; then
        log "MinIO: OK"
        mc ls "$MINIO_ALIAS/" 2>> "$LOG_FILE" || true
    else
        log "MinIO: FAILED"
    fi

    log "Health check completed"
}

#-------------------------------------------------------------------------------
# Usage
#-------------------------------------------------------------------------------
usage() {
    cat << 'USAGE_EOF'
Usage: restore.sh [postgres|minio|all] [backup_file]

Restore Quran Academy from backups.

Commands:
  postgres [file]  Restore PostgreSQL database
  minio [file]     Restore MinIO files
  all [file]       Restore both PostgreSQL and MinIO
  (no args)        Show this help

Environment Variables:
  BACKUP_DIR       Backup directory (default: /backups)
  LOG_FILE         Log file path (default: /var/log/quran-academy/restore.log)
  POSTGRES_HOST    PostgreSQL host (default: postgres)
  POSTGRES_DB      PostgreSQL database name (default: quran_academy)
  POSTGRES_USER    PostgreSQL user (default: quran_admin)
  POSTGRES_PASSWORD PostgreSQL password (required)
  MINIO_ALIAS      MinIO alias (default: myminio)

Examples:
  sudo ./restore.sh postgres /backups/postgres_latest.sql.gz
  sudo ./restore.sh minio /backups/minio_latest.tar.gz
  sudo ./restore.sh all

IMPORTANT:
  - Run as root or with sudo
  - Set POSTGRES_PASSWORD environment variable
  - Ensure MinIO is running before restoring
  - Backup current state before restoring
USAGE_EOF
}

#-------------------------------------------------------------------------------
# Main
#-------------------------------------------------------------------------------
main() {
    local restore_type="${1:-}"
    local backup_file="${2:-}"

    check_prerequisites

    mkdir -p "$(dirname "$LOG_FILE")"

    log "=== Restore job started ==="
    log "Type: ${restore_type:-all}"
    log "Backup file: ${backup_file:-default}"

    case "$restore_type" in
        postgres)
            restore_postgres "$backup_file"
            ;;
        minio)
            restore_minio "$backup_file"
            ;;
        all|"")
            restore_postgres "$backup_file"
            restore_minio "$backup_file"
            ;;
        *)
            usage
            exit 1
            ;;
    esac

    health_check

    log "=== Restore job completed ==="
}

main "$@"
