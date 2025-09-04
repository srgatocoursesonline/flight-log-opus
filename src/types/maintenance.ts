// ============================================
// MAINTENANCE SYSTEM TYPES
// ============================================

export interface MaintenanceCategory {
  id: string;
  name: string;
  icon: string;
  items: MaintenanceItem[];
}

export interface MaintenanceItem {
  id: string;
  name: string;
  description?: string;
  estimated_hours?: number;
  estimated_cost?: number;
}

export interface MaintenanceRecord {
  id: string;
  aircraft: string;
  date: string;
  description: string;
  items: MaintenanceRecordItem[];
  totalCost: number;
  invoiceNumber?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  status: MaintenanceStatus;
  priority?: MaintenancePriority;
  estimated_hours?: number;
  actual_hours?: number;
  estimated_cost?: number;
  actual_cost?: number;
  category_id?: string;
}

export interface MaintenanceRecordItem {
  categoryId: string;
  categoryName: string;
  itemId: string;
  itemName: string;
  cost: number;
  quantity?: number;
  notes?: string;
}

// Categorias de manutenção baseadas nas imagens fornecidas
export const MAINTENANCE_CATEGORIES: MaintenanceCategory[] = [
  {
    id: 'controles-voo',
    name: 'Controles de voo',
    icon: '🎛️',
    items: [
      { id: 'aileron-esquerdo', name: 'Aileron(s) esquerdo(s)' },
      { id: 'conexao-aileron-esquerdo', name: 'Conexão do(s) aileron(s) esquerdo(s)' },
      { id: 'aileron-direito', name: 'Aileron(s) direito(s)' },
      { id: 'conexao-aileron-direito', name: 'Conexão do(s) aileron(s) direito(s)' },
      { id: 'superficie-profundor', name: 'Superfície do profundor' },
      { id: 'conexao-profundor', name: 'Conexão do profundor' },
      { id: 'superficie-flapes-esquerda', name: 'Superfície dos flapes esquerda' },
      { id: 'conexao-flape-esquerdo', name: 'Conexão do flape esquerdo' },
      { id: 'flapes-direitos', name: 'Flapes direitos' },
      { id: 'conexao-flape-direito', name: 'Conexão do flape direito' },
      { id: 'superficie-leme-direcional', name: 'Superfície do leme direcional' },
      { id: 'conexao-leme-direcional', name: 'Conexão do leme direcional' }
    ]
  },
  {
    id: 'sistema-combustivel',
    name: 'Sistema de combustível',
    icon: '⛽',
    items: [
      { id: 'tanque-combustivel-1', name: 'Tanque de combustível 1' },
      { id: 'tanque-combustivel-2', name: 'Tanque de combustível 2' }
    ]
  },
  {
    id: 'sistema-eletrico',
    name: 'Sistema elétrico',
    icon: '⚡',
    items: [
      { id: 'alternador', name: 'Alternador' },
      { id: 'bateria-auxiliar', name: 'Bateria auxiliar' },
      { id: 'adc-ahrs', name: 'ADC AHRS' },
      { id: 'indicador-atitude', name: 'Indicador de atitude' },
      { id: 'piloto-automatico', name: 'Piloto automático' },
      { id: 'avionicos', name: 'Aviônicos' },
      { id: 'fornecimento-flapes-motor', name: 'Fornecimento de flapes do motor' },
      { id: 'fornecimento-bomba-combustivel', name: 'Fornecimento da bomba de combustível' },
      { id: 'valvula-combustivel', name: 'Válvula de combustível' },
      { id: 'fornecimento-marcha-motor', name: 'Fornecimento de marcha do motor' },
      { id: 'geral', name: 'Geral' },
      { id: 'visor-multifuncional', name: 'Visor Multifuncional' },
      { id: 'visor-voo-principal', name: 'Visor de Voo Principal' },
      { id: 'aquecimento-pitot', name: 'Aquecimento Pitot' },
      { id: 'vacuo-espera', name: 'Vácuo de espera' },
      { id: 'motor-partida', name: 'Motor de partida' },
      { id: 'circuito-transponder', name: 'Circuito transponder' },
      { id: 'bateria', name: 'Bateria' }
    ]
  },
  {
    id: 'trem-pouso',
    name: 'Trem de pouso',
    icon: '🛬',
    items: [
      { id: 'freios-1', name: 'Freios 1' },
      { id: 'freios-2', name: 'Freios 2' },
      { id: 'trem-pouso-1', name: 'Trem de pouso 1' },
      { id: 'trem-pouso-2', name: 'Trem de pouso 2' },
      { id: 'trem-pouso-3', name: 'Trem de pouso 3' },
      { id: 'pneu-1', name: 'Pneu 1' },
      { id: 'pneu-2', name: 'Pneu 2' },
      { id: 'pneu-3', name: 'Pneu 3' },
      { id: 'pressao-pneus-1', name: 'Pressão dos pneus 1' },
      { id: 'pressao-pneus-2', name: 'Pressão dos pneus 2' },
      { id: 'pressao-pneus-3', name: 'Pressão dos pneus 3' }
    ]
  },
  {
    id: 'geral',
    name: 'Geral',
    icon: '🔧',
    items: [
      { id: 'inspecao-geral', name: 'Inspeção geral' },
      { id: 'limpeza-aeronave', name: 'Limpeza da aeronave' },
      { id: 'verificacao-documentos', name: 'Verificação de documentos' },
      { id: 'teste-sistemas', name: 'Teste de sistemas' }
    ]
  },
  {
    id: 'sistema-luzes',
    name: 'Sistema de luzes',
    icon: '💡',
    items: [
      { id: 'luzes-navegacao', name: 'Luzes de navegação' },
      { id: 'luzes-pouso', name: 'Luzes de pouso' },
      { id: 'luzes-taxi', name: 'Luzes de taxi' },
      { id: 'luzes-strobo', name: 'Luzes strobo' },
      { id: 'luzes-cabine', name: 'Luzes de cabine' }
    ]
  },
  {
    id: 'contato-solo',
    name: 'Contato com solo',
    icon: '📡',
    items: [
      { id: 'radio-comunicacao', name: 'Rádio de comunicação' },
      { id: 'transponder', name: 'Transponder' },
      { id: 'sistema-gps', name: 'Sistema GPS' },
      { id: 'antenas', name: 'Antenas' }
    ]
  },
  {
    id: 'motor',
    name: 'Motor',
    icon: '🔩',
    items: [
      { id: 'motor-principal', name: 'Motor principal' },
      { id: 'helice', name: 'Hélice' },
      { id: 'sistema-oleo', name: 'Sistema de óleo' },
      { id: 'sistema-refrigeracao', name: 'Sistema de refrigeração' },
      { id: 'filtros-ar', name: 'Filtros de ar' },
      { id: 'velas-ignicao', name: 'Velas de ignição' },
      { id: 'sistema-escape', name: 'Sistema de escape' }
    ]
  }
];

// Status de manutenção
export type MaintenanceStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';

// Prioridades de manutenção
export type MaintenancePriority = 'low' | 'medium' | 'high' | 'critical';

// Interface para filtros
export interface MaintenanceFilters {
  aircraft?: string;
  category?: string;
  status?: MaintenanceStatus;
  priority?: MaintenancePriority;
  dateFrom?: string;
  dateTo?: string;
}

// Estatísticas de manutenção
export interface MaintenanceStats {
  totalMaintenances: number;
  pendingMaintenances: number;
  completedMaintenances: number;
  totalCost: number;
  averageCost: number;
  mostExpensiveCategory: string;
  lastMaintenanceDate: string;
}