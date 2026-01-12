# PRD - Sistema de Relatórios e Analytics

## 📋 Visão Geral

Sistema completo de relatórios e analytics para o Flight Log Opus, permitindo visualização, análise e exportação de dados consolidados de todas as áreas do sistema (voos, financeiro, manutenção, metas, etc.).

---

## 🎯 Objetivos do Produto

### Objetivo Principal
Fornecer aos usuários uma área centralizada para análise profunda de dados através de relatórios interativos, visualizações geográficas e exportação de dados em múltiplos formatos.

### Objetivos Específicos
- Consolidar dados de todas as áreas do sistema em relatórios únicos
- Permitir análise geográfica de operações através de mapas interativos
- Facilitar exportação de dados para análise externa (Excel, PDF, CSV)
- Oferecer múltiplas dimensões de análise (tempo, localização, tipo, categoria)
- Fornecer insights automáticos sobre padrões e tendências

---

## 👥 Personas e Casos de Uso

### Persona 1: Piloto Profissional
**Necessidades:**
- Relatórios de horas de voo por período para renovação de certificações
- Análise de destinos mais frequentes
- Exportação de logbook completo em formato aceito por autoridades

### Persona 2: Operador de Aeronaves
**Necessidades:**
- Relatórios financeiros de receitas vs despesas por aeronave
- Análise de custos de manutenção por aeronave/período
- Visualização de rotas mais lucrativas

### Persona 3: Gestor de Frota
**Necessidades:**
- Relatórios consolidados de múltiplas aeronaves
- Análise de utilização de aeronaves por região
- Relatórios de manutenção preventiva e custos operacionais

---

## 🏗️ Estrutura da Área de Relatórios

### 1. Dashboard Principal de Relatórios

#### 1.1 Header da Área
- **Título da seção:** "Relatórios e Analytics"
- **Breadcrumb:** Dashboard > Relatórios
- **Ações rápidas:**
  - Botão "Novo Relatório" (abre modal de seleção)
  - Botão "Relatórios Salvos" (dropdown com favoritos)
  - Botão "Exportar Tudo" (exportação massiva)

#### 1.2 Filtros Globais (Sidebar ou Top Bar)
- **Período de Análise:**
  - Seletor de data (de/até)
  - Presets: Últimos 7 dias, 30 dias, 3 meses, 6 meses, 1 ano, Todo período, Customizado
  - Comparação com período anterior (toggle)

- **Filtros de Localização:**
  - Aeroporto específico (busca com autocomplete)
  - Cidade (busca com autocomplete)
  - Estado/Província (dropdown)
  - País (dropdown)
  - Região customizada (desenhar no mapa)

- **Filtros de Aeronave:**
  - Aeronave específica (multi-select)
  - Tipo de aeronave (multi-select)
  - Categoria (monomotor, multimotor, jato, etc.)

- **Filtros por Status:**
  - Status de voo (completo, cancelado, em andamento)
  - Status financeiro (pago, pendente, atrasado)
  - Status de manutenção (programada, realizada, pendente)

#### 1.3 Área de Cards de Relatórios Rápidos
Grid de cards com relatórios pré-configurados mais usados:
- Card "Voos do Mês" (KPI + mini gráfico)
- Card "Desempenho Financeiro" (KPI + indicador)
- Card "Manutenções Pendentes" (contador + alerta)
- Card "Aeroportos Visitados" (número + mini mapa)
- Card "Horas de Voo Acumuladas" (progresso + meta)
- Card "Top 5 Rotas" (lista + percentual)

---

## 📊 Tipos de Relatórios Detalhados

### 2. Relatórios de Voos

#### 2.1 Relatório Geral de Voos
**Visualizações:**
- Tabela paginada com todos os voos filtrados
- Colunas: Data, Origem, Destino, Aeronave, Duração, Distância, Status, CR Total
- Ordenação por qualquer coluna
- Busca inline por texto

**Agrupamentos disponíveis:**
- Por aeroporto de origem
- Por aeroporto de destino
- Por cidade
- Por estado
- Por país
- Por aeronave
- Por tipo de voo (IFR/VFR)
- Por status de voo

