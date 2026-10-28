import {
  ChevronRight,
  Phone,
  Scissors,
  Clock
} from 'lucide-react';
import { useSiteData } from '../../lib/site/SiteDataProvider';
import {
  SPECIALIST_UNIVERSES,
  getGalleryItemSpecialist,
  getServiceSpecialist,
  resolveSpecialistKey
} from '../../lib/site/specialist';

interface BarbersPageProps {
  onBackToHome: () => void;
  onSelectBarber: (barberId: string) => void;
  onNavigateToBooking: (barberId?: string) => void;
  onOpenWaitlist: (barberId?: string) => void;
}

export default function BarbersPage({
  onSelectBarber,
  onNavigateToBooking
}: BarbersPageProps) {
  const { barbers: MASTER_BARBERS, services, gallery } = useSiteData();

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-28 sm:pt-36 pb-16 w-full font-sans">
      {/* Page Title */}
      <div className="text-center max-w-3xl mx-auto mb-14">
        <span className="text-gold font-mono text-xs uppercase tracking-[0.25em] font-bold block mb-2">
          Two Dedicated Universes &middot; Over 20 Years of Mastery Each
        </span>
        <h1 className="text-3xl sm:text-5xl font-serif font-bold text-white mb-4">
          Lusca for Men&rsquo;s Cuts &middot; Mika for Women&rsquo;s Braids &amp; Locs
        </h1>
        <div className="divider-gold-fade max-w-xs mx-auto mb-4"></div>
        <p className="text-gray-400 text-sm sm:text-base leading-relaxed">
          At Final Stop Barber Shop &amp; Salon, each master artisan leads their own dedicated universe. Choose <strong className="text-white">Lusca</strong> for Men&rsquo;s &amp; Boys&rsquo; Skin Fades, Haircuts &amp; Beard Sculpting, or <strong className="text-white">Mika</strong> for Women&rsquo;s Knotless Braids, Cornrows, Boho Curls &amp; Dreadlocks.
        </p>
      </div>

      {/* 2 Sculptural Master Barber Vessels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-16">
        {MASTER_BARBERS.map((barber) => {
          const specKey = resolveSpecialistKey(barber.id || barber.name, undefined, services);
          const universe = SPECIALIST_UNIVERSES[specKey];
          const serviceCount = services.filter((s) => getServiceSpecialist(s) === specKey).length;
          const modelCount = gallery.filter((g) => getGalleryItemSpecialist(g) === specKey).length;

          return (
            <div
              key={barber.id}
              className="card-luxury rounded-t-[4rem]! rounded-b-[2.5rem]! p-7 sm:p-10 flex flex-col justify-between group relative overflow-hidden cursor-pointer hover:-translate-y-1.5"
              onClick={() => onSelectBarber(barber.id)}
            >
              <div className="absolute top-0 right-0 w-56 h-56 bg-gold/10 rounded-full blur-3xl -mr-12 -mt-12 group-hover:bg-gold/20 transition-colors pointer-events-none"></div>

              <div>
                {/* Header with Circular Medallion & Dedicated Universe Kicker */}
                <div className="flex items-start justify-between gap-4 mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#24242A] to-[#0A0A0B] border border-gold/45 group-hover:border-gold flex flex-col items-center justify-center shadow-lg transition-colors shrink-0">
                      <span className="text-2xl font-serif font-black text-gold tracking-wider">
                        {barber.initials}
                      </span>
                      <Scissors className="w-3.5 h-3.5 text-gold/70 mt-0.5" />
                    </div>

                    <div>
                      <span className="text-[10px] font-sans font-extrabold text-gold uppercase tracking-[0.2em] block mb-1">
                        {universe.craftBadge}
                      </span>
                      <h2 className="text-2xl font-serif font-bold text-white group-hover:text-gold transition-colors">
                        {barber.name} &mdash; <span className="text-gold italic">{universe.universeTitle}</span>
                      </h2>
                      <p className="text-xs text-gray-300 mt-0.5">{universe.universeSubtitle}</p>
                    </div>
                  </div>
                </div>

                {/* Exclusive Universe Pill Summary */}
                <div className="mb-5 inline-flex flex-wrap items-center gap-2 px-4 py-2 rounded-full bg-white/[0.04] border border-gold/30 text-xs text-gray-200">
                  <span>
                    Exclusive Menu: <strong className="text-gold">{serviceCount} Services</strong>
                  </span>
                  <span className="text-gold/50">&middot;</span>
                  <span>
                    <strong className="text-white">{modelCount} Signature Models</strong>
                  </span>
                </div>

                {/* Tagline */}
                <p className="text-xs sm:text-sm text-gold-light italic mb-4 font-serif">
                  &ldquo;{barber.tagline}&rdquo;
                </p>

                {/* Bio snippet */}
                <p className="text-xs sm:text-sm text-gray-300 leading-relaxed mb-6">
                  {universe.description}
                </p>

                {/* Unboxed Specialties Metadata */}
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mb-6 text-[11px] font-mono text-gray-300">
                  {barber.tags.map((tag, i) => (
                    <span key={i} className="inline-flex items-center gap-2">
                      {i > 0 && <span className="text-gold/50">&middot;</span>}
                      <span>{tag}</span>
                    </span>
                  ))}
                </div>

                {/* Direct Line Pill */}
                <div className="mb-6">
                  <a
                    href={`tel:${barber.phoneRaw}`}
                    onClick={(e) => e.stopPropagation()}
                    className="btn-obsidian rounded-full! px-4 py-2 text-xs font-mono"
                    title={`Call ${barber.name} directly`}
                  >
                    <Phone className="w-3.5 h-3.5 text-gold" />
                    <span>Direct Call: {barber.phone}</span>
                  </a>
                </div>
              </div>

              {/* Card Footer with Pill CTA */}
              <div className="pt-5 border-t border-white/10 flex items-center justify-between gap-3">
                <span className="text-xs font-bold text-gold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  <span>View {barber.name}&rsquo;s Models</span>
                  <ChevronRight className="w-4 h-4" />
                </span>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onNavigateToBooking(barber.id);
                  }}
                  className="btn-gold rounded-full! text-xs px-5 py-2.5"
                >
                  <span>Book with {barber.name}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Sculpted Craftsmanship Pavilion */}
      <div className="rounded-[2.75rem] bg-gradient-to-b from-white/[0.03] via-white/[0.01] to-transparent border border-white/10 p-8 sm:p-12">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-gold font-mono text-[11px] uppercase tracking-widest font-bold block mb-1">
            Specialized Mastery
          </span>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white">
            Two Worlds of Craft Under One Roof
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center divide-y sm:divide-y-0 sm:divide-x divide-white/10">
          <div className="pt-6 sm:pt-0 sm:px-6">
            <div className="w-12 h-12 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center text-gold mx-auto mb-4">
              <Scissors className="w-5 h-5" />
            </div>
            <h3 className="text-base font-serif font-bold text-white mb-2">
              Lusca &middot; Men&rsquo;s Barbering
            </h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Zero-gap skin fades, tapers, scissor crop cuts, hot-towel straight-razor shaves, and precision beard sculpting.
            </p>
          </div>

          <div className="pt-6 sm:pt-0 sm:px-6">
            <div className="w-12 h-12 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center text-gold mx-auto mb-4">
              <Scissors className="w-5 h-5" />
            </div>
            <h3 className="text-base font-serif font-bold text-white mb-2">
              Mika &middot; Women&rsquo;s Braids &amp; Locs
            </h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Tension-free knotless braids, stitch feed-in cornrows, bohemian human-hair curls, and dreadlock retwists.
            </p>
          </div>

          <div className="pt-6 sm:pt-0 sm:px-6">
            <div className="w-12 h-12 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center text-gold mx-auto mb-4">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="text-base font-serif font-bold text-white mb-2">
              Dedicated Booking &amp; Models
            </h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              When you reserve, you select either Lusca or Mika and browse only the models and services crafted by your specialist.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
