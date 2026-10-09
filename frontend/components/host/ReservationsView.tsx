"use client";

import { format } from "date-fns";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import useSWR from "swr";
import { BookIllustration } from "@/components/host/BookIllustration";
import { Pills } from "@/components/host/Pills";
import { ReservationRow } from "@/components/host/ReservationRow";
import { isToday, stateOf } from "@/components/host/reservation-state";
import { swrFetcher } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import type { Booking } from "@/lib/types";

type Tab = "today" | "upcoming";

const TABS: { value: Tab; label: string }[] = [
  { value: "today", label: "Today" },
  { value: "upcoming", label: "Upcoming" },
];

const EMPTY: Record<Tab, string> = {
  today: "You don’t have any reservations",
  upcoming: "You don’t have any upcoming reservations",
};

/**
 * /hosting — Airbnb's "Today" page. The selected pill lives in the URL (?tab=upcoming), like airbnb.com.
 *
 * Layout measured on airbnb.co.in at 1440×900 and 1920×1080: under the 97px header a 96px sticky row
 * holds the pills (pills at y=121). The empty state is centred vertically in the rest of the window,
 * nudged 60px up (the 121px bottom padding), which puts the illustration at y=264 when the window is
 * 900px tall and y=354 when it's 1080px tall — the same as Airbnb at both sizes.
 */
export function ReservationsView() {
  const { user } = useAuth();
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const tab: Tab = params.get("tab") === "upcoming" ? "upcoming" : "today";
  const { data, error } = useSWR<Booking[]>(user ? ["/api/host/bookings", user.id] : null, swrFetcher);

  const today = format(new Date(), "yyyy-MM-dd");
  const rows = (data ?? []).map((b) => ({ booking: b, state: stateOf(b, today) }));
  const list =
    tab === "today"
      ? rows.filter((r) => isToday(r.state))
      : rows.filter((r) => r.state === "upcoming").sort((a, b) => a.booking.check_in.localeCompare(b.booking.check_in));

  const allLink = (
    <Link href="/hosting/reservations" className="text-base font-semibold underline">
      All reservations{data ? ` (${data.length})` : ""}
    </Link>
  );

  return (
    <main className="relative flex min-h-[calc(100vh-97px)] flex-col">
      <div className="sticky top-0 z-[100] mx-6 flex h-24 shrink-0 items-center justify-center bg-white">
        <Pills options={TABS} value={tab} onChange={(t) => router.replace(t === "today" ? pathname : `${pathname}?tab=${t}`, { scroll: false })} />
      </div>

      {error ? (
        <p className="mt-16 text-center text-base text-muted">We couldn’t load your reservations. Check that the API is running and refresh.</p>
      ) : !data ? (
        <div aria-hidden className="mx-auto mt-4 w-full max-w-[1120px] space-y-4 px-6">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-[92px] animate-pulse rounded-[20px] bg-line-light" />
          ))}
        </div>
      ) : list.length === 0 ? (
        <>
          <div className="flex flex-1 items-center justify-center px-6 pb-[121px]">
            <div className="flex w-[372px] max-w-full flex-col items-center text-center">
              <BookIllustration />
              {/* airbnb.com: 32px/600, -0.96px, balanced lines in a 372px box -> "You don’t have / any reservations" */}
              <h1 className="mt-6 text-balance text-[32px] font-semibold leading-9 tracking-[-0.96px]">{EMPTY[tab]}</h1>
              <p className="mt-4 text-lg leading-6 text-muted">To get more bookings, try our helpful listing tips</p>
              <Link href="/hosting/listings" className="mt-12 flex h-10 items-center rounded-full bg-chip px-6 text-sm font-medium hover:bg-[#EBEBEB]">
                Go to your listings
              </Link>
            </div>
          </div>
          {/* Out of the flow so it doesn't move the centred block */}
          <p className="absolute inset-x-0 bottom-10 text-center">{allLink}</p>
        </>
      ) : (
        <section aria-label={`${tab} reservations`} className="mx-auto w-full max-w-[1120px] px-6 pb-16 pt-4">
          <div className="space-y-4">
            {list.map(({ booking, state }) => (
              <ReservationRow key={booking.id} booking={booking} state={state} />
            ))}
          </div>
          <p className="mt-10 text-center">{allLink}</p>
        </section>
      )}
    </main>
  );
}
