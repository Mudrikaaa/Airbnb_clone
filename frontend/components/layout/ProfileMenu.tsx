"use client";

import { CircleUserRound, Menu } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Avatar } from "@/components/ui/Avatar";
import { useAuth } from "@/lib/auth-context";
import { useHydrated } from "@/lib/use-hydrated";

/** Right side of the header: "Become a host", avatar circle and the hamburger menu. */
export function ProfileMenu() {
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
      <HostLink />
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
  const { user, mode: storedMode, setMode, openLogin } = useAuth();
  const mode = useHydrated() ? storedMode : "traveling"; // match the server HTML during hydration
  const router = useRouter();
  const label = mode === "hosting" ? "Switch to travelling" : "Become a host";
  return (
    <button
      type="button"
      className="hidden h-10 rounded-full px-3 text-sm font-medium hover:bg-chip lg:block"
      onClick={() => {
        if (!user) return openLogin();
        const next = mode === "hosting" ? "traveling" : "hosting";
        setMode(next);
        router.push(next === "hosting" ? "/hosting" : "/");
      }}
    >
      {label}
    </button>
  );
}

/** Shared by the desktop dropdown and the mobile profile sheet. */
export function MenuItems({ onNavigate }: { onNavigate: () => void }) {
  const { user, users, loginAs, logout, mode, setMode, openLogin } = useAuth();
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
        const next = mode === "hosting" ? "traveling" : "hosting";
        setMode(next);
        go(next === "hosting" ? "/hosting" : "/");
      }}>
        {mode === "hosting" ? "Switch to travelling" : "Switch to hosting"}
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
