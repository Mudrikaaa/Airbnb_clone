"use client";

import Link from "next/link";
import { toast } from "sonner";

// Airbnb's top-level tabs. Only Homes exists in this clone; the others are "coming soon".
// Emoji stand in for Airbnb's own 3D illustrations, which we don't copy.
const TABS = [
  { key: "homes", label: "Homes", emoji: "🏠" },
  { key: "experiences", label: "Experiences", emoji: "🎈" },
  { key: "services", label: "Services", emoji: "🛎️" },
];

export function NavTabs({ compact = false }: { compact?: boolean }) {
  return (
    <nav aria-label="Categories of stays" className="flex items-stretch gap-8">
      {TABS.map((tab) => {
        const active = tab.key === "homes";
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
        return active ? (
          <Link key={tab.key} href="/" className={className} aria-current="page">
            {content}
          </Link>
        ) : (
          <button key={tab.key} type="button" className={className} onClick={() => toast(`${tab.label} are coming soon`)}>
            {content}
          </button>
        );
      })}
    </nav>
  );
}
