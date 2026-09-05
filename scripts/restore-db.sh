#!/usr/bin/env sh
set -eu

backup="${1:?usage: $0 BACKUP_FILE [TARGET_DB]}"
target="${2:-./data/blog.db}"
[ -f "$backup" ] || { printf 'Backup not found: %s\n' "$backup" >&2; exit 1; }
command -v sqlite3 >/dev/null 2>&1 || { printf 'sqlite3 is required\n' >&2; exit 1; }
mkdir -p "$(dirname "$target")"
if [ -e "$target" ]; then
  printf 'Refusing to overwrite existing database: %s\n' "$target" >&2
  exit 1
fi
sqlite3 "$backup" "PRAGMA integrity_check;" | grep -qx 'ok' || { printf 'Backup failed integrity check\n' >&2; exit 1; }
cp "$backup" "$target"
printf 'Restored %s to %s\n' "$backup" "$target"
