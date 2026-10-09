import Link from "next/link";
import { Avatar } from "@/components/ui/Avatar";
import { formatDateRange, formatPrice, plural } from "@/lib/format";
import type { Booking } from "@/lib/types";

export type ReservationState = "current" | "arriving" | "leaving" | "upcoming" | "completed" | "cancelled";

const BADGE: Record<ReservationState, { label: string; className: string }> = {
  current: { label: "Currently hosting", className: "bg-[#E6F4EA] text-[#0B6B2D]" },
  arriving: { label: "Arriving today", className: "bg-[#E6F4EA] text-[#0B6B2D]" },
  leaving: { label: "Checking out today", className: "bg-[#FFF4E5] text-[#8A4B00]" },
  upcoming: { label: "Confirmed", className: "bg-chip text-ink" },
  completed: { label: "Completed", className: "bg-chip text-muted" },
  cancelled: { label: "Cancelled", className: "bg-[#FDECEA] text-[#C13515]" },
};

/** One reservation on one of my listings: who, when, where, and what I earn. */
export function ReservationRow({ booking, state }: { booking: Booking; state: ReservationState }) {
  const badge = BADGE[state];
  const year = booking.check_out.slice(0, 4);
  return (
    <article className="grid items-center gap-4 rounded-[20px] border border-line p-5 sm:grid-cols-[1.3fr_1.2fr_1.5fr_auto]">
      <div className="flex items-center gap-3">
        <Avatar user={booking.guest} size={48} />
        <div className="min-w-0">
          <p className="truncate text-base font-semibold">{booking.guest.name}</p>
          <p className="text-sm text-muted">{plural(booking.guests, "guest")}</p>
        </div>
      </div>

      <div>
        <p className="text-base font-medium">
          {formatDateRange(booking.check_in, booking.check_out)} {year}
        </p>
        <p className="text-sm text-muted">{plural(booking.nights, "night")}</p>
      </div>

      <div className="min-w-0">
        <Link href={`/rooms/${booking.listing.id}`} className="block truncate text-base hover:underline">
          {booking.listing.title}
        </Link>
        <p className="truncate text-sm text-muted">
          {booking.listing.city}, {booking.listing.country}
        </p>
      </div>

      <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end sm:gap-2">
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${badge.className}`}>{badge.label}</span>
        <p className={`text-base ${state === "cancelled" ? "text-muted line-through" : ""}`}>
          <span className="font-semibold">{formatPrice(booking.host_payout)}</span>
          <span className="text-sm text-muted"> payout</span>
        </p>
      </div>
    </article>
  );
}
