# Estrutura do Projeto - Project Structure

## Visão Geral

Flight Log Opus é uma aplicação React moderna para gerenciamento de logs de voo, construída com TypeScript, Vite e shadcn-ui.

## Estrutura de Diretórios

```
flight-log-opus/
├── docs/                           # 📚 Documentação
│   ├── ANIMACOES_CSS.md            # Especificações de animações CSS
│   ├── CORRECOES_HEADER.md         # Correções de header
│   ├── FINANCIAL_SYSTEM_API.md     # API do sistema financeiro
│   ├── FLIGHT_CONFIGURATION_SYSTEM.md # Sistema de configuração de voos
│   ├── PROJETO_ANALISE.md          # Análise do projeto
│   ├── PROXIMOS_PASSOS.md          # Próximos passos
│   ├── README.md                   # README principal
│   ├── SISTEMA_I18N.md             # Sistema de internacionalização
│   └── TRADUCOES_ANIMACOES_COMPLETAS.md # Traduções e animações
│
├── public/                         # 🌐 Arquivos públicos
│   ├── icons/                      # Ícones da aplicação
│   ├── manifest.json              # Manifest PWA
│   └── sw.js                      # Service Worker
│
├── src/                           # 💻 Código fonte
│   ├── components/                # 🧩 Componentes React
│   │   ├── financial/             # 💰 Componentes financeiros
│   │   │   ├── AddExpenseModal.tsx
│   │   │   ├── AddRevenueModal.tsx
│   │   │   ├── ExpenseCategoriesManager.tsx
│   │   │   ├── ExpensesList.tsx
│   │   │   ├── RevenueCategoriesManager.tsx
│   │   │   └── RevenuesList.tsx
│   │   │
│   │   ├── flight/                # ✈️ Componentes de voo
│   │   │   └── FlightConfigManager.tsx
│   │   │
│   │   ├── flights/               # 📋 Componentes de voos
│   │   │   ├── AddFlightModal.tsx
│   │   │   ├── FlightCard.tsx
│   │   │   └── FlightStats.tsx
│   │   │
│   │   ├── layout/                # 🏗️ Layout e navegação
│   │   │   ├── AppLayout.tsx
│   │   │   ├── Navigation.tsx
│   │   │   └── Sidebar.tsx
│   │   │
│   │   ├── shared/                # 🔄 Componentes compartilhados
│   │   │   ├── LanguageToggle.tsx
│   │   │   ├── StatsCard.tsx
│   │   │   └── ThemeToggle.tsx
│   │   │
│   │   └── ui/                    # 🎨 Componentes UI base (shadcn-ui)
│   │       ├── alert-dialog.tsx
│   │       ├── badge.tsx
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── collapsible.tsx
│   │       ├── dialog.tsx
│   │       ├── dropdown-menu.tsx
│   │       ├── input.tsx
│   │       ├── label.tsx
│   │       ├── select.tsx
│   │       ├── switch.tsx
│   │       ├── tabs.tsx
│   │       ├── textarea.tsx
│   │       └── toast.tsx
│   │
│   ├── hooks/                     # 🎣 Custom React Hooks
│   │   ├── useAircraftManager.ts  # Gerenciamento de aeronaves
│   │   ├── useExpenseCategories.ts # Categorias de despesa
│   │   ├── useFinancial.ts        # Sistema financeiro
│   │   ├── useFlights.ts          # Gerenciamento de voos
│   │   ├── useFlightStatusManager.ts # Status de voo
│   │   ├── useGoals.ts            # Gerenciamento de metas
│   │   ├── useRevenueCategories.ts # Categorias de receita
│   │   ├── useTheme.ts            # Gerenciamento de tema
│   │   └── use-toast.ts           # Sistema de notificações
│   │
│   ├── lib/                       # 📚 Bibliotecas e utilitários
│   │   ├── i18n.ts               # Configuração i18next
│   │   └── utils.ts              # Utilitários gerais
│   │
│   ├── pages/                     # 📄 Páginas da aplicação
│   │   ├── Dashboard.tsx          # Dashboard principal
│   │   ├── Financial.tsx          # Página financeira
│   │   ├── Flights.tsx           # Lista de voos
│   │   ├── Goals.tsx             # Metas e objetivos
│   │   ├── History.tsx           # Histórico
│   │   ├── NotFound.tsx          # Página 404
│   │   ├── Profile.tsx           # Perfil do usuário
│   │   ├── Ranking.tsx           # Rankings
│   │   └── Settings.tsx          # Configurações
│   │
│   ├── utils/                     # 🔧 Utilitários
│   │   └── autoRefresh.ts        # Auto refresh utility
│   │
│   ├── App.css                   # Estilos globais da app
│   ├── App.tsx                   # Componente raiz
│   ├── index.css                 # Estilos CSS globais
│   ├── main.tsx                  # Entry point
│   └── vite-env.d.ts            # Tipos do Vite
│
├── .gitignore                    # Git ignore rules
├── components.json               # Configuração shadcn-ui
├── eslint.config.js             # Configuração ESLint
├── index.html                   # Template HTML
├── package.json                 # Dependências e scripts
├── postcss.config.js            # Configuração PostCSS
├── tailwind.config.ts           # Configuração Tailwind
├── tsconfig.json                # Configuração TypeScript
└── vite.config.ts              # Configuração Vite
```

