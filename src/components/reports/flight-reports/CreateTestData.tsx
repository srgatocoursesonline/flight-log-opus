import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

export function CreateTestData() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const createTestFlights = async () => {
    if (!user?.id) {
      setMessage('Usuário não autenticado');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      // Create sample flights
      const testFlights = [
        {
          user_id: user.id,
          flight_number: 'G31001',
          departure_airport: 'SBSP',
          arrival_airport: 'SBRJ',
          departure_time: '2024-01-15T08:00:00Z',
          arrival_time: '2024-01-15T09:30:00Z',
          aircraft_type: 'B737-800',
          aircraft_registration: 'PR-GXA',
          airline: 'GOL',
          flight_time: '1:30',
          distance: 365,
          status: 'arrived',
          notes: 'Voo teste 1',
          pilot_name: 'João Silva',
          flight_type: 'commercial',
          revenue: 450.00,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          user_id: user.id,
          flight_number: 'G31002',
          departure_airport: 'SBRJ',
          arrival_airport: 'SBSP',
          departure_time: '2024-01-15T15:00:00Z',
          arrival_time: '2024-01-15T16:30:00Z',
          aircraft_type: 'B737-800',
          aircraft_registration: 'PR-GXB',
          airline: 'GOL',
          flight_time: '1:30',
          distance: 365,
          status: 'arrived',
          notes: 'Voo teste 2',
          pilot_name: 'Maria Santos',
          flight_type: 'commercial',
          revenue: 480.00,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          user_id: user.id,
          flight_number: 'AD4001',
          departure_airport: 'SBGR',
          arrival_airport: 'SBGL',
          departure_time: '2024-01-16T10:00:00Z',
          arrival_time: '2024-01-16T11:45:00Z',
          aircraft_type: 'A320',
          aircraft_registration: 'PR-MYA',
          airline: 'Azul',
          flight_time: '1:45',
          distance: 365,
          status: 'arrived',
          notes: 'Voo teste 3',
          pilot_name: 'Carlos Oliveira',
          flight_type: 'commercial',
          revenue: 520.00,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];

      const { data, error } = await supabase
        .from('flights')
        .insert(testFlights)
        .select();

      if (error) {
        throw error;
      }

      setMessage(`✅ Criados ${data.length} voos de teste com sucesso!`);
      
      // Refresh the page after 2 seconds
      setTimeout(() => {
        window.location.reload();
      }, 2000);

    } catch (error: any) {
      console.error('Erro ao criar dados de teste:', error);
      setMessage(`❌ Erro: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const checkExistingFlights = async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('flights')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;

      setMessage(`📊 Você tem ${data.length} voos cadastrados no banco de dados.`);
    } catch (error: any) {
      setMessage(`❌ Erro ao verificar voos: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-md">
      <CardHeader>
        <CardTitle>Dados de Teste</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Button 
            onClick={checkExistingFlights} 
            disabled={loading}
            variant="outline"
            className="w-full"
          >
            {loading ? 'Verificando...' : 'Verificar Voos Existentes'}
          </Button>
          
          <Button 
            onClick={createTestFlights} 
            disabled={loading}
            className="w-full"
          >
            {loading ? 'Criando...' : 'Criar 3 Voos de Teste'}
          </Button>
        </div>

        {message && (
          <div className="p-3 rounded bg-muted text-sm">
            {message}
          </div>
        )}

        <div className="text-xs text-muted-foreground">
          <p><strong>User ID:</strong> {user?.id}</p>
          <p>Os voos de teste serão criados com datas de janeiro/2024</p>
        </div>
      </CardContent>
    </Card>
  );
}