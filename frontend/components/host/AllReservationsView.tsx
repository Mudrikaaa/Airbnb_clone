"use client";

import { format } from "date-fns";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import useSWR from "swr";
import { ReservationRow } from "@/components/host/ReservationRow";
import { stateOf } from "@/components/host/reservation-state";
import { swrFetcher } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import type { Booking } from "@/lib/types";

/** /hosting/reservations — the full history on my listings (upcoming, current, completed, cancelled), newest first. */
export function AllReservationsView() {
  const { user } = useAuth();
  const { data, error } = useSWR<Booking[]>(user ? ["/api/host/bookings", user.id] : null, swrFetcher);
  const today = format(new Date(), "yyyy-MM-dd");
  const rows = (data ?? [])
    .map((b) => ({ booking: b, state: stateOf(b, today) }))
    .sort((a, b) => b.booking.check_in.localeCompare(a.booking.check_in));

  return (
    <main className="mx-auto w-full max-w-[1120px] px-6 pb-24 pt-8">
      <Link href="/hosting" aria-label="Back to Today" className="grid h-10 w-10 place-items-center rounded-full bg-chip hover:bg-[#EBEBEB]">
        <ChevronLeft size={18} strokeWidth={2.5} />
      </Link>
      <h1 className="mt-6 text-[32px] font-semibold leading-9 tracking-[-0.96px]">
        All reservations {data && <span className="text-lg font-normal tracking-normal text-muted">({data.length})</span>}
      </h1>

      {error ? (
        <p className="mt-10 text-base text-muted">We couldn’t load your reservations. Check that the API is running and refresh.</p>
      ) : !data ? (
        <div aria-hidden className="mt-8 space-y-4">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-[92px] animate-pulse rounded-[20px] bg-line-light" />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <p className="mt-10 text-base text-muted">No reservations on your listings yet.</p>
      ) : (
        <div className="mt-8 space-y-4">
          {rows.map(({ booking, state }) => (
            <ReservationRow key={booking.id} booking={booking} state={state} />
          ))}
        </div>
      )}
    </main>
  );
}
