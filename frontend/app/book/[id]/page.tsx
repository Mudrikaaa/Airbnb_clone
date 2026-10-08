import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { BookingFlow } from "@/components/booking/BookingFlow";

export const metadata: Metadata = { title: "Confirm and pay - Airbnb Clone" };

// Dates and guests arrive in the query string (?checkIn=&checkOut=&adults=…); BookingFlow reads
// them on the client, so it sits inside Suspense.
export default function BookPage({ params }: PageProps<"/book/[id]">) {
  return (
    <Suspense fallback={null}>
      <Book params={params} />
    </Suspense>
  );
}

async function Book({ params }: { params: PageProps<"/book/[id]">["params"] }) {
  const { id } = await params;
  const listingId = Number(id);
  if (!Number.isInteger(listingId) || listingId <= 0) notFound();
  return <BookingFlow id={listingId} />;
}
