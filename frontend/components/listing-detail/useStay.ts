"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo } from "react";
import type { GuestKey } from "@/components/search/useSearchDraft";
import { type SearchState, countedGuests, parseSearch, toUrlQuery } from "@/lib/search-params";

/**
 * Dates and guests for the listing page live in the URL (?checkIn=&checkOut=&adults=…), just like
 * search. The calendar, booking card and mobile footer all read/write the same state, a refresh
 * keeps it, and the explore page can hand its dates over through the card link.
 */
export function useStay() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const state = useMemo(() => parseSearch(params), [params]);

  const write = (patch: Partial<SearchState>) => {
    const query = toUrlQuery({ ...state, ...patch });
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  };

  return {
    checkIn: state.checkIn,
    checkOut: state.checkOut,
    guests: state,
    /** Guests that count towards max_guests (at least 1 for quoting). */
    guestCount: Math.max(1, countedGuests(state)),
    setDates: (checkIn: string | null, checkOut: string | null) => write({ checkIn, checkOut }),
    setGuests: (key: GuestKey, value: number) => {
      const patch: Partial<SearchState> = { [key]: value };
      if (key !== "adults" && value > 0 && state.adults === 0) patch.adults = 1;
      write(patch);
    },
    query: toUrlQuery(state),
  };
}
