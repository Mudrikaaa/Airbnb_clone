"use client";

import { differenceInCalendarDays, parseISO } from "date-fns";
import { AvailabilityCalendar } from "@/components/listing-detail/AvailabilityCalendar";
import { useStay } from "@/components/listing-detail/useStay";
import { formatLongDate, plural } from "@/lib/format";
import { useMediaQuery } from "@/lib/use-media-query";

/** Inline 2-month calendar in the left column; shares the stay (URL) with the booking card. */
export function CalendarSection({ city, nights }: { city: string; nights: Set<string> }) {
  const { checkIn, checkOut, setDates } = useStay();
  const twoMonths = useMediaQuery("(min-width: 744px)");

  let heading = "Select check-in date";
  let sub = "Add your travel dates for exact pricing";
  if (checkIn && !checkOut) {
    heading = "Select checkout date";
    sub = "Minimum stay: 1 night";
  } else if (checkIn && checkOut) {
    heading = `${plural(differenceInCalendarDays(parseISO(checkOut), parseISO(checkIn)), "night")} in ${city}`;
    sub = `${formatLongDate(checkIn)} – ${formatLongDate(checkOut)}`;
  }

  return (
    <section id="calendar" className="scroll-mt-24 border-b border-line py-12">
      <h2 className="text-heading font-medium">{heading}</h2>
      <p className="mt-2 text-sm text-muted">{sub}</p>
      <div className="mt-6 -ml-2 [&_.rdp-months]:justify-start [&_.rdp-root]:[--cell:44px]">
        <AvailabilityCalendar nights={nights} checkIn={checkIn} checkOut={checkOut} onChange={setDates} months={twoMonths ? 2 : 1} />
      </div>
      <div className="mt-4 flex justify-end">
        <button type="button" onClick={() => setDates(null, null)} disabled={!checkIn}
          className="rounded-lg px-2 py-1 text-sm font-medium underline hover:bg-subtle disabled:text-line-strong disabled:no-underline">
          Clear dates
        </button>
      </div>
    </section>
  );
}
