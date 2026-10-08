"use client";

// Mock authentication. The "logged-in user" is just an id kept in localStorage and sent to the
// backend as X-User-Id (see lib/api.ts). Hosting mode is a UI preference, also persisted.

import { createContext, useCallback, useContext, useMemo, useState, useSyncExternalStore } from "react";
import useSWR from "swr";
import { USER_ID_STORAGE_KEY, swrFetcher } from "@/lib/api";
import type { User } from "@/lib/types";

const MODE_STORAGE_KEY = "mode";
export type Mode = "traveling" | "hosting";

type AuthContextValue = {
  /** Seeded users for the "Log in as…" switcher. */
  users: User[];
  user: User | null;
  /** False during server render / hydration, before localStorage can be read. */
  ready: boolean;
  /** A user id is stored but the user list hasn't arrived yet (so `user` is still null for a moment). */
  userLoading: boolean;
  loginAs: (userId: number) => void;
  logout: () => void;
  mode: Mode;
  setMode: (mode: Mode) => void;
  loginModalOpen: boolean;
  openLogin: () => void;
  closeLogin: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

// ---- localStorage as an external store (read with useSyncExternalStore) ----------------------------
// The "storage" event also fires when another tab logs in/out, so tabs stay in sync for free.

const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  window.addEventListener("storage", listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}

function readStorage(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null; // storage blocked: behave as logged out
  }
}

function writeStorage(key: string, value: string | null) {
  try {
    if (value === null) window.localStorage.removeItem(key);
    else window.localStorage.setItem(key, value);
  } catch {
    // storage unavailable: the change won't survive a reload, but nothing breaks
  }
  listeners.forEach((notify) => notify()); // same-tab updates don't fire "storage"
}

const noopSubscribe = () => () => {};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: users = [] } = useSWR<User[]>("/api/users", swrFetcher);
  const storedUserId = useSyncExternalStore(subscribe, () => readStorage(USER_ID_STORAGE_KEY), () => null);
  const storedMode = useSyncExternalStore(subscribe, () => readStorage(MODE_STORAGE_KEY), () => null);
  // true only on the client after hydration; lets pages wait before fetching user-specific data.
  const ready = useSyncExternalStore(noopSubscribe, () => true, () => false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);

  const userId = Number(storedUserId);
  const mode: Mode = storedMode === "hosting" ? "hosting" : "traveling";

  const loginAs = useCallback((id: number) => {
    writeStorage(USER_ID_STORAGE_KEY, String(id));
    setLoginModalOpen(false);
  }, []);

  const logout = useCallback(() => {
    writeStorage(USER_ID_STORAGE_KEY, null);
    writeStorage(MODE_STORAGE_KEY, null);
  }, []);

  const setMode = useCallback((next: Mode) => writeStorage(MODE_STORAGE_KEY, next), []);

  const value = useMemo<AuthContextValue>(
    () => ({
      users,
      user: users.find((u) => u.id === userId) ?? null,
      ready,
      userLoading: userId > 0 && users.length === 0,
      loginAs,
      logout,
      mode,
      setMode,
      loginModalOpen,
      openLogin: () => setLoginModalOpen(true),
      closeLogin: () => setLoginModalOpen(false),
    }),
    [users, userId, ready, loginAs, logout, mode, setMode, loginModalOpen],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
