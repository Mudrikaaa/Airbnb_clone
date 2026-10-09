import type { Metadata } from "next";
import { HostDashboard } from "@/components/host/HostDashboard";

export const metadata: Metadata = { title: "Reservations - Airbnb Clone" };

export default function HostingPage() {
  return <HostDashboard tab="reservations" />;
}
