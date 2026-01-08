# PRD - Sistema de Metas e Conquistas para Flight Log

## 1. Visão Geral do Módulo

Sistema de gamificação baseado em metas de carreira para pilotos, com tracking automático de progresso através de consultas dinâmicas ao banco de dados D1. As metas devem refletir marcos reais da aviação e serem validadas automaticamente conforme o usuário registra voos.

**Objetivo**: Aumentar engajamento e motivação dos usuários através de objetivos claros, mensuráveis e automaticamente rastreados.

---

## 2. Arquitetura de Dados

### 2.1 Entidades Necessárias

**Tabela: `goals`** (Metas Padrão do Sistema)
- `id` (UUID/INTEGER PRIMARY KEY)
- `code` (VARCHAR UNIQUE - identificador interno, ex: "CR100", "HOURS100")
- `title` (VARCHAR)
- `description` (TEXT)
- `category` (ENUM: career_rating, flight_hours, achievements, certifications)
- `target_type` (ENUM: count, sum, boolean, percentage)
- `target_value` (NUMERIC - valor objetivo)
- `metric_source` (VARCHAR - nome da tabela/campo para consulta)
- `query_template` (TEXT - template da query para validação)
- `icon` (VARCHAR - emoji ou código de ícone)
- `points` (INTEGER - pontos de gamificação)
- `tier` (ENUM: bronze, silver, gold, platinum)
- `is_active` (BOOLEAN)
- `created_at` (TIMESTAMP)

**Tabela: `user_goals`** (Metas dos Usuários)
- `id` (UUID/INTEGER PRIMARY KEY)
- `user_id` (FK → users.id)
- `goal_id` (FK → goals.id)
- `status` (ENUM: active, completed, archived)
- `current_progress` (NUMERIC - valor atual)
- `target_progress` (NUMERIC - cópia do target para histórico)
- `progress_percentage` (COMPUTED: current_progress / target_progress * 100)
- `started_at` (TIMESTAMP)
- `completed_at` (TIMESTAMP NULL)
- `last_checked_at` (TIMESTAMP - última validação)
- `metadata` (JSON - dados extras, ex: milestone intermediário)

**Tabela: `goal_history`** (Histórico de Progresso)
- `id` (UUID/INTEGER PRIMARY KEY)
- `user_goal_id` (FK → user_goals.id)
- `previous_value` (NUMERIC)
- `new_value` (NUMERIC)
- `trigger_event` (VARCHAR - ex: "flight_logged", "manual_check")
- `checked_at` (TIMESTAMP)

---

## 3. Catálogo de Metas Padrão (10 Sugeridas)

### 3.1 Categoria: Career Rating (Pontuação de Carreira)

**Meta 1: "Alcançar CR 100"**
- **Code**: `CR_100`
- **Description**: "Alcançar um career rating perfeito de 100 pontos"
- **Target Type**: `count`
- **Target Value**: `100`
- **Metric Source**: `users.career_rating`
- **Query Template**: `SELECT career_rating FROM users WHERE id = ?`
- **Tier**: Gold
- **Points**: 500

**Meta 2: "Estrela em Ascensão"**
- **Code**: `CR_50`
- **Description**: "Atingir 50 pontos de career rating"
- **Target Type**: `count`
- **Target Value**: `50`
- **Metric Source**: `users.career_rating`
- **Query Template**: `SELECT career_rating FROM users WHERE id = ?`
- **Tier**: Bronze
- **Points**: 100

### 3.2 Categoria: Flight Hours (Horas de Voo)

**Meta 3: "100 Horas de Voo"**
- **Code**: `HOURS_100`
- **Description**: "Registrar 100 horas totais de voo neste trimestre"
- **Target Type**: `sum`
- **Target Value**: `100`
- **Metric Source**: `flights.duration_hours`
- **Query Template**: `SELECT SUM(duration_hours) FROM flights WHERE user_id = ? AND date >= ?`
- **Tier**: Silver
- **Points**: 250

**Meta 4: "Maratonista dos Céus"**
- **Code**: `HOURS_500`
- **Description**: "Acumular 500 horas totais de voo na carreira"
- **Target Type**: `sum`
- **Target Value**: `500`
- **Metric Source**: `flights.duration_hours`
- **Query Template**: `SELECT SUM(duration_hours) FROM flights WHERE user_id = ?`
- **Tier**: Platinum
- **Points**: 1000

