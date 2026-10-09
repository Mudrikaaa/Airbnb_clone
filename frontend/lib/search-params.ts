// The URL is the source of truth for search + filters. These helpers convert between
// the URL query string, a typed object the UI works with, and the backend's query params.

export type SearchState = {
  location: string;
  checkIn: string | null; // yyyy-MM-dd
  checkOut: string | null;
  adults: number;
  children: number;
  infants: number;
  pets: number;
  category: string | null;
  minPrice: number | null;
  maxPrice: number | null;
  propertyTypes: string[];
  /** Minimum bedrooms / beds / bathrooms; 0 = any. */
  bedrooms: number;
  beds: number;
  bathrooms: number;
  amenities: number[];
};

export const EMPTY_SEARCH: SearchState = {
  location: "",
  checkIn: null,
  checkOut: null,
  adults: 0,
  children: 0,
  infants: 0,
  pets: 0,
  category: null,
  minPrice: null,
  maxPrice: null,
  propertyTypes: [],
  bedrooms: 0,
  beds: 0,
  bathrooms: 0,
  amenities: [],
};

type ReadableParams = { get(name: string): string | null };

const int = (value: string | null): number | null => {
  const n = value === null ? NaN : Number.parseInt(value, 10);
  return Number.isFinite(n) && n >= 0 ? n : null;
};

const isoDate = (value: string | null): string | null => (value && /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : null);

export function parseSearch(params: ReadableParams): SearchState {
  // A check-in on its own is allowed (the listing page keeps "check-in picked, choosing
  // check-out" in the URL); a check-out only counts if it comes after the check-in.
  const checkIn = isoDate(params.get("checkIn"));
  const rawCheckOut = isoDate(params.get("checkOut"));
  const checkOut = checkIn && rawCheckOut && rawCheckOut > checkIn ? rawCheckOut : null;
  return {
    location: params.get("location") ?? "",
    checkIn,
    checkOut,
    adults: int(params.get("adults")) ?? 0,
    children: int(params.get("children")) ?? 0,
    infants: int(params.get("infants")) ?? 0,
    pets: int(params.get("pets")) ?? 0,
    category: params.get("category"),
    minPrice: int(params.get("minPrice")),
    maxPrice: int(params.get("maxPrice")),
    propertyTypes: (params.get("propertyType") ?? "").split(",").filter(Boolean),
    bedrooms: int(params.get("bedrooms")) ?? 0,
    beds: int(params.get("beds")) ?? 0,
    bathrooms: int(params.get("bathrooms")) ?? 0,
    amenities: (params.get("amenities") ?? "")
      .split(",")
      .map((s) => int(s))
      .filter((n): n is number => n !== null),
  };
}

/** Query string for the browser URL (only non-default values, so URLs stay short and shareable). */
export function toUrlQuery(state: SearchState): string {
  const q = new URLSearchParams();
  if (state.location.trim()) q.set("location", state.location.trim());
  if (state.checkIn) q.set("checkIn", state.checkIn);
  if (state.checkIn && state.checkOut) q.set("checkOut", state.checkOut);
  for (const key of ["adults", "children", "infants", "pets"] as const) {
    if (state[key] > 0) q.set(key, String(state[key]));
  }
  if (state.category) q.set("category", state.category);
  if (state.minPrice !== null) q.set("minPrice", String(state.minPrice));
  if (state.maxPrice !== null) q.set("maxPrice", String(state.maxPrice));
  if (state.propertyTypes.length) q.set("propertyType", state.propertyTypes.join(","));
  for (const key of ["bedrooms", "beds", "bathrooms"] as const) {
    if (state[key] > 0) q.set(key, String(state[key]));
  }
  if (state.amenities.length) q.set("amenities", state.amenities.join(","));
  return q.toString();
}

/** Guests that count towards a listing's max_guests: adults + children (infants and pets don't). */
export function countedGuests(state: SearchState): number {
  return state.adults + state.children;
}

/** Query string for GET /api/listings (snake_case, backend names). */
export function toApiQuery(state: SearchState, page: number, pageSize: number): string {
  const q = new URLSearchParams();
  if (state.location.trim()) q.set("location", state.location.trim());
  if (state.checkIn && state.checkOut) {
    q.set("check_in", state.checkIn);
    q.set("check_out", state.checkOut);
  }
  if (countedGuests(state) > 0) q.set("guests", String(countedGuests(state)));
  if (state.category) q.set("category", state.category);
  if (state.minPrice !== null) q.set("min_price", String(state.minPrice));
  if (state.maxPrice !== null) q.set("max_price", String(state.maxPrice));
  if (state.propertyTypes.length) q.set("property_type", state.propertyTypes.join(","));
  for (const key of ["bedrooms", "beds", "bathrooms"] as const) {
    if (state[key] > 0) q.set(key, String(state[key]));
  }
  if (state.amenities.length) q.set("amenities", state.amenities.join(","));
  q.set("page", String(page));
  q.set("page_size", String(pageSize));
  return q.toString();
}

/** "3 guests, 1 infant, 1 pet" — or null when nobody's been added. */
export function guestSummary(state: SearchState): string | null {
  const parts: string[] = [];
  const guests = countedGuests(state);
  if (guests) parts.push(`${guests} guest${guests === 1 ? "" : "s"}`);
  if (state.infants) parts.push(`${state.infants} infant${state.infants === 1 ? "" : "s"}`);
  if (state.pets) parts.push(`${state.pets} pet${state.pets === 1 ? "" : "s"}`);
  return parts.length ? parts.join(", ") : null;
}

export function activeFilterCount(state: SearchState): number {
  return (
    (state.minPrice !== null || state.maxPrice !== null ? 1 : 0) +
    (state.propertyTypes.length ? 1 : 0) +
    (state.bedrooms || state.beds || state.bathrooms ? 1 : 0) +
    state.amenities.length
  );
}
