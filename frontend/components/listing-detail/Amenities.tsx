"use client";

import { useState } from "react";
import { GreyButton } from "@/components/ui/GreyButton";
import { Icon } from "@/components/ui/Icon";
import { Modal } from "@/components/ui/Modal";
import type { Amenity } from "@/lib/types";

const PREVIEW = 10; // Airbnb shows 10 in two columns, then "Show all N amenities"

export function Amenities({ amenities }: { amenities: Amenity[] }) {
  const [open, setOpen] = useState(false);
  return (
    <section id="amenities" className="scroll-mt-24 border-b border-line py-12">
      <h2 className="text-heading font-medium">What this place offers</h2>
      <ul className="mt-6 grid gap-x-4 sm:grid-cols-2">
        {amenities.slice(0, PREVIEW).map((a) => (
          <li key={a.id} className="flex items-center gap-4 py-3 text-base">
            <Icon name={a.icon} size={24} strokeWidth={1.5} />
            {a.name}
          </li>
        ))}
      </ul>
      {amenities.length > PREVIEW && (
        <GreyButton onClick={() => setOpen(true)} className="mt-6">
          Show all {amenities.length} amenities
        </GreyButton>
      )}
      <Modal open={open} onClose={() => setOpen(false)} title="What this place offers" widthClass="max-w-[780px]">
        <ul className="divide-y divide-line-light">
          {amenities.map((a) => (
            <li key={a.id} className="flex items-center gap-4 py-6 text-base">
              <Icon name={a.icon} size={28} strokeWidth={1.25} />
              {a.name}
            </li>
          ))}
        </ul>
      </Modal>
    </section>
  );
}