**Meta 5: "Voo Noturno Completo"**
- **Code**: `NIGHT_FLIGHT_10`
- **Description**: "Completar 10 voos noturnos"
- **Target Type**: `count`
- **Target Value**: `10`
- **Metric Source**: `flights WHERE flight_type = 'night'`
- **Query Template**: `SELECT COUNT(*) FROM flights WHERE user_id = ? AND flight_type = 'night'`
- **Tier**: Bronze
- **Points**: 150

### 3.3 Categoria: Achievements (Conquistas Específicas)

**Meta 6: "Primeiro Voo Solo"**
- **Code**: `FIRST_SOLO`
- **Description**: "Complete seu primeiro voo sem penalidades"
- **Target Type**: `boolean`
- **Target Value**: `1`
- **Metric Source**: `flights WHERE penalties = 0`
- **Query Template**: `SELECT COUNT(*) FROM flights WHERE user_id = ? AND penalties = 0 LIMIT 1`
- **Tier**: Bronze
- **Points**: 50

**Meta 7: "Travessia do Atlântico"**
- **Code**: `TRANSATLANTIC`
- **Description**: "Complete um voo transatlântico"
- **Target Type**: `boolean`
- **Target Value**: `1`
- **Metric Source**: `flights WHERE distance_nm >= 3000`
- **Query Template**: `SELECT COUNT(*) FROM flights WHERE user_id = ? AND distance_nm >= 3000 LIMIT 1`
- **Tier**: Gold
- **Points**: 400

**Meta 8: "Explorador de Aeroportos"**
- **Code**: `AIRPORTS_50`
- **Description**: "Pousar em 50 aeroportos diferentes"
- **Target Type**: `count`
- **Target Value**: `50`
- **Metric Source**: `DISTINCT arrival_airport FROM flights`
- **Query Template**: `SELECT COUNT(DISTINCT arrival_airport) FROM flights WHERE user_id = ?`
- **Tier**: Silver
- **Points**: 300

### 3.4 Categoria: Consistency (Consistência)

**Meta 9: "Voador Consistente"**
- **Code**: `WEEKLY_STREAK_4`
- **Description**: "Registrar pelo menos 1 voo por semana durante 4 semanas consecutivas"
- **Target Type**: `count`
- **Target Value**: `4`
- **Metric Source**: `CUSTOM - lógica de streak`
- **Query Template**: `SELECT COUNT(DISTINCT strftime('%Y-%W', date)) FROM flights WHERE user_id = ? AND date >= date('now', '-28 days')`
- **Tier**: Silver
- **Points**: 200

**Meta 10: "Mestre da Eficiência"**
- **Code**: `FUEL_EFFICIENCY`
- **Description**: "Manter consumo médio de combustível abaixo de 90% do planejado em 10 voos"
- **Target Type**: `count`
- **Target Value**: `10`
- **Metric Source**: `flights WHERE fuel_efficiency < 0.9`
- **Query Template**: `SELECT COUNT(*) FROM flights WHERE user_id = ? AND (actual_fuel / planned_fuel) < 0.9`
- **Tier**: Gold
- **Points**: 350

---

## 4. Fluxo de Funcionamento

### 4.1 Inicialização do Usuário

**Quando**: Novo usuário criado ou primeira vez acessando módulo de metas

**Processo**:
1. Sistema copia todas as metas com `is_active = true` da tabela `goals`
2. Cria registros em `user_goals` com `status = active`
3. Define `current_progress = 0` e `target_progress = goal.target_value`
4. Executa primeira validação assíncrona

### 4.2 Validação Automática de Progresso

**Triggers de Validação**:
- **Evento primário**: Após inserir novo registro em `flights`
- **Evento secundário**: Atualização de `users.career_rating`
- **Evento terciário**: Cron job a cada 6 horas (backup de sincronização)

**Processo**:
1. Sistema identifica quais `user_goals` devem ser validadas (baseado em `metric_source`)
2. Executa `query_template` substituindo placeholders (`?` por `user_id` e datas)
3. Compara resultado com `target_progress`
4. Atualiza `current_progress` e `last_checked_at`
5. Se `current_progress >= target_progress`:
   - Altera `status = completed`
   - Define `completed_at = NOW()`
   - Insere registro em `goal_history`
   - Dispara notificação para usuário (toast/push)
   - Adiciona `points` ao score do usuário

### 4.3 Modal "Definir Nova Meta"

**Campos do Formulário**:
- **Tipo de Meta**: Select com categorias (Career Rating, Flight Hours, Achievements)
- **Meta Específica**: Select dinâmico baseado em `goals` não ativas para o usuário
- **Prazo** (opcional): Datepicker para meta com deadline customizada
- **Notificações**: Toggle para alertas de progresso (25%, 50%, 75%)

