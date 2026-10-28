import { useState } from 'react';
import { Phone, X, Copy, Check, Clock, MapPin, ExternalLink } from 'lucide-react';
import { useSiteData } from '../lib/site/SiteDataProvider';

interface CallShopModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CallShopModal({ isOpen, onClose }: CallShopModalProps) {
  const [copiedNumber, setCopiedNumber] = useState<string | null>(null);
  const { site, barbers } = useSiteData();

  if (!isOpen) return null;

  const phoneLines = site.contact.phones.map((line, i) => {
    const member = barbers.find((b) => b.id === line.teamMember);
    return {
      id: line.teamMember ?? `line-${i}`,
      barberName: member?.name ?? line.label,
      role: member?.role ?? '',
      title: member ? `${member.name} — Direct Line` : line.label,
      numberDisplay: line.display,
      telHref: `tel:${line.tel}`,
      description: member?.specialty ?? line.label
    };
  });

  const handleCopy = (num: string, id: string) => {
    navigator.clipboard?.writeText(num);
    setCopiedNumber(id);
    setTimeout(() => setCopiedNumber(null), 2000);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-fadeIn font-sans"
      onClick={onClose}
    >
      <div 
        className="card-luxury rounded-[2.5rem]! border border-gold/40 w-full max-w-md overflow-hidden shadow-[0_32px_90px_rgba(0,0,0,0.92)] relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button 
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 w-9 h-9 rounded-full bg-white/[0.06] hover:bg-gold text-gray-300 hover:text-black flex items-center justify-center transition-all z-10 cursor-pointer border border-white/10"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="p-7 sm:p-8">
          {/* Header */}
          <div className="flex items-center gap-3 mb-3">
            <div className="w-11 h-11 bg-gold/15 border border-gold/40 text-gold flex items-center justify-center rounded-full shrink-0">
              <Phone className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-sans uppercase tracking-[0.22em] text-gold font-bold block">
                Direct Salon Desk
              </span>
              <h2 className="text-xl sm:text-2xl font-serif font-bold text-white leading-tight">
                Call Final Stop
              </h2>
            </div>
          </div>

          <p className="text-xs text-gray-300 leading-relaxed mb-5">
            Select a direct artisan line below to speak with our master barbers and stylists in San Diego:
          </p>

          {/* Two Phone Lines */}
          <div className="space-y-3.5 mb-6">
            {phoneLines.map((line) => (
              <div 
                key={line.id}
                className="bg-white/[0.03] border border-white/10 hover:border-gold/45 p-5 rounded-3xl transition-all duration-200 group"
              >
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-[11px] font-bold text-gold uppercase tracking-[0.14em]">
                    {line.title}
                  </span>
                  <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/25 px-2.5 py-0.5 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    Direct Line
                  </span>
                </div>

                <div className="text-lg font-bold text-white group-hover:text-gold transition-colors font-sans mb-1 tabular-nums">
                  {line.numberDisplay}
                </div>

                <p className="text-xs text-gray-400 mb-3.5 leading-relaxed">
                  {line.description}
                </p>

                <div className="flex items-center gap-2.5 pt-3 border-t border-white/8">
                  <a
                    href={line.telHref}
                    className="flex-1 btn-gold rounded-full! text-xs py-2.5 px-4"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Call Now</span>
                  </a>

                  <button
                    type="button"
                    onClick={() => handleCopy(line.numberDisplay, line.id)}
                    className="btn-obsidian rounded-full! text-xs px-4 py-2.5"
                    title="Copy phone number"
                  >
                    {copiedNumber === line.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-gold" />
                        <span className="text-[11px] text-gold">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-gold" />
                        <span className="text-[11px]">Copy</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Shop Location & Hours Quick Note */}
          <div className="bg-black/40 p-4 rounded-2xl border border-white/8 text-xs text-gray-400 space-y-2">
            <a 
              href={site.contact.mapsUrl || undefined}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between gap-2 hover:text-gold transition-colors group"
            >
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-gold shrink-0" />
                <span>{site.contact.address}</span>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-gray-500 group-hover:text-gold shrink-0" />
            </a>
            <div className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-gold shrink-0" />
              <span>{site.hours.summary.join(' · ')}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
