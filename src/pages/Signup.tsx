// ============================================
// SIGNUP COMPONENT
// ============================================

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Plane, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

export const SignupPage: React.FC = () => {
  const { signUp, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validations
    if (!email || !password || !confirmPassword) {
      setError('Por favor, preencha todos os campos obrigatórios');
      return;
    }

    if (password !== confirmPassword) {
      setError('As senhas não coincidem');
      return;
    }

    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    const { error } = await signUp(email, password, displayName || 'Cmdte. Rodrigo');
    
    if (error) {
      // Traduzir erros comuns
      let errorMessage = error.message;
      if (error.message.includes('User already registered')) {
        errorMessage = 'Este email já está cadastrado. Tente fazer login.';
      } else if (error.message.includes('Invalid email')) {
        errorMessage = 'Email inválido.';
      } else if (error.message.includes('Password')) {
        errorMessage = 'Problema com a senha. Tente uma senha mais forte.';
      } else if (error.message.includes('Database error')) {
        errorMessage = 'Erro no banco de dados. Tente novamente em alguns minutos.';
      }
      
      setError(errorMessage);
      toast.error('Erro no cadastro: ' + errorMessage);
    } else {
      setSuccess(true);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-950 via-slate-900 to-indigo-950 p-4">
        <Card className="glass-panel max-w-md w-full">
          <CardHeader className="text-center">
            <CheckCircle className="h-16 w-16 text-green-400 mx-auto mb-4" />
            <CardTitle className="text-2xl text-foreground">Conta Criada!</CardTitle>
            <CardDescription>
              Enviamos um email de confirmação para <strong>{email}</strong>
            </CardDescription>
          </CardHeader>
          
          <CardContent className="text-center space-y-4">
            <p className="text-sm text-muted-foreground">
              Clique no link de confirmação no seu email para ativar sua conta e fazer login.
            </p>
          </CardContent>

          <CardFooter>
            <Link to="/login" className="w-full">
              <Button className="w-full">
                Voltar ao Login
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-950 via-slate-900 to-indigo-950 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Plane className="h-8 w-8 text-blue-400" />
            <h1 className="text-3xl font-bold text-white">Flight Log Opus</h1>
          </div>
          <p className="text-slate-400">Crie sua conta e comece a voar</p>
        </div>

        <Card className="glass-panel">
          <CardHeader>
            <CardTitle className="text-2xl text-center text-foreground">Criar Conta</CardTitle>
            <CardDescription className="text-center">
              Junte-se à comunidade de pilotos virtuais
            </CardDescription>
          </CardHeader>
          
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="displayName">Nome de Exibição (opcional)</Label>
                <Input
                  id="displayName"
                  type="text"
                  placeholder="Cmdte. Rodrigo"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Senha *</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Mínimo 6 caracteres"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar Senha *</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Digite a senha novamente"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>
            </CardContent>

            <CardFooter className="flex flex-col space-y-4">
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Criando conta...
                  </>
                ) : (
                  'Criar Conta'
                )}
              </Button>

              <div className="text-center">
                <div className="text-sm text-muted-foreground">
                  Já tem uma conta?{' '}
                  <Link 
                    to="/login" 
                    className="text-blue-400 hover:text-blue-300 hover:underline"
                  >
                    Fazer login
                  </Link>
                </div>
              </div>
            </CardFooter>
          </form>
        </Card>

        <div className="mt-8 text-center">
          <p className="text-sm text-slate-400">
            Ao criar uma conta, você concorda com nossos termos de serviço
          </p>
        </div>
      </div>
    </div>
  );
};