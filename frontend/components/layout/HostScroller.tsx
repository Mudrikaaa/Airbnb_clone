"use client";

import { usePathname } from "next/navigation";
import { isHostDashboard, isHostForm, isListingEditor } from "@/lib/chrome";

/**
 * Same structure as airbnb.co.in/hosting (measured at 1440 and 1920px): the page itself never
 * scrolls. Everything under the 97px header — the content and the footer — lives in one scroll area
 * that is exactly as tall as the rest of the window, with a scrollbar that takes no width. So the
 * header stays put, sticky rows (the Today / Upcoming pills) stick to the top of that area, and
 * nothing shifts sideways when a page gets long. Phones keep normal page scrolling.
 */
export function HostScroller({ footer, children }: { footer: React.ReactNode; children: React.ReactNode }) {
  const pathname = usePathname();
  // The create / edit pages scroll in the same kind of area, under their 104px bar (32px padding + 40px pills + 32px).
  // The listing editor fills the window itself (its two columns scroll on their own).
  if (isListingEditor(pathname)) return <>{children}</>;
  if (isHostForm(pathname)) return <div className="no-scrollbar relative md:h-[calc(100vh-104px)] md:overflow-y-auto">{children}</div>;
  if (!isHostDashboard(pathname)) return <>{children}</>;
  return (
    <div className="no-scrollbar relative md:h-[calc(100vh-97px)] md:overflow-y-auto">
      {children}
      {footer}
    </div>
  );
}
