#!/usr/bin/env bash
# FCIA Academy — detecta divergência entre o schema em runtime e as migrações
# versionadas em supabase/migrations/.
#
# Uso:
#   ./scripts/migration/check-schema-drift.sh                 # usa PG* do ambiente
#   ./scripts/migration/check-schema-drift.sh "postgresql://..."
#
# Saída: tabelas que existem só no banco (schema não versionado) ou só nas
# migrações (migração não aplicada). Silêncio = sem drift.
set -euo pipefail

DB_URL="${1:-}"
MIGRATIONS_DIR="supabase/migrations"
TMP_DIR="$(mktemp -d)"
trap 'rm -rf "$TMP_DIR"' EXIT

if [[ ! -d "$MIGRATIONS_DIR" ]]; then
  echo "Rode a partir da raiz do repositório (não achei ${MIGRATIONS_DIR})." >&2
  exit 1
fi

# Tabelas declaradas nas migrações versionadas.
grep -rhoiE 'create table (if not exists )?(public\.)?[a-z0-9_]+' "$MIGRATIONS_DIR" \
  | sed -E 's/.*[[:space:]](public\.)?//' \
  | tr 'A-Z' 'a-z' \
  | sort -u > "$TMP_DIR/repo.txt"

# Tabelas existentes no banco.
if [[ -n "$DB_URL" ]]; then
  psql "$DB_URL" -At -v ON_ERROR_STOP=1 \
    -c "SELECT tablename FROM pg_tables WHERE schemaname='public' ORDER BY 1" \
    > "$TMP_DIR/db.txt"
else
  psql -At -v ON_ERROR_STOP=1 \
    -c "SELECT tablename FROM pg_tables WHERE schemaname='public' ORDER BY 1" \
    > "$TMP_DIR/db.txt"
fi

status=0

echo "== No banco, ausentes nas migrações (schema NÃO versionado) =="
if comm -13 "$TMP_DIR/repo.txt" "$TMP_DIR/db.txt" | grep . ; then
  status=1
else
  echo "(nenhuma)"
fi

echo
echo "== Nas migrações, ausentes no banco (migração NÃO aplicada) =="
if comm -23 "$TMP_DIR/repo.txt" "$TMP_DIR/db.txt" | grep . ; then
  status=1
else
  echo "(nenhuma)"
fi

echo
if [[ "$status" -eq 0 ]]; then
  echo "OK — sem drift de tabelas."
else
  echo "DRIFT detectado. Gere uma migração de convergência antes de seguir."
fi
exit "$status"
