import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, XCircle, Home, Mail } from "lucide-react";
import { useToast } from "@/hooks/ui/use-toast";

const EmailConfirmation = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
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
          toast({
            title: "Email confirmado!",
            description: "Seu email foi confirmado com sucesso. Você será redirecionado para o dashboard.",
          });
          
          // Redirecionar para o dashboard após 3 segundos
          setTimeout(() => {
            navigate('/dashboard');
          }, 3000);
        }
      } catch (err) {
        setError('Erro inesperado ao confirmar email. Tente novamente.');
      } finally {
        setLoading(false);
      }
    };

    confirmEmail();
  }, [searchParams, navigate, toast]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-center">
          <Mail className="h-12 w-12 text-primary mx-auto mb-4" />
          <h2 className="text-xl font-semibold">Confirmando seu email...</h2>
          <p className="text-muted-foreground">Aguarde um momento</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            {success ? (
              <CheckCircle className="h-16 w-16 text-success mx-auto" />
            ) : (
              <XCircle className="h-16 w-16 text-destructive mx-auto" />
            )}
          </div>
          <CardTitle className="text-2xl">
            {success ? "Email Confirmado!" : "Erro na Confirmação"}
          </CardTitle>
          <CardDescription>
            {success 
              ? "Seu email foi confirmado com sucesso." 
              : "Não foi possível confirmar seu email."}
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {success ? (
            <Alert className="border-success bg-success/10">
              <CheckCircle className="h-4 w-4 text-success" />
              <AlertTitle>Sucesso!</AlertTitle>
              <AlertDescription>
                Você será redirecionado para o dashboard em breve.
              </AlertDescription>
            </Alert>
          ) : (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertTitle>Erro</AlertTitle>
              <AlertDescription>
                {error || "Ocorreu um erro ao confirmar seu email."}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
        
        <CardFooter>
          <Button 
            className="w-full" 
            onClick={() => navigate('/')}
            variant={success ? "default" : "outline"}
          >
            <Home className="h-4 w-4 mr-2" />
            Voltar para Home
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default EmailConfirmation;