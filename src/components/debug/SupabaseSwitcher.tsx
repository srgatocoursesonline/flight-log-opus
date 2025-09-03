import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, XCircle, Wifi, Download } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { supabase } from '@/lib/supabase';

export function SupabaseSwitcher() {
  const [isChecking, setIsChecking] = useState(false);
  const [connectionOk, setConnectionOk] = useState<boolean | null>(null);
  
  // Test connection on component mount
  const checkConnection = async () => {
    setIsChecking(true);
    try {
      // Test direct connection
      const { data, error } = await supabase.from('profiles').select('id').limit(1);
      setConnectionOk(!error);
    } catch (error) {
      setConnectionOk(false);
      // Removido o console.error para reduzir logs
    } finally {
      setIsChecking(false);
    }
  };
  
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Cliente Alternativo</span>
          {connectionOk 
            ? <Wifi className="text-green-500 h-5 w-5" />
            : <XCircle className="text-red-500 h-5 w-5" />}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2 mb-4">
          {connectionOk === true ? (
            <CheckCircle className="h-5 w-5 text-green-500" />
          ) : connectionOk === false ? (
            <XCircle className="h-5 w-5 text-red-500" />
          ) : null}
          <span>
            {connectionOk === null 
              ? 'Clique para testar a conexão' 
              : connectionOk 
                ? 'Cliente alternativo funcionando' 
                : 'Cliente alternativo com problemas'}
          </span>
        </div>
        
        {connectionOk !== null && (
          <Alert variant={connectionOk ? "default" : "destructive"}>
            <AlertTitle>Resultado do Teste</AlertTitle>
            <AlertDescription>
              {connectionOk 
                ? 'A conexão direta com o Supabase está funcionando!' 
                : 'Erro ao conectar com o cliente alternativo.'}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <Button 
          onClick={checkConnection}
          disabled={isChecking}
          variant="outline"
        >
          {isChecking ? 'Verificando...' : 'Testar Conexão'}
        </Button>
        
        {connectionOk && (
          <Button
            variant="default"
          >
            <Download className="mr-2 h-4 w-4" />
            Instruções
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}