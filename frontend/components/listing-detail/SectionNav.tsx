"use client";

import { Star } from "lucide-react";
import { useBooking } from "@/components/listing-detail/useBooking";
import { formatPrice, formatRating, plural } from "@/lib/format";
import type { ListingDetail } from "@/lib/types";

const LINKS = [
  { href: "#photos", label: "Photos" },
  { href: "#amenities", label: "Amenities" },
  { href: "#reviews", label: "Reviews" },
  { href: "#location", label: "Location" },
];

type Props = { listing: ListingDetail; nights: Set<string>; visible: boolean; showReserve: boolean };

/**
 * airbnb.com replaces the header with this 80px bar once the photos scroll away; when the booking
 * card is out of view too, the price and Reserve button move into it.
 */
export function SectionNav({ listing, nights, visible, showReserve }: Props) {
  const { hasDates, reserve, canReserve } = useBooking(listing, nights);
  if (!visible) return null;
  const { average, count } = listing.rating;

  return (
    <div className="fixed inset-x-0 top-0 z-[55] hidden border-b border-line bg-white lg:block">
      <div className="mx-auto flex h-20 max-w-[1200px] items-center justify-between px-10">
        <nav className="flex h-full gap-6">
          {LINKS.map((l) => (
            <a key={l.href} href={l.href} className="flex h-full items-center border-b-4 border-transparent text-sm font-medium hover:border-ink">
              {l.label}
            </a>
          ))}
        </nav>
        {showReserve && (
          <div className="flex items-center gap-6">
            <div className="text-right">
              <p>
                <span className="text-base font-semibold">{formatPrice(listing.price_per_night)}</span> <span className="text-sm">night</span>
              </p>
              {count > 0 && (
                <p className="flex items-center justify-end gap-1 text-xs">
                  <Star size={10} fill="currentColor" strokeWidth={0} /> {formatRating(average!)} · <span className="text-muted">{plural(count, "review")}</span>
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={() => (hasDates ? reserve() : document.getElementById("calendar")?.scrollIntoView({ behavior: "smooth" }))}
              disabled={hasDates && !canReserve}
              className="h-12 rounded-full bg-brand-gradient px-6 text-base font-medium text-white disabled:bg-none disabled:bg-line"
            >
              {hasDates ? "Reserve" : "Check availability"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
