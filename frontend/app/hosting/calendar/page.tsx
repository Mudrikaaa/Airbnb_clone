import type { Metadata } from "next";
import { HostDashboard } from "@/components/host/HostDashboard";

export const metadata: Metadata = { title: "Calendar - Airbnb Clone" };

export default function HostingCalendarPage() {
  return <HostDashboard tab="calendar" />;
}
