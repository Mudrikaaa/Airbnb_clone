"use client";

import { ArrowLeft, ChevronRight, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { DeleteListingModal } from "@/components/host/DeleteListingModal";
import {
  AmenityFields, BasicsFields, CategoryFields, DescriptionFields, LocationFields, PhotoFields, PriceFields, PropertyTypeFields, TitleFields,
  type GroupProps,
} from "@/components/host/listing-form/FieldGroups";
import { toInput, validate, valuesFromListing, type FormErrors, type FormValues } from "@/components/host/listing-form/form-state";
import { Modal } from "@/components/ui/Modal";
import { ApiError, apiFetch } from "@/lib/api";
import { formatPrice, plural } from "@/lib/format";
import { refreshAfterListingChange } from "@/lib/host-cache";
import type { ListingDetail } from "@/lib/types";

type Section = {
  key: string;
  name: string;
  /** Airbnb's large heading above the editor on the right. */
  heading: string;
  fields: (keyof FormValues)[];
  Body: (props: GroupProps) => React.ReactNode;
  /** Short summary of the saved value, shown on the card in the left list. */
  preview: (v: FormValues) => React.ReactNode;
};

const label = (key: string) => (key ? key[0].toUpperCase() + key.slice(1).replace(/_/g, " ") : "Not set");

const SECTIONS: Section[] = [
  {
    key: "photos", name: "Photo tour", heading: "Photo tour", fields: ["image_urls"], Body: PhotoFields,
    preview: (v) => (
      <span className="flex items-center gap-3">
        {v.image_urls[0] && (
          // eslint-disable-next-line @next/next/no-img-element -- host photos come from arbitrary URLs
          <img src={v.image_urls[0]} alt="" className="h-12 w-16 rounded-md object-cover" />
        )}
        {plural(v.image_urls.length, "photo")}
      </span>
    ),
  },
  { key: "title", name: "Title", heading: "Title", fields: ["title"], Body: TitleFields, preview: (v) => v.title },
  { key: "type", name: "Property type", heading: "Property type", fields: ["property_type"], Body: PropertyTypeFields, preview: (v) => label(v.property_type) },
  { key: "category", name: "Category", heading: "Category", fields: ["category"], Body: CategoryFields, preview: (v) => label(v.category) },
  {
    key: "pricing", name: "Pricing", heading: "Pricing", fields: ["price_per_night", "cleaning_fee"], Body: PriceFields,
    preview: (v) => `${formatPrice(Number(v.price_per_night))} per night · ${formatPrice(Number(v.cleaning_fee))} cleaning fee`,
  },
  {
    key: "guests", name: "Number of guests", heading: "Number of guests", fields: ["max_guests", "bedrooms", "beds", "bathrooms"], Body: BasicsFields,
    preview: (v) => `${plural(v.max_guests, "guest")} · ${plural(v.bedrooms, "bedroom")} · ${plural(v.beds, "bed")} · ${plural(v.bathrooms, "bath")}`,
  },
  { key: "description", name: "Description", heading: "Description", fields: ["description"], Body: DescriptionFields, preview: (v) => v.description.split("\n")[0] },
  { key: "amenities", name: "Amenities", heading: "Amenities", fields: ["amenity_ids"], Body: AmenityFields, preview: (v) => plural(v.amenity_ids.length, "amenity", "amenities") },
  {
    key: "location", name: "Location", heading: "Location", fields: ["address", "city", "state", "country", "latitude", "longitude"], Body: LocationFields,
    preview: (v) => `${v.city}, ${v.country}`,
  },
];

const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);

/**
 * Airbnb-style listing editor: section cards with previews on the left, one section edited at a time on
 * the right, saved on its own. Phones show the list first and open a section full screen.
 */
