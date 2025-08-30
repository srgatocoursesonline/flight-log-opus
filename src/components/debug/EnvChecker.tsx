import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const EnvChecker = () => {
  const [envVars, setEnvVars] = useState({
    supabaseUrl: import.meta.env.VITE_SUPABASE_URL || null,
    supabaseKey: import.meta.env.VITE_SUPABASE_ANON_KEY || null,
    appEnv: import.meta.env.VITE_APP_ENV || null,
    allVars: Object.keys(import.meta.env).filter(key => key.startsWith('VITE_'))
  });

  const [isLoading, setIsLoading] = useState(false);

  const refreshCheck = () => {
    setIsLoading(true);
    
    // Simular uma operação assíncrona
    setTimeout(() => {
      setEnvVars({
        supabaseUrl: import.meta.env.VITE_SUPABASE_URL || null,
        supabaseKey: import.meta.env.VITE_SUPABASE_ANON_KEY || null,
        appEnv: import.meta.env.VITE_APP_ENV || null,
        allVars: Object.keys(import.meta.env).filter(key => key.startsWith('VITE_'))
      });
      setIsLoading(false);
    }, 500);
  };

  return (
    <Card className="w-full max-w-md mx-auto border-2">
      <CardHeader>
        <CardTitle className="text-xl">Verificador de Variáveis de Ambiente</CardTitle>
        <CardDescription>
          Verifica se as variáveis de ambiente do Vite estão carregadas corretamente
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center p-6">
            <RefreshCw className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Verificando...</span>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2">
              {envVars.supabaseUrl ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-500" />
              )}
              <span>
                VITE_SUPABASE_URL: {envVars.supabaseUrl ? 'Configurado' : 'Não encontrado'}
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              {envVars.supabaseKey ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-500" />
              )}
              <span>
                VITE_SUPABASE_ANON_KEY: {envVars.supabaseKey ? 'Configurado' : 'Não encontrado'}
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              {envVars.appEnv ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <AlertCircle className="h-5 w-5 text-yellow-500" />
              )}
              <span>
                VITE_APP_ENV: {envVars.appEnv || 'Não definido'}
              </span>
            </div>

            <Alert variant={envVars.allVars.length > 0 ? 'default' : 'destructive'} className="mt-4">
              <AlertTitle>Variáveis VITE_ encontradas: {envVars.allVars.length}</AlertTitle>
              <AlertDescription>
                {envVars.allVars.length > 0 ? (
                  <ul className="list-disc pl-5 mt-2 space-y-1">
                    {envVars.allVars.map(key => (
                      <li key={key}>{key}</li>
                    ))}
                  </ul>
                ) : (
                  <p>Nenhuma variável de ambiente VITE_ foi encontrada.</p>
                )}
              </AlertDescription>
            </Alert>
          </>
        )}
      </CardContent>
      
      <CardFooter>
        <Button 
          onClick={refreshCheck} 
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> 
              Verificando...
            </>
          ) : 'Verificar Novamente'}
        </Button>
      </CardFooter>
    </Card>
  );
};