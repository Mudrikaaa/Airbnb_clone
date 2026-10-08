"use client";

import { useRouter } from "next/navigation";
import useSWR from "swr";
import { useStay } from "@/components/listing-detail/useStay";
import { ApiError, swrFetcher } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { rangeHasBookedNight } from "@/lib/availability";
import type { ListingDetail, Quote } from "@/lib/types";

/**
 * Everything the booking card, mobile footer and sticky nav share: the quote from the backend
 * (the frontend never computes prices), whether the stay can be booked and, if not, why.
 */
export function useBooking(listing: ListingDetail, bookedNights: Set<string>) {
  const stay = useStay();
  const { user, openLogin } = useAuth();
  const router = useRouter();
  const hasDates = Boolean(stay.checkIn && stay.checkOut);
  const clashes = hasDates && rangeHasBookedNight(bookedNights, stay.checkIn!, stay.checkOut!);

  const quoteKey =
    hasDates && !clashes
      ? `/api/listings/${listing.id}/quote?check_in=${stay.checkIn}&check_out=${stay.checkOut}&guests=${stay.guestCount}`
      : null;
  const { data: quote, error: quoteError, isLoading: quoteLoading } = useSWR<Quote>(quoteKey, swrFetcher);

  const isOwnListing = user?.id === listing.host.id;

  // Why Reserve is blocked (null = it isn't).
  let problem: string | null = null;
  if (isOwnListing) problem = "This is your listing, so you can’t book it.";
  else if (clashes || quote?.available === false)
    problem = "Those dates are not available — part of this stay is already booked. Pick different dates.";
  else if (quoteError) problem = quoteError instanceof ApiError ? quoteError.detail : "Couldn’t get a price for these dates.";

  const reserve = () => {
    if (!hasDates || problem) return;
    if (!user) return openLogin();
    router.push(`/book/${listing.id}?${stay.query}`);
  };

  return { stay, hasDates, quote: problem ? undefined : quote, quoteLoading, problem, reserve, canReserve: hasDates && !problem && !!quote };
}
