"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth-context";

/**
 * /hosting is for users who already have a listing. A logged-in user without one is sent to the
 * "become a host" intro, like airbnb.co.in. Logged-out visitors still see each page's login prompt.
 */
export function HostOnly({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const router = useRouter();
  const noListings = user !== null && !user.is_host;

  useEffect(() => {
    if (noListings) router.replace("/become-a-host");
  }, [noListings, router]);

  return noListings ? null : <>{children}</>;
}