**Validações**:
- Impedir cadastro de meta duplicada (já existe em `user_goals` com `status != archived`)
- Limitar a 10 metas ativas simultaneamente por usuário
- Validar se meta é elegível (ex: "Primeiro Voo Solo" não pode ser reativada se já completada)

**Ações**:
- **Confirmar**: Insere em `user_goals`, executa primeira validação, redireciona para dashboard de metas
- **Cancelar**: Fecha modal sem alterações

---

## 5. Interface e Experiência do Usuário

### 5.1 Dashboard de Metas (`/goals`)

**Seções**:

**A) Metas Ativas** (Card azul no print)
- Layout: Lista vertical com cards expansíveis
- Informações por meta:
  - Título e descrição
  - Barra de progresso visual (linear progress bar)
  - Indicador numérico: `72/100` ou `94/100`
  - Status textual: "Em Progresso", "Próxima de concluir"
  - Botão dropdown: "Detalhes", "Arquivar", "Abandonar"

**B) Metas Concluídas** (Card verde no print)
- Layout: Grid 2 colunas ou lista compacta
- Informações:
  - Título + ícone de check
  - Data de conclusão relativa: "Concluído 2 meses atrás"
  - Badge com tier (Bronze/Silver/Gold/Platinum)
  - Botão: "Ver Certificado" (opcional - gera imagem compartilhável)

**C) Botão de Ação** (canto superior direito)
- Primário: "+ Definir Nova Meta"
- Abre modal sobreposto com animação fade-in

### 5.2 Indicadores de Progresso

**Níveis de Feedback**:
- **0-24%**: Barra cinza, texto neutro
- **25-49%**: Barra amarela, badge "Começando"
- **50-74%**: Barra laranja, badge "No Caminho Certo"
- **75-99%**: Barra azul, badge "Quase Lá!", pulso de animação
- **100%**: Barra verde, confete animado, badge "Concluído!"

**Micro-interações**:
- Atualização de progresso: Animar transição da barra (ease-out 0.5s)
- Conclusão: Trigger de confete + som (opcional, configurável)
- Milestone intermediário (50%): Toast sutil no canto inferior direito

---

## 6. Regras de Negócio e Validações

### 6.1 Integridade de Dados

**Regra 1**: Meta só pode ser marcada como completa se `current_progress >= target_progress`

**Regra 2**: Meta completa não pode ter progresso revertido (imutabilidade de `completed_at`)

**Regra 3**: Usuário pode arquivar meta ativa, mas progresso é mantido (para possível reativação)

**Regra 4**: Meta com deadline expirado automaticamente vai para status `expired` (novo status necessário)

### 6.2 Performance e Otimização

**Cache Strategy**:
- Cache de `current_progress` em memória (Workers KV ou Durable Objects)
- TTL: 5 minutos para metas com progresso lento (ex: horas de voo)
- TTL: 30 segundos para metas voláteis (ex: career rating)
- Invalidação: Forçada após qualquer INSERT em `flights` ou UPDATE em `users.career_rating`

**Query Optimization**:
- Todas as `query_template` devem ter índices apropriados:
  - `flights(user_id, date)` - composite index
  - `flights(user_id, flight_type)` - composite index
  - `flights(user_id, distance_nm)` - composite index
- Usar `EXPLAIN QUERY PLAN` para validar uso de índices

**Throttling**:
- Limitar recálculo de progresso a 1x por minuto por meta (evitar spam de atualizações)
- Batch processing: Se usuário loga 5 voos de uma vez, processar validações em fila

---

## 7. Integrações e Dependências

### 7.1 Hooks Necessários

**Hook: `useGoalProgress`**
- **Responsabilidade**: Buscar metas ativas do usuário com progresso atualizado
- **Endpoint**: `GET /api/goals/user/:userId`
- **Retorno**: Array de objetos `{ goal, currentProgress, targetProgress, percentage, status }`
- **Polling**: Opcional - Long polling ou WebSocket para updates em tempo real

**Hook: `useGoalValidation`**
- **Responsabilidade**: Forçar revalidação manual de uma meta específica
- **Endpoint**: `POST /api/goals/user/:userId/validate/:goalId`
- **Uso**: Botão "Atualizar Progresso" no card da meta

