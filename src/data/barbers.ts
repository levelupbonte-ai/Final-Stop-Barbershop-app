export interface BarberProfile {
  id: 'mika' | 'lusca';
  name: string;
  role: string;
  experience: string;
  experienceYears: number;
  initials: string;
  badge: string;
  tagline: string;
  bio: string;
  specialty: string;
  tags: string[];
  signatureTechniques: {
    title: string;
    description: string;
  }[];
  portfolioCuts: {
    title: string;
    tag: string;
    image: string;
    description: string;
  }[];
  highlights: string[];
  clientReviews: {
    author: string;
    date: string;
    rating: number;
    comment: string;
  }[];
}

export const MASTER_BARBERS: BarberProfile[] = [
  {
    id: 'mika',
    name: 'Mika',
    role: 'Master Braider, Locs & Texture Artisan',
    experience: 'Over 20 Years of Experience',
    experienceYears: 21,
    initials: 'MK',
    badge: 'Master of Women’s Braids, Cornrows & Locs',
    tagline: 'Artisan braids, knotless protective styles, designer cornrows, and scalp-preserving tension.',
    bio: 'With over 20 continuous years of dedicated artistry, Mika is renowned across San Diego as the master braider and protective styling specialist. Meticulous parting, gentle tension calibrated to protect sensitive hairlines, and breathtaking geometric designs define Mika\'s craft. Whether creating flowing knotless box braids, elaborate goddess locs, or sleek feed-in cornrows, clients leave with healthy scalps and enduring elegance.',
    specialty: 'Mastery of women’s & girls’ braids: Knotless box braids, designer feed-in cornrows, goddess locs, braided updos, twist retwists, and organic scalp hydration rituals.',
    tags: ['Knotless Braids', 'Designer Cornrows', 'Goddess Locs', '20+ Yrs Experience'],
    highlights: [
      'Over 20 years of specialized mastery in braids, cornrows & protective styling',
      'Scalp-safe tension technique preventing breakage and edge damage',
      'Signature organic botanical oils & restorative hydration treatments',
      'Rated 5.0 stars with hundreds of loyal clients across Southern California'
    ],
    signatureTechniques: [
      {
        title: 'Featherlight Knotless Parting',
        description: 'Zero-tension root construction that lays completely flat from day one without pulling on delicate baby hairs or scalp follicles.'
      },
      {
        title: 'Symmetrical Geometric Cornrows',
        description: 'Laser-straight and swirl feed-in parting with tailored scalp geometry that holds crisp definition for weeks.'
      },
      {
        title: 'Boho Goddess Loc Sculpting',
        description: 'Seamless blending of natural loc textures with organic curl accents and lightweight synthetic extensions.'
      }
    ],
    portfolioCuts: [
      {
        title: 'Waist-Length Knotless Box Braids',
        tag: 'Knotless Braids',
        image: 'https://i.ibb.co/cXxD5MpB/Chat-GPT-Image-6-sept-2026-15-56-42.png',
        description: 'Tension-free knotless box braids with polished, feather-light extensions for effortless, graceful movement.'
      },
      {
        title: 'Swirl Cornrows & Geometric Spiral Braids',
        tag: 'Designer Cornrows',
        image: 'https://i.ibb.co/xq8zMm2t/Chat-GPT-Image-6-sept-2026-15-55-41.png',
        description: 'Intricate swirl pattern cornrows flowing symmetrically around the crown with zero frizz and clean edges.'
      },
      {
        title: 'Sleek High Braided Ponytail & Cornrow Crown',
        tag: 'Braided Updo',
        image: 'https://i.ibb.co/d4N6qCDJ/Chat-GPT-Image-Sep-6-2026-03-39-13-PM-1.png',
        description: 'High braided ponytail with symmetrical scalp feed-in cornrows and mirror glass-shine finish.'
      },
      {
        title: 'Burgundy Goddess Locs & Edge Styling',
        tag: 'Goddess Locs',
        image: 'https://i.ibb.co/zhXtNXB4/Chat-GPT-Image-Sep-6-2026-03-38-30-PM-1.png',
        description: 'Vibrant rich burgundy locs styled with curly accent ends and sculpted baby hair swoops.'
      },
      {
        title: 'Bohemian Soft Curls & Feed-In Braids',
        tag: 'Protective Style',
        image: 'https://images.unsplash.com/photo-1589156280159-27698a70f29e?auto=format&fit=crop&q=80&w=800',
        description: 'Lush bohemian feed-in braids accented with cascading soft curls and nourishing scalp oil.'
      }
    ],
    clientReviews: [
      {
        author: 'Aaliyah M.',
        date: '3 days ago',
        rating: 5,
        comment: 'Mika has over 20 years of experience and you feel it immediately. My knotless braids had zero pain or tension, and the parts are mathematically perfect!'
      },
      {
        author: 'Keisha T.',
        date: '1 week ago',
        rating: 5,
        comment: 'Best braider in San Diego! Mika did my goddess locs for my sister\'s wedding and I received compliments for weeks.'
      }
    ]
  },
  {
    id: 'lusca',
    name: 'Lusca',
    role: 'Lead Master Barber & Men’s Haircut Specialist',
    experience: 'Over 20 Years of Experience',
    experienceYears: 20,
    initials: 'LC',
    badge: 'Master of Men’s Cuts, Zero Fades & Razor Work',
    tagline: 'Surgical zero skin fades, precision men’s & boys’ haircuts, and traditional hot towel shaves.',
    bio: 'With over two decades at the chair, Lusca is renowned across San Diego for millimeter-exact clipper work, flawless fade transitions, and classic straight razor shaves. Having performed tens of thousands of custom cuts for men and boys, Lusca pairs traditional Japanese steel blade contouring with warm eucalyptus hot towel therapy for the quintessential barber shop experience.',
    specialty: 'Mastery of men\'s and boys\' haircuts: Skin Fades, Drop Fades, Taper Fades, Burst Fades, architectural beard sculpting, straight razor neck lineups, and textured shear crops.',
    tags: ['Skin Fade', 'Men’s & Boys’ Cuts', 'Beard Architecture', '20+ Yrs Experience'],
    highlights: [
      'Over 20 years of master craftsmanship in precision haircuts and straight razor shaves',
      'Specialist in boys’ haircuts, teen styles, and executive men’s grooming',
      'Dual eucalyptus hot towel ritual with rich whipped warm lather',
      'Over 15,000 satisfied clients throughout San Diego'
    ],
    signatureTechniques: [
      {
        title: 'Zero-Gap Skin Fade',
        description: 'Seamless optical blur transitioning from genuine bare skin to rich crown volume using foil shavers and precision magnetic guards.'
      },
      {
        title: 'Architectural Beard Sculpting',
        description: 'Freehand shear sculpting and clipper fading tailored to jawline morphology, completed with nourishing cedarwood oils.'
      },
      {
        title: 'Straight Razor Hot Towel Shave',
        description: 'Classic double eucalyptus hot steam towels, rich badger-hair lather, and single-pass Japanese steel razor contouring.'
      }
    ],
    portfolioCuts: [
      {
        title: 'Mid Skin Fade & Textured Crop',
        tag: 'Skin Fade',
        image: 'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?auto=format&fit=crop&q=80&w=800',
        description: 'Seamless skin blur transitioning smoothly into a textured top with razor-sharp temple lines.'
      },
      {
        title: 'Low Drop Fade & Structured Beard',
        tag: 'Beard + Fade',
        image: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&q=80&w=800',
        description: 'Low curved drop fade contouring the ear and blending cleanly into a sculpted beard gradient.'
      },
      {
        title: 'Twisted Locs with High Taper Fade & Beard Lineup',
        tag: 'Taper Fade + Cut',
        image: 'https://i.ibb.co/20Ns74Tz/Chat-GPT-Image-6-sept-2026-15-53-44.png',
        description: 'High temple taper fade paired with sharp line work and sculpted beard definition.'
      },
      {
        title: 'Executive Razor Cut & Clean Nape',
        tag: 'Executive Cut',
        image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=800',
        description: 'Classic executive shear work with hot lather razor perimeter and soothing talc finish.'
      },
      {
        title: 'Taper Fade & Waves for Boys & Men',
        tag: 'Taper Fade',
        image: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80&w=800',
        description: 'Subtle temple and neck tapers preserving side density with high-definition wave polish.'
      }
    ],
    clientReviews: [
      {
        author: 'Marcus V.',
        date: '5 days ago',
        rating: 5,
        comment: 'Lusca has over 20 years cutting hair and you see it right away. The skin fade is like an optical illusion and the razor lines are laser straight.'
      },
      {
        author: 'Terrence K.',
        date: '2 weeks ago',
        rating: 5,
        comment: 'Brought my son for his back-to-school taper and got my beard shaped. Lusca is patient, professional, and the best barber in San Diego.'
      }
    ]
  }
];
