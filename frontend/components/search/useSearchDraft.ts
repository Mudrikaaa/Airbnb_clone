"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { type SearchState, parseSearch, toUrlQuery } from "@/lib/search-params";

export type Segment = "where" | "when" | "who";
export type GuestKey = "adults" | "children" | "infants" | "pets";

/**
 * The search bar edits a *draft* copy of the URL state; nothing changes for the listings until
 * the user presses Search, which pushes the draft into the URL (the source of truth).
 */
export function useSearchDraft() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const fromUrl = useMemo(() => parseSearch(params), [params]);
  const [draft, setDraft] = useState<SearchState>(fromUrl);

  // When the URL changes (back button, category click…), start the draft again from it.
  // Done during render (React's "adjust state when a prop changes" pattern) instead of an effect,
  // so there's no extra render with a stale draft.
  const [syncedWith, setSyncedWith] = useState(fromUrl);
  if (syncedWith !== fromUrl) {
    setSyncedWith(fromUrl);
    setDraft(fromUrl);
  }

  const update = (patch: Partial<SearchState>) => setDraft((d) => ({ ...d, ...patch }));

  const setGuests = (key: GuestKey, value: number) =>
    setDraft((d) => {
      const next = { ...d, [key]: value };
      // Like Airbnb: children, infants or pets need at least one adult.
      if (key !== "adults" && value > 0 && next.adults === 0) next.adults = 1;
      return next;
    });

  const submit = () => {
    // Nothing typed, picked or counted = "show me everything", like Airbnb: back to all homes,
    // dropping any old category / filters rather than silently keeping them.
    const nothingEntered = !draft.location.trim() && !draft.checkIn && draft.adults + draft.children + draft.infants + draft.pets === 0;
    const query = nothingEntered ? "" : toUrlQuery(draft);
    router.push(query ? `/?${query}` : "/");
    if (pathname === "/") window.scrollTo({ top: 0 });
  };

  return { draft, update, setGuests, submit, fromUrl };
}
