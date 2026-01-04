/**
 * Componente para atualizar informações de aeroportos em voos existentes
 * Use este componente para preencher os campos origin_airport_info e destination_airport_info
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useFlightAirportUpdater } from '@/hooks/business/useFlightAirportUpdater';
import { useSupabaseFlights, Flight } from '@/hooks/supabase/useSupabaseFlights';
import { RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';

export const UpdateFlightsAirports = () => {
  const { flights } = useSupabaseFlights();
  const { updateAllFlightsAirports } = useFlightAirportUpdater();
  const [isUpdating, setIsUpdating] = useState(false);
  
  // Contar voos sem informações de aeroportos
  const flightsWithoutOriginInfo = flights.filter((f: Flight) => !f.originAirportInfo?.name);
  const flightsWithoutDestinationInfo = flights.filter((f: Flight) => !f.destinationAirportInfo?.name);
  const flightsNeedingUpdate = flights.filter((f: Flight) => !f.originAirportInfo?.name || !f.destinationAirportInfo?.name);

  const handleUpdateAll = async () => {
    if (flightsNeedingUpdate.length === 0) {
      alert('Todos os voos já têm informações de aeroportos!');
      return;
    }

    const confirmed = window.confirm(
      `Deseja atualizar ${flightsNeedingUpdate.length} voos com informações de aeroportos?\n\n` +
      `Esta ação buscará as informações dos aeroportos para cada voo e atualizará o banco de dados.\n\n` +
      `Voos sem origem: ${flightsWithoutOriginInfo.length}\n` +
      `Voos sem destino: ${flightsWithoutDestinationInfo.length}`
    );

    if (!confirmed) return;

    setIsUpdating(true);
    try {
      await updateAllFlightsAirports();
    } catch (error) {
      console.error('Erro ao atualizar voos:', error);
      alert('Erro ao atualizar voos. Verifique o console para mais detalhes.');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <RefreshCw className="h-5 w-5" />
          Atualizar Informações de Aeroportos
        </CardTitle>
        <CardDescription>
          Preencha os dados de aeroportos (nome, cidade, estado) em voos existentes
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Estatísticas */}
        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 bg-muted/20 rounded-lg text-center">
            <div className="text-2xl font-bold text-readable">{flights.length}</div>
            <div className="text-sm text-muted-foreground">Total de Voos</div>
          </div>
          <div className="p-4 bg-muted/20 rounded-lg text-center">
            <div className="text-2xl font-bold text-success">{flights.length - flightsNeedingUpdate.length}</div>
            <div className="text-sm text-muted-foreground">Com Aeroportos</div>
          </div>
          <div className="p-4 bg-muted/20 rounded-lg text-center">
            <div className="text-2xl font-bold text-warning">{flightsNeedingUpdate.length}</div>
            <div className="text-sm text-muted-foreground">Precisam Atualizar</div>
          </div>
        </div>

        {/* Detalhes */}
        {flightsNeedingUpdate.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <AlertCircle className="h-4 w-4 text-warning" />
              <span>Voos sem aeroporto de origem: {flightsWithoutOriginInfo.length}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <AlertCircle className="h-4 w-4 text-warning" />
              <span>Voos sem aeroporto de destino: {flightsWithoutDestinationInfo.length}</span>
            </div>
          </div>
        )}

        {flightsNeedingUpdate.length === 0 && (
          <div className="flex items-center gap-2 text-sm text-success">
            <CheckCircle className="h-4 w-4" />
            <span>Todos os voos já têm informações de aeroportos!</span>
          </div>
        )}

        {/* Botão de ação */}
        <Button
          onClick={handleUpdateAll}
          disabled={isUpdating || flightsNeedingUpdate.length === 0}
          className="w-full"
        >
          {isUpdating ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Atualizando {flightsNeedingUpdate.length} voos...
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4 mr-2" />
              Atualizar Todos os Voos
            </>
          )}
        </Button>

        {/* Informações adicionais */}
        <div className="text-xs text-muted-foreground space-y-1">
          <p>• Esta ação buscará informações dos aeroportos na base de dados OurAirports (76.000+ aeroportos)</p>
          <p>• A atualização pode levar alguns minutos dependendo da quantidade de voos</p>
          <p>• Você também pode atualizar voos individualmente editando-os</p>
        </div>
      </CardContent>
    </Card>
  );
};
