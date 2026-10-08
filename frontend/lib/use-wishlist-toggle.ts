"use client";

import { toast } from "sonner";
import { ApiError, api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

/**
 * Save / unsave with an optimistic update: `apply` flips the heart immediately, and is called again
 * with the old value if the request fails. Logged-out users get the login modal instead.
 */
export function useWishlistToggle(apply: (listingId: number, saved: boolean) => void) {
  const { user, openLogin } = useAuth();

  return async (listingId: number, currentlySaved: boolean) => {
    if (!user) {
      openLogin();
      return;
    }
    const next = !currentlySaved;
    apply(listingId, next);
    try {
      await (next ? api.saveToWishlist(listingId) : api.removeFromWishlist(listingId));
      toast.success(next ? "Saved to wishlist" : "Removed from wishlist");
    } catch (err) {
      apply(listingId, currentlySaved);
      toast.error(err instanceof ApiError ? err.detail : "Couldn’t update your wishlist. Try again.");
    }
  };
}
