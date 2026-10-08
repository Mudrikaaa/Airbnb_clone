"use client";

import { Heart } from "lucide-react";

/** The heart on a card: 50% black fill + white outline, solid brand red when saved (airbnb.com values). */
export function HeartButton({ saved, onToggle }: { saved: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      aria-label={saved ? "Remove from wishlist" : "Save to wishlist"}
      aria-pressed={saved}
      onClick={(e) => {
        e.preventDefault(); // the heart sits inside the card link
        e.stopPropagation();
        onToggle();
      }}
      className="absolute right-3 top-3 z-10 transition-transform hover:scale-110 active:scale-95"
    >
      <Heart size={24} strokeWidth={2} stroke="white" fill={saved ? "#FF385C" : "rgba(0,0,0,0.5)"} />
    </button>
  );
}
