"use client";

import { Star } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { mutate } from "swr";
import { Modal } from "@/components/ui/Modal";
import { ApiError, apiFetch } from "@/lib/api";
import type { Booking } from "@/lib/types";

const MIN_COMMENT = 10;
const LABELS = ["Terrible", "Poor", "Okay", "Good", "Great"];

type Props = { booking: Booking | null; onClose: () => void };

/** "Write a review" for a finished stay: 1–5 stars + comment. The server checks the stay is yours and over. */
export function ReviewModal({ booking, onClose }: Props) {
  // Keyed by booking so every opening starts empty.
  return booking ? <ReviewForm key={booking.id} booking={booking} onClose={onClose} /> : null;
}

function ReviewForm({ booking, onClose }: { booking: Booking; onClose: () => void }) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const length = comment.trim().length;
  const valid = rating > 0 && length >= MIN_COMMENT;

  const submit = async () => {
    if (!valid) return;
    setBusy(true);
    setError(null);
    try {
      const id = booking.listing.id;
      await apiFetch(`/api/listings/${id}/reviews`, {
        method: "POST",
        body: JSON.stringify({ booking_id: booking.id, rating, comment: comment.trim() }),
      });
      // Refetch the trip (button → stars) and everything that shows this listing's reviews or rating.
      await mutate((key) => {
        const path = Array.isArray(key) ? key[0] : key;
        return (
          typeof path === "string" &&
          (path.startsWith("/api/bookings/me") ||
            path === `/api/listings/${id}` ||
            path.startsWith(`/api/listings/${id}/`) ||
            path.startsWith("/api/listings?"))
        );
      });
      toast.success("Review posted");
      onClose();
    } catch (err) {
      setError(err instanceof ApiError ? err.detail : "Couldn’t post your review. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const shown = hover || rating;
  return (
    <Modal
      open
      onClose={busy ? () => {} : onClose}
      title="Write a review"
      footer={
        <div className="flex items-center justify-between gap-4">
          <button type="button" onClick={onClose} disabled={busy} className="rounded-lg px-2 py-2 text-base font-semibold underline">
            Cancel
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={!valid || busy}
            className="h-12 rounded-btn bg-ink px-6 text-base font-semibold text-white hover:bg-black disabled:cursor-not-allowed disabled:bg-line-strong"
          >
            {busy ? "Posting…" : "Post review"}
          </button>
        </div>
      }
    >
      <h3 className="text-[22px] font-semibold leading-[26px]">How was your stay?</h3>
      <p className="mt-2 text-base text-muted">
        {booking.listing.title} · {booking.listing.city}
      </p>

      <div className="mt-6 flex items-center gap-1" role="radiogroup" aria-label="Rating" onMouseLeave={() => setHover(0)}>
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={rating === n}
            aria-label={`${n} star${n > 1 ? "s" : ""}`}
            onClick={() => setRating(n)}
            onMouseEnter={() => setHover(n)}
            className="p-1"
          >
            <Star size={32} strokeWidth={1.5} className={n <= shown ? "fill-ink text-ink" : "text-line-strong"} />
          </button>
        ))}
        <span className="ml-3 text-base font-medium">{shown ? LABELS[shown - 1] : ""}</span>
      </div>

      <label htmlFor="review-comment" className="mt-6 block text-base font-semibold">
        Tell future guests about your stay
      </label>
      <textarea
        id="review-comment"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        rows={5}
        maxLength={2000}
        placeholder="What did you love? Anything to know before booking?"
        className="mt-2 w-full resize-none rounded-lg border border-line-strong p-3 text-base outline-none focus:border-ink focus:ring-1 focus:ring-ink"
      />
      <p className="mt-1 text-sm text-muted">
        {length < MIN_COMMENT ? `At least ${MIN_COMMENT} characters (${length}/${MIN_COMMENT})` : `${comment.length}/2000`}
      </p>
      {error && (
        <p role="alert" className="mt-3 text-sm font-medium text-[#C13515]">
          {error}
        </p>
      )}
    </Modal>
  );
}