## Tecnologias Principais

### Core
- **React 18.3.1**: Framework principal
- **TypeScript 5.8.3**: Tipagem estática
- **Vite 5.4.19**: Build tool e dev server

### UI/UX
- **shadcn-ui**: Componentes UI acessíveis
- **Tailwind CSS 3.4.17**: Utility-first CSS
- **Lucide React**: Ícones SVG
- **Recharts 2.15.4**: Gráficos e visualizações

### Estado e Dados
- **React Query 5.83.0**: Gerenciamento de estado servidor
- **React Hook Form 7.61.1**: Formulários performáticos
- **Zod 3.25.76**: Validação de schemas

### Roteamento e i18n
- **React Router 6.30.1**: Roteamento SPA
- **react-i18next**: Internacionalização

### Notificações
- **Sonner 1.7.4**: Toast notifications

## Padrões Arquiteturais

### 1. Organização por Feature
```
components/
├── financial/     # Todos os componentes financeiros
├── flights/       # Todos os componentes de voos
├── flight/        # Configuração de voos
└── ui/           # Componentes base reutilizáveis
```

### 2. Custom Hooks Pattern
```typescript
// hooks/useFinancial.ts
export const useFinancial = () => {
  // Lógica de negócio encapsulada
  return { addRevenue, addExpense, getStats };
};
```

### 3. Component Composition
```typescript
// Componentes compostos e reutilizáveis
<Dialog>
  <DialogTrigger />
  <DialogContent>
    <DialogHeader />
    <DialogFooter />
  </DialogContent>
</Dialog>
```

### 4. TypeScript Interfaces
```typescript
interface Transaction {
  id: string;
  type: 'revenue' | 'expense';
  amount: number;
  date: string;
}
```

## Funcionalidades por Módulo

### 📊 Dashboard
- Estatísticas principais
- Gráficos de performance
- Voos recentes
- Metas em andamento

### ✈️ Flights (Voos)
- Listagem e busca de voos
- Formulário de adição/edição
- Filtros por status
- Estatísticas de voo

### 💰 Financial (Financeiro)
- Sistema dual: receitas + despesas
- Categorias personalizáveis
- Cálculos automáticos
- Relatórios de performance

### 🎯 Goals (Metas)
- Criação de objetivos
- Tracking de progresso
- Diferentes tipos de meta

### ⚙️ Settings (Configurações)
- Configurações de voo (aeronaves + status)
- Categorias financeiras
- Preferências do app
- Gerenciamento de dados

### 👤 Profile (Perfil)
- Informações do usuário: "Cmdte. Rodrigo"
- Estatísticas pessoais
- Histórico de atividades

## Convenções de Código

### Naming
- **Componentes**: PascalCase (`AddFlightModal`)
- **Hooks**: camelCase com prefixo `use` (`useFinancial`)
- **Arquivos**: PascalCase para componentes, camelCase para utils
- **Interfaces**: PascalCase (`Transaction`, `Flight`)

### Estrutura de Componentes
```typescript
// 1. Imports
import { useState } from 'react';
import { Button } from '@/components/ui/button';

// 2. Interfaces/Types
interface Props {
  title: string;
}

// 3. Component
export const Component = ({ title }: Props) => {
  // 4. Hooks
  const [state, setState] = useState();
  
  // 5. Functions
  const handleClick = () => {};
  
  // 6. Render
  return <div>{title}</div>;
};
```

### Import Aliases
```typescript
// Configurado no tsconfig.json
import { Button } from '@/components/ui/button';
import { useFlights } from '@/hooks/useFlights';
```

## Persistência de Dados

### localStorage Keys
```javascript
// Voos
'msfs-flights'

// Financeiro
'msfs-financial-expenses'
'msfs-financial-revenues'
'msfs-expense-categories'
'msfs-revenue-categories'

// Configurações
'msfs-custom-aircraft'
'msfs-flight-status'

// UI/UX
'ui-theme'
'ui-language'
```

## Scripts Disponíveis

```bash
npm run dev        # Servidor de desenvolvimento
npm run build      # Build de produção
npm run preview    # Preview do build
npm run lint       # Linting com ESLint
```

## PWA Features

- **Service Worker**: `public/sw.js`
- **Manifest**: `public/manifest.json`
- **Offline**: Funcionalidade básica offline
- **Install**: Pode ser instalado como app

## Acessibilidade

- **ARIA**: Labels e roles apropriados
- **Keyboard**: Navegação por teclado
- **Screen Readers**: Compatibilidade
- **Contrast**: Cores acessíveis

## Performance

- **Code Splitting**: Lazy loading de rotas
- **Tree Shaking**: Eliminação de código morto
- **Bundle Optimization**: Vite otimização
- **Memoization**: React.memo onde necessário

---

**Última Atualização**: Agosto 2025  
**Versão da Estrutura**: 2.0  
**Status**: 🟢 Estável e Organizada