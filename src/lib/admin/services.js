// ==================================================
// Admin data access for services — backed by the Node.js API
// ==================================================
// The backend (MySQL) is the source of truth for admin screens. All calls go
// through the shared API client (src/lib/api.js), which targets
// NEXT_PUBLIC_API_URL and attaches the admin's Bearer token automatically.
//
// Function signatures and returned shapes are unchanged from the previous
// static-data layer, so admin pages keep working. API rows are mapped into
// the existing frontend service structure (including the legacy `branch`
// label and `branchIds`) without silently dropping fields.
import api, { ApiError } from "@/lib/api";
import { branchIdsToLabel } from "./config";
import { clearServicesCache } from "@/lib/services";

// Map an API service row (snake_case from MySQL) into the existing frontend
// service shape used by admin components and the booking flow.
export function mapServiceRow(row) {
  const branchIds = (row.branch_ids ?? row.branchIds ?? []).map((id) =>
    id === "sarjapur" ? "sarjapur-road" : id,
  );

  return {
    id: row.slug ?? String(row.id),
    // Raw numeric services.id — only this (never the slug) is accepted by the
    // reorder endpoint, so drag-and-drop reordering can uniquely target a
    // row. Mirrors the `dbId` pattern on admin categories.
    dbId: Number(row.id),
    categoryId: row.category_slug ?? String(row.category_id ?? ""),
    category: row.category_name ?? "",
    subCategory: row.subcategory_name ?? null,
    // Stable identifier (sub_categories.slug) — used as the sub-category
    // select value and sent as `subCategoryId` on save. Names are NOT safe
    // identifiers: the live catalog contains same-name subs under one
    // category (e.g. Nails had "Removal & Refills" twice), and
    // resolveSubCategoryId() matches by name case-insensitively, so a name
    // could silently resolve to the wrong row. The slug is unique per
    // category (uq_subcategory_category_slug) and is preserved by the
    // category save flow (no delete/recreate), so it never drifts.
    subCategorySlug: row.subcategory_slug ?? null,
    subCategoryId: row.sub_category_id != null ? String(row.sub_category_id) : null,
    name: row.name,
    gender: row.audience ?? "Unisex",
    description: row.description ?? "",
    pricingType: row.pricing_type ?? "fixed",
    price: row.price != null ? Number(row.price) : null,
    priceRange: row.price_range ?? null,
    variants: (row.variants ?? []).map((variant) => ({
      id:
        variant.id != null
          ? `${row.slug ?? row.id}-${variant.id}`
          : variant.label,
      label: variant.label,
      price: Number(variant.price),
      ...(variant.duration ? { duration: variant.duration } : {}),
    })),
    duration: row.duration ?? "",
    displayOrder: row.display_order ?? 0,
    branch: branchIdsToLabel(branchIds),
    branchIds,
    status:
      row.is_active === false || row.is_active === 0 ? "Inactive" : "Active",
    image: row.image ?? row.image_url ?? "",
  };
}

function extractList(payload) {
  const rows =
    payload?.data?.services ?? payload?.services ?? payload?.data ?? [];
  return Array.isArray(rows) ? rows.map(mapServiceRow) : [];
}

function extractOne(payload) {
  const row =
    payload?.data?.service ?? payload?.service ?? payload?.data ?? null;
  return row ? mapServiceRow(row) : null;
}

// GET /api/services — supports search/category/subCategory/branch/audience/status filters.
export async function getServices(filters = {}) {
  const params = new URLSearchParams();
  if (filters.search) params.set("search", filters.search);
  if (filters.category) params.set("category", filters.category);
  if (filters.subCategory) params.set("subCategory", filters.subCategory);
  if (filters.branch) params.set("branch", filters.branch);
  if (filters.gender) params.set("audience", filters.gender);
  if (filters.status) params.set("status", filters.status);
  // Numeric category/sub-category ids scope the admin reorder panel.
  if (filters.categoryId != null) params.set("categoryId", String(filters.categoryId));
  if (filters.subCategoryId != null) params.set("subCategoryId", String(filters.subCategoryId));

  const query = params.toString();
  const payload = await api.get(`/api/services${query ? `?${query}` : ""}`);
  return extractList(payload);
}

