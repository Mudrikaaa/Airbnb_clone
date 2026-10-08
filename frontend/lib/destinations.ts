// Suggested destinations for the "Where" panel — places that exist in the seed data.
// `query` is what goes into ?location= (the backend matches city, state or country).

export type Destination = {
  query: string;
  label: string;
  subtitle: string;
  icon: string; // lucide name (see components/ui/Icon.tsx)
  tint: string; // tile background
  color: string; // icon colour
};

export const DESTINATIONS: Destination[] = [
  { query: "Goa", label: "Goa, India", subtitle: "Popular beach destination", icon: "Umbrella", tint: "#EEF6FB", color: "#3B82C4" },
  { query: "Manali", label: "Manali, Himachal Pradesh", subtitle: "For sights like Solang Valley", icon: "MountainSnow", tint: "#EFF6EE", color: "#4C9A55" },
  { query: "Jaipur", label: "Jaipur, Rajasthan", subtitle: "For its stunning architecture", icon: "Castle", tint: "#FDF0EF", color: "#D9534F" },
  { query: "Udaipur", label: "Udaipur, Rajasthan", subtitle: "For sights like Lake Pichola", icon: "Sailboat", tint: "#EEF3FB", color: "#4A6FB5" },
  { query: "Mumbai", label: "Mumbai, Maharashtra", subtitle: "For its bustling nightlife", icon: "Building2", tint: "#F4F1EC", color: "#7A6A55" },
  { query: "Kerala", label: "Kerala, India", subtitle: "Great for a weekend getaway", icon: "TreePalm", tint: "#EEF7F2", color: "#2F8F63" },
  { query: "Bali", label: "Bali, Indonesia", subtitle: "Popular with travellers near you", icon: "Waves", tint: "#EDF8F8", color: "#1C9C9C" },
  { query: "Paris", label: "Paris, France", subtitle: "For sights like the Eiffel Tower", icon: "Landmark", tint: "#F4F0FA", color: "#7356B5" },
  { query: "Tokyo", label: "Tokyo, Japan", subtitle: "For its top-notch dining", icon: "Building2", tint: "#FDF0F4", color: "#C2456E" },
  { query: "Lisbon", label: "Lisbon, Portugal", subtitle: "For its seaside charm", icon: "Sun", tint: "#FFF6E8", color: "#C98A1B" },
  { query: "New York", label: "New York, United States", subtitle: "For sights like Central Park", icon: "Building2", tint: "#EFF2F5", color: "#4B5B6E" },
];

export function matchDestinations(text: string): Destination[] {
  const q = text.trim().toLowerCase();
  if (!q) return DESTINATIONS;
  return DESTINATIONS.filter((d) => d.label.toLowerCase().includes(q));
}