**Métricas calculadas automaticamente:**
- Total de voos no período
- Total de horas de voo
- Total de distância percorrida
- Média de duração por voo
- Média de distância por voo
- Voos perfeitos vs imperfeitos
- Taxa de conclusão de voos

#### 2.2 Relatório de Logbook Oficial
**Características:**
- Formato compatível com padrões de aviação (ANAC/FAA)
- Campos obrigatórios: Data, Aeronave, Origem, Destino, Horas, Tipo de voo
- Campos opcionais: Instrutor, Observações, Condições meteorológicas
- Totalizadores automáticos por página
- Assinatura digital (se aplicável)

#### 2.3 Relatório de Aeroportos Visitados
**Visualizações:**
- Tabela com aeroportos únicos visitados
- Colunas: ICAO, Nome, Cidade, Estado, País, Nº de Visitas, Primeira Visita, Última Visita
- Card de estatísticas: Total de aeroportos únicos, Países visitados, Estados visitados

**Agrupamentos:**
- Por país (expandível por estado/cidade)
- Por estado (expandível por cidade)
- Por frequência de visitas

#### 2.4 Relatório de Análise de Rotas
**Visualizações:**
- Tabela de rotas (par origem-destino)
- Colunas: Rota, Nº de Voos, Distância, Tempo Total, Tempo Médio, CR Total, CR Médio
- Gráfico de barras: Top 10 rotas mais frequentes
- Gráfico de linha: Evolução de voos por rota ao longo do tempo

**Agrupamentos:**
- Por frequência de voos
- Por distância total percorrida
- Por tempo total voado
- Por CR total gerado

---

### 3. Relatórios Financeiros

#### 3.1 Relatório Consolidado Financeiro
**Visualizações:**
- Resumo executivo (cards com KPIs):
  - Receita Total
  - Despesa Total
  - Lucro Líquido
  - Margem de Lucro %
  - ROI %

- Gráfico de linhas: Receitas vs Despesas ao longo do tempo
- Gráfico de pizza: Distribuição de despesas por categoria
- Gráfico de barras: Top 5 categorias de receita
- Tabela detalhada de transações

**Agrupamentos:**
- Por categoria de receita
- Por categoria de despesa
- Por aeronave (se aplicável)
- Por tipo de transação
- Por período (diário, semanal, mensal, anual)

#### 3.2 Relatório de Receitas
**Detalhamentos:**
- Receitas por fonte (voos, aluguel, instrução, etc.)
- Receitas por aeronave
- Receitas por cliente (se aplicável)
- Evolução mensal de receitas
- Comparação com metas estabelecidas

#### 3.3 Relatório de Despesas
**Detalhamentos:**
- Despesas por categoria (combustível, manutenção, hangar, seguro, etc.)
- Despesas por aeronave
- Despesas fixas vs variáveis
- Análise de tendências de gastos
- Alertas de despesas acima da média

#### 3.4 Relatório de Custo por Hora (CR)
**Visualizações:**
- CR médio por aeronave
- CR por tipo de voo
- Evolução do CR ao longo do tempo
- Comparação de CR entre aeronaves
- Análise de eficiência operacional

**Cálculos incluídos:**
- CR direto (combustível + operação)
- CR total (incluindo manutenção e fixos)
- CR por hora de motor
- CR por milha náutica

#### 3.5 Relatório de Fluxo de Caixa
**Visualizações:**
- Gráfico de cascata mostrando entrada/saída
- Saldo projetado para próximos períodos
- Análise de sazonalidade
- Identificação de períodos críticos

---

### 4. Relatórios de Manutenção

#### 4.1 Relatório Geral de Manutenção
**Visualizações:**
- Tabela de manutenções realizadas
- Colunas: Data, Aeronave, Tipo, Categoria, Mecânico, Custo, Status
- Cards de resumo: Total de manutenções, Custo total, Custo médio

**Agrupamentos:**
- Por aeronave
- Por tipo de manutenção (preventiva, corretiva, preditiva)
- Por categoria (motor, avionics, estrutura, sistemas)
- Por mecânico
- Por status

