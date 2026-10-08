import type { Metadata } from "next";
import { TripsView } from "@/components/trips/TripsView";

export const metadata: Metadata = { title: "Trips - Airbnb Clone" };

export default function TripsPage() {
  return <TripsView />;
}
