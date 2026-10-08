"use client";

import { ChevronLeft, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { DatesPanel } from "@/components/search/DatesPanel";
import { DestinationPanel } from "@/components/search/DestinationPanel";
import { GuestsPanel } from "@/components/search/GuestsPanel";
import { type Segment, useSearchDraft } from "@/components/search/useSearchDraft";
import { formatDateRange } from "@/lib/format";
import { EMPTY_SEARCH, guestSummary } from "@/lib/search-params";

/** Phones: a "Start your search" pill that opens a full-screen sheet with Where / When / Who cards. */
export function MobileSearch() {
  const { draft, update, setGuests, submit, fromUrl } = useSearchDraft();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Segment>("where");

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  const dates = draft.checkIn && draft.checkOut ? formatDateRange(draft.checkIn, draft.checkOut) : null;
  const summary = [fromUrl.location || null, fromUrl.checkIn && fromUrl.checkOut ? formatDateRange(fromUrl.checkIn, fromUrl.checkOut) : null, guestSummary(fromUrl)]
    .filter(Boolean)
    .join(" · ");

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setStep("where");
          setOpen(true);
        }}
        className="flex h-14 w-full items-center justify-center gap-3 rounded-full border border-line bg-white px-6 shadow-pill"
      >
        <Search size={16} strokeWidth={3} />
        <span className="truncate text-sm font-medium">{summary || "Start your search"}</span>
      </button>

      {/* Portalled to <body>: inside the fixed header (its own stacking context) the sheet
          could never sit above the bottom nav, whatever its z-index. */}
      {open && createPortal(
        <div className="fixed inset-0 z-[70] flex flex-col bg-subtle">
          <div className="flex items-center px-6 py-4">
            <button type="button" aria-label="Close search" onClick={() => setOpen(false)}
              className="grid h-9 w-9 place-items-center rounded-full border border-line bg-white">
              <ChevronLeft size={16} strokeWidth={2.5} />
            </button>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto px-3 pb-4">
            <Card title="Where to?" collapsedLabel="Where" value={draft.location || "I'm flexible"} open={step === "where"} onOpen={() => setStep("where")}>
              <input
                value={draft.location}
                onChange={(e) => update({ location: e.target.value })}
                placeholder="Search destinations"
                className="mx-6 mt-2 h-14 w-[calc(100%-48px)] rounded-xl border border-line-strong px-4 text-sm outline-none focus:border-ink"
              />
              <DestinationPanel text={draft.location} onSelect={(query) => { update({ location: query }); setStep("when"); }} />
            </Card>
            <Card title="When’s your trip?" collapsedLabel="When" value={dates ?? "Add dates"} open={step === "when"} onOpen={() => setStep("when")}>
              <div className="flex justify-center px-2 pb-4 [&_.rdp-root]:[--cell:44px]">
                <DatesPanel months={1} checkIn={draft.checkIn} checkOut={draft.checkOut}
                  onChange={(checkIn, checkOut) => update({ checkIn, checkOut })} onComplete={() => setStep("who")} />
              </div>
            </Card>
            <Card title="Who’s coming?" collapsedLabel="Who" value={guestSummary(draft) ?? "Add guests"} open={step === "who"} onOpen={() => setStep("who")}>
              <GuestsPanel guests={draft} onChange={setGuests} />
            </Card>
          </div>

          <div className="flex items-center justify-between border-t border-line bg-white px-6 py-4">
            <button type="button" className="text-base font-semibold underline"
              onClick={() => update({ ...EMPTY_SEARCH, category: draft.category })}>
              Clear all
            </button>
            <button type="button" onClick={() => { setOpen(false); submit(); }}
              className="flex h-12 items-center gap-2 rounded-btn bg-brand-gradient px-6 text-base font-semibold text-white">
              <Search size={16} strokeWidth={3} /> Search
            </button>
          </div>
        </div>,
        document.body,
      )}
    </>
  );
}

function Card(props: { title: string; collapsedLabel: string; value: string; open: boolean; onOpen: () => void; children: React.ReactNode }) {
  if (!props.open) {
    return (
      <button type="button" onClick={props.onOpen}
        className="flex w-full items-center justify-between rounded-2xl bg-white px-6 py-5 text-sm shadow-[0_1px_4px_rgba(0,0,0,0.1)]">
        <span className="text-muted">{props.collapsedLabel}</span>
        <span className="font-medium">{props.value}</span>
      </button>
    );
  }
  return (
    <section className="rounded-3xl bg-white pt-6 shadow-[0_2px_12px_rgba(0,0,0,0.12)]">
      <h2 className="px-6 text-[22px] font-semibold">{props.title}</h2>
      {props.children}
    </section>
  );
}
