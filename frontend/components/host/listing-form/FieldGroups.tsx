"use client";

import useSWR from "swr";
import { ErrorText, OptionCard, Stepper, TextArea, TextField } from "@/components/host/listing-form/FormParts";
import { PhotoEditor } from "@/components/host/listing-form/PhotoEditor";
import { LIMITS, type FormErrors, type FormValues } from "@/components/host/listing-form/form-state";
import { Icon } from "@/components/ui/Icon";
import { swrFetcher } from "@/lib/api";
import type { Amenity, Category, PropertyType } from "@/lib/types";

/**
 * The listing form's field groups. The single-page edit form shows them all one after another;
 * the "become a host" flow shows one per screen. Both share the same values, validation and errors.
 */
export type GroupProps = {
  values: FormValues;
  errors: FormErrors;
  set: <K extends keyof FormValues>(key: K, value: FormValues[K]) => void;
};

export function PropertyTypeFields({ values, errors, set }: GroupProps) {
  const { data: types } = useSWR<PropertyType[]>("/api/meta/property-types", swrFetcher);
  return (
    <>
      <div id="field-property_type" role="radiogroup" aria-label="Property type" className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {(types ?? []).map((t) => (
          <OptionCard key={t.key} selected={values.property_type === t.key} onSelect={() => set("property_type", t.key)}>
            {t.label}
          </OptionCard>
        ))}
        {!types && <Skeleton count={8} />}
      </div>
      <ErrorText>{errors.property_type}</ErrorText>
    </>
  );
}

export function CategoryFields({ values, errors, set }: GroupProps) {
  const { data: categories } = useSWR<Category[]>("/api/meta/categories", swrFetcher);
  return (
    <>
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
    </>
  );
}

export function LocationFields({ values, errors, set }: GroupProps) {
  return (
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
  );
}

export function BasicsFields({ values, set }: GroupProps) {
  return (
    <div id="field-max_guests">
      <Stepper label="Guests" value={values.max_guests} min={LIMITS.guests.min} max={LIMITS.guests.max} onChange={(n) => set("max_guests", n)} />
      <Stepper label="Bedrooms" value={values.bedrooms} min={LIMITS.bedrooms.min} max={LIMITS.bedrooms.max} onChange={(n) => set("bedrooms", n)} />
      <Stepper label="Beds" value={values.beds} min={LIMITS.beds.min} max={LIMITS.beds.max} onChange={(n) => set("beds", n)} />
      <Stepper label="Bathrooms" value={values.bathrooms} min={LIMITS.bathrooms.min} max={LIMITS.bathrooms.max} onChange={(n) => set("bathrooms", n)} />
    </div>
  );
}

export function AmenityFields({ values, errors, set }: GroupProps) {
  const { data: amenities } = useSWR<Amenity[]>("/api/meta/amenities", swrFetcher);
  return (
    <>
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
    </>
  );
}

export function PhotoFields({ values, errors, set }: GroupProps) {
  return <PhotoEditor urls={values.image_urls} onChange={(urls) => set("image_urls", urls)} error={errors.image_urls} />;
}

export function TitleFields({ values, errors, set }: GroupProps) {
  return <TextField name="title" label="Title" value={values.title} onChange={(v) => set("title", v)} error={errors.title} maxLength={LIMITS.title.max} placeholder="Sea-breeze villa with private pool" />;
}

export function DescriptionFields({ values, errors, set }: GroupProps) {
  return (
    <TextArea name="description" label="Description" value={values.description} onChange={(v) => set("description", v)} error={errors.description} maxLength={LIMITS.description.max} placeholder="Describe the space, the neighbourhood and what makes a stay here special." />
  );
}

export function PriceFields({ values, errors, set }: GroupProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <TextField name="price_per_night" label="Price per night" value={values.price_per_night} onChange={(v) => set("price_per_night", v.replace(/[^\d]/g, ""))} error={errors.price_per_night} prefix="₹" inputMode="numeric" placeholder="4500" />
      <TextField name="cleaning_fee" label="Cleaning fee (one-off)" value={values.cleaning_fee} onChange={(v) => set("cleaning_fee", v.replace(/[^\d]/g, ""))} error={errors.cleaning_fee} prefix="₹" inputMode="numeric" placeholder="0" />
    </div>
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
