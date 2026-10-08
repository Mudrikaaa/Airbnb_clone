import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { DetailSkeleton } from "@/components/listing-detail/DetailSkeleton";
import { ListingView } from "@/components/listing-detail/ListingView";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

// Server-side: give the tab (and link previews) the listing's real title and photo.
export async function generateMetadata({ params }: PageProps<"/rooms/[id]">): Promise<Metadata> {
  const { id } = await params;
  try {
    const res = await fetch(`${API_URL}/api/listings/${encodeURIComponent(id)}`);
    if (res.ok) {
      const listing = await res.json();
      return {
        title: `${listing.title} - Airbnb Clone`,
        description: `${listing.city}, ${listing.country} · ${listing.description.slice(0, 140)}…`,
        openGraph: { images: listing.images?.[0]?.url ? [listing.images[0].url] : [] },
      };
    }
  } catch {
    // API unreachable: fall back to the generic title rather than failing the page.
  }
  return { title: "Listing - Airbnb Clone" };
}

// The page itself only validates the id; ListingView (client) fetches the data and reads the
// dates/guests from the URL, so it sits inside Suspense.
export default function RoomPage({ params }: PageProps<"/rooms/[id]">) {
  return (
    <Suspense fallback={<DetailSkeleton />}>
      <Room params={params} />
    </Suspense>
  );
}

async function Room({ params }: { params: PageProps<"/rooms/[id]">["params"] }) {
  const { id } = await params;
  const listingId = Number(id);
  if (!Number.isInteger(listingId) || listingId <= 0) notFound();
  return <ListingView id={listingId} />;
}
