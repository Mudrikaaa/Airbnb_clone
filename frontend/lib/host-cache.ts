import { mutate } from "swr";

/** After a listing is created, edited or deleted: refetch the host's lists and any cached listing pages. */
export function refreshAfterListingChange() {
  return mutate((key) => {
    const path = Array.isArray(key) ? key[0] : key;
    return typeof path === "string" && (path.startsWith("/api/host/") || path.startsWith("/api/listings/") || path.startsWith("/api/wishlists"));
  });
}
