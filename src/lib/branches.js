import api from "@/lib/api";

export async function getBranches() {
  const payload = await api.get("/api/branches");
  const rows = payload?.data?.branches ?? payload?.branches ?? [];

  return Array.isArray(rows)
    ? rows
        .filter(
          (branch) => branch.is_active !== false && branch.is_active !== 0,
        )
        .map((branch) => ({
          id: branch.slug ?? String(branch.id),
          ...branch,
        }))
    : [];
}
