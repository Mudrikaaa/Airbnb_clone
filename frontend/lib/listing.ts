// Small display rules shared by the listing card and the listing page.

/** Our "Guest favourite" bar: 4.8+ average across at least 3 reviews. */
export function isGuestFavourite(rating: number | null, reviewCount: number): boolean {
  return rating !== null && rating >= 4.8 && reviewCount >= 3;
}

export function capitalise(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** "Villa in Anjuna" */
export function typeInCity(propertyType: string, city: string): string {
  return `${capitalise(propertyType)} in ${city}`;
}
