"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Modal } from "@/components/ui/Modal";
import { ApiError, apiFetch } from "@/lib/api";
import { refreshAfterListingChange } from "@/lib/host-cache";

type Props = {
  listing: { id: number; title: string } | null;
  onClose: () => void;
  /** Called after the listing was really deleted (e.g. to leave the edit page). */
  onDeleted?: () => void;
};

/**
 * Confirm-then-delete. The backend soft-deletes, and refuses with 409 while the listing still has
 * upcoming confirmed reservations — we show its reason in a toast instead of guessing.
 */
export function DeleteListingModal({ listing, onClose, onDeleted }: Props) {
  const [busy, setBusy] = useState(false);

  const remove = async () => {
    if (!listing) return;
    setBusy(true);
    try {
      await apiFetch<void>(`/api/listings/${listing.id}`, { method: "DELETE" });
      await refreshAfterListingChange();
      toast.success("Listing deleted");
      onClose();
      onDeleted?.();
    } catch (err) {
      // 409: upcoming reservations. 403/404: not yours / already gone. All come with a readable reason.
      toast.error(err instanceof ApiError ? err.detail : "Couldn’t delete this listing. Please try again.");
      onClose();
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal
      open={listing !== null}
      onClose={busy ? () => {} : onClose}
      title="Delete listing"
      footer={
        <div className="flex items-center justify-between gap-4">
          <button type="button" onClick={onClose} disabled={busy} className="rounded-lg px-2 py-2 text-base font-semibold underline">
            Keep listing
          </button>
          <button
            type="button"
            onClick={remove}
            disabled={busy}
            className="h-12 rounded-btn bg-[#C13515] px-6 text-base font-semibold text-white hover:bg-[#A82D12] disabled:opacity-60"
          >
            {busy ? "Deleting…" : "Delete listing"}
          </button>
        </div>
      }
    >
      {listing && (
        <>
          <h3 className="text-[22px] font-semibold leading-[26px]">Delete “{listing.title}”?</h3>
          <p className="mt-4 text-base text-muted">
            Guests will no longer be able to find or book it. Past reservations and reviews are kept. If the listing has upcoming reservations it
            can’t be deleted until they’re over or cancelled.
          </p>
        </>
      )}
    </Modal>
  );
}
