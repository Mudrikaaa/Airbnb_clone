"use client";

import { Search, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { DatesPanel } from "@/components/search/DatesPanel";
import { DestinationPanel } from "@/components/search/DestinationPanel";
import { GuestsPanel } from "@/components/search/GuestsPanel";
import { type Segment, useSearchDraft } from "@/components/search/useSearchDraft";
import { formatDateRange } from "@/lib/format";
import { guestSummary } from "@/lib/search-params";
import { useMediaQuery } from "@/lib/use-media-query";

type Props = {
  /** Segment to open immediately (when expanding from the compact pill). */
  initialSegment?: Segment | null;
  /** Lets the header know a panel is open (it keeps the bar expanded while true). */
  onActiveChange?: (active: boolean) => void;
};

/**
 * Desktop search pill (Where | When | Who), measured from airbnb.com: 850×66, 32px segment radius,
 * dividers at 281px and 569px, solid #DA1249 search button.
 * The pill turns grey while a segment is open and the open segment becomes a raised white chip.
 */
export function SearchBar({ initialSegment = null, onActiveChange }: Props) {
  const { draft, update, setGuests, submit } = useSearchDraft();
  const [active, setActive] = useState<Segment | null>(initialSegment);
  const [hovered, setHovered] = useState<Segment | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const whereInput = useRef<HTMLInputElement>(null);
  // Two months need ~790px; on tablets the pill is narrower, so show one.
  const twoMonths = useMediaQuery("(min-width: 1024px)");

  useEffect(() => onActiveChange?.(active !== null), [active, onActiveChange]);
  useEffect(() => {
    if (initialSegment === "where") whereInput.current?.focus();
  }, [initialSegment]);

  // Close the open panel on outside click or Escape.
  useEffect(() => {
    if (!active) return;
    const onDown = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setActive(null);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setActive(null);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [active]);

  const open = (segment: Segment) => {
    setActive(segment);
    if (segment === "where") whereInput.current?.focus();
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setActive(null);
    submit();
  };

  const dates = draft.checkIn && draft.checkOut ? formatDateRange(draft.checkIn, draft.checkOut) : null;
  const guests = guestSummary(draft);

  // A divider is hidden when either neighbour is hovered or active (as on airbnb.com).
  const dividerHidden = (a: Segment, b: Segment) => [a, b].some((s) => s === active || s === hovered);

  return (
    <div ref={rootRef} className="relative mx-auto w-full max-w-[850px]">
      <form
        role="search"
        onSubmit={onSubmit}
        className={`flex h-[66px] items-center rounded-full border transition-colors ${
          active ? "border-transparent bg-[#EBEBEB]" : "border-line bg-white shadow-pill"
        }`}
      >
        <SegmentShell segment="where" active={active} hovered={hovered} setHovered={setHovered} onOpen={open}
          clear={draft.location ? () => update({ location: "" }) : undefined} className="w-[280px] shrink-0 !pl-[31px]">
          <label htmlFor="search-where" className="block text-label font-medium text-ink">
            Where
          </label>
          <input
            id="search-where"
            ref={whereInput}
            value={draft.location}
            onChange={(e) => update({ location: e.target.value })}
            onFocus={() => setActive("where")}
            placeholder="Search destinations"
            autoComplete="off"
            className="w-full truncate bg-transparent text-sm font-medium text-ink outline-none placeholder:font-normal placeholder:text-muted"
          />
        </SegmentShell>

        <Divider hidden={dividerHidden("where", "when")} />

        <SegmentShell segment="when" active={active} hovered={hovered} setHovered={setHovered} onOpen={open}
          clear={dates ? () => update({ checkIn: null, checkOut: null }) : undefined} className="w-[287px] shrink-0 !pl-[26px]">
          <span className="block text-label font-medium text-ink">When</span>
          <span className={`block truncate text-sm ${dates ? "font-medium text-ink" : "text-muted"}`}>{dates ?? "Add dates"}</span>
        </SegmentShell>

        <Divider hidden={dividerHidden("when", "who")} />

        <SegmentShell segment="who" active={active} hovered={hovered} setHovered={setHovered} onOpen={open}
          clear={guests ? () => update({ adults: 0, children: 0, infants: 0, pets: 0 }) : undefined}
          className={`flex-1 !pl-[26px] ${active ? "!pr-[150px]" : "!pr-[76px]"}`}>
          <span className="block text-label font-medium text-ink">Who</span>
          <span className={`block truncate text-sm ${guests ? "font-medium text-ink" : "text-muted"}`}>{guests ?? "Add guests"}</span>
        </SegmentShell>

        <button
          type="submit"
          aria-label="Search"
          className={`absolute right-[9px] flex h-12 items-center justify-center gap-2 overflow-hidden whitespace-nowrap rounded-full bg-brand-deep text-white transition-[width] duration-200 ${
            active ? "w-[100px]" : "w-12"
          }`}
        >
          <Search size={16} strokeWidth={3} />
          {active && <span className="text-base font-semibold">Search</span>}
        </button>
      </form>

      {active && (
        <div
          className={`absolute top-[calc(100%+12px)] z-50 overflow-hidden rounded-[32px] bg-white shadow-panel ${
            active === "where" ? "left-0 w-[425px]" : active === "who" ? "right-0 w-[425px]" : "inset-x-0"
          }`}
        >
          {active === "where" && (
            <DestinationPanel
              text={draft.location}
              onSelect={(query) => {
                update({ location: query });
                setActive("when");
              }}
            />
          )}
          {active === "when" && (
            <div className="px-8 py-8">
              <DatesPanel
                months={twoMonths ? 2 : 1}
                checkIn={draft.checkIn}
                checkOut={draft.checkOut}
                onChange={(checkIn, checkOut) => update({ checkIn, checkOut })}
                onComplete={() => setActive("who")}
              />
            </div>
          )}
          {active === "who" && <GuestsPanel guests={draft} onChange={setGuests} />}
        </div>
      )}
    </div>
  );
}

function Divider({ hidden }: { hidden: boolean }) {
  return <span className={`h-8 w-px shrink-0 ${hidden ? "bg-transparent" : "bg-line"}`} />;
}

type ShellProps = {
  segment: Segment;
  active: Segment | null;
  hovered: Segment | null;
  setHovered: (s: Segment | null) => void;
  onOpen: (s: Segment) => void;
  clear?: () => void;
  className?: string;
  children: React.ReactNode;
};

function SegmentShell({ segment, active, hovered, setHovered, onOpen, clear, className = "", children }: ShellProps) {
  const isActive = active === segment;
  // Hover colour depends on whether the pill is in its grey "something is open" state.
  const hoverBg = active ? "bg-[#DDDDDD]" : "bg-[#EBEBEB]";
  return (
    <div
      role="button"
      tabIndex={segment === "where" ? -1 : 0}
      onClick={() => onOpen(segment)}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onOpen(segment)}
      onMouseEnter={() => setHovered(segment)}
      onMouseLeave={() => setHovered(null)}
      className={`relative flex h-full min-w-0 cursor-pointer flex-col justify-center rounded-full pl-8 pr-6 ${className} ${
        isActive ? "bg-white shadow-segment" : hovered === segment ? hoverBg : ""
      }`}
    >
      {children}
      {isActive && clear && (
        <button
          type="button"
          aria-label="Clear"
          onClick={(e) => {
            e.stopPropagation();
            clear();
          }}
          className={`absolute top-1/2 grid h-6 w-6 -translate-y-1/2 place-items-center rounded-full bg-[#DDDDDD] hover:bg-line-strong ${
            segment === "who" ? "right-[118px]" : "right-4"
          }`}
        >
          <X size={12} strokeWidth={3} />
        </button>
      )}
    </div>
  );
}
