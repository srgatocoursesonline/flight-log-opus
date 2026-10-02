// PWA utilities: registro do service worker (Workbox), atualização com
// toast e captura do prompt de instalação.
import { registerSW } from 'virtual:pwa-register';
import { toast } from 'sonner';

/**
 * Registra o service worker gerado pelo vite-plugin-pwa.
 * Nova versão disponível -> toast com ação "Recarregar" (fim do confirm()).
 */
export const registerServiceWorker = (onNeedRefresh?: () => void) => {
  if (!('serviceWorker' in navigator)) return;

  registerSW({
    immediate: true,
    onNeedRefresh() {
      toast('Nova versão disponível', {
        description: 'Recarregue para aplicar a atualização.',
        action: {
          label: 'Recarregar',
          onClick: () => window.location.reload(),
        },
        duration: 15000,
      });
      onNeedRefresh?.();
    },
    onOfflineReady() {
      toast('Pronto para uso offline');
    },
  });
};

// ============================================
// INSTALL PROMPT (beforeinstallprompt)
// ============================================

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

let deferredPrompt: BeforeInstallPromptEvent | null = null;

export const initPWAInstall = () => {
  window.addEventListener('beforeinstallprompt', e => {
    e.preventDefault();
    deferredPrompt = e as BeforeInstallPromptEvent;
    window.dispatchEvent(new Event('pwa-install-available'));
  });

  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    window.dispatchEvent(new Event('pwa-installed'));
  });
};

export const isPWAInstallAvailable = () => deferredPrompt !== null;

export const isStandalone = () =>
  typeof window !== 'undefined' &&
  (window.matchMedia('(display-mode: standalone)').matches ||
    // iOS Safari
    (window.navigator as unknown as { standalone?: boolean }).standalone === true);

export const isIOS = () =>
  typeof navigator !== 'undefined' &&
  (/iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1));

/** Dispara o prompt nativo de instalação. */
export const promptPWAInstall = async (): Promise<'accepted' | 'dismissed' | 'unavailable'> => {
  if (!deferredPrompt) return 'unavailable';
  await deferredPrompt.prompt();
  const { outcome } = await deferredPrompt.userChoice;
  deferredPrompt = null;
  return outcome;
};

/**
 * Compat: mantido para o main.tsx — antes era um no-op.
 */
export const installPWA = () => {
  initPWAInstall();
};
