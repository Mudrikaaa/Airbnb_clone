"use client";

import { ChevronLeft, ChevronRight, SlidersHorizontal } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import useSWR from "swr";
import { Icon } from "@/components/ui/Icon";
import { swrFetcher } from "@/lib/api";
import { type SearchState, activeFilterCount, toUrlQuery } from "@/lib/search-params";
import type { Category } from "@/lib/types";

type Props = { state: SearchState; onOpenFilters: () => void };

/** Horizontally scrolling category icons with arrow buttons, plus the "Filters" button. Sticky under the header. */
export function CategoryBar({ state, onOpenFilters }: Props) {
  const { data: categories } = useSWR<Category[]>("/api/meta/categories", swrFetcher);
  const router = useRouter();
  const pathname = usePathname();
  const scroller = useRef<HTMLDivElement>(null);
  const [canScroll, setCanScroll] = useState({ left: false, right: false });

  const updateArrows = () => {
    const el = scroller.current;
    if (!el) return;
    setCanScroll({ left: el.scrollLeft > 4, right: el.scrollLeft + el.clientWidth < el.scrollWidth - 4 });
  };

  useEffect(() => {
    updateArrows();
    window.addEventListener("resize", updateArrows);
    return () => window.removeEventListener("resize", updateArrows);
  }, [categories]);

  const select = (key: string | null) => {
    const query = toUrlQuery({ ...state, category: key });
    router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });
  };

  const scrollBy = (dir: 1 | -1) => scroller.current?.scrollBy({ left: dir * scroller.current.clientWidth * 0.7, behavior: "smooth" });

  const items: { key: string | null; label: string; icon: string }[] = [
    { key: null, label: "All homes", icon: "LayoutGrid" },
    ...(categories ?? []),
  ];
  const filterCount = activeFilterCount(state);
  const arrow = "absolute top-1/2 z-10 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-full border border-black/30 bg-white hover:scale-[1.04] hover:shadow-[0_6px_16px_rgba(0,0,0,0.12)]";

  return (
    <div className="sticky top-20 z-30 bg-white px-6 md:px-10 xl:px-12">
      <div className="flex items-center gap-6">
        <div className="relative min-w-0 flex-1">
          {canScroll.left && (
            <>
              <div className="pointer-events-none absolute inset-y-0 left-0 z-[5] w-20 bg-gradient-to-r from-white from-50% to-transparent" />
              <button type="button" aria-label="Scroll categories left" onClick={() => scrollBy(-1)} className={`${arrow} left-0`}>
                <ChevronLeft size={14} strokeWidth={2.5} />
              </button>
            </>
          )}
          <div ref={scroller} onScroll={updateArrows} className="no-scrollbar flex gap-8 overflow-x-auto">
            {categories === undefined
              ? Array.from({ length: 10 }, (_, i) => (
                  <div key={i} className="flex h-[78px] shrink-0 animate-pulse flex-col items-center justify-center gap-2">
                    <div className="h-6 w-6 rounded-full bg-line-light" />
                    <div className="h-3 w-14 rounded bg-line-light" />
                  </div>
                ))
              : items.map((c) => {
                  const active = state.category === c.key;
                  return (
                    <button
                      key={c.key ?? "all"}
                      type="button"
                      onClick={() => select(c.key)}
                      aria-pressed={active}
                      className={`flex h-[78px] shrink-0 flex-col items-center justify-center gap-2 border-b-2 pt-1 transition-colors ${
                        active ? "border-ink text-ink" : "border-transparent text-muted-light hover:border-line hover:text-ink"
                      }`}
                    >
                      <Icon name={c.icon} size={24} strokeWidth={active ? 2 : 1.5} />
                      <span className="whitespace-nowrap text-xs font-semibold">{c.label}</span>
                    </button>
                  );
                })}
          </div>
          {canScroll.right && (
            <>
              <div className="pointer-events-none absolute inset-y-0 right-0 z-[5] w-20 bg-gradient-to-l from-white from-50% to-transparent" />
              <button type="button" aria-label="Scroll categories right" onClick={() => scrollBy(1)} className={`${arrow} right-0`}>
                <ChevronRight size={14} strokeWidth={2.5} />
              </button>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={onOpenFilters}
          // 34px pill, 12px text, 8px/12px padding — measured from airbnb.com's filter chips
          className="relative hidden h-[34px] shrink-0 items-center gap-2 rounded-3xl border border-line bg-white px-3 text-xs text-ink hover:border-ink md:flex"
        >
          <SlidersHorizontal size={14} strokeWidth={2} />
          Filters
          {filterCount > 0 && (
            <span className="absolute -right-1.5 -top-1.5 grid h-5 w-5 place-items-center rounded-full bg-ink text-[10px] text-white">
              {filterCount}
            </span>
          )}
        </button>
      </div>
    </div>
  );
}
