"use client";

import {
  ArrowLeftRight, Bell, CircleHelp, CircleUserRound, Globe, Heart, LogOut, type LucideIcon, Menu, MessageSquare, Plane, Settings, UserPlus, Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Avatar } from "@/components/ui/Avatar";
import { ComingSoonModal } from "@/components/ui/ComingSoonModal";
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
  const [soon, setSoon] = useState<string | null>(null); // feature shown in the Coming soon modal
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
  const item = `${row} flex items-center gap-3`;
  const soonItem = (label: string, Icon: LucideIcon) => (
    <button type="button" className={item} onClick={() => setSoon(label)}>
      <Icon size={18} strokeWidth={1.75} /> {label}
    </button>
  );
  const toggleHosting = () => {
    if (!hosting && !user.is_host) return go("/become-a-host");
    setMode(hosting ? "traveling" : "hosting");
    go(hosting ? "/" : "/hosting");
  };
  return (
    <>
      <Link href="/wishlists" className={item} onClick={onNavigate}><Heart size={18} strokeWidth={1.75} /> Wishlists</Link>
      <Link href="/trips" className={item} onClick={onNavigate}><Plane size={18} strokeWidth={1.75} /> Trips</Link>
      {soonItem("Messages", MessageSquare)}
      {soonItem("Profile", CircleUserRound)}
      <hr className="my-2 border-line-light" />
      {soonItem("Notifications", Bell)}
      {soonItem("Account settings", Settings)}
      {soonItem("Languages & currency", Globe)}
      {soonItem("Help Centre", CircleHelp)}
      <hr className="my-2 border-line-light" />
      {/* Airbnb's "Become a host" block: title + one-line pitch (no illustration) */}
      <button type="button" className={`${row} flex flex-col items-start gap-1`} onClick={toggleHosting}>
        <span className="font-medium">{hosting ? "Switch to travelling" : user.is_host ? "Switch to hosting" : "Become a host"}</span>
        {!hosting && <span className="text-xs leading-4 text-muted">It’s easy to start hosting and earn extra income.</span>}
      </button>
      <hr className="my-2 border-line-light" />
      {soonItem("Refer a host", UserPlus)}
      {soonItem("Find a co-host", Users)}
      <hr className="my-2 border-line-light" />
      <button type="button" className={item} onClick={() => { onNavigate(); openLogin(); }}>
        <ArrowLeftRight size={18} strokeWidth={1.75} /> Log in as another user
      </button>
      <button type="button" className={item} onClick={() => { logout(); onNavigate(); toast("You’ve been logged out"); router.push("/"); }}>
        <LogOut size={18} strokeWidth={1.75} /> Log out
      </button>
      {/* Not portaled, so clicks inside it don't count as "outside the menu"; closing it closes the menu too. */}
      <ComingSoonModal open={soon !== null} onClose={() => { setSoon(null); onNavigate(); }} feature={soon ?? ""} />
    </>
  );
}
