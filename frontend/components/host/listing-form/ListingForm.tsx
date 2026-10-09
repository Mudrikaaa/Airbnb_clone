"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import {
  AmenityFields, BasicsFields, CategoryFields, DescriptionFields, LocationFields, PhotoFields, PriceFields, PropertyTypeFields, TitleFields,
} from "@/components/host/listing-form/FieldGroups";
import { Section } from "@/components/host/listing-form/FormParts";
import { EMPTY_VALUES, FIELD_ORDER, toInput, validate, type FormErrors, type FormValues } from "@/components/host/listing-form/form-state";
import { ApiError, apiFetch } from "@/lib/api";
import { refreshAfterListingChange } from "@/lib/host-cache";
import type { ListingDetail } from "@/lib/types";

/**
 * Single-page "Create your listing" form for existing hosts (editing uses ListingEditor, new hosts the
 * step flow; all three share FieldGroups). Client-side checks mirror the backend's rules; anything the server still rejects (422) is shown
 * under the field it names.
 */
export function ListingForm() {
  const router = useRouter();
  const [values, setValues] = useState<FormValues>(EMPTY_VALUES);
  const [errors, setErrors] = useState<FormErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Editing a field clears that field's error straight away (client or server).
  const set = <K extends keyof FormValues>(key: K, value: FormValues[K]) => {
    setValues((v) => ({ ...v, [key]: value }));
    setErrors((e) => (e[key] ? { ...e, [key]: undefined } : e));
  };
  const group = { values, errors, set };

  const showErrors = (found: FormErrors, message: string) => {
    setErrors(found);
    setFormError(message);
    const first = FIELD_ORDER.find((name) => found[name]);
    if (first) document.getElementById(`field-${first}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const found = validate(values);
    if (Object.keys(found).length > 0) return showErrors(found, "Fix the highlighted fields to continue.");

    setSubmitting(true);
    setFormError(null);
    try {
      await apiFetch<ListingDetail>("/api/listings", { method: "POST", body: JSON.stringify(toInput(values)) });
      await refreshAfterListingChange();
      toast.success("Listing created");
      router.push("/hosting/listings");
    } catch (err) {
      setSubmitting(false);
      if (err instanceof ApiError && err.status === 422) {
        // Keep only the messages for fields this form has; anything else becomes the banner text.
        const known = Object.fromEntries(Object.entries(err.fields).filter(([name]) => name in EMPTY_VALUES)) as FormErrors;
        showErrors(known, Object.keys(known).length > 0 ? "The server rejected some fields — see below." : err.detail);
      } else {
        toast.error(err instanceof ApiError ? err.detail : "Something went wrong. Please try again.");
      }
    }
  };

  return (
    <form onSubmit={submit} noValidate className="mx-auto max-w-[640px] px-6 pb-40 pt-4">
      <h1 className="text-[32px] font-semibold leading-9 tracking-[-0.96px]">Create your listing</h1>
      <p className="mt-3 text-lg text-muted">Tell guests about your place. You can edit everything later.</p>

      {formError && (
        <div role="alert" className="mt-8 rounded-xl border border-[#C13515] bg-[#FDECEA] px-4 py-3 text-sm text-[#C13515]">
          {formError}
        </div>
      )}

      <div className="mt-8">
        <Section title="Which of these best describes your place?">
          <PropertyTypeFields {...group} />
          <h3 className="mb-3 mt-10 text-base font-semibold">What does your place stand out for?</h3>
          <CategoryFields {...group} />
        </Section>
        <Section title="Where’s your place located?" hint="Guests only get the exact address after they book.">
          <LocationFields {...group} />
        </Section>
        <Section title="Share some basics about your place">
          <BasicsFields {...group} />
        </Section>
        <Section title="Tell guests what your place has to offer" hint="You can add more amenities after you publish.">
          <AmenityFields {...group} />
        </Section>
        <Section title="Add some photos of your place" hint="The first photo is your cover. Use the arrows to reorder.">
          <PhotoFields {...group} />
        </Section>
        <Section title="Now, let’s give your place a title and description">
          <div className="grid gap-6">
            <TitleFields {...group} />
            <DescriptionFields {...group} />
          </div>
        </Section>
        <Section title="Now, set your price" hint="Guests also pay a 14% service fee on top. You can change these any time.">
          <PriceFields {...group} />
        </Section>
      </div>

      {/* Footer bar: Cancel on the left, the main action on the right (Airbnb's Back / Next position) */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white">
        <div className="flex items-center justify-between gap-4 px-6 py-4 md:px-12">
          <Link href="/hosting/listings" className="text-base font-semibold underline">
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="h-12 rounded-btn bg-brand-gradient px-8 text-base font-semibold text-white transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Publishing…" : "Publish listing"}
          </button>
        </div>
      </div>
    </form>
  );
}
