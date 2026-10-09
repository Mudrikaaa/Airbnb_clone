"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { Logo } from "@/components/layout/Logo";
import { ProfileMenu } from "@/components/layout/ProfileMenu";
import { useAuth } from "@/lib/auth-context";

const TABS = [
  { href: "/hosting", label: "Today", isActive: (p: string) => p === "/hosting" || p === "/hosting/reservations" },
  { href: "/hosting/calendar", label: "Calendar", isActive: (p: string) => p.startsWith("/hosting/calendar") },
  { href: "/hosting/listings", label: "Listings", isActive: (p: string) => p.startsWith("/hosting/listings") },
  { href: "/hosting/messages", label: "Messages", isActive: (p: string) => p.startsWith("/hosting/messages") },
];

/**
 * Header of the hosting dashboard, measured on airbnb.co.in/hosting at 1440 and 1920px wide:
 * a *static* white bar, 96px plus a 1px #EBEBEB bottom border (97px in total), 48px side padding.
 * Tabs are centred on the page, 40px tall, 8px apart: 14px/500, #6C6C6C (active #222) with a
 * separate 2px #222 underline exactly as wide as the label, 3px below the text.
 * The height is fixed on purpose so nothing in here can make the bar grow.
 */
export function HostHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { mode, setMode } = useAuth();

  // Landing on /hosting directly (e.g. from a bookmark) counts as being in hosting mode.
  useEffect(() => {
    if (mode !== "hosting") setMode("hosting");
  }, [mode, setMode]);

  return (
    <header className="relative z-40 border-b border-line-light bg-white">
      <div className="flex h-24 items-center px-6 max-md:h-auto max-md:flex-wrap max-md:py-3 md:px-12">
        {/* flex-1 on both sides keeps the tab group centred whatever the side contents' widths */}
        <div className="flex flex-1 items-center">
          <Logo />
        </div>

        <nav aria-label="Hosting" className="flex items-center gap-2 max-md:order-last max-md:w-full max-md:justify-center max-md:pt-2">
          {TABS.map((tab) => {
            const active = tab.isActive(pathname);
            return (
              <Link
                key={tab.href}
                href={tab.href}
                aria-current={active ? "page" : undefined}
                className={`relative h-10 rounded-xl px-3 py-[11px] text-sm font-medium leading-[18px] hover:bg-chip ${active ? "text-ink" : "text-muted"}`}
              >
                {tab.label}
                {active && <span aria-hidden className="absolute bottom-[6px] left-3 right-3 h-0.5 bg-ink" />}
              </Link>
            );
          })}
        </nav>

        <div className="flex flex-1 items-center justify-end gap-2">
          <button
            type="button"
            className="hidden h-10 rounded-[20px] px-3 text-sm font-medium leading-[18px] hover:bg-chip md:block"
            onClick={() => {
              setMode("traveling");
              router.push("/");
            }}
          >
            Switch to travelling
          </button>
          <ProfileMenu hideHostLink />
        </div>
      </div>
    </header>
  );
}
