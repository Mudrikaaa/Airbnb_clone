"use client";

import { ChevronLeft, Grip } from "lucide-react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import type { ListingImage } from "@/lib/types";

/**
 * 1 large + 4 small photos (airbnb.co.in: 1120 wide, 60vh − 64px tall capped at 560px — 476 at 900px,
 * 560 at 1080px — 8px gaps, 12px outer radius) with "Show all photos".
 * On phones it's a single swipeable photo with a counter, like Airbnb's mobile web.
 */
export function PhotoGrid({ images, title }: { images: ListingImage[]; title: string }) {
  const [open, setOpen] = useState(false);
  const [mobileIndex, setMobileIndex] = useState(0);
  const tiles = images.slice(0, 5);

  return (
    <>
      {/* Desktop / tablet */}
      <div className="relative mt-6 hidden h-[clamp(320px,calc(60vh-64px),560px)] grid-cols-4 grid-rows-2 gap-2 overflow-hidden rounded-xl md:grid">
        {tiles.map((img, i) => (
          <button
            key={img.id}
            type="button"
            onClick={() => setOpen(true)}
            className={`relative overflow-hidden bg-line-light ${i === 0 ? "col-span-2 row-span-2" : ""}`}
            aria-label={i === 0 ? "Show all photos" : `Photo ${i + 1}`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- host photos come from arbitrary URLs */}
            <img src={img.url} alt={i === 0 ? title : ""} className="h-full w-full object-cover transition hover:brightness-[0.85]" />
          </button>
        ))}
        <button
          type="button"
          onClick={() => setOpen(true)}
          // measured: #F2F2F2, 8px radius, 32px tall, 12px/500 label, 8px 16px padding
          className="absolute bottom-6 right-6 flex h-8 items-center gap-2 rounded-lg bg-chip px-4 text-xs font-medium text-ink shadow-[0_1px_2px_rgba(0,0,0,0.08)] hover:bg-white"
        >
          <Grip size={14} strokeWidth={2} /> Show all photos
        </button>
      </div>

      {/* Phones: one photo at a time */}
      <div className="relative -mx-6 mt-0 aspect-[4/3] overflow-hidden md:hidden">
        <div
          className="no-scrollbar flex h-full snap-x snap-mandatory overflow-x-auto"
          onScroll={(e) => setMobileIndex(Math.round(e.currentTarget.scrollLeft / e.currentTarget.clientWidth))}
        >
          {images.map((img, i) => (
            // eslint-disable-next-line @next/next/no-img-element -- host photos come from arbitrary URLs
            <img key={img.id} src={img.url} alt={i === 0 ? title : ""} className="h-full w-full shrink-0 snap-center object-cover" onClick={() => setOpen(true)} />
          ))}
        </div>
        <span className="absolute bottom-4 right-4 rounded bg-black/60 px-2 py-0.5 text-xs font-medium text-white">
          {mobileIndex + 1} / {images.length}
        </span>
      </div>

      {open && <PhotoTour images={images} title={title} onClose={() => setOpen(false)} />}
    </>
  );
}

/** Full-screen "photo tour": every image, in a one-big / two-small rhythm like Airbnb's. */
function PhotoTour({ images, title, onClose }: { images: ListingImage[]; title: string; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [onClose]);

  return createPortal(
    <div role="dialog" aria-modal="true" aria-label="All photos" className="fixed inset-0 z-[80] overflow-y-auto bg-white">
      <div className="sticky top-0 z-10 flex h-16 items-center bg-white px-6">
        <button type="button" onClick={onClose} aria-label="Close photos" className="grid h-9 w-9 place-items-center rounded-full hover:bg-subtle">
          <ChevronLeft size={18} strokeWidth={2.5} />
        </button>
      </div>
      <div className="mx-auto grid max-w-[720px] grid-cols-2 gap-2 px-6 pb-16">
        {images.map((img, i) => (
          // eslint-disable-next-line @next/next/no-img-element -- host photos come from arbitrary URLs
          <img
            key={img.id}
            src={img.url}
            alt={i === 0 ? title : ""}
            loading="lazy"
            className={`w-full object-cover ${i % 3 === 0 ? "col-span-2 aspect-[3/2]" : "aspect-square"}`}
          />
        ))}
      </div>
    </div>,
    document.body,
  );
}
