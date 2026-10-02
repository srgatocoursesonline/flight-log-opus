#!/usr/bin/env bash
# ============================================
# 02 — RESTAURA dump do Supabase no PostgreSQL local
# ============================================
# Preserva: schema auth (funções/compat), schema storage, aliases e funções
# de compat; substitui: tabelas/function/views/triggers de public + users.
set -euo pipefail
cd "$(dirname "$0")"

DUMP="${1:-supabase_full.dump}"
: "${DUMP:?passe o arquivo .dump gerado pelo 01_export}"

export PGPORT="${PGPORT:-5433}"
DB="flight_log_opus"
PSQL="sudo -u postgres psql -X -q -v ON_ERROR_STOP=0"

[ -f "$DUMP" ] || { echo "ERRO: dump não encontrado: $DUMP"; exit 1; }

echo "==> roles/refusals (idempotente)"
$PSQL -d postgres -f bootstrap/10_roles.sql > /dev/null 2>&1 || true
CONN_PASSWORD=$(cat .db_credentials)
$PSQL -d postgres -c "ALTER ROLE flightlog_conn WITH LOGIN PASSWORD '${CONN_PASSWORD}';" > /dev/null

echo "==> banco presente"
if ! $PSQL -X -qtAc "SELECT 1 FROM pg_database WHERE datname='${DB}'" | grep -q 1; then
  $PSQL -d postgres -c "CREATE DATABASE ${DB} OWNER flightlog_app;" > /dev/null
fi
$PSQL -d "$DB" -c "CREATE EXTENSION IF NOT EXISTS pgcrypto; CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\"; CREATE EXTENSION IF NOT EXISTS pg_trgm;" > /dev/null 2>&1 || true

echo "==> restore (public + auth users/sessions/refresh/identities)"
# --no-privileges: grants locais vêm do bootstrap 30; --clean/--if-exists
# substitui objetos que existirem (ex.: versões de funções compat).
sudo -u postgres pg_restore \
  --db="${DB}" \
  --jobs=2 \
  --no-owner --no-privileges \
  --clean --if-exists \
  "$DUMP" 2>&1 | grep -vE 'NOTICE|pg_restore: processing|pg_restore: creating|pg_restore: reading|pg_restore: linking' | grep -E 'ERROR|WARNING' | head -40 || true

echo "==> normalização: grants + RLS + alias (idempotente)"
$PSQL -d "$DB" -f bootstrap/25_compat_functions.sql > /dev/null 2>&1 || true
$PSQL -d "$DB" -f bootstrap/30_permissions.sql     > /dev/null 2>&1 || true
$PSQL -d "$DB" -f bootstrap/40_rls_compat.sql      > /dev/null 2>&1 || true

$PSQL -d postgres -c "GRANT anon TO flightlog_conn; GRANT authenticated TO flightlog_conn; GRANT service_role TO flightlog_conn; GRANT anon, authenticated, service_role TO flightlog_app;" > /dev/null 2>&1 || {
  # roles já são membros no setup inicial
  true
}
$PSQL -d "$DB" -c "GRANT CONNECT ON DATABASE ${DB} TO flightlog_conn, flightlog_app;" > /dev/null
$PSQL -d "$DB" -c "REVOKE ALL ON DATABASE ${DB} FROM PUBLIC;" > /dev/null

echo "==> ANALYZE"
$PSQL -d "$DB" -c "ANALYZE;" > /dev/null

./03_validate.sh || true
echo "✅ restore concluído. Veja a validação acima."
echo
echo "⚠️  IMPORTANTES PRÓXIMOS PASSOS:"
echo "  1. Reinicie o gateway para recarregar o cache de schema:"
echo "     pm2 restart flightlog-gateway"
echo "  2. Apague o dump quando terminar (contém todos os dados):"
echo "     shred -u ${DUMP}  (ou rm -f ${DUMP})"
