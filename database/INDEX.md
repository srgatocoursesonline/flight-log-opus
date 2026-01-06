# Database Scripts Index

Índice rápido de todos os scripts SQL organizados por categoria.

## 📂 Por Categoria

### [🗂️ Core](core/) - Tabelas Principais
| Arquivo | Descrição | Prioridade |
|---------|-----------|-----------|
| [`01_recreate_profiles_table.sql`](core/01_recreate_profiles_table.sql) | Tabela de perfis de usuários | ⭐⭐⭐ |
| [`02_recreate_flights_table.sql`](core/02_recreate_flights_table.sql) | Tabela de voos | ⭐⭐⭐ |
| [`03_recreate_expense_categories_table.sql`](core/03_recreate_expense_categories_table.sql) | Categorias de despesas | ⭐⭐ |
| [`04_recreate_revenue_categories_table.sql`](core/04_recreate_revenue_categories_table.sql) | Categorias de receitas | ⭐⭐ |
| [`05_recreate_flight_statuses_table.sql`](core/05_recreate_flight_statuses_table.sql) | Status de voos | ⭐⭐ |
| [`06_recreate_custom_aircraft_table.sql`](core/06_recreate_custom_aircraft_table.sql) | Aeronaves personalizadas | ⭐ |
| [`07_recreate_goals_table.sql`](core/07_recreate_goals_table.sql) | Metas e objetivos | ⭐ |
| [`13_recreate_financial_transactions_table.sql`](core/13_recreate_financial_transactions_table.sql) | Transações financeiras | ⭐⭐⭐ |
| [`create_manual_airports_table.sql`](core/create_manual_airports_table.sql) | Aeroportos manuais | ⭐ |
| [`create_purchases_table.sql`](core/create_purchases_table.sql) | Tabela de compras | ⭐ |
| [`12_database_init_completo.sql`](core/12_database_init_completo.sql) | Script completo de inicialização | ⭐⭐⭐ |
| [`database_init.sql`](core/database_init.sql) | Script original de inicialização | ⭐⭐⭐ |
| [`10_analise_diferencas.sql`](core/10_analise_diferencas.sql) | Análise de diferenças | ℹ️ |

### [🔧 Migrations](migrations/) - Migrações
| Arquivo | Descrição | Prioridade |
|---------|-----------|-----------|
| [`add_achievements_column.sql`](migrations/add_achievements_column.sql) | Adiciona coluna de conquistas | ⭐⭐ |
| [`add_baseline_columns_final.sql`](migrations/add_baseline_columns_final.sql) | Colunas de baseline (final) | ⭐⭐⭐ |
| [`add_baseline_columns_simple.sql`](migrations/add_baseline_columns_simple.sql) | Colunas de baseline (simples) | ⭐⭐ |
| [`add_initial_balance_field.sql`](migrations/add_initial_balance_field.sql) | Campo de saldo inicial | ⭐⭐ |
| [`add_initial_fields_to_profiles.sql`](migrations/add_initial_fields_to_profiles.sql) | Campos iniciais ao perfil | ⭐⭐ |

### [⚙️ Triggers](triggers/) - Automação
| Arquivo | Descrição | Prioridade |
|---------|-----------|-----------|
| [`create_profile_trigger.sql`](triggers/create_profile_trigger.sql) | Trigger para criar perfil | ⭐⭐⭐ |
| [`final_flight_profile_sync_solution.sql`](triggers/final_flight_profile_sync_solution.sql) | Sincronização voos-perfil (final) | ⭐⭐⭐ |
| [`create_flight_profile_sync_trigger.sql`](triggers/create_flight_profile_sync_trigger.sql) | Trigger de sincronização | ⭐⭐ |
| [`update_flight_profile_sync_trigger_fixed_v2.sql`](triggers/update_flight_profile_sync_trigger_fixed_v2.sql) | Trigger corrigido v2 | ⭐⭐ |
| [`update_flight_profile_sync_trigger_fixed.sql`](triggers/update_flight_profile_sync_trigger_fixed.sql) | Trigger corrigido v1 | ⭐ |
| [`corrected_flight_profile_solution.sql`](triggers/corrected_flight_profile_solution.sql) | Solução corrigida | ⭐⭐ |

