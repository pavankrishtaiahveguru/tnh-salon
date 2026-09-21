// ==================================================
// Public Services data access — paginated API + client cache
// ==================================================
// Phase 10 + 11. The public Services page requests ONE page (24 services) at
// a time with all filters applied server-side. A small TTL cache keeps
// recently fetched pages so paging back / re-selecting filters is instant,
// identical in-flight requests are de-duplicated, and the first page can be
// prefetched from the homepage/navbar (Phase 12).
//
// Cache keys include EVERY query parameter, so a result for one filter
// combination can never be served for another. No data-fetching library is
// added — the catalogue is fairly static, so a 60s client cache is
// appropriate and admin catalogue changes surface within a minute (or
// immediately via clearServicesCache after admin mutations).
import api from "@/lib/api";
import { mapServiceRow } from "@/lib/admin/services";
import { getCategories } from "@/lib/admin/categories";
import { getBranches } from "@/lib/branches";

export const SERVICES_PAGE_SIZE = 24;

const CACHE_TTL_MS = 60_000; // admin catalogue changes appear within a minute
const MAX_CACHE_ENTRIES = 30; // bounded memory; oldest-entry eviction

const cache = new Map(); // key -> { expiresAt, value }
const inFlight = new Map(); // key -> Promise

function buildParams(filters) {
  const params = new URLSearchParams();
  if (filters.page != null) params.set("page", String(filters.page));
  // Only set limit when explicitly requested. Absent page+limit params keep
  // the request on the backend's legacy full-list path (used by
  // getAllActiveServices, which needs every active service for booking).
  if (filters.limit != null) params.set("limit", String(filters.limit));
  if (filters.search) params.set("search", filters.search.trim());
  if (filters.category) params.set("category", filters.category);
  if (filters.subCategory) params.set("subCategory", filters.subCategory);
  if (filters.branch) params.set("branch", filters.branch);
  if (filters.gender) params.set("audience", filters.gender);
  if (filters.status) params.set("status", filters.status);
  if (filters.sort && filters.sort !== "menu") params.set("sort", filters.sort);
  if (filters.priceMin != null && filters.priceMin !== "")
    params.set("priceMin", String(filters.priceMin));
  if (filters.priceMax != null && filters.priceMax !== "")
    params.set("priceMax", String(filters.priceMax));
  return params;
}

function cacheKey(filters) {
  // Every query parameter is part of the key; runtime-only options (signal)
  // are not.
  return `services?${buildParams(filters).toString()}`;
}

function evictIfNeeded() {
  while (cache.size > MAX_CACHE_ENTRIES) {
    const oldest = cache.keys().next().value;
    cache.delete(oldest);
  }
}

// GET /api/services with pagination metadata.
// Resolves { services, pagination } — services are mapped into the existing
// frontend service shape via the shared admin mapper (single mapping logic).
export async function getServicesPage(filters = {}, { signal } = {}) {
  const key = cacheKey(filters);

  const cached = cache.get(key);
  if (cached && cached.expiresAt > Date.now()) {
    return Promise.resolve(cached.value);
  }
  if (cached) cache.delete(key);

  const pending = inFlight.get(key);
  if (pending) return pending;

  const query = buildParams(filters).toString();

  const promise = (async () => {
    try {
      const payload = await api.get(
        `/api/services${query ? `?${query}` : ""}`,
        { signal },
      );

      const rows = payload?.data?.services ?? payload?.services ?? [];
      // Sub-category facet counts (names + live counts for the currently
      // selected category) — the backend computes them server-side whenever
      // a category filter is present; surfaced for the sub-category chips.
      const subCategories = Array.isArray(payload?.subCategories)
        ? payload.subCategories
        : null;
      const value = {
        services: Array.isArray(rows) ? rows.map(mapServiceRow) : [],
        subCategories,
        pagination: payload?.pagination ?? null,
      };

      if (!signal?.aborted) {
        cache.set(key, { expiresAt: Date.now() + CACHE_TTL_MS, value });
        evictIfNeeded();
      }
      return value;
    } finally {
      inFlight.delete(key);
    }
  })();

  inFlight.set(key, promise);
  return promise;
}

