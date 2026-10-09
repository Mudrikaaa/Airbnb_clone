"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { mutate } from "swr";
import {
  AmenityFields, BasicsFields, CategoryFields, DescriptionFields, LocationFields, PhotoFields, PriceFields, PropertyTypeFields, TitleFields,
  type GroupProps,
} from "@/components/host/listing-form/FieldGroups";
import { EMPTY_VALUES, toInput, validate, type FormErrors, type FormValues } from "@/components/host/listing-form/form-state";
import { ApiError, apiFetch } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { refreshAfterListingChange } from "@/lib/host-cache";
import type { ListingDetail } from "@/lib/types";

type Step = {
  /** Which of Airbnb's three stages the step belongs to (drives the 3-part progress bar). */
  stage: 0 | 1 | 2;
  title: string;
  hint?: string;
  fields: (keyof FormValues)[];
  Body: (props: GroupProps) => React.ReactNode;
};

// Airbnb's order: where the place is and what it is (stage 1), then photos and words (stage 2),
// then the price and publish (stage 3). Each screen asks one question.
const STEPS: Step[] = [
  { stage: 0, title: "Where’s your place located?", hint: "Your address is only shared with guests after they’ve made a reservation.", fields: ["address", "city", "state", "country", "latitude", "longitude"], Body: LocationFields },
  { stage: 0, title: "Which of these best describes your place?", fields: ["property_type"], Body: PropertyTypeFields },
  { stage: 0, title: "What does your place stand out for?", hint: "Guests use these categories to find places like yours.", fields: ["category"], Body: CategoryFields },
  { stage: 0, title: "Share some basics about your place", hint: "You’ll add more details later, such as bed types.", fields: ["max_guests", "bedrooms", "beds", "bathrooms"], Body: BasicsFields },
  { stage: 1, title: "Tell guests what your place has to offer", hint: "You can add more amenities after you publish your listing.", fields: ["amenity_ids"], Body: AmenityFields },
  { stage: 1, title: "Add some photos of your place", hint: "You’ll need at least one photo to get started. The first one is your cover.", fields: ["image_urls"], Body: PhotoFields },
  { stage: 1, title: "Now, let’s give your place a title", hint: "Short titles work best. Have fun with it – you can always change it later.", fields: ["title"], Body: TitleFields },
  { stage: 1, title: "Create your description", hint: "Share what makes your place special.", fields: ["description"], Body: DescriptionFields },
  { stage: 2, title: "Now, set your price", hint: "Guests also pay a 14% service fee on top. You can change it any time.", fields: ["price_per_night", "cleaning_fee"], Body: PriceFields },
];

/**
 * "Become a host" create flow: the same values and validation as the single-page ListingForm,
 * shown one question per screen with Back / Next and a progress bar (Airbnb's create-listing layout).
 */
export function StepFlow() {
  const router = useRouter();
  const { setMode } = useAuth();
  const [index, setIndex] = useState(0);
  const [values, setValues] = useState<FormValues>(EMPTY_VALUES);
  const [errors, setErrors] = useState<FormErrors>({});
  const [publishing, setPublishing] = useState(false);
  const step = STEPS[index];
  const last = index === STEPS.length - 1;

  const set = <K extends keyof FormValues>(key: K, value: FormValues[K]) => {
    setValues((v) => ({ ...v, [key]: value }));
    setErrors((e) => (e[key] ? { ...e, [key]: undefined } : e));
  };

  // Validate only this screen's fields before moving on.
  const stepErrors = (s: Step) => {
    const all = validate(values);
    return Object.fromEntries(s.fields.filter((f) => all[f]).map((f) => [f, all[f]])) as FormErrors;
  };

  const publish = async () => {
    setPublishing(true);
    try {
      await apiFetch<ListingDetail>("/api/listings", { method: "POST", body: JSON.stringify(toInput(values)) });
      // Refetch the user list too: is_host flips to true, so the header says "Switch to hosting" without a reload.
      await Promise.all([refreshAfterListingChange(), mutate("/api/users")]);
      setMode("hosting");
      toast.success("Your listing is published");
      router.push("/hosting/listings");
    } catch (err) {
      setPublishing(false);
      if (err instanceof ApiError && err.status === 422) {
        // Jump back to the first screen with a field the server rejected.
        const fields = err.fields as FormErrors;
        setErrors(fields);
        const at = STEPS.findIndex((s) => s.fields.some((f) => fields[f]));
        if (at >= 0) setIndex(at);
        toast.error(err.detail);
      } else {
        toast.error(err instanceof ApiError ? err.detail : "Something went wrong. Please try again.");
      }
    }
  };

  const next = () => {
    const found = stepErrors(step);
    if (Object.keys(found).length > 0) return setErrors((e) => ({ ...e, ...found }));
    if (last) return publish();
    setIndex(index + 1);
    window.scrollTo({ top: 0 });
  };

  // Progress: three bars (one per stage), each filled by how far through that stage we are.
  const fill = (stage: number) => {
    const inStage = STEPS.map((s, i) => [s, i] as const).filter(([s]) => s.stage === stage);
    const done = inStage.filter(([, i]) => i < index || (last && i === index && publishing)).length;
    return `${(done / inStage.length) * 100}%`;
  };

  const { Body } = step;
  return (
    <>
      <main className="mx-auto max-w-[630px] px-6 pb-40 pt-4 md:pt-10">
        <p className="text-sm font-medium text-muted">Step {step.stage + 1} of 3</p>
        <h1 className="mt-2 text-[32px] font-semibold leading-9 tracking-[-0.96px]">{step.title}</h1>
        {step.hint && <p className="mt-3 text-lg text-muted">{step.hint}</p>}
        <div className="mt-8">
          <Body values={values} errors={errors} set={set} />
        </div>
      </main>

      <div className="fixed inset-x-0 bottom-0 z-40 bg-white">
        <div className="grid grid-cols-3 gap-2" aria-hidden>
          {[0, 1, 2].map((stage) => (
            <div key={stage} className="h-1.5 bg-line-light">
              <div className="h-full bg-ink transition-[width] duration-300" style={{ width: fill(stage) }} />
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between px-6 py-4 md:px-12">
          <button
            type="button"
            onClick={() => (index === 0 ? router.push("/become-a-host") : setIndex(index - 1))}
            className="rounded-lg px-2 py-3 text-base font-semibold underline hover:bg-subtle"
          >
            Back
          </button>
          <button
            type="button"
            onClick={next}
            disabled={publishing}
            className={`h-12 rounded-btn px-8 text-base font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60 ${
              last ? "bg-brand-gradient hover:brightness-95" : "bg-ink hover:bg-black"
            }`}
          >
            {last ? (publishing ? "Publishing…" : "Publish") : "Next"}
          </button>
        </div>
      </div>
    </>
  );
}
