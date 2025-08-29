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
        console.log('Auth event:', event, 'Previous user:', !!user, 'New session:', !!session);
        
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
            console.log('Token refreshed successfully');
            break;
          case 'USER_UPDATED':
            // Só mostrar para atualizações reais do perfil (não durante navegação)
            // Este toast será controlado manualmente nos componentes de perfil
            console.log('User data updated');
            break;
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

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

  const signOut = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Sign out error:', error);
        toast.error('Erro ao fazer logout');
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
    signOut,
    resetPassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};