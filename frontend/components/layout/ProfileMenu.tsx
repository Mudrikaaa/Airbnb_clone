"use client";

import { CircleUserRound, Menu } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Avatar } from "@/components/ui/Avatar";
import { useAuth } from "@/lib/auth-context";
import { useHydrated } from "@/lib/use-hydrated";

/** Right side of the header: "Switch to hosting", avatar circle and the hamburger menu. */
export function ProfileMenu({ hideHostLink = false }: { hideHostLink?: boolean }) {
  const { user: authUser, openLogin } = useAuth();
  const hydrated = useHydrated();
  const user = hydrated ? authUser : null; // match the server HTML during hydration
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => !rootRef.current?.contains(e.target as Node) && setOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const circle = "grid h-10 w-10 place-items-center rounded-full bg-chip hover:bg-[#EBEBEB]";

  return (
    <div ref={rootRef} className="relative flex items-center gap-1">
      {!hideHostLink && <HostLink />}
      <button type="button" aria-label={user ? "Your profile" : "Log in or sign up"} className={`${circle} ml-1 overflow-hidden`}
        onClick={() => (user ? setOpen((o) => !o) : openLogin())}>
        {user ? <Avatar user={user} size={40} /> : <CircleUserRound size={22} strokeWidth={1.75} />}
      </button>
      <button type="button" aria-label="Main navigation menu" aria-expanded={open} className={`${circle} ml-2`}
        onClick={() => setOpen((o) => !o)}>
        <Menu size={18} strokeWidth={2} />
      </button>

      {open && (
        <div className="absolute right-0 top-[calc(100%+8px)] z-50 w-[260px] rounded-xl bg-white py-2 shadow-panel">
          <MenuItems onNavigate={() => setOpen(false)} />
        </div>
      )}
    </div>
  );
}

function HostLink() {
  const { user, setMode } = useAuth();
  const router = useRouter();
  // This header only appears on traveller pages (/hosting has its own). Users with listings switch
  // to their dashboard; everyone else is offered Airbnb's "become a host" intro.
  // Before hydration the server rendered "Become a host" (no user yet), so match it first.
  const isHost = useHydrated() && (user?.is_host ?? false);
  const label = isHost ? "Switch to hosting" : "Become a host";
  return (
    <button
      type="button"
      className="hidden h-10 rounded-full px-3 text-sm font-medium hover:bg-chip lg:block"
      onClick={() => {
        if (!isHost) return router.push("/become-a-host");
        setMode("hosting");
        router.push("/hosting");
      }}
    >
      {label}
    </button>
  );
}

/** Shared by the desktop dropdown and the mobile profile sheet. */
export function MenuItems({ onNavigate }: { onNavigate: () => void }) {
  const { user, users, loginAs, logout, setMode, openLogin } = useAuth();
  // Hosting pages say "Switch to travelling"; every traveller page says "Switch to hosting".
  const hosting = usePathname().startsWith("/hosting");
  const router = useRouter();
  const row = "block w-full px-4 py-3 text-left text-sm hover:bg-subtle";

  if (!user) {
    return (
      <>
        <button type="button" className={`${row} font-medium`} onClick={() => { onNavigate(); openLogin(); }}>
          Log in or sign up
        </button>
        <hr className="my-2 border-line-light" />
        <p className="px-4 pb-1 pt-2 text-xs font-medium text-muted">Log in as…</p>
        {users.map((u) => (
          <button key={u.id} type="button" className={`${row} flex items-center gap-3 !py-2`}
            onClick={() => { loginAs(u.id); onNavigate(); toast.success(`Logged in as ${u.name}`); }}>
            <Avatar user={u} size={28} />
            <span className="flex-1 truncate">{u.name}</span>
            {u.is_host && <span className="text-xs text-muted">{u.is_superhost ? "Superhost" : "Host"}</span>}
          </button>
        ))}
        <hr className="my-2 border-line-light" />
        <button type="button" className={row} onClick={() => { onNavigate(); toast("Help Centre is coming soon"); }}>
          Help Centre
        </button>
      </>
    );
  }

  const go = (href: string) => { onNavigate(); router.push(href); };
  return (
    <>
      <p className="px-4 pb-2 pt-1 text-xs text-muted">Logged in as <span className="font-medium text-ink">{user.name}</span></p>
      <Link href="/wishlists" className={`${row} font-medium`} onClick={onNavigate}>Wishlists</Link>
      <Link href="/trips" className={`${row} font-medium`} onClick={onNavigate}>Trips</Link>
      <button type="button" className={`${row} font-medium`} onClick={() => { onNavigate(); toast("Messages are coming soon"); }}>
        Messages
      </button>
      <hr className="my-2 border-line-light" />
      <button type="button" className={row} onClick={() => {
        if (!hosting && !user.is_host) return go("/become-a-host");
        setMode(hosting ? "traveling" : "hosting");
        go(hosting ? "/" : "/hosting");
      }}>
        {hosting ? "Switch to travelling" : user.is_host ? "Switch to hosting" : "Become a host"}
      </button>
      <button type="button" className={row} onClick={() => { onNavigate(); openLogin(); }}>
        Log in as another user
      </button>
      <hr className="my-2 border-line-light" />
      <button type="button" className={row} onClick={() => { logout(); onNavigate(); toast("You’ve been logged out"); router.push("/"); }}>
        Log out
      </button>
    </>
  );
}
