"use client";

// Client-side API helpers for PROCHECK backend.
// Reads JWT from localStorage under `procheck_token`.

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

export type CurrentUser = {
  id: string;
  email: string;
  role:
    | "principal_admin"
    | "vendedor"
    | "capacitador"
    | "client"
    | "client_admin"
    | "subcontractor"
    | "employee";
  name?: string;
  [k: string]: unknown;
};

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem("procheck_token");
}

function authHeaders(): Record<string, string> {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function handle(res: Response) {
  if (!res.ok) {
    let msg = `${res.status} ${res.statusText}`;
    try {
      const body = await res.json();
      if (body && (body.error || body.message)) {
        msg = body.error || body.message;
      }
    } catch {
      // ignore parse errors
    }
    throw new Error(msg);
  }
  const ct = res.headers.get("content-type") || "";
  if (ct.includes("application/json")) return res.json();
  return res.text();
}

export async function apiGet<T = unknown>(path: string): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    method: "GET",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    cache: "no-store",
  });
  return handle(res) as Promise<T>;
}

export async function apiPost<T = unknown>(
  path: string,
  body?: unknown,
): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: body ? JSON.stringify(body) : undefined,
  });
  return handle(res) as Promise<T>;
}

export async function apiPatch<T = unknown>(
  path: string,
  body?: unknown,
): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: body ? JSON.stringify(body) : undefined,
  });
  return handle(res) as Promise<T>;
}

export async function apiDelete<T = unknown>(path: string): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json", ...authHeaders() },
  });
  return handle(res) as Promise<T>;
}

export async function login(
  email: string,
  password: string,
): Promise<{ token: string; user: CurrentUser }> {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  // Backend returns `accessToken`; older docs said `token`. Accept both.
  const raw = (await handle(res)) as {
    accessToken?: string;
    token?: string;
    user: CurrentUser & { firstName?: string; lastName?: string };
  };
  const token = raw.accessToken || raw.token || "";
  const user: CurrentUser = {
    ...raw.user,
    name:
      raw.user.name ||
      [raw.user.firstName, raw.user.lastName].filter(Boolean).join(" ") ||
      raw.user.email,
  };
  if (typeof window !== "undefined") {
    window.localStorage.setItem("procheck_token", token);
    window.localStorage.setItem("procheck_user", JSON.stringify(user));
  }
  return { token, user };
}

export function logout() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem("procheck_token");
  window.localStorage.removeItem("procheck_user");
}

export function getCurrentUser(): CurrentUser | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem("procheck_user");
  if (!raw) return null;
  try {
    return JSON.parse(raw) as CurrentUser;
  } catch {
    return null;
  }
}
