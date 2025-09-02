import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, AlertCircle, Upload } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

interface TestResult {
  test: string;
  status: 'success' | 'error' | 'warning';
  message: string;
  details?: any;
}

export const StoragePolicyTest = () => {
  const { user } = useAuth();
  const [results, setResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const addResult = (result: TestResult) => {
    setResults(prev => [...prev, result]);
  };

  const clearResults = () => {
    setResults([]);
  };

  const runTests = useCallback(async () => {
    if (!user) {
      addResult({
        test: 'Autenticação',
        status: 'error',
        message: 'Usuário não autenticado'
      });
      return;
    }

    setIsRunning(true);
    clearResults();

    try {
      // Teste 1: Verificar se o bucket existe
      addResult({
        test: 'Verificando bucket profile-images',
        status: 'success',
        message: 'Iniciando verificação...'
      });

      // Teste 2: Tentar listar objetos no bucket
      try {
        const { data: objects, error: listError } = await supabase.storage
          .from('profile-images')
          .list('avatars', {
            limit: 1
          });

        if (listError) {
          addResult({
            test: 'Listar objetos no bucket',
            status: 'error',
            message: `Erro ao listar: ${listError.message}`,
            details: listError
          });
        } else {
          addResult({
            test: 'Listar objetos no bucket',
            status: 'success',
            message: `Bucket acessível. Encontrados ${objects?.length || 0} objetos na pasta avatars`
          });
        }
      } catch (error: any) {
        addResult({
          test: 'Listar objetos no bucket',
          status: 'error',
          message: `Erro inesperado: ${error.message}`,
          details: error
        });
      }

      // Teste 3: Criar um arquivo de teste para upload
      const testFileName = `${user.id}-test-${Date.now()}.txt`;
      const testFile = new File(['Test content'], testFileName, { type: 'text/plain' });
      const testPath = `avatars/${testFileName}`;

      try {
        const { error: uploadError } = await supabase.storage
          .from('profile-images')
          .upload(testPath, testFile);

        if (uploadError) {
          addResult({
            test: 'Upload de teste',
            status: 'error',
            message: `Erro no upload: ${uploadError.message}`,
            details: {
              error: uploadError,
              fileName: testFileName,
              path: testPath,
              userId: user.id
            }
          });
        } else {
          addResult({
            test: 'Upload de teste',
            status: 'success',
            message: 'Upload realizado com sucesso!'
          });

          // Teste 4: Obter URL pública
          try {
            const { data: { publicUrl } } = supabase.storage
              .from('profile-images')
              .getPublicUrl(testPath);

            addResult({
              test: 'URL pública',
              status: 'success',
              message: `URL gerada: ${publicUrl}`
            });
          } catch (error: any) {
            addResult({
              test: 'URL pública',
              status: 'error',
              message: `Erro ao gerar URL: ${error.message}`
            });
          }

          // Teste 5: Limpar arquivo de teste
          try {
            const { error: deleteError } = await supabase.storage
              .from('profile-images')
              .remove([testPath]);

            if (deleteError) {
              addResult({
                test: 'Limpeza do arquivo de teste',
                status: 'warning',
                message: `Erro ao deletar arquivo de teste: ${deleteError.message}`
              });
            } else {
              addResult({
                test: 'Limpeza do arquivo de teste',
                status: 'success',
                message: 'Arquivo de teste removido com sucesso'
              });
            }
          } catch (error: any) {
            addResult({
              test: 'Limpeza do arquivo de teste',
              status: 'warning',
              message: `Erro inesperado ao deletar: ${error.message}`
            });
          }
        }
      } catch (error: any) {
        addResult({
          test: 'Upload de teste',
          status: 'error',
          message: `Erro inesperado no upload: ${error.message}`,
          details: error
        });
      }

      // Teste 6: Verificar informações do usuário
      addResult({
        test: 'Informações do usuário',
        status: 'success',
        message: `ID: ${user.id}, Email: ${user.email}`,
        details: {
          userId: user.id,
          email: user.email,
          role: user.role,
          metadata: user.user_metadata
        }
      });

    } catch (error: any) {
      addResult({
        test: 'Erro geral',
        status: 'error',
        message: `Erro inesperado: ${error.message}`,
        details: error
      });
    } finally {
      setIsRunning(false);
    }
  }, [user, addResult, clearResults]);

  const getIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Teste de Políticas RLS do Storage
        </CardTitle>
        <CardDescription>
          Diagnóstico das políticas de segurança do bucket profile-images
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button 
            onClick={runTests} 
            disabled={isRunning || !user}
            className="flex items-center gap-2"
          >
            {isRunning ? 'Executando...' : 'Executar Testes'}
          </Button>
          <Button 
            variant="outline" 
            onClick={clearResults}
            disabled={isRunning}
          >
            Limpar Resultados
          </Button>
        </div>

        {!user && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Você precisa estar logado para executar os testes.
            </AlertDescription>
          </Alert>
        )}

        {results.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Resultados dos Testes:</h3>
            {results.map((result, index) => (
              <Alert key={index} className={`
                ${result.status === 'success' ? 'border-green-200 bg-green-50' : ''}
                ${result.status === 'error' ? 'border-red-200 bg-red-50' : ''}
                ${result.status === 'warning' ? 'border-yellow-200 bg-yellow-50' : ''}
              `}>
                <div className="flex items-start gap-2">
                  {getIcon(result.status)}
                  <div className="flex-1">
                    <div className="font-medium">{result.test}</div>
                    <div className="text-sm text-muted-foreground">{result.message}</div>
                    {result.details && (
                      <details className="mt-2">
                        <summary className="text-xs cursor-pointer text-muted-foreground hover:text-foreground">
                          Ver detalhes
                        </summary>
                        <pre className="mt-1 text-xs bg-muted p-2 rounded overflow-auto max-h-32">
                          {JSON.stringify(result.details, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                </div>
              </Alert>
            ))}
          </div>
        )}

        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Se os testes falharem:</strong>
            <br />1. Execute o script SQL em <code>database/create_storage_bucket_safe.sql</code> no Supabase Dashboard
            <br />2. Verifique se o usuário está autenticado corretamente
            <br />3. Confirme se as políticas RLS estão ativas no bucket profile-images
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};

export default StoragePolicyTest;