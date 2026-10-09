"use client";

import { format } from "date-fns";
import Link from "next/link";
import { useState } from "react";
import useSWR from "swr";
import { Pills } from "@/components/host/Pills";
import { ReservationRow, type ReservationState } from "@/components/host/ReservationRow";
import { swrFetcher } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import type { Booking } from "@/lib/types";

type Tab = "today" | "upcoming" | "past";

const TABS: { value: Tab; label: string }[] = [
  { value: "today", label: "Today" },
  { value: "upcoming", label: "Upcoming" },
  { value: "past", label: "Past" },
];

const EMPTY: Record<Tab, string> = {
  today: "You don’t have any reservations",
  upcoming: "You don’t have any upcoming reservations",
  past: "You don’t have any past reservations",
};

/** Where a booking sits relative to today (all dates are plain yyyy-MM-dd strings, so comparing them as text is safe). */
function stateOf(b: Booking, today: string): ReservationState {
  if (b.status === "cancelled") return "cancelled";
  if (b.check_out < today) return "completed";
  if (b.check_out === today) return "leaving";
  if (b.check_in > today) return "upcoming";
  return b.check_in === today ? "arriving" : "current";
}

/** /hosting — bookings on my listings, in Airbnb's Today / Upcoming pills (plus Past). */
export function ReservationsView() {
  const { user } = useAuth();
  const { data, error } = useSWR<Booking[]>(user ? ["/api/host/bookings", user.id] : null, swrFetcher);
  const [tab, setTab] = useState<Tab>("today");

  const today = format(new Date(), "yyyy-MM-dd");
  const rows = (data ?? []).map((b) => ({ booking: b, state: stateOf(b, today) }));
  const shown = {
    today: rows.filter((r) => r.state === "current" || r.state === "arriving" || r.state === "leaving"),
    upcoming: rows.filter((r) => r.state === "upcoming"),
    past: rows.filter((r) => r.state === "completed" || r.state === "cancelled"),
  };
  // Soonest first for what's ahead, most recent first for what's behind.
  shown.upcoming.sort((a, b) => a.booking.check_in.localeCompare(b.booking.check_in));
  shown.past.sort((a, b) => b.booking.check_out.localeCompare(a.booking.check_out));
  const list = shown[tab];

  return (
    <main className="px-6 pb-24 pt-8 md:px-20 md:pt-6">
      <div className="flex justify-center">
        <Pills options={TABS} value={tab} onChange={setTab} />
      </div>

      {error ? (
        <p className="mt-16 text-center text-base text-muted">We couldn’t load your reservations. Check that the API is running and refresh.</p>
      ) : !data ? (
        <div aria-hidden className="mt-10 space-y-4">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-[92px] animate-pulse rounded-[20px] bg-line-light" />
          ))}
        </div>
      ) : list.length === 0 ? (
        // Measured on airbnb.com: 260×196 illustration at y=264, 32px/600 title 24px below it,
        // 18px grey line 16px below the title, 40px grey pill 48px below that.
        <div className="mx-auto mt-[95px] flex max-w-[372px] flex-col items-center text-center">
          <div aria-hidden className="grid h-[196px] w-[260px] place-items-center text-[140px] leading-none">📖</div>
          <h1 className="mt-6 text-[32px] font-semibold leading-9">{EMPTY[tab]}</h1>
          <p className="mt-4 text-lg leading-6 text-muted">To get more bookings, try our helpful listing tips</p>
          <Link href="/hosting/listings" className="mt-12 flex h-10 items-center rounded-full bg-chip px-6 text-sm font-medium hover:bg-[#EBEBEB]">
            Go to your listings
          </Link>
        </div>
      ) : (
        <section aria-label={`${tab} reservations`} className="mt-10">
          <h1 className="text-[32px] font-semibold leading-9 tracking-[-0.96px]">
            {tab === "today" ? "Today" : tab === "upcoming" ? "Upcoming reservations" : "Past reservations"}{" "}
            <span className="text-lg font-normal text-muted">({list.length})</span>
          </h1>
          <div className="mt-8 space-y-4">
            {list.map(({ booking, state }) => (
              <ReservationRow key={booking.id} booking={booking} state={state} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
