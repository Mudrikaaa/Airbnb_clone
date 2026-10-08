"use client";

import { Minus, Plus } from "lucide-react";
import type { GuestKey } from "@/components/search/useSearchDraft";
import type { SearchState } from "@/lib/search-params";

// Airbnb's limits: up to 16 adults + children in total, 5 infants, 5 pets.
const MAX_GUESTS = 16;
const MAX_INFANTS = 5;
const MAX_PETS = 5;

const ROWS: { key: GuestKey; title: string; subtitle: string }[] = [
  { key: "adults", title: "Adults", subtitle: "Ages 13 or above" },
  { key: "children", title: "Children", subtitle: "Ages 2–12" },
  { key: "infants", title: "Infants", subtitle: "Under 2" },
  { key: "pets", title: "Pets", subtitle: "Bringing a service animal?" },
];

type Props = {
  guests: SearchState;
  onChange: (key: GuestKey, value: number) => void;
  /** A listing's max_guests on the booking card; Airbnb's overall limit in search. */
  maxGuests?: number;
};

export function GuestsPanel({ guests, onChange, maxGuests = MAX_GUESTS }: Props) {
  const total = guests.adults + guests.children;
  const hasDependants = guests.children + guests.infants + guests.pets > 0;

  const limits = (key: GuestKey): [number, number] => {
    switch (key) {
      case "adults":
        return [hasDependants ? 1 : 0, maxGuests - guests.children];
      case "children":
        return [0, maxGuests - guests.adults];
      case "infants":
        return [0, MAX_INFANTS];
      case "pets":
        return [0, MAX_PETS];
    }
  };

  return (
    <div className="px-8 py-4">
      {ROWS.map(({ key, title, subtitle }, i) => {
        const [min, max] = limits(key);
        const value = guests[key];
        return (
          <div key={key} className={`flex items-center justify-between py-6 ${i < ROWS.length - 1 ? "border-b border-line-light" : ""}`}>
            <div>
              <p className="text-base font-medium text-ink">{title}</p>
              <p className={`text-sm text-muted ${key === "pets" ? "font-medium underline" : ""}`}>{subtitle}</p>
            </div>
            <div className="flex items-center gap-4">
              <CounterButton label={`Decrease ${title.toLowerCase()}`} disabled={value <= min} onClick={() => onChange(key, value - 1)}>
                <Minus size={14} strokeWidth={2.5} />
              </CounterButton>
              <span className="w-4 text-center text-base text-ink" aria-live="polite">
                {value}
              </span>
              <CounterButton
                label={`Increase ${title.toLowerCase()}`}
                disabled={value >= max || (key !== "infants" && key !== "pets" && total >= maxGuests)}
                onClick={() => onChange(key, value + 1)}
              >
                <Plus size={14} strokeWidth={2.5} />
              </CounterButton>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function CounterButton(props: { label: string; disabled: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-label={props.label}
      disabled={props.disabled}
      onClick={props.onClick}
      className="grid h-8 w-8 place-items-center rounded-full border border-line-strong text-muted hover:border-ink hover:text-ink disabled:cursor-not-allowed disabled:border-line-light disabled:text-line-light"
    >
      {props.children}
    </button>
  );
}
