"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// Airbnb's top-level tabs. All and Homes show the same listings (every listing is a home);
// Experiences and Services open "coming soon" pages.
// Icons are Microsoft's Fluent Emoji 3D (MIT) saved in public/icons, not Airbnb's own illustrations.
const TABS = [
  { key: "all", label: "All", icon: "/icons/all.png", href: "/" },
  { key: "homes", label: "Homes", icon: "/icons/homes.png", href: "/homes" },
  { key: "experiences", label: "Experiences", icon: "/icons/experiences.png", href: "/experiences" },
  { key: "services", label: "Services", icon: "/icons/services.png", href: "/services" },
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
            {/* eslint-disable-next-line @next/next/no-img-element -- tiny static icon, no optimisation needed */}
            <img src={tab.icon} alt="" aria-hidden className={`transition-transform group-hover:scale-110 ${compact ? "h-8 w-8" : "h-12 w-12"}`} />
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
