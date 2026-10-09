import type { Metadata } from "next";
import { RequireLogin } from "@/components/auth/RequireLogin";
import { StepFlow } from "@/components/host/become-a-host/StepFlow";

export const metadata: Metadata = { title: "Create your listing - Airbnb Clone" };

export default function BecomeAHostStepsPage() {
  return (
    <RequireLogin heading="Create your listing" title="Log in to become a host" text="Log in to list your place.">
      <StepFlow />
    </RequireLogin>
  );
}
