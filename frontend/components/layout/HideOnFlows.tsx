"use client";

import { usePathname } from "next/navigation";
import { isCheckout, isHostForm } from "@/lib/chrome";

/** Checkout and the host's create/edit pages are focused flows with no footer (as on airbnb.com). */
export function HideOnFlows({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return isCheckout(pathname) || isHostForm(pathname) ? null : <>{children}</>;
}