// GET /api/services/:id (id or slug)
export async function getServiceById(id) {
  const payload = await api.get(`/api/services/${encodeURIComponent(id)}`);
  return extractOne(payload);
}

// Convert the admin form payload into the backend's expected body. Category
// is sent as a slug; sub-category is sent as its STABLE SLUG under
// `subCategoryId` (the field the backend controller actually reads —
// resolveSubCategoryId() in serviceController.js accepts a numeric id, slug,
// OR name, matched against the selected category's subs). Slugs are safer
// than names: display names are not unique within a category in practice
// (e.g. two "Removal & Refills" rows existed under Nails), and a name match
// could silently bind the service to the wrong sub_categories row. The slug
// is unique per category (uq_subcategory_category_slug) and preserved by the
// category save flow, so it cannot drift the way a re-derived slug could.
function toBackendPayload(data) {
  const branchIds = data.branchIds ?? [];
  return {
    name: data.name,
    categoryId: data.categoryId,
    // The ServiceForm holds the selected sub's slug in form.subCategory.
    // Fall back to the mapped row's slug for callers that pass the mapped
    // object straight through; empty string → null clears the mapping.
    subCategoryId: data.subCategory || data.subCategorySlug || null,
    audience: data.gender,
    description: data.description ?? "",
    pricingType: data.pricingType,
    price:
      data.pricingType === "fixed" || data.pricingType === "from"
        ? data.price
        : null,
    priceRange: data.priceRange ?? null,
    variants: (data.variants ?? []).map((variant) => ({
      label: variant.label,
      price: Number(variant.price) || 0,
      ...(variant.duration ? { duration: variant.duration } : {}),
    })),
    duration: data.duration ?? "",
    branchIds,
    isActive: (data.status ?? "Active") === "Active",
    image: data.image ?? null,
  };
}

// POST /api/services
export async function createService(data) {
  const payload = await api.post("/api/services", toBackendPayload(data));
  clearServicesCache(); // public Services page reflects the change immediately
  return extractOne(payload);
}

// PUT /api/services/:id
export async function updateService(id, data) {
  const payload = await api.put(
    `/api/services/${encodeURIComponent(id)}`,
    toBackendPayload(data),
  );
  clearServicesCache();
  return extractOne(payload);
}

// PATCH /api/services/:id/status
export async function updateServiceStatus(id, status) {
  const payload = await api.patch(
    `/api/services/${encodeURIComponent(id)}/status`,
    { status },
  );
  clearServicesCache();
  return extractOne(payload);
}

// GET /api/services/scope?categoryId=&subCategoryId= — the ordered services
// of ONE category+subcategory scope (display_order ASC, id ASC). Used by the
// admin reorder panel so it renders the exact persisted order.
export async function getServicesInScope(categoryId, subCategoryId) {
  const params = new URLSearchParams({
    categoryId: String(categoryId),
    ...(subCategoryId != null ? { subCategoryId: String(subCategoryId) } : {}),
  });
  const payload = await api.get(`/api/services/scope?${params.toString()}`);
  return extractList(payload);
}

// PUT /api/services/reorder — persist the display order of ONE category +
// subcategory scope. `items` = [{ id: <numeric services.id>, displayOrder:
// <int> }, ...], one entry per PERSISTED service currently in that scope
// (the backend rejects a partial list). Like reorderSubCategories, success
// is only reported once the server confirms the write — never assumed from
// the optimistic local reorder.
export async function reorderServices(categoryId, subCategoryId, items) {
  const payload = await api.put("/api/services/reorder", {
    categoryId,
    subCategoryId,
    items,
  });
  if (!payload?.success) {
    throw new ApiError(
      payload?.message ?? "Unable to update service order.",
      0,
    );
  }
  // The public Services page reads orders through the cached services layer
  // (src/lib/services.js) — clear it so the new order is visible immediately
  // instead of waiting out the 60s TTL.
  clearServicesCache();
  // The backend response is the source of truth — map the confirmed rows so
  // callers can refresh state from what the database actually holds.
  return extractList(payload);
}

// DELETE /api/services/:id — resolves to true/false like the previous layer.
export async function deleteService(id) {
  try {
    await api.delete(`/api/services/${encodeURIComponent(id)}`);
    clearServicesCache();
    return true;
  } catch (error) {
    if (error?.status === 404) return false;
    throw error;
  }
}
