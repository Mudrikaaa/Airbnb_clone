"use client";

import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import useSWRInfinite from "swr/infinite";
import { CategoryBar } from "@/components/search/CategoryBar";
import { FiltersModal } from "@/components/search/FiltersModal";
import { EmptyState } from "@/components/listing/EmptyState";
import { ListingCard } from "@/components/listing/ListingCard";
import { ListingCardSkeleton } from "@/components/listing/ListingCardSkeleton";
import { swrFetcher } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { parseSearch, toApiQuery } from "@/lib/search-params";
import type { ListingPage } from "@/lib/types";
import { useWishlistToggle } from "@/lib/use-wishlist-toggle";

// 24 divides evenly into 2, 3, 4 and 6 columns, so "Show more" never leaves a ragged row mid-list.
const PAGE_SIZE = 24;

const GRID =
  "grid grid-cols-1 gap-x-6 gap-y-10 min-[550px]:grid-cols-2 min-[950px]:grid-cols-3 min-[1128px]:grid-cols-4 min-[1640px]:grid-cols-5 min-[1880px]:grid-cols-6";

/** Explore grid. Reads filters from the URL, loads pages with useSWRInfinite, "Show more" fetches the next one. */
export function ExploreListings() {
  const params = useSearchParams();
  const state = useMemo(() => parseSearch(params), [params]);
  const { user, ready } = useAuth();
  const [filtersOpen, setFiltersOpen] = useState(false);

  // The user id is part of the key so is_wishlisted refreshes when someone logs in or out.
  const { data, size, setSize, isLoading, isValidating, mutate, error } = useSWRInfinite<ListingPage>(
    (index, previous: ListingPage | null) => {
      if (!ready) return null; // wait until we know who's logged in, to avoid a double fetch
      if (previous && index * PAGE_SIZE >= previous.total) return null; // no more pages
      return [`/api/listings?${toApiQuery(state, index + 1, PAGE_SIZE)}`, user?.id ?? null];
    },
    swrFetcher,
  );

  const toggleWishlist = useWishlistToggle((listingId, saved) =>
    mutate(
      (pages) => pages?.map((p) => ({ ...p, items: p.items.map((l) => (l.id === listingId ? { ...l, is_wishlisted: saved } : l)) })),
      { revalidate: false },
    ),
  );

  const listings = data?.flatMap((p) => p.items) ?? [];
  const total = data?.[0]?.total;
  const loadingMore = isValidating && size > (data?.length ?? 0);
  const hasMore = total !== undefined && listings.length < total;
  const dates = state.checkIn && state.checkOut ? { checkIn: state.checkIn, checkOut: state.checkOut } : null;

  return (
    <>
      <CategoryBar state={state} onOpenFilters={() => setFiltersOpen(true)} />
      <FiltersModal open={filtersOpen} onClose={() => setFiltersOpen(false)} resultCount={total} />

      <main className="px-6 pb-8 pt-6 md:px-10 xl:px-12">
        {error ? (
          <p className="py-16 text-base text-muted">We couldn’t load stays right now. Check that the API is running and refresh.</p>
        ) : !ready || isLoading ? (
          <div className={GRID}>
            {Array.from({ length: 12 }, (_, i) => <ListingCardSkeleton key={i} />)}
          </div>
        ) : listings.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            {(state.location || dates) && (
              <p className="mb-6 text-sm font-medium">
                {total === 1 ? "1 home" : `${total} homes`}
                {state.location ? ` in ${state.location}` : ""}
              </p>
            )}
            <div className={GRID}>
              {listings.map((l) => (
                <ListingCard key={l.id} listing={l} dates={dates} onToggleWishlist={toggleWishlist} />
              ))}
              {loadingMore && Array.from({ length: 4 }, (_, i) => <ListingCardSkeleton key={`more-${i}`} />)}
            </div>
            {hasMore && (
              <div className="mt-14 flex flex-col items-center gap-4">
                <h2 className="text-lg font-semibold">Continue exploring homes</h2>
                <button
                  type="button"
                  disabled={loadingMore}
                  onClick={() => setSize(size + 1)}
                  className="h-12 rounded-btn bg-ink px-6 text-base font-semibold text-white hover:bg-black disabled:opacity-60"
                >
                  {loadingMore ? "Loading…" : "Show more"}
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </>
  );
}
