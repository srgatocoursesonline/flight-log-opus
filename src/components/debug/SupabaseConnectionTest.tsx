import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
// Removed supabaseDiagnostic import as file was deleted
import { supabase } from '@/lib/supabase';

export const SupabaseConnectionTest = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<{
    envOk?: boolean;
    connectionOk?: boolean;
    message?: string;
    error?: string;
  }>({});

  const runTest = async () => {
    setIsLoading(true);
    setStatus({});

    try {
      console.log('=== INICIANDO DIAGNÓSTICO SUPABASE ===');
      console.log('Cliente Supabase:', supabase);
      

      
      // Teste simples de conexão
      const { data, error } = await supabase.from('flights').select('count').limit(1);
      const connectionOk = !error;
      
      setStatus({
        envOk: true,
        connectionOk,
        message: connectionOk 
          ? 'Conexão com Supabase estabelecida com sucesso!' 
          : `Falha na conexão com Supabase: ${error?.message}`
      });
    } catch (error) {
      console.error('Erro ao executar diagnóstico:', error);
      setStatus({
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Executar teste automático ao montar o componente
    runTest();
  }, []);

  return (
    <Card className="w-full max-w-md mx-auto border-2">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <span className="text-primary">Diagnóstico do Supabase</span>
        </CardTitle>
        <CardDescription>
          Verificação da conexão com o banco de dados
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center p-6">
            <RefreshCw className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Verificando conexão...</span>
          </div>
        ) : (
          <>
            {status.envOk !== undefined && (
              <div className="flex items-center gap-2">
                {status.envOk ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-500" />
                )}
                <span>
                  {status.envOk
                    ? 'Variáveis de ambiente configuradas corretamente'
                    : 'Problema com variáveis de ambiente'}
                </span>
              </div>
            )}

            {status.connectionOk !== undefined && (
              <div className="flex items-center gap-2">
                {status.connectionOk ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-500" />
                )}
                <span>
                  {status.connectionOk
                    ? 'Conexão com banco de dados OK'
                    : 'Falha na conexão com banco de dados'}
                </span>
              </div>
            )}

            {status.message && (
              <Alert variant={status.connectionOk ? 'default' : 'destructive'}>
                <AlertTitle>
                  {status.connectionOk ? 'Sucesso!' : 'Erro de conexão'}
                </AlertTitle>
                <AlertDescription>{status.message}</AlertDescription>
              </Alert>
            )}

            {status.error && (
              <Alert variant="destructive">
                <AlertTitle>Erro no diagnóstico</AlertTitle>
                <AlertDescription>{status.error}</AlertDescription>
              </Alert>
            )}
          </>
        )}
      </CardContent>

      <CardFooter>
        <Button 
          onClick={runTest} 
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> 
              Verificando...
            </>
          ) : (
            'Testar Conexão Novamente'
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};