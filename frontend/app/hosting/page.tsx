import type { Metadata } from "next";
import { HostDashboard } from "@/components/host/HostDashboard";

export const metadata: Metadata = { title: "Today - Airbnb Clone" };

export default function HostingPage() {
  return <HostDashboard tab="today" />;
}
