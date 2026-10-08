"use client";

import Link from "next/link";
import { useMemo } from "react";
import useSWR from "swr";
import { Checkout } from "@/components/booking/Checkout";
import { ApiError, swrFetcher } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { bookedNights } from "@/lib/availability";
import type { Availability, ListingDetail } from "@/lib/types";

/** Loads the listing + booked dates for /book/[id], then hands over to <Checkout>. */
export function BookingFlow({ id }: { id: number }) {
  const { user, ready } = useAuth();
  const { data: listing, error } = useSWR<ListingDetail>(ready ? [`/api/listings/${id}`, user?.id ?? null] : null, swrFetcher);
  const { data: availability } = useSWR<Availability>(`/api/listings/${id}/availability`, swrFetcher);
  const nights = useMemo(() => bookedNights(availability), [availability]);

  if (error) {
    const missing = error instanceof ApiError && error.status === 404;
    return (
      <main className="mx-auto max-w-[1024px] px-6 py-24">
        <h1 className="text-[32px] font-semibold">{missing ? "This place isn’t available" : "Something went wrong"}</h1>
        <Link href="/" className="mt-8 inline-block rounded-btn bg-ink px-6 py-3 text-base font-semibold text-white">
          Explore other homes
        </Link>
      </main>
    );
  }
  if (!listing) {
    return (
      <main aria-hidden className="mx-auto max-w-[1024px] px-6 pt-8">
        <div className="h-9 w-72 animate-pulse rounded bg-line-light" />
        <div className="mt-8 grid gap-8 lg:grid-cols-[524px_372px] lg:justify-between">
          <div className="h-60 animate-pulse rounded-3xl bg-line-light" />
          <div className="h-[420px] animate-pulse rounded-3xl bg-line-light" />
        </div>
      </main>
    );
  }
  return <Checkout listing={listing} nights={nights} />;
}
