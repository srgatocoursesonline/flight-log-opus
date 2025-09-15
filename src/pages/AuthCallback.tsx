// ============================================
// AUTH CALLBACK COMPONENT
// ============================================

import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, Plane } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export const AuthCallback: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Capturar a sessão do URL hash
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Erro no callback de autenticação:', error);
          navigate('/login');
          return;
        }

        if (data.session) {
          // Usuário autenticado com sucesso
          navigate('/dashboard');
        } else {
          // Nenhuma sessão encontrada
          navigate('/login');
        }
      } catch (error) {
        console.error('Erro ao processar callback:', error);
        navigate('/login');
      }
    };

    handleAuthCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-950 via-slate-900 to-indigo-950 p-4">
      <div className="text-center">
        <div className="flex items-center justify-center gap-3 mb-8">
          <Plane className="h-12 w-12 text-blue-400 animate-pulse" />
          <h1 className="text-3xl font-bold text-white">Flight Log Opus</h1>
        </div>
        
        <div className="glass-panel p-8 rounded-lg max-w-sm mx-auto">
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
            <h2 className="text-xl font-semibold text-foreground">Processando login...</h2>
            <p className="text-sm text-muted-foreground">
              Aguarde enquanto conectamos sua conta.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};