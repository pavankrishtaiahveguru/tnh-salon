// ==================================================
// Admin data access for service categories — backed by the Node.js API
// ==================================================
// The backend (MySQL) is the source of truth. Same signatures/shapes as the
// previous static-data layer, so admin pages keep working unchanged.
import api, { ApiError } from "@/lib/api";

function mapCategoryRow(row) {
  return {
    id: row.slug ?? String(row.id),
    name: row.name,
    description: row.description ?? "",
    icon: row.icon ?? "sparkles",
    image: row.image ?? row.image_url ?? "",
    displayOrder: row.display_order ?? 0,
    status:
      row.is_active === false || row.is_active === 0 ? "Inactive" : "Active",
    subCategories: (row.subcategories ?? row.sub_categories ?? []).map(
      (sub) => ({
        id: sub.slug ?? String(sub.id),
        name: sub.name,
        serviceCount: sub.service_count ?? 0,
      }),
    ),
    serviceCount:
      row.service_count ??
      (row.subcategories ?? row.sub_categories ?? []).reduce(
        (sum, sub) => sum + (sub.service_count ?? 0),
        0,
      ),
  };
}

function extractList(payload) {
  const rows =
    payload?.data?.categories ?? payload?.categories ?? payload?.data ?? [];
  return Array.isArray(rows) ? rows.map(mapCategoryRow) : [];
}

function extractOne(payload) {
  const row =
    payload?.data?.category ?? payload?.category ?? payload?.data ?? null;
  return row ? mapCategoryRow(row) : null;
}

// GET /api/categories
export async function getCategories(options = {}) {
  const payload = await api.get("/api/categories", options);
  return extractList(payload);
}

// GET /api/categories/:id (id or slug)
export async function getCategoryById(id) {
  const payload = await api.get(`/api/categories/${encodeURIComponent(id)}`);
  return extractOne(payload);
}

// POST /api/categories
export async function createCategory(data) {
  const payload = await api.post("/api/categories", {
    name: data.name,
    description: data.description ?? "",
    image: data.image ?? null,
    isActive: (data.status ?? "Active") === "Active",
    subCategories: (data.subCategories ?? [])
      .map((sub) => ({ id: sub?.id, name: sub?.name ?? sub }))
      .filter((sub) => Boolean(sub.name)),
  });
  return extractOne(payload);
}

// PUT /api/categories/:id
export async function updateCategory(id, data) {
  const payload = await api.put(`/api/categories/${encodeURIComponent(id)}`, {
    name: data.name,
    description: data.description ?? "",
    image: data.image ?? null,
    isActive: (data.status ?? "Active") === "Active",
    subCategories: (data.subCategories ?? [])
      .map((sub) => ({ id: sub?.id, name: sub?.name ?? sub }))
      .filter((sub) => Boolean(sub.name)),
  });
  return extractOne(payload);
}

export async function reorderCategory(id, direction) {
  const payload = await api.patch(
    `/api/categories/${encodeURIComponent(id)}/order`,
    { direction },
  );
  // The backend response is the only source of truth: success is only
  // reported when the server confirms the reorder was applied. A missing or
  // false flag throws, so the admin UI can never toast "order updated" for a
  // move the database did not make (also covers edge moves like
  // "already first" which the backend rejects with 400).
  if (!payload?.success) {
    throw new ApiError(
      payload?.message ?? "Unable to update category order.",
      0,
    );
  }
  return payload;
}

// DELETE /api/categories/:id — resolves to true/false like the previous layer.
export async function deleteCategory(id) {
  try {
    await api.delete(`/api/categories/${encodeURIComponent(id)}`);
    return true;
  } catch (error) {
    if (error?.status === 404) return false;
    throw error;
  }
}
