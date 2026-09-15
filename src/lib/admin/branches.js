import api from "@/lib/api";

function mapBranch(row) {
  return {
    ...row,
    id: row.slug ?? String(row.id),
    hours: row.hours ?? { weekdays: "", weekends: "" },
    active: row.is_active !== false && row.is_active !== 0,
  };
}

export async function getBranches() {
  const payload = await api.get("/api/branches");
  const rows = payload?.data?.branches ?? payload?.branches ?? [];
  return Array.isArray(rows) ? rows.map(mapBranch) : [];
}

export async function updateBranch(id, data) {
  const payload = await api.put(
    `/api/branches/${encodeURIComponent(id)}`,
    data,
  );
  return payload?.data?.branch ? mapBranch(payload.data.branch) : null;
}
