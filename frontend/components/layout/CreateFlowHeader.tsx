"use client";

import Link from "next/link";
import { Logo } from "@/components/layout/Logo";

/** Bare bar on the create / edit pages (measured on airbnb.com/become-a-host): the logo mark alone, then an "Exit" pill. */
export function CreateFlowHeader() {
  return (
    <header className="flex h-24 items-center justify-between px-6 md:px-12">
      <Logo markOnly />
      <Link href="/hosting/listings" className="flex h-10 items-center rounded-[28px] border border-line px-4 text-sm font-medium hover:border-ink">
        Exit
      </Link>
    </header>
  );
}
