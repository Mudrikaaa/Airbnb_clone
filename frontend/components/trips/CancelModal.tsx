"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Modal } from "@/components/ui/Modal";
import { ApiError, apiFetch } from "@/lib/api";
import { refreshAfterBookingChange } from "@/lib/booking-cache";
import { formatDateRange, formatPrice } from "@/lib/format";
import type { Booking } from "@/lib/types";

type Props = { booking: Booking | null; onClose: () => void };

/** "Cancel booking?" confirmation. On success the dates become bookable again for everyone. */
export function CancelModal({ booking, onClose }: Props) {
  const [busy, setBusy] = useState(false);

  const cancel = async () => {
    if (!booking) return;
    setBusy(true);
    try {
      await apiFetch<Booking>(`/api/bookings/${booking.id}/cancel`, { method: "POST" });
      await refreshAfterBookingChange(booking.listing.id);
      toast.success("Your booking was cancelled");
      onClose();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.detail : "Couldn’t cancel this booking. Please try again.");
      await refreshAfterBookingChange(booking.listing.id); // the list may be out of date (e.g. already cancelled)
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal
      open={booking !== null}
      onClose={busy ? () => {} : onClose}
      title="Cancel booking"
      footer={
        <div className="flex items-center justify-between gap-4">
          <button type="button" onClick={onClose} disabled={busy} className="rounded-lg px-2 py-2 text-base font-semibold underline">
            Keep booking
          </button>
          <button
            type="button"
            onClick={cancel}
            disabled={busy}
            className="h-12 rounded-btn bg-ink px-6 text-base font-semibold text-white hover:bg-black disabled:opacity-60"
          >
            {busy ? "Cancelling…" : "Cancel booking"}
          </button>
        </div>
      }
    >
      {booking && (
        <>
          <h3 className="text-[22px] font-semibold leading-[26px]">Are you sure you want to cancel?</h3>
          <p className="mt-4 text-base">
            <b className="font-semibold">{booking.listing.title}</b>
            <br />
            {booking.listing.city}, {booking.listing.country} · {formatDateRange(booking.check_in, booking.check_out)}
          </p>
          <p className="mt-4 text-base text-muted">
            You’ll get a full refund of {formatPrice(booking.total_price)}, and these dates will open up for other guests.
          </p>
        </>
      )}
    </Modal>
  );
}
