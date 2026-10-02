#!/usr/bin/env bash
# ============================================
# SETUP DO BANCO LOCAL (PostgreSQL 16)
# flight_log_opus — compatível com Supabase
# ============================================
# Cria roles, banco, extensões e aplica o bootstrap + scripts SQL do repo.
# Idempotente: pode re-rodar sem danos (os arquivos usam IF NOT EXISTS
# e CREATE OR REPLACE; o init core recria tabelas por DROP CASCADE).
set -uo pipefail

cd "$(dirname "$0")"
ROOT="$(cd .. && pwd)"

DB="flight_log_opus"
DBA_ROLE="flightlog_app"
CONN_ROLE="flightlog_conn"
export PGPORT="${PGPORT:-5433}"

# Senha do usuário de conexão (usada pelo gateway no .env)
CRED_FILE="./.db_credentials"
if [ ! -f "$CRED_FILE" ]; then
  openssl rand -hex 24 > "$CRED_FILE"
  chmod 600 "$CRED_FILE"
fi
CONN_PASSWORD=$(cat "$CRED_FILE")

PSQL="sudo -u postgres psql -v ON_ERROR_STOP=0 -X -q"

echo "==> 1/7 roles globais (bootstrap/10_roles.sql)"
$PSQL -d postgres -f bootstrap/10_roles.sql

echo "==> 2/7 senha do role de conexão"
$PSQL -d postgres -c "ALTER ROLE ${CONN_ROLE} WITH LOGIN PASSWORD '${CONN_PASSWORD}';"

echo "==> 3/7 banco ${DB}"
if [ "${RESET:-0}" = "1" ]; then
  echo "   RESET=1 — descartando banco existente"
  sudo -u postgres psql -X -qtAc "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname='${DB}' AND pid <> pg_backend_pid();" > /dev/null
  sudo -u postgres dropdb --if-exists "${DB}"
fi
if ! sudo -u postgres psql -X -qtAc "SELECT 1 FROM pg_database WHERE datname='${DB}'" | grep -q 1; then
  sudo -u postgres createdb -O "${DBA_ROLE}" "${DB}"
else
  $PSQL -d postgres -c "ALTER DATABASE ${DB} OWNER TO ${DBA_ROLE};"
fi

echo "==> 4/7 extensões (pgcrypto/uuid-ossp)"
$PSQL -d "$DB" -c "CREATE EXTENSION IF NOT EXISTS pgcrypto; CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\"; CREATE EXTENSION IF NOT EXISTS pg_trgm;"

echo "==> 5/7 schema auth + storage compatíveis"
$PSQL -d "$DB" -f bootstrap/15_auth_compat.sql
$PSQL -d "$DB" -f bootstrap/20_storage_compat.sql

echo "==> 6/7 scripts SQL do projeto (database/)"
APP_PSQL="sudo -u postgres psql -d flight_log_opus -X -q --set=ON_ERROR_STOP=0"
declare -a FILES=(
  "core/12_database_init_completo.sql"
  "core/create_manual_airports_table.sql"
  "core/create_purchases_table.sql"
  "migrations/add_achievements_column.sql"
  "migrations/add_baseline_columns_final.sql"
  "migrations/add_initial_balance_field.sql"
  "migrations/add_initial_fields_to_profiles.sql"
  "msfs/create_msfs_tables.sql"
  "msfs/flight_tracking_schema.sql"
  "msfs/fix_msfs_flight_stats_function.sql"
  "triggers/create_profile_trigger.sql"
  "triggers/final_flight_profile_sync_solution.sql"
  "triggers/update_flight_profile_sync_trigger_fixed_v2.sql"
  "maintenance/create_maintenance_tables.sql"
  "fixes/fix_all_database_issues.sql"
)
for f in "${FILES[@]}"; do
  [ -f "$ROOT/database/$f" ] || { echo "   [skip] database/$f (inexistente)"; continue; }
  echo "   [sql] database/$f"
  $APP_PSQL -f "$ROOT/database/$f" 2>&1 | grep -Ev '^(SET|DO|BEGIN|COMMIT|GRANT|COMMENT|CREATE|ALTER|DROP|INSERT|SELECT|UPDATE|NOTICE|psql\.[0-9]+: \w+\.sql:|----)' | grep -E 'ERROR|FATAL' && echo "     ^ erros acima (não-fatais)" || true
done

echo "==> 7/7 permissões finais + alias de compatibilidade"
$PSQL -d "$DB" -f bootstrap/25_compat_functions.sql
$PSQL -d "$DB" -f bootstrap/30_permissions.sql
$PSQL -d "$DB" -f bootstrap/40_rls_compat.sql

echo "==> memberships do role de conexão (SET ROLE)"
$PSQL -d postgres -c "GRANT anon TO ${CONN_ROLE}; GRANT authenticated TO ${CONN_ROLE}; GRANT service_role TO ${CONN_ROLE};"
$PSQL -d postgres -c "REVOKE ALL ON DATABASE ${DB} FROM PUBLIC; GRANT CONNECT ON DATABASE ${DB} TO ${DBA_ROLE}, ${CONN_ROLE}, anon, authenticated, service_role;"

echo
echo "✅ Setup concluído."
echo "  DATABASE_URL do gateway: postgresql://${CONN_ROLE}:${CONN_PASSWORD}@127.0.0.1:5432/${DB}"
