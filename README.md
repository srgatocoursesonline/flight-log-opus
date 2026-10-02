# ✈️ Flight Log Opus

<div align="center">
  <img src="https://img.shields.io/badge/React-18.3.1-61DAFB?style=for-the-badge&logo=react&logoColor=white" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5.8.3-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Vite-5.4.19-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-3.4.17-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind" />
  <img src="https://img.shields.io/badge/PostgreSQL-16-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js" />
</div>

<div align="center">
  <h3>🎯 Sistema completo de gerenciamento de voos para pilotos</h3>
  <p>Interface moderna inspirada em cockpits de aviação com tema HUD (Heads-Up Display)</p>

  **[🚀 Produção](https://fs.rsolutionsbr.com)** — self-hosted em VPS própria
</div>

---

## 📌 Visão Geral

O Flight Log Opus é uma plataforma completa de gestão de carreira de piloto: registro de voos, financeiro, metas, manutenção de aeronaves e integração com o Microsoft Flight Simulator 2024.

O projeto **migrou do Supabase para infraestrutura própria**: o backend agora roda em uma VPS com PostgreSQL 16 local, exposto por um **gateway compatível com a API do Supabase** (mesmo contrato `/auth/v1`, `/rest/v1` e `/storage/v1`), o que permitiu manter o frontend sem reescrita.

## 🏗️ Arquitetura

```
┌──────────┐     HTTPS      ┌───────────────┐
│ Browser  │ ─────────────► │ nginx (TLS)   │
└──────────┘                └──────┬────────┘
                                   │
              ┌────────────────────┼─────────────────────┐
              │                    │                     │
      frontend estático    /auth/v1 /rest/v1       /api (serviços)
      (Vite build)         /storage/v1 (proxy)     auxiliares
              │                    │                     │
              │            ┌───────▼───────┐     ┌───────▼────────┐
              │            │ gateway  :4001│◄────┤ backend  :4002 │
              │            │ (compatível   │     │ aeroportos,    │
              │            │  Supabase API)│     │ cache, MSFS    │
              │            └───────┬───────┘     └────────────────┘
              │                    │
              │            ┌───────▼────────┐        ┌──────────────┐
              └────────────│ PostgreSQL :5433│        │ companion    │
                           │ (RLS + roles    │        │ MSFS SimConnect│
                           │  Supabase-like) │        └──────────────┘
                           └────────────────┘
```

- **Gateway** (`gateway/`) — API compatível Supabase na porta `4001`: autenticação própria (JWT + refresh tokens com rotação, senhas com `pgcrypto`), PostgREST-like sobre o PostgreSQL e storage. Transações de auth rodam como `service_role` (BYPASSRLS), espelhando o GoTrue.
- **Backend** (`backend/`) — API Express na porta `4002`: busca de aeroportos (76k+ com cache), integração MSFS e serviços auxiliares. Consome o gateway local como se fosse o Supabase.
- **Frontend** (raiz, `src/`) — SPA React + Vite + Tailwind + shadcn/ui, servida estaticamente pelo nginx.
- **Companion** (`companion/`) — serviço de integração com o MSFS 2024 via SimConnect, com telemetria em tempo real por WebSocket.

## 📁 Estrutura do Repositório

```
├── src/                 # Frontend React (componentes, hooks, páginas, contexts)
├── gateway/             # API compatível Supabase (auth, rest, storage) — porta 4001
├── backend/             # API Express (aeroportos, MSFS tracking) — porta 4002
├── companion/           # Integração MSFS 2024 (SimConnect)
├── migration/           # Migração Supabase → PostgreSQL próprio
│   ├── 01_export_from_supabase.sh   # dumps separados (schema public + tabelas auth)
│   ├── 02_restore_to_postgres.sh    # restore v4 (snapshot → drop → restore → grants)
│   ├── 03_validate.sh               # validação pós-migração
│   └── bootstrap/                   # roles, funções auth.*, types, grants, RLS
├── database/            # SQL estrutural (core, migrations, triggers, views)
├── deploy/              # ecosystem.config.cjs (PM2)
├── docs/                # Documentação técnica organizada
└── supabase/            # Configurações legadas do Supabase
```

## 🖥️ Produção (VPS)

| Componente | Detalhe |
|------------|---------|
| Domínio | `https://fs.rsolutionsbr.com` (TLS Let's Encrypt) |
| Reverse proxy | nginx — serve o frontend estático e faz proxy de `/auth/v1`, `/rest/v1`, `/storage/v1` para o gateway |
| Gateway | PM2 `flightlog-gateway` — porta `4001` |
| Backend | PM2 `flightlog-api` — porta `4002` (+ WebSocket) |
| Banco | PostgreSQL 16, porta `5433`, banco `flight_log_opus` |
| Roles | `flightlog_app` (owner) / `flightlog_conn` (conexão), com roles `anon` / `authenticated` / `service_role` e RLS ativa |
| Frontend | `VITE_SUPABASE_URL=https://fs.rsolutionsbr.com` (mesma origem, sem CORS) |
| SMTP | Opcional — sem SMTP, signup auto-confirma e recovery gera token no banco |

Variáveis do gateway (ver `gateway/.env.example`): `DATABASE_URL`, `JWT_SECRET`, `ANON_KEY`, `SERVICE_KEY`, `ACCESS_TOKEN_EXPIRES_IN`, `LOGIN_RATE_LIMIT_*` e `SMTP_*`.

## 🔄 Migração Supabase → PostgreSQL

O diretório `migration/` contém o processo completo e idempotente:

```bash
cd migration

# 1. Exporta do Supabase (dumps custom separados: schema public + tabelas auth)
export SUPABASE_DB_URL='postgres://...'
./01_export_from_supabase.sh

# 2. Restaura no PostgreSQL local:
#    snapshot local → DROP CASCADE → re-extensões (schema extensions)
#    → funções auth.* → restore public + auth → reinsert snapshot
#    → grants/RLS/compat → ANALYZE → validação
./02_restore_to_postgres.sh

# 3. Validação (executada automaticamente ao final do restore)
./03_validate.sh
```

Após o restore: `pm2 restart flightlog-gateway` (recarrega a introspecção de schema) e `shred -u` nos dumps (contêm dados sensíveis).

## 🚀 Desenvolvimento Local

### Pré-requisitos

| Ferramenta | Versão |
|------------|--------|
| Node.js | 18.0.0+ |
| npm | 9.0.0+ |
| PostgreSQL | 16 (porta 5433) |

### Frontend

```bash
git clone https://github.com/srgatocoursesonline/flight-log-opus.git
cd flight-log-opus
npm install
npm run dev          # http://localhost:8080
```

### Gateway

```bash
cd gateway
cp .env.example .env   # configure DATABASE_URL, JWT_SECRET, ANON_KEY, SERVICE_KEY
npm install
npm run build
node dist/index.js     # http://localhost:4001
```

### Backend

```bash
cd backend
cp .env.example .env   # aponte SUPABASE_URL para o gateway local
npm install && npm run build && npm start   # http://localhost:4002
```

### Scripts do Frontend

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | 🔥 Servidor de desenvolvimento (Vite, porta 8080) |
| `npm run build` | 📦 Build de produção |
| `npm run preview` | 👀 Preview do build |
| `npm run lint` | 🔍 Análise de código |
| `npm run test` | 🧪 Testes unitários (Jest) |
| `npm run test:coverage` | 📊 Cobertura de testes |

## ✨ Funcionalidades

- **🏠 Dashboard inteligente** — estatísticas em tempo real, gráficos interativos, metas em destaque e ações rápidas
- **✈️ Gestão de voos** — registro detalhado, busca avançada, cálculo automático de horas/distâncias, mapa de rotas e busca integrada de aeroportos (76k+)
- **💰 Sistema financeiro** — receitas/despesas, categorias personalizáveis, CR (custo por hora), ROI e relatórios visuais
- **🎯 Metas e conquistas** — gamificação da carreira com progresso visual e badges
- **🛠️ Manutenção** — registros por categoria (motor, avionics, estrutura), mecânicos, custos e agendamento
- **🎮 Integração MSFS 2024** — tracking automático via SimConnect, telemetria em tempo real e histórico integrado
- **⚙️ Configurações** — temas, PT-BR/EN-US (i18n), aeronaves customizadas e status de voo com multiplicadores

## 📚 Documentação

- **[Índice da documentação](docs/INDEX.md)**
- **[Setup do banco](docs/guides/SUPABASE_SETUP_GUIDE.md)** — configuração inicial
- **[Integração MSFS](docs/guides/MSFS_INTEGRATION_GUIDE.md)** — configuração do simulador
- **[Flight tracking](docs/guides/FLIGHT_TRACKING_SETUP.md)** — sistema de tracking
- **[Sistema de aeroportos](docs/guides/AIRPORT_SEARCH_SYSTEM.md)** — busca e cache
- **[API financeira](docs/api/FINANCIAL_SYSTEM_API.md)** — endpoints financeiros

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

---

<div align="center">
  <p><strong>✈️ Desenvolvido com ❤️ para a comunidade de aviação</strong></p>
</div>
