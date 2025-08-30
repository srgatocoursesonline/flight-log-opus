import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, RefreshCw, Bug } from 'lucide-react';

interface LogEntry {
  type: 'log' | 'error' | 'warn';
  timestamp: string;
  message: string;
}

export const EnvDebug = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<{
    success?: boolean;
    error?: string;
    data?: any;
  }>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Capturar logs do console
    const originalLog = console.log;
    const originalError = console.error;
    const originalWarn = console.warn;
    
    const addLog = (type: 'log' | 'error' | 'warn', ...args: any[]) => {
      const timestamp = new Date().toLocaleTimeString();
      const message = args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
      ).join(' ');
      
      setLogs(prev => [...prev, { type, timestamp, message }]);
    };
    
    console.log = (...args) => {
      originalLog(...args);
      addLog('log', ...args);
    };
    
    console.error = (...args) => {
      originalError(...args);
      addLog('error', ...args);
    };
    
    console.warn = (...args) => {
      originalWarn(...args);
      addLog('warn', ...args);
    };
    
  
    
    return () => {
      console.log = originalLog;
      console.error = originalError;
      console.warn = originalWarn;
    };
  }, []);

  const testSupabaseConnection = async () => {
    setIsLoading(true);
    setConnectionStatus({});
    
    try {
  
      
      // Importar o cliente Supabase
      const { supabase } = await import('@/lib/config/supabase');
      
      console.log('Cliente Supabase importado:', supabase);
      
      // Testar autenticação
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        throw new Error(`Erro de sessão: ${sessionError.message}`);
      }
      
      console.log('Sessão obtida:', sessionData);
      
      // Testar consulta ao banco
      const { data, error } = await supabase
        .from('profiles')
        .select('id')
        .limit(1);
      
      if (error) {
        throw new Error(`Erro de banco: ${error.message}`);
      }
      
      console.log('Dados do banco obtidos:', data);
      
      setConnectionStatus({
        success: true,
        data: {
          session: sessionData.session ? 'Ativa' : 'Não autenticado',
          dbData: data
        }
      });
      
    } catch (error: any) {
      console.error('Erro no teste de conexão:', error);
      setConnectionStatus({
        success: false,
        error: error.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Obter variáveis de ambiente
  const getEnvironmentVariables = () => {
    const envVars: Record<string, string> = {};
    const allEnvVars: Record<string, any> = {};
    
    Object.keys(import.meta.env).forEach(key => {
      allEnvVars[key] = import.meta.env[key];
      if (key.startsWith('VITE_')) {
        envVars[key] = key.includes('KEY') ? '[PROTEGIDO]' : String(import.meta.env[key]);
      }
    });
    
    return { envVars, allEnvVars };
  };

  const { envVars, allEnvVars } = getEnvironmentVariables();

  const systemInfo = {
    userAgent: navigator.userAgent,
    url: window.location.href,
    timestamp: new Date().toISOString(),
    viteMode: import.meta.env.MODE || 'N/A',
    viteDev: import.meta.env.DEV || false,
    viteProd: import.meta.env.PROD || false
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <Bug className="h-6 w-6 text-primary" />
            Debug de Variáveis de Ambiente - Supabase
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Informações do Sistema */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">📋 Informações do Sistema</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="bg-muted p-4 rounded text-xs overflow-x-auto">
            {JSON.stringify(systemInfo, null, 2)}
          </pre>
        </CardContent>
      </Card>

      {/* Variáveis de Ambiente */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">🌍 Variáveis de Ambiente</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.keys(envVars).length === 0 ? (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertTitle>Nenhuma variável VITE_ encontrada!</AlertTitle>
              <AlertDescription>
                As variáveis de ambiente não estão sendo carregadas corretamente.
              </AlertDescription>
            </Alert>
          ) : (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertTitle>Variáveis VITE_ encontradas</AlertTitle>
              <AlertDescription>
                {Object.keys(envVars).length} variáveis VITE_ carregadas.
              </AlertDescription>
            </Alert>
          )}
          
          <div>
            <h4 className="font-medium mb-2">Variáveis VITE_:</h4>
            <pre className="bg-muted p-4 rounded text-xs overflow-x-auto">
              {JSON.stringify(envVars, null, 2)}
            </pre>
          </div>
          
          <div>
            <h4 className="font-medium mb-2">Todas as variáveis disponíveis:</h4>
            <pre className="bg-muted p-4 rounded text-xs overflow-x-auto max-h-64">
              {JSON.stringify(allEnvVars, null, 2)}
            </pre>
          </div>
        </CardContent>
      </Card>

      {/* Teste de Conexão */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center justify-between">
            🔗 Teste de Conexão Supabase
            <Button 
              onClick={testSupabaseConnection} 
              disabled={isLoading}
              size="sm"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Testando...
                </>
              ) : (
                'Testar Conexão'
              )}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {connectionStatus.success === true && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertTitle>Conexão bem-sucedida!</AlertTitle>
              <AlertDescription>
                <pre className="mt-2 text-xs">
                  {JSON.stringify(connectionStatus.data, null, 2)}
                </pre>
              </AlertDescription>
            </Alert>
          )}
          
          {connectionStatus.success === false && (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertTitle>Erro na conexão</AlertTitle>
              <AlertDescription>
                <pre className="mt-2 text-xs">
                  {connectionStatus.error}
                </pre>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Logs do Console */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center justify-between">
            📊 Logs do Console
            <Button 
              onClick={() => setLogs([])} 
              variant="outline" 
              size="sm"
            >
              Limpar Logs
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-black text-green-400 p-4 rounded font-mono text-xs max-h-96 overflow-y-auto">
            {logs.length === 0 ? (
              <div className="text-gray-500">Nenhum log capturado ainda...</div>
            ) : (
              logs.map((log, index) => (
                <div 
                  key={index} 
                  className={`mb-1 ${
                    log.type === 'error' ? 'text-red-400' : 
                    log.type === 'warn' ? 'text-yellow-400' : 
                    'text-green-400'
                  }`}
                >
                  [{log.timestamp}] {log.type.toUpperCase()}: {log.message}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EnvDebug;