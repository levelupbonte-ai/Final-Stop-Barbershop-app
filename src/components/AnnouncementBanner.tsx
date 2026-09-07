import { useState, useEffect } from 'react';
import { Megaphone, X, Sparkles, AlertCircle, Info, ExternalLink } from 'lucide-react';
import { db } from '../lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';

export interface AnnouncementData {
  active: boolean;
  title: string;
  message: string;
  type: 'info' | 'promo' | 'alert';
  linkText?: string;
  linkUrl?: string;
  updatedAt?: any;
}

export const DEFAULT_ANNOUNCEMENT: AnnouncementData = {
  active: true,
  title: 'Shop Notice',
  message: 'Open Monday - Saturday 10:00 AM - 6:00 PM • Walk-ins & Instant Online Booking available.',
  type: 'info'
};

export default function AnnouncementBanner() {
  const [announcement, setAnnouncement] = useState<AnnouncementData | null>(null);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Initial load from localStorage if available
    try {
      const cached = localStorage.getItem('final_stop_announcement');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed && typeof parsed.active === 'boolean') {
          setAnnouncement(parsed);
        }
      }
    } catch {
      // fallback
    }

    // Firestore live listener
    try {
      const unsub = onSnapshot(
        doc(db, 'shop_settings', 'announcement'),
        (snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.data() as AnnouncementData;
            setAnnouncement(data);
            try {
              localStorage.setItem('final_stop_announcement', JSON.stringify(data));
            } catch {}
          }
        },
        (error) => {
          console.debug('Firestore announcement fallback:', error);
        }
      );

      const handleLocalUpdate = (e: any) => {
        if (e.detail) {
          setAnnouncement(e.detail);
          setIsDismissed(false);
        }
      };
      window.addEventListener('announcement-updated', handleLocalUpdate);

      return () => {
        unsub();
        window.removeEventListener('announcement-updated', handleLocalUpdate);
      };
    } catch {
      // ignore
    }
  }, []);

  if (!announcement || !announcement.active || !announcement.message || isDismissed) {
    return null;
  }

  const getTypeStyles = () => {
    switch (announcement.type) {
      case 'promo':
        return {
          bg: 'bg-gradient-to-r from-[#0d2818] via-[#103b22] to-[#0d2818] border-emerald-500/40 text-emerald-200',
          badgeBg: 'bg-emerald-500 text-black',
          badgeText: 'PROMO FLASH',
          icon: <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
        };
      case 'alert':
        return {
          bg: 'bg-gradient-to-r from-[#2c0b0e] via-[#3d1217] to-[#2c0b0e] border-rose-500/40 text-rose-200',
          badgeBg: 'bg-rose-500 text-white',
          badgeText: 'IMPORTANT',
          icon: <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
        };
      default:
        return {
          bg: 'bg-gradient-to-r from-[#171510] via-[#241e12] to-[#171510] border-gold/40 text-gray-200',
          badgeBg: 'bg-gold text-black',
          badgeText: 'ANNONCE',
          icon: <Megaphone className="w-3.5 h-3.5 text-gold shrink-0" />
        };
    }
  };

  const currentType = getTypeStyles();

  return (
    <div
      className={`relative w-full border-b z-45 px-3 py-2 text-xs backdrop-blur-md transition-all ${currentType.bg}`}
      style={{ paddingTop: 'max(env(safe-area-inset-top, 0px), 8px)' }}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 overflow-hidden flex-1">
          <div className="hidden sm:flex items-center justify-center">
            {currentType.icon}
          </div>
          <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded tracking-wider uppercase shrink-0 ${currentType.badgeBg}`}>
            {currentType.badgeText}
          </span>
          <div className="flex items-center gap-2 truncate">
            {announcement.title && (
              <strong className="text-white font-medium truncate shrink-0">
                {announcement.title} :
              </strong>
            )}
            <span className="truncate text-gray-300">
              {announcement.message}
            </span>
          </div>

          {announcement.linkUrl && (
            <a
              href={announcement.linkUrl}
              className="inline-flex items-center gap-1 text-gold hover:underline shrink-0 text-[11px] font-mono"
            >
              <span>{announcement.linkText || 'Voir plus'}</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>

        <button
          type="button"
          onClick={() => setIsDismissed(true)}
          className="p-1 text-gray-400 hover:text-white rounded transition-colors shrink-0 cursor-pointer"
          title="Fermer l'annonce"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