export function ListingEditor({ listing }: { listing: ListingDetail }) {
  const router = useRouter();
  const [saved, setSaved] = useState<FormValues>(() => valuesFromListing(listing));
  const [draft, setDraft] = useState<FormValues>(saved);
  const [errors, setErrors] = useState<FormErrors>({});
  const [selected, setSelected] = useState(SECTIONS[0].key);
  const [mobileOpen, setMobileOpen] = useState(false); // phones: list vs. one section full screen
  const [pending, setPending] = useState<string | null>(null); // section to open once unsaved changes are resolved
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const section = SECTIONS.find((s) => s.key === selected)!;
  const dirty = section.fields.some((f) => !same(draft[f], saved[f]));

  const set = <K extends keyof FormValues>(key: K, value: FormValues[K]) => {
    setDraft((v) => ({ ...v, [key]: value }));
    setErrors((e) => (e[key] ? { ...e, [key]: undefined } : e));
  };

  const open = (key: string) => {
    setSelected(key);
    setMobileOpen(true);
    setErrors({});
  };

  // Leaving a section with unsaved edits asks first ("Discard" / "Keep editing").
  const requestOpen = (key: string) => {
    if (key === selected && mobileOpen) return;
    if (dirty) return setPending(key);
    open(key);
  };

  const discard = () => {
    setDraft(saved);
    const next = pending;
    setPending(null);
    if (next === "__list") setMobileOpen(false);
    else if (next) open(next);
  };

  const save = async () => {
    // Other sections hold saved (valid) values, so only this section's errors can appear.
    const all = validate(draft);
    const found = Object.fromEntries(section.fields.filter((f) => all[f]).map((f) => [f, all[f]])) as FormErrors;
    if (Object.keys(found).length > 0) return setErrors(found);

    setSaving(true);
    try {
      const updated = await apiFetch<ListingDetail>(`/api/listings/${listing.id}`, { method: "PUT", body: JSON.stringify(toInput(draft)) });
      const values = valuesFromListing(updated);
      setSaved(values);
      setDraft(values);
      await refreshAfterListingChange();
      toast.success("Saved");
    } catch (err) {
      if (err instanceof ApiError && err.status === 422) setErrors(err.fields as FormErrors);
      toast.error(err instanceof ApiError ? err.detail : "Couldn’t save. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const { Body } = section;
  return (
    <div className="flex h-dvh flex-col bg-white">
      {/* Top bar: back to Listings, the title, and View (the public page in a new tab) */}
      <header className="flex h-20 shrink-0 items-center gap-4 border-b border-line-light px-6 md:px-12">
        <Link href="/hosting/listings" aria-label="Back to listings" className="grid h-10 w-10 place-items-center rounded-full hover:bg-subtle">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="min-w-0 flex-1 truncate text-lg font-semibold">{saved.title}</h1>
        <a
          href={`/rooms/${listing.id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-10 items-center rounded-[28px] border border-line px-4 text-sm font-medium hover:border-ink"
        >
          View
        </a>
      </header>

      <div className="flex min-h-0 flex-1">
        {/* Left: section cards */}
        <nav aria-label="Listing sections" className={`no-scrollbar w-full shrink-0 overflow-y-auto border-r border-line-light px-6 py-8 md:block md:w-[400px] md:px-8 xl:w-[460px] ${mobileOpen ? "hidden" : "block"}`}>
          <h2 className="text-[32px] font-semibold leading-9 tracking-[-0.96px]">Listing editor</h2>
          <ul className="mt-8 space-y-4">
            {SECTIONS.map((s) => {
              const active = s.key === selected;
              return (
                <li key={s.key}>
                  <button
                    type="button"
                    onClick={() => requestOpen(s.key)}
                    aria-current={active ? "true" : undefined}
                    className={`flex w-full items-center gap-3 rounded-2xl bg-white p-6 text-left shadow-[0_6px_16px_rgba(0,0,0,0.08)] transition ${
                      active ? "outline outline-2 outline-ink md:outline" : "outline outline-1 outline-line-light hover:outline-line"
                    }`}
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block text-base font-semibold">{s.name}</span>
                      <span className="mt-1 line-clamp-2 block text-sm text-muted">{s.preview(saved)}</span>
                    </span>
                    <ChevronRight size={18} className="shrink-0 text-muted md:hidden" />
                  </button>
                </li>
              );
            })}
          </ul>
          <button
            type="button"
            onClick={() => setConfirmDelete(true)}
            className="mt-8 flex items-center gap-2 rounded-lg px-2 py-3 text-base font-semibold underline hover:bg-subtle"
          >
            <Trash2 size={18} /> Delete listing
          </button>
        </nav>

        {/* Right: the selected section */}
        <section aria-label={section.name} className={`min-w-0 flex-1 flex-col md:flex ${mobileOpen ? "flex" : "hidden"}`}>
          <div className="min-h-0 flex-1 overflow-y-auto">
            <div className="mx-auto max-w-[640px] px-6 pb-16 pt-6 md:pt-12">
              <button
                type="button"
                onClick={() => (dirty ? setPending("__list") : setMobileOpen(false))}
                aria-label="Back to sections"
                className="-ml-2 mb-4 grid h-10 w-10 place-items-center rounded-full hover:bg-subtle md:hidden"
              >
                <ArrowLeft size={20} />
              </button>
              <h2 className="text-[32px] font-semibold leading-9 tracking-[-0.96px]">{section.heading}</h2>
              <div className="mt-8">
                <Body values={draft} errors={errors} set={set} />
              </div>
            </div>
          </div>
          <div className="flex shrink-0 items-center justify-end border-t border-line-light bg-white px-6 py-4 md:px-12">
            <button
              type="button"
              onClick={save}
              disabled={!dirty || saving}
              className="h-12 rounded-btn bg-ink px-8 text-base font-semibold text-white hover:bg-black disabled:cursor-not-allowed disabled:bg-line-strong"
            >
              {saving ? "Saving…" : "Save"}
            </button>
          </div>
        </section>
      </div>

      <Modal
        open={pending !== null}
        onClose={() => setPending(null)}
        title="Unsaved changes"
        footer={
          <div className="flex items-center justify-between gap-4">
            <button type="button" onClick={discard} className="rounded-lg px-2 py-2 text-base font-semibold underline">
              Discard
            </button>
            <button type="button" onClick={() => setPending(null)} className="h-12 rounded-btn bg-ink px-6 text-base font-semibold text-white hover:bg-black">
              Keep editing
            </button>
          </div>
        }
      >
        <h3 className="text-[22px] font-semibold leading-[26px]">Discard your changes?</h3>
        <p className="mt-3 text-base text-muted">You have unsaved changes in {section.name}. If you leave now, they’ll be lost.</p>
      </Modal>

      <DeleteListingModal
        listing={confirmDelete ? { id: listing.id, title: saved.title } : null}
        onClose={() => setConfirmDelete(false)}
        onDeleted={() => router.push("/hosting/listings")}
      />
    </div>
  );
}
