#!/usr/bin/env bash
# ============================================
# MIGRAÇÃO COMPLETA Supabase → PostgreSQL local
# ============================================
# Executa 01 (export) + 02 (restore) com o SUPABASE_DB_URL passado.
# Uso:
#   SUPABASE_DB_URL='postgresql://postgres.<ref>:<SENHA>@aws-0-<regiao>.pooler.supabase.com:5432/postgres' \
#     bash migrate_all.sh
set -euo pipefail
cd "$(dirname "$0")"

: "${SUPABASE_DB_URL:?precisa de SUPABASE_DB_URL}"

echo "==================================="
echo "  1/2 — EXPORT (Supabase)"
echo "==================================="
export SUPABASE_DB_URL
bash 01_export_from_supabase.sh

echo
echo "==================================="
echo "  2/2 — RESTORE (PostgreSQL local)"
echo "==================================="
bash 02_restore_to_postgres.sh supabase_full.dump
