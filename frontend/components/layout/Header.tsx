"use client";

import { usePathname } from "next/navigation";
import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { Logo } from "@/components/layout/Logo";
import { NavTabs } from "@/components/layout/NavTabs";
import { ProfileMenu } from "@/components/layout/ProfileMenu";
import { CompactSearch } from "@/components/search/CompactSearch";
import { MobileSearch } from "@/components/search/MobileSearch";
import { SearchBar } from "@/components/search/SearchBar";
import type { Segment } from "@/components/search/useSearchDraft";

/**
 * Fixed header. On "/" it starts expanded (tabs + big search pill, 200px tall like airbnb.com) and
 * collapses to the compact pill once the page scrolls. Other pages always use the compact pill.
 * A spacer below keeps page content from sliding under the fixed header.
 */
export function Header() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const isCheckout = pathname.startsWith("/book/");
  // airbnb.com's Trips / Wishlists headers have no search pill, just the logo and account buttons.
  const hideSearch = pathname === "/trips" || pathname === "/wishlists";
  const [scrolled, setScrolled] = useState(false);
  // Set when the user clicks the compact pill: re-expand on top of the page, opening that segment.
  const [forced, setForced] = useState<Segment | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);
  // The scroll listener is subscribed once, so it reads panelOpen through a ref.
  const panelOpenRef = useRef(false);
  useEffect(() => {
    panelOpenRef.current = panelOpen;
  }, [panelOpen]);

  useEffect(() => {
    const onScroll = () => {
      const next = window.scrollY > 24;
      setScrolled(next);
      // Scrolling collapses a re-expanded bar again (unless a panel is open).
      if (next) setForced((f) => (f && !panelOpenRef.current ? null : f));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const onActiveChange = useCallback((active: boolean) => setPanelOpen(active), []);

  const expanded = forced !== null || (isHome && !scrolled);

  // Airbnb's checkout header: just the logo on a plain bar, not sticky (measured: 80px + bottom border).
  if (isCheckout) {
    return (
      <header className="flex h-20 items-center border-b border-line-light bg-white px-6 md:px-20">
        <Logo />
      </header>
    );
  }

  return (
    <>
      {/* Both states use airbnb.com's white → light-grey fade (the compact one is #FFF → #F7F7F7). */}
      <header className={`fixed inset-x-0 top-0 z-50 border-b border-line-light ${expanded ? "bg-header-fade" : "bg-[linear-gradient(#FFFFFF,#F7F7F7)]"}`}>
        {/* Tablet & desktop */}
        <div className="hidden px-10 md:block xl:px-12">
          <div className={`grid grid-cols-[1fr_auto_1fr] items-center gap-4 ${expanded ? "h-24" : "h-20"}`}>
            <Logo />
            <div className="flex justify-center">
              {expanded ? (
                <NavTabs />
              ) : hideSearch ? null : (
                <Suspense fallback={null}>
                  <CompactSearch onExpand={setForced} />
                </Suspense>
              )}
            </div>
            <div className="flex justify-end">
              <ProfileMenu />
            </div>
          </div>
          {expanded && (
            <div className="pb-8 pt-1.5">
              <Suspense fallback={<div className="mx-auto h-[66px] max-w-[850px] rounded-full border border-line bg-white shadow-pill" />}>
                <SearchBar key={forced ?? "home"} initialSegment={forced} onActiveChange={onActiveChange} />
              </Suspense>
            </div>
          )}
        </div>

        {/* Phones */}
        <div className="px-6 py-3 md:hidden">
          <Suspense fallback={<div className="h-14 rounded-full border border-line shadow-pill" />}>
            <MobileSearch />
          </Suspense>
        </div>
      </header>

      {/* Dim the page while the bar is re-expanded over scrolled content. */}
      {forced && <div className="fixed inset-0 z-40 bg-black/25" onClick={() => setForced(null)} aria-hidden />}

      <div aria-hidden className={`h-20 ${isHome ? "md:h-[200px]" : "md:h-20"}`} />
    </>
  );
}
