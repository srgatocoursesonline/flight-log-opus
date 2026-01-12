import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function FlightDataDebug() {
  const { user } = useAuth();
  const [debugInfo, setDebugInfo] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkData() {
      if (!user?.id) return;

      try {
        setLoading(true);
        
        // Check flights table
        const { data: flights, error: flightsError } = await supabase
          .from('flights')
          .select('*')
          .eq('user_id', user.id)
          .limit(5);

        // Check financial_transactions table
        const { data: transactions, error: transactionsError } = await supabase
          .from('financial_transactions')
          .select('*')
          .eq('user_id', user.id)
          .limit(5);

        // Check user info
        const userInfo = {
          id: user.id,
          email: user.email
        };

        setDebugInfo({
          user: userInfo,
          flights: {
            data: flights,
            error: flightsError,
            count: flights?.length || 0
          },
          transactions: {
            data: transactions,
            error: transactionsError,
            count: transactions?.length || 0
          }
        });

      } catch (error) {
        console.error('Debug error:', error);
        setDebugInfo({ error: error.message });
      } finally {
        setLoading(false);
      }
    }

    checkData();
  }, [user?.id]);

  if (loading) {
    return <div>Loading debug info...</div>;
  }

  return (
    <div className="p-6 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Flight Data Debug</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="text-xs bg-muted p-4 rounded overflow-auto max-h-96">
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
}