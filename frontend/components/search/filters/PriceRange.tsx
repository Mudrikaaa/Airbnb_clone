"use client";

import { useState } from "react";

export const PRICE_MAX = 50_000; // top of the slider: "₹50,000+" means no upper limit
const STEP = 500;

type Props = { min: number | null; max: number | null; onChange: (min: number | null, max: number | null) => void };

/**
 * Min / max price: two stacked sliders on one track plus two boxes. Dragging to the far right
 * on the max handle means "no upper limit" (stored as null, like an empty max box).
 */
export function PriceRange({ min, max, onChange }: Props) {
  const lo = min ?? 0;
  const hi = max ?? PRICE_MAX;
  const pct = (v: number) => (v / PRICE_MAX) * 100;

  const setLo = (v: number) => onChange(v <= 0 ? null : Math.min(v, hi - STEP), max);
  const setHi = (v: number) => onChange(min, v >= PRICE_MAX ? null : Math.max(v, lo + STEP));

  return (
    <div>
      <div className="relative mx-4 h-8">
        <div className="absolute inset-x-0 top-1/2 h-0.5 -translate-y-1/2 rounded bg-line" />
        <div className="absolute top-1/2 h-0.5 -translate-y-1/2 rounded bg-ink" style={{ left: `${pct(lo)}%`, right: `${100 - pct(hi)}%` }} />
        <input type="range" aria-label="Minimum price" className="dual-range" min={0} max={PRICE_MAX} step={STEP} value={lo} onChange={(e) => setLo(Number(e.target.value))} />
        <input type="range" aria-label="Maximum price" className="dual-range" min={0} max={PRICE_MAX} step={STEP} value={hi} onChange={(e) => setHi(Number(e.target.value))} />
      </div>

      <div className="mt-6 flex items-center gap-4">
        <PriceBox label="Minimum" value={min} placeholder="0" onCommit={(v) => onChange(v === null || v <= 0 ? null : Math.min(v, max ?? Infinity), max)} />
        <span aria-hidden className="h-px w-3 bg-line-strong" />
        <PriceBox label="Maximum" value={max} placeholder={`${PRICE_MAX.toLocaleString("en-IN")}+`} onCommit={(v) => onChange(min, v === null ? null : Math.max(v, min ?? 0))} />
      </div>
    </div>
  );
}

/** A "₹ [ 1,500 ]" box that formats as you leave it, but lets you type freely meanwhile. */
function PriceBox({ label, value, placeholder, onCommit }: { label: string; value: number | null; placeholder: string; onCommit: (v: number | null) => void }) {
  const [draft, setDraft] = useState<string | null>(null); // null = show the real value
  const shown = draft ?? (value === null ? "" : value.toLocaleString("en-IN"));
  const commit = () => {
    if (draft === null) return;
    const digits = draft.replace(/\D/g, "");
    onCommit(digits === "" ? null : Number(digits));
    setDraft(null);
  };
  return (
    <label className="flex flex-1 flex-col rounded-xl border border-line-strong px-3 py-2 focus-within:border-ink focus-within:shadow-[0_0_0_1px_#222]">
      <span className="text-xs text-muted">{label}</span>
      <span className="flex items-center gap-1 text-base">
        <span aria-hidden>₹</span>
        <input
          aria-label={`${label} price`}
          inputMode="numeric"
          value={shown}
          placeholder={placeholder}
          onChange={(e) => setDraft(e.target.value.replace(/[^\d,]/g, ""))}
          onBlur={commit}
          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), commit())}
          className="w-full bg-transparent outline-none placeholder:text-muted"
        />
      </span>
    </label>
  );
}
