// ==================================================
// Admin data access for Import & Export — backed by the Node.js API
// ==================================================
// Same conventions as the other lib/admin modules: all calls go through the
// shared API client conventions (src/lib/api.js), which targets
// NEXT_PUBLIC_API_URL and attaches the admin's Bearer token automatically.
//
//   GET  /api/catalog/export  -> the live MySQL catalog as the
//                                reference-format .xlsx (2 sheets)
//   POST /api/catalog/import  -> multipart .xlsx upload; the backend parses,
//                                validates the whole file, then applies it in
//                                one transaction to MySQL
//
// The Excel structure lives entirely on the backend
// (src/services/catalogExcelService.js) — the database is always the source
// of truth and no catalogue data is stored or derived in the browser.
import { ApiError } from "@/lib/api";
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

    const blob = await response.blob();
    const filename =
      response.headers
        .get("content-disposition")
        ?.match(/filename="([^"]+)"/)?.[1] ??
      `the-nail-hue-services-${new Date().toISOString().slice(0, 10)}.xlsx`;

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

// POST /api/catalog/import -> uploads the .xlsx to the backend, which
// validates the entire file before touching the database and applies valid
// files inside a single transaction. Resolves with the server's
// { success, message, data: { processed, updated, created, skipped, errors } }
// payload; throws ApiError (with row-level `errors`) on validation failure.
export async function importCatalogFile(file) {
  const base = process.env.NEXT_PUBLIC_API_URL ?? "";
  if (!base) {
    throw new ApiError(
      "API URL is not configured. Set NEXT_PUBLIC_API_URL in .env.local.",
      0,
    );
  }

  const body = new FormData();
  body.append("file", file, file.name);

  try {
    const response = await fetch(`${base}/api/catalog/import`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${getToken() ?? ""}`,
      },
      credentials: "include",
      body,
    });

    const payload = await response.json().catch(() => null);

    if (!response.ok) {
      const message =
        (payload && typeof payload.message === "string" && payload.message) ||
        "Import failed. Please check the file and try again.";
      const errors = payload?.errors ?? [];
      if (response.status === 401) {
        throw new ApiError(
          "Your session has expired. Please sign in again.",
          401,
          undefined,
          errors,
        );
      }
      throw new ApiError(message, response.status, undefined, errors);
    }

    return payload;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(toUserMessage(error), 0);
  }
}
