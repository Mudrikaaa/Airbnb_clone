"use client";

import { Icon } from "@/components/ui/Icon";
import { matchDestinations } from "@/lib/destinations";

type Props = { text: string; onSelect: (query: string) => void };

export function DestinationPanel({ text, onSelect }: Props) {
  const matches = matchDestinations(text);
  return (
    <div className="px-2 py-6">
      <p className="px-6 pb-2 text-xs text-ink">{text.trim() ? "Destinations" : "Suggested destinations"}</p>
      {matches.length === 0 ? (
        <p className="px-6 py-4 text-sm text-muted">No suggestions — press Search to look for “{text.trim()}”.</p>
      ) : (
        <ul className="max-h-[440px] overflow-y-auto">
          {matches.map((d) => (
            <li key={d.label}>
              <button
                type="button"
                // mousedown (not click) so the input's blur doesn't close the panel first
                onMouseDown={(e) => {
                  e.preventDefault();
                  onSelect(d.query);
                }}
                className="flex w-full items-center gap-4 rounded-xl px-4 py-2 text-left hover:bg-subtle"
              >
                <span className="grid h-[52px] w-[52px] shrink-0 place-items-center rounded-xl" style={{ background: d.tint, color: d.color }}>
                  <Icon name={d.icon} size={24} strokeWidth={1.75} />
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium text-ink">{d.label}</span>
                  <span className="block truncate text-sm text-muted">{d.subtitle}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
