# Database Scripts

Organização dos scripts SQL do projeto Flight Log Opus.

## 📁 Estrutura de Diretórios

### 🗂️ `core/`
Scripts principais de criação de tabelas e estrutura básica do banco de dados.

**Arquivos:**
- `01_recreate_profiles_table.sql` - Tabela de perfis de usuários
- `02_recreate_flights_table.sql` - Tabela de voos
- `03_recreate_expense_categories_table.sql` - Categorias de despesas
- `04_recreate_revenue_categories_table.sql` - Categorias de receitas
- `05_recreate_flight_statuses_table.sql` - Status de voos
- `06_recreate_custom_aircraft_table.sql` - Aeronaves personalizadas
- `07_recreate_goals_table.sql` - Metas e objetivos
- `10_analise_diferencas.sql` - Análise de diferenças entre scripts
- `12_database_init_completo.sql` - Script completo de inicialização
- `13_recreate_financial_transactions_table.sql` - Transações financeiras
- `create_manual_airports_table.sql` - Tabela de aeroportos manuais
- `create_purchases_table.sql` - Tabela de compras
- `database_init.sql` - Script original de inicialização

**Ordem de execução recomendada:**
1. `01_recreate_profiles_table.sql`
2. `02_recreate_flights_table.sql`
3. `03_recreate_expense_categories_table.sql`
4. `04_recreate_revenue_categories_table.sql`
5. `05_recreate_flight_statuses_table.sql`
6. `06_recreate_custom_aircraft_table.sql`
7. `07_recreate_goals_table.sql`
8. `13_recreate_financial_transactions_table.sql`
9. Scripts de `views/`
10. Scripts de `triggers/`

---

### 🔧 `migrations/`
Scripts de migração para adicionar colunas e modificar estrutura existente.

**Arquivos:**
- `add_achievements_column.sql` - Adiciona coluna de conquistas
- `add_baseline_columns_final.sql` - Adiciona colunas de baseline (versão final)
- `add_baseline_columns_simple.sql` - Adiciona colunas de baseline (versão simples)
- `add_initial_balance_field.sql` - Adiciona campo de saldo inicial
- `add_initial_fields_to_profiles.sql` - Adiciona campos iniciais ao perfil

---

### ⚙️ `triggers/`
Scripts de triggers para automação do banco de dados.

**Arquivos:**
- `create_profile_trigger.sql` - Trigger para criar perfil automaticamente
- `create_flight_profile_sync_trigger.sql` - Trigger para sincronizar voos com perfil
- `corrected_flight_profile_solution.sql` - Solução corrigida de sincronização
- `final_flight_profile_sync_solution.sql` - Solução final de sincronização
- `update_flight_profile_sync_trigger_fixed.sql` - Trigger corrigido v1
- `update_flight_profile_sync_trigger_fixed_v2.sql` - Trigger corrigido v2

---

### 👁️ `views/`
Scripts de criação de views e funções RPC.

**Arquivos:**
- `08_recreate_financial_views_and_functions.sql` - Views financeiras e funções
- `11_complementar_user_settings_e_funcoes.sql` - User settings e funções complementares

---

### 🧪 `tests/`
Scripts de teste para verificar funcionamento do banco de dados.

**Arquivos:**
- `09_test_all_tables.sql` - Teste de todas as tabelas
- `test_baseline_solution.sql` - Teste da solução de baseline
- `test_corrected_solution.sql` - Teste da solução corrigida
- `test_trigger_functionality.sql` - Teste de funcionalidade dos triggers

---

### 🔨 `fixes/`
Scripts de correção de problemas específicos do banco de dados.

**Arquivos:**
- `fix_all_database_issues.sql` - Corrige todos os problemas do banco
- `fix_baseline_persistence.sql` - Corrige persistência do baseline
- `fix_category_icons.sql` - Corrige ícones das categorias
- `fix_existing_profiles.sql` - Corrige perfis existentes
- `fix_expense_categories.sql` - Corrige categorias de despesa
- `fix_financial_transactions_constraints.sql` - Corrige constraints de transações
- `update_flight_statuses_simple.sql` - Atualiza status de voo (versão simples)
- `update_profiles_schema_for_minutes.sql` - Atualiza schema para minutos
- `safe_database_migration.sql` - Migração segura do banco

---

### 🛠️ `maintenance/`
Scripts relacionados ao sistema de manutenção de aeronaves.

