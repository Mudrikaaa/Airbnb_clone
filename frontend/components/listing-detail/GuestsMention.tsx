"use client";

import { ChevronRight } from "lucide-react";
import { useRef } from "react";
import type { Review } from "@/lib/types";

// Keyword groups. A review counts once per group if its comment contains any of the words
// (as the start of a word, so "views" matches "view" and "kids" matches "kids").
// Icons are Microsoft's Fluent Emoji 3D (MIT), saved in public/icons/mentions.
const GROUPS = [
  { key: "cleanliness", label: "Cleanliness", words: ["clean", "spotless", "tidy"] },
  { key: "location", label: "Location", words: ["location", "beach", "view", "walk"] },
  { key: "hospitality", label: "Hospitality", words: ["host", "welcoming", "helpful"] },
  { key: "comfort", label: "Comfort", words: ["comfortable", "comfy", "cosy", "bed"] },
  { key: "family", label: "Family", words: ["family", "kids"] },
  { key: "value", label: "Value", words: ["value", "price", "worth"] },
  { key: "peaceful", label: "Peaceful", words: ["quiet", "peaceful", "calm"] },
  { key: "nature", label: "Nature", words: ["garden", "trees", "birds", "nature"] },
].map((g) => ({ ...g, pattern: new RegExp(`\\b(${g.words.join("|")})`, "i") }));

/** "Guests mention" chips, counted from this listing's real review comments. Hidden when nothing matches. */
export function GuestsMention({ reviews }: { reviews: Review[] | undefined }) {
  const scroller = useRef<HTMLDivElement>(null);
  const mentions = GROUPS.map((g) => ({ ...g, count: (reviews ?? []).filter((r) => g.pattern.test(r.comment)).length }))
    .filter((g) => g.count > 0)
    .sort((a, b) => b.count - a.count);
  if (mentions.length === 0) return null;

  return (
    // Matches airbnb.co.in: hairline above, 22px heading, 16px-radius chips with 16px/500 labels.
    <div className="mt-10 border-t border-line-light pt-10">
      <h3 className="text-heading font-medium">Guests mention</h3>
      <div className="relative mt-4">
        <div ref={scroller} className="no-scrollbar flex gap-3 overflow-x-auto scroll-smooth px-1.5 py-2 pr-16">
          {mentions.map((m) => (
            <span
              key={m.key}
              className="flex h-14 shrink-0 items-center gap-3 rounded-2xl bg-white px-4 text-base font-medium shadow-[0_2px_10px_rgba(0,0,0,0.10)]"
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- tiny static icon */}
              <img src={`/icons/mentions/${m.key}.png`} alt="" aria-hidden className="h-6 w-6" />
              {m.label}
              <span className="font-normal text-muted">{m.count}</span>
            </span>
          ))}
        </div>
        <button
          type="button"
          aria-label="Scroll mentions"
          onClick={() => scroller.current?.scrollBy({ left: 240 })}
          className="absolute right-0 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full border border-line bg-white shadow-[0_1px_2px_rgba(0,0,0,0.08)] hover:shadow-md"
        >
          <ChevronRight size={16} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
}
