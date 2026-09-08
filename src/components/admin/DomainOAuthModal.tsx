import { useState } from 'react';
import { Globe, X, Copy, Check, ExternalLink, ShieldCheck, HelpCircle } from 'lucide-react';

interface DomainOAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DomainOAuthModal({ isOpen, onClose }: DomainOAuthModalProps) {
  const [copiedText, setCopiedText] = useState<string | null>(null);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div 
        id="domain-oauth-guide-modal"
        className="relative w-full max-w-2xl bg-[#131317] border border-gold/40 rounded-sm shadow-2xl p-6 sm:p-8 my-8 text-white animate-in fade-in zoom-in-95 duration-200"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 text-gray-400 hover:text-white p-2 rounded-xs bg-white/5 hover:bg-white/10 transition-colors cursor-pointer border-none"
          title="Fermer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-2 text-gold text-xs font-mono font-bold uppercase tracking-wider">
          <Globe className="w-4 h-4" />
          <span>Configuration de Marque & Domaine</span>
        </div>

        <h2 className="text-xl sm:text-2xl font-serif font-bold text-white mb-2">
          Comment afficher « finalstop.org » au lieu de Firebase lors de la connexion Google ?
        </h2>

        <p className="text-xs sm:text-sm text-gray-300 leading-relaxed mb-6">
          Par défaut, Google affiche le sous-domaine technique temporaire <code className="text-amber-300 font-mono">xxx.firebaseapp.com</code>. Pour que la fenêtre officielle de connexion Google affiche fièrement <strong>« Se connecter à finalstop.org »</strong>, voici les 3 étapes rapides à configurer dans votre console Google Cloud / Firebase :
        </p>

        <div className="space-y-4 text-xs font-mono">
          
          {/* Step 1 */}
          <div className="bg-black/60 border border-white/10 p-4 rounded-xs space-y-2">
            <div className="flex items-center justify-between text-gold font-bold text-[13px]">
              <span>Étape 1 : Ajouter le domaine dans Firebase Authentication</span>
              <span className="text-[10px] bg-gold/10 px-2 py-0.5 rounded text-gold">2 minutes</span>
            </div>
            <p className="text-gray-300 font-sans text-xs">
              Rendez-vous sur <a href="https://console.firebase.google.com" target="_blank" rel="noreferrer" className="text-gold underline inline-flex items-center gap-1">console.firebase.google.com <ExternalLink className="w-3 h-3" /></a> &gt; <strong>Authentication</strong> &gt; Onglet <strong>Settings</strong> &gt; <strong>Authorized domains</strong>.
            </p>
            <p className="text-gray-400 font-sans text-[11px]">
              Cliquez sur <em>"Add domain"</em> et ajoutez :
            </p>
            <div className="flex items-center justify-between bg-[#1A1A20] px-3 py-2 border border-white/15 rounded-xs">
              <span className="text-white font-bold">finalstop.org</span>
              <button
                type="button"
                onClick={() => copyToClipboard('finalstop.org', 'domain')}
                className="px-2.5 py-1 bg-gold hover:bg-gold-light text-black text-[11px] font-bold uppercase rounded-xs flex items-center gap-1 cursor-pointer"
              >
                {copiedText === 'domain' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                <span>{copiedText === 'domain' ? 'Copié !' : 'Copier'}</span>
              </button>
            </div>
          </div>

          {/* Step 2 */}
          <div className="bg-black/60 border border-white/10 p-4 rounded-xs space-y-2">
            <div className="flex items-center justify-between text-gold font-bold text-[13px]">
              <span>Étape 2 : Configurer l'écran de consentement Google OAuth</span>
              <span className="text-[10px] bg-gold/10 px-2 py-0.5 rounded text-gold">Google Cloud</span>
            </div>
            <p className="text-gray-300 font-sans text-xs">
              Sur <a href="https://console.cloud.google.com/apis/credentials/consent" target="_blank" rel="noreferrer" className="text-gold underline inline-flex items-center gap-1">console.cloud.google.com/apis/credentials/consent <ExternalLink className="w-3 h-3" /></a> :
            </p>
            <ul className="text-gray-300 font-sans text-[11px] space-y-1 list-disc list-inside">
              <li>Nom de l'application : <strong className="text-white">Final Stop Barber Shop</strong></li>
              <li>Domaine de l'application : <strong className="text-white">https://finalstop.org</strong></li>
              <li>Domaines autorisés : ajoutez <strong className="text-gold">finalstop.org</strong></li>
            </ul>
          </div>

          {/* Step 3 */}
          <div className="bg-black/60 border border-white/10 p-4 rounded-xs space-y-2">
            <div className="flex items-center justify-between text-gold font-bold text-[13px]">
              <span>Étape 3 : Relier le domaine personnalisé Firebase Hosting</span>
              <span className="text-[10px] bg-emerald-500/15 text-emerald-400 px-2 py-0.5 rounded">Recommandé</span>
            </div>
            <p className="text-gray-300 font-sans text-xs">
              Dans Firebase Console &gt; <strong>Hosting</strong> &gt; <em>"Add custom domain"</em>, entrez <code className="text-white">finalstop.org</code> et pointez vos enregistrements DNS (Type A) chez votre registraire (ex: Namecheap, GoDaddy, Cloudflare).
            </p>
            <p className="text-gray-400 font-sans text-[11px]">
              Une fois relié, Firebase émet un certificat SSL gratuit et la popup d'autorisation Google n'affichera plus jamais firebaseapp.com, mais directement <strong>finalstop.org</strong> !
            </p>
          </div>

        </div>

        <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-mono">
            <ShieldCheck className="w-4 h-4" />
            <span>Sécurité Google Identity Services certifiée</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 bg-gold hover:bg-gold-light text-black font-bold text-xs font-mono uppercase tracking-wider rounded-xs cursor-pointer"
          >
            J'ai Compris
          </button>
        </div>
      </div>
    </div>
  );
}
