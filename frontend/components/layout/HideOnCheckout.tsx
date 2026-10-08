"use client";

import { usePathname } from "next/navigation";

/** Airbnb's checkout has no footer or tab bar, so the layout wraps them in this. */
export function HideOnCheckout({ children }: { children: React.ReactNode }) {
  return usePathname().startsWith("/book/") ? null : <>{children}</>;
}
