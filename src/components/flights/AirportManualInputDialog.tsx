import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { AirportInfo } from '@/lib/airportService';

interface AirportManualInputDialogProps {
  icaoCode: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (airportInfo: AirportInfo) => void;
}

export function AirportManualInputDialog({
  icaoCode,
  open,
  onOpenChange,
  onSave
}: AirportManualInputDialogProps) {
  const [formData, setFormData] = useState<Partial<AirportInfo>>({
    icao_code: icaoCode,
    iata_code: '',
    name: '',
    city: '',
    state: '',
    country_code: '',
    lat: 0,
    lng: 0
  });

  // Reset form when dialog opens with new ICAO code
  useEffect(() => {
    if (open) {
      console.log('Dialog aberto com ICAO:', icaoCode);
      setFormData({
        icao_code: icaoCode,
        iata_code: '',
        name: '',
        city: '',
        state: '',
        country_code: '',
        lat: 0,
        lng: 0
      });
    }
  }, [open, icaoCode]);

  const handleSave = () => {
    console.log('Tentando salvar aeroporto:', formData);
    
    if (!formData.name || !formData.icao_code) {
      console.log('Campos obrigatórios faltando:', { name: formData.name, icao: formData.icao_code });
      return;
    }

    console.log('Salvando aeroporto com sucesso:', formData);
    onSave(formData as AirportInfo);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Adicionar Aeroporto Manualmente</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="icao" className="text-right">
              ICAO
            </Label>
            <Input
              id="icao"
              value={formData.icao_code}
              className="col-span-3"
              disabled
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="iata" className="text-right">
              IATA
            </Label>
            <Input
              id="iata"
              value={formData.iata_code}
              onChange={(e) => setFormData({ ...formData, iata_code: e.target.value.toUpperCase() })}
              className="col-span-3"
              maxLength={3}
              placeholder="Código IATA (opcional)"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Nome
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => {
                console.log('Campo nome atualizado:', e.target.value);
                setFormData({ ...formData, name: e.target.value });
              }}
              className="col-span-3"
              required
              placeholder="Nome do aeroporto"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="city" className="text-right">
              Cidade
            </Label>
            <Input
              id="city"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              className="col-span-3"
              placeholder="Cidade (opcional)"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="state" className="text-right">
              Estado
            </Label>
            <Input
              id="state"
              value={formData.state}
              onChange={(e) => setFormData({ ...formData, state: e.target.value })}
              className="col-span-3"
              placeholder="Estado/Província (opcional)"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="country" className="text-right">
              País
            </Label>
            <Input
              id="country"
              value={formData.country_code}
              onChange={(e) => setFormData({ ...formData, country_code: e.target.value.toUpperCase() })}
              className="col-span-3"
              maxLength={2}
              placeholder="Código do país (ex: BR)"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="lat" className="text-right">
              Latitude
            </Label>
            <Input
              id="lat"
              type="number"
              step="0.000001"
              value={formData.lat}
              onChange={(e) => setFormData({ ...formData, lat: parseFloat(e.target.value) || 0 })}
              className="col-span-3"
              placeholder="Ex: -23.5505"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="lng" className="text-right">
              Longitude
            </Label>
            <Input
              id="lng"
              type="number"
              step="0.000001"
              value={formData.lng}
              onChange={(e) => setFormData({ ...formData, lng: parseFloat(e.target.value) || 0 })}
              className="col-span-3"
              placeholder="Ex: -46.6333"
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" onClick={handleSave} disabled={!formData.name}>
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}