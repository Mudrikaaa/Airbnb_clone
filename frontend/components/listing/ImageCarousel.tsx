"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

type Props = { images: string[]; alt: string };

/** Card photo carousel: arrows appear on hover (desktop), dots show position (max 5, like Airbnb). */
export function ImageCarousel({ images, alt }: Props) {
  const [index, setIndex] = useState(0);
  const last = images.length - 1;

  // Arrows live inside the card's <Link>, so stop the click from navigating.
  const step = (e: React.MouseEvent, delta: number) => {
    e.preventDefault();
    e.stopPropagation();
    setIndex((i) => Math.min(last, Math.max(0, i + delta)));
  };

  const arrow =
    "absolute top-1/2 z-10 hidden h-8 w-8 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-ink opacity-0 shadow-[0_0_0_1px_rgba(0,0,0,0.04),0_2px_4px_rgba(0,0,0,0.18)] transition-opacity hover:bg-white hover:scale-[1.04] group-hover:opacity-100 md:grid";

  return (
    <div className="relative aspect-[20/19] overflow-hidden rounded-card bg-line-light">
      <div className="flex h-full transition-transform duration-300 ease-out" style={{ transform: `translateX(-${index * 100}%)` }}>
        {images.map((src, i) =>
          // Only mount the current photo and the next one: a grid of 24 cards would otherwise
          // download 120 full-size photos up front (lazy-loading doesn't help — the slides sit
          // right next to the visible one, inside the browser's preload margin).
          i <= index + 1 ? (
            // eslint-disable-next-line @next/next/no-img-element -- host photos come from arbitrary URLs
            <img key={src} src={src} alt={i === 0 ? alt : ""} loading="lazy" decoding="async" className="h-full w-full shrink-0 object-cover" />
          ) : (
            <div key={src} className="h-full w-full shrink-0" />
          ),
        )}
      </div>

      {index > 0 && (
        <button type="button" aria-label="Previous photo" onClick={(e) => step(e, -1)} className={`${arrow} left-3`}>
          <ChevronLeft size={14} strokeWidth={3} />
        </button>
      )}
      {index < last && (
        <button type="button" aria-label="Next photo" onClick={(e) => step(e, 1)} className={`${arrow} right-3`}>
          <ChevronRight size={14} strokeWidth={3} />
        </button>
      )}

      {images.length > 1 && (
        <div className="pointer-events-none absolute inset-x-0 bottom-3 flex justify-center gap-[5px]">
          {images.slice(0, 5).map((src, i) => (
            <span key={src} className={`h-1.5 w-1.5 rounded-full ${i === Math.min(index, 4) ? "bg-white" : "bg-white/60"}`} />
          ))}
        </div>
      )}
    </div>
  );
}
