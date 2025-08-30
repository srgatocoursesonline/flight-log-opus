import { useState, forwardRef, useImperativeHandle, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Plane, Briefcase, Building2 } from 'lucide-react';
import { useSupabaseFlights, type Flight } from '@/hooks/supabase/useSupabaseFlights';
import { useSupabaseAircraftManager } from '@/hooks/supabase/useSupabaseAircraftManager';
import { useSupabaseFlightStatusManager } from '@/hooks/supabase/useSupabaseFlightStatusManager';
import { autoRefresh } from '@/utils/autoRefresh';
import { useToast } from '@/hooks/ui/use-toast';
import { useFlightDraft, type FlightFormData } from '@/hooks/business/useFlightDraft';
import { useFlightSettings } from '@/hooks/business/useFlightSettings';
import { countries } from '@/lib/data/countries';
import { fetchAirportByIcao } from '@/lib/services/airportService';

interface AddFlightModalProps {
  trigger?: React.ReactNode;
  flight?: Flight;
  onClose?: () => void;
}

export interface AddFlightModalRef {
  openModal: () => void;
}

export const AddFlightModal = forwardRef<AddFlightModalRef, AddFlightModalProps>(({ trigger, flight, onClose }, ref) => {
  const { t } = useTranslation();
  const { addFlight, updateFlight } = useSupabaseFlights();
  const aircraftManager = useSupabaseAircraftManager();
  const statusManager = useSupabaseFlightStatusManager();
  const { toast } = useToast();
  const flightSettings = useFlightSettings();
  
  // Hook de persistência (só ativo quando não estiver editando)
  const {
    saveDraftData,
    loadDraftData,
    clearDraftData,
    saveModalState,
    loadModalState,
    hasDraftData,
    getDefaultFormData
  } = useFlightDraft(!!flight);
  
  // Estado do modal com persistência
  const [open, setOpen] = useState(() => {
    return flight ? false : loadModalState();
  });

  // Expor método para abrir modal externamente
  useImperativeHandle(ref, () => ({
    openModal: () => setOpen(true)
  }));

  // Estado do formulário com carregamento de rascunho
  const [formData, setFormData] = useState<FlightFormData>(() => {
    if (flight) {
      // Se está editando, usar dados do voo
      return {
        callsign: flight.callsign,
        aircraft: flight.aircraft,
        departure: flight.departure,
        arrival: flight.arrival,
        departureTime: flight.departureTime,
        arrivalTime: flight.arrivalTime,
        flightTime: flight.flightTime,
        distance: flight.distance?.toString() || '',
        fuelUsed: flight.fuelUsed?.toString() || '',
        landingRate: flight.landingRate?.toString() || '',
        experiencePoints: flight.experiencePoints?.toString() || '',
        careerRating: flight.careerRating?.toString() || '',
        status: flight.status,
        date: flight.date,
        route: flight.route || '',
        notes: flight.notes || '',
        serviceType: flight.serviceType || 'employee',
        originCountry: flight.originCountry || '',
        destinationCountry: flight.destinationCountry || '',
        originAirportName: flight.originAirportInfo?.name || '',
        destinationAirportName: flight.destinationAirportInfo?.name || ''
      };
    } else {
      // Se é novo voo, tentar carregar rascunho
      const draftData = loadDraftData();
      return draftData || getDefaultFormData();
    }
  });

  // Atualizar formData quando flight prop mudar (para edição)
  useEffect(() => {
    if (flight) {
      setFormData({
        callsign: flight.callsign,
        aircraft: flight.aircraft,
        departure: flight.departure,
        arrival: flight.arrival,
        departureTime: flight.departureTime,
        arrivalTime: flight.arrivalTime,
        flightTime: flight.flightTime,
        distance: flight.distance?.toString() || '',
        fuelUsed: flight.fuelUsed?.toString() || '',
        landingRate: flight.landingRate?.toString() || '',
        experiencePoints: flight.experiencePoints?.toString() || '',
        careerRating: flight.careerRating?.toString() || '',
        status: flight.status,
        date: flight.date,
        route: flight.route || '',
        notes: flight.notes || '',
        serviceType: flight.serviceType || 'employee',
        originCountry: flight.originCountry || '',
        destinationCountry: flight.destinationCountry || '',
        originAirportName: flight.originAirportInfo?.name || '',
        destinationAirportName: flight.destinationAirportInfo?.name || ''
      });
    }
  }, [flight]);

  // Salvar estado do modal sempre que mudar
  useEffect(() => {
    saveModalState(open);
  }, [open, saveModalState]);

  // Auto-salvar dados do formulário (debounced)
  useEffect(() => {
    if (!flight && open) {
      const timeoutId = setTimeout(() => {
        saveDraftData(formData);
      }, 1000); // Salvar após 1 segundo de inatividade
      
      return () => clearTimeout(timeoutId);
    }
  }, [formData, flight, open, saveDraftData]);

  // Buscar informações do aeroporto de origem quando o código ICAO mudar
  useEffect(() => {
    const icaoCode = formData.departure.trim();
    if (icaoCode.length === 4) {
      fetchAirportByIcao(icaoCode).then(airportInfo => {
        if (airportInfo) {
          setFormData(prev => ({
            ...prev,
            originAirportName: airportInfo.name || '',
            originCountry: prev.originCountry || airportInfo.country_code || ''
          }));
        }
      });
    }
  }, [formData.departure]);

  // Buscar informações do aeroporto de destino quando o código ICAO mudar
  useEffect(() => {
    const icaoCode = formData.arrival.trim();
    if (icaoCode.length === 4) {
      fetchAirportByIcao(icaoCode).then(airportInfo => {
        if (airportInfo) {
          setFormData(prev => ({
            ...prev,
            destinationAirportName: airportInfo.name || '',
            destinationCountry: prev.destinationCountry || airportInfo.country_code || ''
          }));
        }
      });
    }
  }, [formData.arrival]);

  // Gerenciar eventos de foco da janela para manter modal aberto
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && !flight) {
        const shouldBeOpen = loadModalState();
        if (shouldBeOpen && !open) {
          setOpen(true);
        }
      }
    };

    const handleWindowFocus = () => {
      if (!flight) {
        const shouldBeOpen = loadModalState();
        if (shouldBeOpen && !open) {
          setOpen(true);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleWindowFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleWindowFocus);
    };
  }, [open, flight, loadModalState]);

  // Interceptar fechamento do modal para confirmação
  const handleModalClose = (newOpen: boolean) => {
    if (!newOpen && !flight) {
      // Se está tentando fechar e tem dados preenchidos
      if (hasDraftData()) {
        const shouldClose = window.confirm('Você tem dados não salvos. Deseja realmente fechar? Os dados serão mantidos como rascunho.');
        if (!shouldClose) {
          return; // Não fechar
        }
      }
    }
    
    setOpen(newOpen);
    
    if (!newOpen && onClose) {
      onClose();
    }
  };

  // Verificar se campos são obrigatórios baseado no status
  const isCompleted = formData.status === 'completed';
  const isPlanned = formData.status === 'planned';
  const isActive = formData.status === 'active';

  // Função para calcular tempo de voo automaticamente
  const calculateFlightTime = (departureTime: string, arrivalTime: string) => {
    if (!departureTime || !arrivalTime) return '';
    
    const [depHours, depMinutes] = departureTime.split(':').map(Number);
    const [arrHours, arrMinutes] = arrivalTime.split(':').map(Number);
    
    let depTotalMinutes = depHours * 60 + depMinutes;
    let arrTotalMinutes = arrHours * 60 + arrMinutes;
    
    // Se horário de chegada for menor que partida, assumir que é no dia seguinte
    if (arrTotalMinutes < depTotalMinutes) {
      arrTotalMinutes += 24 * 60; // Adicionar 24 horas
    }
    
    const diffMinutes = arrTotalMinutes - depTotalMinutes;
    const hours = Math.floor(diffMinutes / 60);
    const minutes = diffMinutes % 60;
    
    return `${hours}h ${minutes}m`;
  };

  // Atualizar tempo de voo automaticamente quando horários mudarem
  useEffect(() => {
    if (formData.departureTime && formData.arrivalTime) {
      const calculatedTime = calculateFlightTime(formData.departureTime, formData.arrivalTime);
      if (calculatedTime && calculatedTime !== formData.flightTime) {
        setFormData(prev => ({ ...prev, flightTime: calculatedTime }));
      }
    }
  }, [formData.departureTime, formData.arrivalTime]);

  // Obter opções de aeronaves: aeronaves customizadas ativas + aeronaves padrão (sem duplicatas)
  const aircraftOptions = Array.from(new Set([
    // Aeronaves customizadas ativas
    ...aircraftManager.getAllAircraftNames(),
    
    // Fallback para aeronaves padrão se não houver customizadas
    ...(aircraftManager.getAllAircraftNames().length === 0 ? [
      'Boeing 737-800',
      'Airbus A320',
      'Boeing 777-300ER',
      'Airbus A350-900',
      'Embraer E-Jet E175',
      'ATR 72-600',
      'Boeing 787-9 Dreamliner',
      'Airbus A330-300',
      'Cessna Citation CJ4',
      'Gulfstream G650',
      'Boeing 747-8F',
      'Airbus A380-800',
      'Cessna 172',
      'Piper PA-28 Cherokee',
      'Diamond DA40',
      'Cirrus SR22',
      'Beechcraft Bonanza G36',
      'Bell 407',
      'Robinson R44',
      'Airbus H125'
    ] : [])
  ]));

  // Obter opções de status: status customizados ativos + conversão para formato compatível
  const statusOptions = [
    // Status customizados ativos
    ...statusManager.getActiveStatuses().map(status => {
      // Determinar o valor real baseado no nome do status para compatibilidade
      let statusValue = status.id;
      
      // Se o status tiver um nome correspondente aos tipos padrão, use o tipo em vez do ID
      if (status.name === 'Planejado') statusValue = 'planned';
      if (status.name === 'Em Voo') statusValue = 'active';
      if (status.name === 'Completado') statusValue = 'completed';
      if (status.name === 'Cancelado') statusValue = 'cancelled';
      
      return {
        value: statusValue,
        label: `${status.icon} ${status.name}`,
        id: status.id, // Preservar o ID original para referência
        originalName: status.name // Preservar o nome original para referência
      };
    }),
    
    // Fallback para status padrão se não houver customizados
    ...(statusManager.getActiveStatuses().length === 0 ? [
      { value: 'planned', label: t('common.planned') },
      { value: 'active', label: 'Em Voo' },
      { value: 'completed', label: t('common.completed') },
      { value: 'cancelled', label: t('common.cancelled') }
    ] : [])
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Validação para campos obrigatórios baseado no status
      const requiredFields = ['callsign', 'aircraft', 'departure', 'arrival', 'date'];
      
      // Campos adicionais obrigatórios para voos completados
      if (formData.status === 'completed') {
        requiredFields.push('departureTime', 'arrivalTime', 'flightTime', 'distance', 'fuelUsed', 'landingRate', 'experiencePoints', 'careerRating');
      }
      
      // Campos adicionais obrigatórios para voos ativos
      if (formData.status === 'active') {
        requiredFields.push('departureTime');
      }
      
      // Verificar campos em falta
      const missingFields = requiredFields.filter(field => {
        const value = formData[field as keyof typeof formData];
        return !value || value.toString().trim() === '';
      });
      
      if (missingFields.length > 0) {
        toast({
          title: "Campos obrigatórios",
          description: `Por favor, preencha os campos: ${missingFields.join(', ')}`,
          variant: "destructive",
        });
        return;
      }
    
      const flightData = {
        callsign: formData.callsign,
        aircraft: formData.aircraft,
        departure: formData.departure.toUpperCase(),
        arrival: formData.arrival.toUpperCase(),
        departureTime: formData.departureTime,
        arrivalTime: formData.arrivalTime,
        flightTime: formData.flightTime,
        distance: formData.distance ? parseInt(formData.distance) : 0,
        fuelUsed: formData.fuelUsed ? parseInt(formData.fuelUsed) : 0,
        landingRate: formData.landingRate ? parseInt(formData.landingRate) : 0,
        experiencePoints: formData.experiencePoints ? parseInt(formData.experiencePoints) : 0,
        careerRating: formData.careerRating ? parseInt(formData.careerRating) : 0,
        status: formData.status as Flight['status'],
        date: formData.date,
        route: formData.route.toUpperCase(),
        notes: formData.notes,
        serviceType: formData.serviceType as 'employee' | 'freelance',
        originCountry: formData.originCountry,
        destinationCountry: formData.destinationCountry,
        originAirportInfo: {
          name: formData.originAirportName,
          icao_code: formData.departure.toUpperCase()
        },
        destinationAirportInfo: {
          name: formData.destinationAirportName,
          icao_code: formData.arrival.toUpperCase()
        }
      };

      if (flight) {
        await updateFlight(flight.id, flightData);
        toast({
          title: "Sucesso!",
          description: "Voo atualizado com sucesso",
        });
      } else {
        await addFlight(flightData);
        toast({
          title: "Sucesso!",
          description: "Voo salvo com sucesso",
        });
        // Trigger automatic refresh after adding new flight
        autoRefresh();
        
        // Limpar dados de rascunho após salvar com sucesso
        clearDraftData();
      }

      setOpen(false);
      if (onClose) onClose();
      
      // Reset form
      if (!flight) {
        const defaultData = getDefaultFormData();
        setFormData(defaultData);
      }
    } catch (error) {
      console.error('Erro ao salvar voo:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar voo. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  // Função para limpar rascunho manualmente
  const handleClearDraft = () => {
    if (window.confirm('Deseja limpar todos os dados do rascunho?')) {
      clearDraftData();
      const defaultData = getDefaultFormData();
      setFormData(defaultData);
      toast({
        title: "Rascunho limpo",
        description: "Todos os dados foram removidos",
      });
    }
  };

  const defaultTrigger = (
    <Button variant="hud" className="icon-hover">
      <Plus className="h-4 w-4 mr-2" />
      {t('flights.logNewFlight')}
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={handleModalClose}>
      {trigger !== null && (
        <DialogTrigger asChild>
          {trigger || defaultTrigger}
        </DialogTrigger>
      )}
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto glass-panel">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between text-foreground">
            <div className="flex items-center gap-2">
              <Plane className="h-5 w-5 text-primary" />
              {flight ? 'Editar Voo' : t('flights.logNewFlight')}
              {!flight && hasDraftData() && (
                <span className="text-xs bg-yellow-500/20 text-yellow-600 px-2 py-1 rounded-md border border-yellow-500/30">
                  📝 Rascunho
                </span>
              )}
            </div>
            {!flight && hasDraftData() && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearDraft}
                className="text-xs text-muted-foreground hover:text-destructive"
              >
                Limpar Rascunho
              </Button>
            )}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Linha 1: Callsign e Aircraft */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="callsign" className="text-foreground">Callsign</Label>
              <Input
                id="callsign"
                placeholder="TAM3007"
                value={formData.callsign}
                onChange={(e) => setFormData({ ...formData, callsign: e.target.value })}
                className="mt-1"
                required
              />
            </div>
            <div>
              <Label htmlFor="aircraft" className="text-foreground">Aircraft</Label>
              <Select value={formData.aircraft} onValueChange={(value) => setFormData({ ...formData, aircraft: value })}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Selecione a aeronave" />
                </SelectTrigger>
                <SelectContent>
                  {aircraftOptions.map((aircraft) => (
                    <SelectItem key={aircraft} value={aircraft}>
                      {aircraft}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Linha 2: Departure e Arrival */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="departure" className="text-foreground">Origem (ICAO)</Label>
              <Input
                id="departure"
                placeholder="SBGR"
                value={formData.departure}
                onChange={(e) => setFormData({ ...formData, departure: e.target.value })}
                className="mt-1"
                maxLength={4}
                required
              />
            </div>
            <div>
              <Label htmlFor="arrival" className="text-foreground">Destino (ICAO)</Label>
              <Input
                id="arrival"
                placeholder="SBRJ"
                value={formData.arrival}
                onChange={(e) => setFormData({ ...formData, arrival: e.target.value })}
                className="mt-1"
                maxLength={4}
                required
              />
            </div>
          </div>

          {/* Linha 3: Horários */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="departureTime" className="text-foreground">
                Decolagem
              </Label>
              <Input
                id="departureTime"
                type="time"
                value={formData.departureTime}
                onChange={(e) => setFormData({ ...formData, departureTime: e.target.value })}
                className="mt-1"
                required={isCompleted || isActive}
              />
            </div>
            <div>
              <Label htmlFor="arrivalTime" className="text-foreground">
                Pouso
              </Label>
              <Input
                id="arrivalTime"
                type="time"
                value={formData.arrivalTime}
                onChange={(e) => setFormData({ ...formData, arrivalTime: e.target.value })}
                className="mt-1"
                required={isCompleted}
              />
            </div>
            <div>
              <Label htmlFor="flightTime" className="text-foreground">Duração</Label>
              <Input
                id="flightTime"
                placeholder="1h 30m"
                value={formData.flightTime}
                onChange={(e) => setFormData({ ...formData, flightTime: e.target.value })}
                className="mt-1"
                required={isCompleted}
              />
            </div>
          </div>

          {/* Linha 4: Métricas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="distance" className="text-foreground">Distância (nm)</Label>
              <Input
                id="distance"
                type="number"
                placeholder="365"
                value={formData.distance}
                onChange={(e) => setFormData({ ...formData, distance: e.target.value })}
                className="mt-1"
                required={isCompleted}
              />
            </div>
            <div>
              <Label htmlFor="fuelUsed" className="text-foreground">
                {flightSettings.getFuelUnitLabel()}
              </Label>
              <Input
                id="fuelUsed"
                type="number"
                placeholder={flightSettings.getFuelUnitPlaceholder()}
                value={formData.fuelUsed}
                onChange={(e) => setFormData({ ...formData, fuelUsed: e.target.value })}
                className="mt-1"
                required={isCompleted}
              />
            </div>
            <div>
              <Label htmlFor="landingRate" className="text-foreground">Landing Rate (fpm)</Label>
              <Input
                id="landingRate"
                type="number"
                placeholder="-156"
                value={formData.landingRate}
                onChange={(e) => setFormData({ ...formData, landingRate: e.target.value })}
                className="mt-1"
                required={isCompleted}
              />
            </div>
          </div>

          {/* Linha 5: XP, CR, Status e Data */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="experiencePoints" className="text-foreground">XP</Label>
              <Input
                id="experiencePoints"
                type="number"
                min="0"
                placeholder="1250"
                value={formData.experiencePoints}
                onChange={(e) => setFormData({ ...formData, experiencePoints: e.target.value })}
                className="mt-1"
                required={isCompleted}
              />
            </div>
            <div>
              <Label htmlFor="careerRating" className="text-foreground">CR</Label>
              <Input
                id="careerRating"
                type="number"
                min="0"
                placeholder="92"
                value={formData.careerRating}
                onChange={(e) => setFormData({ ...formData, careerRating: e.target.value })}
                className="mt-1"
                required={isCompleted}
              />
            </div>
            <div>
              <Label htmlFor="status" className="text-foreground">Status</Label>
              <Select value={formData.status} onValueChange={(value: Flight['status']) => setFormData({ ...formData, status: value })}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="date" className="text-foreground">Data</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="mt-1"
                required
              />
            </div>
          </div>

          {/* Linha 6: Rota */}
          <div>
            <Label htmlFor="route" className="text-foreground">Rota</Label>
            <Input
              id="route"
              placeholder="SBGR DCT SBRJ"
              value={formData.route}
              onChange={(e) => setFormData({ ...formData, route: e.target.value })}
              className="mt-1"
            />
          </div>

          {/* Linha 7: Tipo de Serviço */}
          <div>
            <Label htmlFor="serviceType" className="text-foreground">Tipo de Serviço</Label>
            <Select 
              value={formData.serviceType} 
              onValueChange={(value) => setFormData({ ...formData, serviceType: value })}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="employee">
                  <div className="flex items-center">
                    <Building2 className="h-4 w-4 mr-2" />
                    <span>Funcionário</span>
                  </div>
                </SelectItem>
                <SelectItem value="freelance">
                  <div className="flex items-center">
                    <Briefcase className="h-4 w-4 mr-2" />
                    <span>Autônomo</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Linha 8: Informações de aeroportos */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="originAirportName" className="text-foreground">Aeroporto de Origem</Label>
              <Input
                id="originAirportName"
                placeholder="Nome do aeroporto será buscado automaticamente"
                value={formData.originAirportName}
                onChange={(e) => setFormData({ ...formData, originAirportName: e.target.value })}
                className="mt-1"
                readOnly
              />
            </div>
            <div>
              <Label htmlFor="destinationAirportName" className="text-foreground">Aeroporto de Destino</Label>
              <Input
                id="destinationAirportName"
                placeholder="Nome do aeroporto será buscado automaticamente"
                value={formData.destinationAirportName}
                onChange={(e) => setFormData({ ...formData, destinationAirportName: e.target.value })}
                className="mt-1"
                readOnly
              />
            </div>
          </div>

          {/* Linha 9: Países de origem e destino */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="originCountry" className="text-foreground">País de Origem</Label>
              <Select 
                value={formData.originCountry} 
                onValueChange={(value) => setFormData({ ...formData, originCountry: value })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Selecione o país de origem" />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  {countries.map((country) => (
                    <SelectItem key={country.code} value={country.code}>
                      {country.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="destinationCountry" className="text-foreground">País de Destino</Label>
              <Select 
                value={formData.destinationCountry} 
                onValueChange={(value) => setFormData({ ...formData, destinationCountry: value })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Selecione o país de destino" />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  {countries.map((country) => (
                    <SelectItem key={country.code} value={country.code}>
                      {country.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Linha 10: Observações */}
          <div>
            <Label htmlFor="notes" className="text-foreground">Observações</Label>
            <Textarea
              id="notes"
              placeholder="Comentários sobre o voo..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="mt-1"
              rows={3}
            />
          </div>

          {/* Botões */}
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" variant="hud">
              {flight ? 'Atualizar Voo' : 'Salvar Voo'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
});

AddFlightModal.displayName = 'AddFlightModal';