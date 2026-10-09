"use client";

import { usePathname } from "next/navigation";
import { isCheckout, isHostDashboard, isHostForm } from "@/lib/chrome";

/**
 * Hides the root layout's footer: checkout and the host create/edit pages are focused flows with no
 * footer (as on airbnb.com), and the host dashboard renders its footer inside its own scroll area.
 */
export function HideOnFlows({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return isCheckout(pathname) || isHostForm(pathname) || isHostDashboard(pathname) ? null : <>{children}</>;
}
