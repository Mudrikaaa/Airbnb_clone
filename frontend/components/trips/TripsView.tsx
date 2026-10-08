"use client";

import { format } from "date-fns";
import Link from "next/link";
import { useState } from "react";
import useSWR from "swr";
import { LoginPrompt } from "@/components/auth/LoginPrompt";
import { CancelModal } from "@/components/trips/CancelModal";
import { TripCard } from "@/components/trips/TripCard";
import { swrFetcher } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import type { Booking, Trips } from "@/lib/types";

/** /trips — upcoming and past stays (plus cancelled ones), with cancel for stays that haven't started. */
export function TripsView() {
  const { user, ready, userLoading } = useAuth();
  const { data, error } = useSWR<Trips>(user ? ["/api/bookings/me", user.id] : null, swrFetcher);
  const [cancelling, setCancelling] = useState<Booking | null>(null);

  if (!ready || userLoading) return <TripsSkeleton />;
  if (!user) {
    return <LoginPrompt heading="Trips" title="Log in to view your trips" text="You can view and manage your bookings once you’ve logged in." />;
  }

  // The backend refuses to cancel once the check-in day has arrived, so don't offer it.
  const today = format(new Date(), "yyyy-MM-dd");
  const canCancel = (b: Booking) => b.status === "confirmed" && b.check_in > today;

  const empty = data && data.upcoming.length + data.past.length + data.cancelled.length === 0;

  return (
    <main className="px-6 pb-24 pt-8 md:px-20 md:pt-[92px]">
      <h1 className="text-[32px] font-semibold leading-9 tracking-[-0.96px]">Trips</h1>

      {error ? (
        <p className="mt-12 text-base text-muted">We couldn’t load your trips. Check that the API is running and refresh.</p>
      ) : !data ? (
        <TripsSkeletonBody />
      ) : empty ? (
        <div className="mt-12 max-w-md border-t border-line pt-12">
          <h2 className="text-[22px] font-semibold leading-[26px]">No trips booked...yet!</h2>
          <p className="mt-2 text-base">Time to dust off your bags and start planning your next adventure.</p>
          <Link href="/" className="mt-6 inline-block h-12 rounded-btn border border-ink px-6 py-3 text-base font-semibold hover:bg-subtle">
            Start searching
          </Link>
        </div>
      ) : (
        <div className="mt-12 space-y-14">
          <Section title="Upcoming reservations" empty="No upcoming reservations." bookings={data.upcoming} canCancel={canCancel} onCancel={setCancelling} />
          <Section title="Where you’ve been" empty="Your past stays will show up here." bookings={data.past} canCancel={canCancel} onCancel={setCancelling} />
          {data.cancelled.length > 0 && (
            <Section title="Cancelled" bookings={data.cancelled} canCancel={canCancel} onCancel={setCancelling} />
          )}
        </div>
      )}

      <CancelModal booking={cancelling} onClose={() => setCancelling(null)} />
    </main>
  );
}

type SectionProps = {
  title: string;
  empty?: string;
  bookings: Booking[];
  canCancel: (b: Booking) => boolean;
  onCancel: (b: Booking) => void;
};

function Section({ title, empty, bookings, canCancel, onCancel }: SectionProps) {
  return (
    <section aria-label={title}>
      <h2 className="text-[22px] font-semibold leading-[26px] tracking-[-0.44px]">
        {title} <span className="text-base font-normal text-muted">({bookings.length})</span>
      </h2>
      {bookings.length === 0 ? (
        <p className="mt-4 text-base text-muted">{empty}</p>
      ) : (
        <div className="mt-6 grid gap-6 xl:grid-cols-2">
          {bookings.map((b) => (
            <TripCard key={b.id} booking={b} onCancel={canCancel(b) ? onCancel : undefined} />
          ))}
        </div>
      )}
    </section>
  );
}

function TripsSkeleton() {
  return (
    <main aria-hidden className="px-6 pt-8 md:px-20 md:pt-[92px]">
      <h1 className="text-[32px] font-semibold leading-9 tracking-[-0.96px]">Trips</h1>
      <TripsSkeletonBody />
    </main>
  );
}

function TripsSkeletonBody() {
  return (
    <div aria-hidden className="mt-12 grid gap-6 xl:grid-cols-2">
      {[0, 1].map((i) => (
        <div key={i} className="h-[200px] animate-pulse rounded-[20px] bg-line-light" />
      ))}
    </div>
  );
}
