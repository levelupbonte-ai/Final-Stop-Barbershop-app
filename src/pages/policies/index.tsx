import {
  Shield,
  AlertCircle,
  Clock,
  HeartHandshake,
  CheckCircle2,
  Scissors,
  Phone,
  Calendar,
  ArrowUpRight,
} from 'lucide-react';
import { motion } from 'motion/react';
import { useSiteData } from '../../lib/site/SiteDataProvider';

interface PoliciesPageProps {
  onNavigateToBooking: () => void;
  onOpenCallModal: () => void;
}

export default function PoliciesPage({
  onNavigateToBooking,
  onOpenCallModal,
}: PoliciesPageProps) {
  const { site } = useSiteData();
  const phoneList = site.contact.phones.map((p) => `${p.label}: ${p.display}`).join(' · ');

  const policySections = [
    {
      index: '01',
      icon: Shield,
      kicker: 'State Board Compliance',
      title: 'Hospital-Grade Hygiene & Sterilization',
      summary:
        'The health and safety of our guests is paramount. We adhere to rigorous California State Board of Barbering & Cosmetology protocols before and after every chair session.',
      points: [
        {
          type: 'check' as const,
          label: 'Single-Use Straight Razor Blades:',
          text: 'A brand-new surgical steel razor blade is unwrapped in front of you for every neck shave, beard line-up, and edge finish.',
        },
        {
          type: 'check' as const,
          label: 'Autoclave & Barbicide Disinfection:',
          text: 'All metal shears, clipper blades, guards, and combs undergo hospital-grade disinfection between every client.',
        },
        {
          type: 'check' as const,
          label: 'Fresh Linen & Sanitary Strips:',
          text: 'Freshly laundered capes and single-use sanitary neck strips are used for every visitor.',
        },
      ],
    },
    {
      index: '02',
      icon: Scissors,
      kicker: 'Braids, Locs & Precision Cuts',
      title: 'Hair Preparedness & Scalp Health',
      summary:
        'To achieve long-lasting, immaculate protective styling and precision cutting, we ask every guest to prepare their hair and scalp prior to sitting in the chair.',
      points: [
        {
          type: 'check' as const,
          label: 'For Braids & Locs (Mika):',
          text: 'Hair must arrive freshly washed, fully detangled, and dry (free of heavy glues, heavy grease, or synthetic bonding residue) unless a wash add-on was reserved.',
        },
        {
          type: 'alert' as const,
          label: 'Scalp Health & Contagion Safety:',
          text: 'Guests exhibiting open sores or active contagious scalp conditions cannot be serviced for community safety compliance and will be politely rescheduled.',
        },
      ],
    },
    {
      index: '03',
      icon: Clock,
      kicker: 'Time & Chair Respect',
      title: 'Punctuality & 15-Minute Grace Period',
      summary:
        'We respect your schedule and the dedicated craft time of our master artisans so every appointment receives unhurried attention.',
      points: [
        {
          type: 'check' as const,
          label: 'Arrival Window:',
          text: 'Please arrive 5 minutes prior to your scheduled reservation time to settle into our climate-controlled lounge.',
        },
        {
          type: 'alert' as const,
          label: '15-Minute Grace Period:',
          text: 'If you are more than 15 minutes late without phone notice, your reserved chair may be released to the next guest in our live walk-in queue.',
        },
        {
          type: 'check' as const,
          label: 'Free Rescheduling:',
          text: `Please provide at least 2 hours notice by phone (${phoneList}) if you need to adjust or cancel your appointment.`,
        },
      ],
    },
    {
      index: '04',
      icon: HeartHandshake,
      kicker: 'Lounge Security & Etiquette',
      title: 'Children, Youth & Sanctuary Atmosphere',
      summary:
        'Final Stop Barber Shop & Salon is a peaceful, family-friendly community sanctuary welcoming women, men, girls, and boys.',
      points: [
        {
          type: 'check' as const,
          label: 'Guardian Supervision:',
          text: 'Children under the age of 12 must be accompanied by an adult guardian at all times while inside the lounge.',
        },
        {
          type: 'check' as const,
          label: 'Chair Safety Around Blades:',
          text: 'For safety around high-speed clippers and surgical straight razors, youth guests must remain calmly seated during their service.',
        },
        {
          type: 'check' as const,
          label: 'Mutual Respect Policy:',
          text: 'Zero tolerance for harassment, disruptive behavior, or disrespect toward master artisans and fellow patrons.',
        },
      ],
    },
    {
      index: '05',
      icon: Shield,
      kicker: 'Zero Hidden Fees',
      title: 'Transparent Pricing & Payment Security',
      summary:
        'We believe in complete financial transparency—you never pay an online deposit to reserve your chair.',
      points: [
        {
          type: 'check' as const,
          label: '$0 Advance Deposit:',
          text: 'No credit card or deposit is charged online. Full payment is due in person at the shop only upon service completion.',
        },
        {
          type: 'check' as const,
          label: 'Accepted Payment Methods:',
          text: 'Cash, Visa, Mastercard, American Express, Apple Pay, Google Pay, and Zelle.',
        },
      ],
    },
  ];

  return (
    <div className="pt-28 sm:pt-36 pb-20 px-4 sm:px-6 max-w-6xl mx-auto w-full">
      {/* Editorial Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55 }}
        className="text-center max-w-3xl mx-auto mb-14"
      >
        <span className="text-gold text-[10px] sm:text-[11px] uppercase tracking-[0.28em] font-mono font-semibold block mb-3">
          Safety, Hygiene &amp; House Rules
        </span>
        <h1
          className="font-sans font-black uppercase tracking-tight text-white leading-[0.98] mb-5"
          style={{ fontSize: 'clamp(2.1rem, 5vw, 3.85rem)' }}
        >
          SALON SECURITY &amp;{' '}
          <span className="font-serif italic font-normal text-gold-gradient capitalize">
            Sanctuary Standards
          </span>
        </h1>
        <div className="divider-gold-fade max-w-xs mx-auto mb-5" />
        <p className="text-gray-400 text-sm sm:text-base leading-relaxed">
          Crafted to protect your health, your time, and the serene atmosphere at{' '}
          <strong className="text-white">{site.name}</strong> ({site.contact.address}).
        </p>
      </motion.div>

      {/* Sculpted Curved Policy Pavilion */}
      <div className="rounded-[2.75rem] bg-gradient-to-b from-white/[0.035] via-[#121116]/90 to-[#0B0A0E]/95 border border-white/[0.09] p-5 sm:p-10 md:p-12 shadow-[0_32px_90px_rgba(0,0,0,0.75)] relative overflow-hidden mb-14">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-[560px] h-48 bg-gold/[0.07] rounded-full blur-3xl"
        />

        <div className="relative z-10 divide-y divide-white/[0.08]">
          {policySections.map((section, idx) => {
            const Icon = section.icon;
            return (
              <motion.div
                key={section.index}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-30px' }}
                transition={{ duration: 0.45, delay: idx * 0.05 }}
                className="py-8 sm:py-10 first:pt-2 last:pb-2"
              >
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-start">
                  {/* Left Column: Number + Title + Summary */}
                  <div className="lg:col-span-5">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-xl sm:text-2xl font-serif italic text-gold/75 select-none">
                        {section.index}
                      </span>
                      <span className="w-8 h-[1px] bg-gold/30" />
                      <span className="text-[10px] font-mono uppercase tracking-[0.22em] text-gold font-semibold">
                        {section.kicker}
                      </span>
                    </div>

                    <h2 className="text-xl sm:text-2xl font-serif font-bold text-white mb-3 flex items-center gap-2.5">
                      <Icon className="w-5 h-5 text-gold shrink-0" />
                      <span>{section.title}</span>
                    </h2>

                    <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">
                      {section.summary}
                    </p>
                  </div>

                  {/* Right Column: Detailed Standards */}
                  <div className="lg:col-span-7 space-y-3.5">
                    {section.points.map((pt, i) => (
                      <div
                        key={i}
                        className="rounded-[1.5rem] bg-white/[0.02] border border-white/[0.07] px-5 py-4 flex items-start gap-3.5"
                      >
                        {pt.type === 'alert' ? (
                          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                        ) : (
                          <CheckCircle2 className="w-4 h-4 text-gold shrink-0 mt-0.5" />
                        )}
                        <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
                          <strong className="text-white font-semibold">{pt.label}</strong>{' '}
                          {pt.text}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Bottom Curved Concierge Banner */}
      <div className="card-luxury rounded-[2.5rem]! p-7 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-[0.24em] text-gold font-semibold block mb-1.5">
            Direct Artisan Assistance
          </span>
          <h3 className="text-xl sm:text-2xl font-serif font-bold text-white mb-1.5">
            Have a Question About Scalp Prep or Scheduling?
          </h3>
          <p className="text-xs sm:text-sm text-gray-400 max-w-xl">
            Reach Mika or Lusca directly before your visit, or reserve your guaranteed chair online with $0 deposit.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 shrink-0">
          <button
            type="button"
            onClick={onOpenCallModal}
            className="btn-obsidian rounded-full! px-6 py-3.5 text-xs font-mono"
          >
            <Phone className="w-3.5 h-3.5 text-gold" />
            <span>Call Direct Lines</span>
          </button>

          <button
            type="button"
            onClick={onNavigateToBooking}
            className="btn-gold rounded-full! px-7 py-3.5 text-xs font-bold uppercase tracking-wider"
          >
            <Calendar className="w-3.5 h-3.5 text-black" />
            <span>Book Chair Now</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-black" />
          </button>
        </div>
      </div>
    </div>
  );
}