#### 4.2 Relatório de Histórico por Aeronave
**Detalhamentos:**
- Timeline completo de manutenções por aeronave
- Custos acumulados de manutenção
- Intervalos entre manutenções
- Componentes substituídos/reparados
- Próximas manutenções programadas

#### 4.3 Relatório de Custos de Manutenção
**Análises:**
- Custo total vs horas de voo (custo por hora de manutenção)
- Tendências de custos ao longo do tempo
- Comparação de custos entre aeronaves
- Previsão de custos futuros
- Identificação de componentes com maior custo

#### 4.4 Relatório de Conformidade
**Checagens:**
- Status de inspeções obrigatórias (100h, anual, etc.)
- Certificados e licenças vigentes
- ADs (Airworthiness Directives) aplicados
- Documentação pendente
- Alertas de vencimento

---

### 5. Relatórios de Metas e Conquistas

#### 5.1 Relatório de Progresso de Metas
**Visualizações:**
- Lista de metas ativas com barras de progresso
- Status: No prazo, Em risco, Atrasada, Concluída
- Gráfico de velocidade de progresso
- Projeção de conclusão baseada em tendência

**Agrupamentos:**
- Por tipo de meta (horas, voos, financeiro, conquistas)
- Por status
- Por período de conclusão

#### 5.2 Relatório de Conquistas
**Detalhamentos:**
- Conquistas desbloqueadas vs total
- Timeline de conquistas
- Conquistas por categoria
- Progresso de badges/títulos
- Estatísticas de raridade

#### 5.3 Relatório de Performance
**Métricas:**
- Evolução de horas de voo ao longo do tempo
- Taxa de crescimento mensal/anual
- Comparação com pilotos similares (se aplicável)
- Análise de padrões de progresso

---

### 6. Relatórios Customizados

#### 6.1 Construtor de Relatórios
**Funcionalidade:**
- Interface drag-and-drop para criar relatórios personalizados
- Seleção de campos de múltiplas tabelas
- Definição de filtros customizados
- Escolha de agrupamentos
- Seleção de visualizações (tabela, gráfico)
- Salvamento de relatórios customizados
- Compartilhamento de templates de relatórios

**Campos disponíveis para seleção:**
- Todos os campos de voos
- Todos os campos financeiros
- Todos os campos de manutenção
- Todos os campos de metas
- Campos calculados (totais, médias, percentuais)

---

## 🗺️ Sistema de Visualização Geográfica

### 7. Mapa Interativo de Operações

#### 7.1 Mapa Principal
**Elementos visuais:**
- Mapa mundial interativo (Leaflet ou Mapbox)
- Marcadores de aeroportos visitados
- Linhas de rotas entre aeroportos
- Heatmap de frequência de visitas
- Clusters automáticos para zoom out

**Controles do mapa:**
- Zoom in/out
- Pan (arrastar)
- Seletor de camada base (satélite, street, terrain)
- Toggle de layers (aeroportos, rotas, heatmap, clusters)
- Botão de reset (voltar à visualização inicial)
- Botão de fullscreen

#### 7.2 Marcadores de Aeroportos
**Tipos de marcadores:**
- Marcador padrão: aeroporto visitado
- Marcador destacado: aeroporto mais visitado
- Marcador base: aeroporto principal de operações
- Cores por frequência (escala de verde a vermelho)

**Popup ao clicar no marcador:**
- Nome do aeroporto
- ICAO / IATA
- Cidade, Estado, País
- Número de visitas
- Primeira e última visita
- Botão "Ver voos deste aeroporto"

#### 7.3 Linhas de Rotas
**Características:**
- Linhas conectando origem e destino de cada voo
- Espessura da linha proporcional à frequência
- Cor da linha por status ou tipo de voo
- Animação de percurso (opcional)
- Tooltip ao passar o mouse: informações da rota

#### 7.4 Heatmap de Operações
**Visualização:**
- Intensidade de calor por frequência de voos
- Gradiente de cores configurável
- Raio de influência ajustável
- Toggle para ativar/desativar

