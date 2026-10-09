import type { ReservationState } from "@/components/host/ReservationRow";
import type { Booking } from "@/lib/types";

/** Where a booking sits relative to today (dates are yyyy-MM-dd strings, so comparing them as text is safe). */
export function stateOf(b: Booking, today: string): ReservationState {
  if (b.status === "cancelled") return "cancelled";
  if (b.check_out < today) return "completed";
  if (b.check_out === today) return "leaving";
  if (b.check_in > today) return "upcoming";
  return b.check_in === today ? "arriving" : "current";
}

/** Today = guests in the place right now, arriving today or leaving today. */
export const isToday = (s: ReservationState) => s === "current" || s === "arriving" || s === "leaving";
