import { useState, useEffect } from 'react';
import { Bell, X, CheckCircle, Sparkles } from 'lucide-react';
import { isNotificationSupported, requestNotificationPermission, getNotificationPermission } from '../lib/notifications';

export default function NotificationPermissionBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    // Check if notifications are supported and not already granted/denied or dismissed
    if (!isNotificationSupported()) return;

    const currentPermission = getNotificationPermission();
    const isDismissed = localStorage.getItem('finalstop_notification_banner_dismissed') === 'true';

    // If permission already granted or explicitly denied, or user already dismissed it, don't show
    if (currentPermission === 'granted' || currentPermission === 'denied' || isDismissed) {
      return;
    }

    // 3.5 seconds after opening the site as requested by user (3-4 seconds delay)
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 3500);

    return () => clearTimeout(timer);
  }, []);

  const handleEnableNotifications = async () => {
    setIsSubmitting(true);
    try {
      const granted = await requestNotificationPermission();
      if (granted) {
        setIsSuccess(true);
        localStorage.setItem('finalstop_notification_banner_dismissed', 'true');
        setTimeout(() => {
          setIsVisible(false);
        }, 1800);
      } else {
        localStorage.setItem('finalstop_notification_banner_dismissed', 'true');
        setIsVisible(false);
      }
    } catch (err) {
      console.error('Failed to enable notifications:', err);
      setIsVisible(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDismiss = () => {
    localStorage.setItem('finalstop_notification_banner_dismissed', 'true');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <aside
      aria-label="Notification Permission Request"
      className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-[9999] animate-in fade-in slide-in-from-bottom-6 duration-500"
    >
      <div className="relative bg-[#141416]/95 backdrop-blur-xl border border-gold/40 rounded-xl p-4 sm:p-5 shadow-[0_12px_40px_rgba(0,0,0,0.85)] text-white ring-1 ring-gold/20">
        {/* Subtle Gold Accent Bar on Top */}
        <div className="absolute top-0 left-6 right-6 h-[2px] bg-gradient-to-r from-transparent via-gold to-transparent opacity-80" />

        {/* Close Button */}
        <button
          type="button"
          onClick={handleDismiss}
          className="absolute top-3 right-3 text-gray-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-start gap-3.5">
          {/* Gold Bell Icon with Glow */}
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gold/15 border border-gold/40 flex items-center justify-center text-gold shadow-inner mt-0.5 relative">
            <Bell className="w-5 h-5 animate-bounce-subtle" />
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-amber-400 rounded-full animate-ping" />
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-amber-400 rounded-full" />
          </div>

          <div className="flex-1 pr-4">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-gold bg-gold/10 px-2 py-0.5 rounded border border-gold/25 flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                Live Alerts
              </span>
            </div>

            <h4 className="text-sm font-bold text-white tracking-wide mb-1 font-serif">
              {isSuccess ? 'Notifications Activated!' : 'Stay Updated On Your Turn'}
            </h4>

            <p className="text-xs text-gray-300 leading-relaxed">
              {isSuccess
                ? 'You will receive instant queue updates and appointment reminders on your device.'
                : 'Turn on instant alerts to get notified when your chair is ready so you never miss your turn at the shop.'}
            </p>

            {/* Action Buttons */}
            <div className="mt-3.5 flex items-center gap-2.5">
              {isSuccess ? (
                <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium py-1">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span>Permission Granted</span>
                </div>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={handleEnableNotifications}
                    disabled={isSubmitting}
                    className="flex-1 bg-gradient-to-r from-gold via-gold-light to-gold hover:opacity-95 text-black font-bold text-xs uppercase tracking-wider py-2.5 px-4 rounded shadow-md active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <Bell className="w-3.5 h-3.5" />
                    <span>{isSubmitting ? 'Enabling...' : 'Enable Alerts'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleDismiss}
                    className="text-xs text-gray-400 hover:text-gray-200 px-3 py-2.5 transition-colors cursor-pointer"
                  >
                    Not Now
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
