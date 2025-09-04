import React, { useState } from "react";
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
  Eye
} from "lucide-react";
import { Company, CompanyStats } from "@/types/companies";



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
                        <div className="p-2 rounded-lg bg-primary/20">
                          <Icon className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{company.name}</CardTitle>
                          {company.status === 'owned' && (
                            <Badge className={getStatusColor(company.status)}>
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Adquirido
                            </Badge>
                          )}
                        </div>
                      </div>
                      {company.status === 'owned' && (
                        <div className="text-right">
                          <span className="text-xs text-muted-foreground">Novo</span>
                        </div>
                      )}
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

export default Companies;