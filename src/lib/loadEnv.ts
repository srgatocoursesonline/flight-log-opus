// ============================================
// CARREGADOR DE VARIÁVEIS DE AMBIENTE PARA VITE
// ============================================

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

/**
 * Carrega variáveis de ambiente diretamente de um arquivo .env para debug
 * Usado apenas para verificar problemas de carregamento
 */
export const loadEnvFile = () => {
  try {
    // Obter o diretório do projeto (raiz)
    const __dirname = path.dirname(fileURLToPath(import.meta.url));
    const rootDir = path.resolve(__dirname, '../../');
    const envPath = path.join(rootDir, '.env.local');
    
    console.log('Verificando arquivo em:', envPath);
    
    if (fs.existsSync(envPath)) {
      console.log('✅ Arquivo .env.local encontrado!');
      const envContent = fs.readFileSync(envPath, 'utf8');
      const envLines = envContent.split('\n');
      
      console.log('Conteúdo do arquivo:');
      
      // Processar linhas sem mostrar valores sensíveis
      envLines.forEach(line => {
        const trimmedLine = line.trim();
        if (trimmedLine && !trimmedLine.startsWith('#')) {
          const [key] = trimmedLine.split('=');
          if (key) {
            const trimmedKey = key.trim();
            console.log(` - ${trimmedKey}: [VALOR PRESENTE]`);
          }
        }
      });
      
      return true;
    } else {
      console.error('❌ Arquivo .env.local não encontrado!');
      return false;
    }
  } catch (error) {
    console.error('Erro ao tentar ler .env.local:', error);
    return false;
  }
};

/**
 * Verifica se as variáveis de ambiente do Vite estão disponíveis
 */
export const checkViteEnv = () => {
  console.log('=== VERIFICANDO VARIÁVEIS DE AMBIENTE DO VITE ===');
  
  // No ambiente de desenvolvimento do Vite, as variáveis estarão disponíveis como import.meta.env.VITE_*
  try {
    const viteSupabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const viteSupabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    console.log('VITE_SUPABASE_URL:', viteSupabaseUrl ? '[CONFIGURADO]' : '[NÃO CONFIGURADO]');
    console.log('VITE_SUPABASE_ANON_KEY:', viteSupabaseKey ? '[CONFIGURADO]' : '[NÃO CONFIGURADO]');
    
    return !!viteSupabaseUrl && !!viteSupabaseKey;
  } catch (error) {
    console.error('Erro ao verificar variáveis do Vite:', error);
    return false;
  }
};