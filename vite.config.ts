import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from "vite-plugin-pwa";

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
    // PWA: precache dos assets com hash + SW gerado via Workbox.
    // O manifest continua sendo o public/manifest.json (manifest: false).
    VitePWA({
      registerType: "prompt",
      manifest: false,
      includeAssets: ["favicon.ico", "robots.txt"],
      workbox: {
        globPatterns: ["**/*.{js,css,html,woff,woff2,svg,png}"],
        navigateFallback: "/index.html",
        navigateFallbackDenylist: [/^\/auth\//, /^\/rest\//, /^\/storage\//],
        runtimeCaching: [
          {
            // Fontes: cache-first (imutáveis na prática)
            urlPattern: ({ request }) => request.destination === "font",
            handler: "CacheFirst",
            options: {
              cacheName: "fonts",
              expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
          {
            // Base de aeroportos (estática, grande): cache-first
            urlPattern: /\/airports\.csv$/,
            handler: "CacheFirst",
            options: {
              cacheName: "airports-data",
              expiration: { maxEntries: 1, maxAgeSeconds: 60 * 60 * 24 * 30 },
            },
          },
        ],
      },
    }),
  ].filter(Boolean),

  build: {
    rollupOptions: {
      output: {
        // Separa vendors pesados em chunks próprios (carregados sob demanda
        // pelas rotas lazy)
        manualChunks: {
          charts: ["recharts", "chart.js", "react-chartjs-2"],
          maps: ["leaflet", "react-leaflet"],
        },
      },
    },
  },
  
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