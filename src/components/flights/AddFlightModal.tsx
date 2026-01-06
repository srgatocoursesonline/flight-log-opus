import { useState, forwardRef, useImperativeHandle, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { MobileInput, MobileTextarea, MASKS, VALIDATIONS } from '@/components/ui/mobile-form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Combobox } from '@/components/ui/combobox';
import { Plus, Plane, Briefcase, Building2, Calendar, MapPin, Gauge, FileText, Wand2 } from 'lucide-react';
import { useSupabaseFlights, type Flight } from '@/hooks/supabase/useSupabaseFlights';
import { useSupabaseAircraftManager } from '@/hooks/supabase/useSupabaseAircraftManager';
import { useSupabaseFlightStatusManager } from '@/hooks/supabase/useSupabaseFlightStatusManager';
import { useToast } from '@/hooks/ui/use-toast';
import { useFlightDraft, type FlightFormData } from '@/hooks/business/useFlightDraft';
import { useFlightSettings } from '@/hooks/business/useFlightSettings';
import { countries } from '@/lib/data/countries';
import { fetchAirportByIcao, saveManualAirport, type AirportInfo } from '@/lib/airportService';
import { autoFillAirportInfo, validateIcaoCode } from '@/lib/airportAutoFillService';
import { AirportManualInputDialog } from './AirportManualInputDialog';

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
  const { addFlight, updateFlight, flights } = useSupabaseFlights();
  const [suggestedCallsign, setSuggestedCallsign] = useState<string | null>(null);

  const handleCallsignFocus = () => {
    if (flight || formData.callsign) return;

    // Encontrar último voo válido com formato AAA000
    const lastFlight = flights.find(f => f.callsign && /^[A-Z]+\d+$/.test(f.callsign));

    if (lastFlight) {
      const match = lastFlight.callsign.match(/^([A-Z]+)(\d+)$/);
      if (match) {
        const prefix = match[1];
        const numberStr = match[2];
        const nextNum = parseInt(numberStr) + 1;
        const nextNumStr = nextNum.toString().padStart(numberStr.length, '0');
        setSuggestedCallsign(`${prefix}${nextNumStr}`);
        return;
      }
    }

    // Se não houver voos anteriores, sugerir MER001
    if (flights.length === 0) {
      setSuggestedCallsign('MER001');
    }
  };
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
        serviceType: flight.serviceType || 'freelance',
        originCountry: flight.originCountry || '',
        destinationCountry: flight.destinationCountry || '',
        originAirportName: flight.originAirportInfo?.name || '',
        destinationAirportName: flight.destinationAirportInfo?.name || '',
        originCity: flight.originAirportInfo?.city || '',
        destinationCity: flight.destinationAirportInfo?.city || ''
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
        serviceType: flight.serviceType || 'freelance',
        originCountry: flight.originCountry || '',
        destinationCountry: flight.destinationCountry || '',
        originAirportName: flight.originAirportInfo?.name || '',
        destinationAirportName: flight.destinationAirportInfo?.name || '',
        originCity: flight.originAirportInfo?.city || '',
        destinationCity: flight.destinationAirportInfo?.city || ''
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

  // Estado para controle do diálogo de entrada manual
const [showManualInputDialog, setShowManualInputDialog] = useState(false);
const [manualInputIcao, setManualInputIcao] = useState('');
const [manualInputType, setManualInputType] = useState<'departure' | 'arrival'>('departure');
const [lastCheckedDeparture, setLastCheckedDeparture] = useState('');
const [lastCheckedArrival, setLastCheckedArrival] = useState('');

// Buscar informações do aeroporto de origem quando o código ICAO mudar
useEffect(() => {
  // Não buscar se o modal não estiver aberto
  if (!open) return;
  
  const icaoCode = formData.departure.trim();
  
  // Verificar se já foi buscado ou se já temos os dados
  if (icaoCode.length === 4 && icaoCode !== lastCheckedDeparture) {
    // Se já temos o nome do aeroporto (voo editado ou já buscado), não buscar novamente
    if (formData.originAirportName && flight) {
      setLastCheckedDeparture(icaoCode);
      return;
    }
    
    setLastCheckedDeparture(icaoCode);
    
    // Validação do código ICAO
    const validation = validateIcaoCode(icaoCode);
    if (!validation.valid) {
      toast({
        title: "Aviso",
        description: validation.error,
        variant: "destructive",
      });
      return;
    }
    
    // Usar novo serviço de preenchimento automático
    autoFillAirportInfo(icaoCode, { enableLogging: true }).then(result => {
      if (result.success && result.data) {
        setFormData(prev => ({
          ...prev,
          originAirportName: result.data.name || '',
          originCountry: prev.originCountry || result.data.country_code || ''
        }));
        
        toast({
          title: "Sucesso",
          description: `Aeroporto de origem: ${result.data.name}`,
          variant: "default",
        });
      } else if (!result.success && open) {
        // Só abrir popup se o modal estiver aberto
        setManualInputIcao(icaoCode);
        setManualInputType('departure');
        setShowManualInputDialog(true);
        
        toast({
          title: "Aeroporto não encontrado",
          description: result.error || 'Origem não encontrada na base de dados',
          variant: "destructive",
        });
      }
    }).catch(error => {
      console.error('Erro ao buscar aeroporto de origem:', error);
      toast({
        title: "Erro",
        description: "Erro ao buscar informações do aeroporto de origem",
        variant: "destructive",
      });
    });
  }
}, [formData.departure, open, lastCheckedDeparture, formData.originAirportName, flight]);

// Buscar informações do aeroporto de destino quando o código ICAO mudar
useEffect(() => {
  // Não buscar se o modal não estiver aberto
  if (!open) return;
  
  const icaoCode = formData.arrival.trim();
  
  // Verificar se já foi buscado ou se já temos os dados
  if (icaoCode.length === 4 && icaoCode !== lastCheckedArrival) {
    // Se já temos o nome do aeroporto (voo editado ou já buscado), não buscar novamente
    if (formData.destinationAirportName && flight) {
      setLastCheckedArrival(icaoCode);
      return;
    }
    
    setLastCheckedArrival(icaoCode);
    
    // Validação do código ICAO
    const validation = validateIcaoCode(icaoCode);
    if (!validation.valid) {
      toast({
        title: "Aviso",
        description: validation.error,
        variant: "destructive",
      });
      return;
    }
    
    // Usar novo serviço de preenchimento automático
    autoFillAirportInfo(icaoCode, { enableLogging: true }).then(result => {
      if (result.success && result.data) {
        setFormData(prev => ({
          ...prev,
          destinationAirportName: result.data.name || '',
          destinationCity: result.data.city || '',
          destinationCountry: prev.destinationCountry || result.data.country_code || ''
        }));
        
        toast({
          title: "Sucesso",
          description: `Aeroporto de destino: ${result.data.name}`,
          variant: "default",
        });
      } else if (!result.success && open) {
        // Só abrir popup se o modal estiver aberto
        setManualInputIcao(icaoCode);
        setManualInputType('arrival');
        setShowManualInputDialog(true);
        
        toast({
          title: "Aeroporto não encontrado",
          description: result.error || 'Destino não encontrado na base de dados',
          variant: "destructive",
        });
      }
    }).catch(error => {
      console.error('Erro ao buscar aeroporto de destino:', error);
      toast({
        title: "Erro",
        description: "Erro ao buscar informações do aeroporto de destino",
        variant: "destructive",
      });
    });
  }
}, [formData.arrival, open, lastCheckedArrival, formData.destinationAirportName, flight]);

// Manipulador para salvar aeroporto manual
const handleManualAirportSave = async (airportInfo: AirportInfo) => {
  try {
    await saveManualAirport(airportInfo);
    
    if (manualInputType === 'departure') {
      setFormData(prev => ({
        ...prev,
        originAirportName: airportInfo.name,
        originCountry: airportInfo.country_code || prev.originCountry
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        destinationAirportName: airportInfo.name,
        destinationCity: airportInfo.city || '',
        destinationCountry: airportInfo.country_code || prev.destinationCountry
      }));
    }

    toast({
      title: "Sucesso",
      description: "Aeroporto salvo com sucesso!",
      variant: "default",
    });
  } catch (error) {
    console.error('Erro ao salvar aeroporto:', error);
    toast({
      title: "Erro",
      description: "Erro ao salvar aeroporto. Tente novamente.",
      variant: "destructive",
    });
  }
};

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
  const isCompleted = formData.status === 'Concluído';
  const isPlanned = formData.status === 'planned';
  const isActive = formData.status === 'active';

  // Função para calcular tempo de voo automaticamente
  const calculateFlightTime = (departureTime: string, arrivalTime: string) => {
    if (!departureTime || !arrivalTime) return '';
    
    const [depHours, depMinutes] = departureTime.split(':').map(Number);
    const [arrHours, arrMinutes] = arrivalTime.split(':').map(Number);
    
    const depTotalMinutes = depHours * 60 + depMinutes;
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
  ])).sort();

  // Obter opções de status: status customizados ativos + conversão para formato compatível
  const statusOptions = [
    // Status customizados ativos
    ...statusManager.getActiveStatuses().map(status => {
      // Determinar o valor real baseado no nome do status para compatibilidade
      let statusValue = status.id;
      
      // Se o status tiver um nome correspondente aos tipos padrão, use o tipo em vez do ID
      if (status.name === 'Planejado') statusValue = 'planned';
      if (status.name === 'Em Voo') statusValue = 'active';
      if (status.name === 'Concluído') statusValue = 'Concluído';
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
        if (formData.status === 'Concluído') {
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
          city: formData.originCity,
          icao_code: formData.departure.toUpperCase()
        },
        destinationAirportInfo: {
          name: formData.destinationAirportName,
          city: formData.destinationCity,
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
        const result = await addFlight(flightData);
        toast({
          title: "Sucesso!",
          description: "Voo salvo com sucesso",
        });
        
        // Disparar evento para atualizar estatísticas se o voo estiver concluído
        if (formData.status === 'Concluído' && result) {
          console.log('🔍 DEBUG - AddFlightModal - Preparing to dispatch flightCompleted event');
          
          const event = new CustomEvent('flightCompleted', {
            detail: {
              flightTime: formData.flightTime,
              status: 'Concluído'
            }
          });
          
          window.dispatchEvent(event);
          console.log('📢 Evento flightCompleted disparado com dados:', {
            flightTime: formData.flightTime,
            status: 'Concluído',
            timestamp: new Date().toISOString()
          });
        }
        
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

      // Refresh automático da página após salvar
      setTimeout(() => {
        window.location.reload();
      }, 300);
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
      {trigger !== null && trigger !== undefined && (
        <DialogTrigger asChild>
          {trigger || defaultTrigger}
        </DialogTrigger>
      )}
      <DialogContent className="max-w-[95vw] lg:max-w-7xl max-h-[95vh] overflow-y-auto glass-panel p-6">
        <DialogHeader className="mb-4">
          <DialogTitle className="flex items-center justify-between modal-title text-xl">
            <div className="flex items-center gap-2">
              <Plane className="h-6 w-6 text-primary" />
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
                className="text-xs text-readable-muted hover:text-destructive"
              >
                Limpar Rascunho
              </Button>
            )}
          </DialogTitle>
          <DialogDescription>
            {flight ? 'Edite os dados do voo selecionado' : 'Registre um novo voo no sistema de log'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* COLUNA 1: IDENTIFICAÇÃO */}
            <div className="lg:col-span-4 space-y-4">
              <div className="flex items-center gap-2 mb-2 pb-2 border-b border-border/50">
                <FileText className="h-5 w-5 text-blue-500" />
                <h3 className="font-semibold text-foreground">Identificação</h3>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="relative">
                  <MobileInput
                    id="callsign"
                    label="Callsign"
                    value={formData.callsign}
                    onChange={(value) => setFormData({ ...formData, callsign: value.toUpperCase() })}
                    placeholder={suggestedCallsign ? `${suggestedCallsign} (Sugestão)` : "TAM3007"}
                    keyboardType="text"
                    validation={{
                      ...VALIDATIONS.CALLSIGN,
                      required: true
                    }}
                    required
                    maxLength={8}
                    autoComplete="off"
                    className="mobile-form-field"
                    onFocus={handleCallsignFocus}
                  />
                  {suggestedCallsign && !formData.callsign && (
                    <button
                      type="button"
                      onClick={() => {
                        setFormData({ ...formData, callsign: suggestedCallsign });
                        setSuggestedCallsign(null);
                      }}
                      className="absolute right-0 top-0 text-xs bg-primary/10 text-primary hover:bg-primary/20 px-2 py-0.5 rounded flex items-center gap-1 transition-colors"
                      title={`Usar sugestão: ${suggestedCallsign}`}
                    >
                      <Wand2 className="h-3 w-3" />
                      <span className="hidden sm:inline">Usar {suggestedCallsign}</span>
                      <span className="sm:hidden">Usar</span>
                    </button>
                  )}
                </div>
                
                <div className="mobile-form-field">
                  <Label htmlFor="aircraft" className="label-text mobile-form-label-required">
                    Aircraft
                    <span className="text-destructive ml-1">*</span>
                  </Label>
                  <div className="mt-1">
                    <Combobox
                      options={aircraftOptions.map(aircraft => ({ value: aircraft, label: aircraft }))}
                      value={formData.aircraft}
                      onValueChange={(value) => setFormData({ ...formData, aircraft: value })}
                      placeholder="Selecione"
                      searchPlaceholder="Pesquisar..."
                      emptyMessage="Nenhuma aeronave."
                      className="mobile-form-input"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <MobileInput
                  id="date"
                  label="Data"
                  value={formData.date}
                  onChange={(value) => setFormData({ ...formData, date: value })}
                  keyboardType="date"
                  validation={{
                    required: true
                  }}
                  required
                  className="mobile-form-field [&_input]:dark:[color-scheme:dark]"
                />

                <div className="mobile-form-field">
                  <Label htmlFor="status" className="label-text mobile-form-label">
                    Status
                  </Label>
                  <Select value={formData.status} onValueChange={(value: Flight['status']) => setFormData({ ...formData, status: value })}>
                    <SelectTrigger className="mt-1 mobile-form-input">
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
              </div>

              <div className="mobile-form-field">
                <Label htmlFor="serviceType" className="label-text mobile-form-label">
                  Tipo de Serviço
                </Label>
                <Select 
                  value={formData.serviceType} 
                  onValueChange={(value) => setFormData({ ...formData, serviceType: value })}
                >
                  <SelectTrigger className="mt-1 mobile-form-input">
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

              <MobileTextarea
                id="notes"
                label="Observações"
                value={formData.notes}
                onChange={(value) => setFormData({ ...formData, notes: value })}
                placeholder="Comentários sobre o voo..."
                rows={5}
                maxLength={500}
                className="mobile-form-field"
              />
            </div>

            {/* COLUNA 2: ROTA E AEROPORTOS */}
            <div className="lg:col-span-4 space-y-4">
              <div className="flex items-center gap-2 mb-2 pb-2 border-b border-border/50">
                <MapPin className="h-5 w-5 text-green-500" />
                <h3 className="font-semibold text-foreground">Rota e Aeroportos</h3>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <MobileInput
                  id="departure"
                  label="Origem (ICAO)"
                  value={formData.departure}
                  onChange={(value) => setFormData({ ...formData, departure: value.toUpperCase() })}
                  placeholder="SBGR"
                  keyboardType="text"
                  validation={{
                    ...VALIDATIONS.ICAO,
                    required: true
                  }}
                  required
                  maxLength={4}
                  autoComplete="off"
                  className="mobile-form-field"
                />
                <MobileInput
                  id="arrival"
                  label="Destino (ICAO)"
                  value={formData.arrival}
                  onChange={(value) => setFormData({ ...formData, arrival: value.toUpperCase() })}
                  placeholder="SBRJ"
                  keyboardType="text"
                  validation={{
                    ...VALIDATIONS.ICAO,
                    required: true
                  }}
                  required
                  maxLength={4}
                  autoComplete="off"
                  className="mobile-form-field"
                />
              </div>

              <MobileInput
                id="route"
                label="Rota"
                value={formData.route}
                onChange={(value) => setFormData({ ...formData, route: value })}
                placeholder="SBGR DCT SBRJ"
                keyboardType="text"
                className="mobile-form-field"
              />

              <div className="grid grid-cols-2 gap-3">
                <div className="mobile-form-field">
                  <Label htmlFor="originCountry" className="label-text mobile-form-label">
                    País Origem
                  </Label>
                  <Select 
                    value={formData.originCountry} 
                    onValueChange={(value) => setFormData({ ...formData, originCountry: value })}
                  >
                    <SelectTrigger className="mt-1 mobile-form-input">
                      <SelectValue placeholder="Selecione" />
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
                <div className="mobile-form-field">
                  <Label htmlFor="destinationCountry" className="label-text mobile-form-label">
                    País Destino
                  </Label>
                  <Select 
                    value={formData.destinationCountry} 
                    onValueChange={(value) => setFormData({ ...formData, destinationCountry: value })}
                  >
                    <SelectTrigger className="mt-1 mobile-form-input">
                      <SelectValue placeholder="Selecione" />
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

              <div className="space-y-3">
                <MobileInput
                  id="originAirportName"
                  label="Nome do Aeroporto de Origem"
                  value={formData.originAirportName}
                  onChange={(value) => setFormData({ ...formData, originAirportName: value })}
                  placeholder="Automático"
                  keyboardType="text"
                  disabled
                  className="mobile-form-field opacity-80"
                />
                <MobileInput
                  id="destinationAirportName"
                  label="Nome do Aeroporto de Destino"
                  value={formData.destinationAirportName}
                  onChange={(value) => setFormData({ ...formData, destinationAirportName: value })}
                  placeholder="Automático"
                  keyboardType="text"
                  disabled
                  className="mobile-form-field opacity-80"
                />
              </div>
            </div>

            {/* COLUNA 3: PERFORMANCE E MÉTRICAS */}
            <div className="lg:col-span-4 space-y-4">
              <div className="flex items-center gap-2 mb-2 pb-2 border-b border-border/50">
                <Gauge className="h-5 w-5 text-purple-500" />
                <h3 className="font-semibold text-foreground">Performance</h3>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <MobileInput
                  id="departureTime"
                  label="Decolagem"
                  value={formData.departureTime}
                  onChange={(value) => setFormData({ ...formData, departureTime: value })}
                  keyboardType="time"
                  validation={{
                    required: isCompleted || isActive
                  }}
                  required={isCompleted || isActive}
                  className="mobile-form-field [&_input]:dark:[color-scheme:dark]"
                />
                <MobileInput
                  id="arrivalTime"
                  label="Pouso"
                  value={formData.arrivalTime}
                  onChange={(value) => setFormData({ ...formData, arrivalTime: value })}
                  keyboardType="time"
                  validation={{
                    required: isCompleted
                  }}
                  required={isCompleted}
                  className="mobile-form-field [&_input]:dark:[color-scheme:dark]"
                />
                <MobileInput
                  id="flightTime"
                  label="Duração"
                  value={formData.flightTime}
                  onChange={(value) => setFormData({ ...formData, flightTime: value })}
                  placeholder="1h 30m"
                  keyboardType="text"
                  validation={{
                    required: isCompleted
                  }}
                  required={isCompleted}
                  className="mobile-form-field"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <MobileInput
                  id="distance"
                  label="Dist (nm)"
                  value={formData.distance}
                  onChange={(value) => setFormData({ ...formData, distance: value })}
                  placeholder="365"
                  keyboardType="number"
                  validation={{
                    ...VALIDATIONS.POSITIVE_NUMBER,
                    required: isCompleted
                  }}
                  required={isCompleted}
                  className="mobile-form-field"
                />
                <MobileInput
                  id="fuelUsed"
                  label={flightSettings.getFuelUnitLabel()}
                  value={formData.fuelUsed}
                  onChange={(value) => setFormData({ ...formData, fuelUsed: value })}
                  placeholder={flightSettings.getFuelUnitPlaceholder()}
                  keyboardType="decimal"
                  validation={{
                    pattern: /^\d+(\.\d+)?$/,
                    required: isCompleted,
                    custom: (value: string) => {
                      const num = parseFloat(value);
                      if (value && (isNaN(num) || num < 0)) {
                        return 'Positivo';
                      }
                      return null;
                    }
                  }}
                  required={isCompleted}
                  className="mobile-form-field [&>label]:whitespace-nowrap"
                />
                <MobileInput
                  id="landingRate"
                  label="Ldg Rate"
                  value={formData.landingRate}
                  onChange={(value) => setFormData({ ...formData, landingRate: value })}
                  placeholder="-156"
                  keyboardType="number"
                  validation={{
                    ...VALIDATIONS.LANDING_RATE,
                    required: isCompleted
                  }}
                  required={isCompleted}
                  className="mobile-form-field"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <MobileInput
                  id="experiencePoints"
                  label="XP"
                  value={formData.experiencePoints}
                  onChange={(value) => setFormData({ ...formData, experiencePoints: value })}
                  placeholder="1250"
                  keyboardType="number"
                  validation={{
                    ...VALIDATIONS.POSITIVE_NUMBER,
                    required: isCompleted
                  }}
                  required={isCompleted}
                  className="mobile-form-field"
                />
                <MobileInput
                  id="careerRating"
                  label="CR"
                  value={formData.careerRating}
                  onChange={(value) => setFormData({ ...formData, careerRating: value })}
                  placeholder="92"
                  keyboardType="number"
                  validation={{
                    pattern: /^\d+$/,
                    required: isCompleted,
                    custom: (value: string) => {
                      const num = parseInt(value);
                      if (value && (isNaN(num) || num < 0)) {
                        return 'Positivo';
                      }
                      return null;
                    }
                  }}
                  required={isCompleted}
                  className="mobile-form-field"
                />
              </div>
              
              <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 mt-auto">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setOpen(false)}
                  className="mobile-touch-target order-2 sm:order-1 flex-1 sm:flex-none"
                >
                  {t('common.cancel')}
                </Button>
                <Button 
                  type="submit" 
                  variant="hud"
                  className="mobile-touch-target order-1 sm:order-2 flex-1 sm:flex-none"
                >
                  {flight ? 'Atualizar' : 'Salvar Voo'}
                </Button>
              </div>
            </div>
          </div>
        </form>
        <AirportManualInputDialog
          icaoCode={manualInputIcao}
          open={showManualInputDialog}
          onOpenChange={setShowManualInputDialog}
          onSave={handleManualAirportSave}
        />
      </DialogContent>
    </Dialog>
  );
});

AddFlightModal.displayName = 'AddFlightModal';

export default AddFlightModal;