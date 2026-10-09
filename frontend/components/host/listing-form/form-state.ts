import type { ListingDetail, ListingInput } from "@/lib/types";

/**
 * Form values as the inputs hold them: text boxes are strings, steppers are numbers.
 * Field names are the backend's (ListingWrite), so a server 422 for "price_per_night" lands on the
 * price field with no translation table.
 */
export type FormValues = {
  title: string;
  description: string;
  property_type: string;
  category: string;
  address: string;
  city: string;
  state: string;
  country: string;
  latitude: string;
  longitude: string;
  price_per_night: string;
  cleaning_fee: string;
  max_guests: number;
  bedrooms: number;
  beds: number;
  bathrooms: number;
  image_urls: string[];
  amenity_ids: number[];
};

export type FormErrors = Partial<Record<keyof FormValues, string>>;

export const LIMITS = {
  title: { min: 5, max: 120 },
  description: { min: 20, max: 5000 },
  guests: { min: 1, max: 16 },
  bedrooms: { min: 0, max: 50 },
  beds: { min: 1, max: 50 },
  bathrooms: { min: 0, max: 50 },
  price: { max: 1_000_000 },
  cleaning: { max: 100_000 },
  images: { max: 20 },
} as const;

export const EMPTY_VALUES: FormValues = {
  title: "",
  description: "",
  property_type: "",
  category: "",
  address: "",
  city: "",
  state: "",
  country: "India",
  latitude: "",
  longitude: "",
  price_per_night: "",
  cleaning_fee: "0",
  max_guests: 2,
  bedrooms: 1,
  beds: 1,
  bathrooms: 1,
  image_urls: [],
  amenity_ids: [],
};

export function valuesFromListing(l: ListingDetail): FormValues {
  return {
    title: l.title,
    description: l.description,
    property_type: l.property_type,
    category: l.category,
    address: l.address,
    city: l.city,
    state: l.state ?? "",
    country: l.country,
    latitude: String(l.latitude),
    longitude: String(l.longitude),
    price_per_night: String(l.price_per_night),
    cleaning_fee: String(l.cleaning_fee),
    max_guests: l.max_guests,
    bedrooms: l.bedrooms,
    beds: l.beds,
    bathrooms: l.bathrooms,
    image_urls: l.images.map((img) => img.url),
    amenity_ids: l.amenities.map((a) => a.id),
  };
}

const isWholeNumber = (s: string) => /^\d+$/.test(s.trim());
const isDecimal = (s: string) => /^-?\d+(\.\d+)?$/.test(s.trim());

export function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value.trim());
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

/** Same rules as the backend's ListingWrite, so most mistakes are caught before a request is sent. */
export function validate(v: FormValues): FormErrors {
  const e: FormErrors = {};
  const title = v.title.trim();
  if (title.length < LIMITS.title.min) e.title = `Give your listing a title (at least ${LIMITS.title.min} characters).`;
  else if (title.length > LIMITS.title.max) e.title = `Keep the title under ${LIMITS.title.max} characters.`;

  const description = v.description.trim();
  if (description.length < LIMITS.description.min) e.description = `Describe your place (at least ${LIMITS.description.min} characters).`;
  else if (description.length > LIMITS.description.max) e.description = `Keep the description under ${LIMITS.description.max} characters.`;

  if (!v.property_type) e.property_type = "Choose what kind of place this is.";
  if (!v.category) e.category = "Choose the category that fits best.";

  if (v.address.trim().length < 3) e.address = "Enter the street address.";
  if (!v.city.trim()) e.city = "Enter the city.";
  if (!v.country.trim()) e.country = "Enter the country.";

  if (!isDecimal(v.latitude) || Math.abs(Number(v.latitude)) > 90) e.latitude = "Enter a latitude between -90 and 90.";
  if (!isDecimal(v.longitude) || Math.abs(Number(v.longitude)) > 180) e.longitude = "Enter a longitude between -180 and 180.";

  if (!isWholeNumber(v.price_per_night) || Number(v.price_per_night) < 1 || Number(v.price_per_night) > LIMITS.price.max)
    e.price_per_night = `Enter a whole-rupee price between ₹1 and ₹${LIMITS.price.max.toLocaleString("en-IN")}.`;
  if (!isWholeNumber(v.cleaning_fee) || Number(v.cleaning_fee) > LIMITS.cleaning.max)
    e.cleaning_fee = `Enter a whole-rupee fee between ₹0 and ₹${LIMITS.cleaning.max.toLocaleString("en-IN")}.`;

  if (v.image_urls.length === 0) e.image_urls = "Add at least one photo.";
  else if (v.image_urls.length > LIMITS.images.max) e.image_urls = `You can add up to ${LIMITS.images.max} photos.`;
  return e;
}

export function toInput(v: FormValues): ListingInput {
  return {
    title: v.title.trim(),
    description: v.description.trim(),
    property_type: v.property_type,
    category: v.category,
    address: v.address.trim(),
    city: v.city.trim(),
    state: v.state.trim() || null,
    country: v.country.trim(),
    latitude: Number(v.latitude),
    longitude: Number(v.longitude),
    price_per_night: Number(v.price_per_night),
    cleaning_fee: Number(v.cleaning_fee),
    max_guests: v.max_guests,
    bedrooms: v.bedrooms,
    beds: v.beds,
    bathrooms: v.bathrooms,
    image_urls: v.image_urls,
    amenity_ids: v.amenity_ids,
  };
}

/** Order the fields appear on the page, to scroll to the first error. */
export const FIELD_ORDER: (keyof FormValues)[] = [
  "property_type", "category", "address", "city", "state", "country", "latitude", "longitude",
  "max_guests", "bedrooms", "beds", "bathrooms", "amenity_ids", "image_urls", "title", "description",
  "price_per_night", "cleaning_fee",
];
