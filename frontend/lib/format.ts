import { format, isSameMonth, parseISO } from "date-fns";

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

export function plural(count: number, one: string, many = `${one}s`): string {
  return `${count} ${count === 1 ? one : many}`;
}
