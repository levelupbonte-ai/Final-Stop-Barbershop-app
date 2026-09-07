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
  Volume2
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

export default function NotificationAndPwaModal({ isOpen, onClose }: NotificationAndPwaModalProps) {
  const [permission, setPermission] = useState<string>('default');
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [loadingAction, setLoadingAction] = useState(false);
  const [testSent, setTestSent] = useState(false);

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
  };

  const handleSendTest = async () => {
    setTestSent(true);
    await sendTestNotification();
    setTimeout(() => setTestSent(false), 3000);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-[#151517] border border-white/10 rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Gold accents */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-black/60 to-[#151517]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#C5A059]/15 border border-[#C5A059]/40 flex items-center justify-center text-[#C5A059]">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-white tracking-wide">
                Notifications & Application Mobile
              </h3>
              <p className="text-xs text-gray-400">
                Application PWA & alertes en temps réel
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Section 1: Notifications Push */}
          <div className="bg-black/40 border border-white/5 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Volume2 className="w-4 h-4 text-[#C5A059]" />
                <span className="text-sm font-semibold text-white">Alertes du Barbershop</span>
              </div>
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                permission === 'granted'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-white/10 text-gray-400'
              }`}>
                {permission === 'granted' ? 'Activées' : 'Non activées'}
              </span>
            </div>

            <p className="text-xs text-gray-300 leading-relaxed">
              Recevez une alerte sonore et vibration immédiate lorsque votre tour approche dans la file d'attente ou pour vos rappels de rendez-vous.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row gap-2">
              {permission !== 'granted' ? (
                <button
                  type="button"
                  onClick={handleEnableNotifications}
                  disabled={loadingAction}
                  className="flex-1 bg-[#C5A059] hover:bg-[#D4B577] text-black font-semibold text-xs uppercase tracking-wider py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-[#C5A059]/20"
                >
                  <Bell className="w-3.5 h-3.5" />
                  {loadingAction ? 'Activation...' : 'Activer les notifications'}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSendTest}
                  disabled={testSent}
                  className="flex-1 bg-white/10 hover:bg-white/15 text-white font-medium text-xs py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors cursor-pointer border border-white/10"
                >
                  {testSent ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Sparkles className="w-3.5 h-3.5 text-[#C5A059]" />}
                  {testSent ? 'Notification envoyée !' : 'Tester une alerte'}
                </button>
              )}
            </div>
          </div>

          {/* Section 2: PWA Mobile Install */}
          <div className="bg-black/40 border border-white/5 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Smartphone className="w-4 h-4 text-[#C5A059]" />
                <span className="text-sm font-semibold text-white">Installer sur Mobile (PWA)</span>
              </div>
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                isInstalled
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-gold/20 text-gold border border-gold/30'
              }`}>
                {isInstalled ? 'Installée' : 'Disponible'}
              </span>
            </div>

            <p className="text-xs text-gray-300 leading-relaxed">
              Installez l'application Final Stop Barber Shop directement sur votre écran d'accueil sans passer par l'App Store ou Play Store. Zéro téléchargement lourd, accès instantané plein écran et fonctionnement hors-ligne.
            </p>

            {/* Install actions depending on platform */}
            {isInstalled ? (
              <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-500/30 flex items-center gap-2.5 text-xs text-emerald-300">
                <Check className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>Application installée et prête sur votre écran d'accueil.</span>
              </div>
            ) : isIOS ? (
              <div className="p-3.5 rounded-lg bg-[#0A0A0B] border border-white/10 space-y-2">
                <span className="text-xs font-semibold text-gold block">Sur iPhone & iPad (Safari) :</span>
                <ol className="text-xs text-gray-300 space-y-1.5 list-decimal list-inside">
                  <li>
                    Appuyez sur le bouton de partage <Share2 className="inline w-3 h-3 text-gold mx-1" /> en bas de l'écran.
                  </li>
                  <li>
                    Faites défiler et sélectionnez <strong className="text-white">"Sur l'écran d'accueil"</strong> <PlusSquare className="inline w-3 h-3 text-gold mx-1" />.
                  </li>
                  <li>
                    Validez en appuyant sur <strong className="text-white">"Ajouter"</strong> en haut à droite.
                  </li>
                </ol>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleInstallClick}
                className="w-full bg-[#C5A059] hover:bg-[#D4B577] text-black font-semibold text-xs uppercase tracking-wider py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-[#C5A059]/20"
              >
                <Download className="w-3.5 h-3.5" />
                Installer l'application sur mon appareil
              </button>
            )}
          </div>

          {/* Quick Features Checklist */}
          <div className="grid grid-cols-2 gap-2 text-xs text-gray-400 pt-1">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#C5A059]" />
              <span>Données synchronisées Cloud</span>
            </div>
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#C5A059]" />
              <span>Suivi file en direct</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-black/50 border-t border-white/10 text-center">
          <button
            type="button"
            onClick={onClose}
            className="text-xs text-gray-400 hover:text-white transition-colors cursor-pointer"
          >
            Fermer la fenêtre
          </button>
        </div>
      </div>
    </div>
  );
}
