import { useState, useEffect } from 'react';
import { Bell, X, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ToastData {
  id: number;
  title: string;
  body: string;
  icon?: string;
  url?: string;
}

export default function InAppToast() {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  useEffect(() => {
    const handleNotification = (e: any) => {
      if (!e.detail) return;
      const newToast: ToastData = {
        id: Date.now(),
        title: e.detail.title || 'Final Stop Barber Shop',
        body: e.detail.body || '',
        icon: e.detail.icon,
        url: e.detail.url
      };

      setToasts((prev) => [...prev, newToast]);

      // Auto dismiss after 6 seconds
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== newToast.id));
      }, 6000);
    };

    window.addEventListener('finalstop-inapp-notification', handleNotification);
    return () => window.removeEventListener('finalstop-inapp-notification', handleNotification);
  }, []);

  const removeToast = (id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-3">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="pointer-events-auto bg-[#151517] border border-[#C5A059]/40 rounded-xl p-4 shadow-2xl shadow-black/80 flex items-start gap-3 backdrop-blur-md"
          >
            <div className="w-9 h-9 rounded-full bg-[#C5A059]/20 border border-[#C5A059]/50 flex items-center justify-center shrink-0">
              <Bell className="w-4 h-4 text-[#C5A059]" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <h4 className="text-sm font-bold text-white tracking-wide truncate">
                  {toast.title}
                </h4>
                <button
                  type="button"
                  onClick={() => removeToast(toast.id)}
                  className="text-gray-400 hover:text-white transition-colors p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-gray-300 mt-1 leading-relaxed">
                {toast.body}
              </p>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
