#!/bin/sh
set -e

BACKUP_DIR="/backups"
KEEP_DAYS="${BACKUP_KEEP_DAYS:-14}"
STAMP=$(date -u +%Y%m%d-%H%M%S)
OUT="$BACKUP_DIR/procheeck-$STAMP.sql.gz"

mkdir -p "$BACKUP_DIR"

echo "[$(date -u +%FT%TZ)] backup: dumping $PGDATABASE to $OUT"
pg_dump --no-owner --no-privileges "$PGDATABASE" | gzip -9 > "$OUT"
echo "[$(date -u +%FT%TZ)] backup: done ($(stat -c%s "$OUT") bytes)"

echo "[$(date -u +%FT%TZ)] backup: pruning older than $KEEP_DAYS days"
find "$BACKUP_DIR" -name 'procheeck-*.sql.gz' -type f -mtime "+$KEEP_DAYS" -print -delete || true
