"use client";

import { Flag } from "lucide-react";
import Link from "next/link";
import { ComingSoonModal } from "@/components/ui/ComingSoonModal";
import { useEffect, useMemo, useRef, useState } from "react";
import useSWR from "swr";
import { Amenities } from "@/components/listing-detail/Amenities";
import { BookingCard } from "@/components/listing-detail/BookingCard";
import { CalendarSection } from "@/components/listing-detail/CalendarSection";
import { Description } from "@/components/listing-detail/Description";
import { DetailSkeleton } from "@/components/listing-detail/DetailSkeleton";
import { HostSection } from "@/components/listing-detail/HostSection";
import { LocationSection } from "@/components/listing-detail/LocationSection";
import { MobileReserveBar } from "@/components/listing-detail/MobileReserveBar";
import { Overview } from "@/components/listing-detail/Overview";
import { PhotoGrid } from "@/components/listing-detail/PhotoGrid";
import { Reviews } from "@/components/listing-detail/Reviews";
import { SectionNav } from "@/components/listing-detail/SectionNav";
import { TitleRow } from "@/components/listing-detail/TitleRow";
import { ApiError, swrFetcher } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { bookedNights } from "@/lib/availability";
import type { Availability, ListingDetail, Review } from "@/lib/types";
import { useWishlistToggle } from "@/lib/use-wishlist-toggle";

/** The /rooms/[id] page. Three requests in parallel: detail, booked dates, reviews. */
export function ListingView({ id }: { id: number }) {
  const { user, ready } = useAuth();
  // User id in the key so is_wishlisted (and "your own listing") refresh on login changes.
  const { data: listing, error, mutate } = useSWR<ListingDetail>(ready ? [`/api/listings/${id}`, user?.id ?? null] : null, swrFetcher);
  const { data: availability } = useSWR<Availability>(`/api/listings/${id}/availability`, swrFetcher);
  const { data: reviews } = useSWR<Review[]>(`/api/listings/${id}/reviews`, swrFetcher);
  const nights = useMemo(() => bookedNights(availability), [availability]);

  const toggleWishlist = useWishlistToggle((_id, saved) => mutate((l) => (l ? { ...l, is_wishlisted: saved } : l), { revalidate: false }));

  // Sticky section nav: shown once the photos are out of view; Reserve moves into it once the booking card is too.
  const photosRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const [photosGone, setPhotosGone] = useState(false);
  const [cardGone, setCardGone] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  useEffect(() => {
    if (!listing) return;
    const watch = (el: HTMLElement | null, set: (gone: boolean) => void) => {
      if (!el) return () => {};
      const io = new IntersectionObserver(([entry]) => set(!entry.isIntersecting && entry.boundingClientRect.top < 0), {
        rootMargin: "-80px 0px 0px 0px",
      });
      io.observe(el);
      return () => io.disconnect();
    };
    const stopPhotos = watch(photosRef.current, setPhotosGone);
    // Watch the card itself, not its sticky wrapper: the wrapper's bottom padding stays below the nav
    // after the card has gone under it, which kept Reserve out of the nav.
    const stopCard = watch((cardRef.current?.firstElementChild as HTMLElement | null) ?? null, setCardGone);
    return () => {
      stopPhotos();
      stopCard();
    };
  }, [listing]);

  if (error) {
    const missing = error instanceof ApiError && error.status === 404;
    return (
      <div className="mx-auto max-w-[1200px] px-6 py-24 md:px-10">
        <h1 className="text-[32px] font-semibold">{missing ? "This place isn’t available" : "Something went wrong"}</h1>
        <p className="mt-2 text-lg text-muted">
          {missing ? "It may have been removed by the host." : "We couldn’t load this listing. Please try again."}
        </p>
        <Link href="/" className="mt-8 inline-block rounded-btn bg-ink px-6 py-3 text-base font-semibold text-white">
          Explore other homes
        </Link>
      </div>
    );
  }
  if (!listing) return <DetailSkeleton />;

  const place = [listing.city, listing.state, listing.country].filter(Boolean).join(", ");

  return (
    <>
      <SectionNav listing={listing} nights={nights} visible={photosGone} showReserve={cardGone} />

      {/* airbnb.com: 1120px content column (+40px gutters) */}
      <div className="mx-auto max-w-[1200px] px-6 pb-28 md:px-10 lg:pb-0">
        <div className="hidden md:block">
          <TitleRow title={listing.title} saved={listing.is_wishlisted} onToggleSave={() => toggleWishlist(listing.id, listing.is_wishlisted)} />
        </div>
        <div id="photos" ref={photosRef} className="scroll-mt-24">
          <PhotoGrid images={listing.images} title={listing.title} />
        </div>
        <h1 className="mt-6 text-title-lg font-medium md:hidden">{listing.title}</h1>

        <div className="mt-8 flex gap-[8.4%]">
          {/* Left column: 653 / 1120 */}
          <div className="min-w-0 flex-1 lg:max-w-[58.3%]">
            <Overview listing={listing} />
            <Description text={listing.description} />
            <Amenities amenities={listing.amenities} />
            <CalendarSection city={listing.city} nights={nights} />
          </div>
          {/* Right column: 373 / 1120, card sticky below the 80px header */}
          <div className="hidden w-[33.3%] shrink-0 lg:block">
            <div ref={cardRef} className="sticky top-28 pb-12">
              <BookingCard listing={listing} nights={nights} />
              <button type="button" onClick={() => setReportOpen(true)}
                className="mx-auto mt-6 flex items-center gap-3 text-sm text-muted underline hover:text-ink">
                <Flag size={14} fill="currentColor" /> Report this listing
              </button>
            </div>
          </div>
        </div>

        <Reviews reviews={reviews} average={listing.rating.average} count={listing.rating.count} categories={listing.rating.categories} />
        <LocationSection lat={listing.latitude} lng={listing.longitude} place={place} />
        <HostSection host={listing.host} />
      </div>

      <MobileReserveBar listing={listing} nights={nights} />
      <ComingSoonModal open={reportOpen} onClose={() => setReportOpen(false)} feature="Reporting" />
    </>
  );
}
