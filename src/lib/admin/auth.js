// ==================================================
// Admin authentication — real backend session (JWT)
// ==================================================
// Talks to POST /api/auth/login on the Node.js backend and stores the
// returned JWT + admin profile. No UI code touches storage directly —
// everything goes through this module.
//
// Exports the same interface the admin layout guard already consumes
// (login / getSession / logout / subscribeToSession) plus helpers for the
// API client (token provider, unauthorized handling, session verification).
import api, { setAuthTokenProvider, setUnauthorizedHandler } from "@/lib/api";
import { ADMIN_API_BASE } from "./config";

const STORAGE_KEY = "tnh_admin_session";

// Cached session + subscriber list so components can read the session via
// useSyncExternalStore without breaking getSnapshot caching rules.
let cachedSession;
const listeners = new Set();

function notify() {
  for (const listener of listeners) listener();
}

function readStoredSession() {
  if (typeof window === "undefined") return null;
  try {
    const storedInLocalStorage = localStorage.getItem(STORAGE_KEY);
    const raw = storedInLocalStorage ?? sessionStorage.getItem(STORAGE_KEY);
    if (!storedInLocalStorage && raw) {
      localStorage.setItem(STORAGE_KEY, raw);
      sessionStorage.removeItem(STORAGE_KEY);
    }
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function persistSession(session) {
  cachedSession = session;
  if (typeof window !== "undefined") {
    if (session) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
      sessionStorage.removeItem(STORAGE_KEY);
    } else {
      localStorage.removeItem(STORAGE_KEY);
      sessionStorage.removeItem(STORAGE_KEY);
    }
  }
  notify();
}

// POST /api/auth/login -> { success, token, admin }
// Throws an Error with a user-facing message on failure (the API client maps
// network failures, 401s and server errors already).
export async function login(email, password) {
  if (!email || String(email).trim() === "") {
    throw new Error("Please enter your email.");
  }
  if (!password) {
    throw new Error("Please enter your password.");
  }

  const payload = await api.post(
    "/api/auth/login",
    { email: String(email).trim(), password },
    { auth: false },
  );

  if (!payload?.success || !payload?.token || !payload?.admin) {
    throw new Error("Invalid email or password.");
  }

  const session = {
    token: payload.token,
    admin: payload.admin,
    email: payload.admin.email,
    createdAt: Date.now(),
  };
  persistSession(session);
  return session;
}

export function getSession() {
  if (typeof window === "undefined") return null;
  if (cachedSession === undefined) {
    cachedSession = readStoredSession();
  }
  return cachedSession;
}

export function getToken() {
  return getSession()?.token ?? null;
}

export function getAdmin() {
  return getSession()?.admin ?? null;
}

export function logout() {
  persistSession(null);
}

// For useSyncExternalStore consumers (admin layout guard).
export function subscribeToSession(callback) {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

// GET /api/auth/me — validates the stored token against the backend.
// Returns the admin profile, or null when unauthenticated. A 401 also
// triggers the unauthorized handler below, which clears the stale session.
export async function verifySession(signal) {
  const session = getSession();
  if (!session?.token) return null;

  try {
    const payload = await api.get("/api/auth/me", { signal });
    return payload?.admin ?? null;
  } catch (error) {
    if (error?.status === 401) return null;
    // Network/server hiccup: keep the session rather than logging the admin
    // out for something that isn't an auth failure.
    return session.admin ?? session;
  }
}

// Wire the API client: it pulls the Bearer token from here, and clears the
// session whenever any authenticated request comes back 401 (expired or
// revoked token).
setAuthTokenProvider(getToken);
setUnauthorizedHandler(() => {
  if (getSession()) persistSession(null);
});

export const AUTH_API_BASE = ADMIN_API_BASE;
export default {
  login,
  logout,
  getSession,
  getToken,
  getAdmin,
  verifySession,
  subscribeToSession,
};
