// Single entry point for all backend calls. Every request goes through apiFetch
// so the base URL, mock-auth header and error shape are handled in one place.

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

// Same key the auth context will use (Phase: mock auth).
export const USER_ID_STORAGE_KEY = "currentUserId";

export class ApiError extends Error {
  constructor(
    public status: number,
    public detail: string,
  ) {
    super(detail);
    this.name = "ApiError";
  }
}

function getCurrentUserId(): string | null {
  if (typeof window === "undefined") return null; // no localStorage on the server
  try {
    return window.localStorage.getItem(USER_ID_STORAGE_KEY);
  } catch {
    return null;
  }
}

export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  if (init.body && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");

  const userId = getCurrentUserId();
  if (userId) headers.set("X-User-Id", userId);

  const res = await fetch(`${API_URL}${path}`, { ...init, headers });

  if (!res.ok) {
    // Backend errors are always {"detail": "..."}; 422s have a list in detail.
    let detail = res.statusText;
    try {
      const body = await res.json();
      if (typeof body?.detail === "string") detail = body.detail;
      else if (Array.isArray(body?.detail)) detail = body.detail[0]?.msg ?? detail;
    } catch {
      // non-JSON error body; keep statusText
    }
    throw new ApiError(res.status, detail);
  }

  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}
