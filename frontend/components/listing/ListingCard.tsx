import { Star } from "lucide-react";
import Link from "next/link";
import { HeartButton } from "@/components/listing/HeartButton";
import { ImageCarousel } from "@/components/listing/ImageCarousel";
import { formatDateRange, formatPrice, formatRating, plural } from "@/lib/format";
import { isGuestFavourite, typeInCity } from "@/lib/listing";
import type { ListingCard as Listing } from "@/lib/types";

type Props = {
  listing: Listing;
  onToggleWishlist: (listingId: number, saved: boolean) => void;
  /** Selected search dates, shown on their own line (like airbnb.com). */
  dates?: { checkIn: string; checkOut: string } | null;
  /** "?checkIn=…&adults=…" carried over to the listing page so the booking card is pre-filled. */
  stayQuery?: string;
};

/** Mirrors airbnb.com's search-result card: "Villa in Anjuna ★ 4.5", title, rooms, (dates), price — all 15px. */
export function ListingCard({ listing, onToggleWishlist, dates, stayQuery }: Props) {
  return (
    <Link href={`/rooms/${listing.id}${stayQuery ? `?${stayQuery}` : ""}`} className="group block">
      <div className="relative">
        <ImageCarousel images={listing.images} alt={listing.title} />
        {isGuestFavourite(listing.rating, listing.review_count) && (
          <span className="absolute left-3 top-3 z-10 rounded-[14px] bg-white/[0.92] px-[9.5px] py-[5.5px] text-sm font-semibold text-ink shadow-badge">
            Guest favourite
          </span>
        )}
        <HeartButton saved={listing.is_wishlisted} onToggle={() => onToggleWishlist(listing.id, listing.is_wishlisted)} />
      </div>

      <div className="mt-2.5 text-[15px] leading-[19px]">
        <div className="flex items-start justify-between gap-2">
          <h3 className="truncate font-medium text-ink">
            {typeInCity(listing.property_type, listing.city)}
          </h3>
          <span className="flex shrink-0 items-center gap-1 text-ink">
            <Star size={12} fill="currentColor" strokeWidth={0} aria-hidden />
            {listing.review_count > 0 && listing.rating !== null ? formatRating(listing.rating) : "New"}
            {listing.review_count > 0 && <span className="sr-only">({plural(listing.review_count, "review")})</span>}
          </span>
        </div>
        <p className="mt-[3px] truncate text-muted">{listing.title}</p>
        <p className="mt-[3px] truncate text-muted">
          {plural(listing.bedrooms, "bedroom")}
          <span className="mx-1 font-bold text-[#C1C1C1]">·</span>
          {plural(listing.beds, "bed")}
        </p>
        {dates && <p className="mt-[3px] text-muted">{formatDateRange(dates.checkIn, dates.checkOut)}</p>}
        <p className="mt-1.5">
          <span className="font-medium text-ink">{formatPrice(listing.price_per_night)}</span>
          <span className="text-muted"> night</span>
        </p>
      </div>
    </Link>
  );
}
