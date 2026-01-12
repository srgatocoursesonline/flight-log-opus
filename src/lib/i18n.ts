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
      analytics: "Análises",
      business: "Negócios",
      tools: "Ferramentas Úteis",
      administrative: "Administrativo",
      companies: "Minhas Empresas",
      todCalculator: "Calculadora TOD",
      flightPlanner: "Planejador de Voo",
      airportSearch: "Busca de Aeroportos",
      reports: "Relatórios"
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
      modalDescription: "Escolha uma meta para começar a rastrear seu progresso.",
      goalCategory: "Categoria da Meta",
      selectCategory: "Selecione uma categoria",
      goalType: "Tipo de Meta",
      selectGoalType: "Selecione uma meta específica",
      targetValue: "Valor Alvo",
      targetDate: "Data Limite (Opcional)",
      pickDate: "Selecione uma data",
      enableNotifications: "Habilitar Notificações",
      notificationsDescription: "Receba alertas de progresso (25%, 50%, 75%)",
      noAvailableGoals: "Nenhuma meta disponível nesta categoria",
      noActiveGoals: "Nenhuma meta ativa no momento",
      noCompletedGoals: "Nenhuma meta concluída ainda",
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
      centuryClub: "Clube do Século",
      centuryClubDesc: "Completou 100+ voos",
      statsBreakdown: "{{initial}} iniciais + {{system}} sistema",
      edit: {
        title: "Editar Perfil",
        basicInfo: "Informações Básicas",
        historicalData: "Dados Históricos",
        summary: "Resumo Calculado",
        changeAvatar: "Alterar Avatar",
        displayName: "Nome de Exibição",
        description: "Descrição",
        descriptionPlaceholder: "Conte um pouco sobre sua experiência como piloto...",
        initialFlights: "Voos Iniciais (Histórico)",
        initialFlightsDesc: "Novos voos serão somados a este valor automaticamente",
        initialHours: "Horas de Voo Iniciais",
        initialHoursDesc: "Novas horas de voo serão somadas a este valor automaticamente",
        careerStarted: "Carreira Iniciada",
        perfectFlights: "Pousos Perfeitos",
        achievementsPlaceholder: "Descreva suas principais conquistas e certificações...",
        calculatedTotalFlights: "Total de Voos:",
        calculatedTotalHours: "Total de Horas:",
        currentCR: "CR Atual:",
        saving: "Salvando...",
        saveChanges: "Salvar Alterações",
        success: "Perfil atualizado com sucesso",
        error: "Erro ao atualizar perfil",
        avatarSuccess: "Avatar atualizado com sucesso",
        avatarError: "Erro ao fazer upload do avatar"
      }
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
      saving: "Salvando...",
      cancel: "Cancelar",
      loading: "Carregando...",
      error: "Erro",
      callsign: "Callsign",
      route: "Rota",
      date: "Data",
      rating: "Rating",
      showing: "Exibindo",
      of: "de",
      flights: "voos",
      thisMonth: "este mês",
      purchase_one: "compra",
      purchase_other: "compras",
      pendingOrder_one: "pedido pendente",
      pendingOrder_other: "pedidos pendentes",
      purchasesRegistered: "compras registradas",
      distance: "Distância",
      totalHours: "Tempo Total",
      clearHistory: "Limpar Histórico",
      confirmClear: "Tem certeza que deseja limpar todo o histórico? Esta ação não pode ser desfeita.",
      clearAll: "Limpar Tudo",
      deleteFlight: "Deletar Voo",
      confirmDelete: "Tem certeza que deseja deletar este item? Esta ação não pode ser desfeita."
    },

    // Career Rating Card
    careerRating: {
      title: "Rating de Carreira",
      notFound: "Dados de Carreira não Encontrados",
      setupDesc: "Configure seus dados de carreira do Microsoft Flight Simulator para visualizar seu progresso.",
      setupNow: "Configurar Agora",
      editTooltip: "Editar CR, Nível e Classe",
      ratingTotal: "Rating Total",
      level: "Nível",
      class: "Classe",
      classElite: "Classe S (Elite)",
      classSpecialist: "Classe A (Especialista)",
      classProfessional: "Classe B (Profissional)",
      classExperienced: "Classe C (Experiente)",
      classBeginner: "Classe D (Iniciante)",
      success: "Dados de carreira atualizados com sucesso!",
      error: "Erro ao salvar os dados",
      performanceS: "Desempenho Excepcional",
      performanceA: "Desempenho Excelente",
      performanceB: "Bom Desempenho",
      performanceC: "Desempenho Competente",
      performanceD: "Desempenho em Desenvolvimento",
      performanceDefault: "Desempenho Padrão"
    },

    // Recent Flights
    recentFlights: {
      title: "Voos Recentes",
      subtitle: "Suas últimas atividades de voo",
      viewAll: "Ver Todos",
      noFlights: "Nenhum voo registrado ainda",
      logFirstFlight: "Registrar Primeiro Voo"
    },

    // MSFS Flights
    msfsFlights: {
      favoriteAircraft: "Aeronave Favorita",
      noFlights: "Nenhum voo do MSFS encontrado",
      startServiceDesc: "Inicie o serviço companheiro para começar a registrar seus voos automaticamente.",
      viewAll: "Ver todos os {{count}} voos"
    },

    // Flight Chart
    flightChart: {
      title: "Atividade de Voo",
      subtitle: "Visão geral da progressão mensal",
      flights: "Voos",
      careerRating: "Career Rating",
      months3: "3 meses",
      months6: "6 meses",
      months12: "12 meses",
      all: "Todos",
      noData: "Nenhum voo registrado. Adicione seus primeiros voos para ver o gráfico!"
    },

    // Career Rating Manager Section
    careerManager: {
      title: "Gerenciamento de Rating do MSFS",
      reminder: "Lembrete",
      reminderDesc: "Não esqueça de verificar seu Rating total, Nível e Classe no perfil do modo carreira do Microsoft Flight Simulator e atualizar aqui.",
      dontShowAgain: "Não mostrar novamente",
      totalRating: "Rating Total",
      level: "Nível",
      class: "Classe de Carreira",
      selectClass: "Selecione a classe",
      currentStatus: "Status Atual:",
      lastUpdated: "Última atualização:",
      updating: "Atualizando...",
      updateButton: "Atualizar Dados da Carreira",
      errorPositiveRating: "O rating total deve ser um número positivo",
      errorPositiveLevel: "O nível deve ser um número positivo",
      errorClassRequired: "A classe de carreira é obrigatória",
      success: "Dados de carreira atualizados com sucesso",
      successSql: "Dados de carreira atualizados via SQL direto",
      warningUpdated: "Dados enviados, mas verifique se foram atualizados corretamente",
      errorUpdate: "Erro ao atualizar dados de carreira: {{message}}"
    },

    // Purchases Page
    purchases: {
      title: "Gestão de Compras",
      subtitle: "Gerencie compras de combustível, equipamentos e suprimentos.",
      newPurchase: "Nova Compra",
      firstPurchase: "Primeira Compra",
      monthlySpending: "Gastos Este Mês",
      pendingOrders: "Pedidos Pendentes",
      totalPurchases: "Total de Compras",
      recentPurchases: "Compras Recentes",
      noPurchases: "Nenhuma compra registrada ainda",
      statusChange: "Clique para alterar o status",
      purchaseCode: "Código",
      buyer: "Comprador",
      budgeted: "Orçado",
      negotiated: "Negociado",
      finalValue: "Valor Final"
    },

    // Financial Reports
    financialReports: {
      title: "Relatórios Financeiros",
      subtitle: "Visão completa das entradas, saídas e DRE em tempo real.",
      overview: "Visão Geral",
      detailedDRE: "DRE Detalhado",
      transactions: "Transações",
      totalRevenue: "Receita Total",
      totalExpenses: "Despesas Totais",
      netProfit: "Lucro Líquido",
      profitMargin: "Margem de Lucro",
      updatedAt: "Atualizado em",
      syncing: "Sincronizando...",
      synced: "Sincronizado",
      export: "Exportar",
      refresh: "Atualizar"
    },

    // Real-time Tracking
    realtime: {
      title: "Tracking em Tempo Real",
      subtitle: "Monitore seus voos do MSFS 2024 em tempo real.",
      connection: "Conexão WebSocket",
      connectionDesc: "Dados em tempo real via ws://localhost:3001",
      integration: "Integração MSFS 2024",
      integrationDesc: "Integração via SimConnect",
      autoSave: "Auto-Save",
      autoSaveDesc: "Voos salvos automaticamente",
      howToUse: "Como Usar",
      preparation: "1. Preparação",
      preparationSteps: [
        "Inicie o MSFS 2024",
        "Execute o companion service",
        "Execute o flight tracking server",
        "Carregue uma aeronave no simulador"
      ],
      tracking: "2. Tracking",
      trackingSteps: [
        "Visualização em tempo real no mapa",
        "Voos detectados e salvos automaticamente",
        "Caminho do voo mostrado em tempo real",
        "Histórico disponível na página de voos"
      ],
      tip: "Mantenha esta página aberta durante o voo para monitorar em tempo real.",
      usefulLinks: "Links Úteis",
      msfsHistory: "Histórico de Voos MSFS",
      serviceStatus: "Status do Flight Tracking Service"
    },

    // Maps
    maps: {
      title: "Mapas de Voo",
      subtitle: "Visualize e acompanhe rotas de voo em tempo real.",
      allRoutes: "Todas as Rotas",
      completed: "Concluídos",
      active: "Ativos",
      planned: "Planejados",
      mapLegend: "Legenda do Mapa",
      features: "Recursos",
      realtimeTracking: "Tracking em tempo real",
      multipleLayers: "Múltiplas camadas de mapa",
      detailedWaypoints: "Waypoints e rotas detalhadas",
      advancedFilters: "Filtros e busca avançada"
    },

    // DRE
    dre: {
      title: "Demonstrativo de Resultados (DRE)",
      noData: "Nenhum dado financeiro disponível.",
      profit: "Lucro",
      loss: "Prejuízo",
      netProfit: "Lucro Líquido do Período",
      grossRevenue: "RECEITA BRUTA",
      operatingExpenses: "(-) Despesas Operacionais",
      breakEven: "Ponto de Equilíbrio",
      revenueByCategory: "Receitas por Categoria",
      expensesByCategory: "Despesas por Categoria",
      noRevenue: "Nenhuma receita registrada",
      noExpense: "Nenhuma despesa registrada",
      ofTotal: "do total"
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
    },

    // Reports & Analytics
    reports: {
      title: "Relatórios e Análises",
      subtitle: "Análise abrangente das suas operações de voo, finanças e manutenção",
      dashboard: "Dashboard",
      dashboardShort: "Início",
      flights: "Voos",
      flightsShort: "Voos",
      financial: "Financeiro",
      financialShort: "Dinheiro",
      maintenance: "Manutenção",
      maintenanceShort: "Manut",
      geographic: "Geográfico",
      geographicShort: "Mapa",
      filters: "Filtros",
      refresh: "Atualizar",
      export: "Exportar",
      lastUpdated: "Última atualização",
      syncing: "Sincronizando...",
      synced: "Sincronizado",
      comingSoon: "Em breve",
      
      // Quick Overview
      quickOverview: "Visão Geral Rápida",
      totalFlights: "Total de Voos",
      flightHours: "Horas de Voo",
      uniqueAirports: "Aeroportos Únicos",
      totalRevenue: "Receita Total",
      maintenanceCosts: "Custos de Manutenção",
      completionRate: "Taxa de Conclusão",
      thisMonth: "este mês",
      thisQuarter: "este trimestre",
      totalTime: "tempo total",
      visited: "visitados",
      onTime: "no prazo",
      
      // Date Range Filters
      dateRange: "Período",
      last7Days: "Últimos 7 dias",
      last30Days: "Últimos 30 dias",
      last3Months: "3 meses",
      last6Months: "6 meses",
      lastYear: "Último ano",
      allTime: "Todo período",
      customRange: "Período personalizado",
      from: "De",
      to: "Até",
      selectDate: "Selecionar data",
      
      // Other Filters
      aircraft: "Aeronaves",
      airports: "Aeroportos",
      status: "Status",
      completed: "Concluído",
      scheduled: "Agendado",
      cancelled: "Cancelado",
      delayed: "Atrasado",
      
      // Comparison
      comparison: "Comparação",
      enableComparison: "Comparar com período anterior",
      previousPeriod: "Período anterior",
      yearAgo: "Mesmo período ano passado",
      customPeriod: "Período personalizado",
      
      // Advanced Filters
      advancedFilters: "Filtros Avançados",
      clearAll: "Limpar",
      
      // Report Sections
      overview: "Visão Geral",
      overviewDescription: "Principais métricas e indicadores de desempenho",
      recentActivity: "Atividade Recente",
      recentActivityDescription: "Últimos voos, transações e manutenções",
      flightReports: "Relatórios de Voo",
      flightReportsDescription: "Análise abrangente de voos e relatórios de logbook",
      financialReports: "Relatórios Financeiros",
      financialReportsDescription: "Análise de receitas, despesas e rentabilidade",
      maintenanceReports: "Relatórios de Manutenção",
      maintenanceReportsDescription: "Custos de manutenção, cronogramas e acompanhamento de conformidade",
      geographicVisualization: "Visualização Geográfica",
      geographicVisualizationDescription: "Mapas interativos mostrando rotas de voo e estatísticas de aeroportos"
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
      flightPlanner: "Flight Planner",
      airportSearch: "Airport Search"
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
      logFirstFlight: "Log Your First Flight",
      addNewFlight: "Add New Flight"
    },

    // Goals Page
    goals: {
      title: "Career Goals",
      subtitle: "Set and track your career milestones and achievements.",
      setNewGoal: "Set New Goal",
      modalDescription: "Choose a goal to start tracking your progress.",
      goalCategory: "Goal Category",
      selectCategory: "Select a category",
      goalType: "Goal Type",
      selectGoalType: "Select a specific goal",
      targetValue: "Target Value",
      targetDate: "Target Date (Optional)",
      pickDate: "Select a date",
      enableNotifications: "Enable Notifications",
      notificationsDescription: "Receive progress alerts (25%, 50%, 75%)",
      noAvailableGoals: "No goals available in this category",
      noActiveGoals: "No active goals at the moment",
      noCompletedGoals: "No completed goals yet",
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
      noHistoryDesc: "Your flights will appear here as you log them.",
      thisWeek: "This Week",
      thisMonth: "This Month",
      flights: "flights",
      showing: "Showing",
      of: "of"
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
      centuryClubDesc: "Completed 100+ flights",
      statsBreakdown: "{{initial}} initial + {{system}} system",
      edit: {
        title: "Edit Profile",
        basicInfo: "Basic Information",
        historicalData: "Historical Data",
        summary: "Calculated Summary",
        changeAvatar: "Change Avatar",
        displayName: "Display Name",
        description: "Description",
        descriptionPlaceholder: "Tell us a bit about your flight experience...",
        initialFlights: "Initial Flights (History)",
        initialFlightsDesc: "New flights will be automatically added to this value",
        initialHours: "Initial Flight Hours",
        initialHoursDesc: "New flight hours will be automatically added to this value",
        careerStarted: "Career Started",
        perfectFlights: "Perfect Landings",
        achievementsPlaceholder: "Describe your main achievements and certifications...",
        calculatedTotalFlights: "Total Flights:",
        calculatedTotalHours: "Total Hours:",
        currentCR: "Current CR:",
        saving: "Saving...",
        saveChanges: "Save Changes",
        success: "Profile updated successfully",
        error: "Error updating profile",
        avatarSuccess: "Avatar updated successfully",
        avatarError: "Error uploading avatar"
      }
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
      saving: "Saving...",
      cancel: "Cancel",
      loading: "Loading...",
      error: "Error",
      callsign: "Callsign",
      route: "Route",
      date: "Date",
      rating: "Rating",
      showing: "Showing",
      of: "of",
      flights: "flights",
      thisMonth: "this month",
      purchase_one: "purchase",
      purchase_other: "purchases",
      pendingOrder_one: "pending order",
      pendingOrder_other: "pending orders",
      purchasesRegistered: "purchases registered",
      distance: "Distance",
      totalHours: "Total Time",
      clearHistory: "Clear History",
      confirmClear: "Are you sure you want to clear all history? This action cannot be undone.",
      clearAll: "Clear All",
      deleteFlight: "Delete Flight",
      confirmDelete: "Are you sure you want to delete this item? This action cannot be undone."
    },

    // Career Rating Card
    careerRating: {
      title: "Career Rating",
      notFound: "Career Data Not Found",
      setupDesc: "Configure your Microsoft Flight Simulator career data to visualize your progress.",
      setupNow: "Configure Now",
      editTooltip: "Edit CR, Level, and Class",
      ratingTotal: "Total Rating",
      level: "Level",
      class: "Class",
      classElite: "Class S (Elite)",
      classSpecialist: "Class A (Specialist)",
      classProfessional: "Class B (Professional)",
      classExperienced: "Class C (Experienced)",
      classBeginner: "Class D (Beginner)",
      success: "Career data updated successfully!",
      error: "Error saving data",
      performanceS: "Exceptional Performance",
      performanceA: "Excellent Performance",
      performanceB: "Good Performance",
      performanceC: "Competent Performance",
      performanceD: "Developing Performance",
      performanceDefault: "Standard Performance"
    },

    // Recent Flights
    recentFlights: {
      title: "Recent Flights",
      subtitle: "Your latest flight activities",
      viewAll: "View All",
      noFlights: "No flights logged yet",
      logFirstFlight: "Log First Flight"
    },

    // MSFS Flights
    msfsFlights: {
      favoriteAircraft: "Favorite Aircraft",
      noFlights: "No MSFS flights found",
      startServiceDesc: "Start the companion service to begin logging your flights automatically.",
      viewAll: "View all {{count}} flights"
    },

    // Flight Chart
    flightChart: {
      title: "Flight Activity",
      subtitle: "Monthly progression overview",
      flights: "Flights",
      careerRating: "Career Rating",
      months3: "3 months",
      months6: "6 months",
      months12: "12 months",
      all: "All",
      noData: "No flights logged. Add your first flights to see the chart!"
    },

    // Career Rating Manager Section
    careerManager: {
      title: "MSFS Rating Management",
      reminder: "Reminder",
      reminderDesc: "Don't forget to check your Total Rating, Level, and Class in your Microsoft Flight Simulator career profile and update it here.",
      dontShowAgain: "Don't show again",
      totalRating: "Total Rating",
      level: "Level",
      class: "Career Class",
      selectClass: "Select class",
      currentStatus: "Current Status:",
      lastUpdated: "Last updated:",
      updating: "Updating...",
      updateButton: "Update Career Data",
      errorPositiveRating: "Total rating must be a positive number",
      errorPositiveLevel: "Level must be a positive number",
      errorClassRequired: "Career class is required",
      success: "Career data updated successfully",
      successSql: "Career data updated via direct SQL",
      warningUpdated: "Data sent, but check if it updated correctly",
      errorUpdate: "Error updating career data: {{message}}"
    },

    // Purchases Page
    purchases: {
      title: "Purchase Management",
      subtitle: "Manage purchases for fuel, equipment, and supplies.",
      newPurchase: "New Purchase",
      firstPurchase: "First Purchase",
      monthlySpending: "Monthly Spending",
      pendingOrders: "Pending Orders",
      totalPurchases: "Total Purchases",
      recentPurchases: "Recent Purchases",
      noPurchases: "No purchases logged yet",
      statusChange: "Click to change status",
      purchaseCode: "Code",
      buyer: "Buyer",
      budgeted: "Budgeted",
      negotiated: "Negotiated",
      finalValue: "Final Value"
    },

    // Financial Reports
    financialReports: {
      title: "Financial Reports",
      subtitle: "Complete view of revenues, expenses, and P&L in real time.",
      overview: "Overview",
      detailedDRE: "Detailed P&L",
      transactions: "Transactions",
      totalRevenue: "Total Revenue",
      totalExpenses: "Total Expenses",
      netProfit: "Net Profit",
      profitMargin: "Profit Margin",
      updatedAt: "Updated at",
      syncing: "Syncing...",
      synced: "Synced",
      export: "Export",
      refresh: "Refresh"
    },

    // Real-time Tracking
    realtime: {
      title: "Real-time Tracking",
      subtitle: "Monitor your MSFS 2024 flights in real time.",
      connection: "WebSocket Connection",
      connectionDesc: "Real-time data via ws://localhost:3001",
      integration: "MSFS 2024 Integration",
      integrationDesc: "Integration via SimConnect",
      autoSave: "Auto-Save",
      autoSaveDesc: "Flights saved automatically",
      howToUse: "How to Use",
      preparation: "1. Preparation",
      preparationSteps: [
        "Start MSFS 2024",
        "Run the companion service",
        "Run the flight tracking server",
        "Load an aircraft in the simulator"
      ],
      tracking: "2. Tracking",
      trackingSteps: [
        "Real-time visualization on the map",
        "Flights detected and saved automatically",
        "Flight path shown in real time",
        "History available on the flights page"
      ],
      tip: "Keep this page open during flight to monitor in real time.",
      usefulLinks: "Useful Links",
      msfsHistory: "MSFS Flight History",
      serviceStatus: "Flight Tracking Service Status"
    },

    // Maps
    maps: {
      title: "Flight Maps",
      subtitle: "Visualize and track flight routes in real time.",
      allRoutes: "All Routes",
      completed: "Completed",
      active: "Active",
      planned: "Planned",
      mapLegend: "Map Legend",
      features: "Features",
      realtimeTracking: "Real-time tracking",
      multipleLayers: "Multiple map layers",
      detailedWaypoints: "Detailed waypoints and routes",
      advancedFilters: "Advanced filters and search"
    },

    // DRE
    dre: {
      title: "Profit & Loss Statement (P&L)",
      noData: "No financial data available.",
      profit: "Profit",
      loss: "Loss",
      netProfit: "Net Profit for the Period",
      grossRevenue: "GROSS REVENUE",
      operatingExpenses: "(-) Operating Expenses",
      breakEven: "Break-even Point",
      revenueByCategory: "Revenue by Category",
      expensesByCategory: "Expenses by Category",
      noRevenue: "No revenue recorded",
      noExpense: "No expense recorded",
      ofTotal: "of total"
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

// Sincronizar atributo lang do HTML com o idioma atual
i18n.on('languageChanged', (lng) => {
  document.documentElement.lang = lng;
});

// Definir idioma inicial
if (typeof document !== 'undefined') {
  document.documentElement.lang = i18n.language;
}

export default i18n;