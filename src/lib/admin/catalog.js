// ==================================================
// Admin data access for Import & Export — backed by the Node.js API
// ==================================================
// Same conventions as the other lib/admin modules: all calls go through the
// shared API client (src/lib/api.js), which targets NEXT_PUBLIC_API_URL and
// attaches the admin's Bearer token automatically.
//
//   GET  /api/catalog/export  -> JSON of the live MySQL catalog (existing API)
//   POST /api/catalog/import  -> JSON catalog payload (existing API)
//
// Excel conversion happens HERE, at the Import & Export layer only:
//   Export: JSON response -> catalogExcel.buildWorkbookFromCatalog -> .xlsx
//   Import: .xlsx file    -> catalogExcel.parseWorkbookToCatalog -> JSON body
// The website itself keeps speaking JSON; the backend/database are untouched.
import api, { ApiError } from "@/lib/api";
import { getToken } from "./auth";

function toUserMessage(error) {
  if (error instanceof ApiError) {
    return error.message;
  }
  return "Something went wrong. Please try again.";
}

// GET /api/catalog/export -> triggers a real file download of the current
// database catalog. The shared api client expects JSON responses, so the
// download is fetched directly here with the same base URL + Bearer token.
// Returns { ok: true, filename } or { ok: false, message }.
export async function exportCatalog() {
  const base = process.env.NEXT_PUBLIC_API_URL ?? "";
  if (!base) {
    return {
      ok: false,
      message:
        "API URL is not configured. Set NEXT_PUBLIC_API_URL in .env.local.",
    };
  }

  try {
    const response = await fetch(`${base}/api/catalog/export`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${getToken() ?? ""}`,
      },
      credentials: "include",
    });

    if (!response.ok) {
      let message = "";
      if ((response.headers.get("content-type") ?? "").includes("application/json")) {
        try {
          const payload = await response.json();
          message = typeof payload?.message === "string" ? payload.message : "";
        } catch {
          // ignore malformed error payloads
        }
      }
      if (response.status === 401) {
        return { ok: false, message: "Your session has expired. Please sign in again." };
      }
      return { ok: false, message: message || "Export failed. Please try again." };
    }

    const catalog = await response.json();

    // Convert the JSON catalog into a styled Excel workbook and download it.
    // (Excel is only ever an admin-facing representation of the JSON data.)
    const { buildWorkbookFromCatalog, workbookToBuffer } = await import(
      "./catalogExcel"
    );
    const workbook = buildWorkbookFromCatalog(catalog);
    const buffer = await workbookToBuffer(workbook);
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    const filename = `catalog-export-${new Date().toISOString().slice(0, 10)}.xlsx`;

    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);

    return { ok: true, filename };
  } catch (error) {
    return { ok: false, message: toUserMessage(error) };
  }
}

// Converts the selected .xlsx file into the existing JSON catalog payload
// (with full validation) and POSTs it to /api/catalog/import as JSON. The
// backend keeps receiving exactly the same structure as before. Returns the
// server's { success, message, data } payload or throws ApiError /
// ExcelImportError (row-level issues) before any request is made.
export async function parseExcelCatalog(file) {
  const { parseWorkbookToCatalog } = await import("./catalogExcel");
  const buffer = await file.arrayBuffer();
  return parseWorkbookToCatalog(buffer);
}

// POST /api/catalog/import -> sends the converted JSON payload to the existing
// backend endpoint, which validates and upserts it into the existing tables.
export async function importCatalog(payload) {
  return api.post("/api/catalog/import", payload);
}
