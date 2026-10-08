import { addDays, format, isBefore, parseISO } from "date-fns";
import type { Availability } from "@/lib/types";

// Same rule as the backend (services/availability.py): a stay occupies the *nights*
// check_in … check_out-1. The check-out day itself is free for the next guest's check-in.

const iso = (d: Date) => format(d, "yyyy-MM-dd");

/** Every booked night as "yyyy-MM-dd". */
export function bookedNights(availability: Availability | undefined): Set<string> {
  const nights = new Set<string>();
  for (const { check_in, check_out } of availability?.booked ?? []) {
    for (let d = parseISO(check_in); isBefore(d, parseISO(check_out)); d = addDays(d, 1)) nights.add(iso(d));
  }
  return nights;
}

/** True when any night of [checkIn, checkOut) is already booked. */
export function rangeHasBookedNight(nights: Set<string>, checkIn: string, checkOut: string): boolean {
  for (let d = parseISO(checkIn); isBefore(d, parseISO(checkOut)); d = addDays(d, 1)) {
    if (nights.has(iso(d))) return true;
  }
  return false;
}

/**
 * Latest valid check-out for a given check-in: the first booked night on or after check-in
 * (you can leave on the morning someone else arrives). null = no limit.
 */
export function lastPossibleCheckout(nights: Set<string>, checkIn: string): string | null {
  const sorted = [...nights].filter((n) => n > checkIn).sort();
  return sorted[0] ?? null;
}
