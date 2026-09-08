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
    role: 'Lead Master Barber & Co-Founder',
    experience: 'Plus de 20 ans d’expérience',
    experienceYears: 21,
    initials: 'MK',
    badge: 'Maître Dégradé & Rasoir',
    tagline: 'Précision chirurgicale, dégradés à blanc zéro millimètre & finitions au rasoir coupe-chou.',
    bio: 'Avec plus de 20 années d’exercice ininterrompu au sommet de l’artisanat barbier, Mika a forgé sa réputation à San Diego par son souci obsessionnel du détail géométrique. Formé auprès des meilleurs maîtres barbiers internationaux, il a réalisé plus de 15 000 coupes sur mesure. Spécialiste incontesté des Skin Fades chirurgicaux, des contours au millimètre et des tailles de barbe structurées.',
    specialty: 'Expertise suprême en dégradés américains (Skin Fade, Taper Fade, Burst Fade), alignements au rasoir droit traditionnel et coiffage texturé haute définition.',
    tags: ['Skin Fade Chirurgical', 'Rasoir Coupe-Chou', 'Contours Ultra-Nets', '20+ Ans d\'Expérience'],
    highlights: [
      'Plus de 20 ans d’artisanat barbier haute précision',
      'Plus de 15 000 clients satisfaits à San Diego',
      'Maîtrise absolue du rasoir traditionnel et serviettes chaudes',
      'Noté 5.0 étoiles sur Google avec plus de 380 avis'
    ],
    signatureTechniques: [
      {
        title: 'Zero Gap Skin Fade',
        description: 'Transition imperceptible du blanc absolu de la peau vers le volume supérieur, travaillée au clipper zéro et shaver foil.'
      },
      {
        title: 'Straight Razor Lineup',
        description: 'Finitions des tempes, pommettes et nuque au rasoir traditionnel à lame japonaise avec talc protecteur.'
      },
      {
        title: 'Signature Beard Contour',
        description: 'Sculpture des lignes de la barbe selon la morphologie maxillo-faciale pour un rendu net et viril.'
      }
    ],
    portfolioCuts: [
      {
        title: 'Mid Skin Fade & Textured Crop',
        tag: 'Skin Fade',
        image: 'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?auto=format&fit=crop&q=80&w=800'
      },
      {
        title: 'Low Drop Fade & Structured Beard',
        tag: 'Beard + Fade',
        image: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&q=80&w=800'
      },
      {
        title: 'Taper Fade & Natural Wave Styling',
        tag: 'Precision Cut',
        image: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80&w=800'
      }
    ],
    clientReviews: [
      {
        author: 'Antoine V.',
        date: 'Il y a 3 jours',
        rating: 5,
        comment: 'Mika a plus de 20 ans de métier et ça se sent dès le premier coup de tondeuse. Le skin fade est d’une propreté chirurgicale, les contours sont impeccables.'
      },
      {
        author: 'Julian M.',
        date: 'Il y a 1 semaine',
        rating: 5,
        comment: 'Le meilleur barbier de San Diego, sans discussion possible. Jamais déçu depuis 4 ans que je viens chez Mika.'
      }
    ]
  },
  {
    id: 'lusca',
    name: 'Lusca',
    role: 'Artisan Master Barber & Spécialiste Barbe & Textures',
    experience: 'Plus de 20 ans d’expérience',
    experienceYears: 20,
    initials: 'LC',
    badge: 'Maître Barbe, Soins & Textures',
    tagline: 'Sculpture traditionnelle de la barbe, rituel serviette chaude eucalyptus, braids & soins profonds.',
    bio: 'Lusca cumule plus de deux décennies d’expertise consacrée à l’art du rasage classique, au soin de la barbe et à la maîtrise des cheveux texturés, tresses et dreadlocks. Véritable artisan du bien-être masculin, il allie rituels de vapeur à l’eucalyptus, huiles végétales pures et taille millimétrique pour transformer chaque passage au fauteuil en expérience VIP ressourçante.',
    specialty: 'Sculpture de barbe millimétrée, rasage traditionnel au savon chaud, braids artistiques, retwist dreadlocks et soins réparateurs du cuir chevelu.',
    tags: ['Sculpture de Barbe', 'Serviettes Chaudes Eucalyptus', 'Braids & Dreads', '20+ Ans d\'Expérience'],
    highlights: [
      'Plus de 20 ans d’expérience en coiffure masculine et barbering traditionnel',
      'Spécialiste agréé en cheveux afro, texturés, dreadlocks et tresses',
      'Rituel de vapeur aromathérapie et soins botaniques organiques',
      'Reconnu pour sa régularité et son accueil personnalisé'
    ],
    signatureTechniques: [
      {
        title: 'Rituel Rasage Chaud Eucalyptus',
        description: 'Double passage de serviettes imprégnées d’eucalyptus vapeur, mousse tiède montée au blaireau et rasoir droit.'
      },
      {
        title: 'Bespoke Beard Sculpting',
        description: 'Taille sculptée aux ciseaux et tondeuse avec fondu de barbe et baume nourrissant aux beurres naturels.'
      },
      {
        title: 'Braids & Cornrows Précision',
        description: 'Tracés géométriques parfaits, tension équilibrée pour protéger le cuir chevelu et tenue longue durée.'
      }
    ],
    portfolioCuts: [
      {
        title: 'Sculpted Full Beard & Hot Lather Finish',
        tag: 'Barbe & Soin',
        image: 'https://images.unsplash.com/photo-1517832606589-7629c3397143?auto=format&fit=crop&q=80&w=800'
      },
      {
        title: 'Geometric Cornrows & Scalp Care',
        tag: 'Braids',
        image: 'https://images.unsplash.com/photo-1605497788044-5a32c7078486?auto=format&fit=crop&q=80&w=800'
      },
      {
        title: 'Dreadlocks Retwist & Clean Taper',
        tag: 'Locs & Taper',
        image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&q=80&w=800'
      }
    ],
    clientReviews: [
      {
        author: 'Darnell W.',
        date: 'Il y a 5 jours',
        rating: 5,
        comment: 'Lusca est un véritable maître. 20 ans d’expérience qui se ressentent dans le calme, la précision et le rituel serviette chaude. Mes tresses et ma barbe n’ont jamais été aussi nettes.'
      },
      {
        author: 'Kevin S.',
        date: 'Il y a 2 semaines',
        rating: 5,
        comment: 'Très pro, ponctuel et soucieux du détail. Lusca prend le temps d’écouter et le résultat est juste parfait.'
      }
    ]
  }
];
