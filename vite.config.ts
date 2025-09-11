import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: true,
    },
  },
  plugins: [
    react(),
    mode === 'development' && componentTagger(),
  ].filter(Boolean),
  
  // Log environment variable info when starting
  define: {
    '__ENV_DEBUG__': JSON.stringify({
      NODE_ENV: process.env.NODE_ENV,
      MODE: mode,
      HAS_VITE_VARS: !!process.env.VITE_SUPABASE_URL,
    }),
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@/features": path.resolve(__dirname, "./src/features"),
      "@/shared": path.resolve(__dirname, "./src/shared"),
      "@/entities": path.resolve(__dirname, "./src/entities"),
      "@/widgets": path.resolve(__dirname, "./src/widgets"),
      "@/processes": path.resolve(__dirname, "./src/processes"),
      "@/app": path.resolve(__dirname, "./src/app"),
    },
  },
  // Garantir que as variáveis de ambiente sejam carregadas corretamente
  envDir: process.cwd(),
}));