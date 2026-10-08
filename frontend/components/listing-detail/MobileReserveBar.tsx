"use client";

import { useBooking } from "@/components/listing-detail/useBooking";
import { formatDateRange, formatPrice } from "@/lib/format";
import type { ListingDetail } from "@/lib/types";

/** Below 1024px the booking card is hidden; Airbnb shows this fixed footer instead. */
export function MobileReserveBar({ listing, nights }: { listing: ListingDetail; nights: Set<string> }) {
  const { stay, hasDates, quote, problem, reserve, canReserve } = useBooking(listing, nights);

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-line bg-white px-6 py-4 lg:hidden">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          {quote ? (
            <p className="text-base">
              <span className="font-semibold underline">{formatPrice(quote.total)}</span> total
            </p>
          ) : (
            <p className="text-base">
              <span className="font-semibold">{formatPrice(listing.price_per_night)}</span> night
            </p>
          )}
          <p className={`truncate text-sm ${problem && hasDates ? "text-[#C13515]" : "underline"}`}>
            {problem && hasDates ? "Dates not available" : hasDates ? formatDateRange(stay.checkIn!, stay.checkOut!) : "Add dates"}
          </p>
        </div>
        <button
          type="button"
          onClick={() => (hasDates ? reserve() : document.getElementById("calendar")?.scrollIntoView({ behavior: "smooth" }))}
          disabled={hasDates && !canReserve}
          className="h-12 shrink-0 rounded-full bg-brand-gradient px-8 text-base font-medium text-white disabled:bg-none disabled:bg-line"
        >
          {hasDates ? "Reserve" : "Check availability"}
        </button>
      </div>
    </div>
  );
}
