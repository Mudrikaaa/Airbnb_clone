// Mirrors the backend Pydantic schemas (backend/app/schemas). Dates are ISO strings ("2026-10-09").

export type UserSummary = {
  id: number;
  name: string;
  avatar_url: string | null;
};

export type User = UserSummary & {
  is_superhost: boolean;
  is_host: boolean;
};

export type UserMe = User & {
  email: string;
  bio: string | null;
  joined_at: string;
};

export type Amenity = { id: number; name: string; icon: string };
export type Category = { key: string; label: string; icon: string };
export type PropertyType = { key: string; label: string };

export type ListingCard = {
  id: number;
  title: string;
  city: string;
  state: string | null;
  country: string;
  property_type: string;
  category: string;
  price_per_night: number;
  bedrooms: number;
  beds: number;
  latitude: number;
  longitude: number;
  images: string[];
  rating: number | null;
  review_count: number;
  is_wishlisted: boolean;
  is_active: boolean;
};

export type ListingPage = {
  items: ListingCard[];
  total: number;
  page: number;
  page_size: number;
};

export type ListingImage = { id: number; url: string; position: number };

export type Host = {
  id: number;
  name: string;
  avatar_url: string | null;
  bio: string | null;
  is_superhost: boolean;
  joined_at: string;
  listing_count: number;
  review_count: number;
  average_rating: number | null;
};

export type ListingDetail = Omit<ListingCard, "images" | "rating" | "review_count"> & {
  description: string;
  address: string;
  cleaning_fee: number;
  max_guests: number;
  bathrooms: number;
  created_at: string;
  images: ListingImage[];
  amenities: Amenity[];
  host: Host;
  rating: { average: number | null; count: number };
};

export type Availability = { booked: { check_in: string; check_out: string }[] };

export type Quote = {
  check_in: string;
  check_out: string;
  guests: number;
  nights: number;
  nightly_price: number;
  subtotal: number;
  cleaning_fee: number;
  service_fee: number;
  total: number;
  available: boolean;
};

export type Review = {
  id: number;
  rating: number;
  comment: string;
  created_at: string;
  author: UserSummary & { joined_at: string };
};

export type Booking = {
  id: number;
  listing: { id: number; title: string; city: string; country: string; cover_image: string | null };
  guest: UserSummary;
  check_in: string;
  check_out: string;
  guests: number;
  nights: number;
  nightly_price: number;
  cleaning_fee: number;
  service_fee: number;
  total_price: number;
  status: "confirmed" | "cancelled";
  created_at: string;
  has_review: boolean;
};

export type Trips = { upcoming: Booking[]; past: Booking[]; cancelled: Booking[] };
