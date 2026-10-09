"use client";

import Link from "next/link";
import useSWR from "swr";
import { RequireLogin } from "@/components/auth/RequireLogin";
import { ListingEditor } from "@/components/host/listing-editor/ListingEditor";
import { ApiError, swrFetcher } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import type { ListingDetail } from "@/lib/types";

/** /hosting/listings/[id]/edit — loads the listing, checks it's mine, then shows the section-by-section editor. */
export function EditListing({ id }: { id: number }) {
  return (
    <RequireLogin heading="Edit listing" title="Log in to edit your listing" text="You can edit your listings once you’ve logged in.">
      <Loader id={id} />
    </RequireLogin>
  );
}

function Loader({ id }: { id: number }) {
  const { user } = useAuth();
  const { data: listing, error } = useSWR<ListingDetail>(user ? [`/api/listings/${id}`, user.id] : null, swrFetcher);

  const back = (
    <Link href="/hosting/listings" className="mt-8 inline-block rounded-btn bg-ink px-6 py-3 text-base font-semibold text-white">
      Back to your listings
    </Link>
  );

  if (error) {
    const missing = error instanceof ApiError && error.status === 404;
    return (
      <main className="mx-auto max-w-[760px] px-6 py-16">
        <h1 className="text-[32px] font-semibold">{missing ? "We couldn’t find that listing" : "Something went wrong"}</h1>
        {back}
      </main>
    );
  }
  if (!listing) return <div aria-hidden className="mx-auto mt-10 h-96 max-w-[760px] animate-pulse rounded-3xl bg-line-light" />;

  // The backend would answer 403 to a save anyway; this just explains it up front.
  if (listing.host.id !== user?.id) {
    return (
      <main className="mx-auto max-w-[760px] px-6 py-16">
        <h1 className="text-[32px] font-semibold">This isn’t your listing</h1>
        <p className="mt-2 text-lg text-muted">You can only edit listings you host.</p>
        {back}
      </main>
    );
  }
  return <ListingEditor listing={listing} />;
}
