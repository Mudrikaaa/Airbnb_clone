"use client";

import { Modal } from "@/components/ui/Modal";

/** Placeholder for features the spec mocks out (messaging, payments, identity checks). */
export function ComingSoonModal({ open, onClose, feature }: { open: boolean; onClose: () => void; feature: string }) {
  return (
    <Modal open={open} onClose={onClose} title={feature}>
      <div className="py-4 text-center">
        <p aria-hidden className="text-5xl">🚧</p>
        <h3 className="mt-4 text-[22px] font-semibold">Coming soon</h3>
        <p className="mx-auto mt-2 max-w-sm text-base text-muted">
          {feature} isn’t part of this demo yet. Everything else — searching, booking and wishlists — works.
        </p>
        <button type="button" onClick={onClose} className="mt-6 h-12 rounded-btn bg-ink px-6 text-base font-semibold text-white hover:bg-black">
          Got it
        </button>
      </div>
    </Modal>
  );
}
