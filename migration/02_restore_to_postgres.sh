#!/usr/bin/env bash
# ============================================
# 02 — RESTAURA dumps do Supabase no PostgreSQL local (v4 — dump separado)
# ============================================
#  1. SNAPSHOT local (linhas do usuário fresh e dados atuais)
#  2. DROP public/auth CASCADE (pg_restore não faz CASCADE em --clean)
#  3. Reextensões + funções auth.* (18) — políticas RLS de public dependem
#  4. Restore public (tabelas/RLS/funções/views + dados)
#  5. Restore auth (users/sessions/refresh/identities + dados)
#  6. Reinsert snapshot com --disable-triggers (sem handle_new_user duplicar)
#  7. Normalização (grants/RLS/alias) + ANALYZE + validação
set -uo pipefail
cd "$(dirname "$0")"

DUMP_PUBLIC="${1:-supabase_public.dump}"
DUMP_AUTH="${2:-supabase_auth.dump}"
export PGPORT="${PGPORT:-5433}"
DB="flight_log_opus"
LOG="restore_detalhado.log"

PG_RESTORE=$(ls /usr/lib/postgresql/*/bin/pg_restore 2>/dev/null | sort -V | tail -1)
[ -x "$PG_RESTORE" ] || PG_RESTORE=$(command -v pg_restore)
PG_DUMP16=$(ls /usr/lib/postgresql/16/bin/pg_dump 2>/dev/null | sort -V | tail -1)
[ -x "$PG_DUMP16" ] || PG_DUMP16=$(command -v pg_dump)
PSQL="sudo -u postgres psql -U postgres -p ${PGPORT} -X -q -v ON_ERROR_STOP=0"

[ -f "$DUMP_PUBLIC" ] || { echo "ERRO: dump public ausente: $DUMP_PUBLIC"; exit 1; }
[ -f "$DUMP_AUTH" ]   || { echo "ERRO: dump auth ausente: $DUMP_AUTH";   exit 1; }
echo "==> ferramentas: $PG_RESTORE | $PG_DUMP16"

echo "==> roles + senha do role de conexão (idempotente)"
$PSQL -d postgres -f bootstrap/10_roles.sql > /dev/null 2>&1
CONN_PASSWORD=$(cat .db_credentials)
$PSQL -d postgres -c "ALTER ROLE flightlog_conn WITH LOGIN PASSWORD '${CONN_PASSWORD}';" > /dev/null

if ! $PSQL -X -qtAc "SELECT 1 FROM pg_database WHERE datname='${DB}'" | grep -q 1; then
  $PSQL -d postgres -c "CREATE DATABASE ${DB} OWNER flightlog_app;" > /dev/null
fi

echo "==> 1. SNAPSHOT das linhas locais atuais (dominance preserve)"
sudo -u postgres env PGPORT=${PGPORT} "$PG_DUMP16" \
  --host=/var/run/postgresql -U postgres -p ${PGPORT} \
  --db="${DB}" --format=custom --data-only --no-owner --no-privileges \
  --table='auth.users' \
  --table='auth.sessions' \
  --table='auth.refresh_tokens' \
  --table='auth.identities' \
  --table='public.profiles' \
  --table='public.user_settings' \
  --table='public.expense_categories' \
  --table='public.revenue_categories' \
  --table='public.flight_statuses' \
  --table='public.flights' \
  --table='public.goals' \
  --table='public.financial_transactions' \
  --table='public.custom_aircraft' \
  --table='public.purchases' \
  --table='public.manual_airports' \
  --table='public.msfs_flights' \
  > local_keep.dump
echo "   local_keep.dump: $(du -h local_keep.dump | cut -f1)"

echo "==> 2. DROP public + auth (CASCADE) e re-extensions (no schema extensions, layout Supabase)"
$PSQL -d "$DB" <<'EOSQL' 2>/dev/null
DROP SCHEMA IF EXISTS public CASCADE;
DROP SCHEMA IF EXISTS auth CASCADE;
DROP EXTENSION IF EXISTS pgcrypto CASCADE;
DROP EXTENSION IF EXISTS "uuid-ossp" CASCADE;
DROP EXTENSION IF EXISTS pg_trgm CASCADE;
CREATE SCHEMA IF NOT EXISTS extensions;
CREATE EXTENSION "uuid-ossp" WITH SCHEMA extensions;
CREATE EXTENSION pgcrypto WITH SCHEMA extensions;
CREATE EXTENSION pg_trgm;
GRANT USAGE ON SCHEMA extensions TO anon, authenticated, service_role;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA extensions TO anon, authenticated, service_role;
EOSQL

echo "==> 3. Funções auth.* (policies RLS de public dependem)"
$PSQL -d "$DB" -f bootstrap/18_auth_functions.sql > /dev/null 2>&1

echo "==> 4. Restore PUBLIC (plain com sed no transaction_timeout)"
"$PG_RESTORE" --file=public_plain.sql "$DUMP_PUBLIC" 2>/dev/null
sed -i '/transaction_timeout/d' public_plain.sql
echo "   $(grep -c 'CREATE' public_plain.sql) CREATEs | $(grep -c '^COPY' public_plain.sql) COPYs"
$PSQL -d "$DB" -f public_plain.sql > "${LOG}.public" 2>&1
NERR=$(grep -c 'ERROR' "${LOG}.public" 2>/dev/null || true)
if [ "${NERR:-0}" != "0" ]; then
  echo "   ⚠️  public: $NERR erro(s) — ver ${LOG}.public:"
  grep 'ERROR' "${LOG}.public" | head -20
fi

echo "==> 5. Restore AUTH (types + tables + dados GoTrue)"
$PSQL -d "$DB" -f bootstrap/19_auth_types.sql > /dev/null 2>&1
"$PG_RESTORE" --file=auth_plain.sql "$DUMP_AUTH" 2>/dev/null
sed -i '/transaction_timeout/d' auth_plain.sql
$PSQL -d "$DB" -f auth_plain.sql > "${LOG}.auth" 2>&1
NERRA=$(grep -c 'ERROR' "${LOG}.auth" 2>/dev/null || true)
if [ "${NERRA:-0}" != "0" ]; then
  echo "   ⚠️  auth: $NERRA erro(s) — ver ${LOG}.auth:"
  grep 'ERROR' "${LOG}.auth" | head -20
fi

echo "==> 6. Reinsert snapshot local (--disable-triggers)"
sudo -u postgres env PGPORT=${PGPORT} "$PG_RESTORE" \
  --host=/var/run/postgresql -U postgres -p ${PGPORT} \
  --db="${DB}" --no-owner --no-privileges --data-only --disable-triggers \
  local_keep.dump > "${LOG}.local" 2>&1
NERRL=$(grep -c 'error:' "${LOG}.local" 2>/dev/null || true)
if [ "${NERRL:-0}" != "0" ]; then
  echo "   ⚠️  snapshot local: $NERRL erro(s) — ver ${LOG}.local:"
  grep 'error:' "${LOG}.local" | head -10
fi

echo "==> 7. Normalização: grants + RLS + alias + compat (idempotente)"
$PSQL -d "$DB" -f bootstrap/25_compat_functions.sql     > /dev/null 2>&1
$PSQL -d "$DB" -f bootstrap/30_permissions.sql          > /dev/null 2>&1
$PSQL -d "$DB" -f bootstrap/40_rls_compat.sql           > /dev/null 2>&1
$PSQL -d "$DB" -f bootstrap/50_post_restore_grants.sql  > /dev/null 2>&1

$PSQL -d postgres -c "GRANT anon TO flightlog_conn; GRANT authenticated TO flightlog_conn; GRANT service_role TO flightlog_conn; GRANT anon, authenticated, service_role TO flightlog_app;" > /dev/null 2>&1 || true
$PSQL -d "$DB" -c "GRANT CONNECT ON DATABASE ${DB} TO flightlog_conn, flightlog_app;" > /dev/null 2>&1
$PSQL -d "$DB" -c "REVOKE ALL ON DATABASE ${DB} FROM PUBLIC;" > /dev/null 2>&1

echo "==> ANALYZE"
$PSQL -d "$DB" -c "ANALYZE;" > /dev/null 2>&1

./03_validate.sh
echo
echo "⚠️  PRÓXIMOS PASSOS:"
echo "  1. pm2 restart flightlog-gateway   (recarrega introspecção de schema)"
echo "  2. secure shred -u ${DUMP_PUBLIC} ${DUMP_AUTH} local_keep.dump public_plain.sql auth_plain.sql"
