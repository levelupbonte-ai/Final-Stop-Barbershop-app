import { useState, useEffect } from 'react';
import { 
  Bell, 
  X, 
  Smartphone, 
  Check, 
  Download, 
  Share2, 
  PlusSquare, 
  ShieldCheck, 
  Sparkles,
  Volume2,
  Lock,
  Scissors,
  CheckCircle2
} from 'lucide-react';
import { 
  getNotificationPermission, 
  requestNotificationPermission, 
  sendTestNotification 
} from '../lib/notifications';
import { promptInstallPwa, isStandalonePwa } from '../lib/pwa';

interface NotificationAndPwaModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Elegant sound feedback using browser Web Audio API
function playChime() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.4);
  } catch (e) {
    // AudioContext not allowed without interaction
  }
}

export default function NotificationAndPwaModal({ isOpen, onClose }: NotificationAndPwaModalProps) {
  const [permission, setPermission] = useState<string>('default');
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [loadingAction, setLoadingAction] = useState(false);
  const [testSent, setTestSent] = useState(false);
  const [activeTab, setActiveTab] = useState<'notifications' | 'pwa'>('notifications');

  // Preferences toggles
  const [prefWaitlist, setPrefWaitlist] = useState(true);
  const [prefReminders, setPrefReminders] = useState(true);
  const [prefOffers, setPrefOffers] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setPermission(getNotificationPermission());
    setIsInstalled(isStandalonePwa());

    const handleInstallable = () => setIsInstallable(true);
    const handleInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
    };

    window.addEventListener('pwa-installable', handleInstallable);
    window.addEventListener('pwa-installed', handleInstalled);

    return () => {
      window.removeEventListener('pwa-installable', handleInstallable);
      window.removeEventListener('pwa-installed', handleInstalled);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleEnableNotifications = async () => {
    setLoadingAction(true);
    const granted = await requestNotificationPermission();
    setPermission(granted ? 'granted' : 'denied');
    setLoadingAction(false);
    if (granted) {
      playChime();
    }
  };

  const handleSendTest = async () => {
    setTestSent(true);
    playChime();
    await sendTestNotification(
      '✂️ Final Stop Barber Shop',
      'Your chair is almost ready in the queue! Head over to the lounge now.'
    );
    setTimeout(() => setTestSent(false), 3500);
  };

  const handleInstallClick = async () => {
    const outcome = await promptInstallPwa();
    if (outcome === 'accepted') {
      setIsInstalled(true);
      setIsInstallable(false);
    }
  };

  const isIOS = typeof navigator !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="bg-[#131316] border border-gold/40 rounded-2xl max-w-lg w-full overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.8)] relative flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Luxury Gold Header */}
        <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-black via-[#1a1711] to-[#131316]">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gold/15 border border-gold/40 flex items-center justify-center text-gold shadow-inner">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono tracking-widest text-gold uppercase font-bold">
                  Alert Center
                </span>
                <span className="bg-emerald-500/20 text-emerald-400 text-[9px] font-mono px-1.5 py-0.2 rounded border border-emerald-500/30">
                  Live Updates
                </span>
              </div>
              <h3 className="font-serif text-lg font-bold text-white tracking-wide">
                Notifications & App Setup
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Top Switcher Tabs */}
        <div className="flex border-b border-white/10 bg-black/30 p-2 gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('notifications')}
            className={`flex-1 py-2 text-xs font-mono font-bold rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'notifications'
                ? 'bg-gold text-black shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Bell className="w-3.5 h-3.5" />
            <span>Alerts & Reminders</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('pwa')}
            className={`flex-1 py-2 text-xs font-mono font-bold rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'pwa'
                ? 'bg-gold text-black shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Install App</span>
          </button>
        </div>

        {/* Main Body */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1">
          {activeTab === 'notifications' ? (
            <>
              {/* Phone Mockup Preview */}
              <div className="relative bg-[#1C1C1E] border border-white/15 rounded-2xl p-4 shadow-xl overflow-hidden">
                <div className="flex items-center justify-between mb-3 text-[10px] text-gray-400 font-mono">
                  <span className="flex items-center gap-1 text-gold">
                    <Sparkles className="w-3 h-3" />
                    Lock Screen Preview
                  </span>
                  <span>Instant Push Notification</span>
                </div>

                <div className="bg-[#2C2C2E]/90 border border-white/10 rounded-xl p-3 flex items-start gap-3 shadow-md">
                  <div className="w-10 h-10 rounded-xl bg-black border border-gold/60 p-0.5 overflow-hidden shrink-0">
                    <img
                      src="https://i.ibb.co/FR3LpjN/Chat-GPT-Image-Sep-6-2026-01-08-28-PM.png"
                      alt="Final Stop Icon"
                      className="w-full h-full object-cover rounded-lg"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h5 className="text-xs font-bold text-white tracking-wide truncate">
                        Final Stop Barber Shop
                      </h5>
                      <span className="text-[10px] text-gray-400 font-mono">Just now</span>
                    </div>
                    <p className="text-xs text-gray-300 mt-1 leading-relaxed">
                      💈 Your turn is in 10 minutes! Mika is ready for you at Chair #1.
                    </p>
                  </div>
                </div>
              </div>

              {/* Status Bar */}
              <div className="bg-black/40 border border-white/10 rounded-xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Volume2 className="w-4 h-4 text-gold" />
                  <div>
                    <span className="text-xs font-bold text-white block">
                      Permission Status
                    </span>
                    <span className="text-[11px] text-gray-400 font-mono">
                      {permission === 'granted'
                        ? 'Notifications enabled in this browser'
                        : 'Permission needed to receive chair alerts'}
                    </span>
                  </div>
                </div>

                <span className={`text-xs px-2.5 py-1 rounded-full font-mono font-bold ${
                  permission === 'granted'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                    : 'bg-white/10 text-gray-400'
                }`}>
                  {permission === 'granted' ? 'ENABLED' : 'PENDING'}
                </span>
              </div>

              {/* Granular Preference Checklist */}
              <div className="bg-black/30 border border-white/5 rounded-xl p-4 space-y-3">
                <span className="text-xs font-mono font-bold text-gold uppercase tracking-wider block">
                  Included alerts:
                </span>

                <label className="flex items-center justify-between text-xs text-gray-300 cursor-pointer">
                  <span>Live Walk-in waitlist queue turn alert</span>
                  <input
                    type="checkbox"
                    checked={prefWaitlist}
                    onChange={(e) => setPrefWaitlist(e.target.checked)}
                    className="accent-gold w-4 h-4 cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between text-xs text-gray-300 cursor-pointer">
                  <span>Appointment reminders (24h & 2h before chair time)</span>
                  <input
                    type="checkbox"
                    checked={prefReminders}
                    onChange={(e) => setPrefReminders(e.target.checked)}
                    className="accent-gold w-4 h-4 cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between text-xs text-gray-300 cursor-pointer">
                  <span>Shop announcements & holiday openings</span>
                  <input
                    type="checkbox"
                    checked={prefOffers}
                    onChange={(e) => setPrefOffers(e.target.checked)}
                    className="accent-gold w-4 h-4 cursor-pointer"
                  />
                </label>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-1">
                {permission !== 'granted' ? (
                  <button
                    type="button"
                    onClick={handleEnableNotifications}
                    disabled={loadingAction}
                    className="w-full bg-gold hover:bg-gold-light text-black font-bold text-xs uppercase tracking-wider py-3.5 px-6 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-gold/20 active:scale-95"
                  >
                    <Bell className="w-4 h-4" />
                    <span>{loadingAction ? 'Requesting...' : 'Enable Instant Notifications'}</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSendTest}
                    disabled={testSent}
                    className="w-full bg-white/10 hover:bg-white/15 text-white font-mono font-bold text-xs uppercase tracking-wider py-3.5 px-6 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer border border-white/20 active:scale-95"
                  >
                    {testSent ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span className="text-emerald-300">Test alert sent successfully!</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 text-gold" />
                        <span>Test Sound & Vibration Alert</span>
                      </>
                    )}
                  </button>
                )}

                <div className="flex items-center justify-center gap-1.5 text-[11px] text-gray-500 font-mono pt-1">
                  <Lock className="w-3 h-3 text-gold/60" />
                  <span>Privacy guaranteed • Zero spam • Easily disabled</span>
                </div>
              </div>
            </>
          ) : (
            /* PWA INSTALL TAB */
            <div className="space-y-4">
              <div className="bg-black/40 border border-white/10 rounded-xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Smartphone className="w-5 h-5 text-gold" />
                  <div>
                    <h5 className="text-xs font-bold text-white">
                      Progressive Web App (PWA)
                    </h5>
                    <p className="text-[11px] text-gray-400 font-mono">
                      Works offline & provides full-screen access
                    </p>
                  </div>
                </div>

                <span className={`text-xs px-2.5 py-1 rounded-full font-mono font-bold ${
                  isInstalled
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                    : 'bg-gold/20 text-gold border border-gold/40'
                }`}>
                  {isInstalled ? 'INSTALLED' : 'AVAILABLE'}
                </span>
              </div>

              {isInstalled ? (
                <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/40 flex items-center gap-3 text-xs text-emerald-300 font-mono">
                  <Check className="w-5 h-5 text-emerald-400 shrink-0" />
                  <span>
                    Final Stop Barber Shop app is already installed on your home screen!
                  </span>
                </div>
              ) : isIOS ? (
                <div className="p-4 rounded-xl bg-black/60 border border-gold/40 space-y-3">
                  <span className="text-xs font-mono font-bold text-gold uppercase block">
                    Install on iPhone & iPad (Safari):
                  </span>
                  <ol className="text-xs text-gray-300 space-y-2 list-decimal list-inside leading-relaxed">
                    <li>
                      Tap the Share button <Share2 className="inline w-3.5 h-3.5 text-gold mx-1" /> at the bottom of Safari.
                    </li>
                    <li>
                      Scroll down and tap <strong className="text-white">"Add to Home Screen"</strong> <PlusSquare className="inline w-3.5 h-3.5 text-gold mx-1" />.
                    </li>
                    <li>
                      Tap <strong className="text-white">"Add"</strong> in the top right corner.
                    </li>
                  </ol>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleInstallClick}
                  className="w-full bg-gold hover:bg-gold-light text-black font-bold text-xs uppercase tracking-wider py-3.5 px-6 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-gold/20 active:scale-95"
                >
                  <Download className="w-4 h-4" />
                  <span>Install App on this Device</span>
                </button>
              )}

              <div className="grid grid-cols-2 gap-2 text-xs text-gray-400 pt-2">
                <div className="flex items-center gap-2 bg-white/5 p-2.5 rounded-lg border border-white/5">
                  <ShieldCheck className="w-4 h-4 text-gold shrink-0" />
                  <span>Zero heavy storage</span>
                </div>
                <div className="flex items-center gap-2 bg-white/5 p-2.5 rounded-lg border border-white/5">
                  <Sparkles className="w-4 h-4 text-gold shrink-0" />
                  <span>Instant VIP access</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Bottom Close */}
        <div className="p-4 bg-black/60 border-t border-white/10 text-center shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="text-xs text-gray-400 hover:text-white transition-colors cursor-pointer"
          >
            Close Window
          </button>
        </div>
      </div>
    </div>
  );
}
