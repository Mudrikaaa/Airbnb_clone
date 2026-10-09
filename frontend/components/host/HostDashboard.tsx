"use client";

import { RequireLogin } from "@/components/auth/RequireLogin";
import { ListingsView } from "@/components/host/ListingsView";
import { ReservationsView } from "@/components/host/ReservationsView";

/** Both dashboard routes share the login guard; `tab` picks which view /hosting or /hosting/listings shows. */
export function HostDashboard({ tab }: { tab: "reservations" | "listings" }) {
  return (
    <RequireLogin heading="Hosting" title="Log in to manage your hosting" text="You can view reservations and manage your listings once you’ve logged in.">
      {tab === "reservations" ? <ReservationsView /> : <ListingsView />}
    </RequireLogin>
  );
}
