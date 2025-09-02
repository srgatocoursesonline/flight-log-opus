// ============================================
// EMAIL CONFIRMATION PAGE
// ============================================

import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, Loader2, Plane } from 'lucide-react';
import { toast } from 'sonner';

export const EmailConfirmationPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const confirmEmail = async () => {
      try {
        const tokenHash = searchParams.get('token_hash');
        const type = searchParams.get('type');

        if (!tokenHash || type !== 'email') {
          setError('Link de confirmação inválido ou expirado.');
          setLoading(false);
          return;
        }

        // Verificar e confirmar o email usando o token
        const { data, error: confirmError } = await supabase.auth.verifyOtp({
          token_hash: tokenHash,
          type: 'email'
        });

        if (confirmError) {
          console.error('Email confirmation error:', confirmError);
          let errorMessage = 'Erro ao confirmar email.';
          
          if (confirmError.message.includes('expired')) {
            errorMessage = 'Link de confirmação expirado. Solicite um novo email de confirmação.';
          } else if (confirmError.message.includes('invalid')) {
            errorMessage = 'Link de confirmação inválido.';
          } else if (confirmError.message.includes('already confirmed')) {
            errorMessage = 'Este email já foi confirmado anteriormente.';
          }
          
          setError(errorMessage);
        } else {
          setSuccess(true);
          toast.success('Email confirmado com sucesso! Você será redirecionado para o dashboard.');
          
          // Redirecionar para o dashboard após 3 segundos
          setTimeout(() => {
            navigate('/dashboard');
          }, 3000);
        }
      } catch (err) {
        console.error('Unexpected error during email confirmation:', err);
        setError('Erro inesperado ao confirmar email. Tente novamente.');
      } finally {
        setLoading(false);
      }
    };

    confirmEmail();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-950 via-slate-900 to-indigo-950 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Plane className="h-12 w-12 text-blue-500" />
          </div>
          <CardTitle className="text-2xl font-bold">
            Flight Log Opus
          </CardTitle>
          <CardDescription>
            Confirmação de Email
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {loading && (
            <div className="text-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-500" />
              <p className="text-sm text-muted-foreground">
                Confirmando seu email...
              </p>
            </div>
          )}

          {success && (
            <div className="text-center space-y-4">
              <CheckCircle className="h-12 w-12 mx-auto text-green-500" />
              <div>
                <h3 className="text-lg font-semibold text-green-700 dark:text-green-400">
                  Email Confirmado!
                </h3>
                <p className="text-sm text-muted-foreground mt-2">
                  Sua conta foi ativada com sucesso. Você será redirecionado para o dashboard em alguns segundos.
                </p>
              </div>
              <Button 
                onClick={() => navigate('/dashboard')}
                className="w-full"
              >
                Ir para o Dashboard
              </Button>
            </div>
          )}

          {error && (
            <div className="space-y-4">
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertDescription>
                  {error}
                </AlertDescription>
              </Alert>
              
              <div className="space-y-2">
                <Button 
                  onClick={() => navigate('/login')}
                  className="w-full"
                >
                  Ir para Login
                </Button>
                <Button 
                  onClick={() => navigate('/signup')}
                  variant="outline"
                  className="w-full"
                >
                  Criar Nova Conta
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EmailConfirmationPage;