### [👁️ Views](views/) - Views e Funções
| Arquivo | Descrição | Prioridade |
|---------|-----------|-----------|
| [`08_recreate_financial_views_and_functions.sql`](views/08_recreate_financial_views_and_functions.sql) | Views financeiras e funções | ⭐⭐⭐ |
| [`11_complementar_user_settings_e_funcoes.sql`](views/11_complementar_user_settings_e_funcoes.sql) | User settings e funções | ⭐⭐ |

### [🧪 Tests](tests/) - Testes
| Arquivo | Descrição | Prioridade |
|---------|-----------|-----------|
| [`09_test_all_tables.sql`](tests/09_test_all_tables.sql) | Teste de todas as tabelas | ⭐⭐⭐ |
| [`test_baseline_solution.sql`](tests/test_baseline_solution.sql) | Teste da solução baseline | ⭐⭐ |
| [`test_corrected_solution.sql`](tests/test_corrected_solution.sql) | Teste da solução corrigida | ⭐⭐ |
| [`test_trigger_functionality.sql`](tests/test_trigger_functionality.sql) | Teste de triggers | ⭐⭐ |

### [🔨 Fixes](fixes/) - Correções
| Arquivo | Descrição | Prioridade |
|---------|-----------|-----------|
| [`fix_all_database_issues.sql`](fixes/fix_all_database_issues.sql) | Corrige todos os problemas | ⭐⭐⭐ |
| [`fix_baseline_persistence.sql`](fixes/fix_baseline_persistence.sql) | Corrige persistência baseline | ⭐⭐⭐ |
| [`fix_category_icons.sql`](fixes/fix_category_icons.sql) | Corrige ícones de categorias | ⭐⭐ |
| [`fix_existing_profiles.sql`](fixes/fix_existing_profiles.sql) | Corrige perfis existentes | ⭐⭐ |
| [`fix_expense_categories.sql`](fixes/fix_expense_categories.sql) | Corrige categorias de despesa | ⭐⭐ |
| [`fix_financial_transactions_constraints.sql`](fixes/fix_financial_transactions_constraints.sql) | Corrige constraints financeiras | ⭐⭐ |
| [`update_flight_statuses_simple.sql`](fixes/update_flight_statuses_simple.sql) | Atualiza status de voo | ⭐ |
| [`update_profiles_schema_for_minutes.sql`](fixes/update_profiles_schema_for_minutes.sql) | Atualiza schema para minutos | ⭐⭐ |
| [`safe_database_migration.sql`](fixes/safe_database_migration.sql) | Migração segura | ⭐⭐⭐ |

### [🛠️ Maintenance](maintenance/) - Sistema de Manutenção
| Arquivo | Descrição | Prioridade |
|---------|-----------|-----------|
| [`create_maintenance_tables.sql`](maintenance/create_maintenance_tables.sql) | Cria tabelas de manutenção | ⭐⭐⭐ |
| [`add_new_maintenance_items.sql`](maintenance/add_new_maintenance_items.sql) | Adiciona itens de manutenção | ⭐⭐ |
| [`insert_remaining_maintenance_items.sql`](maintenance/insert_remaining_maintenance_items.sql) | Insere itens restantes | ⭐⭐ |
| [`debug_maintenance_query.sql`](maintenance/debug_maintenance_query.sql) | Debug de queries | ⭐ |

