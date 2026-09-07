/**
 * Centralized Web Notification and In-App Alert System for Final Stop Barber Shop PWA
 */

export interface BarberNotificationOptions {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  url?: string;
  vibrate?: number[];
  tag?: string;
}

const DEFAULT_ICON = 'https://i.ibb.co/FR3LpjN/Chat-GPT-Image-Sep-6-2026-01-08-28-PM.png';

/**
 * Check if the browser supports notifications
 */
export function isNotificationSupported(): boolean {
  return typeof window !== 'undefined' && ('Notification' in window);
}

/**
 * Get current notification permission
 */
export function getNotificationPermission(): NotificationPermission | 'unsupported' {
  if (!isNotificationSupported()) return 'unsupported';
  return Notification.permission;
}

/**
 * Request notification permission from the user
 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (!isNotificationSupported()) {
    console.warn('Notifications are not supported in this browser.');
    return false;
  }

  try {
    const permission = await Notification.requestPermission();
    const granted = permission === 'granted';
    if (granted) {
      localStorage.setItem('finalstop_notifications_enabled', 'true');
      sendBarberNotification({
        title: 'Notifications Activées ! 💈',
        body: 'Vous recevrez les alertes de votre file d’attente et rappels de rendez-vous en direct.',
        url: '/'
      });
    } else {
      localStorage.setItem('finalstop_notifications_enabled', 'false');
    }
    return granted;
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return false;
  }
}

/**
 * Dispatch a native OS / mobile notification (using ServiceWorker if available,
 * falling back to window.Notification)
 */
export async function sendBarberNotification(options: BarberNotificationOptions): Promise<void> {
  const icon = options.icon || DEFAULT_ICON;
  const badge = options.badge || DEFAULT_ICON;

  // Native OS / Browser notifications only (as requested: "uniquement des notifications natives pas in app")
  if (isNotificationSupported() && Notification.permission === 'granted') {
    try {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.getRegistration();
        if (registration && registration.showNotification) {
          await (registration as any).showNotification(options.title, {
            body: options.body,
            icon,
            badge,
            tag: options.tag || 'barber-alert',
            vibrate: options.vibrate || [150, 50, 150],
            data: { url: options.url || '/' }
          });
          return;
        }
      }

      // Fallback to standard Notification constructor
      new Notification(options.title, {
        body: options.body,
        icon,
        badge,
        tag: options.tag
      });
    } catch (err) {
      console.warn('Could not display native notification:', err);
    }
  }
}

/**
 * Send a quick test or preview notification so the user can verify
 */
export async function sendTestNotification(title?: string, body?: string): Promise<void> {
  await sendBarberNotification({
    title: title || 'Final Stop Barber Shop 💈',
    body: body || 'Test réussi ! Votre système de notifications PWA fonctionne parfaitement.',
    url: '/'
  });
}
