import type { Metadata } from "next";
import { BecomeAHostIntro } from "@/components/host/become-a-host/BecomeAHostIntro";

export const metadata: Metadata = { title: "Become a host - Airbnb Clone" };

export default function BecomeAHostPage() {
  return <BecomeAHostIntro />;
}
