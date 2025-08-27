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
      ranking: "Ranking",
      history: "Histórico",
      goals: "Metas",
      financial: "Financeiro",
      profile: "Perfil",
      settings: "Configurações"
    },
    
    // Dashboard
    dashboard: {
      title: "Centro de Operações de Voo",
      subtitle: "Bem-vindo de volta, Capitão. Visão geral da progressão da sua carreira.",
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
      noHistoryDesc: "Seus voos aparecerão aqui conforme você os registra."
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
      general: "Geral",
      language: "Idioma",
      theme: "Tema",
      notifications: "Notificações",
      privacy: "Privacidade",
      about: "Sobre",
      version: "Versão",
      save: "Salvar Configurações",
      resetDefaults: "Restaurar Padrões",
      flightReminders: "Lembretes de Voo",
      flightRemindersDesc: "Receba notificações sobre voos futuros",
      goalProgress: "Progresso das Metas",
      goalProgressDesc: "Atualizações sobre suas metas de carreira",
      achievementUnlocked: "Conquista Desbloqueada",
      achievementUnlockedDesc: "Comemore suas conquistas",
      appPreferences: "Preferências do App",
      offlineMode: "Modo Offline",
      offlineModeDesc: "Cache dados para uso offline",
      autoSync: "Sincronização Automática",
      autoSyncDesc: "Sincroniza automaticamente quando online",
      analytics: "Análises",
      analyticsDesc: "Ajude a melhorar o app com dados de uso",
      dataManagement: "Gerenciamento de Dados",
      exportData: "Exportar Dados",
      exportDataDesc: "Baixe seus dados de voo",
      export: "Exportar",
      backup: "Backup",
      backupDesc: "Crie um backup dos seus dados",
      resetData: "Redefinir Dados",
      resetDataDesc: "Apagar permanentemente todos os dados de voo",
      reset: "Redefinir",
      privacySecurity: "Privacidade e Segurança",
      securityFeatures: "Recursos de segurança estarão disponíveis quando você se conectar ao Supabase para funcionalidade backend.",
      connectSupabase: "Conectar Supabase"
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
      loading: "Carregando..."
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
      ranking: "Ranking",
      history: "History", 
      goals: "Goals",
      financial: "Financial",
      profile: "Profile",
      settings: "Settings"
    },
    
    // Dashboard
    dashboard: {
      title: "Flight Operations Center",
      subtitle: "Welcome back, Captain. Your career progression overview.",
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
      general: "General",
      language: "Language",
      theme: "Theme",
      notifications: "Notifications",
      privacy: "Privacy",
      about: "About",
      version: "Version",
      save: "Save Settings",
      resetDefaults: "Reset to Defaults",
      flightReminders: "Flight Reminders",
      flightRemindersDesc: "Get notified about upcoming flights",
      goalProgress: "Goal Progress",
      goalProgressDesc: "Updates on your career goals",
      achievementUnlocked: "Achievement Unlocked",
      achievementUnlockedDesc: "Celebrate your accomplishments",
      appPreferences: "App Preferences",
      offlineMode: "Offline Mode",
      offlineModeDesc: "Cache data for offline use",
      autoSync: "Auto-sync",
      autoSyncDesc: "Automatically sync when online",
      analytics: "Analytics",
      analyticsDesc: "Help improve the app with usage data",
      dataManagement: "Data Management",
      exportData: "Export Data",
      exportDataDesc: "Download your flight data",
      export: "Export",
      backup: "Backup",
      backupDesc: "Create a backup of your data",
      resetData: "Reset Data",
      resetDataDesc: "Permanently delete all flight data",
      reset: "Reset",
      privacySecurity: "Privacy & Security",
      securityFeatures: "Security features will be available when you connect to Supabase for backend functionality.",
      connectSupabase: "Connect Supabase"
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