"use client";

import { format, isBefore, parseISO, startOfToday } from "date-fns";
import { DayPicker } from "react-day-picker";

type Props = {
  checkIn: string | null;
  checkOut: string | null;
  onChange: (checkIn: string | null, checkOut: string | null) => void;
  /** Called once both dates are picked (the search bar then moves on to "Who"). */
  onComplete?: () => void;
  months?: 1 | 2;
};

const toIso = (d: Date) => format(d, "yyyy-MM-dd");

/**
 * Airbnb's range behaviour: first click = check-in, second click (a later day) = check-out.
 * Clicking again after a full range starts a new one. Past days are disabled.
 */
export function DatesPanel({ checkIn, checkOut, onChange, onComplete, months = 2 }: Props) {
  const from = checkIn ? parseISO(checkIn) : undefined;
  const to = checkOut ? parseISO(checkOut) : undefined;

  const pick = (day: Date) => {
    if (!from || to || !isBefore(from, day)) {
      onChange(toIso(day), null); // start a new range (also when clicking on/before check-in)
      return;
    }
    onChange(toIso(from), toIso(day));
    onComplete?.();
  };

  return (
    <DayPicker
      mode="range"
      numberOfMonths={months}
      selected={{ from, to }}
      onSelect={(_range, triggerDate) => pick(triggerDate)}
      disabled={{ before: startOfToday() }}
      startMonth={startOfToday()}
      defaultMonth={from ?? startOfToday()}
      showOutsideDays={false}
      weekStartsOn={0}
      formatters={{ formatWeekdayName: (d) => format(d, "EEEEE") }}
    />
  );
}
