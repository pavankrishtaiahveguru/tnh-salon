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
import api from "@/lib/api";
import { branchIdsToLabel } from "./config";

// Map an API service row (snake_case from MySQL) into the existing frontend
// service shape used by admin components and the booking flow.
export function mapServiceRow(row) {
  const branchIds = (row.branch_ids ?? row.branchIds ?? []).map((id) =>
    id === "sarjapur" ? "sarjapur-road" : id,
  );

  return {
    id: row.slug ?? String(row.id),
    categoryId: row.category_slug ?? String(row.category_id ?? ""),
    category: row.category_name ?? "",
    subCategory: row.subcategory_name ?? null,
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

  const query = params.toString();
  const payload = await api.get(`/api/services${query ? `?${query}` : ""}`);
  return extractList(payload);
}

// GET /api/services/:id (id or slug)
export async function getServiceById(id) {
  const payload = await api.get(`/api/services/${encodeURIComponent(id)}`);
  return extractOne(payload);
}

function slugify(value) {
  return String(value ?? "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// Convert the admin form payload into the backend's expected body. Category
// and sub-category are sent as slugs (the backend resolves them per category).
function toBackendPayload(data) {
  const branchIds = data.branchIds ?? [];
  return {
    name: data.name,
    categoryId: data.categoryId,
    subCategory: data.subCategory ? slugify(data.subCategory) : null,
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
  return extractOne(payload);
}

// PUT /api/services/:id
export async function updateService(id, data) {
  const payload = await api.put(
    `/api/services/${encodeURIComponent(id)}`,
    toBackendPayload(data),
  );
  return extractOne(payload);
}

// PATCH /api/services/:id/status
export async function updateServiceStatus(id, status) {
  const payload = await api.patch(
    `/api/services/${encodeURIComponent(id)}/status`,
    { status },
  );
  return extractOne(payload);
}

// DELETE /api/services/:id — resolves to true/false like the previous layer.
export async function deleteService(id) {
  try {
    await api.delete(`/api/services/${encodeURIComponent(id)}`);
    return true;
  } catch (error) {
    if (error?.status === 404) return false;
    throw error;
  }
}
