export type CompanyStatus = 'owned' | 'available' | 'locked';

export interface CompanyRequirement {
  type: 'specialization' | 'aircraft' | 'hours' | 'rating';
  description: string;
  completed: boolean;
}

export interface Company {
  id: string;
  name: string;
  type: string;
  description: string;
  status: CompanyStatus;
  price: number;
  currency: string;
  requirements: CompanyRequirement[];
  icon: string;
  category: 'transport' | 'specialized' | 'emergency' | 'commercial';
  unlockLevel?: number;
}

export interface CompanyStats {
  owned: number;
  available: number;
  locked: number;
  pendingQualifications: number;
}

export type CompanyCategory = {
  key: string;
  label: string;
  companies: Company[];
};