### [📦 Storage](storage/) - Storage do Supabase
| Arquivo | Descrição | Prioridade |
|---------|-----------|-----------|
| [`create_storage_bucket_safe.sql`](storage/create_storage_bucket_safe.sql) | Cria bucket (versão segura) | ⭐⭐⭐ |
| [`create_storage_bucket.sql`](storage/create_storage_bucket.sql) | Cria bucket de storage | ⭐⭐ |

### [✈️ MSFS](msfs/) - Integração MSFS
| Arquivo | Descrição | Prioridade |
|---------|-----------|-----------|
| [`create_msfs_tables.sql`](msfs/create_msfs_tables.sql) | Cria tabelas do MSFS | ⭐⭐⭐ |
| [`flight_tracking_schema.sql`](msfs/flight_tracking_schema.sql) | Schema de tracking | ⭐⭐⭐ |
| [`fix_msfs_flight_stats_function.sql`](msfs/fix_msfs_flight_stats_function.sql) | Corrige função de stats | ⭐⭐ |

### [🔍 Debug](debug/) - Diagnóstico
| Arquivo | Descrição | Prioridade |
|---------|-----------|-----------|
| [`check_baseline_columns.sql`](debug/check_baseline_columns.sql) | Verifica colunas baseline | ⭐⭐ |
| [`check_profile_flight_counts.sql`](debug/check_profile_flight_counts.sql) | Verifica contagem de voos | ⭐⭐ |
| [`corrigir_display_name.sql`](debug/corrigir_display_name.sql) | Corrige display name | ⭐⭐ |
| [`corrigir_emails.sql`](debug/corrigir_emails.sql) | Corrige emails | ⭐⭐ |
| [`debug_profile_state.sql`](debug/debug_profile_state.sql) | Debug de estado | ⭐ |
| [`debug_triggers.sql`](debug/debug_triggers.sql) | Debug de triggers | ⭐⭐ |
| [`verificar_emails.sql`](debug/verificar_emails.sql) | Verifica emails | ⭐⭐ |
| [`verificar_perfis.sql`](debug/verificar_perfis.sql) | Verifica perfis | ⭐⭐ |
| [`verify_current_triggers.sql`](debug/verify_current_triggers.sql) | Verifica triggers | ⭐⭐ |

---

## 🚀 Guias Rápidos

### Instalação Completa
```bash
cd core
psql -U postgres -d flight_log_opus -f 12_database_init_completo.sql
```

### Setup Inicial Rápido
```bash
cd core
psql -U postgres -d flight_log_opus -f database_init.sql
```

### Adicionar Funcionalidade de Baseline
```bash
cd migrations
psql -U postgres -d flight_log_opus -f add_baseline_columns_final.sql
```

### Corrigir Todos os Problemas
```bash
cd fixes
psql -U postgres -d flight_log_opus -f fix_all_database_issues.sql
```

### Testar Instalação
```bash
cd tests
psql -U postgres -d flight_log_opus -f 09_test_all_tables.sql
```

---

## 📊 Estatísticas

- **Total de Scripts**: 51
- **Categorias**: 8
- **Scripts Core**: 13
- **Scripts de Migração**: 5
- **Scripts de Trigger**: 6
- **Scripts de View**: 2
- **Scripts de Teste**: 4
- **Scripts de Correção**: 9
- **Scripts de Manutenção**: 4
- **Scripts de Storage**: 2
- **Scripts de MSFS**: 3
- **Scripts de Debug**: 9

---

## 🏷️ Legenda

| Símbolo | Significado |
|----------|-------------|
| ⭐⭐⭐ | Crítico - Execute sempre |
| ⭐⭐ | Importante - Execute na maioria dos casos |
| ⭐ | Opcional - Execute se necessário |
| ℹ️ | Informação - Script de análise |

---

## 📖 Documentação

- [README Principal](README.md) - Documentação completa da organização
- [Documentação do Projeto](../docs/README.md) - Documentação geral do projeto
- [Guia de Setup do Supabase](../docs/guides/SUPABASE_SETUP_GUIDE.md) - Como configurar o Supabase
