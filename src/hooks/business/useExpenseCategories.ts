import { useState, useEffect } from 'react';

export interface ExpenseCategory {
  id: string;
  name: string;
  icon: string;
  description: string;
  isDefault: boolean;
  isActive: boolean;
}

const DEFAULT_CATEGORIES: ExpenseCategory[] = [
  {
    id: 'combustivel',
    name: 'Combustível',
    icon: '⛽',
    description: 'Abastecimento de aeronaves',
    isDefault: true,
    isActive: true
  },
  {
    id: 'manutencao',
    name: 'Manutenção',
    icon: '🔧',
    description: 'Reparos e inspeções de aeronaves',
    isDefault: true,
    isActive: true
  },
  {
    id: 'seguro',
    name: 'Seguro',
    icon: '🛡️',
    description: 'Seguro da aeronave e cobertura de danos',
    isDefault: true,
    isActive: true
  },
  {
    id: 'hangar',
    name: 'Hangar',
    icon: '🏢',
    description: 'Custos de hangar e estacionamento',
    isDefault: true,
    isActive: true
  },
  {
    id: 'nova-aeronave',
    name: 'Compra de Nova Aeronave',
    icon: '✈️',
    description: 'Aquisição de novas aeronaves',
    isDefault: true,
    isActive: true
  },
  {
    id: 'certificacoes',
    name: 'Certificações',
    icon: '📜',
    description: 'Custos de licenças e certificações de piloto',
    isDefault: true,
    isActive: true
  },
  {
    id: 'translado',
    name: 'Translado de Aeronave',
    icon: '🚁',
    description: 'Custos de transferência de aeronave entre aeroportos',
    isDefault: true,
    isActive: true
  },
  {
    id: 'pintura',
    name: 'Pintura e Livery',
    icon: '🎨',
    description: 'Customização e repintura de aeronaves',
    isDefault: true,
    isActive: true
  },
  {
    id: 'reparos-acidente',
    name: 'Reparos de Acidente',
    icon: '🔨',
    description: 'Custos de reparo após acidentes e danos',
    isDefault: true,
    isActive: true
  },
  {
    id: 'taxas-aeroporto',
    name: 'Taxas de Aeroporto',
    icon: '🏛️',
    description: 'Taxas de pouso, decolagem e serviços aeroportuários',
    isDefault: true,
    isActive: true
  },
  {
    id: 'contratacao-tripulacao',
    name: 'Contratação de Tripulação',
    icon: '👥',
    description: 'Custos de contratação e salários da tripulação',
    isDefault: true,
    isActive: true
  }
];

const STORAGE_KEY = 'msfs-expense-categories';

export const useExpenseCategories = () => {
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
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
        setCategories(DEFAULT_CATEGORIES);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_CATEGORIES));
      }
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
      setCategories(DEFAULT_CATEGORIES);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Salvar categorias no localStorage
  const saveCategories = (newCategories: ExpenseCategory[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newCategories));
      setCategories(newCategories);
    } catch (error) {
      console.error('Erro ao salvar categorias:', error);
    }
  };

  const addCategory = (category: Omit<ExpenseCategory, 'id' | 'isDefault'>) => {
    const newCategory: ExpenseCategory = {
      ...category,
      id: Date.now().toString(),
      isDefault: false
    };
    const updatedCategories = [...categories, newCategory];
    saveCategories(updatedCategories);
  };

  const updateCategory = (id: string, updates: Partial<ExpenseCategory>) => {
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
    setCategories(DEFAULT_CATEGORIES);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_CATEGORIES));
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