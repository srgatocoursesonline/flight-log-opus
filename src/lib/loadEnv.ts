import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

/**
 * Carrega e verifica o arquivo .env.local
 * @returns true se o arquivo foi encontrado e carregado, false caso contrário
 */
export const loadEnvFile = () => {
  try {
    // Obter o diretório do projeto (raiz)
    const __dirname = path.dirname(fileURLToPath(import.meta.url));
    const rootDir = path.resolve(__dirname, '../../');
    const envPath = path.join(rootDir, '.env.local');
    
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf8');
      const envLines = envContent.split('\n');
      
      // Processar linhas sem mostrar valores sensíveis
      envLines.forEach(line => {
        const trimmedLine = line.trim();
        if (trimmedLine && !trimmedLine.startsWith('#')) {
          const [key] = trimmedLine.split('=');
          if (key) {
            const trimmedKey = key.trim();
          }
        }
      });
      
      return true;
    } else {
      return false;
    }
  } catch (error) {
    return false;
  }
};

/**
 * Verifica se as variáveis de ambiente do Vite estão disponíveis
 */
export const checkViteEnv = () => {
  // No ambiente de desenvolvimento do Vite, as variáveis estarão disponíveis como import.meta.env.VITE_*
  try {
    const viteSupabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const viteSupabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    return !!viteSupabaseUrl && !!viteSupabaseKey;
  } catch (error) {
    return false;
  }
};