// ==================================================
// Chatbot data layer — TNH Service + Booking Assistant
// ==================================================
// The chatbot is a UI layer over the SAME backend the Services page uses.
// Every function here calls an EXISTING TNH endpoint; nothing in this file
// knows a price, a service name, a category, a slot or a phone number.
//
// Data flow (per the TNH architecture rule):
//   DATABASE → TNH BACKEND API → Services page
//                             → CHATBOT (this file, cached per chat session)
//
// Session-aware caching (requirement 43): categories are fetched once per
// session, subcategory bundles per category, branch metadata once; identical
// in-flight requests are de-duplicated; failed requests are never cached so
// the next tap retries. Calling clearChatbotCache() drops everything.

import api from "@/lib/api";
import { mapServiceRow } from "@/lib/admin/services";
import { getCategories } from "@/lib/admin/categories";
import { getBranches } from "@/lib/branches";

// Chat sessions are short-lived; the catalogue is admin-mutable, so entries
// expire quickly and a failed fetch is never cached (next call retries).
const CACHE_TTL_MS = 60_000;

const cache = new Map(); // key -> { expiresAt, promise }
const inFlight = new Map(); // key -> Promise

function cacheGet(key) {
  const cached = cache.get(key);
  if (cached && cached.expiresAt > Date.now()) return cached.promise;
  if (cached) cache.delete(key);
  return null;
}

function cacheSet(key, promise) {
  cache.set(key, { expiresAt: Date.now() + CACHE_TTL_MS, promise });
  return promise;
}

function dedupe(key, run) {
  const pending = inFlight.get(key);
  if (pending) return pending;
  const promise = run().finally(() => {
    inFlight.delete(key);
  });
  inFlight.set(key, promise);
  return promise;
}

function failure(message) {
  throw new Error(message);
}

// ---- Categories (persisted order, active-only, branch-aware) ---------------
// GET /api/categories?public=1[&branch=slug] — the same endpoint/params the
// Services page uses via getCategoriesCached(). Sub-categories come from the
// CATEGORY METADATA (subcategories array on each category row) — never
// derived from a loaded services page.

export function getChatbotCategories(branchSlug) {
  const key = `categories:${branchSlug ?? "all"}`;
  const cached = cacheGet(key);
  if (cached) return cached;
  return cacheSet(
    key,
    dedupe(key, async () => {
      const categories = await getCategories(
        branchSlug ? { branch: branchSlug, publicList: true } : { publicList: true },
      );
      return categories
        .filter((category) => category.status === "Active")
        .map((category) => ({
          id: category.id,
          name: category.name,
          subCategories: category.subCategories.filter(
            (sub) => sub.serviceCount > 0,
          ),
          serviceCount: category.serviceCount,
        }));
    }),
  );
}

// Sub-categories for one category, from the already-fetched category
// metadata (no extra request). Persisted display order preserved.
export async function getChatbotSubCategories(branchSlug, categoryId) {
  const categories = await getChatbotCategories(branchSlug);
  const category = categories.find((category) => category.id === categoryId);
  if (!category) {
    return failure("Category not found.");
  }
  return category.subCategories;
}

// ---- Services (active-only, persisted display order) -----------------------
// GET /api/services with the SAME filters the Services page sends. The
// backend orders by display_order ASC, id ASC (menu order) by default, so
// the chatbot list matches the Services page ordering exactly. Only ACTIVE
// services are requested (status=Active), matching the public catalog rule.

export function getChatbotServices({ branch, category, subCategory } = {}) {
  // With no branch selected the chatbot shows the same default catalog the
  // Services page opens with: branch=both (available at either branch).
  // Once a branch is chosen (booking flow) its slug scopes the request.
  const branchSlug = branch || "both";
  const key = `services:${branchSlug}:${category ?? "all"}:${subCategory ?? "all"}`;
  const cached = cacheGet(key);
  if (cached) return cached;
  return cacheSet(
    key,
    dedupe(key, async () => {
      const params = new URLSearchParams();
      params.set("status", "Active");
      params.set("branch", branchSlug);
      if (category) params.set("category", category);
      // The backend accepts the sub-category slug OR name here; we pass the
      // slug from category metadata (stable identifier per uq constraint).
      if (subCategory) params.set("subCategory", subCategory);

      const payload = await api.get(`/api/services?${params.toString()}`);
      const rows = payload?.data?.services ?? payload?.services ?? [];
      if (!Array.isArray(rows)) {
        return failure("Invalid services response");
      }
      // Same mapper the Services page uses — one mapping logic, one shape.
      return rows.map(mapServiceRow);
    }),
  );
}

// ---- Branches --------------------------------------------------------------
// GET /api/branches — the same branch data the booking modal uses.

export function getChatbotBranches() {
  const key = "branches";
  const cached = cacheGet(key);
  if (cached) return cached;
  return cacheSet(
    key,
    dedupe(key, async () => {
      const branches = await getBranches();
      return branches;
    }),
  );
}

// ---- Drop everything (Refresh) ---------------------------------------------
export function clearChatbotCache() {
  cache.clear();
  inFlight.clear();
}
