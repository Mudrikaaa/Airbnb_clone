"use client";

import { Heart, Share } from "lucide-react";
import { toast } from "sonner";

type Props = { title: string; saved: boolean; onToggleSave: () => void };

/** 26px/500 title with underlined "Share" and "Save" actions on the right (airbnb.com measurements). */
export function TitleRow({ title, saved, onToggleSave }: Props) {
  const share = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied");
    } catch {
      toast.error("Couldn’t copy the link");
    }
  };

  const action = "flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-medium underline hover:bg-subtle";
  return (
    // airbnb.com: title starts 38px below the 80px header
    <div className="flex items-end justify-between gap-6 pt-[37px]">
      <h1 className="text-title-lg font-medium text-ink">{title}</h1>
      <div className="hidden shrink-0 items-center gap-1 md:flex">
        <button type="button" onClick={share} className={action}>
          <Share size={16} strokeWidth={2} /> Share
        </button>
        <button type="button" onClick={onToggleSave} className={action} aria-pressed={saved}>
          <Heart size={16} strokeWidth={2} fill={saved ? "#FF385C" : "none"} stroke={saved ? "#FF385C" : "currentColor"} />
          {saved ? "Saved" : "Save"}
        </button>
      </div>
    </div>
  );
}
