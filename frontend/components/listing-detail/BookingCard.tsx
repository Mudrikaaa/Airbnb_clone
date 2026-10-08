"use client";

import { AlertCircle, ChevronDown, ChevronUp, Star } from "lucide-react";
import { format, parseISO } from "date-fns";
import { useEffect, useRef, useState } from "react";
import { AvailabilityCalendar } from "@/components/listing-detail/AvailabilityCalendar";
import { useBooking } from "@/components/listing-detail/useBooking";
import { GuestsPanel } from "@/components/search/GuestsPanel";
import { formatPrice, formatRating, plural } from "@/lib/format";
import { guestSummary } from "@/lib/search-params";
import type { ListingDetail } from "@/lib/types";

type Props = { listing: ListingDetail; nights: Set<string> };

/**
 * Sticky booking card (airbnb.com: 372px, 12px radius, 24px padding, 0 6px 16px rgba(0,0,0,.12)).
 * Dates/guests field box with 10px/700 uppercase labels, gradient pill "Reserve", price breakdown from /quote.
 */
export function BookingCard({ listing, nights }: Props) {
  const { stay, hasDates, quote, quoteLoading, problem, reserve, canReserve } = useBooking(listing, nights);
  const [panel, setPanel] = useState<"dates" | "guests" | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!panel) return;
    const onDown = (e: MouseEvent) => !rootRef.current?.contains(e.target as Node) && setPanel(null);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setPanel(null);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [panel]);

  const fmt = (iso: string | null) => (iso ? format(parseISO(iso), "d/M/yyyy") : "Add date");
  const { average, count } = listing.rating;

  const onButton = () => {
    if (!hasDates) setPanel("dates"); // "Check availability" opens the calendar
    else reserve();
  };

  return (
    <div ref={rootRef} className="relative rounded-xl border border-line-light bg-white p-6 shadow-[0_6px_16px_rgba(0,0,0,0.12)]">
      {/* Same header as airbnb.com: "Add dates for prices" until there's a quote, then the stay total.
          The nightly price stays visible underneath (and in the breakdown). */}
      <div>
        {quote ? (
          <p className="text-[22px] font-medium leading-[26px]">
            <span className="underline">{formatPrice(quote.total)}</span>
            <span className="text-base font-normal"> for {plural(quote.nights, "night")}</span>
          </p>
        ) : (
          <p className="text-[22px] font-medium leading-[26px]">Add dates for prices</p>
        )}
        <p className="mt-1 flex flex-wrap items-center gap-1 text-sm text-muted">
          <span>
            <span className="font-medium text-ink">{formatPrice(listing.price_per_night)}</span> night
          </span>
          <span aria-hidden>·</span>
          <Star size={11} fill="#222222" strokeWidth={0} />
          {count > 0 ? (
            <>
              <span className="font-medium text-ink">{formatRating(average!)}</span>
              <a href="#reviews" className="underline">({plural(count, "review")})</a>
            </>
          ) : (
            <span className="font-medium text-ink">New</span>
          )}
        </p>
      </div>

      {/* Field box: two date cells over the guests row */}
      <div className={`mt-6 rounded-xl border ${problem && hasDates ? "border-[#C13515]" : "border-[#8C8C8C]"}`}>
        <div className="grid grid-cols-2">
          <FieldButton label="Check-in" value={fmt(stay.checkIn)} empty={!stay.checkIn} onClick={() => setPanel("dates")}
            className="rounded-tl-xl" active={panel === "dates" && !stay.checkIn} />
          <FieldButton label="Checkout" value={fmt(stay.checkOut)} empty={!stay.checkOut} onClick={() => setPanel("dates")}
            className="rounded-tr-xl border-l border-[#8C8C8C]" active={panel === "dates" && !!stay.checkIn && !stay.checkOut} />
        </div>
        <button type="button" onClick={() => setPanel(panel === "guests" ? null : "guests")}
          className={`flex w-full items-center justify-between rounded-b-xl border-t border-[#8C8C8C] px-3 py-2.5 text-left ${panel === "guests" ? "outline-2 -outline-offset-2 outline-ink outline" : ""}`}>
          <span>
            <span className="block text-[10px] font-bold uppercase leading-3">Guests</span>
            <span className="mt-1 block text-sm">{guestSummary(stay.guests) ?? "1 guest"}</span>
          </span>
          {panel === "guests" ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>
      </div>

      {panel === "guests" && (
        <div className="absolute inset-x-6 z-20 mt-1 rounded-xl bg-white shadow-panel">
          <GuestsPanel guests={stay.guests} onChange={stay.setGuests} maxGuests={listing.max_guests} />
          <p className="px-6 pb-2 text-xs text-muted">
            This place has a maximum of {plural(listing.max_guests, "guest")}, not including infants.
          </p>
          <div className="flex justify-end px-4 pb-4">
            <button type="button" onClick={() => setPanel(null)} className="rounded-lg px-3 py-2 text-base font-semibold underline hover:bg-subtle">
              Close
            </button>
          </div>
        </div>
      )}

      {panel === "dates" && (
        <div className="absolute right-[-24px] top-[-24px] z-20 w-[min(720px,calc(100vw-48px))] rounded-2xl bg-white p-8 shadow-panel">
          <div className="flex items-start justify-between gap-6">
            <div>
              <h3 className="text-[22px] font-medium">{!stay.checkIn ? "Select dates" : !stay.checkOut ? "Select checkout date" : "Your dates"}</h3>
              <p className="mt-1 text-sm text-muted">Struck-through days are already booked.</p>
            </div>
          </div>
          <div className="mt-4 [&_.rdp-root]:[--cell:44px]">
            <AvailabilityCalendar nights={nights} checkIn={stay.checkIn} checkOut={stay.checkOut}
              onChange={(ci, co) => { stay.setDates(ci, co); if (ci && co) setPanel(null); }} />
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <button type="button" onClick={() => stay.setDates(null, null)} className="rounded-lg px-3 py-2 text-sm font-medium underline hover:bg-subtle">
              Clear dates
            </button>
            <button type="button" onClick={() => setPanel(null)} className="h-10 rounded-lg bg-ink px-4 text-sm font-semibold text-white">
              Close
            </button>
          </div>
        </div>
      )}

      {problem && hasDates && (
        <p className="mt-4 flex items-start gap-2 text-sm text-[#C13515]" role="alert">
          <AlertCircle size={16} className="mt-0.5 shrink-0" fill="#C13515" stroke="white" />
          {problem}
        </p>
      )}

      <button
        type="button"
        onClick={onButton}
        disabled={hasDates && !canReserve}
        className="mt-4 h-12 w-full rounded-full bg-brand-gradient text-base font-medium text-white transition hover:brightness-95 disabled:cursor-not-allowed disabled:bg-none disabled:bg-line disabled:text-white"
      >
        {!hasDates ? "Check availability" : quoteLoading ? "Checking…" : "Reserve"}
      </button>

      {quote && (
        <>
          <p className="mt-3 text-center text-sm">You won’t be charged yet</p>
          <dl className="mt-6 space-y-3 text-base">
            <Row label={`${formatPrice(quote.nightly_price)} x ${plural(quote.nights, "night")}`} value={formatPrice(quote.subtotal)} />
            <Row label="Cleaning fee" value={formatPrice(quote.cleaning_fee)} />
            <Row label="Airbnb service fee" value={formatPrice(quote.service_fee)} />
          </dl>
          <div className="mt-6 flex justify-between border-t border-line pt-6 text-base font-semibold">
            <span>Total before taxes</span>
            <span>{formatPrice(quote.total)}</span>
          </div>
        </>
      )}
    </div>
  );
}

function FieldButton(props: { label: string; value: string; empty: boolean; onClick: () => void; className?: string; active: boolean }) {
  return (
    <button type="button" onClick={props.onClick}
      className={`px-3 py-2.5 text-left ${props.className ?? ""} ${props.active ? "outline-2 -outline-offset-2 outline-ink outline rounded-xl" : ""}`}>
      <span className="block text-[10px] font-bold uppercase leading-3">{props.label}</span>
      <span className={`mt-1 block text-sm ${props.empty ? "text-muted" : ""}`}>{props.value}</span>
    </button>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <dt className="underline">{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}
