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
    id: 'lavagem',
    name: 'Lavagem do Avião',
    icon: '🧽',
    description: 'Limpeza e manutenção básica',
    isDefault: true,
    isActive: true
  },
  {
    id: 'manutencao',
    name: 'Manutenção',
    icon: '🔧',
    description: 'Reparos e inspeções',
    isDefault: true,
    isActive: true
  },
  {
    id: 'translado',
    name: 'Translado',
    icon: '🚗',
    description: 'Transporte e deslocamento',
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
    id: 'pintura',
    name: 'Pintura',
    icon: '🎨',
    description: 'Customização e livery',
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