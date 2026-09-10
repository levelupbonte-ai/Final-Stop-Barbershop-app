export interface PageSEO {
  title: string;
  description: string;
  canonicalPath?: string;
  keywords?: string;
}

export const SEO_DATA: Record<string, PageSEO> = {
  home: {
    title: 'Final Stop Barber Shop & Salon | Master Haircuts & Protective Braids | San Diego CA',
    description: 'San Diego’s premier unisex barber shop and hair artistry lounge. Mika (master braider for women’s & girls’ knotless braids, cornrows & locs) and Lusca (master barber in precision fades, beard sculpting & boys’ cuts) at 4748 University Ave.',
    canonicalPath: '/',
    keywords: 'final stop barber shop, barber shop san diego, unisex hair salon san diego, braids san diego, knotless braids university ave, dreadlocks retwist san diego, skin fade san diego, black barber shop san diego, finalstop.org'
  },
  booking: {
    title: 'Book an Appointment Online | Final Stop Barber Shop & Salon | finalstop.org',
    description: 'Book your chair online with master barber Mika or Lusca. Choose precision skin fades, beard sculpting, loc maintenance, or custom braids at Final Stop in San Diego.',
    canonicalPath: '/#booking',
    keywords: 'book barber san diego, barber appointment university ave, braid booking san diego, final stop booking'
  },
  services: {
    title: 'Services & Pricing Menu | Fades, Braids, Locs & Beards | Final Stop Barber Shop',
    description: 'View full haircut, shave, and hair pricing in San Diego: zero skin fades, hot lather razor shaves, women’s & girls’ knotless braids, dreadlocks, and youth cuts.',
    canonicalPath: '/#services',
    keywords: 'barber prices san diego, braid prices san diego, haircut cost university ave, hair salon price list'
  },
  barbers: {
    title: 'Master Barbers Mika & Lusca | Final Stop Barber Shop San Diego',
    description: 'Meet Mika and Lusca, two master hair artists in African-American hair craft, razor fading, protective braids, and locs.',
    canonicalPath: '/#barbers',
    keywords: 'best barbers in san diego, master braider san diego, mika braids, lusca barber, barber san diego'
  },
  'barber-profile': {
    title: 'Barber Profile & Portfolio | Mika & Lusca | Final Stop Barber Shop',
    description: 'Explore the dedicated portfolio, technique specialties, and client cuts of Mika (master braider) and Lusca (master barber) at Final Stop Barber Shop.',
    canonicalPath: '/#barber-profile',
    keywords: 'mika braids san diego, lusca fade san diego, barber profile'
  },
  waitlist: {
    title: 'Live Walk-In Queue & Real-Time Wait Times | Final Stop Barber Shop',
    description: 'Check into our live digital walk-in queue or track your position in real-time before walking into our San Diego barber shop on University Ave.',
    canonicalPath: '/#waitlist',
    keywords: 'walk in barber san diego, barber waitlist online, no appointment barber san diego'
  },
  gallery: {
    title: 'Signature Hair Portfolio | Protective Braids & Razor Fades | Final Stop Barber Shop',
    description: 'Inspect our portfolio of client transformations: waist-length knotless braids, designer cornrows, sharp zero fades, and sculpted beards by Mika and Lusca.',
    canonicalPath: '/#gallery',
    keywords: 'barber portfolio san diego, braid styles gallery, fade haircuts pictures san diego'
  },
  reviews: {
    title: 'Client Reviews & Ratings (4.9 Stars) | Final Stop Barber Shop San Diego',
    description: 'Read real verified client reviews for Final Stop Barber Shop. Loved for gentle braiding by Mika, crisp razor lines by Lusca, and our welcoming community atmosphere.',
    canonicalPath: '/#reviews',
    keywords: 'final stop barber shop reviews, best reviewed barber san diego, customer ratings'
  },
  route: {
    title: 'Directions, Map & Parking | 4748 University Ave | Final Stop Barber Shop',
    description: 'Get turn-by-turn directions, bus routes, and parking details for Final Stop Barber Shop located at 4748 University Ave, San Diego, CA 92105.',
    canonicalPath: '/#route',
    keywords: 'final stop barber shop location, university ave barber shop directions, parking near 4748 university ave'
  },
  admin: {
    title: 'Staff & Owner Management Portal | Final Stop Barber Shop',
    description: 'Administrative portal for Final Stop Barber Shop staff to manage confirmed reservations, live walk-in desk, and photo database.',
    canonicalPath: '/admin',
    keywords: 'admin portal, staff management'
  }
};

/**
 * Dynamically updates document title and SEO meta tags
 */
export function updateDocumentSEO(view: string, customTitle?: string, customDescription?: string) {
  if (typeof document === 'undefined') return;

  const data = SEO_DATA[view] || SEO_DATA.home;
  const title = customTitle || data.title;
  const description = customDescription || data.description;
  const canonicalUrl = `https://finalstop.org${data.canonicalPath || '/'}`;

  // 1. Document Title
  document.title = title;

  // 2. Meta description
  let metaDesc = document.querySelector('meta[name="description"]');
  if (!metaDesc) {
    metaDesc = document.createElement('meta');
    metaDesc.setAttribute('name', 'description');
    document.head.appendChild(metaDesc);
  }
  metaDesc.setAttribute('content', description);

  // 3. Meta keywords
  if (data.keywords) {
    let metaKeywords = document.querySelector('meta[name="keywords"]');
    if (!metaKeywords) {
      metaKeywords = document.createElement('meta');
      metaKeywords.setAttribute('name', 'keywords');
      document.head.appendChild(metaKeywords);
    }
    metaKeywords.setAttribute('content', data.keywords);
  }

  // 4. OpenGraph Title
  let ogTitle = document.querySelector('meta[property="og:title"]');
  if (!ogTitle) {
    ogTitle = document.createElement('meta');
    ogTitle.setAttribute('property', 'og:title');
    document.head.appendChild(ogTitle);
  }
  ogTitle.setAttribute('content', title);

  // 5. OpenGraph Description
  let ogDesc = document.querySelector('meta[property="og:description"]');
  if (!ogDesc) {
    ogDesc = document.createElement('meta');
    ogDesc.setAttribute('property', 'og:description');
    document.head.appendChild(ogDesc);
  }
  ogDesc.setAttribute('content', description);

  // 6. OpenGraph URL
  let ogUrl = document.querySelector('meta[property="og:url"]');
  if (!ogUrl) {
    ogUrl = document.createElement('meta');
    ogUrl.setAttribute('property', 'og:url');
    document.head.appendChild(ogUrl);
  }
  ogUrl.setAttribute('content', canonicalUrl);

  // 7. Canonical Link
  let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (!canonicalLink) {
    canonicalLink = document.createElement('link');
    canonicalLink.setAttribute('rel', 'canonical');
    document.head.appendChild(canonicalLink);
  }
  canonicalLink.setAttribute('href', canonicalUrl);

  // 8. Twitter Meta Tags
  let twTitle = document.querySelector('meta[name="twitter:title"]');
  if (!twTitle) {
    twTitle = document.createElement('meta');
    twTitle.setAttribute('name', 'twitter:title');
    document.head.appendChild(twTitle);
  }
  twTitle.setAttribute('content', title);

  let twDesc = document.querySelector('meta[name="twitter:description"]');
  if (!twDesc) {
    twDesc = document.createElement('meta');
    twDesc.setAttribute('name', 'twitter:description');
    document.head.appendChild(twDesc);
  }
  twDesc.setAttribute('content', description);
}
