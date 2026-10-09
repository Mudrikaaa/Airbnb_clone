"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// Airbnb's top-level tabs. All and Homes show the same listings (every listing is a home);
// Experiences and Services open "coming soon" pages.
// Emoji stand in for Airbnb's own 3D illustrations, which we don't copy.
const TABS = [
  { key: "all", label: "All", emoji: "🌐", href: "/" },
  { key: "homes", label: "Homes", emoji: "🏠", href: "/homes" },
  { key: "experiences", label: "Experiences", emoji: "🎈", href: "/experiences" },
  { key: "services", label: "Services", emoji: "🛎️", href: "/services" },
];

export function NavTabs({ compact = false }: { compact?: boolean }) {
  const pathname = usePathname();
  const current = pathname.startsWith("/experiences") ? "experiences" : pathname.startsWith("/services") ? "services" : pathname === "/homes" ? "homes" : "all";
  return (
    <nav aria-label="Categories of stays" className="flex items-stretch gap-8">
      {TABS.map((tab) => {
        const active = tab.key === current;
        const content = (
          <>
            <span aria-hidden className={`leading-none transition-transform group-hover:scale-110 ${compact ? "text-2xl" : "text-[34px]"}`}>
              {tab.emoji}
            </span>
            <span className={`text-sm font-medium ${active ? "text-ink" : "text-muted group-hover:text-ink"}`}>{tab.label}</span>
            {/* 3px underline under the active tab (measured on airbnb.com) */}
            <span className={`absolute inset-x-0 bottom-0 h-[3px] rounded-full ${active ? "bg-ink" : "bg-transparent"}`} />
          </>
        );
        const className = "group relative flex items-center gap-2 pb-3 pt-2";
        return (
          <Link key={tab.key} href={tab.href} className={className} aria-current={active ? "page" : undefined}>
            {content}
          </Link>
        );
      })}
    </nav>
  );
}