#### 7.5 Filtros do Mapa
**Opções:**
- Período de análise
- Tipo de voo (IFR/VFR)
- Aeronave específica
- País/região específica
- Distância mínima/máxima da rota

#### 7.6 Estatísticas do Mapa (Sidebar)
- Total de aeroportos visualizados
- Total de países visitados
- Total de estados/províncias visitados
- Distância total percorrida (soma de todas as rotas)
- Aeroporto mais distante da base
- Maior rota única

---

## 📤 Sistema de Exportação

### 8. Exportação de Relatórios

#### 8.1 Formatos de Exportação Disponíveis

**Excel (.xlsx):**
- Múltiplas abas por relatório complexo
- Formatação condicional (cores por status)
- Tabelas dinâmicas pré-configuradas
- Gráficos incorporados
- Totalizadores automáticos
- Metadados no cabeçalho (data de geração, filtros aplicados)

**CSV (.csv):**
- Formato simples para importação externa
- Encoding UTF-8
- Separador configurável (vírgula ou ponto-e-vírgula)
- Ideal para análises em outras ferramentas

**PDF (.pdf):**
- Layout profissional e imprimível
- Cabeçalho com logo e informações do usuário
- Rodapé com numeração de páginas
- Gráficos em alta resolução
- Tabelas formatadas
- Ideal para apresentações e arquivamento

**JSON (.json):**
- Formato técnico para desenvolvedores
- Estrutura completa de dados
- Ideal para integrações e APIs

#### 8.2 Modal de Exportação
**Elementos:**
- Seleção de formato
- Preview dos dados a serem exportados
- Opções de customização:
  - Incluir/excluir gráficos
  - Incluir/excluir tabelas
  - Incluir/excluir cabeçalho/rodapé
  - Orientação do documento (retrato/paisagem)
- Nome do arquivo (editável)
- Botão "Exportar"
- Indicador de progresso durante exportação
- Download automático ao concluir

#### 8.3 Exportação em Lote
**Funcionalidade:**
- Seleção de múltiplos relatórios
- Exportação em ZIP contendo todos os arquivos
- Opção de aplicar mesmos filtros para todos
- Opção de gerar um relatório consolidado

#### 8.4 Agendamento de Relatórios (Feature Avançada)
**Funcionalidade:**
- Definir relatórios para geração automática
- Frequência: Diária, Semanal, Mensal, Trimestral, Anual
- Envio automático por e-mail (se implementado)
- Armazenamento em histórico de relatórios gerados

---

## 🔧 Funcionalidades Auxiliares

### 9. Sistema de Favoritos e Histórico

#### 9.1 Relatórios Favoritos
- Possibilidade de marcar relatórios como favoritos
- Acesso rápido via dropdown no header
- Ícone de estrela para favoritar/desfavoritar

#### 9.2 Histórico de Relatórios
- Lista de últimos 20 relatórios gerados
- Data e hora de geração
- Filtros aplicados
- Opção de re-executar com mesmos filtros
- Opção de baixar novamente (se ainda disponível)

---

### 10. Comparação de Períodos

#### 10.1 Modo Comparativo
**Funcionalidade:**
- Toggle "Comparar com período anterior"
- Seleção de período base
- Cálculo automático do período de comparação
- Exibição lado a lado ou sobreposta

**Visualizações:**
- Tabelas com colunas adicionais de comparação
- Indicadores de variação (%, absoluto)
- Setas de tendência (↑ ↓ →)
- Cores de alerta (verde=melhoria, vermelho=piora)
- Gráficos duplos ou linhas comparativas

---

### 11. Insights Automáticos

#### 11.1 Painel de Insights
**Geração automática de insights baseados em:**
- Tendências identificadas (crescimento, queda)
- Anomalias detectadas (valores fora do padrão)
- Recordes atingidos (máximos, mínimos)
- Metas em risco
- Oportunidades identificadas

**Formato dos insights:**
- Card com ícone de alerta/informação
- Texto descritivo do insight
- Dados de suporte (números, percentuais)
- Ação sugerida (quando aplicável)

