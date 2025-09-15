// ============================================
// AUTHENTICATION CONTEXT
// ============================================

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User, AuthError } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: AuthError }>;
  signUp: (email: string, password: string, displayName?: string) => Promise<{ error?: AuthError }>;
  signInWithGoogle: () => Promise<{ error?: AuthError }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error?: AuthError }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasShownLoginToast, setHasShownLoginToast] = useState(false);

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Error getting session:', error);
          // Removido toast de erro - pode acontecer normalmente durante navegação
        } else {
          setSession(session);
          setUser(session?.user ?? null);
          // Se já tem sessão inicial, não mostrar toast de login
          if (session?.user) {
            setHasShownLoginToast(true);
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        // Removido toast de erro - pode acontecer normalmente
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {

        
        const previousUser = user;
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);

        // Handle different auth events (só mostrar toasts para ações do usuário)
        switch (event) {
          case 'SIGNED_IN':
            // Só mostrar toast se for um login real (não havia usuário antes E não mostrou toast ainda)
            if (session?.user && !previousUser && !hasShownLoginToast) {
              toast.success('Login realizado com sucesso!');
              setHasShownLoginToast(true);
            }
            break;
          case 'SIGNED_OUT':
            // Resetar flag de toast quando fizer logout
            setHasShownLoginToast(false);
            toast.success('Logout realizado com sucesso!');
            break;
          case 'PASSWORD_RECOVERY':
            toast.info('Email de recuperação enviado!');
            break;
          case 'TOKEN_REFRESHED':
            // Nunca mostrar toast para refresh de token

            break;
          case 'USER_UPDATED':
            // Só mostrar para atualizações reais do perfil (não durante navegação)
            // Este toast será controlado manualmente nos componentes de perfil

            break;
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [hasShownLoginToast]);

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      return { error };
    } catch (error) {
      console.error('Sign in error:', error);
      return { error: error as AuthError };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, displayName?: string) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: displayName || 'Cmdte. Rodrigo',
          },
          emailRedirectTo: `${window.location.origin}/confirm-email`,
        },
      });
      
      if (!error) {
        toast.success('Conta criada! Verifique seu email para confirmação.');
      }
      
      return { error };
    } catch (error) {
      console.error('Sign up error:', error);
      return { error: error as AuthError };
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async (forceSelectAccount = false) => {
    try {
      setLoading(true);
      
      const queryParams: Record<string, string> = {
        access_type: 'offline',
      };

      // Apenas pedir para selecionar conta se forçado
      if (forceSelectAccount) {
        queryParams.prompt = 'select_account';
      }

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams,
        },
      });
      
      if (error) {
        toast.error('Erro ao conectar com Google: ' + error.message);
      }
      
      return { error };
    } catch (error) {
      console.error('Google sign in error:', error);
      return { error: error as AuthError };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      // Limpar cache de autenticação local
      await supabase.auth.signOut({ scope: 'global' });
      // Limpar possíveis cookies corrompidos
      if (typeof window !== 'undefined') {
        document.cookie = 'sb-access-token=; Max-Age=0; path=/';
        document.cookie = 'sb-refresh-token=; Max-Age=0; path=/';
      }
    } catch (error) {
      console.error('Sign out error:', error);
      toast.error('Erro ao fazer logout');
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      return { error };
    } catch (error) {
      console.error('Password reset error:', error);
      return { error: error as AuthError };
    }
  };

  const value: AuthContextType = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
    resetPassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};