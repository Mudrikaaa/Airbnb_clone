import Link from "next/link";

/** Page body for top-level tabs the clone doesn't build (Experiences, Services). */
export function ComingSoonSection({ title }: { title: string }) {
  return (
    <main className="flex min-h-[60vh] items-center justify-center px-6 py-16">
      <div className="flex w-[420px] max-w-full flex-col items-center text-center">
        <p aria-hidden className="text-6xl">🚧</p>
        <h1 className="mt-6 text-balance text-[32px] font-semibold leading-9 tracking-[-0.96px]">{title} are coming soon</h1>
        <p className="mt-4 text-lg leading-6 text-muted">This part of Airbnb isn’t in the demo yet. Homes, booking, trips, wishlists and hosting all work.</p>
        <Link href="/" className="mt-10 flex h-12 items-center rounded-btn bg-ink px-6 text-base font-semibold text-white hover:bg-black">
          Explore homes
        </Link>
      </div>
    </main>
  );
}
