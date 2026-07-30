#!/usr/bin/env bash
# FCIA Academy — exportação de dados do backend atual para CSV.
# Uso:
#   ./scripts/migration/export-data.sh catalog
#   ./scripts/migration/export-data.sh user
#   ./scripts/migration/export-data.sh all
#
# Requer as variáveis PG* já apontando para o banco de ORIGEM.
# Não faz dump completo: exporta tabela a tabela, em ordem de FK.
set -euo pipefail

GROUP="${1:-all}"
OUT_DIR="${OUT_DIR:-/mnt/documents/fcia-migration}"

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
  *) echo "Grupo inválido: $GROUP (use catalog | user | all)" >&2; exit 1 ;;
esac

mkdir -p "$OUT_DIR"

for table in "${TABLES[@]}"; do
  echo "-> exportando public.${table}"
  psql -v ON_ERROR_STOP=1 \
    -c "COPY (SELECT * FROM public.${table}) TO STDOUT WITH CSV HEADER" \
    > "${OUT_DIR}/${table}.csv"
done

echo
echo "Arquivos gerados em ${OUT_DIR}:"
wc -l "${OUT_DIR}"/*.csv
