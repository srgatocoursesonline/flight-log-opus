import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Traduções em português brasileiro
const ptBR = {
  translation: {
    // Navigation
    navigation: {
      dashboard: "Dashboard",
      flights: "Voos",
      realtime: "Tempo Real",
      maps: "Mapas",
      ranking: "Ranking",
      history: "Histórico",
      goals: "Metas",
      financial: "Financeiro",
      maintenance: "Manutenção",
      purchases: "Compras",
      financialReports: "Relatórios Financeiros",
      profile: "Perfil",
      settings: "Configurações",
      more: "Mais",
      // Seções
      operational: "Operacional",
      financialSection: "Financeiro",
      business: "Negócios",
      tools: "Ferramentas Úteis",
      administrative: "Administrativo",
      companies: "Minhas Empresas",
      todCalculator: "Calculadora TOD",
      flightPlanner: "Planejador de Voo"
    },
    
    // Flight Planner
    flightPlanner: {
      title: "Planejador de Voo",
      subtitle: "Planeje suas rotas de voo com ferramentas profissionais integradas.",
      loading: "Carregando planejador...",
      refresh: "Atualizar",
      maximize: "Maximizar",
      minimize: "Minimizar",
      openExternal: "Abrir Externamente",
      poweredBy: "Powered by Flight Simulator Planner"
    },

    // Dashboard
    dashboard: {
      title: "Centro de Operações de Voo",
      subtitle: "{{greeting}}. Visão geral da progressão da sua carreira.",
      careerRating: "Rating de Carreira",
      totalFlights: "Total de Voos",
      flightHours: "Horas de Voo",
      totalCR: "Total CR Acumulado",
      excellentPerformance: "Excelente performance",
      thisMonth: "Este mês: {{count}}",
      last30Days: "Últimos 30 dias",
      accumulatedPoints: "Pontos acumulados"
    },
    
    // Flights Page
    flights: {
      title: "Gerenciamento de Voos",
      subtitle: "Gerencie suas operações de voo e registre novas missões.",
      logNewFlight: "Registrar Novo Voo",
      addNewFlight: "Adicionar Novo Voo",
      searchPlaceholder: "Buscar voos...",
      filter: "Filtrar",
      noFlights: "Nenhum voo registrado ainda",
      noFlightsDesc: "Comece registrando seu primeiro voo para começar a rastrear a progressão da sua carreira.",
      logFirstFlight: "Registre Seu Primeiro Voo"
    },
    
    // Goals Page
    goals: {
      title: "Metas de Carreira",
      subtitle: "Defina e acompanhe seus marcos e conquistas de carreira.",
      setNewGoal: "Definir Nova Meta",
      activeGoals: "Metas Ativas",
      completedGoals: "Metas Concluídas",
      inProgress: "Em Progresso",
      completed: "Concluído",
      reachCR100: "Alcançar CR 100",
      reachCR100Desc: "Alcançar um career rating perfeito de 100 pontos",
      flightHours100: "100 Horas de Voo",
      flightHours100Desc: "Registrar 100 horas totais de voo neste trimestre",
      firstSolo: "Primeiro Voo Solo",
      firstSoloDesc: "Complete seu primeiro voo sem penalidades",
      atlanticCrossing: "Travessia do Atlântico",
      atlanticCrossingDesc: "Complete um voo transatlântico",
      completedAgo: "Concluído {{time}}",
      monthsAgo: "{{count}} meses atrás",
      weeksAgo: "{{count}} semanas atrás"
    },
    
    // History Page
    history: {
      title: "Histórico de Voos",
      subtitle: "Visualize e analise seu histórico completo de voos.",
      totalFlights: "Total de Voos",
      totalHours: "Horas Totais",
      avgRating: "Rating Médio",
      searchFlights: "Buscar no histórico...",
      sortBy: "Ordenar por",
      date: "Data",
      duration: "Duração",
      rating: "Rating",
      noHistory: "Nenhum histórico encontrado",
      noHistoryDesc: "Seus voos aparecerão aqui conforme você os registra.",
      thisWeek: "Esta Semana",
      thisMonth: "Este Mês",
      flights: "voos",
      showing: "Exibindo",
      of: "de"
    },
    
    // Ranking Page
    ranking: {
      title: "Ranking de Pilotos",
      subtitle: "Veja sua posição entre os melhores pilotos.",
      globalRanking: "Ranking Global",
      yourPosition: "Sua Posição",
      topPilots: "Melhores Pilotos",
      pilot: "Piloto",
      flights: "Voos",
      hours: "Horas",
      rating: "Rating",
      position: "Posição"
    },
    
    // Profile Page
    profile: {
      title: "Perfil do Piloto",
      subtitle: "Gerencie suas informações pessoais e estatísticas.",
      personalInfo: "Informações Pessoais",
      pilotName: "Nome do Piloto",
      callSign: "Call Sign",
      email: "Email",
      joinDate: "Data de Entrada",
      careerStats: "Estatísticas de Carreira",
      achievements: "Conquistas",
      editProfile: "Editar Perfil",
      save: "Salvar",
      cancel: "Cancelar",
      professionalPilot: "Piloto Profissional",
      flights: "Voos",
      hours: "Horas",
      careerStarted: "Carreira Iniciada",
      monthsAgo: "{{count}} meses atrás",
      totalFlightTime: "Tempo Total de Voo",
      minutesShort: "min",
      averagePerMonth: "Média: {{hours}}h/mês",
      achievementsCount: "{{count}} desbloqueadas",
      inProgress: "{{count}} em progresso",
      perfectFlights: "Voos Perfeitos",
      successRate: "{{rate}}% taxa de sucesso",
      recentAchievements: "Conquistas Recentes",
      atlanticCrossing: "Travessia do Atlântico",
      atlanticCrossingDesc: "Completou um voo transatlântico",
      unlockedAgo: "Desbloqueado {{time}}",
      weeksAgo: "{{count}} semanas atrás",
      highPerformer: "Alto Desempenho",
      highPerformerDesc: "Manteve CR acima de 90 por 30 dias",
      monthAgo: "{{count}} mês atrás",
      centuryClub: "Clube do Século",
      centuryClubDesc: "Completou 100+ voos"
    },
    
    // Settings Page
    settings: {
      title: "Configurações",
      subtitle: "Personalize sua experiência de voo.",
      
      // Notifications section
      notifications: {
        title: "Notificações",
        email: "Notificações por Email",
        emailDesc: "Receba atualizações importantes por email",
        push: "Notificações Push",
        pushDesc: "Receba notificações em tempo real no dispositivo"
      },
      
      // Financial section
      financial: {
        title: "Financeiro",
        currency: "Moeda",
        selectCurrency: "Selecione a moeda",
        initialBalance: "Saldo Inicial",
        initialBalanceDesc: "Defina seu saldo inicial para cálculos financeiros"
      },
      
      // Flights section
      flights: {
        title: "Voos",
        autoSync: "Sincronização Automática",
        autoSyncDesc: "Sincroniza automaticamente dados de voo",
        offlineMode: "Modo Offline",
        offlineModeDesc: "Permite uso offline com cache de dados"
      },
      
      // Career section
      career: {
        title: "Carreira",
        level: "Nível de Carreira",
        selectLevel: "Selecione o nível",
        class: "Classe de Piloto",
        selectClass: "Selecione a classe"
      },
      
      // App section
      app: {
        title: "Aplicativo",
        language: "Idioma",
        selectLanguage: "Selecione o idioma",
        theme: "Tema",
        selectTheme: "Selecione o tema",
        light: "Claro",
        dark: "Escuro",
        system: "Sistema"
      },
      
      // Data section
      data: {
        title: "Dados e Backup",
        export: "Exportar",
        import: "Importar",
        backup: "Backup",
        reset: "Redefinir"
      },
      
      // Security section
      maintenance: {
        title: "Manutenção",
        categories: "Categorias de Manutenção",
        items: "Itens de Manutenção"
      },
      
      security: {
        title: "Segurança",
        currentPassword: "Senha Atual",
        newPassword: "Nova Senha",
        confirmPassword: "Confirmar Senha",
        changePassword: "Alterar Senha",
        connectAccount: "Conectar Conta",
        deleteAccount: "Excluir Conta"
      }
    },
    
    // Financial Page
    financial: {
      title: "Gestão Financeira",
      subtitle: "Controle seus custos operacionais e receitas de voo.",
      totalRevenue: "Receita Total",
      totalCosts: "Custos Totais",
      netProfit: "Lucro Líquido",
      profitMargin: "Margem de Lucro",
      addTransaction: "Nova Transação",
      recentTransactions: "Transações Recentes",
      noTransactions: "Nenhuma transação registrada",
      noTransactionsDesc: "Comece adicionando suas primeiras receitas e despesas de voo.",
      addFirstTransaction: "Adicionar Primeira Transação",
      type: "Tipo",
      description: "Descrição",
      amount: "Valor",
      date: "Data",
      category: "Categoria",
      revenue: "Receita",
      expense: "Despesa",
      fuel: "Combustível",
      maintenance: "Manutenção",
      insurance: "Seguro",
      rent: "Aluguel",
      training: "Treinamento",
      other: "Outros",
      passenger: "Passageiros",
      cargo: "Carga",
      charter: "Fretamento",
      // Novas categorias MSFS 2024 - Despesas
      aircraftFuel: "Combustível da Aeronave",
      aircraftMaintenance: "Manutenção da Aeronave",
      aircraftInsurance: "Seguro da Aeronave",
      hangarRent: "Aluguel do Hangar",
      pilotTraining: "Treinamento de Piloto",
      flightEquipment: "Equipamentos de Voo",
      airportFees: "Taxas Aeroportuárias",
      navigationFees: "Taxas de Navegação",
      weatherServices: "Serviços Meteorológicos",
      otherExpenses: "Outras Despesas",
      // Novas categorias MSFS 2024 - Receitas
      commercialFlights: "Voos Comerciais",
      flightInstruction: "Instrução de Voo",
      airFreight: "Frete Aéreo",
      airTaxi: "Táxi Aéreo",
      parachuting: "Paraquedismo",
      vipCharter: "Voos VIP Charter",
      specialContracts: "Contratos Especiais",
      medicalTransport: "Transporte Médico",
      searchRescue: "Busca e Salvamento",
      fireSupport: "Combate a Incêndios",
      reputationBonus: "Bônus de Reputação",
      otherRevenues: "Outras Receitas",
      thisMonth: "Este mês",
      lastMonth: "Último mês",
      edit: "Editar",
      delete: "Excluir",
      save: "Salvar",
      cancel: "Cancelar",
      editTransaction: "Editar Transação",
      deleteTransaction: "Excluir Transação",
      confirmDelete: "Tem certeza que deseja excluir esta transação?",
      monthlyOverview: "Visão Mensal",
      financialChart: "Gráfico Financeiro"
    },
    
    // Not Found Page
    notFound: {
      title: "Página Não Encontrada",
      subtitle: "A página que você está procurando não existe.",
      backHome: "Voltar ao Dashboard"
    },
    
    // Flight Chart
    flightChart: {
      title: "Atividade de Voos",
      subtitle: "Visão geral da progressão mensal",
      flights: "Voos",
      careerRating: "Career Rating"
    },
    
    // Recent Flights
    recentFlights: {
      title: "Voos Recentes",
      subtitle: "Suas últimas atividades de voo",
      viewAll: "Ver Todos"
    },
    
    // Quick Actions
    quickActions: {
      logNewFlight: "Registrar Novo Voo",
      logNewFlightDesc: "Registre sua última missão",
      viewAnalytics: "Ver Análises",
      viewAnalyticsDesc: "Métricas detalhadas de performance",
      leaderboard: "Leaderboard",
      leaderboardDesc: "Compare com outros pilotos"
    },
    
    // Status Bar
    statusBar: {
      online: "ONLINE",
      appName: "Microsoft Flight Simulator 2024"
    },
    
    // App Info
    app: {
      name: "MSFS 2024",
      manager: "Career Manager"
    },
    
    // Common terms
    common: {
      duration: "Duração",
      aircraft: "Aeronave",
      from: "De",
      to: "Para",
      completed: "Concluído",
      planned: "Planejado",
      active: "Ativo",
      cancelled: "Cancelado",
      search: "Buscar",
      filter: "Filtrar",
      add: "Adicionar",
      edit: "Editar",
      delete: "Excluir",
      save: "Salvar",
      cancel: "Cancelar",
      loading: "Carregando...",
      callsign: "Callsign",
      route: "Rota",
      date: "Data",
      rating: "Rating",
      showing: "Exibindo",
      of: "de",
      flights: "voos"
    },

    // Auth
    auth: {
      signOut: "Sair",
      signOutSuccess: "Logout realizado com sucesso",
      signOutError: "Erro ao fazer logout",
      signingOut: "Saindo..."
    },

    // Companies Page
    companies: {
      title: "Minhas Empresas",
      subtitle: "Gerencie e expanda seu portfólio de empresas de aviação.",
      companiesOwned: "Empresas Adquiridas",
      availableForPurchase: "Disponíveis para Compra",
      pendingQualifications: "Qualificações Pendentes",
      eligibleCompanies: "Empresas Elegíveis",
      qualificationsPending: "Qualificações Pendentes",
      owned: "Adquirida",
      available: "Disponível",
      locked: "Bloqueada",
      purchase: "Comprar",
      viewDetails: "Ver Detalhes",
      unlockRequirements: "Requisitos para Desbloqueio",
      specialization: "Especialização",
      aircraft: "Aeronave",
      // Company Types
      touristFlight: "Voo Turístico",
      parachuting: "Aviação de Paraquedismo",
      cargoTransport: "Transporte de Carga",
      passengerTransport: "Transporte de Passageiros",
      charterService: "Serviço de Fretamento",
      medevac: "Medevac",
      agriculturalAviation: "Aviação Agrícola",
      aerialAdvertising: "Publicidade Aérea",
      firefighting: "Luta Aérea Contra Incêndios",
      searchRescue: "Busca e Salvamento",
      aerialConstruction: "Construção Aérea"
    }
  }
};

