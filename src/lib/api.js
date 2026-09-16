// ==================================================
// TNH Salon — reusable frontend API client
// ==================================================
// Single entry point for every backend call. All requests target
// process.env.NEXT_PUBLIC_API_URL — never hardcode the backend URL anywhere
// else. Authenticated admin requests automatically carry
// `Authorization: Bearer <token>`.
//
// Usage:
//   import { api } from "@/lib/api";
//   const data = await api.get("/api/services");
//   await api.post("/api/auth/login", { email, password });
//   await api.put(`/api/services/${id}`, payload);
//   await api.delete(`/api/services/${id}`);
// ==================================================

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

// Error surfaced to UI code. `status` lets callers distinguish 401 (expired
// session) from other failures without string matching. `errors` carries
// optional row-level details (e.g. the catalog import error report).
export class ApiError extends Error {
  constructor(message, status = 0, cause, errors = []) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.cause = cause;
    this.errors = Array.isArray(errors) ? errors : [];
  }
}

// Centralized token access. The auth module registers itself here to avoid a
// circular import (auth.js imports api.js).
let tokenGetter = () => null;
let onUnauthorized = null;

export function setAuthTokenProvider(getter) {
  tokenGetter = typeof getter === "function" ? getter : () => null;
}

// Optional global handler fired once per request when the backend replies
// 401 (expired/invalid token). The auth module uses this to clear the stale
// session so guards can redirect to the login page.
export function setUnauthorizedHandler(handler) {
  onUnauthorized = typeof handler === "function" ? handler : null;
}

function authHeaders(headers = {}) {
  const token = tokenGetter();
  if (token) {
    return { ...headers, Authorization: `Bearer ${token}` };
  }
  return headers;
}

// Maps network/HTTP failures to professional, user-facing messages. Never
// exposes stack traces, SQL or backend internals.
function toUserMessage(status, fallbackMessage) {
  if (status === 0) {
    return "Unable to connect to the server. Please try again.";
  }
  if (status === 401) {
    return fallbackMessage || "Your session has expired. Please sign in again.";
  }
  if (status === 404) {
    return fallbackMessage || "The requested resource was not found.";
  }
  return fallbackMessage || "Something went wrong. Please try again.";
}

async function request(
  method,
  path,
  { body, headers, auth = true, signal } = {},
) {
  if (!API_URL) {
    throw new ApiError(
      "API URL is not configured. Set NEXT_PUBLIC_API_URL in .env.local.",
      0,
    );
  }

  let response;
  try {
    const isFormData =
      typeof FormData !== "undefined" && body instanceof FormData;
    response = await fetch(`${API_URL}${path}`, {
      method,
      headers: authHeaders({
        ...(body !== undefined && !isFormData
          ? { "Content-Type": "application/json" }
          : {}),
        ...headers,
      }),
      body:
        body !== undefined
          ? isFormData
            ? body
            : JSON.stringify(body)
          : undefined,
      credentials: "include",
      signal,
    });
  } catch (error) {
    if (error?.name === "AbortError") throw error;
    throw new ApiError(toUserMessage(0), 0, error);
  }

  let payload = null;
  const contentType = response.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    try {
      payload = await response.json();
    } catch {
      payload = null;
    }
  }

  if (!response.ok) {
    const fallbackMessage =
      (payload && typeof payload.message === "string" && payload.message) || "";
    const message = toUserMessage(response.status, fallbackMessage);
    const errors =
      payload && Array.isArray(payload.errors) ? payload.errors : [];

    if (response.status === 401 && auth && onUnauthorized) {
      onUnauthorized();
    }

    throw new ApiError(message, response.status, undefined, errors);
  }

  return payload;
}

export const api = {
  get: (path, options) => request("GET", path, options),
  post: (path, body, options) => request("POST", path, { ...options, body }),
  put: (path, body, options) => request("PUT", path, { ...options, body }),
  patch: (path, body, options) => request("PATCH", path, { ...options, body }),
  delete: (path, options) => request("DELETE", path, options),
  uploadImage: (file, type, slug) => {
    const body = new FormData();
    body.append("image", file);
    body.append("type", type);
    body.append("slug", slug);
    return request("POST", "/api/upload/image", { body });
  },
};

export default api;
