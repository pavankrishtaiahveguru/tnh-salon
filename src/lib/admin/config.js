// Admin configuration shared by the data layer and admin UI.
//
// When the Node.js backend is ready, set NEXT_PUBLIC_API_URL (e.g.
// "https://api.tnhsalon.com/v1") and swap the mock adapters in
// src/lib/admin/*.js for real fetch() calls. The API function signatures in
// this folder intentionally mirror the future REST endpoints:
//
//   GET    /api/services        -> getServices()
//   POST   /api/services        -> createService(data)
//   GET    /api/services/:id    -> getServiceById(id)
//   PUT    /api/services/:id    -> updateService(id, data)
//   DELETE /api/services/:id    -> deleteService(id)
//
export const ADMIN_API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "";

export const BRANCHES = [
  { id: "indiranagar", name: "Indiranagar" },
  { id: "sarjapur-road", name: "Sarjapur Road" },
];

export const GENDERS = ["Unisex", "Women", "Men"];

export const SERVICE_STATUSES = ["Active", "Inactive"];

// Options for the admin services filter bar ("Any status" / "Any branch" are
// rendered as the empty-value placeholder of the Select fields).
export const STATUS_FILTER_OPTIONS = ["Active", "Inactive"];

export const BRANCH_FILTER_OPTIONS = [
  { value: "indiranagar", label: "Indiranagar" },
  { value: "sarjapur-road", label: "Sarjapur Road" },
  { value: "both", label: "Both" },
];

// "Any audience" is the empty-value placeholder; these are the options.
export const GENDER_FILTER_OPTIONS = ["Unisex", "Women", "Men"];

// Rows per page on the admin services table.
export const SERVICES_PAGE_SIZE = 20;

export const PRICING_TYPES = [
  { value: "fixed", label: "Fixed" },
  { value: "size", label: "Size (S/M/L)" },
  { value: "variant", label: "Variant" },
  { value: "from", label: "From" },
];

// Maps a legacy `branch` string from src/data/services.js to branch IDs used
// by the admin panel (and by the future backend).
export function branchLabelToIds(branchLabel) {
  switch (branchLabel) {
    case "Both branches":
      return ["indiranagar", "sarjapur-road"];
    case "Indiranagar":
      return ["indiranagar"];
    case "Sarjapura Road":
      return ["sarjapur-road"];
    default:
      return [];
  }
}

// Inverse of branchLabelToIds: produce the customer-site `branch` label from a
// list of branch IDs, so admin edits round-trip cleanly into the existing
// customer-facing data structure.
export function branchIdsToLabel(branchIds) {
  const set = new Set(branchIds ?? []);
  const hasIndiranagar = set.has("indiranagar");
  const hasSarjapur = set.has("sarjapur-road");

  if (hasIndiranagar && hasSarjapur) return "Both branches";
  if (hasIndiranagar) return "Indiranagar";
  if (hasSarjapur) return "Sarjapura Road";
  return "";
}

// Short branch label for table cells: "Indiranagar" / "Sarjapur Road" / "Both".
export function branchAvailabilityShortLabel(branchIds) {
  const set = new Set(branchIds ?? []);
  const hasIndiranagar = set.has("indiranagar");
  const hasSarjapur = set.has("sarjapur-road");

  if (hasIndiranagar && hasSarjapur) return "Both";
  if (hasIndiranagar) return "Indiranagar";
  if (hasSarjapur) return "Sarjapur Road";
  return "—";
}

// Human-readable pricing type for table cells and detail views.
export function pricingTypeLabel(pricingType) {
  switch (pricingType) {
    case "fixed":
      return "Fixed";
    case "size":
      return "Size-based";
    case "variant":
      return "Variants";
    default:
      return "—";
  }
}

// Human-readable branch availability summary, e.g. "Available at both branches".
export function branchAvailabilityLabel(branchIds) {
  const label = branchIdsToLabel(branchIds);
  switch (label) {
    case "Both branches":
      return "Available at both branches";
    case "Indiranagar":
      return "Available at Indiranagar";
    case "Sarjapura Road":
      return "Available at Sarjapura Road";
    default:
      return "No branch selected";
  }
}
