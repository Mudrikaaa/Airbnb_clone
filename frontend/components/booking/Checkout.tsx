"use client";

import { addDays, format, parseISO } from "date-fns";
import { AlertCircle, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { PaymentForm, EMPTY_CARD, validateCard, type CardErrors, type CardFields } from "@/components/booking/PaymentForm";
import { SummaryCard } from "@/components/booking/SummaryCard";
import { AvailabilityCalendar } from "@/components/listing-detail/AvailabilityCalendar";
import { useBooking } from "@/components/listing-detail/useBooking";
import { GuestsPanel } from "@/components/search/GuestsPanel";
import { Modal } from "@/components/ui/Modal";
import { ApiError, apiFetch } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { refreshAfterBookingChange } from "@/lib/booking-cache";
import { formatDateRange } from "@/lib/format";
import { EMPTY_SEARCH, guestSummary, toUrlQuery } from "@/lib/search-params";
import type { Booking, ListingDetail } from "@/lib/types";
import { useMediaQuery } from "@/lib/use-media-query";

type Props = { listing: ListingDetail; nights: Set<string> };

const STEP_ACTIVE = "rounded-3xl bg-white p-6 shadow-badge";
const STEP_IDLE = "rounded-[20px] border border-line p-6";

/** "Confirm and pay": login gate → trip details → mock payment → cancellation policy → confirm. */
export function Checkout({ listing, nights }: Props) {
  const router = useRouter();
  const { user, users, ready, openLogin } = useAuth();
  const { stay, hasDates, quote, problem } = useBooking(listing, nights);
  const [card, setCard] = useState<CardFields>(EMPTY_CARD);
  const [errors, setErrors] = useState<CardErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [editing, setEditing] = useState<"dates" | "guests" | null>(null);
  const twoMonths = useMediaQuery("(min-width: 744px)");

  // Not logged in? Open the login modal straight away (once) instead of failing at submit time.
  const askedToLogin = useRef(false);
  useEffect(() => {
    if (ready && users.length > 0 && !user && !askedToLogin.current) {
      askedToLogin.current = true;
      openLogin();
    }
  }, [ready, users.length, user, openLogin]);

  const listingUrl = `/rooms/${listing.id}${stay.query ? `?${stay.query}` : ""}`;

  if (!hasDates) {
    return (
      <Shell title="Confirm and pay" backHref={`/rooms/${listing.id}`}>
        <div className="col-span-full">
          <p className="text-lg">You haven’t picked any dates yet.</p>
          <Link href={`/rooms/${listing.id}`} className="mt-6 inline-block rounded-btn bg-brand-gradient px-6 py-3.5 text-base font-medium text-white">
            Choose dates
          </Link>
        </div>
      </Shell>
    );
  }

  const checkIn = stay.checkIn!;
  const checkOut = stay.checkOut!;
  const year = format(parseISO(checkOut), "yyyy");
  const datesLabel = `${formatDateRange(checkIn, checkOut)} ${year}`;
  const guestsLabel = guestSummary(stay.guests) ?? "1 guest";
  // The backend lets guests cancel up to the day before check-in.
  const freeUntil = format(parseISO(checkIn), "d MMM");
  const lastFreeDay = format(addDays(parseISO(checkIn), -1), "d MMM yyyy");

  const confirm = async () => {
    const found = validateCard(card);
    setErrors(found);
    if (Object.keys(found).length > 0) {
      toast.error("Check your card details");
      return;
    }
    if (!user) return openLogin();

    setSubmitting(true);
    try {
      await apiFetch<Booking>("/api/bookings", {
        method: "POST",
        body: JSON.stringify({ listing_id: listing.id, check_in: checkIn, check_out: checkOut, guests: stay.guestCount }),
      });
      await refreshAfterBookingChange(listing.id);
      toast.success("Booking confirmed! Have a great trip.");
      router.push("/trips");
    } catch (err) {
      setSubmitting(false);
      if (err instanceof ApiError && err.status === 409) {
        // Someone else got those dates first: back to the listing to pick new ones (guests kept).
        toast.error(err.detail);
        await refreshAfterBookingChange(listing.id);
        const keepGuests = toUrlQuery({ ...EMPTY_SEARCH, ...stay.guests, checkIn: null, checkOut: null, location: "" });
        router.replace(`/rooms/${listing.id}${keepGuests ? `?${keepGuests}` : ""}`);
      } else {
        toast.error(err instanceof ApiError ? err.detail : "Something went wrong. Please try again.");
      }
    }
  };

  const summary = <SummaryCard listing={listing} quote={quote} datesLabel={datesLabel} guestsLabel={guestsLabel} freeUntil={freeUntil} />;

  // ---- Logged out: Airbnb's three-step list, with step 1 active ----
  if (!user) {
    return (
      <Shell title="Confirm and pay" backHref={listingUrl} summary={summary}>
        <div className="space-y-6">
          <section className={`${STEP_ACTIVE} flex items-center justify-between gap-4`}>
            <div>
              <h2 className="text-lg font-semibold">1. Log in or sign up</h2>
              <p className="mt-1 text-xs text-muted">Step 1 of 3</p>
            </div>
            <button type="button" onClick={openLogin} className="h-12 rounded-xl bg-brand-gradient px-6 text-base font-medium text-white hover:brightness-95">
              Continue
            </button>
          </section>
          <section className={STEP_IDLE}>
            <h2 className="text-lg font-semibold">2. Add a payment method</h2>
            <p className="mt-1 text-xs text-muted">Step 2 of 3</p>
          </section>
          <section className={STEP_IDLE}>
            <h2 className="text-lg font-semibold">3. Proceed to payment</h2>
            <p className="mt-1 text-xs text-muted">Step 3 of 3</p>
          </section>
        </div>
      </Shell>
    );
  }

  // ---- Logged in ----
  return (
    <Shell title="Confirm and pay" backHref={listingUrl} summary={summary}>
      <div>
        {problem && (
          <p role="alert" className="mb-8 flex items-start gap-3 rounded-xl border border-[#C13515] p-4 text-sm text-[#C13515]">
            <AlertCircle size={18} className="mt-0.5 shrink-0" />
            <span>
              {problem}{" "}
              <Link href={`/rooms/${listing.id}`} className="font-semibold underline">
                Back to the listing
              </Link>
            </span>
          </p>
        )}

        <h2 className="text-[22px] font-semibold leading-[26px] tracking-[-0.44px]">Your trip</h2>
        <div className="mt-6 space-y-6">
          <EditableRow label="Dates" value={datesLabel} onEdit={() => setEditing("dates")} />
          <EditableRow label="Guests" value={guestsLabel} onEdit={() => setEditing("guests")} />
        </div>

        <hr className="my-8 border-line" />

        <h2 className="text-[22px] font-semibold leading-[26px] tracking-[-0.44px]">Pay with</h2>
        <div className="mt-6">
          <PaymentForm
            value={card}
            errors={errors}
            onChange={(next) => {
              setCard(next);
              setErrors({}); // stale messages go away as soon as the guest edits a field
            }}
          />
        </div>

        <hr className="my-8 border-line" />

        <section id="cancellation" className="scroll-mt-8">
          <h2 className="text-[22px] font-semibold leading-[26px] tracking-[-0.44px]">Cancellation policy</h2>
          <p className="mt-4 text-base leading-6">
            <b className="font-semibold">Free cancellation before {format(parseISO(checkIn), "d MMM yyyy")}.</b> Cancel up to {lastFreeDay} and you’ll
            get a full refund. Once the check-in day arrives, this reservation can’t be cancelled.
          </p>
        </section>

        <hr className="my-8 border-line" />

        <p className="text-xs leading-4 text-muted">
          By selecting the button below, I agree to the host’s house rules, Airbnb’s rebooking and refund policy and that Airbnb can charge my payment
          method if I’m responsible for damage. (This is a demo — no payment is taken.)
        </p>
        <button
          type="button"
          onClick={confirm}
          disabled={submitting || !!problem || !quote}
          className="mt-6 h-14 w-full rounded-xl bg-brand-gradient text-base font-medium text-white transition hover:brightness-95 disabled:cursor-not-allowed disabled:bg-none disabled:bg-line"
        >
          {submitting ? "Confirming…" : "Confirm and pay"}
        </button>
      </div>

      <Modal
        open={editing === "dates"}
        onClose={() => setEditing(null)}
        title="Change dates"
        widthClass="max-w-[780px]"
        footer={
          <div className="flex justify-between">
            <button type="button" onClick={() => stay.setDates(null, null)} className="rounded-lg px-2 text-base font-semibold underline">
              Clear dates
            </button>
            <button type="button" onClick={() => setEditing(null)} className="h-12 rounded-btn bg-ink px-6 text-base font-semibold text-white hover:bg-black">
              Save
            </button>
          </div>
        }
      >
        <p className="mb-4 text-sm text-muted">Struck-through nights are already booked.</p>
        <div className="flex justify-center [&_.rdp-root]:[--cell:44px]">
          <AvailabilityCalendar
            nights={nights}
            checkIn={checkIn}
            checkOut={checkOut}
            onChange={(ci, co) => {
              stay.setDates(ci, co);
              if (ci && co) setEditing(null);
            }}
            months={twoMonths ? 2 : 1}
          />
        </div>
      </Modal>

      <Modal
        open={editing === "guests"}
        onClose={() => setEditing(null)}
        title="Change guests"
        footer={
          <div className="flex justify-end">
            <button type="button" onClick={() => setEditing(null)} className="h-12 rounded-btn bg-ink px-6 text-base font-semibold text-white hover:bg-black">
              Save
            </button>
          </div>
        }
      >
        <div className="-mx-8 -my-4">
          <GuestsPanel guests={stay.guests} onChange={stay.setGuests} maxGuests={listing.max_guests} />
        </div>
        <p className="text-sm text-muted">This place has a maximum of {listing.max_guests} guests, not including infants.</p>
      </Modal>
    </Shell>
  );
}

/** Page frame measured on airbnb.com: 976px content, 32px/600 title with a round back button, 524 + 372 columns, 80px gap. */
function Shell({ title, backHref, summary, children }: { title: string; backHref: string; summary?: React.ReactNode; children: React.ReactNode }) {
  return (
    <main className="mx-auto max-w-[1024px] px-6 pb-24 pt-8">
      <div className="relative flex items-center gap-4">
        <Link
          href={backHref}
          aria-label="Back"
          className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-chip hover:bg-[#EBEBEB] lg:absolute lg:-left-[66px]"
        >
          <ChevronLeft size={18} strokeWidth={2.5} />
        </Link>
        <h1 className="text-[32px] font-semibold leading-9 tracking-[-0.96px]">{title}</h1>
      </div>
      <div className="mt-6 grid gap-8 lg:grid-cols-[524px_372px] lg:justify-between lg:gap-20">
        {/* On phones the listing summary comes first, as on Airbnb. */}
        {summary && <div className="order-first lg:order-2 lg:sticky lg:top-8 lg:self-start">{summary}</div>}
        <div className="order-2 lg:order-1">{children}</div>
      </div>
    </main>
  );
}

function EditableRow({ label, value, onEdit }: { label: string; value: string; onEdit: () => void }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-base font-semibold">{label}</p>
        <p className="mt-1 text-base">{value}</p>
      </div>
      <button type="button" onClick={onEdit} className="text-base font-semibold underline">
        Edit
      </button>
    </div>
  );
}
