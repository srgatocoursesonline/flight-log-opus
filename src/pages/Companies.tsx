import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Building2,
  Plane,
  Users,
  Package,
  Heart,
  Sprout,
  Megaphone,
  Flame,
  Search,
  Wrench,
  CheckCircle,
  Lock,
  ShoppingCart,
  Eye,
  Plus,
  Edit,
  Trash2,
  Save,
  X
} from "lucide-react";
import { Company, CompanyStats } from "@/types/companies";
import { useSupabaseAircraftManager, CustomAircraft, AircraftType } from "@/hooks/supabase/useSupabaseAircraftManager";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";



// Dados mockados das empresas
const companies: Company[] = [
  // Empresas Elegíveis (Available)
  {
    id: 'tourist-flights',
    name: 'Voo Turístico',
    description: 'Ofereça voos panorâmicos e experiências turísticas únicas',
    icon: Plane,
    price: 0,
    currency: 'Cr.',
    status: 'owned',
    category: 'tourism'
  },
  {
    id: 'parachuting',
    name: 'Aviação de Paraquedismo',
    description: '1/1 Especialização desbloqueada\nAeronave disponível para compra',
    icon: Users,
    price: 20000,
    currency: 'Cr.',
    status: 'available',
    specialization: '1/1 Especialização desbloqueada',
    aircraft: 'Aeronave disponível para compra',
    category: 'specialized'
  },
  {
    id: 'cargo-transport',
    name: 'Transporte de Carga',
    description: 'Transporte eficiente de cargas e mercadorias',
    icon: Package,
    price: 0,
    currency: 'Cr.',
    status: 'owned',
    category: 'transport'
  },
  {
    id: 'passenger-transport',
    name: 'Transporte de Passageiros',
    description: '1/2 Especialização desbloqueada\nAeronave disponível para compra',
    icon: Users,
    price: 150000,
    currency: 'Cr.',
    status: 'available',
    specialization: '1/2 Especialização desbloqueada',
    aircraft: 'Aeronave disponível para compra',
    category: 'transport'
  },
  {
    id: 'charter-service',
    name: 'Serviço de Fretamento',
    description: 'Voos charter personalizados para clientes VIP',
    icon: Building2,
    price: 0,
    currency: 'Cr.',
    status: 'owned',
    category: 'commercial'
  },
  {
    id: 'medevac',
    name: 'Medevac',
    description: '1/1 Especialização desbloqueada\nAeronave disponível para compra',
    icon: Heart,
    price: 50000,
    currency: 'Cr.',
    status: 'available',
    specialization: '1/1 Especialização desbloqueada',
    aircraft: 'Aeronave disponível para compra',
    category: 'emergency'
  },
  // Qualificações Pendentes
  {
    id: 'agricultural-aviation',
    name: 'Aviação Agrícola',
    description: '0/1 Especialização desbloqueada\n0/1 Aeronave disponível para compra',
    icon: Sprout,
    price: 70000,
    currency: 'Cr.',
    status: 'locked',
    requirements: '0/1 Especialização desbloqueada',
    category: 'specialized'
  },
  {
    id: 'aerial-advertising',
    name: 'Publicidade Aérea',
    description: '0/1 Especialização desbloqueada\nAeronave disponível para compra',
    icon: Megaphone,
    price: 35000,
    currency: 'Cr.',
    status: 'locked',
    requirements: '0/1 Especialização desbloqueada',
    category: 'commercial'
  },
  {
    id: 'firefighting',
    name: 'Luta Aérea Contra Incêndios',
    description: '0/2 Especialização desbloqueada\nAeronave disponível para compra',
    icon: Flame,
    price: 100000,
    currency: 'Cr.',
    status: 'locked',
    requirements: '0/2 Especialização desbloqueada',
    category: 'emergency'
  },
  {
    id: 'search-rescue',
    name: 'Busca e Salvamento',
    description: '0/3 Especialização desbloqueada\nAeronave disponível para compra',
    icon: Search,
    price: 40000,
    currency: 'Cr.',
    status: 'locked',
    requirements: '0/3 Especialização desbloqueada',
    category: 'emergency'
  },
  {
    id: 'aerial-construction',
    name: 'Construção Aérea',
    description: '0/1 Especialização desbloqueada\nAeronave disponível para compra',
    icon: Wrench,
    price: 200000,
    currency: 'Cr.',
    status: 'locked',
    requirements: '0/1 Especialização desbloqueada',
    category: 'specialized'
  }
];

