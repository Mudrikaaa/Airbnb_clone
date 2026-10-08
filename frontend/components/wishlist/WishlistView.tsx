"use client";

import Link from "next/link";
import useSWR from "swr";
import { LoginPrompt } from "@/components/auth/LoginPrompt";
import { LISTING_GRID } from "@/components/listing/grid";
import { ListingCard } from "@/components/listing/ListingCard";
import { ListingCardSkeleton } from "@/components/listing/ListingCardSkeleton";
import { swrFetcher } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import type { ListingCard as Listing } from "@/lib/types";
import { useWishlistToggle } from "@/lib/use-wishlist-toggle";

/** /wishlists — everything the user saved with the heart, most recent first. */
export function WishlistView() {
  const { user, ready, userLoading } = useAuth();
  const { data, error, mutate } = useSWR<Listing[]>(user ? ["/api/wishlists", user.id] : null, swrFetcher);

  // Un-saving here drops the card right away (optimistic); a failed request puts it back.
  const toggle = useWishlistToggle((listingId, saved) => {
    if (!saved) mutate((items) => items?.filter((l) => l.id !== listingId), { revalidate: false });
    else mutate(); // restore after a failed removal: refetch the real list
  });

  if (!ready || userLoading) {
    return (
      <main aria-hidden className="px-6 pt-8 md:px-20 md:pt-[92px]">
        <h1 className="text-[32px] font-semibold leading-9 tracking-[-0.96px]">Wishlists</h1>
      </main>
    );
  }
  if (!user) {
    return <LoginPrompt heading="Wishlists" title="Log in to view your wishlists" text="You can create, view, or edit wishlists once you’ve logged in." />;
  }

  return (
    <main className="px-6 pb-24 pt-8 md:px-20 md:pt-[92px]">
      <h1 className="text-[32px] font-semibold leading-9 tracking-[-0.96px]">Wishlists</h1>

      {error ? (
        <p className="mt-12 text-base text-muted">We couldn’t load your wishlist. Check that the API is running and refresh.</p>
      ) : !data ? (
        <div className={`${LISTING_GRID} mt-12`}>
          {Array.from({ length: 4 }, (_, i) => (
            <ListingCardSkeleton key={i} />
          ))}
        </div>
      ) : data.length === 0 ? (
        <div className="mt-12 max-w-md">
          <h2 className="text-[22px] font-medium leading-[26px] tracking-[-0.44px]">Create your first wishlist</h2>
          <p className="mt-2 text-base">As you search, click the heart icon to save your favourite places to a wishlist.</p>
          <Link href="/" className="mt-6 inline-block rounded-btn bg-ink px-6 py-3.5 text-base font-semibold text-white hover:bg-black">
            Start exploring
          </Link>
        </div>
      ) : (
        <>
          <p className="mt-2 text-base text-muted">{data.length === 1 ? "1 saved home" : `${data.length} saved homes`}</p>
          <div className={`${LISTING_GRID} mt-10`}>
            {data.map((l) => (
              <ListingCard key={l.id} listing={l} onToggleWishlist={toggle} />
            ))}
          </div>
        </>
      )}
    </main>
  );
}
