import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { registerServiceWorker, installPWA } from './lib/pwa'

// Register service worker for PWA functionality
if (import.meta.env.PROD) {
  registerServiceWorker();
}

// Setup PWA install prompt
installPWA();

createRoot(document.getElementById("root")!).render(<App />);
