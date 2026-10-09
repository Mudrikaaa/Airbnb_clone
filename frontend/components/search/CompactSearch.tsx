"use client";

import { Search } from "lucide-react";
import { useSearchParams } from "next/navigation";
import type { Segment } from "@/components/search/useSearchDraft";
import { formatDateRange } from "@/lib/format";
import { guestSummary, parseSearch } from "@/lib/search-params";

/** Collapsed pill "🏠 Anywhere | Anytime | Add guests" shown on scroll and on inner pages. */
export function CompactSearch({ onExpand }: { onExpand: (segment: Segment) => void }) {
  const state = parseSearch(useSearchParams());
  // Same wording as airbnb.co.in: "Homes in Goa | Any week | Add guests".
  const where = state.location ? `Homes in ${state.location}` : "Anywhere";
  const when = state.checkIn && state.checkOut ? formatDateRange(state.checkIn, state.checkOut) : "Any week";
  const who = guestSummary(state) ?? "Add guests";

  // All three labels are 14px / 500 on airbnb.com, pill is 46px tall.
  const item = "max-w-[200px] truncate px-4 text-sm font-medium text-ink";
  return (
    <div className="flex h-[46px] items-center rounded-full border border-line bg-white pl-2 pr-2 shadow-pill transition-shadow hover:shadow-[0_2px_6px_rgba(0,0,0,0.18)]">
      <button type="button" onClick={() => onExpand("where")} className={`${item} flex items-center gap-2`}>
        <span aria-hidden className="text-xl leading-none">🏠</span>
        {where}
      </button>
      <span className="h-6 w-px bg-line" />
      <button type="button" onClick={() => onExpand("when")} className={item}>
        {when}
      </button>
      <span className="h-6 w-px bg-line" />
      <button type="button" onClick={() => onExpand("who")} className={item}>
        {who}
      </button>
      <button
        type="button"
        aria-label="Search"
        onClick={() => onExpand("where")}
        className="grid h-8 w-8 place-items-center rounded-full bg-brand-deep text-white"
      >
        <Search size={12} strokeWidth={4} />
      </button>
    </div>
  );
}
