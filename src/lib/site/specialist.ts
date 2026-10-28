import type { BarberProfile, GalleryItem, ServiceItem } from '../../types/content';

export type SpecialistKey = 'lusca' | 'mika';

export interface SpecialistUniverseMeta {
  key: SpecialistKey;
  name: string;
  universeTitle: string;
  universeSubtitle: string;
  shortLabel: string;
  craftBadge: string;
  description: string;
}

export const SPECIALIST_UNIVERSES: Record<SpecialistKey, SpecialistUniverseMeta> = {
  lusca: {
    key: 'lusca',
    name: 'Lusca',
    universeTitle: "Men's Master Barbering",
    universeSubtitle: 'Precision Skin Fades · Tapers · Beard Sculpting · Razor Line-Ups',
    shortLabel: "Lusca · Men's Cuts & Fades",
    craftBadge: "Men's & Boys' Grooming Atelier",
    description:
      'Dedicated exclusively to men’s and boys’ precision haircuts, zero-gap skin fades, hot-towel straight-razor shaves, and architectural beard sculpting.'
  },
  mika: {
    key: 'mika',
    name: 'Mika',
    universeTitle: "Women's Braids, Locs & Styling",
    universeSubtitle: 'Knotless Braids · Stitch Cornrows · Boho Curls · Locs & Retwist',
    shortLabel: "Mika · Women's Braids & Locs",
    craftBadge: "Women's Protective Styling & Locs Atelier",
    description:
      'Dedicated exclusively to women’s protective styling, tension-free knotless braids, stitch feed-in cornrows, bohemian curls, and master dreadlock care.'
  }
};

const MIKA_KEYWORDS =
  /braid|knotless|cornrow|stitch|boho|bohemian|loc|dread|retwist|twist|crochet|weave|extension|protective|goddess|fulani|lemonade|box braid|senegalese|passion|women|woman|girl|ladies|femme|curl/i;

const LUSCA_KEYWORDS =
  /fade|taper|beard|shave|razor|mustache|goatee|mens|men's|gentleman|boy|edge-up|line-up|lineup|bald|buzz|caesar|crop|pompadour|grooming|clipper|scissor cut/i;

/**
 * Classifies a ServiceItem strictly into either Lusca's Men's Barbering universe
 * or Mika's Women's Braids / Locs / Protective Styling universe.
 */
export function getServiceSpecialist(service: ServiceItem): SpecialistKey {
  const pref = (service.barberPreference ?? '').toLowerCase();
  const combined = `${service.id} ${service.name} ${service.category} ${service.description}`.toLowerCase();

  // If the service name/category/description is clearly braids, locs, twists, cornrows -> Mika
  if (MIKA_KEYWORDS.test(combined) && !/beard|mens haircut|men's haircut|skin fade/i.test(combined)) {
    return 'mika';
  }

  // If explicitly assigned in DB
  if (pref.includes('mika')) return 'mika';
  if (pref.includes('lusca') || pref.includes('luska')) return 'lusca';

  if (LUSCA_KEYWORDS.test(combined)) {
    return 'lusca';
  }

  return MIKA_KEYWORDS.test(combined) ? 'mika' : 'lusca';
}

/**
 * Classifies a GalleryItem (portfolio style/model) strictly into either Lusca's
 * or Mika's universe so their models are never mixed together.
 */
export function getGalleryItemSpecialist(item: GalleryItem): SpecialistKey {
  const barber = (item.barber ?? '').toLowerCase();
  const combined = `${item.title} ${item.category} ${item.targetAudience} ${item.description}`.toLowerCase();

  // Check explicit style keywords first so no braid ends up under Lusca and no fade under Mika
  if (MIKA_KEYWORDS.test(combined) && !/beard|skin fade|taper fade/i.test(combined)) {
    return 'mika';
  }
  if (LUSCA_KEYWORDS.test(combined) && !/braid|knotless|cornrow|boho|loc|retwist/i.test(combined)) {
    return 'lusca';
  }

  if (barber.includes('mika')) return 'mika';
  if (barber.includes('lusca') || barber.includes('luska')) return 'lusca';

  return MIKA_KEYWORDS.test(combined) ? 'mika' : 'lusca';
}

/**
 * Resolves a SpecialistKey ('lusca' | 'mika') from an optional barberId, name, or service.
 */
export function resolveSpecialistKey(
  barberOrHint?: string | null,
  serviceHint?: string | null,
  services: ServiceItem[] = []
): SpecialistKey {
  if (barberOrHint) {
    const lower = barberOrHint.toLowerCase();
    if (lower.includes('mika')) return 'mika';
    if (lower.includes('lusca') || lower.includes('luska')) return 'lusca';
  }

  if (serviceHint) {
    const matched = services.find(
      (s) => s.id.toLowerCase() === serviceHint.toLowerCase() || s.name.toLowerCase() === serviceHint.toLowerCase()
    );
    if (matched) {
      return getServiceSpecialist(matched);
    }
    if (MIKA_KEYWORDS.test(serviceHint)) {
      return 'mika';
    }
    if (LUSCA_KEYWORDS.test(serviceHint)) {
      return 'lusca';
    }
  }

  return 'lusca';
}

/**
 * Finds the matching BarberProfile from Supabase data for the given SpecialistKey.
 */
export function getBarberForSpecialist(
  barbers: BarberProfile[],
  specialist: SpecialistKey
): BarberProfile | undefined {
  if (specialist === 'mika') {
    return (
      barbers.find((b) => b.id.toLowerCase().includes('mika') || b.name.toLowerCase().includes('mika')) ??
      barbers[1] ??
      barbers[0]
    );
  }
  return (
    barbers.find(
      (b) =>
        b.id.toLowerCase().includes('lusca') ||
        b.id.toLowerCase().includes('luska') ||
        b.name.toLowerCase().includes('lusca') ||
        b.name.toLowerCase().includes('luska')
    ) ?? barbers[0]
  );
}
