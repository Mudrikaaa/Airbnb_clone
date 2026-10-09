"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { Logo } from "@/components/layout/Logo";
import { ProfileMenu } from "@/components/layout/ProfileMenu";
import { useAuth } from "@/lib/auth-context";

const TABS = [
  { href: "/hosting", label: "Reservations" },
  { href: "/hosting/listings", label: "Listings" },
];

/**
 * Header of the hosting dashboard (airbnb.com/hosting): logo, centred tabs, "Switch to travelling"
 * and the profile / menu circles. Measured: 96px bar, 14px/500 tabs (grey, dark when active,
 * 12px radius, 11px 12px padding) with a small red marker under the active one.
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
    <header className="sticky top-0 z-50 border-b border-line-light bg-white">
      <div className="flex min-h-24 flex-wrap items-center justify-between gap-x-4 px-6 md:px-12">
        <div className="order-1 md:w-[260px]">
          <Logo />
        </div>

        <nav aria-label="Hosting" className="order-3 flex w-full justify-center gap-1 pb-2 md:order-2 md:w-auto md:pb-0">
          {TABS.map((tab) => {
            const active = tab.href === "/hosting" ? pathname === "/hosting" : pathname.startsWith(tab.href);
            return (
              <Link
                key={tab.href}
                href={tab.href}
                aria-current={active ? "page" : undefined}
                className={`relative rounded-xl px-3 py-[11px] text-sm font-medium leading-[18px] hover:bg-chip ${active ? "text-ink" : "text-muted"}`}
              >
                {tab.label}
                {active && <span className="absolute inset-x-3 bottom-0 h-[3px] rounded-full bg-[#DA1249]" />}
              </Link>
            );
          })}
        </nav>

        <div className="order-2 flex items-center justify-end gap-1 md:order-3 md:w-[260px]">
          <button
            type="button"
            className="hidden h-10 rounded-full px-3 text-sm font-medium hover:bg-chip lg:block"
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
