import { mutate } from "swr";

/**
 * After a booking is created or cancelled, everything that shows availability must refetch:
 * the trips list, and that listing's calendar (/availability) and quotes. Search results refetch
 * by themselves when the explore page mounts again.
 */
export function refreshAfterBookingChange(listingId: number) {
  return mutate((key) => {
    const path = Array.isArray(key) ? key[0] : key;
    return typeof path === "string" && (path.startsWith("/api/bookings/me") || path.startsWith(`/api/listings/${listingId}/`));
  });
}
