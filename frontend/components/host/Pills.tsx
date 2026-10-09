"use client";

type Props<T extends string> = { options: { value: T; label: string }[]; value: T; onChange: (value: T) => void };

/**
 * Airbnb's Today / Upcoming toggle, measured at 1440 and 1920px: both pills are 48px tall, 16px/500,
 * black text on rgba(240,240,240,.86). Only the selected one has the soft double shadow.
 */
export function Pills<T extends string>({ options, value, onChange }: Props<T>) {
  return (
    <div role="tablist" className="flex gap-3">
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(o.value)}
            className={`h-12 rounded-full bg-[#F0F0F0]/[0.86] px-6 text-base font-medium text-black transition-shadow hover:bg-[#E8E8E8]/[0.9] ${
              active ? "shadow-[0_4px_16px_rgba(0,0,0,0.09),0_2px_8px_rgba(0,0,0,0.06)]" : ""
            }`}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
