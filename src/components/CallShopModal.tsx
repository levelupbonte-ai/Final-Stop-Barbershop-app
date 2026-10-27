import React, { useState } from 'react';
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

  // Phone lines come from website_settings.contact; each line can point to a team member.
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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="bg-[#121215] border border-gold/40 w-full max-w-md overflow-hidden shadow-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Accent Line */}
        <div className="h-1 w-full bg-gradient-to-r from-gold/40 via-gold to-gold/40"></div>

        {/* Clean X Close Button without bubbles */}
        <button 
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gold p-1 transition-colors z-10 cursor-pointer bg-transparent border-none outline-none"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 sm:p-8">
          {/* Header */}
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-gold/10 border border-gold/40 text-gold flex items-center justify-center rounded-sm">
              <Phone className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-gold font-bold block">
                Direct Contact
              </span>
              <h2 className="text-xl font-serif font-bold text-white leading-tight">
                Call Final Stop
              </h2>
            </div>
          </div>

          <p className="text-xs text-gray-300 leading-relaxed mb-5">
            Select a shop line below to connect directly with our barbers in San Diego:
          </p>

          {/* Two Phone Lines */}
          <div className="space-y-3 mb-6">
            {phoneLines.map((line) => (
              <div 
                key={line.id}
                className="bg-[#18181C] border border-white/10 hover:border-gold/50 p-4 transition-all duration-200 group"
              >
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                    {line.title}
                  </span>
                  <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    Available
                  </span>
                </div>

                <div className="text-lg font-bold text-white group-hover:text-gold transition-colors font-sans mb-1">
                  {line.numberDisplay}
                </div>

                <p className="text-[11px] text-gray-400 mb-3">
                  {line.description}
                </p>

                <div className="flex items-center gap-2.5 pt-2.5 border-t border-white/8">
                  <a
                    href={line.telHref}
                    className="flex-1 btn-gold text-xs py-2.5 px-3"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Call Now</span>
                  </a>

                  <button
                    type="button"
                    onClick={() => handleCopy(line.numberDisplay, line.id)}
                    className="btn-obsidian text-xs px-3.5 py-2.5"
                    title="Copy phone number"
                  >
                    {copiedNumber === line.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-[11px] text-emerald-400">Copied</span>
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
          <div className="bg-[#0A0A0B] p-3 border border-white/5 text-[11px] text-gray-400 space-y-1.5">
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
              <ExternalLink className="w-3 h-3 text-gray-500 group-hover:text-gold shrink-0" />
            </a>
            <div className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-gold shrink-0" />
              <span>{site.hours.summary.join(" · ")}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
