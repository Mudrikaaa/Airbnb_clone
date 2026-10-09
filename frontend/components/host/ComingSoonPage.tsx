import Link from "next/link";

/** Full-page placeholder for host sections the clone doesn't build (Calendar, Messages). */
export function ComingSoonPage({ feature, plural = false }: { feature: string; plural?: boolean }) {
  return (
    <main className="flex min-h-[calc(100vh-97px)] items-center justify-center px-6 pb-[121px]">
      <div className="flex w-[372px] max-w-full flex-col items-center text-center">
        <p aria-hidden className="text-6xl">🚧</p>
        <h1 className="mt-6 text-balance text-[32px] font-semibold leading-9 tracking-[-0.96px]">{feature} {plural ? "are" : "is"} coming soon</h1>
        <p className="mt-4 text-lg leading-6 text-muted">This part of hosting isn’t in the demo yet. Reservations and listings work.</p>
        <Link href="/hosting" className="mt-12 flex h-10 items-center rounded-full bg-chip px-6 text-sm font-medium hover:bg-[#EBEBEB]">
          Back to Today
        </Link>
      </div>
    </main>
  );
}
