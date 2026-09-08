import React from 'react';
import { X, Calendar, Scissors, Award, Sparkles, CheckCircle2 } from 'lucide-react';

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
  if (!isOpen || !image) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/90 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="relative bg-[#121215] border border-gold/40 max-w-4xl w-full rounded-sm shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 z-20 bg-black/70 hover:bg-gold text-white hover:text-black p-2 rounded-full transition-all border border-white/20 cursor-pointer"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Image Preview Container */}
        <div className="md:w-3/5 bg-black flex items-center justify-center relative overflow-hidden group min-h-[300px] md:min-h-[480px]">
          <img
            src={image.src}
            alt={image.alt || image.title || 'Barber Style'}
            className="w-full h-full object-cover max-h-[60vh] md:max-h-[80vh]"
            referrerPolicy="no-referrer"
          />
          <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-sm border border-white/15 px-3 py-1 text-[11px] font-mono text-gold uppercase tracking-wider">
            {image.category || 'Signature Style'}
          </div>
        </div>

        {/* Details & Description Container */}
        <div className="md:w-2/5 p-6 sm:p-8 flex flex-col justify-between overflow-y-auto bg-[#141418]">
          <div className="space-y-4">
            {/* Header info */}
            <div>
              <div className="inline-flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-[0.2em] text-gold font-bold mb-2">
                <Scissors className="w-3.5 h-3.5" />
                <span>Final Stop Barber Shop • Master Cut</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-serif font-bold text-white leading-snug">
                {image.title || image.alt}
              </h2>
            </div>

            {/* Barber attribution */}
            {image.barber && (
              <div className="flex items-center gap-2 bg-[#1A1A20] border border-white/10 px-3 py-2 rounded-xs">
                <Award className="w-4 h-4 text-gold shrink-0" />
                <div className="text-xs font-mono">
                  <span className="text-gray-400">Crafted by: </span>
                  <strong className="text-gold">{image.barber}</strong>
                </div>
              </div>
            )}

            {/* Description */}
            <div className="space-y-2">
              <h4 className="text-xs font-mono uppercase tracking-wider text-gray-400 font-bold">
                Style Description & Technique
              </h4>
              <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
                {image.description || 'Precision haircut executed with premium clippers, tailored scissor work, and traditional straight razor contouring for a crisp, long-lasting silhouette.'}
              </p>
            </div>

            {/* Service Highlights */}
            <div className="border-t border-white/10 pt-4 space-y-2 text-xs text-gray-300 font-mono">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Hot towel eucalyptus steam finish</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Organic oils & scalp nourishment</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Clean lines sculpted with Japanese straight razor</span>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="pt-6 mt-6 border-t border-white/10">
            <button
              type="button"
              onClick={() => {
                onClose();
                if (onBookStyle) {
                  onBookStyle(image.title || image.alt, image.barber);
                }
              }}
              className="w-full bg-gold hover:bg-gold-light text-black py-3 px-4 font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer rounded-sm"
            >
              <Calendar className="w-4 h-4" />
              <span>Book This Style</span>
            </button>
            <p className="text-center text-[10px] text-gray-400 mt-2 font-mono">
              Appointments & Walk-Ins Welcome • 5277 El Cajon Blvd
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
