"use client";

import { Modal } from "@/components/ui/Modal";

type Props = { open: boolean; onClose: () => void; resultCount: number | undefined };

/** Shell of Airbnb's Filters dialog. Price / type / rooms / amenities controls arrive in the next phase. */
export function FiltersModal({ open, onClose, resultCount }: Props) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Filters"
      widthClass="max-w-[780px]"
      footer={
        <div className="flex items-center justify-between">
          <button type="button" disabled className="text-base font-semibold text-line-strong">
            Clear all
          </button>
          <button type="button" onClick={onClose} className="h-12 rounded-btn bg-ink px-6 text-base font-semibold text-white hover:bg-black">
            Show {resultCount ?? ""} {resultCount === 1 ? "place" : "places"}
          </button>
        </div>
      }
    >
      <h3 className="text-[22px] font-semibold">Price range, type of place, rooms and amenities</h3>
      <p className="mt-2 text-base text-muted">These filters are coming soon. For now, use the search bar and categories.</p>
    </Modal>
  );
}
