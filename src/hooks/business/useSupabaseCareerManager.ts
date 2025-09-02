import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface CareerData {
  totalRating: number;
  level: number;
  careerClass: 'S' | 'A' | 'B' | 'C' | 'D';
  lastUpdated: string;
}

export const useSupabaseCareerManager = () => {
  const { user } = useAuth();
  const [careerData, setCareerData] = useState<CareerData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [columnsCreated, setColumnsCreated] = useState(false);

  // Usar método simples: manipular diretamente como texto
  const updateCareerDataSimple = async (updates: Partial<CareerData>) => {
    if (!user) {
      toast.error('Usuário não autenticado');
      throw new Error('Usuário não autenticado');
    }

    try {
  
      
      // Garantir que o banco de dados está inicializado
      await initializeDatabase();
      
      // Criar objeto JSON com os dados
      const data = {
        id: user.id,
        totalRating: updates.totalRating || 0,
        level: updates.level || 1,
        careerClass: updates.careerClass || 'D',
      };
      
      // 1. ABORDAGEM 1: Tentar RPC

      const { data: result, error: rpcError } = await supabase.rpc(
        'update_career_data', 
        { user_id: user.id, data_json: JSON.stringify(data) }
      );
      
      if (rpcError) {
        console.error('Erro ao atualizar via RPC:', rpcError);
        throw new Error(`Erro RPC: ${rpcError.message}`);
      } else {

      }
      
      // 2. ABORDAGEM 2: Atualização direta na tabela

      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          total_rating: data.totalRating,
          career_level: data.level,
          career_class: data.careerClass,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);
      
      if (updateError) {
        console.error('Erro ao atualizar diretamente:', updateError);
      } else {

      }
      
      // 3. ABORDAGEM 3: Upsert

      const { error: upsertError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          display_name: 'Cmdte. Rodrigo',
          total_rating: data.totalRating,
          career_level: data.level,
          career_class: data.careerClass,
          updated_at: new Date().toISOString()
        });
      
      if (upsertError) {
        console.error('Erro ao fazer upsert:', upsertError);
      } else {

      }
      
      // 4. ABORDAGEM 4: SQL direto

      const sqlQuery = `
        UPDATE profiles 
        SET 
          total_rating = ${data.totalRating}, 
          career_level = ${data.level}, 
          career_class = '${data.careerClass}',
          updated_at = NOW()
        WHERE id = '${user.id}';
      `;
      
      const { data: sqlResult, error: sqlError } = await supabase.rpc(
        'exec_sql',
        { sql_query: sqlQuery }
      );
      
      if (sqlError) {
        console.error('Erro ao executar SQL direto:', sqlError);
      } else {

      }
      
      // Atualizar estado local
      setCareerData(prev => {
        if (!prev) {
          return {
            totalRating: data.totalRating,
            level: data.level,
            careerClass: data.careerClass as any,
            lastUpdated: new Date().toISOString()
          };
        }
        
        return { 
          ...prev, 
          ...updates, 
          lastUpdated: new Date().toISOString() 
        };
      });

      toast.success('Dados de carreira atualizados com sucesso!');
      
      // Recarregar os dados para garantir que estão atualizados
      await fetchCareerDataSimple();
      
      return { success: true };
    } catch (error: any) {
      console.error('Erro em updateCareerDataSimple:', error);
      toast.error(`Erro ao atualizar dados de carreira: ${error.message || 'Erro desconhecido'}`);
      throw error;
    }
  };

  // Método de inicialização simplificado
  const initializeDatabase = async () => {
    if (!user) return false;
    
    
    
    try {
      // ABORDAGEM 1: RPC para criar colunas
      try {
  
        // Primeiro tentar criar colunas via RPC personalizada
        const { data: rpcResult, error: rpcError } = await supabase.rpc(
          'fetch_career_data',
          { user_id: user.id }
        );
        
        if (!rpcError) {
  
          return true;
        }
        
        console.error('Erro na inicialização via RPC:', rpcError);
      } catch (rpcError) {
        console.error('Erro ao tentar RPC:', rpcError);
      }
      
      // ABORDAGEM 2: SQL direto para criar colunas
      try {
  
        const sqlQuery = `
          BEGIN;
          
          ALTER TABLE profiles ADD COLUMN IF NOT EXISTS total_rating INTEGER DEFAULT 0;
          ALTER TABLE profiles ADD COLUMN IF NOT EXISTS career_level INTEGER DEFAULT 1;
          ALTER TABLE profiles ADD COLUMN IF NOT EXISTS career_class TEXT DEFAULT 'D';
          
          -- Inserir ou atualizar perfil do usuário
          INSERT INTO profiles (id, display_name, email, total_rating, career_level, career_class)
          VALUES (
            '${user.id}', 
            'Cmdte. Rodrigo', 
            '${user.email || ''}',
            0, 
            1, 
            'D'
          )
          ON CONFLICT (id) DO NOTHING;
          
          COMMIT;
        `;
        
        const { data, error } = await supabase.rpc('exec_sql', { sql_query: sqlQuery });
        
        if (error) {
          console.error('Erro ao executar SQL de inicialização:', error);
          throw error;
        }
        

        return true;
      } catch (sqlError) {
        console.error('Erro ao executar SQL de inicialização:', sqlError);
      }
      
      // ABORDAGEM 3: Upsert direto
      try {
  
        // Tentar inserir/atualizar diretamente na tabela profiles
        const { error } = await supabase
          .from('profiles')
          .upsert({
            id: user.id,
            display_name: 'Cmdte. Rodrigo',
            email: user.email,
            total_rating: 0,
            career_level: 1,
            career_class: 'D',
            updated_at: new Date().toISOString()
          });
          
        if (error) {
          console.error('Erro ao fazer upsert do perfil:', error);
          throw error;
        }
        

        return true;
      } catch (upsertError) {
        console.error('Erro no upsert direto:', upsertError);
      }
      
      // Se chegou aqui, falhou em todas as tentativas
      console.warn('Todas as tentativas de inicialização falharam');
      return false;
    } catch (error) {
      console.error('Erro ao inicializar banco de dados:', error);
      return false;
    }
  };

  // Buscar dados de carreira simplificado
  const fetchCareerDataSimple = useCallback(async () => {
    if (!user) {
      setCareerData(null);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

  
      
      // Primeiro, inicializar o banco de dados
      await initializeDatabase();
      
      let profileData = null;
      
      // ABORDAGEM 1: Tentar via RPC personalizada
      try {
  
        const { data: sqlResult, error: rpcError } = await supabase.rpc(
          'fetch_career_data',
          { user_id: user.id }
        );
        
        if (rpcError) {
          console.error('Erro ao buscar via RPC:', rpcError);
          throw rpcError;
        }
        
        if (sqlResult && sqlResult.length > 0) {
  
          profileData = sqlResult[0];
        }
      } catch (rpcError) {
        console.error('Erro na busca via RPC:', rpcError);
      }
      
      // ABORDAGEM 2: Busca direta na tabela profiles
      if (!profileData) {
        try {
  
          const { data, error } = await supabase
            .from('profiles')
            .select('total_rating, career_level, career_class, updated_at')
            .eq('id', user.id)
            .single();
          
          if (error) {
            console.error('Erro ao buscar direto na tabela:', error);
            throw error;
          }
          
          if (data) {
  
            profileData = data;
          }
        } catch (tableError) {
          console.error('Erro na busca direta na tabela:', tableError);
        }
      }
      
      // ABORDAGEM 3: SQL direto
      if (!profileData) {
        try {
  
          const sqlQuery = `
            SELECT total_rating, career_level, career_class, updated_at 
            FROM profiles 
            WHERE id = '${user.id}'
          `;
          
          const { data: result, error } = await supabase.rpc(
            'exec_sql',
            { sql_query: sqlQuery }
          );
          
          if (error) {
            console.error('Erro ao executar SQL direto:', error);
            throw error;
          }
          
          // Nota: result será true/false, mas podemos assumir que a consulta funcionou
          // Vamos buscar novamente
          const { data: directData, error: directError } = await supabase
            .from('profiles')
            .select('total_rating, career_level, career_class, updated_at')
            .eq('id', user.id)
            .single();
          
          if (!directError && directData) {
  
            profileData = directData;
          }
        } catch (sqlError) {
          console.error('Erro na execução de SQL direto:', sqlError);
        }
      }
      
      // Processar dados ou usar valores padrão
      if (profileData) {
        // Dados obtidos com sucesso
        const newData = {
          totalRating: profileData.total_rating || 0,
          level: profileData.career_level || 1,
          careerClass: profileData.career_class || 'D',
          lastUpdated: profileData.updated_at || new Date().toISOString()
        };
        
  
        setCareerData(newData);
      } else {
        // Se todas as tentativas falharam, usar valores padrão
        console.warn('Todas as tentativas de busca falharam, usando valores padrão');
        const defaultData = {
          totalRating: 0,
          level: 1,
          careerClass: 'D' as const,
          lastUpdated: new Date().toISOString()
        };
        

        setCareerData(defaultData);
        
        // Tentar criar perfil padrão
        try {
          const { error } = await supabase
            .from('profiles')
            .upsert({
              id: user.id,
              display_name: 'Cmdte. Rodrigo',
              total_rating: 0,
              career_level: 1,
              career_class: 'D',
              updated_at: new Date().toISOString()
            });
            
          if (error) {
            console.error('Erro ao criar perfil padrão:', error);
          } else {
    
          }
        } catch (createError) {
          console.error('Erro ao tentar criar perfil padrão:', createError);
        }
      }
    } catch (error: any) {
      console.error('Erro em fetchCareerDataSimple:', error);
      setError(`Erro ao conectar com o banco de dados: ${error.message || 'Erro desconhecido'}`);
      
      // Definir valores padrão mesmo em caso de erro
      const defaultData = {
        totalRating: 0,
        level: 1,
        careerClass: 'D' as const,
        lastUpdated: new Date().toISOString()
      };
      
      
      setCareerData(defaultData);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Inicialização
  useEffect(() => {
    fetchCareerDataSimple();
  }, [fetchCareerDataSimple]);

  return {
    careerData,
    isLoading,
    error,
    updateCareerData: updateCareerDataSimple,
    refresh: fetchCareerDataSimple,
  };
};