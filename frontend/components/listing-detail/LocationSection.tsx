"use client";

import dynamic from "next/dynamic";

// Leaflet needs `window`, so the map is client-only (ssr: false) and loads in its own chunk.
const ListingMap = dynamic(() => import("@/components/listing-detail/ListingMap"), {
  ssr: false,
  loading: () => <div className="h-full w-full animate-pulse bg-line-light" />,
});

type Props = { lat: number; lng: number; place: string };

/** "Where you'll be": 1120×480 map with a 20px radius (airbnb.com). */
export function LocationSection({ lat, lng, place }: Props) {
  return (
    <section id="location" className="scroll-mt-24 border-b border-line py-12">
      <h2 className="text-heading font-medium">Where you’ll be</h2>
      <p className="mt-6 text-base">{place}</p>
      {/* isolate: keep Leaflet's internal z-indexes (400+) from rising above the header */}
      <div className="isolate mt-6 h-[320px] overflow-hidden rounded-[20px] bg-line-light md:h-[480px]">
        <ListingMap lat={lat} lng={lng} />
      </div>
      <p className="mt-6 text-base">Exact location will be provided after booking.</p>
    </section>
  );
}