**Arquivos:**
- `create_maintenance_tables.sql` - Cria tabelas de manutenção
- `add_new_maintenance_items.sql` - Adiciona itens de manutenção
- `insert_remaining_maintenance_items.sql` - Insere itens restantes
- `debug_maintenance_query.sql` - Debug de queries de manutenção

---

### 📦 `storage/`
Scripts de configuração do storage do Supabase.

**Arquivos:**
- `create_storage_bucket.sql` - Cria bucket de storage
- `create_storage_bucket_safe.sql` - Cria bucket de storage (versão segura)

---

### ✈️ `msfs/`
Scripts relacionados à integração com Microsoft Flight Simulator.

**Arquivos:**
- `create_msfs_tables.sql` - Cria tabelas do MSFS
- `flight_tracking_schema.sql` - Schema de tracking de voo
- `fix_msfs_flight_stats_function.sql` - Corrige função de estatísticas MSFS

---

### 🔍 `debug/`
Scripts de diagnóstico e verificação.

**Arquivos:**
- `check_baseline_columns.sql` - Verifica colunas de baseline
- `check_profile_flight_counts.sql` - Verifica contagem de voos
- `corrigir_display_name.sql` - Corrige display name
- `corrigir_emails.sql` - Corrige emails
- `debug_profile_state.sql` - Debug de estado do perfil
- `debug_triggers.sql` - Debug de triggers
- `verificar_emails.sql` - Verifica emails
- `verificar_perfis.sql` - Verifica perfis
- `verify_current_triggers.sql` - Verifica triggers atuais

---

## 🚀 Como Usar

### Instalação Inicial Completa

Para uma instalação completa do banco de dados, execute na ordem:

```bash
# 1. Scripts principais de tabelas
cd core
psql -U postgres -d flight_log_opus -f 01_recreate_profiles_table.sql
psql -U postgres -d flight_log_opus -f 02_recreate_flights_table.sql
# ... continue com os demais scripts em ordem numérica

# 2. Views e funções
cd ../views
psql -U postgres -d flight_log_opus -f 08_recreate_financial_views_and_functions.sql
psql -U postgres -d flight_log_opus -f 11_complementar_user_settings_e_funcoes.sql

# 3. Triggers
cd ../triggers
psql -U postgres -d flight_log_opus -f create_profile_trigger.sql
psql -U postgres -d flight_log_opus -f final_flight_profile_sync_solution.sql
```

### Script de Inicialização Completa

Alternativamente, use o script completo:

```bash
cd core
psql -U postgres -d flight_log_opus -f 12_database_init_completo.sql
```

### Migrações

Para adicionar novas colunas ou funcionalidades:

```bash
cd migrations
psql -U postgres -d flight_log_opus -f add_baseline_columns_final.sql
```

### Correções

Para corrigir problemas específicos:

```bash
cd fixes
psql -U postgres -d flight_log_opus -f fix_all_database_issues.sql
```

### Testes

Para verificar se tudo está funcionando:

```bash
cd tests
psql -U postgres -d flight_log_opus -f 09_test_all_tables.sql
```

---

## 📝 Convenções de Nomenclatura

- **`recreate_`** - Scripts que recriam tabelas do zero
- **`add_`** - Scripts que adicionam novas colunas/funcionalidades
- **`fix_`** - Scripts que corrigem problemas existentes
- **`update_`** - Scripts que atualizam estruturas existentes
- **`create_`** - Scripts que criam novos objetos
- **`check_`** / `verificar_`** - Scripts de verificação/diagnóstico
- **`test_`** - Scripts de teste
- **`debug_`** - Scripts de debug

---

## ⚠️ Notas Importantes

1. **Ordem de Execução**: Os scripts numerados (01, 02, etc.) devem ser executados em ordem
2. **Backups**: Sempre faça backup antes de executar scripts de migração ou correção
3. **Testes**: Execute os scripts de teste após qualquer modificação
4. **Triggers**: Alguns triggers dependem de outros, verifique as dependências
5. **RLS**: A maioria das tabelas usa Row Level Security, verifique as políticas

---

## 📚 Documentação Adicional

- [Documentação do Projeto](../docs/README.md)
- [Guia de Setup do Supabase](../docs/guides/SUPABASE_SETUP_GUIDE.md)
- [API do Sistema Financeiro](../docs/api/FINANCIAL_SYSTEM_API.md)

---

## 🔗 Links Úteis

- [Supabase SQL Editor](https://supabase.com/dashboard)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [PL/pgSQL Language](https://www.postgresql.org/docs/current/plpgsql.html)
