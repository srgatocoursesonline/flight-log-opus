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
import { Plus, Plane } from 'lucide-react';
import { useFlights, type Flight } from '@/hooks/useFlights';
import { useAircraftManager } from '@/hooks/useAircraftManager';
import { useFlightStatusManager } from '@/hooks/useFlightStatusManager';
import { autoRefresh } from '@/utils/autoRefresh';

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
  const { addFlight, updateFlight } = useFlights();
  const aircraftManager = useAircraftManager();
  const statusManager = useFlightStatusManager();
  const [open, setOpen] = useState(false);

  // Expor método para abrir modal externamente
  useImperativeHandle(ref, () => ({
    openModal: () => setOpen(true)
  }));

  const [formData, setFormData] = useState({
    callsign: flight?.callsign || '',
    aircraft: flight?.aircraft || '',
    departure: flight?.departure || '',
    arrival: flight?.arrival || '',
    departureTime: flight?.departureTime || '',
    arrivalTime: flight?.arrivalTime || '',
    flightTime: flight?.flightTime || '',
    distance: flight?.distance?.toString() || '',
    fuelUsed: flight?.fuelUsed?.toString() || '',
    landingRate: flight?.landingRate?.toString() || '',
    experiencePoints: flight?.experiencePoints?.toString() || '',
    careerRating: flight?.careerRating?.toString() || '',
    status: flight?.status || 'planned',
    date: flight?.date || new Date().toISOString().split('T')[0],
    route: flight?.route || '',
    notes: flight?.notes || ''
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
        notes: flight.notes || ''
      });
    }
  }, [flight]);

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

  // Obter opções de aeronaves: aeronaves customizadas ativas + aeronaves padrão
  const aircraftOptions = [
    // Aeronaves customizadas ativas
    ...aircraftManager.customAircraft
      .filter(aircraft => aircraft.isActive)
      .map(aircraft => aircraft.name),
    
    // Aeronaves padrão (MSFS)
    'Airbus A310-300',
    'Airbus A320neo',
    'Airbus A321LR',
    'Airbus A330-200',
    'Airbus A330-300',
    'Airbus A330-300P2F',
    'Boeing 737 MAX 8',
    'Boeing 747-8i',
    'Boeing 747-8F',
    'Boeing 787-10 Dreamliner',
    'Boeing 707-320C',
    'ATR 42-600',
    'ATR 72-600',
    'Saab 340B',
    'Boeing 307 Stratoliner',
    'Cessna Citation CJ4',
    'Cessna Citation Longitude',
    'Cirrus Vision SF50',
    'Pilatus PC-24',
    'Daher TBM 930',
    'Cessna 152',
    'Cessna 152 Aerobat',
    'Cessna 172 Skyhawk',
    'Cessna 172 Skyhawk (G1000)',
    'Cessna 188 AGTruck',
    'Cessna 195 Businessliner',
    'Cessna 207T',
    'Cessna 208 B Grand Caravan EX',
    'Cessna 400 Corvalis TT',
    'Cessna 404 Titan',
    'Cessna 408 SkyCourier',
    'Beechcraft Bonanza G36',
    'Beechcraft Bonanza V35',
    'Beechcraft Baron G58',
    'Beechcraft C90 GTX King Air',
    'Beechcraft King Air 350i',
    'Beechcraft Model 17 Staggerwing',
    'Beechcraft Model 18 Twin Beech',
    'Diamond DA40 NG',
    'Diamond DA40 TDI',
    'Diamond DA62',
    'Diamond DV20',
    'Cirrus SR22',
    'Pilatus PC-6 B2',
    'Pilatus PC-12 NGX',
    'Pipistrel Virus SW121',
    'Pipistrel Taurus M',
    'JMB VL-3',
    'Flight Design CTSL',
    'CubCrafters NXCub',
    'CubCrafters XCub',
    'Zlin Savage Cub',
    'Zlin Savage Norden',
    'Draco X',
    'ICON A5',
    'De Havilland Canada DHC-2 Beaver',
    'De Havilland Canada DHC-4 Caribou',
    'De Havilland Canada DHC-6 Twin Otter',
    'EXTRA 330LT',
    'Aviat Pitts Special S1S',
    'Aviat Pitts Special S2S',
    'Zivko Edge 540',
    'Robin CAP 10',
    'Robin DR400-100 Cadet',
    'MX Aircraft MXS-R',
    'Zlin Shock Ultra',
    'Granville Gee Bee R2',
    'Granville Gee Bee Z',
    'DG Aviation DG-1001E',
    'DG Aviation LS8-18',
    'Stemme S12G',
    'Bell 407',
    'Bell 47J Ranger',
    'Guimbal Cabri G2',
    'Airbus Helicopter H125',
    'Airbus Helicopter H225',
    'Robinson R66',
    'Magni Gyro M-24 Orion',
    'Boeing CH47D Chinook',
    'Erickson S-64F Aircrane',
    'Westland Scout',
    'Westland Wasp',
    'Boeing F/A-18E Super Hornet',
    'Fairchild Republic A-10 Thunderbolt II',
    'Airbus A400M Atlas',
    'Boeing C-17 Globemaster III',
    'Curtiss C-46 Commando',
    'Douglas C-47D Skytrain',
    'Waco CG-4A Glider',
    'Saab 17 B',
    'Air Tractor AT-802',
    'De Havilland Canada CL-415',
    'Boeing 747-400 Global Supertanker',
    'Grumman G-21A Goose',
    'Amphibian Aerospace Albatross G111/HU16',
    'Dornier Seastar',
    'Airbus A330-743L Beluga XL',
    'Boeing 747-400 LCF Dreamlifter',
    'Hughes H-4 Hercules (Spruce Goose)',
    'Mitsubishi MU-2',
    'Short SC.7 Skyvan',
    'North American P-51D Mustang',
    'North American T-6 Texan',
    'Curtiss JN-4 Jenny',
    'Douglas DC-3',
    'Ryan NYP "Spirit of St. Louis"',
    'Wright Cycle Company Wright Flyer',
    'Ford 4AT Trimotor',
    'Junkers F13',
    'Junkers JU 52',
    'Focke-Wulf FW 200 Condor',
    'Fokker F.VII',
    'Dornier Do J Wal',
    'Dornier Do X',
    'Dornier Do 31',
    'Savoia-Marchetti S.55',
    'Latécoère 631',
    'Aero Ae-45',
    'Aero Ae-145',
    'Antonov An-2',
    'Antonov An-225',
    'CGS Hawk Arrow II',
    'AeroElvira Optica',
    'Powrachute Sky Rascal',
    'Aero Vodochody L-39',
    'Archer Midnight',
    'Heart Aerospace ES-30',
    'Jetson One',
    'Joby Aviation S4',
    'Volocopter VoloCity',
    'Airship Industries Skyship 600',
    'Hot Air Balloon',
    'FlyDoo Hot Air Balloon'
  ];

  // Obter opções de status: status customizados ativos + conversão para formato compatível
  const statusOptions = [
    // Status customizados ativos
    ...statusManager.getActiveStatuses().map(status => ({
      value: status.id,
      label: `${status.icon} ${status.name}`
    })),
    
    // Fallback para status padrão se não houver customizados
    ...(statusManager.getActiveStatuses().length === 0 ? [
      { value: 'planned', label: t('common.planned') },
      { value: 'active', label: 'Em Voo' },
      { value: 'completed', label: t('common.completed') },
      { value: 'cancelled', label: t('common.cancelled') }
    ] : [])
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
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
      notes: formData.notes
    };

    if (flight) {
      updateFlight(flight.id, flightData);
    } else {
      addFlight(flightData);
      // Trigger automatic refresh after adding new flight to update all dashboard cards
      autoRefresh();
    }

    setOpen(false);
    if (onClose) onClose();
    
    // Reset form
    if (!flight) {
      setFormData({
        callsign: '',
        aircraft: '',
        departure: '',
        arrival: '',
        departureTime: '',
        arrivalTime: '',
        flightTime: '',
        distance: '',
        fuelUsed: '',
        landingRate: '',
        experiencePoints: '',
        careerRating: '',
        status: 'planned',
        date: new Date().toISOString().split('T')[0],
        route: '',
        notes: ''
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
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger !== null && (
        <DialogTrigger asChild>
          {trigger || defaultTrigger}
        </DialogTrigger>
      )}
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto glass-panel">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <Plane className="h-5 w-5 text-primary" />
            {flight ? 'Editar Voo' : t('flights.logNewFlight')}
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
              <Label htmlFor="fuelUsed" className="text-foreground">Combustível (lb)</Label>
              <Input
                id="fuelUsed"
                type="number"
                placeholder="6283"
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

          {/* Linha 7: Observações */}
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