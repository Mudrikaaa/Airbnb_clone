"use client";

import { ChevronRight } from "lucide-react";
import { useState } from "react";
import { GreyButton } from "@/components/ui/GreyButton";
import { Modal } from "@/components/ui/Modal";

// Roughly six lines in the 653px column; shorter descriptions are shown in full with no button.
const CLAMP_CHARS = 320;

export function Description({ text }: { text: string }) {
  const [open, setOpen] = useState(false);
  const long = text.length > CLAMP_CHARS;
  return (
    <section className="border-b border-line py-8">
      <p className={`whitespace-pre-line text-body ${long ? "line-clamp-6" : ""}`}>{text}</p>
      {long && (
        <GreyButton onClick={() => setOpen(true)} className="mt-6 flex items-center gap-1">
          Show more <ChevronRight size={16} strokeWidth={2.5} />
        </GreyButton>
      )}
      <Modal open={open} onClose={() => setOpen(false)} title="About this space" widthClass="max-w-[780px]">
        <p className="whitespace-pre-line text-body">{text}</p>
      </Modal>
    </section>
  );
}