// Traduções em inglês (mantendo termos de aviação)
const enUS = {
  translation: {
    // Navigation
    navigation: {
      dashboard: "Dashboard",
      flights: "Flights",
      realtime: "Real Time",
      maps: "Maps",
      ranking: "Ranking",
      history: "History", 
      goals: "Goals",
      financial: "Financial",
      maintenance: "Maintenance",
      purchases: "Purchases",
      financialReports: "Financial Reports",
      profile: "Profile",
      settings: "Settings",
      more: "More",
      // Seções
      operational: "Operational",
      financialSection: "Financial",
      business: "Business",
      tools: "Useful Tools",
      administrative: "Administrative",
      companies: "My Companies",
      todCalculator: "TOD Calculator",
      flightPlanner: "Flight Planner"
    },
    
    // Flight Planner
    flightPlanner: {
      title: "Flight Planner",
      subtitle: "Plan your flight routes with integrated professional tools.",
      loading: "Loading planner...",
      refresh: "Refresh",
      maximize: "Maximize",
      minimize: "Minimize",
      openExternal: "Open Externally",
      poweredBy: "Powered by Flight Simulator Planner"
    },
    
    // Dashboard
    dashboard: {
      title: "Flight Operations Center",
      subtitle: "{{greeting}}. Your career progression overview.",
      careerRating: "Career Rating",
      totalFlights: "Total Flights",
      flightHours: "Flight Hours",
      totalCR: "Total Accumulated CR",
      excellentPerformance: "Excellent performance",
      thisMonth: "This month: {{count}}",
      last30Days: "Last 30 days",
      accumulatedPoints: "Accumulated points"
    },
    
    // Flights Page
    flights: {
      title: "Flight Management",
      subtitle: "Manage your flight operations and log new missions.",
      logNewFlight: "Log New Flight",
      searchPlaceholder: "Search flights...",
      filter: "Filter",
      noFlights: "No flights logged yet",
      noFlightsDesc: "Start by logging your first flight to begin tracking your career progression.",
      logFirstFlight: "Log Your First Flight"
    },
    
    // Goals Page
    goals: {
      title: "Career Goals",
      subtitle: "Set and track your career milestones and achievements.",
      setNewGoal: "Set New Goal",
      activeGoals: "Active Goals",
      completedGoals: "Completed Goals",
      inProgress: "In Progress",
      completed: "Completed",
      reachCR100: "Reach CR 100",
      reachCR100Desc: "Achieve a perfect career rating of 100 points",
      flightHours100: "100 Flight Hours",
      flightHours100Desc: "Log 100 total flight hours this quarter",
      firstSolo: "First Solo Flight",
      firstSoloDesc: "Complete your first flight without penalties",
      atlanticCrossing: "Atlantic Crossing",
      atlanticCrossingDesc: "Complete a transatlantic flight",
      completedAgo: "Completed {{time}}",
      monthsAgo: "{{count}} months ago",
      weeksAgo: "{{count}} weeks ago"
    },
    
    // History Page
    history: {
      title: "Flight History",
      subtitle: "View and analyze your complete flight history.",
      totalFlights: "Total Flights",
      totalHours: "Total Hours",
      avgRating: "Avg Rating",
      searchFlights: "Search flight history...",
      sortBy: "Sort by",
      date: "Date",
      duration: "Duration",
      rating: "Rating",
      noHistory: "No flight history found",
      noHistoryDesc: "Your flights will appear here as you log them."
    },
    
    // Ranking Page
    ranking: {
      title: "Pilot Rankings",
      subtitle: "See where you stand among the top pilots.",
      globalRanking: "Global Ranking",
      yourPosition: "Your Position",
      topPilots: "Top Pilots",
      pilot: "Pilot",
      flights: "Flights",
      hours: "Hours",
      rating: "Rating",
      position: "Position"
    },
    
    // Profile Page
    profile: {
      title: "Pilot Profile",
      subtitle: "Manage your personal information and statistics.",
      personalInfo: "Personal Information",
      pilotName: "Pilot Name",
      callSign: "Call Sign",
      email: "Email",
      joinDate: "Join Date",
      careerStats: "Career Statistics",
      achievements: "Achievements",
      editProfile: "Edit Profile",
      save: "Save",
      cancel: "Cancel",
      professionalPilot: "Professional Pilot",
      flights: "Flights",
      hours: "Hours",
      careerStarted: "Career Started",
      monthsAgo: "{{count}} months ago",
      totalFlightTime: "Total Flight Time",
      minutesShort: "minutes",
      averagePerMonth: "Average: {{hours}}h/month",
      achievementsCount: "{{count}} unlocked",
      inProgress: "{{count}} in progress",
      perfectFlights: "Perfect Flights",
      successRate: "{{rate}}% success rate",
      recentAchievements: "Recent Achievements",
      atlanticCrossing: "Atlantic Crossing",
      atlanticCrossingDesc: "Completed a transatlantic flight",
      unlockedAgo: "Unlocked {{time}}",
      weeksAgo: "{{count}} weeks ago",
      highPerformer: "High Performer",
      highPerformerDesc: "Maintained CR above 90 for 30 days",
      monthAgo: "{{count}} month ago",
      centuryClub: "Century Club",
      centuryClubDesc: "Completed 100+ flights"
    },
    
    // Settings Page
    settings: {
      title: "Settings",
      subtitle: "Customize your flight experience.",
      
      // Notifications section
      notifications: {
        title: "Notifications",
        email: "Email Notifications",
        emailDesc: "Receive important updates via email",
        push: "Push Notifications",
        pushDesc: "Get real-time notifications on your device"
      },
      
      // Financial section
      financial: {
        title: "Financial",
        currency: "Currency",
        selectCurrency: "Select currency",
        initialBalance: "Initial Balance",
        initialBalanceDesc: "Set your initial balance for financial calculations"
      },
      
      // Flights section
      flights: {
        title: "Flights",
        autoSync: "Auto Sync",
        autoSyncDesc: "Automatically sync flight data",
        offlineMode: "Offline Mode",
        offlineModeDesc: "Enable offline usage with data caching"
      },
      
      // Career section
      career: {
        title: "Career",
        level: "Career Level",
        selectLevel: "Select level",
        class: "Pilot Class",
        selectClass: "Select class"
      },
      
      // App section
      app: {
        title: "Application",
        language: "Language",
        selectLanguage: "Select language",
        theme: "Theme",
        selectTheme: "Select theme",
        light: "Light",
        dark: "Dark",
        system: "System"
      },
      
      // Data section
      data: {
        title: "Data & Backup",
        export: "Export",
        import: "Import",
        backup: "Backup",
        reset: "Reset"
      },
      
      // Security section
      maintenance: {
        title: "Maintenance",
        categories: "Maintenance Categories",
        items: "Maintenance Items"
      },
      
      security: {
        title: "Security",
        currentPassword: "Current Password",
        newPassword: "New Password",
        confirmPassword: "Confirm Password",
        changePassword: "Change Password",
        connectAccount: "Connect Account",
        deleteAccount: "Delete Account"
      }
    },
    
    // Financial Page
    financial: {
      title: "Financial Management",
      subtitle: "Control your operational costs and flight revenues.",
      totalRevenue: "Total Revenue",
      totalCosts: "Total Costs",
      netProfit: "Net Profit",
      profitMargin: "Profit Margin",
      addTransaction: "New Transaction",
      recentTransactions: "Recent Transactions",
      noTransactions: "No transactions recorded",
      noTransactionsDesc: "Start by adding your first flight revenues and expenses.",
      addFirstTransaction: "Add First Transaction",
      type: "Type",
      description: "Description",
      amount: "Amount",
      date: "Date",
      category: "Category",
      revenue: "Revenue",
      expense: "Expense",
      fuel: "Fuel",
      maintenance: "Maintenance",
      insurance: "Insurance",
      rent: "Rent",
      training: "Training",
      other: "Other",
      passenger: "Passengers",
      cargo: "Cargo",
      charter: "Charter",
      // New MSFS 2024 categories - Expenses
      aircraftFuel: "Aircraft Fuel",
      aircraftMaintenance: "Aircraft Maintenance",
      aircraftInsurance: "Aircraft Insurance",
      hangarRent: "Hangar Rent",
      pilotTraining: "Pilot Training",
      flightEquipment: "Flight Equipment",
      airportFees: "Airport Fees",
      navigationFees: "Navigation Fees",
      weatherServices: "Weather Services",
      otherExpenses: "Other Expenses",
      // New MSFS 2024 categories - Revenues
      commercialFlights: "Commercial Flights",
      flightInstruction: "Flight Instruction",
      airFreight: "Air Freight",
      airTaxi: "Air Taxi",
      parachuting: "Parachuting",
      vipCharter: "VIP Charter Flights",
      specialContracts: "Special Contracts",
      medicalTransport: "Medical Transport",
      searchRescue: "Search & Rescue",
      fireSupport: "Fire Support",
      reputationBonus: "Reputation Bonus",
      otherRevenues: "Other Revenues",
      thisMonth: "This month",
      lastMonth: "Last month",
      edit: "Edit",
      delete: "Delete",
      save: "Save",
      cancel: "Cancel",
      editTransaction: "Edit Transaction",
      deleteTransaction: "Delete Transaction",
      confirmDelete: "Are you sure you want to delete this transaction?",
      monthlyOverview: "Monthly Overview",
      financialChart: "Financial Chart"
    },
    
    // Not Found Page
    notFound: {
      title: "Page Not Found",
      subtitle: "The page you're looking for doesn't exist.",
      backHome: "Back to Dashboard"
    },
    
    // Flight Chart
    flightChart: {
      title: "Flight Activity",
      subtitle: "Monthly progression overview",
      flights: "Flights",
      careerRating: "Career Rating"
    },
    
    // Recent Flights
    recentFlights: {
      title: "Recent Flights",
      subtitle: "Your latest flight activities",
      viewAll: "View All"
    },
    
    // Quick Actions
    quickActions: {
      logNewFlight: "Log New Flight",
      logNewFlightDesc: "Record your latest mission",
      viewAnalytics: "View Analytics",
      viewAnalyticsDesc: "Detailed performance metrics",
      leaderboard: "Leaderboard",
      leaderboardDesc: "Compare with other pilots"
    },
    
    // Status Bar
    statusBar: {
      online: "ONLINE",
      appName: "Microsoft Flight Simulator 2024"
    },
    
    // App Info
    app: {
      name: "MSFS 2024",
      manager: "Career Manager"
    },
    
    // Common terms
    common: {
      duration: "Duration",
      aircraft: "Aircraft",
      from: "From",
      to: "To",
      completed: "Completed",
      planned: "Planned",
      active: "Active",
      cancelled: "Cancelled",
      search: "Search",
      filter: "Filter",
      add: "Add",
      edit: "Edit",
      delete: "Delete",
      save: "Save",
      cancel: "Cancel",
      loading: "Loading..."
    },

    // Auth
    auth: {
      signOut: "Sign Out",
      signOutSuccess: "Successfully signed out",
      signOutError: "Error signing out",
      signingOut: "Signing out..."
    },

    // Companies Page
    companies: {
      title: "My Companies",
      subtitle: "Manage and expand your aviation business portfolio.",
      companiesOwned: "Companies Owned",
      availableForPurchase: "Available for Purchase",
      pendingQualifications: "Pending Qualifications",
      eligibleCompanies: "Eligible Companies",
      qualificationsPending: "Qualifications Pending",
      owned: "Owned",
      available: "Available",
      locked: "Locked",
      purchase: "Purchase",
      viewDetails: "View Details",
      unlockRequirements: "Unlock Requirements",
      specialization: "Specialization",
      aircraft: "Aircraft",
      // Company Types
      touristFlight: "Tourist Flight",
      parachuting: "Parachuting Aviation",
      cargoTransport: "Cargo Transport",
      passengerTransport: "Passenger Transport",
      charterService: "Charter Service",
      medevac: "Medevac",
      agriculturalAviation: "Agricultural Aviation",
      aerialAdvertising: "Aerial Advertising",
      firefighting: "Aerial Firefighting",
      searchRescue: "Search & Rescue",
      aerialConstruction: "Aerial Construction"
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      'pt-BR': ptBR,
      'en-US': enUS
    },
    fallbackLng: 'en-US',
    debug: false,
    interpolation: {
      escapeValue: false
    },
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage']
    }
  });

export default i18n;