import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const SupabaseTest = () => {
  const { user } = useAuth();
  const [testResult, setTestResult] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const testConnection = async () => {
    setIsLoading(true);
    setTestResult('Testando conexão...');

    try {
      // Teste 1: Verificar conexão básica
      const { data: healthCheck, error: healthError } = await supabase
        .from('profiles')
        .select('count')
        .limit(1);

      if (healthError) {
        setTestResult(`❌ Erro de conexão: ${healthError.message}`);
        return;
      }

      setTestResult('✅ Conexão OK\n');

      // Teste 2: Verificar usuário autenticado
      if (!user) {
        setTestResult(prev => prev + '❌ Usuário não autenticado');
        return;
      }

      setTestResult(prev => prev + `✅ Usuário autenticado: ${user.email}\n`);

      // Teste 3: Tentar inserir uma transação de teste
      const testTransaction = {
        user_id: user.id,
        transaction_type: 'revenue' as const,
        description: 'Teste de conexão',
        amount: 1.00,
        transaction_date: new Date().toISOString().split('T')[0],
        category_id: null
      };

      const { data: insertData, error: insertError } = await supabase
        .from('financial_transactions')
        .insert(testTransaction)
        .select()
        .single();

      if (insertError) {
        setTestResult(prev => prev + `❌ Erro ao inserir: ${insertError.message}\nDetalhes: ${JSON.stringify(insertError, null, 2)}`);
        return;
      }

      setTestResult(prev => prev + `✅ Transação inserida com sucesso!\nID: ${insertData.id}\n`);

      // Teste 4: Deletar a transação de teste
      const { error: deleteError } = await supabase
        .from('financial_transactions')
        .delete()
        .eq('id', insertData.id);

      if (deleteError) {
        setTestResult(prev => prev + `⚠️ Erro ao deletar transação de teste: ${deleteError.message}`);
      } else {
        setTestResult(prev => prev + '✅ Transação de teste removida com sucesso!');
      }

    } catch (error) {
      setTestResult(`❌ Erro inesperado: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Teste de Conexão Supabase</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={testConnection} 
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? 'Testando...' : 'Testar Conexão'}
        </Button>
        
        {testResult && (
          <div className="bg-gray-100 p-4 rounded-md">
            <pre className="whitespace-pre-wrap text-sm">{testResult}</pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SupabaseTest;