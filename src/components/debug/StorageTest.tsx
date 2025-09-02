import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { Upload, CheckCircle, XCircle, AlertCircle } from "lucide-react";

interface StorageTestResult {
  test: string;
  status: 'success' | 'error' | 'warning';
  message: string;
  details?: any;
}

export const StorageTest = () => {
  const { user } = useAuth();
  const [results, setResults] = useState<StorageTestResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const addResult = (result: StorageTestResult) => {
    setResults(prev => [...prev, result]);
  };

  const clearResults = () => {
    setResults([]);
  };

  const testStorageConfiguration = async () => {
    setIsLoading(true);
    clearResults();

    try {
      // Teste 1: Verificar se o bucket existe
      addResult({ test: "Verificando bucket 'profile-images'", status: 'warning', message: "Testando..." });
      
      const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
      
      if (bucketsError) {
        addResult({ 
          test: "Listar buckets", 
          status: 'error', 
          message: `Erro ao listar buckets: ${bucketsError.message}`,
          details: bucketsError
        });
        return;
      }

      const profileImagesBucket = buckets?.find(bucket => bucket.id === 'profile-images');
      
      if (!profileImagesBucket) {
        addResult({ 
          test: "Bucket 'profile-images'", 
          status: 'error', 
          message: "Bucket 'profile-images' não encontrado. Execute o script SQL para criar o bucket.",
          details: { availableBuckets: buckets?.map(b => b.id) }
        });
        return;
      }

      addResult({ 
        test: "Bucket 'profile-images'", 
        status: 'success', 
        message: "Bucket encontrado e configurado",
        details: profileImagesBucket
      });

      // Teste 2: Verificar permissões de upload
      if (!user) {
        addResult({ 
          test: "Autenticação", 
          status: 'error', 
          message: "Usuário não autenticado. Faça login para testar upload."
        });
        return;
      }

      addResult({ 
        test: "Autenticação", 
        status: 'success', 
        message: `Usuário autenticado: ${user.email}`,
        details: { userId: user.id }
      });

      // Teste 3: Testar upload de arquivo pequeno
      addResult({ test: "Upload de teste", status: 'warning', message: "Criando arquivo de teste..." });
      
      const testFile = new Blob(['test'], { type: 'text/plain' });
      const fileName = `test-${user.id}-${Date.now()}.txt`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('profile-images')
        .upload(filePath, testFile);

      if (uploadError) {
        addResult({ 
          test: "Upload de teste", 
          status: 'error', 
          message: `Erro no upload: ${uploadError.message}`,
          details: uploadError
        });
        return;
      }

      addResult({ 
        test: "Upload de teste", 
        status: 'success', 
        message: "Upload realizado com sucesso"
      });

      // Teste 4: Verificar URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('profile-images')
        .getPublicUrl(filePath);

      addResult({ 
        test: "URL pública", 
        status: 'success', 
        message: "URL pública gerada",
        details: { publicUrl }
      });

      // Teste 5: Limpar arquivo de teste
      const { error: deleteError } = await supabase.storage
        .from('profile-images')
        .remove([filePath]);

      if (deleteError) {
        addResult({ 
          test: "Limpeza", 
          status: 'warning', 
          message: `Aviso: Não foi possível remover arquivo de teste: ${deleteError.message}`,
          details: deleteError
        });
      } else {
        addResult({ 
          test: "Limpeza", 
          status: 'success', 
          message: "Arquivo de teste removido"
        });
      }

    } catch (error) {
      addResult({ 
        test: "Erro geral", 
        status: 'error', 
        message: `Erro inesperado: ${error}`,
        details: error
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: StorageTestResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: StorageTestResult['status']) => {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'error':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Teste de Storage - Upload de Fotos
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button 
            onClick={testStorageConfiguration} 
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            <Upload className="h-4 w-4" />
            {isLoading ? 'Testando...' : 'Testar Storage'}
          </Button>
          
          {results.length > 0 && (
            <Button 
              variant="outline" 
              onClick={clearResults}
              disabled={isLoading}
            >
              Limpar Resultados
            </Button>
          )}
        </div>

        {results.length > 0 && (
          <div className="space-y-2">
            <h3 className="font-semibold">Resultados dos Testes:</h3>
            {results.map((result, index) => (
              <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                {getStatusIcon(result.status)}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium">{result.test}</span>
                    <Badge className={getStatusColor(result.status)}>
                      {result.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{result.message}</p>
                  {result.details && (
                    <details className="mt-2">
                      <summary className="text-xs cursor-pointer text-muted-foreground hover:text-foreground">
                        Ver detalhes
                      </summary>
                      <pre className="text-xs bg-muted p-2 rounded mt-1 overflow-auto">
                        {JSON.stringify(result.details, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {!user && (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Aviso:</strong> Você precisa estar logado para testar o upload de arquivos.
            </p>
          </div>
        )}

        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-semibold text-blue-900 mb-2">Como resolver problemas:</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Se o bucket não existir, execute o script SQL em <code>database/create_storage_bucket_safe.sql</code></li>
            <li>• Verifique se as políticas de storage estão configuradas corretamente</li>
            <li>• Confirme se o usuário está autenticado</li>
            <li>• Verifique se o arquivo não excede 5MB</li>
            <li>• Confirme se o tipo de arquivo é permitido (JPEG, PNG, WebP, GIF)</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};