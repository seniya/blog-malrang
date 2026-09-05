#!/usr/bin/env sh
set -eu

source_db="${1:-./data/blog.db}"
backup_dir="${2:-./backups}"
timestamp="$(date -u +%Y%m%dT%H%M%SZ)"
mkdir -p "$backup_dir"
[ -f "$source_db" ] || { printf 'Database not found: %s\n' "$source_db" >&2; exit 1; }
command -v sqlite3 >/dev/null 2>&1 || { printf 'sqlite3 is required\n' >&2; exit 1; }
out="$backup_dir/blog-$timestamp.db"
sqlite3 "$source_db" ".backup '$out'"
printf 'Created %s\n' "$out"