**Exemplos de insights:**
- "Suas horas de voo cresceram 30% comparado ao mês anterior"
- "Aeroporto SBSP foi visitado 5x mais que qualquer outro este mês"
- "Custo de manutenção da aeronave X está 40% acima da média"
- "Você está a apenas 5 horas de completar a meta de 100 horas"

---

## 🎨 Design e UX

### 12. Diretrizes de Interface

#### 12.1 Layout Geral
- Design responsivo (desktop, tablet, mobile)
- Sidebar de filtros colapsável
- Área principal para visualizações
- Header fixo com ações globais
- Footer com informações de atualização

#### 12.2 Componentes Visuais
- Cards informativos com KPIs
- Gráficos interativos (hover, click, zoom)
- Tabelas com ordenação e busca
- Modais para ações secundárias
- Tooltips explicativos
- Loading states e skeletons

#### 12.3 Tema e Cores
- Seguir design system existente do Flight Log Opus
- Tema HUD (Heads-Up Display) de cockpit
- Modo claro e escuro
- Cores de status consistentes (sucesso, alerta, erro, info)
- Acessibilidade (contraste adequado)

#### 12.4 Feedback Visual
- Confirmações de ações
- Mensagens de erro claras
- Indicadores de loading
- Animações sutis de transição
- Estados vazios bem desenhados (empty states)

---

## 📱 Responsividade

### 13. Adaptação para Dispositivos

#### 13.1 Desktop (> 1024px)
- Layout completo com sidebar de filtros
- Gráficos em tamanho completo
- Tabelas com todas as colunas
- Mapa em tela inteira disponível

#### 13.2 Tablet (768px - 1024px)
- Sidebar de filtros colapsável
- Gráficos redimensionados
- Tabelas com scroll horizontal
- Mapa responsivo

#### 13.3 Mobile (< 768px)
- Filtros em modal/drawer
- Gráficos simplificados ou em carrossel
- Tabelas em modo card/lista
- Mapa em tela cheia com controles mobile-friendly
- Exportação simplificada (apenas Excel e PDF)

---

## 🚀 Implementação Progressiva

### 14. Fases de Desenvolvimento

#### Fase 1 - MVP (Minimum Viable Product)
- Relatório geral de voos com tabela e exportação Excel
- Relatório financeiro básico (receitas vs despesas)
- Filtros básicos (período, aeronave)
- Exportação em Excel e CSV

#### Fase 2 - Visualizações Avançadas
- Gráficos interativos (Recharts/Chart.js)
- Mapa interativo de aeroportos visitados
- Relatórios de manutenção
- Exportação em PDF

#### Fase 3 - Analytics e Insights
- Relatórios customizados (construtor)
- Sistema de comparação de períodos
- Insights automáticos
- Agrupamentos avançados

#### Fase 4 - Features Premium
- Agendamento de relatórios
- Compartilhamento de relatórios
- Relatórios colaborativos
- Dashboard executivo personalizado

---

## 🔗 Integrações Necessárias

### 15. Integrações com Módulos Existentes

#### 15.1 Banco de Dados (Supabase)
- Queries otimizadas para agregações
- Views materializadas para relatórios pesados
- Índices para performance de filtros
- Stored procedures para cálculos complexos

#### 15.2 Sistema de Voos
- Acesso a tabela de voos
- Acesso a tabela de aeroportos
- Acesso a tabela de aeronaves
- Cálculos de CR e estatísticas

#### 15.3 Sistema Financeiro
- Acesso a transações financeiras
- Acesso a categorias
- Cálculos de ROI e margem
- Integração com CR de voos

#### 15.4 Sistema de Manutenção
- Acesso a registros de manutenção
- Acesso a categorias de manutenção
- Custos e previsões

#### 15.5 Sistema de Metas
- Acesso a metas ativas e concluídas
- Cálculos de progresso
- Conquistas desbloqueadas

---

## 🎯 Métricas de Sucesso

### 16. KPIs do Sistema de Relatórios

