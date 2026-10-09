"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import useSWR from "swr";
import { toast } from "sonner";
import { DeleteListingModal } from "@/components/host/DeleteListingModal";
import { ErrorText, OptionCard, Section, Stepper, TextArea, TextField } from "@/components/host/listing-form/FormParts";
import { PhotoEditor } from "@/components/host/listing-form/PhotoEditor";
import { EMPTY_VALUES, FIELD_ORDER, LIMITS, toInput, validate, valuesFromListing, type FormErrors, type FormValues } from "@/components/host/listing-form/form-state";
import { Icon } from "@/components/ui/Icon";
import { ApiError, apiFetch, swrFetcher } from "@/lib/api";
import { refreshAfterListingChange } from "@/lib/host-cache";
import type { Amenity, Category, ListingDetail, PropertyType } from "@/lib/types";

/**
 * One form for both "Create a listing" (no `listing`) and "Edit listing" (`listing` = current data).
 * Client-side checks mirror the backend's rules; anything the server still rejects (422) is shown
 * under the field it names.
 */
export function ListingForm({ listing }: { listing?: ListingDetail }) {
  const router = useRouter();
  const editing = listing !== undefined;
  const [values, setValues] = useState<FormValues>(() => (listing ? valuesFromListing(listing) : EMPTY_VALUES));
  const [errors, setErrors] = useState<FormErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const { data: types } = useSWR<PropertyType[]>("/api/meta/property-types", swrFetcher);
  const { data: categories } = useSWR<Category[]>("/api/meta/categories", swrFetcher);
  const { data: amenities } = useSWR<Amenity[]>("/api/meta/amenities", swrFetcher);

  // Editing a field clears that field's error straight away (client or server).
  const set = <K extends keyof FormValues>(key: K, value: FormValues[K]) => {
    setValues((v) => ({ ...v, [key]: value }));
    setErrors((e) => (e[key] ? { ...e, [key]: undefined } : e));
  };

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
      await apiFetch<ListingDetail>(editing ? `/api/listings/${listing.id}` : "/api/listings", {
        method: editing ? "PUT" : "POST",
        body: JSON.stringify(toInput(values)),
      });
      await refreshAfterListingChange();
      toast.success(editing ? "Listing updated" : "Listing created");
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
    <form onSubmit={submit} noValidate className="mx-auto max-w-[760px] px-6 pb-40 pt-4">
      <h1 className="text-[32px] font-semibold leading-9 tracking-[-0.96px]">{editing ? "Edit your listing" : "Create your listing"}</h1>
      <p className="mt-3 text-lg text-muted">
        {editing ? "Update the details guests see. Changes go live as soon as you save." : "Tell guests about your place. You can edit everything later."}
      </p>

      {formError && (
        <div role="alert" className="mt-8 rounded-xl border border-[#C13515] bg-[#FDECEA] px-4 py-3 text-sm text-[#C13515]">
          {formError}
        </div>
      )}

      <div className="mt-8">
        <Section title="Which of these best describes your place?">
          <div id="field-property_type" role="radiogroup" aria-label="Property type" className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {(types ?? []).map((t) => (
              <OptionCard key={t.key} selected={values.property_type === t.key} onSelect={() => set("property_type", t.key)}>
                {t.label}
              </OptionCard>
            ))}
            {!types && <Skeleton count={8} />}
          </div>
          <ErrorText>{errors.property_type}</ErrorText>

          <h3 className="mb-3 mt-10 text-base font-semibold">What does your place stand out for?</h3>
          <div id="field-category" role="radiogroup" aria-label="Category" className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {(categories ?? []).map((c) => (
              <OptionCard key={c.key} selected={values.category === c.key} onSelect={() => set("category", c.key)}>
                <Icon name={c.icon} size={28} strokeWidth={1.5} />
                {c.label}
              </OptionCard>
            ))}
            {!categories && <Skeleton count={8} />}
          </div>
          <ErrorText>{errors.category}</ErrorText>
        </Section>

        <Section title="Where’s your place located?" hint="Guests only get the exact address after they book.">
          <div className="grid gap-4">
            <TextField name="address" label="Street address" value={values.address} onChange={(v) => set("address", v)} error={errors.address} placeholder="12 Beach Road" />
            <div className="grid gap-4 sm:grid-cols-2">
              <TextField name="city" label="City" value={values.city} onChange={(v) => set("city", v)} error={errors.city} placeholder="Anjuna" />
              <TextField name="state" label="State / region (optional)" value={values.state} onChange={(v) => set("state", v)} error={errors.state} placeholder="Goa" />
            </div>
            <TextField name="country" label="Country" value={values.country} onChange={(v) => set("country", v)} error={errors.country} />
            <div className="grid gap-4 sm:grid-cols-2">
              <TextField name="latitude" label="Latitude" value={values.latitude} onChange={(v) => set("latitude", v)} error={errors.latitude} inputMode="decimal" placeholder="15.5733" />
              <TextField name="longitude" label="Longitude" value={values.longitude} onChange={(v) => set("longitude", v)} error={errors.longitude} inputMode="decimal" placeholder="73.7407" />
            </div>
            <p className="text-sm text-muted">Tip: right-click your spot in Google Maps and click the coordinates to copy them.</p>
          </div>
        </Section>

        <Section title="Share some basics about your place">
          <div id="field-max_guests">
            <Stepper label="Guests" value={values.max_guests} min={LIMITS.guests.min} max={LIMITS.guests.max} onChange={(n) => set("max_guests", n)} />
            <Stepper label="Bedrooms" value={values.bedrooms} min={LIMITS.bedrooms.min} max={LIMITS.bedrooms.max} onChange={(n) => set("bedrooms", n)} />
            <Stepper label="Beds" value={values.beds} min={LIMITS.beds.min} max={LIMITS.beds.max} onChange={(n) => set("beds", n)} />
            <Stepper label="Bathrooms" value={values.bathrooms} min={LIMITS.bathrooms.min} max={LIMITS.bathrooms.max} onChange={(n) => set("bathrooms", n)} />
          </div>
        </Section>

        <Section title="Tell guests what your place has to offer" hint="You can add more amenities after you publish.">
          <div id="field-amenity_ids" className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {(amenities ?? []).map((a) => {
              const checked = values.amenity_ids.includes(a.id);
              return (
                <label
                  key={a.id}
                  className={`flex cursor-pointer flex-col items-start gap-3 rounded-xl p-4 text-base transition-colors focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-ink ${
                    checked ? "border-2 border-ink bg-subtle" : "border border-line-strong hover:border-ink"
                  }`}
                >
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={checked}
                    onChange={() => set("amenity_ids", checked ? values.amenity_ids.filter((id) => id !== a.id) : [...values.amenity_ids, a.id])}
                  />
                  <Icon name={a.icon} size={26} strokeWidth={1.5} />
                  <span className="font-medium">{a.name}</span>
                </label>
              );
            })}
            {!amenities && <Skeleton count={6} />}
          </div>
          <ErrorText>{errors.amenity_ids}</ErrorText>
        </Section>

        <Section title="Add some photos of your place" hint="The first photo is your cover. Use the arrows to reorder.">
          <PhotoEditor urls={values.image_urls} onChange={(urls) => set("image_urls", urls)} error={errors.image_urls} />
        </Section>

        <Section title="Now, let’s give your place a title and description">
          <div className="grid gap-6">
            <TextField name="title" label="Title" value={values.title} onChange={(v) => set("title", v)} error={errors.title} maxLength={LIMITS.title.max} placeholder="Sea-breeze villa with private pool" />
            <TextArea name="description" label="Description" value={values.description} onChange={(v) => set("description", v)} error={errors.description} maxLength={LIMITS.description.max} placeholder="Describe the space, the neighbourhood and what makes a stay here special." />
          </div>
        </Section>

        <Section title="Now, set your price" hint="Guests also pay a 14% service fee on top. You can change these any time.">
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField name="price_per_night" label="Price per night" value={values.price_per_night} onChange={(v) => set("price_per_night", v.replace(/[^\d]/g, ""))} error={errors.price_per_night} prefix="₹" inputMode="numeric" placeholder="4500" />
            <TextField name="cleaning_fee" label="Cleaning fee (one-off)" value={values.cleaning_fee} onChange={(v) => set("cleaning_fee", v.replace(/[^\d]/g, ""))} error={errors.cleaning_fee} prefix="₹" inputMode="numeric" placeholder="0" />
          </div>
        </Section>
      </div>

      {/* Footer bar: Cancel on the left, the main action on the right (Airbnb's Back / Next position) */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white">
        <div className="flex items-center justify-between gap-4 px-6 py-4 md:px-12">
          <div className="flex items-center gap-6">
            <Link href="/hosting/listings" className="text-base font-semibold underline">
              Cancel
            </Link>
            {editing && (
              <button type="button" onClick={() => setConfirmDelete(true)} className="text-base font-semibold text-[#C13515] underline">
                Delete listing
              </button>
            )}
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="h-12 rounded-btn bg-brand-gradient px-8 text-base font-semibold text-white transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? (editing ? "Saving…" : "Publishing…") : editing ? "Save changes" : "Publish listing"}
          </button>
        </div>
      </div>

      {editing && (
        <DeleteListingModal
          listing={confirmDelete ? { id: listing.id, title: listing.title } : null}
          onClose={() => setConfirmDelete(false)}
          onDeleted={() => router.push("/hosting/listings")}
        />
      )}
    </form>
  );
}

function Skeleton({ count }: { count: number }) {
  return (
    <>
      {Array.from({ length: count }, (_, i) => (
        <div key={i} aria-hidden className="h-[88px] animate-pulse rounded-xl bg-line-light" />
      ))}
    </>
  );
}
