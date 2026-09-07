/**
 * PWA Registration & Install Prompt Management
 */

let deferredInstallPrompt: any = null;

export interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

/**
 * Register Service Worker for offline capability & Push Notifications
 */
export function registerServiceWorker() {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return;
  }

  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });
      console.log('Final Stop PWA: Service Worker registered with scope:', registration.scope);
    } catch (error) {
      console.warn('Final Stop PWA: Service Worker registration failed:', error);
    }
  });

  // Capture install prompt event for custom install button
  window.addEventListener('beforeinstallprompt', (e: Event) => {
    e.preventDefault();
    deferredInstallPrompt = e as BeforeInstallPromptEvent;
    window.dispatchEvent(new CustomEvent('pwa-installable', { detail: true }));
  });

  window.addEventListener('appinstalled', () => {
    deferredInstallPrompt = null;
    window.dispatchEvent(new CustomEvent('pwa-installed'));
    console.log('Final Stop PWA: App installed successfully');
  });
}

/**
 * Prompt the user to install the PWA
 */
export async function promptInstallPwa(): Promise<'accepted' | 'dismissed' | 'unsupported'> {
  if (!deferredInstallPrompt) {
    return 'unsupported';
  }

  try {
    await deferredInstallPrompt.prompt();
    const choice = await deferredInstallPrompt.userChoice;
    deferredInstallPrompt = null;
    return choice.outcome;
  } catch (err) {
    console.error('Error prompting PWA install:', err);
    return 'dismissed';
  }
}

/**
 * Check if the application is currently running in standalone PWA mode
 */
export function isStandalonePwa(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone === true ||
    document.referrer.includes('android-app://')
  );
}
