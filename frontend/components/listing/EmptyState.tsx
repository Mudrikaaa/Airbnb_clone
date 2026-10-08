import Link from "next/link";

/** Shown when a search has no results — Airbnb's "No exact matches" block. */
export function EmptyState() {
  return (
    <div className="py-16">
      <h2 className="text-[22px] font-semibold">No exact matches</h2>
      <p className="mt-2 max-w-md text-base text-muted">
        Try changing or removing some of your filters or adjusting your search area.
      </p>
      <Link href="/" className="mt-6 inline-block rounded-btn border border-ink px-6 py-3 text-base font-semibold hover:bg-subtle">
        Remove all filters
      </Link>
    </div>
  );
}
