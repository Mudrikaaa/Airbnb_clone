import type { Metadata } from "next";
import { RequireLogin } from "@/components/auth/RequireLogin";
import { ListingForm } from "@/components/host/listing-form/ListingForm";

export const metadata: Metadata = { title: "Create a listing - Airbnb Clone" };

export default function NewListingPage() {
  return (
    <RequireLogin heading="Create a listing" title="Log in to create a listing" text="You can create and manage listings once you’ve logged in.">
      <ListingForm />
    </RequireLogin>
  );
}
