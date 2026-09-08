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
          title="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-2 text-gold text-xs font-mono font-bold uppercase tracking-wider">
          <Globe className="w-4 h-4" />
          <span>Brand &amp; Domain Setup Guide</span>
        </div>

        <h2 className="text-xl sm:text-2xl font-serif font-bold text-white mb-2">
          How to display "finalstop.org" during Google Sign-In instead of Firebase?
        </h2>

        <p className="text-xs sm:text-sm text-gray-300 leading-relaxed mb-6">
          By default, Google shows the technical temporary subdomain <code className="text-amber-300 font-mono">xxx.firebaseapp.com</code>. For the official Google sign-in window to proudly display <strong>"Sign in to finalstop.org"</strong>, follow these 3 quick steps in your Google Cloud / Firebase console:
        </p>

        <div className="space-y-4 text-xs font-mono">
          
          {/* Step 1 */}
          <div className="bg-black/60 border border-white/10 p-4 rounded-xs space-y-2">
            <div className="flex items-center justify-between text-gold font-bold text-[13px]">
              <span>Step 1: Add Authorized Domain in Firebase Authentication</span>
              <span className="text-[10px] bg-gold/10 px-2 py-0.5 rounded text-gold">2 minutes</span>
            </div>
            <p className="text-gray-300 font-sans text-xs">
              Go to <a href="https://console.firebase.google.com" target="_blank" rel="noreferrer" className="text-gold underline inline-flex items-center gap-1">console.firebase.google.com <ExternalLink className="w-3 h-3" /></a> &gt; <strong>Authentication</strong> &gt; <strong>Settings</strong> tab &gt; <strong>Authorized domains</strong>.
            </p>
            <p className="text-gray-400 font-sans text-[11px]">
              Click <em>"Add domain"</em> and enter:
            </p>
            <div className="flex items-center justify-between bg-[#1A1A20] px-3 py-2 border border-white/15 rounded-xs">
              <span className="text-white font-bold">finalstop.org</span>
              <button
                type="button"
                onClick={() => copyToClipboard('finalstop.org', 'domain')}
                className="px-2.5 py-1 bg-gold hover:bg-gold-light text-black text-[11px] font-bold uppercase rounded-xs flex items-center gap-1 cursor-pointer"
              >
                {copiedText === 'domain' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                <span>{copiedText === 'domain' ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>
          </div>

          {/* Step 2 */}
          <div className="bg-black/60 border border-white/10 p-4 rounded-xs space-y-2">
            <div className="flex items-center justify-between text-gold font-bold text-[13px]">
              <span>Step 2: Configure Google OAuth Consent Screen</span>
              <span className="text-[10px] bg-gold/10 px-2 py-0.5 rounded text-gold">Google Cloud</span>
            </div>
            <p className="text-gray-300 font-sans text-xs">
              In <a href="https://console.cloud.google.com/apis/credentials/consent" target="_blank" rel="noreferrer" className="text-gold underline inline-flex items-center gap-1">console.cloud.google.com/apis/credentials/consent <ExternalLink className="w-3 h-3" /></a>:
            </p>
            <ul className="text-gray-300 font-sans text-[11px] space-y-1 list-disc list-inside">
              <li>App name: <strong className="text-white">Final Stop Barber Shop</strong></li>
              <li>App domain: <strong className="text-white">https://finalstop.org</strong></li>
              <li>Authorized domains: add <strong className="text-gold">finalstop.org</strong></li>
            </ul>
          </div>

          {/* Step 3 */}
          <div className="bg-black/60 border border-white/10 p-4 rounded-xs space-y-2">
            <div className="flex items-center justify-between text-gold font-bold text-[13px]">
              <span>Step 3: Connect Custom Domain to Firebase Hosting</span>
              <span className="text-[10px] bg-emerald-500/15 text-emerald-400 px-2 py-0.5 rounded">Recommended</span>
            </div>
            <p className="text-gray-300 font-sans text-xs">
              In Firebase Console &gt; <strong>Hosting</strong> &gt; <em>"Add custom domain"</em>, enter <code className="text-white">finalstop.org</code> and add the DNS (Type A) records at your registrar (e.g. Namecheap, GoDaddy, Cloudflare).
            </p>
            <p className="text-gray-400 font-sans text-[11px]">
              Once linked, Firebase automatically issues an SSL certificate and the Google login prompt displays <strong>finalstop.org</strong> directly!
            </p>
          </div>

        </div>

        <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-mono">
            <ShieldCheck className="w-4 h-4" />
            <span>Google Identity Services Certified</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 bg-gold hover:bg-gold-light text-black font-bold text-xs font-mono uppercase tracking-wider rounded-xs cursor-pointer"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
}
