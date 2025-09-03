import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Switch } from '@/components/ui/switch';
import { Plus, Plane, Settings2, Trash2, Edit, RotateCcw, Clock, Fuel } from 'lucide-react';
import { useSupabaseAircraftManager, type CustomAircraft } from '@/hooks/supabase/useSupabaseAircraftManager';
import { useSupabaseFlightStatusManager, type FlightStatus } from '@/hooks/supabase/useSupabaseFlightStatusManager';
import { useFlightSettings, type FuelUnit } from '@/hooks/business/useFlightSettings';
import { useToast } from '@/hooks/ui/use-toast';

export const FlightConfigManager = () => {
  const aircraftManager = useSupabaseAircraftManager();
  const statusManager = useSupabaseFlightStatusManager();
  const flightSettings = useFlightSettings();
  const { toast } = useToast();
  
  // Estados para modais de aeronaves
  const [isAddAircraftDialogOpen, setIsAddAircraftDialogOpen] = useState(false);
  const [editingAircraft, setEditingAircraft] = useState<CustomAircraft | null>(null);
  const [newAircraft, setNewAircraft] = useState({
    name: '',
    manufacturer: '',
    type: 'general' as CustomAircraft['type'],
    description: '',
    hourlyRate: 0
  });

  // Estados para modais de status
  const [isAddStatusDialogOpen, setIsAddStatusDialogOpen] = useState(false);
  const [editingStatus, setEditingStatus] = useState<FlightStatus | null>(null);
  const [newStatus, setNewStatus] = useState({
    name: '',
    color: '#10B981',
    icon: '✈️',
    description: '',
    hourlyMultiplier: 1.0
  });

  const aircraftTypes = [
    { value: 'commercial', label: 'Comercial' },
    { value: 'business', label: 'Executiva' },
    { value: 'general', label: 'Aviação Geral' },
    { value: 'bush', label: 'Bush/Sport' },
    { value: 'aerobatic', label: 'Acrobática' },
    { value: 'glider', label: 'Planador' },
    { value: 'helicopter', label: 'Helicóptero' },
    { value: 'military', label: 'Militar' },
    { value: 'other', label: 'Outros' }
  ];

  // Funções para aeronaves
  const handleAddAircraft = () => {
    if (!newAircraft.name.trim()) {
      toast({
        title: "Erro",
        description: "Nome da aeronave é obrigatório",
        variant: "destructive",
      });
      return;
    }

    try {
      aircraftManager.addAircraft({
        name: newAircraft.name.trim(),
        manufacturer: newAircraft.manufacturer.trim(),
        type: newAircraft.type,
        description: newAircraft.description.trim(),
        isActive: true,
        hourlyRate: newAircraft.hourlyRate
      });

      toast({
        title: "Sucesso!",
        description: "Aeronave adicionada com sucesso",
      });

      setNewAircraft({ name: '', manufacturer: '', type: 'general', description: '', hourlyRate: 0 });
      setIsAddAircraftDialogOpen(false);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao adicionar aeronave",
        variant: "destructive",
      });
    }
  };

  // Funções para status
  const handleAddStatus = () => {
    if (!newStatus.name.trim()) {
      toast({
        title: "Erro",
        description: "Nome do status é obrigatório",
        variant: "destructive",
      });
      return;
    }

    try {
      statusManager.addStatus({
        name: newStatus.name.trim(),
        color: newStatus.color,
        icon: newStatus.icon.trim(),
        description: newStatus.description.trim(),
        isActive: true,
        hourlyMultiplier: newStatus.hourlyMultiplier
      });

      toast({
        title: "Sucesso!",
        description: "Status adicionado com sucesso",
      });

      setNewStatus({ name: '', color: '#10B981', icon: '✈️', description: '', hourlyMultiplier: 1.0 });
      setIsAddStatusDialogOpen(false);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao adicionar status",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="hud-display">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground">
          <Settings2 className="h-5 w-5 text-primary" />
          Configurações de Voo
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="general" className="flex items-center gap-2">
              <Settings2 className="h-4 w-4" />
              Geral
            </TabsTrigger>
            <TabsTrigger value="aircraft" className="flex items-center gap-2">
              <Plane className="h-4 w-4" />
              Aeronaves
            </TabsTrigger>
            <TabsTrigger value="status" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Status
            </TabsTrigger>
          </TabsList>
          
          {/* Tab de Configurações Gerais */}
          <TabsContent value="general" className="space-y-4">
            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-medium text-foreground mb-4">Unidades de Medida</h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Fuel className="h-5 w-5 text-primary" />
                      <div>
                        <Label className="text-sm font-medium">Unidade de Combustível</Label>
                        <p className="text-xs text-muted-foreground mt-1">
                          Escolha a unidade para inserir combustível nos voos
                        </p>
                      </div>
                    </div>
                    <Select 
                      value={flightSettings.fuelUnit} 
                      onValueChange={(value: FuelUnit) => {
                        const success = flightSettings.setFuelUnit(value);
                        if (success) {
                          toast({
                            title: "Configuração salva!",
                            description: `Unidade de combustível alterada para ${value === 'kg' ? 'quilogramas (kg)' : 'libras (lb)'}`,
                          });
                        } else {
                          toast({
                            title: "Erro",
                            description: "Erro ao salvar configuração",
                            variant: "destructive",
                          });
                        }
                      }}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="lb">Libras (lb)</SelectItem>
                        <SelectItem value="kg">Quilogramas (kg)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              
              <div className="pt-4 border-t">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="text-sm font-medium text-foreground">Restaurar Configurações</h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      Voltar às configurações padrão do sistema
                    </p>
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <RotateCcw className="h-4 w-4 mr-2" />
                        Restaurar Padrões
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="glass-panel">
                      <AlertDialogHeader>
                        <AlertDialogTitle>Restaurar Configurações Padrão</AlertDialogTitle>
                        <AlertDialogDescription>
                          Isso irá restaurar todas as configurações gerais para os valores padrão.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={() => {
                          const success = flightSettings.resetToDefaults();
                          if (success) {
                            toast({
                              title: "Configurações restauradas!",
                              description: "Todas as configurações foram restauradas para os valores padrão",
                            });
                          } else {
                            toast({
                              title: "Erro",
                              description: "Erro ao restaurar configurações",
                              variant: "destructive",
                            });
                          }
                        }}>
                          Restaurar
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </div>
          </TabsContent>
          
          {/* Tab de Aeronaves */}
          <TabsContent value="aircraft" className="space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="text-sm font-medium text-foreground">Aeronaves Personalizadas</h4>
              <div className="flex gap-2">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Restaurar
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="glass-panel">
                    <AlertDialogHeader>
                      <AlertDialogTitle>Restaurar Aeronaves Padrão</AlertDialogTitle>
                      <AlertDialogDescription>
                        Isso irá restaurar as aeronaves para os valores padrão e remover todas as personalizações.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction onClick={aircraftManager.resetToDefaults}>
                        Restaurar
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>

                <Dialog open={isAddAircraftDialogOpen} onOpenChange={setIsAddAircraftDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="hud" size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Nova Aeronave
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="glass-panel">
                    <DialogHeader>
                      <DialogTitle>Adicionar Nova Aeronave</DialogTitle>
                    </DialogHeader>
                    
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="aircraft-name">Nome *</Label>
                          <Input
                            id="aircraft-name"
                            placeholder="Ex: Cessna 172 Custom"
                            value={newAircraft.name}
                            onChange={(e) => setNewAircraft({ ...newAircraft, name: e.target.value })}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="aircraft-manufacturer">Fabricante</Label>
                          <Input
                            id="aircraft-manufacturer"
                            placeholder="Ex: Cessna"
                            value={newAircraft.manufacturer}
                            onChange={(e) => setNewAircraft({ ...newAircraft, manufacturer: e.target.value })}
                            className="mt-1"
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="aircraft-type">Tipo</Label>
                          <Select value={newAircraft.type} onValueChange={(value: CustomAircraft['type']) => setNewAircraft({ ...newAircraft, type: value })}>
                            <SelectTrigger className="mt-1">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {aircraftTypes.map((type) => (
                                <SelectItem key={type.value} value={type.value}>
                                  {type.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="aircraft-rate">CR por Hora</Label>
                          <Input
                            id="aircraft-rate"
                            type="number"
                            min="0"
                            placeholder="150"
                            value={newAircraft.hourlyRate}
                            onChange={(e) => setNewAircraft({ ...newAircraft, hourlyRate: Number(e.target.value) })}
                            className="mt-1"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <Label htmlFor="aircraft-description">Descrição</Label>
                        <Input
                          id="aircraft-description"
                          placeholder="Descrição da aeronave personalizada"
                          value={newAircraft.description}
                          onChange={(e) => setNewAircraft({ ...newAircraft, description: e.target.value })}
                          className="mt-1"
                        />
                      </div>
                      
                      <div className="flex justify-end gap-3 pt-4">
                        <Button variant="outline" onClick={() => setIsAddAircraftDialogOpen(false)}>
                          Cancelar
                        </Button>
                        <Button onClick={handleAddAircraft}>
                          Adicionar
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto">
              {aircraftManager.customAircraft.map((aircraft) => (
                <div
                  key={aircraft.id}
                  className="flex items-center justify-between p-3 bg-muted/20 rounded-lg hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <Plane className="h-5 w-5 text-blue-600" />
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h5 className="font-medium text-foreground">{aircraft.name}</h5>
                        {aircraft.manufacturer && (
                          <Badge variant="outline" className="text-xs">
                            {aircraft.manufacturer}
                          </Badge>
                        )}
                        {!aircraft.isActive && (
                          <Badge variant="secondary" className="text-xs">
                            Inativa
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {aircraftTypes.find(t => t.value === aircraft.type)?.label}
                        {aircraft.hourlyRate && ` • ${aircraft.hourlyRate} CR/h`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Switch
                      checked={aircraft.isActive}
                      onCheckedChange={() => aircraftManager.toggleAircraftActive(aircraft.id)}
                    />
                    {!aircraft.isDefault && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => aircraftManager.deleteAircraft(aircraft.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Tab de Status */}
          <TabsContent value="status" className="space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="text-sm font-medium text-foreground">Status de Voo</h4>
              <div className="flex gap-2">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Restaurar
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="glass-panel">
                    <AlertDialogHeader>
                      <AlertDialogTitle>Restaurar Status Padrão</AlertDialogTitle>
                      <AlertDialogDescription>
                        Isso irá restaurar os status para os valores padrão e remover todas as personalizações.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction onClick={statusManager.resetToDefaults}>
                        Restaurar
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>

                <Dialog open={isAddStatusDialogOpen} onOpenChange={setIsAddStatusDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="hud" size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Novo Status
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="glass-panel">
                    <DialogHeader>
                      <DialogTitle>Adicionar Novo Status</DialogTitle>
                    </DialogHeader>
                    
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="status-name">Nome *</Label>
                          <Input
                            id="status-name"
                            placeholder="Ex: Prioridade Alta"
                            value={newStatus.name}
                            onChange={(e) => setNewStatus({ ...newStatus, name: e.target.value })}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="status-icon">Ícone</Label>
                          <Input
                            id="status-icon"
                            placeholder="🚀"
                            value={newStatus.icon}
                            onChange={(e) => setNewStatus({ ...newStatus, icon: e.target.value })}
                            className="mt-1"
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="status-color">Cor</Label>
                          <Input
                            id="status-color"
                            type="color"
                            value={newStatus.color}
                            onChange={(e) => setNewStatus({ ...newStatus, color: e.target.value })}
                            className="mt-1 h-10"
                          />
                        </div>
                        <div>
                          <Label htmlFor="status-multiplier">Multiplicador CR</Label>
                          <Input
                            id="status-multiplier"
                            type="number"
                            min="0"
                            step="0.1"
                            placeholder="1.0"
                            value={newStatus.hourlyMultiplier}
                            onChange={(e) => setNewStatus({ ...newStatus, hourlyMultiplier: Number(e.target.value) })}
                            className="mt-1"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <Label htmlFor="status-description">Descrição</Label>
                        <Input
                          id="status-description"
                          placeholder="Descrição do status"
                          value={newStatus.description}
                          onChange={(e) => setNewStatus({ ...newStatus, description: e.target.value })}
                          className="mt-1"
                        />
                      </div>
                      
                      <div className="flex justify-end gap-3 pt-4">
                        <Button variant="outline" onClick={() => setIsAddStatusDialogOpen(false)}>
                          Cancelar
                        </Button>
                        <Button onClick={handleAddStatus}>
                          Adicionar
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto">
              {statusManager.flightStatuses.map((status) => (
                <div
                  key={status.id}
                  className="flex items-center justify-between p-3 bg-muted/20 rounded-lg hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <span className="text-lg">{status.icon}</span>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h5 className="font-medium text-foreground">{status.name}</h5>
                        <div 
                          className="w-3 h-3 rounded-full border"
                          style={{ backgroundColor: status.color }}
                        />
                        {status.isDefault && (
                          <Badge variant="outline" className="text-xs">
                            Padrão
                          </Badge>
                        )}
                        {!status.isActive && (
                          <Badge variant="secondary" className="text-xs">
                            Inativo
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {status.description}
                        {status.hourlyMultiplier !== 1.0 && ` • ${status.hourlyMultiplier}x CR`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Switch
                      checked={status.isActive}
                      onCheckedChange={() => statusManager.toggleStatusActive(status.id)}
                    />
                    {!status.isDefault && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => statusManager.deleteStatus(status.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};