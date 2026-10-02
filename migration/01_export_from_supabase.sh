#!/usr/bin/env bash
# ============================================
# 01 — EXPORT DADOS DO SUPABASE MANAGED → dump local
# ============================================
# Requer: SUPABASE_DB_URL de acesso postalcodo direto (Session/Direct pooler):
#   postgresql://postgres.<ref>:<SENHA>@aws-0-<regiao>.pooler.supabase.com:5432/postgres
# Encontre em Dashboard Supabase → Settings → Database → Connection string (URI).
set -euo pipefail
: "${SUPABASE_DB_URL:?export SUPABASE_DB_URL='postgres://...' e rode novamente}"

# escolhe o pg_dump MAIS NOVO instalado (server pode ser >= cliente default)
PG_DUMP=$(ls /usr/lib/postgresql/*/bin/pg_dump 2>/dev/null | sort -V | tail -1)
[ -x "$PG_DUMP" ] || PG_DUMP=pg_dump
echo "==> pg_dump: $PG_DUMP ($($PG_DUMP --version | awk '{print $3}'))"

echo "==> testando conexão"
psql "$SUPABASE_DB_URL" -X -tAc "SELECT version();" | head -1 || {
  echo "ERRO: não conectou em SUPABASE_DB_URL"; exit 1;
}

echo "==> dumping schema public (tabelas + RLS + funções + views + dados)"
# --no-privileges: grants serão refeitos no destino (ver bootstrap/50_post_restore_grants.sql)
# NOTA: dump SEPARADO por schema — a combinação --schema+--table em pg_dump
# filtra a tabela de forma absoluto (mata o schema público inteiro).
"$PG_DUMP" "$SUPABASE_DB_URL" \
  --format=custom \
  --no-owner --no-privileges \
  --schema=public \
  --file "${DEST_PUBLIC:-supabase_public.dump}"

echo "==> dumping auth.users/sessions/refresh_tokens/identities/oauth_clients (GoTrue)"
"$PG_DUMP" "$SUPABASE_DB_URL" \
  --format=custom \
  --no-owner --no-privileges \
  --table='auth.users' \
  --table='auth.sessions' \
  --table='auth.refresh_tokens' \
  --table='auth.identities' \
  --table='auth.oauth_clients' \
  --file "${DEST_AUTH:-supabase_auth.dump}"

echo "==> resumo do dump:"
for d in "${DEST_PUBLIC:-supabase_public.dump}" "${DEST_AUTH:-supabase_auth.dump}"; do
  pg_restore -l "$d" | grep -cE 'TABLE DATA' | xargs echo "  ($d) tabelas com dados:"
done
echo "✅ dumps escritos"
