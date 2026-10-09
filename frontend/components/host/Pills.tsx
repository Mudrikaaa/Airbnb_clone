"use client";

type Props<T extends string> = { options: { value: T; label: string }[]; value: T; onChange: (value: T) => void };

/** Airbnb's host dashboard toggle: 48px pills, dark when active, light grey when not (measured: 16px/500, 14px 24px padding). */
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
            className={`h-12 rounded-full px-6 text-base font-medium ${active ? "bg-[#202020]/[0.86] text-white" : "bg-[#F0F0F0]/[0.86] text-black hover:bg-[#E6E6E6]"}`}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