const Companies = () => {
  const { t } = useTranslation();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const getStatusIcon = (status: Company['status']) => {
    switch (status) {
      case 'owned':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'available':
        return <ShoppingCart className="h-4 w-4 text-blue-500" />;
      case 'locked':
        return <Lock className="h-4 w-4 text-gray-500" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusText = (status: Company['status']) => {
    switch (status) {
      case 'owned':
        return 'Adquirido';
      case 'available':
        return 'Comprar';
      case 'locked':
        return 'Bloqueado';
      default:
        return 'Pendente';
    }
  };

  const getStatusColor = (status: Company['status']) => {
    switch (status) {
      case 'owned':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'available':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'locked':
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      default:
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    }
  };

  const filteredCompanies = selectedCategory === 'all' 
    ? companies 
    : companies.filter(company => company.category === selectedCategory);

  const ownedCompanies = companies.filter(c => c.status === 'owned');
  const availableCompanies = companies.filter(c => c.status === 'available');
  const lockedCompanies = companies.filter(c => c.status === 'locked');

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">
          {t('companies.title')}
        </h1>
        <p className="text-muted-foreground">
          {t('companies.subtitle')}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="glass-panel">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Empresas Adquiridas</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{ownedCompanies.length}</div>
            <p className="text-xs text-muted-foreground">
              de {companies.length} disponíveis
            </p>
          </CardContent>
        </Card>
        
        <Card className="glass-panel">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Disponíveis para Compra</CardTitle>
            <ShoppingCart className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{availableCompanies.length}</div>
            <p className="text-xs text-muted-foreground">
              prontas para aquisição
            </p>
          </CardContent>
        </Card>
        
        <Card className="glass-panel">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Qualificações Pendentes</CardTitle>
            <Lock className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{lockedCompanies.length}</div>
            <p className="text-xs text-muted-foreground">
              requerem especialização
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="eligible" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="eligible">Empresas Elegíveis</TabsTrigger>
          <TabsTrigger value="pending">Qualificações Pendentes</TabsTrigger>
        </TabsList>
        
        <TabsContent value="eligible" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {companies.filter(c => c.status === 'owned' || c.status === 'available').map((company) => {
              const Icon = company.icon;
              return (
                <Card key={company.id} className="glass-panel hover:glass-panel-hover transition-all duration-200">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${getStatusColor(company.status)}`}>
                          <Icon className="h-6 w-6" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{company.name}</CardTitle>
                          <Badge className={getStatusColor(company.status)}>
                            {getStatusIcon(company.status)}
                            {getStatusText(company.status)}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-muted-foreground">Novo</span>
                      </div>
                    </div>
                    
                    {/* Botão de gerenciamento de aeronaves */}
                    <div className="mt-3">
                      <CompanyAircraftManager 
                        company={company} 
                        onAircraftUpdate={() => {
                          console.log('Aircraft updated for company:', company.name);
                        }} 
                      />
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {company.specialization && (
                      <div className="space-y-2">
                        <div className="flex items-center text-sm text-green-400">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          {company.specialization}
                        </div>
                        {company.aircraft && (
                          <div className="flex items-center text-sm text-green-400">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            {company.aircraft}
                          </div>
                        )}
                      </div>
                    )}
                    
                    <p className="text-sm text-muted-foreground">
                      {company.description.split('\n')[0]}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      {company.status === 'available' ? (
                        <>
                          <div className="text-right">
                            <div className="text-lg font-bold">
                              {company.price.toLocaleString()} {company.currency}
                            </div>
                          </div>
                          <Button size="sm" className="ml-auto">
                            Comprar
                          </Button>
                        </>
                      ) : (
                        <Badge className={getStatusColor(company.status)} variant="outline">
                          {getStatusIcon(company.status)}
                          {getStatusText(company.status)}
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
        
        <TabsContent value="pending" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {lockedCompanies.map((company) => {
              const Icon = company.icon;
              return (
                <Card key={company.id} className="glass-panel opacity-75">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 rounded-lg bg-gray-500/20">
                          <Icon className="h-6 w-6 text-gray-400" />
                        </div>
                        <div>
                          <CardTitle className="text-lg text-gray-300">{company.name}</CardTitle>
                          <Badge className={getStatusColor(company.status)}>
                            <Lock className="h-3 w-3 mr-1" />
                            Bloqueado
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-yellow-400">Novo</span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {company.requirements && (
                      <div className="space-y-2">
                        <div className="flex items-center text-sm text-red-400">
                          <Lock className="h-3 w-3 mr-1" />
                          {company.requirements}
                        </div>
                        <div className="flex items-center text-sm text-green-400">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Aeronave disponível para compra
                        </div>
                      </div>
                    )}
                    
                    <p className="text-sm text-muted-foreground">
                      {company.description.split('\n')[0]}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="text-right">
                        <div className="text-lg font-bold text-gray-400">
                          {company.price.toLocaleString()} {company.currency}
                        </div>
                      </div>
                      <Button size="sm" disabled className="ml-auto">
                        Comprar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Interface para gerenciamento de aeronaves por empresa
interface CompanyAircraftManagerProps {
  company: Company;
  onAircraftUpdate?: () => void;
}

const CompanyAircraftManager: React.FC<CompanyAircraftManagerProps> = ({ company, onAircraftUpdate }) => {
  const { t } = useTranslation();
  const { customAircraft, loading, addAircraft, deleteAircraft, toggleAircraftActive, refresh } = useSupabaseAircraftManager();
  const [isOpen, setIsOpen] = useState(false);
  const [isAddingAircraft, setIsAddingAircraft] = useState(false);
  const [editingAircraft, setEditingAircraft] = useState<CustomAircraft | null>(null);
  
  // Filtrar aeronaves por tipo baseado na categoria da empresa
  const getAircraftByCompanyCategory = (aircraft: CustomAircraft[]) => {
    const categoryMap: Record<string, AircraftType[]> = {
      'tourism': ['general', 'commercial'],
      'transport': ['commercial', 'business'],
      'commercial': ['commercial', 'business', 'general'],
      'emergency': ['helicopter', 'commercial', 'military'],
      'specialized': ['bush', 'aerobatic', 'agricultural', 'other']
    };
    
    const allowedTypes = categoryMap[company.category] || ['general', 'other'];
    return aircraft.filter(aircraft => allowedTypes.includes(aircraft.type));
  };
  
  const companyAircraft = getAircraftByCompanyCategory(customAircraft);
  const activeAircraft = companyAircraft.filter(a => a.isActive);
  const inactiveAircraft = companyAircraft.filter(a => !a.isActive);
  
  useEffect(() => {
    if (isOpen) {
      refresh();
    }
  }, [isOpen, refresh]);
  
  const handleAddAircraft = async (aircraftData: Omit<CustomAircraft, 'id' | 'isDefault'>) => {
    try {
      await addAircraft(aircraftData);
      setIsAddingAircraft(false);
      onAircraftUpdate?.();
    } catch (error) {
      console.error('Error adding aircraft:', error);
    }
  };
  
  const handleDeleteAircraft = async (aircraftId: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta aeronave?')) {
      try {
        await deleteAircraft(aircraftId);
        onAircraftUpdate?.();
      } catch (error) {
        console.error('Error deleting aircraft:', error);
      }
    }
  };
  
  const handleToggleActive = async (aircraftId: string) => {
    try {
      await toggleAircraftActive(aircraftId);
      onAircraftUpdate?.();
    } catch (error) {
      console.error('Error toggling aircraft:', error);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="ml-2">
          <Plane className="h-4 w-4 mr-1" />
          Aeronaves
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Gerenciar Aeronaves - {company.name}</DialogTitle>
          <DialogDescription>
            Visualize e gerencie as aeronaves disponíveis para esta empresa
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Estatísticas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Aeronaves</CardTitle>
                <Plane className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{companyAircraft.length}</div>
                <p className="text-xs text-muted-foreground">
                  {activeAircraft.length} ativas
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Aeronaves Ativas</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-500">{activeAircraft.length}</div>
                <p className="text-xs text-muted-foreground">
                  Prontas para uso
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Inativas</CardTitle>
                <X className="h-4 w-4 text-gray-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-500">{inactiveAircraft.length}</div>
                <p className="text-xs text-muted-foreground">
                  Não disponíveis
                </p>
              </CardContent>
            </Card>
          </div>
          
          {/* Botão de adicionar nova aeronave */}
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Aeronaves da Empresa</h3>
            <Button onClick={() => setIsAddingAircraft(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Aeronave
            </Button>
          </div>
          
          {/* Formulário de adicionar/editar aeronave */}
          {(isAddingAircraft || editingAircraft) && (
            <AircraftForm
              aircraft={editingAircraft}
              companyCategory={company.category}
              onSave={editingAircraft ? handleAddAircraft : handleAddAircraft}
              onCancel={() => {
                setIsAddingAircraft(false);
                setEditingAircraft(null);
              }}
            />
          )}
          
          {/* Lista de aeronaves */}
          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-8">Carregando aeronaves...</div>
            ) : (
              <>
                {/* Aeronaves Ativas */}
                {activeAircraft.length > 0 && (
                  <div>
                    <h4 className="text-md font-medium mb-3 text-green-600">Aeronaves Ativas</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {activeAircraft.map((aircraft) => (
                        <AircraftCard
                          key={aircraft.id}
                          aircraft={aircraft}
                          onEdit={setEditingAircraft}
                          onDelete={handleDeleteAircraft}
                          onToggleActive={handleToggleActive}
                        />
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Aeronaves Inativas */}
                {inactiveAircraft.length > 0 && (
                  <div>
                    <h4 className="text-md font-medium mb-3 text-gray-600">Aeronaves Inativas</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {inactiveAircraft.map((aircraft) => (
                        <AircraftCard
                          key={aircraft.id}
                          aircraft={aircraft}
                          onEdit={setEditingAircraft}
                          onDelete={handleDeleteAircraft}
                          onToggleActive={handleToggleActive}
                        />
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Nenhuma aeronave */}
                {companyAircraft.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Plane className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhuma aeronave cadastrada para esta empresa.</p>
                    <p className="text-sm">Clique em "Adicionar Aeronave" para começar.</p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Componente de formulário de aeronave
interface AircraftFormProps {
  aircraft?: CustomAircraft | null;
  companyCategory: string;
  onSave: (aircraft: Omit<CustomAircraft, 'id' | 'isDefault'>) => void;
  onCancel: () => void;
}

const AircraftForm: React.FC<AircraftFormProps> = ({ aircraft, companyCategory, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: aircraft?.name || '',
    manufacturer: aircraft?.manufacturer || '',
    type: aircraft?.type || 'general' as AircraftType,
    description: aircraft?.description || '',
    isActive: aircraft?.isActive ?? true,
    hourlyRate: aircraft?.hourlyRate || 0,
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const aircraftTypesByCategory: Record<string, AircraftType[]> = {
    'tourism': ['general', 'commercial'],
    'transport': ['commercial', 'business'],
    'commercial': ['commercial', 'business', 'general'],
    'emergency': ['helicopter', 'commercial', 'military'],
    'specialized': ['bush', 'aerobatic', 'other']
  };
  
  const allowedTypes = aircraftTypesByCategory[companyCategory] || ['general'];
  
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Nome da aeronave é obrigatório';
    }
    
    if (!formData.manufacturer.trim()) {
      newErrors.manufacturer = 'Fabricante é obrigatório';
    }
    
    if (formData.hourlyRate < 0) {
      newErrors.hourlyRate = 'Taxa horária não pode ser negativa';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSave(formData);
    }
  };
  
  return (
    <Card className="bg-muted/50">
      <CardHeader>
        <CardTitle className="text-lg">
          {aircraft ? 'Editar Aeronave' : 'Adicionar Nova Aeronave'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Nome da Aeronave *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="Ex: Cessna 172"
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name}</p>}
            </div>
            
            <div>
              <Label htmlFor="manufacturer">Fabricante *</Label>
              <Input
                id="manufacturer"
                value={formData.manufacturer}
                onChange={(e) => setFormData({...formData, manufacturer: e.target.value})}
                placeholder="Ex: Cessna"
                className={errors.manufacturer ? 'border-red-500' : ''}
              />
              {errors.manufacturer && <p className="text-sm text-red-500 mt-1">{errors.manufacturer}</p>}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="type">Tipo de Aeronave</Label>
              <Select value={formData.type} onValueChange={(value) => setFormData({...formData, type: value as AircraftType})}>
                <SelectTrigger id="type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {allowedTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type === 'commercial' ? 'Comercial' :
                       type === 'business' ? 'Executiva' :
                       type === 'general' ? 'Aviação Geral' :
                       type === 'bush' ? 'Bush/Sport' :
                       type === 'aerobatic' ? 'Acrobática' :
                       type === 'glider' ? 'Planador' :
                       type === 'helicopter' ? 'Helicóptero' :
                       type === 'military' ? 'Militar' : 'Outros'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="hourlyRate">Taxa Horária (Cr./h)</Label>
              <Input
                id="hourlyRate"
                type="number"
                value={formData.hourlyRate}
                onChange={(e) => setFormData({...formData, hourlyRate: parseFloat(e.target.value) || 0})}
                placeholder="150"
                min="0"
                step="0.01"
                className={errors.hourlyRate ? 'border-red-500' : ''}
              />
              {errors.hourlyRate && <p className="text-sm text-red-500 mt-1">{errors.hourlyRate}</p>}
            </div>
          </div>
          
          <div>
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Descrição opcional da aeronave..."
              rows={3}
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              id="isActive"
              checked={formData.isActive}
              onChange={(checked) => setFormData({...formData, isActive: checked})}
            />
            <Label htmlFor="isActive">Aeronave ativa e disponível para uso</Label>
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              <X className="h-4 w-4 mr-1" />
              Cancelar
            </Button>
            <Button type="submit">
              <Save className="h-4 w-4 mr-1" />
              {aircraft ? 'Atualizar' : 'Salvar'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

// Componente de cartão de aeronave
interface AircraftCardProps {
  aircraft: CustomAircraft;
  onEdit: (aircraft: CustomAircraft) => void;
  onDelete: (aircraftId: string) => void;
  onToggleActive: (aircraftId: string) => void;
}

const AircraftCard: React.FC<AircraftCardProps> = ({ aircraft, onEdit, onDelete, onToggleActive }) => {
  const getTypeLabel = (type: AircraftType) => {
    const labels: Record<AircraftType, string> = {
      commercial: 'Comercial',
      business: 'Executiva',
      general: 'Aviação Geral',
      bush: 'Bush/Sport',
      aerobatic: 'Acrobática',
      glider: 'Planador',
      helicopter: 'Helicóptero',
      military: 'Militar',
      other: 'Outros'
    };
    return labels[type] || type;
  };
  
  return (
    <Card className={aircraft.isActive ? 'border-green-200 bg-green-50/10' : 'border-gray-200 bg-gray-50/10'}>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-md">{aircraft.name}</CardTitle>
            <p className="text-sm text-muted-foreground">{aircraft.manufacturer}</p>
          </div>
          <div className="flex items-center space-x-1">
            <Badge variant={aircraft.isActive ? 'default' : 'secondary'}>
              {aircraft.isActive ? 'Ativa' : 'Inativa'}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex justify-between items-center text-sm">
          <span className="text-muted-foreground">Tipo:</span>
          <Badge variant="outline">{getTypeLabel(aircraft.type)}</Badge>
        </div>
        
        <div className="flex justify-between items-center text-sm">
          <span className="text-muted-foreground">Taxa Horária:</span>
          <span className="font-medium">{aircraft.hourlyRate.toLocaleString()} Cr./h</span>
        </div>
        
        {aircraft.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">{aircraft.description}</p>
        )}
        
        <div className="flex justify-end space-x-2 pt-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onToggleActive(aircraft.id)}
          >
            {aircraft.isActive ? <X className="h-3 w-3" /> : <CheckCircle className="h-3 w-3" />}
            <span className="ml-1">{aircraft.isActive ? 'Desativar' : 'Ativar'}</span>
          </Button>
          
          <Button
            size="sm"
            variant="outline"
            onClick={() => onEdit(aircraft)}
          >
            <Edit className="h-3 w-3" />
            <span className="ml-1">Editar</span>
          </Button>
          
          <Button
            size="sm"
            variant="outline"
            onClick={() => onDelete(aircraft.id)}
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="h-3 w-3" />
            <span className="ml-1">Excluir</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
export default Companies;