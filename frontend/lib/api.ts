// Single entry point for all backend calls. Every request goes through apiFetch
// so the base URL, mock-auth header and error shape are handled in one place.

import type { Category, ListingPage, User } from "@/lib/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

// Same key the auth context uses.
export const USER_ID_STORAGE_KEY = "currentUserId";

export class ApiError extends Error {
  constructor(
    public status: number,
    public detail: string,
  ) {
    super(detail);
    this.name = "ApiError";
  }
}

export function getStoredUserId(): string | null {
  if (typeof window === "undefined") return null; // no localStorage on the server
  try {
    return window.localStorage.getItem(USER_ID_STORAGE_KEY);
  } catch {
    return null; // storage blocked (private mode etc.) — behave as logged out
  }
}

export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  if (init.body && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");

  const userId = getStoredUserId();
  if (userId) headers.set("X-User-Id", userId);

  const res = await fetch(`${API_URL}${path}`, { ...init, headers });

  if (!res.ok) {
    // Backend errors are always {"detail": "..."}.
    let detail = res.statusText;
    try {
      const body = await res.json();
      if (typeof body?.detail === "string") detail = body.detail;
    } catch {
      // non-JSON error body; keep statusText
    }
    throw new ApiError(res.status, detail);
  }

  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

// SWR fetcher: keys are either a path or [path, userId] (userId only busts the cache on login change).
export const swrFetcher = <T>(key: string | [string, unknown]) => apiFetch<T>(Array.isArray(key) ? key[0] : key);

// Typed wrappers for the calls used in more than one place.
export const api = {
  users: () => apiFetch<User[]>("/api/users"),
  categories: () => apiFetch<Category[]>("/api/meta/categories"),
  searchListings: (query: string) => apiFetch<ListingPage>(`/api/listings?${query}`),
  saveToWishlist: (listingId: number) => apiFetch<void>(`/api/wishlists/${listingId}`, { method: "PUT" }),
  removeFromWishlist: (listingId: number) => apiFetch<void>(`/api/wishlists/${listingId}`, { method: "DELETE" }),
};
