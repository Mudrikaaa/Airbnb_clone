"use client";

import { CircleCheck, KeyRound, type LucideIcon, Map, MessageSquare, SprayCan, Star, Tag } from "lucide-react";
import { useState } from "react";
import { GuestsMention } from "@/components/listing-detail/GuestsMention";
import { BigLaurel } from "@/components/listing-detail/Laurel";
import { Stars } from "@/components/listing-detail/Overview";
import { Avatar } from "@/components/ui/Avatar";
import { GreyButton } from "@/components/ui/GreyButton";
import { Modal } from "@/components/ui/Modal";
import { formatRating, formatReviewDate, plural, timeOnAirbnb } from "@/lib/format";
import { isGuestFavourite } from "@/lib/listing";
import { RATING_CATEGORIES, type CategoryRatings, type RatingCategory, type Review } from "@/lib/types";

const PREVIEW = 6;

type Props = { reviews: Review[] | undefined; average: number | null; count: number; categories: CategoryRatings<number | null> };

const CATEGORY_ICONS: Record<RatingCategory, LucideIcon> = {
  cleanliness: SprayCan,
  accuracy: CircleCheck,
  check_in: KeyRound,
  communication: MessageSquare,
  location: Map,
  value: Tag,
};

export function Reviews({ reviews, average, count, categories }: Props) {
  const [open, setOpen] = useState(false);
  const [howOpen, setHowOpen] = useState(false);

  if (count === 0) {
    return (
      <section id="reviews" className="scroll-mt-24 border-b border-line py-12">
        <h2 className="flex items-center gap-2 text-[22px] font-medium tracking-[-0.44px]">
          <Star size={18} fill="currentColor" strokeWidth={0} /> No reviews (yet)
        </h2>
        <p className="mt-2 text-base text-muted">This place is new on Airbnb. Be one of the first guests to stay and leave a review.</p>
      </section>
    );
  }

  const favourite = isGuestFavourite(average, count);
  // Count of each star rating, for the "Overall rating" bars.
  const breakdown = [5, 4, 3, 2, 1].map((stars) => ({ stars, n: reviews?.filter((r) => r.rating === stars).length ?? 0 }));

  return (
    <section id="reviews" className="scroll-mt-24 border-b border-line py-12">
      {favourite ? (
        <div className="flex flex-col items-center text-center">
          <div className="flex items-center gap-2">
            <BigLaurel size={104} id="laurel-left" />
            {/* airbnb.co.in: 100px, semibold, -2px letter-spacing */}
            <span className="text-[72px] font-semibold leading-none tracking-[-2px] md:text-[100px]">{formatRating(average!)}</span>
            <BigLaurel size={104} flip id="laurel-right" />
          </div>
          <h2 className="mt-4 text-[22px] font-medium tracking-[-0.44px]">Guest favourite</h2>
          <p className="mt-2 max-w-sm text-lg text-muted">This home is a guest favourite based on ratings, reviews and reliability</p>
          <button type="button" onClick={() => setHowOpen(true)} className="mt-3 text-sm text-muted underline">
            How reviews work
          </button>
        </div>
      ) : (
        <h2 className="flex items-center gap-2 text-[22px] font-medium tracking-[-0.44px]">
          <Star size={18} fill="currentColor" strokeWidth={0} />
          {formatRating(average!)} · {plural(count, "review")}
        </h2>
      )}

      {/* Airbnb's row: overall rating bars, then one column per category (label, average, icon), with dividers */}
      <div className={`mt-10 flex flex-wrap gap-y-6 lg:flex-nowrap ${favourite ? "border-b border-line pb-8" : ""}`}>
      {/* Overall rating: 124×4px bars, #DDD track with #222 fill */}
      <div className="w-48 shrink-0 pr-6">
        <p className="text-sm font-medium">Overall rating</p>
        <ul className="mt-1.5">
          {breakdown.map(({ stars, n }) => (
            <li key={stars} className="flex h-[18px] items-center gap-2 text-xs leading-none text-muted">
              <span className="w-2">{stars}</span>
              <span className="h-1 w-[124px] rounded-sm bg-line">
                <span className="block h-1 rounded-sm bg-ink" style={{ width: `${reviews && reviews.length ? (n / reviews.length) * 100 : 0}%` }} />
              </span>
            </li>
          ))}
        </ul>
      </div>
      {RATING_CATEGORIES.filter((c) => categories[c.key] !== null).map(({ key, label }) => {
        const CategoryIcon = CATEGORY_ICONS[key];
        return (
          <div key={key} className="flex min-w-[96px] flex-1 flex-col border-l border-line-light px-6">
            <p className="text-sm font-medium leading-[18px]">{label}</p>
            {/* Airbnb shows category averages with exactly one decimal (4.75 → 4.8) */}
            <p className="mt-1 text-base font-medium leading-5">{categories[key]!.toFixed(1)}</p>
            <CategoryIcon size={32} strokeWidth={1.25} className="mt-6" />
          </div>
        );
      })}
      </div>

      <GuestsMention reviews={reviews} />

      <div className="mt-10 grid gap-x-24 gap-y-10 md:grid-cols-2">
        {(reviews ?? []).slice(0, PREVIEW).map((r) => (
          <ReviewCard key={r.id} review={r} clamp />
        ))}
      </div>

      {reviews && reviews.length > 0 && (
        <GreyButton onClick={() => setOpen(true)} className="mt-10">
          Show all {plural(count, "review")}
        </GreyButton>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title={`${formatRating(average!)} · ${plural(count, "review")}`} widthClass="max-w-[780px]">
        <div className="space-y-10">
          {(reviews ?? []).map((r) => (
            <ReviewCard key={r.id} review={r} />
          ))}
        </div>
      </Modal>
      <Modal open={howOpen} onClose={() => setHowOpen(false)} title="How reviews work">
        <div className="space-y-4 text-base leading-6">
          <p>Only guests who stayed and checked out can leave a review, and only one per stay, so every review comes from a completed booking.</p>
          <p>Guests rate their stay from 1 to 5 stars. The rating you see is the plain average of all reviews for this home, rounded to two decimals, and it updates as soon as a new review is posted.</p>
          <p>Homes with an average of 4.8 or higher from at least 3 reviews are marked as a Guest favourite.</p>
        </div>
      </Modal>
    </section>
  );
}

function ReviewCard({ review, clamp = false }: { review: Review; clamp?: boolean }) {
  const onAirbnb = timeOnAirbnb(review.author.joined_at);
  return (
    <article>
      <div className="flex items-center gap-3">
        <Avatar user={review.author} size={48} />
        <div>
          <h3 className="text-base font-medium">{review.author.name.split(" ")[0]}</h3>
          <p className="text-sm text-muted">
            {onAirbnb.value} {onAirbnb.unit} on Airbnb
          </p>
        </div>
      </div>
      <p className="mt-3 flex items-center gap-1.5 text-sm font-medium">
        <Stars rating={review.rating} size={9} />
        <span aria-hidden>·</span>
        {formatReviewDate(review.created_at)}
      </p>
      <p className={`mt-1 text-base leading-6 ${clamp ? "line-clamp-3" : ""}`}>{review.comment}</p>
    </article>
  );
}
