import type { Metadata } from "next";
import { HostDashboard } from "@/components/host/HostDashboard";

export const metadata: Metadata = { title: "Listings - Airbnb Clone" };

export default function HostingListingsPage() {
  return <HostDashboard tab="listings" />;
}
