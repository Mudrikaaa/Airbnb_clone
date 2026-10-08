"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";

type Health = { status: string; db: string };

// Phase 0 placeholder: proves the frontend can reach the backend (URL + CORS).
export default function Home() {
  const [health, setHealth] = useState<Health | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<Health>("/api/health")
      .then(setHealth)
      .catch((e: Error) => setError(e.message));
  }, []);

  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center justify-center gap-4 p-6">
      <h1 className="text-3xl font-semibold text-brand">airbnb clone</h1>
      <div className="w-full rounded-card border border-line p-6 shadow-pill">
        <p className="text-sm text-muted">Backend health</p>
        {health && <p className="text-lg font-semibold">API: {health.status} · DB: {health.db}</p>}
        {error && <p className="text-lg font-semibold text-brand">Error: {error}</p>}
        {!health && !error && <p className="text-lg">Checking…</p>}
      </div>
    </main>
  );
}
