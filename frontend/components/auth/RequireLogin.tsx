"use client";

import { useEffect, useRef } from "react";
import { LoginPrompt } from "@/components/auth/LoginPrompt";
import { useAuth } from "@/lib/auth-context";

type Props = { heading: string; title: string; text: string; children: React.ReactNode };

/**
 * Route guard for pages that need a user: logged-out visitors get the login modal (opened once,
 * automatically) behind a "Log in" page; logged-in users see the page. The backend enforces the
 * real access rules (401/403) — this only avoids showing a broken page.
 */
export function RequireLogin({ heading, title, text, children }: Props) {
  const { user, users, ready, userLoading, openLogin } = useAuth();
  const asked = useRef(false);

  useEffect(() => {
    if (ready && users.length > 0 && !user && !asked.current) {
      asked.current = true;
      openLogin();
    }
  }, [ready, users.length, user, openLogin]);

  if (!ready || userLoading) {
    return <main aria-hidden className="px-6 pt-8 md:px-20 md:pt-10" />;
  }
  if (!user) return <LoginPrompt heading={heading} title={title} text={text} />;
  return <>{children}</>;
}
