# Estrutura do Projeto - Flight Log Opus

Este documento descreve a estrutura organizacional do projeto Flight Log Opus, seguindo as melhores práticas de arquitetura de software.

## 📁 Visão Geral da Estrutura

```
flight-log-opus/
├── src/                          # Frontend React/TypeScript
│   ├── app/                      # Configurações e inicialização
│   ├── processes/                # Processos de negócio complexos
│   ├── pages/                    # Páginas da aplicação
│   ├── widgets/                  # Componentes complexos compostos
│   ├── features/                 # Funcionalidades por domínio
│   │   ├── auth/                 # Autenticação e autorização
│   │   ├── flights/              # Gestão de voos
│   │   ├── financial/            # Sistema financeiro
│   │   ├── maintenance/          # Manutenção de aeronaves
│   │   ├── career/               # Progressão de carreira
│   │   ├── maps/                 # Mapas e navegação
│   │   └── profile/              # Perfil do usuário
│   ├── entities/                 # Entidades de domínio
│   └── shared/                   # Código compartilhado
│       ├── ui/                   # Componentes UI reutilizáveis
│       ├── lib/                  # Bibliotecas e utilitários
│       ├── api/                  # Clientes de API
│       ├── config/               # Configurações
│       ├── types/                # Tipos TypeScript
│       ├── hooks/                # React hooks customizados
│       └── utils/                # Funções utilitárias
├── backend/                      # Backend Node.js/TypeScript
│   ├── src/
│   │   ├── controllers/          # Controladores da API
│   │   ├── models/               # Modelos de dados
│   │   ├── middleware/           # Middleware Express
│   │   ├── validators/           # Validações de entrada
│   │   ├── config/               # Configurações do servidor
│   │   └── utils/                # Utilitários do backend
│   ├── routes/                   # Rotas da API
│   └── services/                 # Serviços de negócio
├── companion/                    # Aplicação companion MSFS
├── docs/                         # Documentação do projeto
│   ├── api/                      # Documentação de APIs
│   ├── guides/                   # Guias de instalação e uso
│   ├── database/                 # Documentação do banco de dados
│   ├── deployment/               # Guias de deployment
│   └── development/              # Guias de desenvolvimento
├── scripts/                      # Scripts de automação
│   ├── debug/                    # Scripts de debug
│   ├── database/                 # Scripts de banco de dados
│   └── deployment/               # Scripts de deployment
├── database/                     # Arquivos SQL e migrações
├── config/                       # Configurações do projeto
├── public/                       # Assets públicos
└── data/                         # Dados externos (CSV, etc.)
```

## 🏗️ Arquitetura Frontend (Feature-Sliced Design)

### Camadas (de cima para baixo)

1. **app/** - Configurações e inicialização da aplicação
   - Configuração de rotas
   - Providers de contexto
   - Estilos globais

2. **processes/** - Processos de negócio complexos
   - Fluxos de trabalho multi-etapa
   - Orquestração de features

3. **pages/** - Páginas completas da aplicação
   - Componentes de página
   - Layouts específicos de página

4. **widgets/** - Componentes complexos compostos
   - Dashboards
   - Formulários complexos
   - Visualizações de dados

5. **features/** - Funcionalidades por domínio
   - **auth/** - Login, registro, autorização
   - **flights/** - CRUD de voos, tracking
   - **financial/** - Transações, relatórios financeiros
   - **maintenance/** - Registro de manutenção
   - **career/** - Progressão, conquistas
   - **maps/** - Visualização de mapas
   - **profile/** - Gestão de perfil

6. **entities/** - Entidades de domínio
   - Tipos de dados principais
   - Modelos de dados

7. **shared/** - Código compartilhado
   - **ui/** - Componentes reutilizáveis (botões, inputs, etc.)
   - **lib/** - Bibliotecas externas configuradas
   - **api/** - Clientes de API e serviços
   - **config/** - Configurações compartilhadas
   - **types/** - Tipos TypeScript globais
   - **hooks/** - React hooks customizados
   - **utils/** - Funções utilitárias puras

## 🏗️ Arquitetura Backend (MVC Pattern)

### Estrutura MVC

- **controllers/** - Lógica de controle e resposta HTTP
- **models/** - Modelos de dados e interação com banco
- **middleware/** - Middleware para autenticação, validação, etc.
- **validators/** - Validação de entrada de dados
- **config/** - Configurações do servidor e ambiente
- **utils/** - Funções auxiliares do backend

## 📋 Convenções de Nomenclatura

### Arquivos
- **Componentes**: PascalCase (ex: `FlightCard.tsx`)
- **Hooks**: camelCase com prefixo 'use' (ex: `useAuth.ts`)
- **Utilitários**: camelCase (ex: `formatDate.ts`)
- **Tipos**: PascalCase com sufixo 'Type' (ex: `FlightType.ts`)
- **Constantes**: UPPER_SNAKE_CASE (ex: `API_ENDPOINTS.ts`)

### Pastas
- **features/**: kebab-case (ex: `flight-tracking`)
- **Componentes**: kebab-case (ex: `flight-card`)

## 🚀 Como Começar

### Desenvolvimento Frontend
```bash
cd flight-log-opus
npm install
npm run dev
```

### Desenvolvimento Backend
```bash
cd backend
npm install
npm run dev
```

### Companion MSFS
```bash
cd companion
npm install
npm run dev
```

## 📚 Recursos Adicionais

- [Guia de Instalação](docs/guides/FLIGHT_TRACKING_SETUP.md)
- [Configuração Supabase](docs/guides/SUPABASE_SETUP_GUIDE.md)
- [Integração MSFS](docs/guides/MSFS_INTEGRATION_GUIDE.md)
- [API Documentation](docs/api/)
- [Database Schema](docs/database/)