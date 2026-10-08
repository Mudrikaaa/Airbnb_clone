"use client";

import { useAuth } from "@/lib/auth-context";

type Props = { heading: string; title: string; text: string };

/**
 * What airbnb.com shows on Trips / Wishlists when you're logged out: 32px/600 page heading,
 * 22px/500 title, a short line and a gradient "Log in" button (8px radius, 48px tall).
 */
export function LoginPrompt({ heading, title, text }: Props) {
  const { openLogin } = useAuth();
  return (
    <main className="px-6 pb-24 pt-8 md:px-20 md:pt-[92px]">
      <h1 className="text-[32px] font-semibold leading-9 tracking-[-0.96px]">{heading}</h1>
      <h2 className="mt-[50px] text-[22px] font-medium leading-[26px] tracking-[-0.44px]">{title}</h2>
      <p className="mt-3 text-base text-ink">{text}</p>
      <button type="button" onClick={openLogin} className="mt-6 h-12 rounded-btn bg-brand-gradient px-6 text-base font-medium text-white hover:brightness-95">
        Log in
      </button>
    </main>
  );
}
