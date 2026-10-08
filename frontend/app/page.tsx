import { Suspense } from "react";
import { ExploreListings } from "@/components/listing/ExploreListings";
import { ListingCardSkeleton } from "@/components/listing/ListingCardSkeleton";

// The explore page is driven entirely by the URL (?location=&checkIn=&…). ExploreListings reads
// useSearchParams, so it sits in a Suspense boundary (required by Next.js for prerendering).
export default function HomePage() {
  return (
    <Suspense
      fallback={
        <div className="grid grid-cols-1 gap-x-6 gap-y-10 px-6 pt-[102px] min-[550px]:grid-cols-2 min-[950px]:grid-cols-3 min-[1128px]:grid-cols-4 md:px-10 xl:px-12">
          {Array.from({ length: 8 }, (_, i) => <ListingCardSkeleton key={i} />)}
        </div>
      }
    >
      <ExploreListings />
    </Suspense>
  );
}
