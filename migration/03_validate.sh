#!/usr/bin/env bash
# ============================================
# 03 — VALIDAÇÃO da migração
# ============================================
set -uo pipefail
cd "$(dirname "$0")"
export PGPORT="${PGPORT:-5433}"
DB="flight_log_opus"
PSQL="sudo -u postgres psql -d ${DB} -X -qtAc"

echo "==> tabelas e contagens (public)"
for t in profiles flights goals financial_transactions expense_categories revenue_categories \
         flight_statuses custom_aircraft user_settings purchases manual_airports msfs_flights \
         flight_sessions maintenance_records; do
  N=$($PSQL "SELECT count(*) FROM public.${t};" 2>/dev/null || echo '?')
  printf '  %-24s %s\n' "${t}" "${N}"
done

echo "==> auth (GoTrue)"
USERS=$($PSQL "SELECT count(*) FROM auth.users;" 2>/dev/null || echo '?')
SESS=$($PSQL "SELECT count(*) FROM auth.sessions;" 2>/dev/null || echo '?')
REFRESH=$($PSQL "SELECT count(*) FROM auth.refresh_tokens;" 2>/dev/null || echo '?')
printf '  users %s | sessions %s | refresh_tokens %s\n' "$USERS" "$SESS" "$REFRESH"

echo "==> perfis × usuários (devem saltar iguais)"
$PSQL "SELECT (SELECT count(*) FROM public.profiles) AS profiles, (SELECT count(*) FROM auth.users) AS users;"

echo "==> RLS ativos (espera 't' nas isoladas)"
$PSQL "SELECT string_agg(t.tablename, ', ') FROM pg_tables t WHERE t.schemaname='public' AND NOT t.rowsecurity;" | sed 's/^/  SEM RLS: /'

echo "==> funções críticas:"
$PSQL "SELECT p.proname || '(' || pg_get_function_identity_arguments(p.oid) || ') -> ' || left(pg_get_function_result(p.oid), 20)
         FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
        WHERE n.nspname='public'
          AND p.proname IN ('get_msfs_flight_stats','get_msfs_popular_routes','update_career_data',
                            'increment_profile_stats','handle_new_user','exec_sql','refresh_report_views')
        ORDER BY 1;" | sed 's/^/  /'

echo "✅ validação concluída"
