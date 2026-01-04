import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle, XCircle, RefreshCw, Database, FileCode, Code, Plane } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { UpdateFlightsAirports } from './UpdateFlightsAirports';

export const SuperDiagnostic = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [authStatus, setAuthStatus] = useState<{success?: boolean; error?: string}>({});
  const [dbStatus, setDbStatus] = useState<{success?: boolean; error?: string}>({});
  const [envVars, setEnvVars] = useState<Record<string, string>>({});
  const [dbInfo, setDbInfo] = useState<{tables: string[]}>({ tables: [] });

  const loadEnvironmentVariables = () => {
    // Collect all VITE_ environment variables
    const vars: Record<string, string> = {};
    Object.keys(import.meta.env).forEach(key => {
      if (key.startsWith('VITE_')) {
        vars[key] = key.includes('KEY') ? '[PROTECTED]' : String(import.meta.env[key]);
      }
    });
    setEnvVars(vars);
  };

  const runTests = async () => {
    setIsLoading(true);
    
    try {
      // Test 1: Authentication
      const authTest = await testAuth();
      setAuthStatus(authTest);
      
      // Test 2: Database Connection
      const dbTest = await testDatabaseConnection();
      setDbStatus(dbTest);
      
      // Get database info
      await getDatabaseInfo();
    } catch (error) {
      console.error('Error running tests:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadEnvironmentVariables();
    runTests();
  }, []);

  
  const testAuth = async () => {
    try {
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Auth error:', error);
        return { success: false, error: error.message };
      }
      
      return { 
        success: true, 
        session: data.session ? 'Active' : 'Not authenticated'
      };
    } catch (error) {
      console.error('Auth test error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  };
  
  const testDatabaseConnection = async () => {
    try {
      // Simple query to check connection
      const { data, error } = await supabase
        .from('profiles')
        .select('id')
        .limit(1);
      
      if (error) {
        console.error('Database connection error:', error);
        return { success: false, error: error.message };
      }
      
      return { 
        success: true, 
        data: `Retrieved ${data?.length || 0} records`
      };
    } catch (error) {
      console.error('Database test error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  };
  
  const getDatabaseInfo = async () => {
    try {
      // Get list of tables
      const { data, error } = await supabase.rpc('exec_sql', {
        sql_query: `
          SELECT table_name 
          FROM information_schema.tables 
          WHERE table_schema = 'public'
          ORDER BY table_name;
        `
      });
      
      if (error) {
        console.error('Error getting table info:', error);
        return;
      }
      
      // A função exec_sql agora retorna um array de objetos com propriedade 'result'
      if (data && data.length > 0 && data[0].result) {
        const tableData = data[0].result;
        if (Array.isArray(tableData)) {
          setDbInfo({
            tables: tableData.map((row: any) => row.table_name)
          });
        }
      }
    } catch (error) {
      console.error('Error getting database info:', error);
    }
  };
  
  return (
    <div className="container mx-auto py-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <Database className="h-6 w-6 text-primary" />
            Super Diagnóstico do Banco de Dados
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between bg-muted/30 p-3 rounded-lg">
            <div>
              <h3 className="text-lg font-medium">Status do Cliente Direto</h3>
              <p className="text-sm text-muted-foreground">
                Usando cliente com credenciais hardcoded
              </p>
            </div>
            <Button 
              onClick={runTests} 
              disabled={isLoading} 
              variant="outline" 
              size="sm"
              className="ml-auto"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Testando...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Testar Novamente
                </>
              )}
            </Button>
          </div>
          
          <Tabs defaultValue="connection">
            <TabsList className="grid grid-cols-4 mb-4">
              <TabsTrigger value="connection">Conexão</TabsTrigger>
              <TabsTrigger value="database">Banco de Dados</TabsTrigger>
              <TabsTrigger value="airports">Aeroportos</TabsTrigger>
              <TabsTrigger value="environment">Variáveis de Ambiente</TabsTrigger>
            </TabsList>
            
            <TabsContent value="connection" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                      {authStatus.success ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500" />
                      )}
                      Autenticação
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {authStatus.success ? (
                      <Alert>
                        <AlertTitle>Autenticação OK</AlertTitle>
                        <AlertDescription>
                          Cliente conectado ao serviço de autenticação.
                        </AlertDescription>
                      </Alert>
                    ) : (
                      <Alert variant="destructive">
                        <AlertTitle>Erro de Autenticação</AlertTitle>
                        <AlertDescription>
                          {authStatus.error || 'Erro desconhecido na autenticação.'}
                        </AlertDescription>
                      </Alert>
                    )}
                    
                    <div className="mt-4">
                      <h4 className="font-medium">Usuário</h4>
                      <pre className="bg-muted p-2 rounded text-xs mt-1">
                        {user ? JSON.stringify({
                          id: user.id,
                          email: user.email
                        }, null, 2) : 'Não autenticado'}
                      </pre>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                      {dbStatus.success ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500" />
                      )}
                      Banco de Dados
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {dbStatus.success ? (
                      <Alert>
                        <AlertTitle>Conexão OK</AlertTitle>
                        <AlertDescription>
                          Cliente conectado ao banco de dados.
                        </AlertDescription>
                      </Alert>
                    ) : (
                      <Alert variant="destructive">
                        <AlertTitle>Erro de Conexão</AlertTitle>
                        <AlertDescription>
                          {dbStatus.error || 'Erro desconhecido na conexão com o banco de dados.'}
                        </AlertDescription>
                      </Alert>
                    )}
                  </CardContent>
                </Card>
              </div>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Code className="h-5 w-5 text-primary" />
                    Instruções de Uso do Cliente Direto
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p>Para resolver problemas de conexão, você deve:</p>
                    <ol className="list-decimal ml-5 space-y-1">
                      <li>Verificar se as credenciais estão corretas em <code>supabase.ts</code></li>
                      <li>Garantir que todos os componentes usem o cliente direto:</li>
                    </ol>
                    
                    <pre className="bg-muted p-3 rounded text-xs mt-2">
{`// Substitua isso:
import { supabase } from '@/lib/config/supabase';

// Por isso:
import { supabase } from '@/lib/supabase';`}
                    </pre>
                    
                    <p className="mt-2">Este cliente usa credenciais hardcoded e não depende de variáveis de ambiente.</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="database" className="space-y-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Database className="h-5 w-5 text-primary" />
                    Estrutura do Banco de Dados
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <h4 className="font-medium mb-2">Tabelas Disponíveis:</h4>
                  {dbInfo.tables.length > 0 ? (
                    <ul className="grid grid-cols-2 gap-2">
                      {dbInfo.tables.map(table => (
                        <li key={table} className="bg-muted/50 px-3 py-1 rounded text-sm">
                          {table}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-muted-foreground text-sm">
                      Nenhuma tabela encontrada ou erro ao acessar o banco de dados.
                    </p>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileCode className="h-5 w-5 text-primary" />
                    Comandos SQL de Teste
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-medium">Verificar Perfil</h4>
                      <pre className="bg-muted p-2 rounded text-xs mt-1">
{`-- Criar perfil se não existir
INSERT INTO profiles (id, display_name)
VALUES ('{seu_user_id}', 'Cmdte. Rodrigo')
ON CONFLICT (id) DO NOTHING;

-- Verificar perfil
SELECT * FROM profiles LIMIT 1;`}
                      </pre>
                    </div>
                    
                    <div>
                      <h4 className="font-medium">Criar Colunas se Necessário</h4>
                      <pre className="bg-muted p-2 rounded text-xs mt-1">
{`-- Adicionar colunas necessárias
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS total_rating INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS career_level INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS career_class TEXT DEFAULT 'D';`}
                      </pre>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
           
            <TabsContent value="airports" className="space-y-4">
              <UpdateFlightsAirports />
            </TabsContent>
           
            <TabsContent value="environment">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Variáveis de Ambiente</CardTitle>
                </CardHeader>
                <CardContent>
                  {Object.keys(envVars).length > 0 ? (
                    <div className="space-y-2">
                      {Object.entries(envVars).map(([key, value]) => (
                        <div key={key} className="flex justify-between bg-muted/50 p-2 rounded">
                          <code className="text-sm font-mono">{key}</code>
                          <code className="text-sm font-mono text-muted-foreground">{value}</code>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <Alert variant="destructive">
                      <AlertTitle>Nenhuma variável de ambiente encontrada</AlertTitle>
                      <AlertDescription>
                        Não foram encontradas variáveis VITE_ no ambiente.
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  <div className="mt-4">
                    <h4 className="font-medium">Arquivo .env.local (exemplo)</h4>
                    <pre className="bg-muted p-2 rounded text-xs mt-1">
{`# Supabase
VITE_SUPABASE_URL=https://zgukopxlnolrdbgamwrw.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpndWtvcHhsbm9scmRiZ2Ftd3J3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYzNzk0MDAsImV4cCI6MjA3MTk1NTQwMH0.ijvaxFSjn2TrNFqf-2mJBJ5wU9wX0HOUuz7EomT65rE`}
                    </pre>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
        
        <CardFooter className="flex justify-between">
          <p className="text-sm text-muted-foreground">
            Cliente Direto: {dbStatus.success ? 'Funcionando' : 'Com Problemas'}
          </p>
          <Button onClick={runTests} disabled={isLoading}>
            {isLoading ? 'Testando...' : 'Executar Todos os Testes'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default SuperDiagnostic;