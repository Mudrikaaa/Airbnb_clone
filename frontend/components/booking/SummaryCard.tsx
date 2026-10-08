import { Star } from "lucide-react";
import { formatPrice, formatRating, plural } from "@/lib/format";
import { isGuestFavourite } from "@/lib/listing";
import type { ListingDetail, Quote } from "@/lib/types";

type Props = {
  listing: ListingDetail;
  quote: Quote | undefined;
  datesLabel: string;
  guestsLabel: string;
  freeUntil: string; // e.g. "10 Nov"
};

/**
 * Right-hand card on "Confirm and pay", measured on airbnb.com: 372px wide, 24px radius, 24px padding,
 * hairline border; 97px photo, 18px/600 title, 14px body rows, 14px/600 section labels.
 * Every number comes from the backend quote — nothing is computed here.
 */
export function SummaryCard({ listing, quote, datesLabel, guestsLabel, freeUntil }: Props) {
  const { average, count } = listing.rating;
  const label = "text-sm font-semibold";
  return (
    <aside className="rounded-3xl border border-line p-6">
      <div className="flex gap-4">
        {/* eslint-disable-next-line @next/next/no-img-element -- host photos come from arbitrary URLs */}
        <img src={listing.images[0]?.url} alt="" className="h-[97px] w-[97px] shrink-0 rounded-xl object-cover" />
        <div className="min-w-0">
          <h2 className="line-clamp-2 text-lg font-semibold leading-6">{listing.title}</h2>
          <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-medium">
            <span className="flex items-center gap-1">
              <Star size={11} fill="currentColor" strokeWidth={0} />
              {count > 0 ? `${formatRating(average!)} (${count})` : "New"}
            </span>
            {isGuestFavourite(average, count) && <span>Guest favourite</span>}
          </p>
        </div>
      </div>

      <hr className="my-6 border-line-light" />

      <p className={label}>Free cancellation</p>
      <p className="mt-1 text-sm">Cancel before {freeUntil} for a full refund.</p>
      <a href="#cancellation" className="mt-1 inline-block text-sm font-medium underline">
        Full policy
      </a>

      <hr className="my-6 border-line-light" />

      <p className={label}>Dates</p>
      <p className="mt-1 text-sm">{datesLabel}</p>
      <p className={`${label} mt-5`}>Guests</p>
      <p className="mt-1 text-sm">{guestsLabel}</p>

      <hr className="my-6 border-line-light" />

      <p className={label}>Price details</p>
      {quote ? (
        <dl className="mt-3 space-y-2 text-sm">
          <Row label={`${plural(quote.nights, "night")} x ${formatPrice(quote.nightly_price)}`} value={formatPrice(quote.subtotal)} />
          <Row label="Cleaning fee" value={formatPrice(quote.cleaning_fee)} />
          <Row label="Airbnb service fee" value={formatPrice(quote.service_fee)} />
          <div className="!mt-5 flex justify-between border-t border-line-light pt-5 font-semibold">
            <dt>Total (INR)</dt>
            <dd>{formatPrice(quote.total)}</dd>
          </div>
        </dl>
      ) : (
        <div aria-hidden className="mt-3 space-y-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-4 animate-pulse rounded bg-line-light" />
          ))}
        </div>
      )}
    </aside>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}
