"use client";

import { CircleUserRound, Heart, Plane, Search } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { MenuItems } from "@/components/layout/ProfileMenu";
import { Modal } from "@/components/ui/Modal";
import { useAuth } from "@/lib/auth-context";
import { useHydrated } from "@/lib/use-hydrated";

/** Phone-only bottom tab bar (Airbnb's mobile web navigation). */
export function MobileNav() {
  const pathname = usePathname();
  const { user: authUser, openLogin } = useAuth();
  const hydrated = useHydrated();
  const user = hydrated ? authUser : null; // match the server HTML during hydration
  const [menuOpen, setMenuOpen] = useState(false);

  // Listing pages show their own fixed "Reserve" footer instead (like Airbnb).
  if (pathname.startsWith("/rooms/") || pathname.startsWith("/book/") || pathname.startsWith("/hosting")) return null;

  const tab = (active: boolean) =>
    `flex flex-1 flex-col items-center gap-1 pt-2 text-[10px] font-medium ${active ? "text-brand" : "text-muted"}`;

  return (
    <>
      <nav className="fixed inset-x-0 bottom-0 z-50 flex h-16 border-t border-line-light bg-white md:hidden">
        <Link href="/" className={tab(pathname === "/")}>
          <Search size={24} strokeWidth={pathname === "/" ? 2.5 : 1.75} /> Explore
        </Link>
        <Link href="/wishlists" className={tab(pathname === "/wishlists")} onClick={(e) => { if (!user) { e.preventDefault(); openLogin(); } }}>
          <Heart size={24} strokeWidth={1.75} /> Wishlists
        </Link>
        {user && (
          <Link href="/trips" className={tab(pathname === "/trips")}>
            <Plane size={24} strokeWidth={1.75} /> Trips
          </Link>
        )}
        <button type="button" className={tab(false)} onClick={() => (user ? setMenuOpen(true) : openLogin())}>
          <CircleUserRound size={24} strokeWidth={1.75} /> {user ? "Profile" : "Log in"}
        </button>
      </nav>
      <Modal open={menuOpen} onClose={() => setMenuOpen(false)} title="Profile">
        <div className="-mx-6 -my-4">
          <MenuItems onNavigate={() => setMenuOpen(false)} />
        </div>
      </Modal>
    </>
  );
}