// Full active catalogue (legacy non-paginated response — no limit param, so
// the backend returns every matching row). Used ONLY by the booking flow's
// "Add another service" browser, which lets users pick from every service
// across branches — never by the Services grid itself.
const ALL_ACTIVE_KEY = "services?all-active";

export async function getAllActiveServices({ signal } = {}) {
  const cached = cache.get(ALL_ACTIVE_KEY);
  if (cached && cached.expiresAt > Date.now()) {
    return Promise.resolve(cached.value);
  }
  if (cached) cache.delete(ALL_ACTIVE_KEY);

  const pending = inFlight.get(ALL_ACTIVE_KEY);
  if (pending) return pending;

  const promise = (async () => {
    try {
      const payload = await api.get("/api/services?status=Active", { signal });
      const rows = payload?.data?.services ?? payload?.services ?? [];
      const value = Array.isArray(rows) ? rows.map(mapServiceRow) : [];
      if (!signal?.aborted) {
        cache.set(ALL_ACTIVE_KEY, { expiresAt: Date.now() + CACHE_TTL_MS, value });
        evictIfNeeded();
      }
      return value;
    } finally {
      inFlight.delete(ALL_ACTIVE_KEY);
    }
  })();

  inFlight.set(ALL_ACTIVE_KEY, promise);
  return promise;
}

// Phase 12 — prefetch the first Services page. Fire-and-forget: failures are
// ignored (the Services page fetches normally on arrival). Call from the home
// page / navbar once navigation to /services becomes likely. Defaults keep
// the exact parameter shape the Services page's initial request uses, so the
// prefetched cache entry is the one the page actually reads.
export function prefetchFirstServicesPage(filters = {}) {
  getServicesPage(
    {
      status: "Active",
      branch: "both",
      page: 1,
      limit: SERVICES_PAGE_SIZE, // must match the Services page's initial key
      ...filters,
    },
  ).catch(() => {});
}

// Prefetch the category/branch metadata the Services page renders with.
export function prefetchServicesMeta() {
  getCategoriesCached().catch(() => {});
  getBranchesCached().catch(() => {});
}

// Drops every cached/pending Services response. Used by the page's Retry
// action (so a failed in-flight request cannot be re-joined) and can be
// called after admin catalogue mutations to surface changes immediately.
export function clearServicesCache() {
  cache.clear();
  inFlight.clear();
}

// ---- Cached metadata (categories / branches) ------------------------------
// Small payloads fetched by the Services page; cached with the same TTL so
// repeat visits and prefetches don't re-request them. A failed fetch is never
// cached, so the next call retries.

let categoriesCache = null;
let branchesCache = null;

export function getCategoriesCached() {
  if (categoriesCache && categoriesCache.expiresAt > Date.now()) {
    return categoriesCache.promise;
  }
  const promise = getCategories()
    .then((value) => {
      categoriesCache = { expiresAt: Date.now() + CACHE_TTL_MS, promise };
      return value;
    })
    .catch((error) => {
      categoriesCache = null;
      throw error;
    });
  categoriesCache = { expiresAt: Date.now() + CACHE_TTL_MS, promise };
  return promise;
}

export function getBranchesCached() {
  if (branchesCache && branchesCache.expiresAt > Date.now()) {
    return branchesCache.promise;
  }
  const promise = getBranches()
    .then((value) => {
      branchesCache = { expiresAt: Date.now() + CACHE_TTL_MS, promise };
      return value;
    })
    .catch((error) => {
      branchesCache = null;
      throw error;
    });
  branchesCache = { expiresAt: Date.now() + CACHE_TTL_MS, promise };
  return promise;
}
