import type { Metadata } from "next";
import { HostDashboard } from "@/components/host/HostDashboard";

export const metadata: Metadata = { title: "Messages - Airbnb Clone" };

export default function HostingMessagesPage() {
  return <HostDashboard tab="messages" />;
}