- **Adoção:** % de usuários que acessam a área de relatórios mensalmente
- **Engagement:** Número médio de relatórios gerados por usuário
- **Exportações:** Número de exportações realizadas (por formato)
- **Performance:** Tempo médio de geração de relatórios
- **Satisfação:** Rating de satisfação com relatórios (se implementado feedback)
- **Utilidade:** Relatórios mais acessados/exportados

---

## 🔐 Segurança e Privacidade

### 17. Considerações de Segurança

- **Controle de acesso:** Usuário só acessa seus próprios dados
- **Sanitização:** Inputs sanitizados para prevenir SQL injection
- **Rate limiting:** Limite de exportações por período
- **Auditoria:** Log de relatórios gerados e exportados
- **Privacidade:** Dados não compartilhados sem consentimento
- **LGPD/GDPR:** Conformidade com regulamentações de privacidade

---

## 📝 Requisitos Técnicos

### 18. Stack e Bibliotecas Sugeridas

#### Frontend
- **Gráficos:** Recharts (já usado) ou Chart.js para gráficos avançados
- **Mapas:** Leaflet (já usado) com plugins de heatmap e clustering
- **Tabelas:** TanStack Table (React Table) para tabelas avançadas
- **Exportação Excel:** SheetJS (xlsx) ou ExcelJS
- **Exportação PDF:** jsPDF ou React-PDF
- **Date pickers:** React DatePicker ou similar
- **Filtros:** React Hook Form + Zod (já usados)

#### Backend/Database
- **Queries:** Supabase com PostgREST
- **Agregações:** PostgreSQL aggregate functions
- **Views:** Materialized views para performance
- **Cache:** Redis para cache de relatórios pesados (opcional)

---

## 🗓️ Cronograma Estimado

### Fase 1 - MVP (4-6 semanas)
- Semana 1-2: Estrutura base e filtros
- Semana 3-4: Relatórios de voos e financeiro
- Semana 5-6: Exportação Excel/CSV e testes

### Fase 2 - Visualizações (4-6 semanas)
- Semana 1-2: Integração de gráficos
- Semana 3-4: Mapa interativo
- Semana 5-6: Relatórios de manutenção e exportação PDF

### Fase 3 - Analytics (4-6 semanas)
- Semana 1-2: Construtor de relatórios customizados
- Semana 3-4: Sistema de comparação
- Semana 5-6: Insights automáticos

### Fase 4 - Premium (4-6 semanas)
- Semana 1-2: Agendamento de relatórios
- Semana 3-4: Compartilhamento
- Semana 5-6: Dashboard executivo

---

## ✅ Critérios de Aceite

### 19. Definição de Pronto

#### Para cada tipo de relatório:
- [ ] Relatório exibe dados corretos conforme filtros aplicados
- [ ] Agrupamentos funcionam corretamente
- [ ] Ordenação funciona em todas as colunas
- [ ] Exportação gera arquivo válido e completo
- [ ] Performance aceitável (< 3s para carregamento)
- [ ] Interface responsiva em todos os breakpoints
- [ ] Feedback visual durante loading
- [ ] Tratamento de erros implementado
- [ ] Empty states implementados
- [ ] Documentação técnica criada

---

## 🎓 Documentação Necessária

### 20. Documentos a Criar

- **Guia do Usuário:** Como usar a área de relatórios
- **Manual de Filtros:** Explicação de cada filtro disponível
- **Glossário:** Termos técnicos e métricas calculadas
- **FAQ:** Perguntas frequentes sobre relatórios
- **API Documentation:** Endpoints criados para relatórios
- **Database Schema:** Estrutura de views e queries

---

## 🔮 Features Futuras (Backlog)

- Dashboard executivo com widgets configuráveis
- Relatórios colaborativos (compartilhar com outros usuários)
- Alertas inteligentes baseados em ML
- Integração com Google Analytics para análise de uso
- Exportação para Google Sheets/Excel Online
- Geração de apresentações automáticas (PowerPoint)
- Relatórios por voz (integração com assistentes)
- Aplicativo mobile dedicado para relatórios