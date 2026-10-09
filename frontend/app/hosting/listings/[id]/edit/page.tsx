import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { EditListing } from "@/components/host/EditListing";

export const metadata: Metadata = { title: "Edit listing - Airbnb Clone" };

export default function EditListingPage({ params }: PageProps<"/hosting/listings/[id]/edit">) {
  return (
    <Suspense fallback={null}>
      <Edit params={params} />
    </Suspense>
  );
}

async function Edit({ params }: { params: PageProps<"/hosting/listings/[id]/edit">["params"] }) {
  const { id } = await params;
  const listingId = Number(id);
  if (!Number.isInteger(listingId) || listingId <= 0) notFound();
  return <EditListing id={listingId} />;
}
