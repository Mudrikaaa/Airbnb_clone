"use client";

import Link from "next/link";
import { useState } from "react";
import { Logo } from "@/components/layout/Logo";
import { ComingSoonModal } from "@/components/ui/ComingSoonModal";

/**
 * Bare bar on the create / edit pages, measured on airbnb.co.in/become-a-host at 1440 and 1920px:
 * the 40px logo mark at (48, 32); "Questions?" and "Exit" pills (40px tall, 28px radius, hairline
 * border, 16px apart) ending 48px from the right edge. No bottom border.
 */
export function CreateFlowHeader() {
  const [helpOpen, setHelpOpen] = useState(false);
  const pill = "flex h-10 items-center rounded-[28px] border border-line px-4 text-sm font-medium hover:border-ink";
  return (
    <header className="flex items-center justify-between px-6 py-8 md:px-12">
      <Logo markOnly />
      <div className="flex items-center gap-4">
        <button type="button" onClick={() => setHelpOpen(true)} className={pill}>
          Questions?
        </button>
        <Link href="/hosting/listings" className={pill}>
          Exit
        </Link>
      </div>
      <ComingSoonModal open={helpOpen} onClose={() => setHelpOpen(false)} feature="Host help" />
    </header>
  );
}
