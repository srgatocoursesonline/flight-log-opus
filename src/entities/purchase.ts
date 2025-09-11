export interface Purchase {
  id?: string;
  purchaseCode: string;
  title: string;
  category: 'Aeronave' | 'Combustível' | 'Equipamentos' | 'Suprimentos';
  subcategory: string;
  budgetedValue: number;
  negotiatedValue: number;
  finalValue: number;
  purchaseDate: string;
  buyer: string;
  notes?: string;
  status: 'pending' | 'approved' | 'completed' | 'cancelled';
  createdAt?: string;
  updatedAt?: string;
}

export interface PurchaseFormData {
  title: string;
  category: 'Aeronave' | 'Combustível' | 'Equipamentos' | 'Suprimentos';
  subcategory: string;
  budgetedValue: number;
  negotiatedValue: number;
  finalValue: number;
  purchaseDate: string;
  buyer: string;
  notes?: string;
  status?: 'pending' | 'approved' | 'completed' | 'cancelled';
}