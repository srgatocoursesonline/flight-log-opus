import { useState, useEffect } from 'react';

export interface RevenueCategory {
  id: string;
  name: string;
  icon: string;
  description: string;
  isDefault: boolean;
  isActive: boolean;
}

const DEFAULT_REVENUE_CATEGORIES: RevenueCategory[] = [
  {
    id: 'vip-charter',
    name: 'Voos VIP Charter',
    icon: '✈️',
    description: 'Voos charter VIP com Vision Jet e aeronaves de luxo',
    isDefault: true,
    isActive: true
  },
  {
    id: 'cargo-missions',
    name: 'Missões de Carga',
    icon: '📦',
    description: 'Transporte de carga e mercadorias',
    isDefault: true,
    isActive: true
  },
  {
    id: 'sightseeing',
    name: 'Voos Turísticos',
    icon: '🌄',
    description: 'Voos panorâmicos e turismo aéreo',
    isDefault: true,
    isActive: true
  },
  {
    id: 'search-rescue',
    name: 'Busca e Salvamento',
    icon: '🚁',
    description: 'Operações de busca e salvamento',
    isDefault: true,
    isActive: true
  },
  {
    id: 'medevac',
    name: 'Transporte Médico',
    icon: '🏥',
    description: 'Evacuação médica e transporte de emergência',
    isDefault: true,
    isActive: true
  },
  {
    id: 'firefighting',
    name: 'Combate a Incêndios',
    icon: '🔥',
    description: 'Operações de combate a incêndios florestais',
    isDefault: true,
    isActive: true
  },
  {
    id: 'skydiving',
    name: 'Paraquedismo',
    icon: '🪂',
    description: 'Voos para atividades de paraquedismo',
    isDefault: true,
    isActive: true
  },
  {
    id: 'flight-training',
    name: 'Instrução de Voo',
    icon: '👨‍🏫',
    description: 'Receitas por instrução e treinamento de pilotos',
    isDefault: true,
    isActive: true
  },
  {
    id: 'passive-income',
    name: 'Renda Passiva',
    icon: '💰',
    description: 'Receitas passivas de certificações e contratos',
    isDefault: true,
    isActive: true
  },
  {
    id: 'bonus-reputation',
    name: 'Bônus de Reputação',
    icon: '⭐',
    description: 'Bônus por alta reputação e excelência operacional',
    isDefault: true,
    isActive: true
  },
  {
    id: 'special-contracts',
    name: 'Contratos Especiais',
    icon: '📋',
    description: 'Contratos exclusivos e missões especializadas',
    isDefault: true,
    isActive: true
  },
  {
    id: 'outros',
    name: 'Outras Receitas',
    icon: '💵',
    description: 'Receitas diversas não categorizadas',
    isDefault: true,
    isActive: true
  }
];

const STORAGE_KEY = 'msfs-revenue-categories';

export const useRevenueCategories = () => {
  const [categories, setCategories] = useState<RevenueCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Carregar categorias do localStorage
  useEffect(() => {
    try {
      const savedCategories = localStorage.getItem(STORAGE_KEY);
      if (savedCategories) {
        const parsedCategories = JSON.parse(savedCategories);
        setCategories(parsedCategories);
      } else {
        // Primeira inicialização - usar categorias padrão
        setCategories(DEFAULT_REVENUE_CATEGORIES);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_REVENUE_CATEGORIES));
      }
    } catch (error) {
      console.error('Erro ao carregar categorias de receita:', error);
      setCategories(DEFAULT_REVENUE_CATEGORIES);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Salvar categorias no localStorage
  const saveCategories = (newCategories: RevenueCategory[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newCategories));
      setCategories(newCategories);
    } catch (error) {
      console.error('Erro ao salvar categorias de receita:', error);
    }
  };

  const addCategory = (category: Omit<RevenueCategory, 'id' | 'isDefault'>) => {
    const newCategory: RevenueCategory = {
      ...category,
      id: Date.now().toString(),
      isDefault: false
    };
    const updatedCategories = [...categories, newCategory];
    saveCategories(updatedCategories);
  };

  const updateCategory = (id: string, updates: Partial<RevenueCategory>) => {
    const updatedCategories = categories.map(category =>
      category.id === id ? { ...category, ...updates } : category
    );
    saveCategories(updatedCategories);
  };

  const deleteCategory = (id: string) => {
    // Não permitir excluir categorias padrão
    const category = categories.find(cat => cat.id === id);
    if (category?.isDefault) {
      throw new Error('Não é possível excluir categorias padrão');
    }
    
    const updatedCategories = categories.filter(category => category.id !== id);
    saveCategories(updatedCategories);
  };

  const toggleCategoryActive = (id: string) => {
    const updatedCategories = categories.map(category =>
      category.id === id ? { ...category, isActive: !category.isActive } : category
    );
    saveCategories(updatedCategories);
  };

  const getActiveCategories = () => {
    return categories.filter(category => category.isActive);
  };

  const resetToDefaults = () => {
    setCategories(DEFAULT_REVENUE_CATEGORIES);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_REVENUE_CATEGORIES));
  };

  return {
    categories,
    isLoading,
    addCategory,
    updateCategory,
    deleteCategory,
    toggleCategoryActive,
    getActiveCategories,
    resetToDefaults
  };
};