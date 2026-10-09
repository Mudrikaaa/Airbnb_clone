"use client";

import { Suspense } from "react";
import { RequireLogin } from "@/components/auth/RequireLogin";
import { AllReservationsView } from "@/components/host/AllReservationsView";
import { ComingSoonPage } from "@/components/host/ComingSoonPage";
import { ListingsView } from "@/components/host/ListingsView";
import { ReservationsView } from "@/components/host/ReservationsView";

type Tab = "today" | "all-reservations" | "calendar" | "listings" | "messages";

/** Every /hosting route shares the login guard; `tab` picks the view. */
export function HostDashboard({ tab }: { tab: Tab }) {
  return (
    <RequireLogin heading="Hosting" title="Log in to manage your hosting" text="You can view reservations and manage your listings once you’ve logged in.">
      {tab === "today" && (
        // ReservationsView reads ?tab= from the URL, which Next.js wants inside Suspense.
        <Suspense fallback={null}>
          <ReservationsView />
        </Suspense>
      )}
      {tab === "all-reservations" && <AllReservationsView />}
      {tab === "listings" && <ListingsView />}
      {tab === "calendar" && <ComingSoonPage feature="Calendar" />}
      {tab === "messages" && <ComingSoonPage feature="Messages" plural />}
    </RequireLogin>
  );
}
