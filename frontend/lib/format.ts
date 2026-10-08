import { differenceInDays, differenceInMonths, differenceInYears, format, formatDistanceToNowStrict, isSameMonth, parseISO } from "date-fns";

// Display-only helpers. Prices are always computed by the backend; we only format them.

export function formatPrice(amount: number): string {
  return `₹${amount.toLocaleString("en-IN")}`;
}

export function formatRating(rating: number): string {
  // Airbnb shows 4.9, 4.85, 5.0 — at least one decimal, at most two.
  const fixed = rating.toFixed(2);
  return fixed.endsWith("0") ? rating.toFixed(1) : fixed;
}

/** "12–15 Oct" or "30 Oct – 2 Nov" (Airbnb India style). */
export function formatDateRange(checkIn: string | Date, checkOut: string | Date): string {
  const a = typeof checkIn === "string" ? parseISO(checkIn) : checkIn;
  const b = typeof checkOut === "string" ? parseISO(checkOut) : checkOut;
  if (isSameMonth(a, b)) return `${format(a, "d")}–${format(b, "d MMM")}`;
  return `${format(a, "d MMM")} – ${format(b, "d MMM")}`;
}

/** "15 Oct 2026" */
export function formatLongDate(iso: string): string {
  return format(parseISO(iso), "d MMM yyyy");
}

/** Review date like Airbnb: "3 weeks ago" for recent stays, "August 2026" for older ones. */
export function formatReviewDate(iso: string): string {
  const date = parseISO(iso);
  return differenceInDays(new Date(), date) <= 60 ? `${formatDistanceToNowStrict(date)} ago` : format(date, "MMMM yyyy");
}

/** "4 years on Airbnb" / "7 months on Airbnb" (used for reviewers and hosts). */
export function timeOnAirbnb(joinedIso: string): { value: number; unit: string } {
  const joined = parseISO(joinedIso);
  const years = differenceInYears(new Date(), joined);
  if (years >= 1) return { value: years, unit: years === 1 ? "year" : "years" };
  const months = Math.max(1, differenceInMonths(new Date(), joined));
  return { value: months, unit: months === 1 ? "month" : "months" };
}

export function plural(count: number, one: string, many = `${one}s`): string {
  return `${count} ${count === 1 ? one : many}`;
}
