#!/usr/bin/env bash
# FCIA Academy — importação dos CSVs no Supabase próprio.
# Uso:
#   ./scripts/migration/import-data.sh catalog "postgresql://..."
#   ./scripts/migration/import-data.sh user    "postgresql://..."
#
# IMPORTANTE (grupo "user"): rode antes toggle-triggers.sql em modo disable
# no banco de DESTINO e reative depois. Sem isso, a carga de module_progress
# e certificates dispara XP duplicado e reemite certificados.
set -euo pipefail

GROUP="${1:-}"
TARGET_DB_URL="${2:-}"
IN_DIR="${IN_DIR:-/mnt/documents/fcia-migration}"

if [[ -z "$GROUP" || -z "$TARGET_DB_URL" ]]; then
  echo "Uso: $0 <catalog|user|all> <TARGET_DB_URL>" >&2
  exit 1
fi

CATALOG_TABLES=(
  plans
  achievements
  certificate_settings
  tracks
  courses
  modules
  questions
  course_bonuses
)

USER_TABLES=(
  profiles
  user_roles
  subscriptions
  enrollments
  module_progress
  quiz_attempts
  certificates
  xp_log
  user_achievements
  bonus_downloads
  gateway_events
)

case "$GROUP" in
  catalog) TABLES=("${CATALOG_TABLES[@]}") ;;
  user)    TABLES=("${USER_TABLES[@]}") ;;
  all)     TABLES=("${CATALOG_TABLES[@]}" "${USER_TABLES[@]}") ;;
  *) echo "Grupo inválido: $GROUP" >&2; exit 1 ;;
esac

for table in "${TABLES[@]}"; do
  file="${IN_DIR}/${table}.csv"
  if [[ ! -f "$file" ]]; then
    echo "!! CSV ausente para ${table}, pulando" >&2
    continue
  fi
  echo "-> importando public.${table}"
  psql "$TARGET_DB_URL" -v ON_ERROR_STOP=1 \
    -c "\\COPY public.${table} FROM '${file}' WITH CSV HEADER"
done

echo
echo "Importação do grupo '${GROUP}' concluída."
echo "Rode scripts/migration/verify-counts.sql nos dois bancos e compare."
