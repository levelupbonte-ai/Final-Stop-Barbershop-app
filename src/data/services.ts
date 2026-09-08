export interface ServiceItem {
  id: string;
  name: string;
  duration: string;
  price: string;
  numericPrice: number;
  category: 'Haircuts' | 'Combos' | 'Beard & Shave' | 'Lineups & Detailing' | 'Treatments';
  badge?: string;
  description: string;
  inclusions: string[];
  featured?: boolean;
}

/**
 * Official Final Stop Barber Shop & Salon Services and Real Pricing
 * Directly verified from the in-shop POS & booking terminal
 */
export const OFFICIAL_SERVICES: ServiceItem[] = [
  // 1. Haircut
  {
    id: 'haircut',
    name: 'Haircut',
    duration: '30 min',
    price: '$40',
    numericPrice: 40,
    category: 'Haircuts',
    badge: 'Popular',
    featured: true,
    description: 'Precision clipper and shear haircut tailored to your cranial shape, finished with neck cleanup and styling.',
    inclusions: [
      'Morphology and style consultation',
      'Clipper and shear custom haircut',
      'Clean razor neck tape & talc finish',
      'Matte clay or grooming pomade styling'
    ]
  },
  // 2. Men's haircut
  {
    id: 'mens-haircut',
    name: "Men's haircut",
    duration: '30 min',
    price: '$40',
    numericPrice: 40,
    category: 'Haircuts',
    description: 'Classic or contemporary men’s cut with detailed scissor over comb, tapering, and crisp outline.',
    inclusions: [
      'Tailored haircut to your exact preference',
      'Scissor layering and texturizing',
      'Crisp neckline lineup',
      'Styling product application'
    ]
  },
  // 3. Skin fade
  {
    id: 'skin-fade',
    name: 'Skin fade',
    duration: '30 min',
    price: '$35',
    numericPrice: 35,
    category: 'Haircuts',
    badge: 'Specialty',
    featured: true,
    description: 'Millimeter zero-gap skin fade (Low, Mid, High, or Taper) smoothly blended into your desired top length.',
    inclusions: [
      'Surgical foil shaver zero-skin fade',
      'Seamless gradient transition',
      'Razor lineup on temples and neckline',
      'Cooling aftershave splash'
    ]
  },
  // 4. Haircut & beard
  {
    id: 'haircut-beard',
    name: 'Haircut & beard',
    duration: '45 min',
    price: '$50',
    numericPrice: 50,
    category: 'Combos',
    badge: 'Best Value',
    featured: true,
    description: 'The premier combo: customized precision haircut paired with complete beard grooming and sharp lines.',
    inclusions: [
      'Custom haircut & fade of choice',
      'Full beard shaping, debulking & length trim',
      'Razor lines on cheeks and neckline',
      'Nourishing beard oil & styling balm'
    ]
  },
  // 5. Kid's haircut
  {
    id: 'kids-haircut',
    name: "Kid's haircut",
    duration: '30 min',
    price: '$30',
    numericPrice: 30,
    category: 'Haircuts',
    badge: 'Youth',
    featured: true,
    description: 'Patient, gentle, and stylish precision cut for kids and young teens with clean lines and sharp styling.',
    inclusions: [
      'Kid-friendly consultation and gentle technique',
      'Modern style, taper or fade',
      'Clean hairline touch-up',
      'Kid-approved lightweight styling'
    ]
  },
  // 6. Buzz cut
  {
    id: 'buzz-cut',
    name: 'Buzz cut',
    duration: '30 min',
    price: '$30',
    numericPrice: 30,
    category: 'Haircuts',
    description: 'Even uniform clipper cut across the scalp with crisp temple and neckline taper.',
    inclusions: [
      'Even guard clipper cut across head',
      'Neckline contour and taper',
      'Razor clean-up around ears'
    ]
  },
  // 7. Shaved head
  {
    id: 'shaved-head',
    name: 'Shaved head',
    duration: '30 min',
    price: '$30',
    numericPrice: 30,
    category: 'Haircuts',
    description: 'Ultra-close head shave with electric foil shavers or clippers for a smooth, clean finish.',
    inclusions: [
      'Close head shave down to skin',
      'Exfoliating scalp cleanup',
      'Soothing toner and moisture balm'
    ]
  },
  // 8. Head shave
  {
    id: 'head-shave',
    name: 'Head shave',
    duration: '30 min',
    price: '$40',
    numericPrice: 40,
    category: 'Haircuts',
    description: 'Complete smooth head shave with warm preparation, close shave precision, and cooling scalp balm.',
    inclusions: [
      'Warm lather and scalp preparation',
      'Close precision head shave',
      'Cold towel refresh',
      'Hydrating scalp balm'
    ]
  },
  // 9. Head shave & beard trim
  {
    id: 'head-shave-beard-trim',
    name: 'Head shave & beard trim',
    duration: '45 min',
    price: '$40',
    numericPrice: 40,
    category: 'Combos',
    description: 'Total head shave paired with architectural beard trimming, shaping, and razor contouring.',
    inclusions: [
      'Full head shave with close finish',
      'Beard length debulking and contouring',
      'Cheek and neck lines sharpened',
      'Beard conditioning oil'
    ]
  },
  // 10. Full service
  {
    id: 'full-service',
    name: 'Full service',
    duration: '1h',
    price: '$60',
    numericPrice: 60,
    category: 'Combos',
    badge: 'All-In-One',
    featured: true,
    description: 'The all-inclusive grooming experience: tailored haircut, full beard sculpting, hot towel, and styling.',
    inclusions: [
      'Tailored haircut & zero skin fade',
      'Complete beard sculpting & shaping',
      'Hot towel steam relaxation',
      'Straight razor contour detailing',
      'Premium blow dry & product styling'
    ]
  },
  // 11. Hot towel shave
  {
    id: 'hot-towel-shave',
    name: 'Hot towel shave',
    duration: '30 min',
    price: '$100',
    numericPrice: 100,
    category: 'Beard & Shave',
    badge: 'Luxury Ritual',
    featured: true,
    description: 'The ultimate barbershop ritual: dual steamed eucalyptus towels, whipped warm lather, and master razor shave.',
    inclusions: [
      'Aromatic eucalyptus hot towel steam',
      'Rich whipped warm shave cream lather',
      'Master Japanese steel straight razor shave',
      'Cold towel pore-closure and aftershave tonic'
    ]
  },
  // 12. Straight razor shave
  {
    id: 'straight-razor-shave',
    name: 'Straight razor shave',
    duration: '30 min',
    price: '$60',
    numericPrice: 60,
    category: 'Beard & Shave',
    featured: true,
    description: 'Traditional straight razor shave with rich lather, smooth blade passes, and calming skin balm.',
    inclusions: [
      'Pre-shave essential oil application',
      'Traditional warm lather application',
      'Straight razor shave with the grain and against',
      'Soothing alcohol-free post-shave balm'
    ]
  },
  // 13. Beard
  {
    id: 'beard',
    name: 'Beard',
    duration: '15 min',
    price: '$30',
    numericPrice: 30,
    category: 'Beard & Shave',
    description: 'Comprehensive beard service including length reduction, shaping, and clean perimeter lines.',
    inclusions: [
      'Clipper and shear beard sculpting',
      'Edge clean-up on cheeks and neck',
      'Conditioning beard oil'
    ]
  },
  // 14. Beard shaping
  {
    id: 'beard-shaping',
    name: 'Beard shaping',
    duration: '15 min',
    price: '$20',
    numericPrice: 20,
    category: 'Beard & Shave',
    description: 'Architectural shaping of beard contours, cheek fade, mustache trimming, and jawline definition.',
    inclusions: [
      'Precision symmetry alignment',
      'Cheek and neck perimeter lines',
      'Mustache neat trim',
      'Finishing balm'
    ]
  },
  // 15. Beard trim
  {
    id: 'beard-trim',
    name: 'Beard trim',
    duration: '15 min',
    price: '$20',
    numericPrice: 20,
    category: 'Beard & Shave',
    description: 'Fast, clean length reduction and symmetry balance to keep your beard neat and disciplined.',
    inclusions: [
      'Uniform guard or freehand trim',
      'Stray flyaway reduction',
      'Mustache touch-up'
    ]
  },
  // 16. Beard shave
  {
    id: 'beard-shave',
    name: 'Beard shave',
    duration: '15 min',
    price: '$20',
    numericPrice: 20,
    category: 'Beard & Shave',
    description: 'Quick clean razor or foil shave of facial hair down to smooth bare skin.',
    inclusions: [
      'Fast close shave of facial hair',
      'Neckline cleanup',
      'Soothing aftershave lotion'
    ]
  },
  // 17. Beard maintenance
  {
    id: 'beard-maintenance',
    name: 'Beard maintenance',
    duration: '15 min',
    price: '$20',
    numericPrice: 20,
    category: 'Beard & Shave',
    description: 'Routine upkeep: edge correction, stray trimming, comb-through hydration, and shape preservation.',
    inclusions: [
      'Contour alignment check',
      'Split end and stray clipping',
      'Hydrating beard butter massage'
    ]
  },
  // 18. Beard grooming
  {
    id: 'beard-grooming',
    name: 'Beard grooming',
    duration: '15 min',
    price: '$20',
    numericPrice: 20,
    category: 'Beard & Shave',
    description: 'Deep comb-out, detangling, shaping, and premium oil infusion for a soft, lustrous beard.',
    inclusions: [
      'Detangle and deep brush-through',
      'Sculpted perimeter detailing',
      'Argan & jojoba oil conditioning'
    ]
  },
  // 19. Line up
  {
    id: 'line-up',
    name: 'Line up',
    duration: '20 min',
    price: '$20',
    numericPrice: 20,
    category: 'Lineups & Detailing',
    description: 'Razor-sharp perimeter lineup around front forehead, temples, c-cups, and back neckline.',
    inclusions: [
      'Crisp zero-gapped trimmer outlining',
      'Straight razor box or curve detailing',
      'Soothing talc and toner wipe'
    ]
  },
  // 20. Edge up
  {
    id: 'edge-up',
    name: 'Edge up',
    duration: '15 min',
    price: '$20',
    numericPrice: 20,
    category: 'Lineups & Detailing',
    description: 'Quick perimeter cleanup to sharpen edges between full haircut appointments.',
    inclusions: [
      'Frontline and temple edge sharpening',
      'Neckline cleanup',
      'Clean trimmer finish'
    ]
  },
  // 21. Shape up
  {
    id: 'shape-up',
    name: 'Shape up',
    duration: '30 min',
    price: '$20',
    numericPrice: 20,
    category: 'Lineups & Detailing',
    description: 'Complete perimeter shape-up with razor detailing and slight neck fade blending.',
    inclusions: [
      'Full perimeter geometric outline',
      'Razor detailing',
      'Mini neck taper refresh'
    ]
  },
  // 22. Design
  {
    id: 'design',
    name: 'Design',
    duration: '30 min',
    price: '$20',
    numericPrice: 20,
    category: 'Lineups & Detailing',
    badge: 'Artisan',
    description: 'Custom freestyle hair artwork, geometric parts, razor slashes, or custom requested patterns.',
    inclusions: [
      'Freestyle or reference design consultation',
      'Trimmer and straight razor detailing',
      'Clean fade shadow integration'
    ]
  },
  // 23. Eyebrow shaping
  {
    id: 'eyebrow-shaping',
    name: 'Eyebrow shaping',
    duration: '10 min',
    price: '$20',
    numericPrice: 20,
    category: 'Lineups & Detailing',
    description: 'Straight razor or shear trimming and arch cleanup for symmetrical, tidy eyebrows.',
    inclusions: [
      'Length trimming and unruly hair removal',
      'Straight razor brow arch cleanup',
      'Soothing aloe gel'
    ]
  },
  // 24. Hair wash
  {
    id: 'hair-wash',
    name: 'Hair wash',
    duration: '10 min',
    price: '$20',
    numericPrice: 20,
    category: 'Treatments',
    description: 'Invigorating shampoo and scalp massage using professional clarifying and hydrating products.',
    inclusions: [
      'Warm water clarifying shampoo',
      'Deep scalp massage and rinse',
      'Lightweight conditioner & towel dry'
    ]
  },
  // 25. Facial
  {
    id: 'facial',
    name: 'Facial',
    duration: '30 min',
    price: '$30',
    numericPrice: 30,
    category: 'Treatments',
    badge: 'Relaxation',
    description: 'Deep pore cleansing, warm steam treatment, facial mask, and cold towel finish for fresh skin.',
    inclusions: [
      'Warm steam facial opening',
      'Gentle exfoliating cleanse',
      'Detox facial mask',
      'Cold towel pore tightening and moisturizer'
    ]
  }
];
