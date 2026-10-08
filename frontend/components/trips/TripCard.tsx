import Link from "next/link";
import { Avatar } from "@/components/ui/Avatar";
import { formatDateRange, formatPrice, plural } from "@/lib/format";
import type { Booking } from "@/lib/types";

type Props = { booking: Booking; onCancel?: (booking: Booking) => void };

/** One reservation: photo, place, dates, host and total. `onCancel` is only passed when cancelling is allowed. */
export function TripCard({ booking, onCancel }: Props) {
  const { listing } = booking;
  const cancelled = booking.status === "cancelled";
  const year = booking.check_out.slice(0, 4);

  return (
    <article className="flex flex-col overflow-hidden rounded-[20px] border border-line bg-white sm:flex-row">
      <Link href={`/rooms/${listing.id}`} className="relative block shrink-0 sm:w-[240px]">
        {listing.cover_image && (
          // eslint-disable-next-line @next/next/no-img-element -- host photos come from arbitrary URLs
          <img src={listing.cover_image} alt="" className={`aspect-[4/3] h-full w-full object-cover sm:aspect-auto ${cancelled ? "grayscale" : ""}`} />
        )}
        {cancelled && <span className="absolute left-3 top-3 rounded-[14px] bg-white/90 px-2.5 py-1 text-sm font-semibold shadow-badge">Cancelled</span>}
      </Link>

      <div className="flex flex-1 flex-col justify-between gap-5 p-6">
        <div>
          <Link href={`/rooms/${listing.id}`} className="hover:underline">
            <h3 className="text-lg font-semibold leading-6">{listing.title}</h3>
          </Link>
          <p className="mt-1 text-sm text-muted">
            {listing.city}, {listing.country}
          </p>
          <p className="mt-4 text-base font-medium">
            {formatDateRange(booking.check_in, booking.check_out)} {year}
            <span className="font-normal text-muted"> · {plural(booking.nights, "night")} · {plural(booking.guests, "guest")}</span>
          </p>
          <p className="mt-3 flex items-center gap-2 text-sm">
            <Avatar user={listing.host} size={24} />
            Hosted by {listing.host.name.split(" ")[0]}
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className={`text-base ${cancelled ? "text-muted line-through" : ""}`}>
            <span className="font-semibold">{formatPrice(booking.total_price)}</span> total
          </p>
          <div className="flex items-center gap-3">
            <Link href={`/rooms/${listing.id}`} className="text-sm font-semibold underline">
              View listing
            </Link>
            {onCancel && (
              <button
                type="button"
                onClick={() => onCancel(booking)}
                className="h-10 rounded-lg border border-ink px-4 text-sm font-semibold hover:bg-subtle"
              >
                Cancel booking
              </button>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
