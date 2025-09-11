# ✈️ Flight Log Opus

<div align="center">
  <img src="https://img.shields.io/badge/React-18.3.1-61DAFB?style=for-the-badge&logo=react&logoColor=white" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5.6.2-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white" alt="Supabase" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind" />
</div>

<div align="center">
  <h3>🎯 Sistema completo de gerenciamento de voos para pilotos profissionais</h3>
  <p>Interface moderna inspirada em cockpits de aviação com tema HUD (Heads-Up Display)</p>
  
  **[🚀 Acesse o projeto online](https://flight-log-opus.pages.dev)**
</div>

---

## 📁 **Nova Estrutura do Projeto**

O projeto foi completamente reorganizado seguindo as melhores práticas de organização de código e arquitetura limpa.

### 🏗️ **Frontend - Arquitetura FSD (Feature Sliced Design)**

```
src/
├── app/           # Configuração e inicialização da aplicação
├── processes/     # Processos de negócio complexos
├── pages/         # Páginas da aplicação
├── widgets/       # Componentes complexos reutilizáveis
├── features/      # Funcionalidades independentes
├── entities/      # Modelos de dados e entidades
└── shared/        # Código compartilhado (UI, utils, types)
```

### 🏢 **Backend - Arquitetura MVC**

```
backend/src/
├── controllers/   # Controladores REST
├── models/        # Modelos de dados
├── middleware/    # Middlewares
├── validators/    # Validações
├── config/        # Configurações
└── utils/         # Utilitários
```

### 📚 **Organização de Documentação**

```
docs/
├── api/           # Documentação de APIs
├── guides/        # Guias e tutoriais
├── database/      # Documentação de banco de dados
├── deployment/    # Guias de deployment
└── development/   # Documentação de desenvolvimento
```

### 🔧 **Scripts Organizados**

```
scripts/
├── debug/         # Scripts de debug e teste
├── database/      # Scripts de banco de dados
└── deployment/    # Scripts de deployment
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
| Node.js | 22.16.0+ | ✅ Obrigatório |
| npm | 10.9.2+ | 🚀 Recomendado |

### 🛠️ Scripts Disponíveis

| Comando | Descrição | Uso |
|---------|-----------|-----|
| `npm run dev` | 🔥 Servidor de desenvolvimento | Desenvolvimento local |
| `npm run build` | 📦 Build de produção | Deploy |
| `npm run preview` | 👀 Preview do build | Teste pré-deploy |
| `npm run lint` | 🔍 Análise de código | Qualidade |

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

- 🔄 **Tracking Automático** - Voos detectados automaticamente
- 📊 **Telemetria Completa** - Dados de voo em tempo real
- 🗺️ **Resolução de Aeroportos** - Identificação automática de ICAOs
- 📈 **Estatísticas Avançadas** - Métricas detalhadas de performance
- 🛩️ **Histórico Integrado** - Voos MSFS no dashboard principal

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

### 📅 **Reorganização Completa - 2024**

- ✅ **Estrutura FSD** implementada no frontend
- ✅ **Arquitetura MVC** aplicada no backend  
- ✅ **Documentação reorganizada** em `/docs`
- ✅ **Scripts organizados** por funcionalidade
- ✅ **Build otimizado** com Vite e TypeScript
- ✅ **Configurações centralizadas** em `/config`

---

## 📚 **Documentação**

### 📖 **Guias Rápidos**

- **[📋 Setup do Supabase](docs/guides/SUPABASE_SETUP_GUIDE.md)** - Configuração inicial do banco
- **[🗺️ API Financeira](docs/api/FINANCIAL_SYSTEM_API.md)** - Documentação da API
- **[🎨 Sistema de Animações](docs/ANIMACOES_CSS.md)** - Animações CSS/JS
- **[🌍 Sistema i18n](docs/SISTEMA_I18N.md)** - Internacionalização

### 🔧 **Documentação Técnica**

- **[📊 Análise do Projeto](docs/PROJETO_ANALISE.md)** - Visão geral técnica
- **[🏗️ Estrutura do Projeto](docs/PROJECT_STRUCTURE.md)** - Organização de código
- **[🎯 Próximos Passos](docs/PROXIMOS_PASSOS.md)** - Roadmap técnico

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
