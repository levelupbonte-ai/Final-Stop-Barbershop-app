import { X, Calendar, Scissors, ShieldCheck, ArrowUpRight, MapPin } from 'lucide-react';
import { useSiteData } from '../lib/site/SiteDataProvider';

export interface LightboxImageItem {
  src: string;
  alt: string;
  title?: string;
  category?: string;
  barber?: string;
  description?: string;
  price?: string;
  duration?: string;
}

interface ImageLightboxModalProps {
  image: LightboxImageItem | null;
  isOpen: boolean;
  onClose: () => void;
  onBookStyle?: (styleTitle: string, barberName?: string) => void;
}

export default function ImageLightboxModal({
  image,
  isOpen,
  onClose,
  onBookStyle
}: ImageLightboxModalProps) {
  const { site } = useSiteData();
  if (!isOpen || !image) return null;

  const combinedText = `${image.title || ''} ${image.category || ''} ${image.barber || ''} ${image.description || ''}`.toLowerCase();
  const isBraidsOrLocs =
    combinedText.includes('braid') ||
    combinedText.includes('loc') ||
    combinedText.includes('twist') ||
    combinedText.includes('cornrow') ||
    combinedText.includes('curl') ||
    combinedText.includes('mika');

  const craftPillars = isBraidsOrLocs
    ? [
        {
          label: 'Tension-Free Partitioning',
          detail: 'Precision geometric parting engineered to protect natural edges and follicular integrity.'
        },
        {
          label: 'Botanical Scalp Infusion',
          detail: 'Nourished with lightweight organic oils and sealed with a silky setting mousse finish.'
        },
        {
          label: 'Long-Wear Protective Craft',
          detail: 'Balanced weight distribution for effortless movement and lasting salon freshness.'
        }
      ]
    : [
        {
          label: 'Micro-Graduated Blend',
          detail: 'Seamless clipper-over-comb and zero-gap transition tailored to your cranial structure.'
        },
        {
          label: 'Japanese Razor Contouring',
          detail: 'Crisp perimeter architecture using a fresh single-use surgical straight razor blade.'
        },
        {
          label: 'Eucalyptus Steam & Conditioning',
          detail: 'Finished with a warm aromatic towel ritual and botanical skin-soothing tonic.'
        }
      ];

  const eyebrowLabel = isBraidsOrLocs
    ? 'Final Stop Salon · Protective Artistry'
    : 'Final Stop Atelier · Master Barbering';

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/90 backdrop-blur-xl animate-fadeIn font-sans"
      onClick={onClose}
    >
      <div 
        className="relative card-luxury rounded-[2.5rem]! border border-gold/35 max-w-5xl w-full shadow-[0_32px_90px_rgba(0,0,0,0.92)] overflow-hidden flex flex-col lg:flex-row max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Floating Circular Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 z-30 w-10 h-10 rounded-full bg-black/75 hover:bg-gold text-white hover:text-black flex items-center justify-center transition-all duration-300 border border-white/20 hover:border-gold cursor-pointer shadow-xl"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Left: Sculpted Editorial Portrait Preview */}
        <div className="lg:w-[54%] bg-[#09090C] flex items-center justify-center relative overflow-hidden min-h-[280px] sm:min-h-[360px] lg:min-h-[540px]">
          <img
            src={image.src}
            alt={image.alt || image.title || 'Signature Style'}
            className="w-full h-full object-cover max-h-[48vh] lg:max-h-[90vh]"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B0B0F] via-transparent to-black/25 pointer-events-none" />

          {/* Floating Category Capsule */}
          <div className="absolute bottom-5 left-5 bg-black/75 backdrop-blur-md border border-gold/40 px-4 py-1.5 rounded-full text-[11px] font-sans font-bold text-gold uppercase tracking-[0.18em] shadow-lg">
            {image.category || 'Signature Look'}
          </div>
        </div>

        {/* Right: Luxury Salon Dossier & Booking Panel */}
        <div className="lg:w-[46%] p-6 sm:p-9 flex flex-col justify-between overflow-y-auto bg-gradient-to-b from-[#15141A] via-[#111015] to-[#0C0B0F]">
          <div className="space-y-6">
            {/* Editorial Kicker & Title */}
            <div>
              <div className="inline-flex items-center gap-2 text-[10px] font-sans uppercase tracking-[0.22em] text-gold font-bold mb-2.5">
                <Scissors className="w-3.5 h-3.5" />
                <span>{eyebrowLabel}</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white leading-tight tracking-tight">
                {image.title || image.alt}
              </h2>
            </div>

            {/* Sculpted Master Artisan Capsule */}
            {image.barber && (
              <div className="inline-flex items-center gap-3 bg-gradient-to-r from-gold/15 via-gold/[0.07] to-transparent border border-gold/30 px-4 py-2.5 rounded-full">
                <div className="w-7 h-7 rounded-full bg-gold/20 border border-gold/40 flex items-center justify-center text-gold shrink-0">
                  <ShieldCheck className="w-3.5 h-3.5" />
                </div>
                <div className="text-xs leading-snug pr-2">
                  <span className="text-gray-400 uppercase tracking-[0.12em] text-[10px] font-semibold block">
                    Master Artisan
                  </span>
                  <span className="text-gold font-bold tracking-wide">
                    {image.barber}
                  </span>
                </div>
              </div>
            )}

            {/* Curated Technique Narrative */}
            <div className="space-y-2.5">
              <div className="flex items-center gap-3">
                <h4 className="text-[11px] font-sans uppercase tracking-[0.2em] text-gold/90 font-bold shrink-0">
                  Artistry &amp; Technique
                </h4>
                <div className="h-px flex-1 bg-gradient-to-r from-gold/30 to-transparent" />
              </div>
              <p className="text-sm text-gray-200/90 leading-relaxed font-normal">
                {image.description || 'Executed with bespoke sectioning, tailored proportion control, and luxury finishing rituals for a refined, long-lasting look.'}
              </p>
            </div>

            {/* Bespoke Salon Standards (Replaces basic typewriter checklist) */}
            <div className="pt-2 space-y-3">
              <h4 className="text-[11px] font-sans uppercase tracking-[0.2em] text-gray-400 font-bold">
                Signature Salon Standards
              </h4>
              <div className="space-y-2.5">
                {craftPillars.map((pillar) => (
                  <div
                    key={pillar.label}
                    className="flex items-start gap-3 p-3 rounded-2xl bg-white/[0.025] border border-white/[0.06] hover:border-gold/25 transition-colors"
                  >
                    <span className="w-2 h-2 rounded-full bg-gold mt-1.5 shrink-0 shadow-[0_0_8px_rgba(197,160,89,0.8)]" />
                    <div className="text-xs leading-relaxed">
                      <span className="text-white font-semibold tracking-wide block">
                        {pillar.label}
                      </span>
                      <span className="text-gray-400 text-[11px]">
                        {pillar.detail}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Primary Luxury Action Footer */}
          <div className="pt-6 mt-6 border-t border-white/10">
            <button
              type="button"
              onClick={() => {
                onClose();
                if (onBookStyle) {
                  onBookStyle(image.title || image.alt, image.barber);
                }
              }}
              className="w-full btn-gold rounded-full! py-3.5 px-6 text-xs flex items-center justify-center gap-2.5 group"
            >
              <Calendar className="w-4 h-4" />
              <span>Reserve This Look</span>
              <ArrowUpRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </button>
            <p className="text-center text-[11px] text-gray-400 mt-3 flex items-center justify-center gap-1.5 tracking-wide">
              <MapPin className="w-3 h-3 text-gold shrink-0" />
              <span>Appointments &amp; Walk-Ins Welcome &middot; {site.contact.address}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
