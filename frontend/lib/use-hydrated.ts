"use client";

import { useSyncExternalStore } from "react";

const noopSubscribe = () => () => {};

/**
 * false while this component hydrates, true afterwards. Use it to gate anything that depends on
 * the logged-in user: components inside a Suspense boundary can hydrate *after* AuthProvider has
 * already switched to client values, so reading `ready` from context isn't enough to avoid a
 * server/client mismatch.
 */
export function useHydrated(): boolean {
  return useSyncExternalStore(noopSubscribe, () => true, () => false);
}
