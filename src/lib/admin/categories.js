// ==================================================
// Admin data access for service categories — backed by the Node.js API
// ==================================================
// The backend (MySQL) is the source of truth. Same signatures/shapes as the
// previous static-data layer, so admin pages keep working unchanged.
import api, { ApiError } from "@/lib/api";
import { clearServicesCache } from "@/lib/services";

function mapCategoryRow(row) {
  return {
    id: row.slug ?? String(row.id),
    // Raw numeric categories.id — the services reorder endpoint scopes by
    // numeric category + sub-category ids (mirrors the sub `dbId` below).
    dbId: Number(row.id),
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
        // Stable identifier sent as `subCategoryId` by the service form.
        // Unique per category (uq_subcategory_category_slug) and preserved
        // by the category save flow (diff-sync updates names in place —
        // never delete/recreate), so it can be relied on as an ID. Display
        // names are NOT unique in practice (Nails had "Removal & Refills"
        // twice), so they must never be used for selection/mapping.
        slug: sub.slug ?? String(sub.id),
        // Raw numeric sub_categories.id — only this (never the slug or
        // name) is accepted by the reorder endpoint, so drag-and-drop
        // reordering can uniquely target a row even when two sub-categories
        // in the same category share a display name.
        dbId: Number(sub.id),
        name: sub.name,
        displayOrder: sub.display_order ?? 0,
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

// PUT /api/categories/:categoryId/subcategories/reorder
// `items` = [{ id: <numeric sub_categories.id>, displayOrder: <int> }, ...],
// one entry per PERSISTED sub-category currently in this category (the
// backend rejects a partial list). Like reorderCategory, success is only
// reported once the server confirms the write — never assumed from the
// optimistic local reorder.
export async function reorderSubCategories(categoryId, items) {
  const payload = await api.put(
    `/api/categories/${encodeURIComponent(categoryId)}/subcategories/reorder`,
    { items },
  );
  if (!payload?.success) {
    throw new ApiError(
      payload?.message ?? "Unable to update sub-category order.",
      0,
    );
  }
  // The public Services page (subcategory chips) and the Add/Edit Service
  // dropdowns all read category data through this same cached layer — clear
  // it so the new order is visible immediately instead of waiting out the
  // 60s TTL.
  clearServicesCache();
  return extractOne(payload);
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
