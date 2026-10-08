import { KeyRound, Laptop, Medal, Star, Umbrella, Waves } from "lucide-react";
import { Laurel } from "@/components/listing-detail/Laurel";
import { Avatar } from "@/components/ui/Avatar";
import { formatRating, plural, timeOnAirbnb } from "@/lib/format";
import { isGuestFavourite, typeInCity } from "@/lib/listing";
import type { ListingDetail } from "@/lib/types";

/** "Villa in Anjuna, India", room counts, rating (or the Guest favourite box), host row and highlights. */
export function Overview({ listing }: { listing: ListingDetail }) {
  const { average, count } = listing.rating;
  const favourite = isGuestFavourite(average, count);
  const hosting = timeOnAirbnb(listing.host.joined_at);
  const firstName = listing.host.name.split(" ")[0];

  return (
    <section className="pb-8">
      <h2 className="text-[22px] font-medium leading-[26px] tracking-[-0.44px]">
        {typeInCity(listing.property_type, listing.city)}, {listing.country}
      </h2>
      <p className="mt-1 text-base">
        {[plural(listing.max_guests, "guest"), plural(listing.bedrooms, "bedroom"), plural(listing.beds, "bed"), plural(listing.bathrooms, "bathroom")].join(" · ")}
      </p>

      {favourite ? (
        <a href="#reviews" className="mt-6 flex items-center rounded-xl border border-line px-6 py-5 hover:bg-subtle/60">
          <span className="flex items-center gap-1 text-[17px] font-semibold leading-5">
            <Laurel />
            <span className="text-center">Guest<br />favourite</span>
            <Laurel flip />
          </span>
          <span className="mx-6 hidden flex-1 text-lg font-medium leading-6 sm:block">
            One of the most loved homes on Airbnb, according to guests
          </span>
          <span className="ml-auto flex flex-col items-center px-4">
            <span className="text-[22px] font-semibold">{formatRating(average!)}</span>
            <Stars rating={average!} />
          </span>
          <span className="h-11 w-px bg-line" />
          <span className="flex flex-col items-center pl-4">
            <span className="text-[22px] font-semibold">{count}</span>
            <span className="text-xs font-medium underline">Reviews</span>
          </span>
        </a>
      ) : (
        <p className="mt-2 flex items-center gap-1 text-base font-medium">
          <Star size={14} fill="currentColor" strokeWidth={0} />
          {count > 0 ? (
            <>
              {formatRating(average!)} · <a href="#reviews" className="underline">{plural(count, "review")}</a>
            </>
          ) : (
            "New"
          )}
        </p>
      )}

      <div className="mt-8 flex items-center gap-6 border-b border-line pb-8">
        <span className="relative">
          <Avatar user={listing.host} size={40} />
          {listing.host.is_superhost && <SuperhostBadge className="absolute -bottom-1 -right-1" />}
        </span>
        <span>
          <span className="block text-base font-medium">Hosted by {firstName}</span>
          <span className="block text-sm text-muted">
            {listing.host.is_superhost ? "Superhost · " : ""}
            {hosting.value} {hosting.unit} hosting
          </span>
        </span>
      </div>

      <Highlights listing={listing} firstName={firstName} />
    </section>
  );
}

export function Stars({ rating, size = 10 }: { rating: number; size?: number }) {
  return (
    <span className="flex gap-px" aria-label={`${formatRating(rating)} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, i) => (
        <Star key={i} size={size} strokeWidth={0} fill={i < Math.round(rating) ? "#222222" : "#DDDDDD"} />
      ))}
    </span>
  );
}

export function SuperhostBadge({ className = "", size = 16 }: { className?: string; size?: number }) {
  return (
    <span className={`grid place-items-center rounded-full bg-brand-gradient text-white ring-2 ring-white ${className}`} style={{ width: size, height: size }} aria-label="Superhost">
      <Medal size={size * 0.62} strokeWidth={2.5} />
    </span>
  );
}

/** Up to three highlights, derived only from real data (no invented claims). */
function Highlights({ listing, firstName }: { listing: ListingDetail; firstName: string }) {
  const has = (name: string) => listing.amenities.some((a) => a.name === name);
  const items: { icon: React.ReactNode; title: string; text: string }[] = [];
  if (listing.host.is_superhost)
    items.push({ icon: <Medal size={24} strokeWidth={1.5} />, title: `${firstName} is a Superhost`, text: "Superhosts are experienced, highly rated hosts." });
  if (has("Self check-in"))
    items.push({ icon: <KeyRound size={24} strokeWidth={1.5} />, title: "Self check-in", text: "You can check in on your own when you arrive." });
  if (has("Dedicated workspace"))
    items.push({ icon: <Laptop size={24} strokeWidth={1.5} />, title: "Dedicated workspace", text: "A space with Wi-Fi that’s well suited for working." });
  if (has("Pool")) items.push({ icon: <Waves size={24} strokeWidth={1.5} />, title: "Dive right in", text: "This place has a pool guests can use." });
  if (has("Beach access")) items.push({ icon: <Umbrella size={24} strokeWidth={1.5} />, title: "Beach access", text: "Guests can get to the beach easily from here." });
  if (items.length === 0) return null;

  return (
    <ul className="space-y-6 border-b border-line py-8">
      {items.slice(0, 3).map((item) => (
        <li key={item.title} className="flex gap-6">
          <span className="mt-0.5 w-6 shrink-0">{item.icon}</span>
          <span>
            <span className="block text-base font-medium">{item.title}</span>
            <span className="block text-sm text-muted">{item.text}</span>
          </span>
        </li>
      ))}
    </ul>
  );
}
