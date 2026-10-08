"use client";

import { CreditCard } from "lucide-react";

export type CardFields = { number: string; expiry: string; cvv: string; postal: string };
export type CardErrors = Partial<Record<keyof CardFields, string>>;

export const EMPTY_CARD: CardFields = { number: "", expiry: "", cvv: "", postal: "" };

// "Mock" payment: we only check that the values *look* like a card (format), nothing is sent anywhere.
export function validateCard(card: CardFields): CardErrors {
  const errors: CardErrors = {};
  if (!/^\d{16}$/.test(card.number.replace(/\s/g, ""))) errors.number = "Enter a 16-digit card number.";
  const match = /^(\d{2}) ?\/ ?(\d{2})$/.exec(card.expiry);
  if (!match || Number(match[1]) < 1 || Number(match[1]) > 12) errors.expiry = "Enter a valid expiry date (MM / YY).";
  else {
    const now = new Date();
    const year = 2000 + Number(match[2]);
    if (year < now.getFullYear() || (year === now.getFullYear() && Number(match[1]) < now.getMonth() + 1)) errors.expiry = "This card has expired.";
  }
  if (!/^\d{3,4}$/.test(card.cvv)) errors.cvv = "Enter the 3 or 4-digit security code.";
  if (!/^[A-Za-z0-9 -]{4,10}$/.test(card.postal.trim())) errors.postal = "Enter a valid postal code.";
  return errors;
}

const formatNumber = (v: string) => v.replace(/\D/g, "").slice(0, 16).replace(/(\d{4})(?=\d)/g, "$1 ");
const formatExpiry = (v: string) => {
  const digits = v.replace(/\D/g, "").slice(0, 4);
  return digits.length > 2 ? `${digits.slice(0, 2)} / ${digits.slice(2)}` : digits;
};

type Props = { value: CardFields; errors: CardErrors; onChange: (next: CardFields) => void };

/** Card fields in Airbnb's grouped style: one rounded box, hairline dividers, labels inside. */
export function PaymentForm({ value, errors, onChange }: Props) {
  const set = (patch: Partial<CardFields>) => onChange({ ...value, ...patch });
  const hasErrors = Object.keys(errors).length > 0;

  return (
    <div>
      <p className="mb-4 flex items-start gap-2 rounded-xl bg-subtle px-4 py-3 text-sm text-muted">
        <span aria-hidden>🔒</span>
        <span>
          <b className="font-semibold text-ink">Demo payment.</b> Nothing is charged and nothing is sent anywhere. Use any
          card-shaped numbers, e.g. 4242 4242 4242 4242, any future expiry and any CVV.
        </span>
      </p>

      <div className={`overflow-hidden rounded-xl border ${hasErrors ? "border-[#C13515]" : "border-[#8C8C8C]"}`}>
        <Field label="Card number" error={errors.number} className="relative">
          <input
            inputMode="numeric"
            autoComplete="off"
            placeholder="1234 5678 9012 3456"
            value={value.number}
            onChange={(e) => set({ number: formatNumber(e.target.value) })}
            className="w-full bg-transparent pr-8 text-base outline-none placeholder:text-muted"
          />
          <CreditCard size={20} strokeWidth={1.5} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted" />
        </Field>
        <div className="grid grid-cols-2 border-t border-[#8C8C8C]">
          <Field label="Expiration" error={errors.expiry}>
            <input
              inputMode="numeric"
              autoComplete="off"
              placeholder="MM / YY"
              value={value.expiry}
              onChange={(e) => set({ expiry: formatExpiry(e.target.value) })}
              className="w-full bg-transparent text-base outline-none placeholder:text-muted"
            />
          </Field>
          <Field label="CVV" error={errors.cvv} className="border-l border-[#8C8C8C]">
            <input
              inputMode="numeric"
              autoComplete="off"
              placeholder="123"
              value={value.cvv}
              onChange={(e) => set({ cvv: e.target.value.replace(/\D/g, "").slice(0, 4) })}
              className="w-full bg-transparent text-base outline-none placeholder:text-muted"
            />
          </Field>
        </div>
        <Field label="Postal code" error={errors.postal} className="border-t border-[#8C8C8C]">
          <input
            autoComplete="off"
            placeholder="403509"
            value={value.postal}
            onChange={(e) => set({ postal: e.target.value.slice(0, 10) })}
            className="w-full bg-transparent text-base outline-none placeholder:text-muted"
          />
        </Field>
      </div>

      {hasErrors && (
        <ul className="mt-2 space-y-1 text-sm text-[#C13515]" role="alert">
          {Object.values(errors).map((message) => (
            <li key={message}>{message}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Field(props: { label: string; error?: string; className?: string; children: React.ReactNode }) {
  return (
    <label className={`block px-4 pb-3 pt-2.5 focus-within:outline focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-ink ${props.className ?? ""}`}>
      <span className={`block text-xs ${props.error ? "text-[#C13515]" : "text-muted"}`}>{props.label}</span>
      {props.children}
    </label>
  );
}
