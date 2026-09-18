import api from "@/lib/api";

export async function getBranches() {
  const payload = await api.get("/api/branches");
  const rows = payload?.data?.branches ?? payload?.branches ?? [];      return Array.isArray(rows)
        ? rows
            .filter(
              (branch) => branch.is_active !== false && branch.is_active !== 0,
            )
            .map((branch) => ({
              // Keep the numeric DB id (branchId) available for lookups while
              // `id` stays the slug — the UI/booking flow keys studios by slug.
              branchId: branch.id,
              ...branch,
              id: branch.slug ?? String(branch.id),
            }))
        : [];
}
