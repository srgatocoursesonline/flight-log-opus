# ✈️ Flight Log Opus

<div align="center">
  <img src="https://img.shields.io/badge/React-18.3.1-61DAFB?style=for-the-badge&logo=react&logoColor=white" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5.8.3-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Supabase-2.56.0-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white" alt="Supabase" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-3.4.17-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind" />
  <img src="https://img.shields.io/badge/Vite-5.4.19-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
</div>

<div align="center">
  <h3>🎯 Sistema completo de gerenciamento de voos para pilotos profissionais</h3>
  <p>Interface moderna inspirada em cockpits de aviação com tema HUD (Heads-Up Display)</p>
  
  **[🚀 Acesse o projeto online](https://flight-log-opus.pages.dev)**
</div>

---

## 📁 **Estrutura Atual do Projeto**

O projeto está organizado seguindo uma arquitetura híbrida com componentes bem definidos e separação clara de responsabilidades.

### 🏗️ **Frontend - Arquitetura Baseada em Componentes**

```
src/
├── components/        # Componentes organizados por funcionalidade
│   ├── career/       # Componentes de carreira e perfil
│   ├── dashboard/    # Dashboard principal e widgets
│   ├── financial/    # Sistema financeiro
│   ├── flight/       # Componentes de voo
│   ├── goals/        # Sistema de metas
│   ├── maintenance/  # Gestão de manutenção
│   ├── maps/         # Mapas e visualizações geográficas
│   └── ui/           # Componentes de interface (shadcn/ui)
├── contexts/         # Contextos React (Auth, etc.)
├── entities/         # Modelos de dados e entidades
├── hooks/            # Hooks customizados
│   ├── business/     # Lógica de negócio
│   ├── goals/        # Hooks de metas
│   ├── supabase/     # Integração com Supabase
│   └── ui/           # Hooks de interface
├── lib/              # Bibliotecas e configurações
│   ├── config/       # Configurações
│   ├── data/         # Dados estáticos
│   └── services/     # Serviços externos
├── pages/            # Páginas da aplicação
├── types/            # Definições de tipos TypeScript
└── utils/            # Utilitários e helpers
```

### 🏢 **Backend - API Express com TypeScript**

```
backend/src/
├── routes/           # Rotas da API
├── services/         # Serviços de negócio
│   ├── airportService.ts
│   └── flightTrackingService.ts
└── utils/            # Utilitários do backend
    └── flightCalculations.ts
```

### 🎮 **Companion MSFS - Integração com Flight Simulator**

```
companion/
├── companion-msfs.ts # Serviço principal de integração
├── package.json      # Dependências específicas MSFS
└── .env.example      # Configurações de exemplo
```

### 📚 **Documentação Organizada**

```
docs/
├── api/              # Documentação de APIs
├── features/         # Documentação de funcionalidades
├── fixes/            # Histórico de correções
├── guides/           # Guias e tutoriais
└── project/          # Documentação do projeto
```

### 🗄️ **Banco de Dados - Supabase**

```
database/
├── core/             # Estruturas principais
├── migrations/       # Migrações do banco
├── triggers/         # Triggers e funções
├── views/            # Views do banco
└── storage/          # Configurações de storage
```

---

## 🚀 Início Rápido

### ⚡ Instalação em 3 Passos

```bash
# 1️⃣ Clone e acesse o projeto
git clone <repository-url> && cd flight-log-opus

# 2️⃣ Instale dependências (npm recomendado)
npm install

# 3️⃣ Execute o projeto
npm run dev
```

> 🌐 **Acesse:** http://localhost:8080

### 📋 Pré-requisitos

| Ferramenta | Versão Mínima | Status |
|------------|---------------|--------|
| Node.js | 18.0.0+ | ✅ Obrigatório |
| npm | 9.0.0+ | 🚀 Recomendado |

### 🛠️ Scripts Disponíveis

| Comando | Descrição | Uso |
|---------|-----------|-----|
| `npm run dev` | 🔥 Servidor de desenvolvimento | Desenvolvimento local |
| `npm run build` | 📦 Build de produção | Deploy |
| `npm run build:dev` | 🔧 Build de desenvolvimento | Teste local |
| `npm run preview` | 👀 Preview do build | Teste pré-deploy |
| `npm run lint` | 🔍 Análise de código | Qualidade |
| `npm run test` | 🧪 Executar testes | Testes unitários |
| `npm run test:watch` | 👀 Testes em modo watch | Desenvolvimento TDD |
| `npm run test:coverage` | 📊 Cobertura de testes | Análise de qualidade |

---

## 🛠️ Stack Tecnológica

<div align="center">
  <h4>🎨 Frontend Moderno</h4>
</div>

| Tecnologia | Versão | Propósito | Status |
|------------|--------|-----------|--------|
| **React** | 18.3.1 | 🚀 Biblioteca principal | ✅ Estável |
| **TypeScript** | 5.8.3 | 🎯 Tipagem estática | ✅ Estável |
| **Vite** | 5.4.19 | ⚡ Build tool ultra-rápido | ✅ Estável |
| **Tailwind CSS** | 3.4.17 | 🎨 Framework CSS utilitário | ✅ Estável |
| **Recharts** | 2.15.4 | 📊 Gráficos interativos | ✅ Estável |
| **TanStack Query** | 5.83.0 | 🔄 Gerenciamento de estado | ✅ Estável |
| **React Hook Form** | 7.61.1 | 📝 Formulários performáticos | ✅ Estável |
| **Zod** | 3.25.76 | ✅ Validação de schemas | ✅ Estável |
| **Supabase** | 2.56.0 | 🗄️ Backend como serviço | ✅ Estável |
| **React Router** | 6.30.1 | 🛣️ Roteamento SPA | ✅ Estável |
| **Leaflet** | 1.9.4 | 🗺️ Mapas interativos | ✅ Estável |
| **i18next** | 25.4.2 | 🌍 Internacionalização | ✅ Estável |
| **Chart.js** | 4.5.0 | 📈 Gráficos avançados | ✅ Estável |
| **Radix UI** | Latest | 🎛️ Componentes acessíveis | ✅ Estável |

<div align="center">
  <h4>⚙️ Backend & Integração</h4>
</div>

| Tecnologia | Versão | Propósito | Status |
|------------|--------|-----------|--------|
| **Express** | 4.18.2 | 🌐 Servidor web | ✅ Estável |
| **Node.js** | 18.0.0+ | 🚀 Runtime JavaScript | ✅ Estável |
| **WebSocket** | 8.14.2 | 🔄 Comunicação em tempo real | ✅ Estável |
| **SimConnect** | 4.0.0 | 🎮 Integração MSFS 2024 | ✅ Estável |
| **JWT** | 9.0.2 | 🔐 Autenticação | ✅ Estável |

---

## ✨ Funcionalidades Principais

### 🏠 Dashboard Inteligente

> **Visão 360° da sua carreira de piloto**

- 📊 **Estatísticas em Tempo Real** - Horas totais, voos realizados, conquistas
- 📈 **Gráficos Interativos** - Visualização de progresso com Recharts
- ⚡ **Ações Rápidas** - Acesso direto às funcionalidades mais usadas
- 🌅 **Saudações Dinâmicas** - Sistema personalizado baseado no horário
- 🎯 **Metas Visíveis** - Progresso das suas conquistas em destaque

### ✈️ Gerenciamento de Voos

> **Controle total dos seus voos**

- 📝 **Registro Detalhado** - Aeroportos, aeronaves, duração, distância
- ✅ **Validação Inteligente** - Verificação automática de dados
- 🔍 **Histórico Completo** - Busca avançada e filtros personalizados
- 📊 **Estatísticas Automáticas** - Cálculo de horas, voos perfeitos, médias
- 🗺️ **Mapa de Rotas** - Visualização geográfica dos voos realizados

### 💰 Sistema Financeiro Avançado

> **Gestão financeira profissional**

- 💳 **Controle Total** - Receitas, despesas e categorias personalizáveis
- 📈 **Análise Profunda** - Margem de lucro, ROI, indicadores financeiros
- ⚡ **Integração Automática** - Cálculo de CR (Custo por Hora) baseado em voos
- 📊 **Relatórios Visuais** - Gráficos e estatísticas em tempo real
- 🎯 **Metas Financeiras** - Acompanhamento de objetivos monetários

### 🎯 Sistema de Metas & Conquistas

> **Gamificação da sua carreira**

- 🏆 **Metas Personalizadas** - Horas de voo, número de voos, conquistas
- 📊 **Progresso Visual** - Barras de progresso e indicadores coloridos
- 🎮 **Sistema de Conquistas** - Badges e marcos de carreira
- 🚀 **Motivação Contínua** - Acompanhamento de objetivos de longo prazo
- 📈 **Análise de Performance** - Estatísticas de progresso ao longo do tempo

### ⚙️ Configurações Avançadas

> **Personalização completa**

- 🎨 **Temas Personalizados** - Interface adaptável às suas preferências
- 🌍 **Multilíngue** - Suporte completo para português e inglês
- 🔔 **Notificações Inteligentes** - Alertas personalizáveis
- 💼 **Categorias Financeiras** - Gerenciamento completo de receitas/despesas
- ☁️ **Sincronização** - Backup automático e restauração de dados
- ✈️ **Aeronaves Customizadas** - Cadastro de aeronaves com taxas horárias
- 📊 **Status de Voo** - Status personalizados com multiplicadores de CR

### 🛠️ Sistema de Manutenção

> **Gestão completa de manutenção de aeronaves**

- 🔧 **Registros Detalhados** - Histórico completo de manutenções
- 📋 **Categorias Organizadas** - Motor, avionics, estrutura, sistemas
- 👨‍🔧 **Controle de Mecânicos** - Registro de profissionais e licenças
- 💰 **Custos de Manutenção** - Controle financeiro integrado
- 📅 **Agendamento** - Próximas manutenções e intervalos
- 🏷️ **Status e Prioridades** - Organização por urgência

### 🎮 Integração MSFS 2024

> **Conexão direta com Microsoft Flight Simulator**

- 🔄 **Tracking Automático** - Voos detectados automaticamente via SimConnect
- 📊 **Telemetria Completa** - Dados de voo em tempo real (altitude, velocidade, posição)
- 🗺️ **Resolução de Aeroportos** - Identificação automática de ICAOs e aeroportos
- 📈 **Estatísticas Avançadas** - Métricas detalhadas de performance de voo
- 🛩️ **Histórico Integrado** - Voos MSFS automaticamente no dashboard principal
- 🎛️ **Companion Service** - Serviço dedicado para comunicação com o simulador
- 📡 **WebSocket Real-time** - Comunicação bidirecional em tempo real

### 🛠️ Ferramentas de Desenvolvimento

> **Utilitários para desenvolvedores e usuários avançados**

- 🔍 **Airport Search Tool** - Ferramenta de busca avançada de aeroportos
- 🧮 **TOD Calculator** - Calculadora de Top of Descent para voos IFR
- 📊 **Flight Planner** - Planejador de voos com cálculos automáticos
- 🗺️ **Flight Maps** - Visualização de rotas em mapas interativos
- 📈 **Real-time Tracking** - Monitoramento de voos em tempo real
- 🔧 **Diagnostic Tools** - Ferramentas de diagnóstico e debug do sistema
- 📱 **Responsive Testing** - Testes de responsividade em diferentes dispositivos

---

## 🌐 **Deploy & Cloud**

### 🚀 **Cloudflare Pages**

O projeto está hospedado no **Cloudflare Pages** com:

- ✅ **Deploy automático** a cada push na branch main
- 🌍 **CDN global** para performance máxima
- 🔒 **SSL automático** e segurança avançada
- 📊 **Analytics integrados** para monitoramento
- 🎯 **Preview URLs** para cada PR

**🔗 Link do projeto:** [https://flight-log-opus.pages.dev](https://flight-log-opus.pages.dev)

---

## 🔄 **Mudanças Recentes**

### 📅 **Atualização Janeiro 2025**

- ✅ **Stack Atualizada**: Atualização para as versões mais recentes do React (18.3.1), TypeScript (5.8.3) e Vite (5.4.19)
- ✅ **Integração MSFS Completa**: Sistema companion totalmente funcional com SimConnect para tracking automático de voos
- ✅ **Ferramentas Avançadas**: Implementação de calculadoras TOD, planejador de voos e ferramentas de diagnóstico
- ✅ **Sistema de Testes**: Configuração completa do Jest com cobertura de testes e modo watch
- ✅ **Otimização de Performance**: Implementação de virtualização para listas grandes e otimizações de renderização
- ✅ **Melhoria na Arquitetura**: Organização melhorada dos componentes e hooks com separação clara de responsabilidades

### 📅 **Consolidação & Globalização - Dezembro 2024**

- ✅ **Internacionalização Completa**: Implementação total de i18n (PT-BR/EN-US) com suporte a formatação de moeda e data regional
- ✅ **Gestão de Carreira & Perfil**: Integração profunda entre estatísticas financeiras e rating de carreira (CR) no perfil do usuário
- ✅ **Refatoração de Tipagem**: Eliminação de tipos implícitos `any` e melhoria na segurança de tipos em todo o projeto
- ✅ **Estabilidade de Runtime**: Correção de erros críticos de lifecycle (hooks) em componentes de gráficos e modais
- ✅ **Otimização de Dashboards**: Gráficos Recharts agora são totalmente reativos e seguem o tema do sistema

---

## 📚 **Documentação**

### 📖 **Guias Rápidos**

- **[📋 Setup do Supabase](docs/guides/SUPABASE_SETUP_GUIDE.md)** - Configuração inicial do banco
- **[🎮 Integração MSFS](docs/guides/MSFS_INTEGRATION_GUIDE.md)** - Configuração do Flight Simulator
- **[📡 Flight Tracking](docs/guides/FLIGHT_TRACKING_SETUP.md)** - Setup do sistema de tracking
- **[🗺️ Sistema de Aeroportos](docs/guides/AIRPORT_SEARCH_SYSTEM.md)** - Documentação do sistema de aeroportos
- **[🗺️ API Financeira](docs/api/FINANCIAL_SYSTEM_API.md)** - Documentação da API financeira
- **[🎛️ Sistema de Configuração](docs/api/FLIGHT_CONFIGURATION_SYSTEM.md)** - API de configurações

### 🔧 **Documentação Técnica**

- **[📊 Análise do Projeto](docs/project/PROJETO_ANALISE.md)** - Visão geral técnica
- **[🏗️ Estrutura do Projeto](docs/project/PROJECT_STRUCTURE.md)** - Organização de código
- **[🎯 Próximos Passos](docs/project/PROXIMOS_PASSOS.md)** - Roadmap técnico
- **[🎨 Sistema de Animações](docs/features/ANIMACOES_CSS.md)** - Animações CSS/JS
- **[🌍 Sistema i18n](docs/features/SISTEMA_I18N.md)** - Internacionalização

### 🐛 **Correções e Melhorias**

- **[🔧 Correções de Header](docs/fixes/CORRECOES_HEADER.md)** - Melhorias na interface
- **[⚡ Otimização de Cache](docs/fixes/OPTIMIZATION_AIRPORT_CACHE.md)** - Performance de aeroportos
- **[📋 Lista Virtualizada](docs/fixes/BUGFIX-VirtualizedList.md)** - Correções de performance

---

## 🤝 **Contribuindo**

1. **Fork** o projeto
2. **Crie** uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. **Commit** suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. **Push** para a branch (`git push origin feature/AmazingFeature`)
5. **Abra** um Pull Request

---

## 📝 **Licença**

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

---

<div align="center">
  <p><strong>✈️ Desenvolvido com ❤️ para a comunidade de aviação</strong></p>
  <p>
    <img src="https://img.shields.io/badge/Made%20with-React-61DAFB?style=flat-square&logo=react&logoColor=white" alt="React" />
    <img src="https://img.shields.io/badge/Made%20with-TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript" />
    <img src="https://img.shields.io/badge/Hosted%20on-Cloudflare-F38020?style=flat-square&logo=cloudflare&logoColor=white" alt="Cloudflare" />
  </p>
</div>
