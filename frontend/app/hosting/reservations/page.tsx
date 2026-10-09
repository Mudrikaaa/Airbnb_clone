import type { Metadata } from "next";
import { HostDashboard } from "@/components/host/HostDashboard";

export const metadata: Metadata = { title: "All reservations - Airbnb Clone" };

export default function HostingAllReservationsPage() {
  return <HostDashboard tab="all-reservations" />;
}
