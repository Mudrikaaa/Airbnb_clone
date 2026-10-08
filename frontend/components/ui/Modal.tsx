"use client";

import { X } from "lucide-react";
import { useEffect } from "react";

type Props = {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  /** Tailwind max-width class for the dialog. */
  widthClass?: string;
};

/** Airbnb-style centred dialog: 12px radius, title bar with a close button on the left, optional footer. */
export function Modal({ open, onClose, title, children, footer, widthClass = "max-w-[568px]" }: Props) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    // Stop the page behind the dialog from scrolling.
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/50 md:items-center md:p-10" onMouseDown={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`flex max-h-[calc(100vh-40px)] w-full ${widthClass} flex-col rounded-t-xl bg-white shadow-panel md:rounded-xl`}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <header className="relative flex h-16 shrink-0 items-center justify-center border-b border-line-light px-6">
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute left-6 grid h-8 w-8 place-items-center rounded-full hover:bg-subtle"
          >
            <X size={16} strokeWidth={2.5} />
          </button>
          <h2 className="text-base font-semibold">{title}</h2>
        </header>
        <div className="overflow-y-auto px-6 py-6">{children}</div>
        {footer && <footer className="shrink-0 border-t border-line-light px-6 py-4">{footer}</footer>}
      </div>
    </div>
  );
}
