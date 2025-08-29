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
      console.log('Atualizando dados de carreira (método simples):', updates);
      
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
      console.log('Tentativa 1: Usando função RPC para atualizar');
      const { data: result, error: rpcError } = await supabase.rpc(
        'update_career_data', 
        { user_id: user.id, data_json: JSON.stringify(data) }
      );
      
      if (rpcError) {
        console.error('Erro ao atualizar via RPC:', rpcError);
        throw new Error(`Erro RPC: ${rpcError.message}`);
      } else {
        console.log('Atualização via RPC bem-sucedida:', result);
      }
      
      // 2. ABORDAGEM 2: Atualização direta na tabela
      console.log('Tentativa 2: Atualização direta na tabela');
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
        console.log('Atualização direta bem-sucedida');
      }
      
      // 3. ABORDAGEM 3: Upsert
      console.log('Tentativa 3: Usando upsert para garantir');
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
        console.log('Upsert bem-sucedido');
      }
      
      // 4. ABORDAGEM 4: SQL direto
      console.log('Tentativa 4: SQL direto via RPC');
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
        console.log('SQL direto executado com sucesso');
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
    
    console.log('Inicializando banco de dados para usuário:', user.id);
    
    try {
      // ABORDAGEM 1: RPC para criar colunas
      try {
        console.log('Tentativa 1: Usando RPC para criar colunas');
        // Primeiro tentar criar colunas via RPC personalizada
        const { data: rpcResult, error: rpcError } = await supabase.rpc(
          'fetch_career_data',
          { user_id: user.id }
        );
        
        if (!rpcError) {
          console.log('Inicialização via RPC bem-sucedida');
          return true;
        }
        
        console.error('Erro na inicialização via RPC:', rpcError);
      } catch (rpcError) {
        console.error('Erro ao tentar RPC:', rpcError);
      }
      
      // ABORDAGEM 2: SQL direto para criar colunas
      try {
        console.log('Tentativa 2: SQL direto para criar colunas');
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
        
        console.log('Inicialização via SQL direto bem-sucedida');
        return true;
      } catch (sqlError) {
        console.error('Erro ao executar SQL de inicialização:', sqlError);
      }
      
      // ABORDAGEM 3: Upsert direto
      try {
        console.log('Tentativa 3: Upsert direto');
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
        
        console.log('Upsert do perfil bem-sucedido');
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

      console.log('Buscando dados de carreira para usuário:', user.id);
      
      // Primeiro, inicializar o banco de dados
      await initializeDatabase();
      
      let profileData = null;
      
      // ABORDAGEM 1: Tentar via RPC personalizada
      try {
        console.log('Tentativa 1: Buscando via RPC');
        const { data: sqlResult, error: rpcError } = await supabase.rpc(
          'fetch_career_data',
          { user_id: user.id }
        );
        
        if (rpcError) {
          console.error('Erro ao buscar via RPC:', rpcError);
          throw rpcError;
        }
        
        if (sqlResult && sqlResult.length > 0) {
          console.log('Dados recebidos via RPC:', sqlResult[0]);
          profileData = sqlResult[0];
        }
      } catch (rpcError) {
        console.error('Erro na busca via RPC:', rpcError);
      }
      
      // ABORDAGEM 2: Busca direta na tabela profiles
      if (!profileData) {
        try {
          console.log('Tentativa 2: Buscando direto na tabela profiles');
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
            console.log('Dados recebidos via tabela:', data);
            profileData = data;
          }
        } catch (tableError) {
          console.error('Erro na busca direta na tabela:', tableError);
        }
      }
      
      // ABORDAGEM 3: SQL direto
      if (!profileData) {
        try {
          console.log('Tentativa 3: SQL direto');
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
            console.log('Dados obtidos após SQL direto:', directData);
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
        
        console.log('Setting career data to:', newData);
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
        
        console.log('Setting default career data:', defaultData);
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
            console.log('Perfil padrão criado com sucesso');
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
      
      console.log('Setting default career data due to error:', defaultData);
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