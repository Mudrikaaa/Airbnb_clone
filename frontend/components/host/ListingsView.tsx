"use client";

import { LayoutGrid, List, Plus } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import useSWR from "swr";
import { DeleteListingModal } from "@/components/host/DeleteListingModal";
import { swrFetcher } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { formatPrice } from "@/lib/format";
import { typeInCity } from "@/lib/listing";
import type { ListingCard } from "@/lib/types";

/** /hosting/listings — my listings as cards or as a table (Airbnb's grid / list toggle), with edit and delete. */
export function ListingsView() {
  const { user } = useAuth();
  const { data, error } = useSWR<ListingCard[]>(user ? ["/api/host/listings", user.id] : null, swrFetcher);
  const [view, setView] = useState<"grid" | "list">("grid");
  const [deleting, setDeleting] = useState<ListingCard | null>(null);

  // The API also returns deleted listings (is_active = false); hosts have nothing to do with those.
  const listings = data?.filter((l) => l.is_active);
  const circle = "grid h-10 w-10 place-items-center rounded-full bg-chip hover:bg-[#EBEBEB]";

  return (
    <main className="px-6 pb-24 pt-8 md:px-20 md:pt-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-[32px] font-semibold leading-9 tracking-[-0.96px]">Your listings</h1>
        <div className="flex items-center gap-4">
          <button type="button" className={circle} aria-label={view === "grid" ? "Change to list view" : "Change to grid view"} onClick={() => setView(view === "grid" ? "list" : "grid")}>
            {view === "grid" ? <List size={18} /> : <LayoutGrid size={18} />}
          </button>
          <Link href="/hosting/listings/new" className={circle} aria-label="Add listing">
            <Plus size={18} strokeWidth={2.5} />
          </Link>
        </div>
      </div>

      {error ? (
        <p className="mt-12 text-base text-muted">We couldn’t load your listings. Check that the API is running and refresh.</p>
      ) : !listings ? (
        <div aria-hidden className="mt-8 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="aspect-[411/457] animate-pulse rounded-2xl bg-line-light" />
          ))}
        </div>
      ) : listings.length === 0 ? (
        <div className="mt-16 max-w-md">
          <h2 className="text-[22px] font-medium leading-[26px] tracking-[-0.44px]">You don’t have any listings yet</h2>
          <p className="mt-2 text-base text-muted">Create your first listing to start welcoming guests.</p>
          <Link href="/hosting/listings/new" className="mt-6 inline-block rounded-btn bg-brand-gradient px-6 py-3.5 text-base font-medium text-white">
            Create a listing
          </Link>
        </div>
      ) : view === "grid" ? (
        <div className="mt-8 grid gap-x-4 gap-y-10 sm:grid-cols-2 md:mt-16 xl:grid-cols-3">
          {listings.map((l) => (
            <ListingTile key={l.id} listing={l} onDelete={setDeleting} />
          ))}
        </div>
      ) : (
        <ListingTable listings={listings} onDelete={setDeleting} />
      )}

      <DeleteListingModal listing={deleting} onClose={() => setDeleting(null)} />
    </main>
  );
}

/** Photo with Airbnb's white "Listed" pill (measured: 16px radius photo, pill 12px/500, 8px 12px padding, 16px inset). */
function ListingTile({ listing, onDelete }: { listing: ListingCard; onDelete: (l: ListingCard) => void }) {
  return (
    <article>
      <Link href={`/hosting/listings/${listing.id}/edit`} className="block">
        <div className="relative aspect-[411/390] overflow-hidden rounded-2xl bg-line-light">
          {/* eslint-disable-next-line @next/next/no-img-element -- host photos come from arbitrary URLs */}
          <img src={listing.images[0]} alt="" className="h-full w-full object-cover" />
          <span className="absolute left-4 top-4 rounded-[40px] bg-white px-3 py-2 text-xs font-medium">Listed</span>
        </div>
        <h2 className="mt-4 truncate text-base font-medium">{listing.title}</h2>
        <p className="text-sm text-muted">
          {typeInCity(listing.property_type, listing.city)}, {listing.country}
        </p>
      </Link>
      <div className="mt-2 flex items-center justify-between gap-3 text-sm">
        <p>
          <span className="font-semibold">{formatPrice(listing.price_per_night)}</span> night
        </p>
        <div className="flex items-center gap-4">
          <Link href={`/hosting/listings/${listing.id}/edit`} className="font-semibold underline">
            Edit
          </Link>
          <button type="button" onClick={() => onDelete(listing)} className="font-semibold text-[#C13515] underline">
            Delete
          </button>
        </div>
      </div>
    </article>
  );
}

function ListingTable({ listings, onDelete }: { listings: ListingCard[]; onDelete: (l: ListingCard) => void }) {
  const cols = "md:grid-cols-[minmax(0,2.4fr)_minmax(0,1.4fr)_100px_130px_130px]";
  return (
    <div className="mt-8 overflow-hidden rounded-2xl border border-line md:mt-16">
      <div className={`hidden gap-4 border-b border-line bg-subtle px-5 py-3 text-xs font-semibold text-muted md:grid ${cols}`}>
        <span>Listing</span>
        <span>Location</span>
        <span>Status</span>
        <span>Price</span>
        <span className="text-right">Actions</span>
      </div>
      <ul className="divide-y divide-line-light">
        {listings.map((l) => (
          <li key={l.id} className={`grid items-center gap-4 px-5 py-4 ${cols}`}>
            <Link href={`/hosting/listings/${l.id}/edit`} className="flex min-w-0 items-center gap-4">
              {/* eslint-disable-next-line @next/next/no-img-element -- host photos come from arbitrary URLs */}
              <img src={l.images[0]} alt="" className="h-14 w-14 shrink-0 rounded-lg object-cover" />
              <span className="truncate text-base font-medium">{l.title}</span>
            </Link>
            <span className="truncate text-sm text-muted">
              {l.city}, {l.country}
            </span>
            <span>
              <span className="rounded-full bg-[#E6F4EA] px-3 py-1 text-xs font-semibold text-[#0B6B2D]">Listed</span>
            </span>
            <span className="text-sm">
              <b className="font-semibold">{formatPrice(l.price_per_night)}</b> night
            </span>
            <span className="flex items-center gap-4 text-sm md:justify-end">
              <Link href={`/hosting/listings/${l.id}/edit`} className="font-semibold underline">
                Edit
              </Link>
              <button type="button" onClick={() => onDelete(l)} className="font-semibold text-[#C13515] underline">
                Delete
              </button>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
