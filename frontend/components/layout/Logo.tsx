import Link from "next/link";

/**
 * Brand mark + wordmark at Airbnb's measured size (102×32). The mark is our own simplified outline,
 * drawn for this project rather than copied from airbnb.com's assets.
 */
export function Logo() {
  return (
    <Link href="/" aria-label="Home" className="flex h-8 w-fit items-center gap-1 text-brand">
      <svg viewBox="0 0 32 32" width="30" height="32" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinejoin="round" aria-hidden>
        <path d="M16 3.5c-1.4 0-2.5.9-3.5 2.9L5.3 21.3c-.5 1.1-.8 2-.8 2.9 0 2.8 2.2 4.8 4.8 4.8 2.1 0 4-1.3 6.7-4.3 2.7 3 4.6 4.3 6.7 4.3 2.6 0 4.8-2 4.8-4.8 0-.9-.3-1.8-.8-2.9L19.5 6.4c-1-2-2.1-2.9-3.5-2.9Z" />
        <path d="M16 24.7c-2.4-2.9-3.8-5.3-3.8-7.2 0-2.2 1.6-3.7 3.8-3.7s3.8 1.5 3.8 3.7c0 1.9-1.4 4.3-3.8 7.2Z" />
      </svg>
      <span className="hidden text-[22px] font-bold tracking-[-0.6px] lg:inline">airbnb</span>
    </Link>
  );
}
