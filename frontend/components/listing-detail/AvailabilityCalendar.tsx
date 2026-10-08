"use client";

import { format, isBefore, parseISO, startOfToday } from "date-fns";
import { DayPicker } from "react-day-picker";
import { lastPossibleCheckout } from "@/lib/availability";

type Props = {
  nights: Set<string>; // booked nights (yyyy-MM-dd)
  checkIn: string | null;
  checkOut: string | null;
  onChange: (checkIn: string | null, checkOut: string | null) => void;
  months?: 1 | 2;
};

const iso = (d: Date) => format(d, "yyyy-MM-dd");

/**
 * Range calendar with booked nights struck through.
 * - Picking check-in: booked nights are disabled.
 * - Picking check-out: only days up to the next booked night are allowed (that night's date
 *   itself is fine — you leave the morning the next guest arrives).
 */
export function AvailabilityCalendar({ nights, checkIn, checkOut, onChange, months = 2 }: Props) {
  const choosingCheckout = checkIn !== null && checkOut === null;
  const limit = choosingCheckout ? lastPossibleCheckout(nights, checkIn) : null;

  const disabled = (day: Date) => {
    const d = iso(day);
    if (isBefore(day, startOfToday())) return true;
    if (choosingCheckout && d > checkIn) return limit !== null && d > limit;
    return nights.has(d);
  };

  const pick = (day: Date) => {
    const d = iso(day);
    if (choosingCheckout && d > checkIn) {
      onChange(checkIn, d);
      return;
    }
    onChange(d, null); // start (or restart) the range
  };

  return (
    <DayPicker
      mode="range"
      numberOfMonths={months}
      selected={{ from: checkIn ? parseISO(checkIn) : undefined, to: checkOut ? parseISO(checkOut) : undefined }}
      onSelect={(_range, triggerDate) => pick(triggerDate)}
      disabled={disabled}
      modifiers={{ booked: (day) => nights.has(iso(day)) }}
      modifiersClassNames={{ booked: "rdp-booked" }}
      startMonth={startOfToday()}
      defaultMonth={checkIn ? parseISO(checkIn) : startOfToday()}
      showOutsideDays={false}
      formatters={{ formatWeekdayName: (d) => format(d, "EEEEE") }}
    />
  );
}