**Hook: `useCreateUserGoal`**
- **Responsabilidade**: Criar nova meta para usuário
- **Endpoint**: `POST /api/goals/user/:userId`
- **Payload**: `{ goalId, customDeadline?, notificationsEnabled }`

### 7.2 Workers e Background Jobs

**Worker 1: Goal Progress Validator**
- **Tipo**: Cloudflare Worker com Cron Trigger
- **Frequência**: A cada 6 horas
- **Função**: Iterar sobre todas `user_goals` com `status = active` e executar validação batch

**Worker 2: Goal Completion Notifier**
- **Tipo**: Event-driven Worker (triggered by D1 changes)
- **Função**: Enviar notificação push/email quando meta é completada
- **Integração**: Cloudflare Workers + Pushover/Firebase Cloud Messaging

---

## 8. Extensibilidade Futura

### 8.1 Recursos Avançados (Fase 2)

**Metas Customizadas do Usuário**:
- Permitir usuário criar meta própria (ex: "Voar 20h em aeronaves Cessna")
- Interface de query builder simplificada (selects + inputs)
- Validação prévia da query antes de salvar

**Conquistas Secretas**:
- Metas ocultas que aparecem apenas quando completadas
- Easter eggs (ex: "Voar em 7 continentes", "Pousar no aeroporto mais ao norte")

**Competições e Leaderboards**:
- Metas com ranking global (quem completou mais rápido)
- Metas sazonais (ex: "Desafio de Verão: 50h em 3 meses")

**Sistema de Badges**:
- Distintivos colecionáveis associados a metas
- Exibição pública no perfil do usuário

### 8.2 Analytics e Relatórios

**Dashboard para Admin**:
- Taxa de conclusão por meta (identificar metas muito fáceis/difíceis)
- Tempo médio de conclusão
- Metas mais populares vs. menos escolhidas
- Distribuição de usuários por tier

---

## 9. Checklist de Implementação

### Fase 1: Estrutura de Dados
- [ ] Criar tabelas `goals`, `user_goals`, `goal_history` no D1
- [ ] Popular tabela `goals` com 10 metas padrão
- [ ] Criar índices necessários
- [ ] Implementar seed script para desenvolvimento

### Fase 2: API e Lógica de Validação
- [ ] Endpoint `GET /api/goals` (listar metas disponíveis)
- [ ] Endpoint `GET /api/goals/user/:userId` (metas do usuário)
- [ ] Endpoint `POST /api/goals/user/:userId` (criar meta)
- [ ] Endpoint `POST /api/goals/user/:userId/validate/:goalId` (forçar validação)
- [ ] Implementar motor de query dinâmica (executar `query_template`)
- [ ] Implementar lógica de conclusão e histórico

### Fase 3: Frontend e UI
- [ ] Componente `GoalCard` (card de meta individual)
- [ ] Componente `GoalProgressBar` (barra de progresso)
- [ ] Componente `GoalModal` (modal de criação)
- [ ] Página `/goals` com seções "Ativas" e "Concluídas"
- [ ] Implementar hooks customizados
- [ ] Adicionar animações de conclusão (confete)

### Fase 4: Background Processing
- [ ] Configurar Cron Trigger no Cloudflare Workers
- [ ] Implementar job de validação batch
- [ ] Implementar sistema de notificações
- [ ] Testar invalidação de cache

### Fase 5: Testes e Ajustes
- [ ] Testar performance de queries complexas
- [ ] Validar cálculos de progresso
- [ ] Testar edge cases (meta duplicada, progresso negativo)
- [ ] Ajustar dificuldade de metas baseado em feedback

---

## 10. Notas Técnicas Importantes

**Query Templates - Padrão de Substituição**:
- Use placeholders nomeados: `{{USER_ID}}`, `{{DATE_START}}`, `{{DATE_END}}`
- Motor de query deve fazer escape/sanitization automática
- Validar resultado sempre como numérico (tratar NULL como 0)

**Tratamento de Metas Legadas**:
- Se estrutura de `flights` mudar, manter backward compatibility
- Versionar `query_template` (campo `query_version` em `goals`)
- Migrar metas ativas para nova query automaticamente

**Considerações de Timezone**:
- Sempre usar UTC no banco
- Converter para timezone do usuário apenas no frontend
- Metas baseadas em "semanas" devem considerar ISO week (segunda a domingo)

**Fail-Safe**:
- Se query falhar (timeout, erro de sintaxe), não bloquear interface
- Exibir progresso anterior + mensagem "Atualizando..."
- Log de erros para debugging (Cloudflare Analytics)