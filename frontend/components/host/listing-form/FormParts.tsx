"use client";

import { AlertCircle, Minus, Plus } from "lucide-react";
import { useId } from "react";

/** A numbered-step-like block of the form: 22px/600 heading, optional helper text, hairline below. */
export function Section({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <section className="border-b border-line py-10 first:pt-2">
      <h2 className="text-[22px] font-semibold leading-[26px] tracking-[-0.44px]">{title}</h2>
      {hint && <p className="mt-2 text-base text-muted">{hint}</p>}
      <div className="mt-6">{children}</div>
    </section>
  );
}

export function ErrorText({ children }: { children?: string }) {
  if (!children) return null;
  return (
    <p role="alert" className="mt-2 flex items-start gap-1.5 text-sm text-[#C13515]">
      <AlertCircle size={14} className="mt-0.5 shrink-0" fill="#C13515" stroke="white" />
      {children}
    </p>
  );
}

const INPUT =
  "w-full rounded-xl border bg-white px-4 py-3.5 text-base outline-none placeholder:text-muted focus:border-ink focus:shadow-[0_0_0_1px_#222]";

type FieldProps = {
  name: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  placeholder?: string;
  prefix?: string;
  inputMode?: "text" | "numeric" | "decimal";
  maxLength?: number;
  hint?: string;
};

export function TextField({ name, label, value, onChange, error, placeholder, prefix, inputMode, maxLength, hint }: FieldProps) {
  const id = useId();
  return (
    <div id={`field-${name}`}>
      <label htmlFor={id} className="mb-2 block text-sm font-medium">
        {label}
      </label>
      <div className="relative">
        {prefix && <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-base text-muted">{prefix}</span>}
        <input
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          inputMode={inputMode}
          maxLength={maxLength}
          aria-invalid={!!error}
          className={`${INPUT} ${error ? "border-[#C13515]" : "border-line-strong"} ${prefix ? "pl-9" : ""}`}
        />
      </div>
      {hint && !error && <p className="mt-2 text-sm text-muted">{hint}</p>}
      <ErrorText>{error}</ErrorText>
    </div>
  );
}

export function TextArea({ name, label, value, onChange, error, placeholder, maxLength, rows = 8 }: Omit<FieldProps, "prefix" | "inputMode" | "hint"> & { rows?: number }) {
  const id = useId();
  return (
    <div id={`field-${name}`}>
      <label htmlFor={id} className="mb-2 block text-sm font-medium">
        {label}
      </label>
      <textarea
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        rows={rows}
        aria-invalid={!!error}
        className={`${INPUT} resize-y leading-6 ${error ? "border-[#C13515]" : "border-line-strong"}`}
      />
      <div className="flex justify-between">
        <ErrorText>{error}</ErrorText>
        {maxLength && <p className="ml-auto mt-2 text-xs text-muted">{value.length}/{maxLength}</p>}
      </div>
    </div>
  );
}

/** "Guests  [−] 4 [+]" row, same round buttons as the guest picker in the search bar. */
export function Stepper({ label, value, min, max, onChange }: { label: string; value: number; min: number; max: number; onChange: (value: number) => void }) {
  const btn =
    "grid h-8 w-8 place-items-center rounded-full border border-line-strong text-muted hover:border-ink hover:text-ink disabled:cursor-not-allowed disabled:border-line-light disabled:text-line-light";
  return (
    <div className="flex items-center justify-between border-b border-line-light py-5 last:border-0">
      <span className="text-base">{label}</span>
      <div className="flex items-center gap-4">
        <button type="button" aria-label={`Fewer ${label.toLowerCase()}`} disabled={value <= min} onClick={() => onChange(value - 1)} className={btn}>
          <Minus size={14} strokeWidth={2.5} />
        </button>
        <span className="w-5 text-center text-base" aria-live="polite">{value}</span>
        <button type="button" aria-label={`More ${label.toLowerCase()}`} disabled={value >= max} onClick={() => onChange(value + 1)} className={btn}>
          <Plus size={14} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
}

/** Selectable card used for property type and category (Airbnb: 1px border, 2px black + grey fill when chosen). */
export function OptionCard({ selected, onSelect, children }: { selected: boolean; onSelect: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      className={`flex min-h-[88px] flex-col items-start justify-between gap-3 rounded-xl p-4 text-left text-base font-medium transition-colors ${
        selected ? "border-2 border-ink bg-subtle" : "border border-line-strong hover:border-ink"
      }`}
    >
      {children}
    </button>
  );
}
