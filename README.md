# ✈️ Flight Log Opus

> **Sistema Completo de Gerenciamento de Carreira para Piloto Virtual**

Um aplicativo web moderno para rastreamento e gerenciamento de carreira em simuladores de voo, especialmente Microsoft Flight Simulator 2024. Com design inspirado em cockpits modernos e displays aviônicos.

![Status](https://img.shields.io/badge/Status-Produção-brightgreen)
![Versão](https://img.shields.io/badge/Versão-2.0-blue)
![License](https://img.shields.io/badge/License-MIT-green)

## 🚀 Início Rápido

### Pré-requisitos
- Node.js 22.16.0+ ([Download](https://nodejs.org/))
- npm 10.9.2+

### Instalação e Execução

```bash
# 1. Clone o repositório
git clone <repository-url>
cd flight-log-opus

# 2. Instale as dependências
npm install

# 3. Inicie o servidor de desenvolvimento
npm run dev

# 4. Abra http://localhost:8080 no seu navegador
```

### Scripts Disponíveis

```bash
npm run dev      # 🚀 Servidor de desenvolvimento
npm run build    # 🏗️  Build de produção
npm run preview  # 👀 Preview do build
npm run lint     # 🧹 Verificação de código
```


## 🛠️ Stack Tecnológico

**Frontend**
- ⚛️ React 18.3.1 + TypeScript
- 🏗️ Vite (Build tool ultrarrápido)
- 🎨 TailwindCSS + Design System customizado
- 🧩 shadcn/ui (Componentes Radix UI)
- 🛣️ React Router DOM
- 📊 Recharts (Gráficos e visualizações)
- 🔄 TanStack Query (Gerenciamento de estado)
- 📝 React Hook Form + Zod

**Design System**
- 🎯 Tema cockpit/aviônico escuro
- 💙 Cores inspiradas em displays HUD
- 🔧 Componentes modulares e reutilizáveis
- 📱 Design responsivo

## ✨ Funcionalidades Implementadas

### 📊 Dashboard Principal
- **Estatísticas de Carreira**: Rating, total de voos, horas de voo
- **Gráficos de Progresso**: Evolução mensal de atividade
- **Voos Recentes**: Lista dos últimos voos realizados
- **Performance Dinâmica**: Cálculos em tempo real

### 🛫 Gerenciamento de Voos
- **Registro Completo**: Novos voos com validação
- **Histórico Detalhado**: Lista filtrada e pesquisável
- **Métricas Avançadas**: Landing rate, XP, CR, combustível
- **Status Dinâmicos**: Planejado, Em Voo, Completado, Cancelado
- **Aeronaves Customizáveis**: Sistema de cadastro personalizado

### 💰 Sistema Financeiro Completo
- **Receitas Diversificadas**: Além de voos (renda passiva, bônus, patrocínio)
- **Categorias de Despesas**: Combustível, manutenção, compras, etc.
- **Cálculos Dinâmicos**: Lucro líquido e margem em tempo real
- **Base Financeira**: 5.922.235 CR + CR dos voos + receitas extras
- **Gerenciamento**: CRUD completo de transações e categorias

### ⚙️ Configurações de Voo
- **Aeronaves Personalizadas**: Cadastro com taxa horária CR
- **Status Customizados**: Com multiplicadores de CR
- **Tipos de Aeronave**: 9 categorias (comercial, executiva, militar, etc.)
- **Integração Automática**: Aparece nos formulários de voo

### 🌍 Internacionalização
- **Bilingual**: Português (PT-BR) e Inglês (EN-US)
- **Toggle de Idioma**: Com bandeiras e persistência
- **Cobertura 99%**: Exceto termos técnicos de aviação

### 🎨 Tema e UX
- **Dark/Light Mode**: Com persistência e transições
- **Animações CSS**: Hover effects e transições suaves
- **Design HUD**: Inspirado em cockpits modernos
- **Responsivo**: Mobile-first design

### 🔄 Gerenciamento de Estado
- **localStorage**: Persistência local completa
- **Auto Refresh**: Atualização automática de componentes
- **Validação**: Zod + React Hook Form
- **Notificações**: Toast feedback instantâneo

## 🏗️ Estrutura do Projeto

```
flight-log-opus/
├── src/
│   ├── components/          # Componentes React
│   │   ├── career/        # Componentes de carreira
│   │   ├── dashboard/     # Componentes do dashboard
│   │   ├── flights/       # Componentes de voos
│   │   ├── financial/     # Componentes financeiros
│   │   ├── layout/        # Layout e navegação
│   │   └── ui/            # Componentes base (shadcn)
│   ├── contexts/          # Contextos React (AuthContext)
│   ├── db/                # Arquivos relacionados ao banco de dados
│   │   ├── supabase/      # Supabase específicos
│   │   │   ├── functions/ # Funções RPC
│   │   │   ├── schema/    # Definições de schema
│   │   │   └── fixes/     # Scripts de correção
│   │   ├── docs/          # Documentação do banco de dados
│   │   └── README.md      # Documentação da estrutura do BD
│   ├── hooks/             # Custom React hooks
│   ├── lib/               # Utilitários e cliente Supabase
│   ├── pages/             # Páginas da aplicação
│   ├── utils/             # Funções utilitárias
│   ├── App.tsx            # Componente raiz
│   └── main.tsx           # Ponto de entrada da aplicação
├── public/                # Assets estáticos
├── docs/                  # Documentação
├── CHANGELOG.md           # Registro de mudanças
└── PROJECT_STRUCTURE.md   # Documentação da estrutura
```

## 🎨 Design System

O projeto utiliza um design system único inspirado em cockpits modernos:

- **Background**: Navy blue escuro (`hsl(217 33% 6%)`)
- **Primary**: Azul radar HUD (`hsl(207 89% 42%)`)
- **Accent**: Amarelo alerta (`hsl(45 93% 58%)`)
- **Success**: Verde navegação (`hsl(120 60% 45%)`)
- **Glass Effects**: Painéis com efeito vidro e blur

## 🔧 Desenvolvimento

### Ambiente Local

```bash
# Instalar dependências
npm install

# Desenvolvimento com hot reload
npm run dev

# Build de produção
npm run build

# Preview do build
npm run preview

# Linting
npm run lint
```

### Estrutura de Dados

Atualmente o projeto utiliza dados mockados. Estrutura planejada:

```typescript
// Tipos principais
interface Flight {
  id: string;
  from: string;        // ICAO code
  to: string;          // ICAO code
  aircraft: string;
  date: Date;
  duration: number;    // em minutos
  distance: number;    // em milhas náuticas
  careerRating: number;
  status: 'planned' | 'active' | 'completed';
}

interface Pilot {
  id: string;
  name: string;
  totalFlights: number;
  totalHours: number;
  careerRating: number;
  worldRanking: number;
}
```


## 🛣️ Roadmap

### Fase 1 - Estruturação ✅
- [x] Setup do ambiente de desenvolvimento
- [x] Estrutura de componentes
- [x] Design system e tema
- [x] Roteamento básico

### Fase 2 - Dados Dinâmicos 🚫
- [ ] Substituição de dados mockados
- [ ] Sistema de gerenciamento de estado
- [ ] Formulários para entrada de dados
- [ ] Validação e persistência local

### Fase 3 - Backend/API 🚫
- [ ] Definição da arquitetura de API
- [ ] Autenticação de usuários
- [ ] CRUD de voos e pilotos
- [ ] Sistema de rankings

### Fase 4 - Funcionalidades Avançadas 🚫
- [ ] Sistema de metas e achievements
- [ ] Exportação de dados
- [ ] Integração com APIs de voo
- [ ] Modo offline (PWA)
- [ ] Notificações

### Fase 5 - Melhorias 🚫
- [ ] Testes automatizados
- [ ] Performance e otimizações
- [ ] Acessibilidade
- [ ] Internalização (i18n)

## 📱 Status do Projeto

**Ambiente**: ✅ Configurado e funcionando
**Servidor Local**: ✅ http://localhost:8080
**Build**: ✅ Vite funcionando
**UI Components**: ✅ shadcn/ui integrado
**Dados**: ✅ Sistema dinâmico com persistência
**Sistema Financeiro**: ✅ Completo e funcional
**Configurações**: ✅ Aeronaves e status personalizáveis
**Internacionalização**: ✅ PT-BR/EN-US
**Temas**: ✅ Dark/Light mode
**Banco de Dados**: ✅ Esquema completo e organizado
**Documentação**: ✅ Estrutura e procedimentos documentados
**Status Geral**: 🟢 **PRODUÇÃO**

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/amazing-feature`)
3. Commit suas mudanças (`git commit -m 'Add amazing feature'`)
4. Push para a branch (`git push origin feature/amazing-feature`)
5. Abra um Pull Request

## 📜 Documentação Adicional

- [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) - Estrutura completa do projeto
- [CHANGELOG.md](./CHANGELOG.md) - Histórico de alterações
- [src/db/README.md](./src/db/README.md) - Documentação da estrutura do banco de dados
- [src/db/docs/CORRECAO_DADOS_CARREIRA.md](./src/db/docs/CORRECAO_DADOS_CARREIRA.md) - Solução para problemas com dados de carreira
- [src/db/docs/SUPABASE_SETUP_INSTRUCTIONS.md](./src/db/docs/SUPABASE_SETUP_INSTRUCTIONS.md) - Instruções para configuração do Supabase
- [Componentes shadcn/ui](https://ui.shadcn.com/) - Documentação dos componentes
- [TailwindCSS](https://tailwindcss.com/) - Documentação do CSS framework
- [React Router](https://reactrouter.com/) - Roteamento
- [Recharts](https://recharts.org/) - Biblioteca de gráficos

## 🛠️ Troubleshooting

### Problemas Comuns

**Porta 8080 ocupada**
```bash
# Altere a porta no vite.config.ts ou mate o processo
lsof -ti:8080 | xargs kill -9  # macOS/Linux
netstat -ano | findstr :8080   # Windows
```

**Dependências com problemas**
```bash
# Reinstalação limpa
rm -rf node_modules package-lock.json
npm install
```

**Vulnerabilidades de segurança**
- As vulnerabilidades detectadas são apenas do ambiente de desenvolvimento
- Não afetam a aplicação em produção

## 📄 Licença

Este projeto está licenciado sob a [MIT License](./LICENSE).

---

**Desenvolvido com ❤️ para a comunidade de simulação de voo**

*Fly safe, fly smart! ✈️*
