import { createRoot } from 'react-dom/client'
import App from './App.tsx'
// Fontes self-hosted (PWA/offline): Inter variável + JetBrains Mono
import '@fontsource-variable/inter'
import '@fontsource/jetbrains-mono/400.css'
import '@fontsource/jetbrains-mono/500.css'
import '@fontsource/jetbrains-mono/600.css'
import '@fontsource/jetbrains-mono/700.css'
import './index.css'
import './lib/i18n'
import { registerServiceWorker, installPWA } from './lib/pwa'
// Aplicar patch para corrigir bug do react-window
import './utils/reactWindowPatch'

// Register service worker for PWA functionality
if (import.meta.env.PROD) {
  registerServiceWorker();
}

// Setup PWA install prompt
installPWA();

createRoot(document.getElementById("root")!).render(<App />);
