"use client";

import { Minus, Plus } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import useSWR from "swr";
import { PriceRange } from "@/components/search/filters/PriceRange";
import { Icon } from "@/components/ui/Icon";
import { Modal } from "@/components/ui/Modal";
import { swrFetcher } from "@/lib/api";
import { type SearchState, activeFilterCount, toApiQuery, toUrlQuery } from "@/lib/search-params";
import type { Amenity, ListingPage, PropertyType } from "@/lib/types";

type Props = { open: boolean; onClose: () => void; state: SearchState };

/** Mounted only while open, so every opening starts from what's in the URL. */
export function FiltersModal({ open, onClose, state }: Props) {
  return open ? <FiltersDialog onClose={onClose} state={state} /> : null;
}

/** Returns `value` after it has stopped changing for `ms` — so dragging a slider doesn't fire a request per pixel. */
function useDebounced<T>(value: T, ms: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), ms);
    return () => clearTimeout(id);
  }, [value, ms]);
  return debounced;
}

/**
 * Airbnb's Filters dialog (measured on airbnb.co.in at 1440 and 1920px: 568px wide, 32px radius, 24px
 * side padding, 16px/600 title, 18px/500 section headings, footer with a grey "Clear all" and a dark
 * 40px "Show N places" button). Edits a draft; "Show N places" writes it to the URL. The button's
 * number comes from the real API with the draft plus the current search (place, dates, guests, category).
 */
function FiltersDialog({ onClose, state }: { onClose: () => void; state: SearchState }) {
  const router = useRouter();
  const pathname = usePathname();
  const [draft, setDraft] = useState<SearchState>(state);
  // Accepts a patch or a function of the latest draft (so quick successive changes never overwrite each other).
  const patch = (p: Partial<SearchState> | ((d: SearchState) => Partial<SearchState>)) =>
    setDraft((d) => ({ ...d, ...(typeof p === "function" ? p(d) : p) }));

  const { data: types } = useSWR<PropertyType[]>("/api/meta/property-types", swrFetcher);
  const { data: amenities } = useSWR<Amenity[]>("/api/meta/amenities", swrFetcher);

  const settled = useDebounced(draft, 250);
  const { data: count, isLoading } = useSWR<ListingPage>(`/api/listings?${toApiQuery(settled, 1, 1)}`, swrFetcher, { keepPreviousData: true });
  const total = count?.total;

  const dirty = activeFilterCount(draft) > 0;
  const clearAll = () =>
    patch({ minPrice: null, maxPrice: null, propertyTypes: [], bedrooms: 0, beds: 0, bathrooms: 0, amenities: [] });

  const apply = () => {
    const query = toUrlQuery(draft);
    router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });
    onClose();
  };

  const toggle = <T,>(list: T[], item: T) => (list.includes(item) ? list.filter((x) => x !== item) : [...list, item]);

  return (
    <Modal
      open
      onClose={onClose}
      title="Filters"
      widthClass="max-w-[568px]"
      roundedClass="md:rounded-[32px]"
      maxHeightClass="max-h-[calc(100vh-80px)]"
      footer={
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={clearAll}
            disabled={!dirty}
            className="h-10 rounded-xl px-3 text-sm font-medium text-ink underline hover:bg-subtle disabled:text-[#C1C1C1] disabled:no-underline disabled:hover:bg-transparent"
          >
            Clear all
          </button>
          <button
            type="button"
            onClick={apply}
            disabled={total === 0}
            className="h-10 rounded-xl bg-ink px-5 text-sm font-medium text-white hover:bg-black disabled:cursor-not-allowed disabled:bg-line-strong"
          >
            {total === undefined ? "Show places" : total === 0 ? "No exact matches" : `Show ${total.toLocaleString("en-IN")} ${total === 1 ? "place" : "places"}`}
            {isLoading && total !== undefined ? "…" : ""}
          </button>
        </div>
      }
    >
      <div className="-my-6 divide-y divide-line-light">
        <Section title="Price range" hint="Nightly prices before fees and taxes">
          <PriceRange min={draft.minPrice} max={draft.maxPrice} onChange={(minPrice, maxPrice) => patch({ minPrice, maxPrice })} />
        </Section>

        <Section title="Property type">
          <div className="flex flex-wrap gap-3">
            {(types ?? []).map((t) => {
              const on = draft.propertyTypes.includes(t.key);
              return (
                <button
                  key={t.key}
                  type="button"
                  aria-pressed={on}
                  onClick={() => patch((d) => ({ propertyTypes: toggle(d.propertyTypes, t.key) }))}
                  className={`h-12 rounded-xl px-5 text-base ${on ? "border-2 border-ink bg-subtle font-medium" : "border border-line-strong hover:border-ink"}`}
                >
                  {t.label}
                </button>
              );
            })}
            {!types && <p className="text-sm text-muted">Loading…</p>}
          </div>
        </Section>

        <Section title="Rooms and beds">
          <Stepper label="Bedrooms" value={draft.bedrooms} onChange={(delta) => patch((d) => ({ bedrooms: Math.min(8, Math.max(0, d.bedrooms + delta)) }))} />
          <Stepper label="Beds" value={draft.beds} onChange={(delta) => patch((d) => ({ beds: Math.min(8, Math.max(0, d.beds + delta)) }))} />
          <Stepper label="Bathrooms" value={draft.bathrooms} onChange={(delta) => patch((d) => ({ bathrooms: Math.min(8, Math.max(0, d.bathrooms + delta)) }))} />
        </Section>

        <Section title="Amenities" hint="Places must have all the amenities you pick">
          <ul className="grid gap-x-6 sm:grid-cols-2">
            {(amenities ?? []).map((a) => {
              const checked = draft.amenities.includes(a.id);
              return (
                <li key={a.id}>
                  <label className="flex cursor-pointer items-center gap-3 py-3 text-base">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => patch((d) => ({ amenities: toggle(d.amenities, a.id) }))}
                      className="h-6 w-6 shrink-0 cursor-pointer accent-ink"
                    />
                    <Icon name={a.icon} size={20} strokeWidth={1.5} className="shrink-0 text-muted" />
                    <span>{a.name}</span>
                  </label>
                </li>
              );
            })}
          </ul>
        </Section>
      </div>
    </Modal>
  );
}

function Section({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <section className="py-8">
      <h3 className="text-lg font-medium leading-6">{title}</h3>
      {hint && <p className="mt-1 text-sm text-muted">{hint}</p>}
      <div className="mt-6">{children}</div>
    </section>
  );
}

/** "Bedrooms — Any / 2+" with round −/+ buttons (0 = any, otherwise "at least n"). */
function Stepper({ label, value, onChange }: { label: string; value: number; onChange: (delta: 1 | -1) => void }) {
  const btn = "grid h-8 w-8 place-items-center rounded-full border border-line-strong text-muted hover:border-ink hover:text-ink disabled:cursor-not-allowed disabled:border-line-light disabled:text-line-light";
  return (
    <div className="flex items-center justify-between py-3">
      <span className="text-base">{label}</span>
      <div className="flex items-center gap-4">
        <button type="button" aria-label={`Fewer ${label.toLowerCase()}`} disabled={value <= 0} onClick={() => onChange(-1)} className={btn}>
          <Minus size={14} strokeWidth={2.5} />
        </button>
        <span className="w-10 text-center text-base" aria-live="polite">
          {value === 0 ? "Any" : `${value}+`}
        </span>
        <button type="button" aria-label={`More ${label.toLowerCase()}`} disabled={value >= 8} onClick={() => onChange(1)} className={btn}>
          <Plus size={14} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
}
