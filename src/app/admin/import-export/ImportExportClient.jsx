"use client";

import { useRef, useState } from "react";
import {
  Download,
  FileSpreadsheet,
  Loader2,
  ShieldCheck,
  TriangleAlert,
  Upload,
} from "lucide-react";
import {
  exportCatalog,
  importCatalogFile,
} from "@/lib/admin/catalog";
import { useAdminToast } from "@/components/admin/AdminToast";

// Interactive Import & Export UI for /admin/import-export.
// Rendered by the Server Component page.jsx — every handler/state here lives
// behind the "use client" boundary, so no event handlers cross it.
//
// Excel is only ever the admin-facing file format: exports convert the JSON
// catalog to .xlsx in the browser, imports parse the .xlsx back to the same
// JSON structure before it is sent to the existing backend API.
export default function ImportExportClient() {
  const toast = useAdminToast();
  const inputRef = useRef(null);

  const [selectedFile, setSelectedFile] = useState(null);
  const [importing, setImporting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [fileError, setFileError] = useState("");
  const [lastResult, setLastResult] = useState(null);

  const clearSelectedFile = () => {
    setSelectedFile(null);
    setFileError("");
  };

  // Selecting a file only stages it — the backend parses and validates the
  // whole workbook before any database change is made.
  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    setFileError("");
    setLastResult(null);

    if (!file) {
      setSelectedFile(null);
      return;
    }
    if (!file.name.toLowerCase().endsWith(".xlsx")) {
      setSelectedFile(null);
      setFileError("Please choose an .xlsx Excel file exported from this page.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setSelectedFile(null);
      setFileError("File is too large. The maximum size is 10 MB.");
      return;
    }

    setSelectedFile(file);
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const result = await exportCatalog();
      if (result.ok) {
        toast.success("Export completed. Check your downloads.");
      } else {
        toast.error(result.message ?? "Export failed. Please try again.");
      }
    } finally {
      setExporting(false);
    }
  };

  // Upload the staged .xlsx. The backend validates everything first; on
  // success it applies the file in one transaction and returns a summary.
  const handleImport = async () => {
    if (!selectedFile || importing) return;
    setImporting(true);
    setLastResult(null);
    try {
      const response = await importCatalogFile(selectedFile);
      const data = response?.data ?? {};
      setLastResult({
        ok: true,
        summary: response?.message ?? "Import completed successfully.",
        stats: data,
        issues: [],
      });
      clearSelectedFile();
      toast.success(response?.message ?? "Import completed successfully.");
    } catch (error) {
      const message =
        error?.message ?? "Import failed. Please check the file and try again.";
      const issues = Array.isArray(error?.errors) ? error.errors : [];
      toast.error(message);
      setLastResult({
        ok: false,
        summary: message,
        stats: null,
        issues,
      });
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Export */}
      <section className="rounded-2xl border border-[#D7EAE7] bg-white p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EAF6F4] text-[#218F87]">
              <Download size={19} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#09221F]">
                Export catalog data
              </h2>
              <p className="mt-0.5 max-w-lg text-xs leading-5 text-[#5F7774]">
                Download the current services, categories, sub-categories and
                branches from the database as an Excel (.xlsx) workbook. Use it
                as a backup, to edit offline, or to import into another
                environment.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleExport}
            disabled={exporting || importing}
            className="flex h-10 shrink-0 items-center justify-center gap-2 rounded-lg bg-[#218F87] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#1B756E] disabled:opacity-60"
          >
            {exporting ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Download size={16} />
            )}
            {exporting ? "Exporting…" : "Export Excel"}
          </button>
        </div>
      </section>

      {/* Import */}
      <section className="rounded-2xl border border-[#D7EAE7] bg-white p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EAF6F4] text-[#218F87]">
            <Upload size={19} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-[#09221F]">
              Import catalog data
            </h2>
            <p className="mt-0.5 max-w-lg text-xs leading-5 text-[#5F7774]">
              Upload an Excel (.xlsx) file exported from this page. Existing
              services, categories and sub-categories are matched by name and
              updated in place — no duplicates are created. Rows that cannot be
              matched are skipped and reported.
            </p>
          </div>
        </div>

        <div className="mt-4">
          {selectedFile ? (
            <div className="flex items-center justify-between gap-3 rounded-lg border border-[#D7EAE7] bg-[#F9FCFB] px-3 py-2.5">
              <div className="flex min-w-0 items-center gap-2.5">
                <FileSpreadsheet size={18} className="shrink-0 text-[#218F87]" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-[#09221F]">
                    {selectedFile.name}
                  </p>
                  <p className="text-[11px] text-[#5F7774]">
                    {(selectedFile.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={clearSelectedFile}
                disabled={importing}
                className="shrink-0 text-xs font-semibold text-[#5F7774] transition-colors hover:text-[#09221F] disabled:opacity-50"
              >
                Remove
              </button>
            </div>
          ) : (
            <button
              type="button"
              disabled={importing}
              onClick={() => inputRef.current?.click()}
              className="flex w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-[#CBE2DE] bg-[#F9FCFB] px-4 py-8 text-center transition-colors hover:border-[#218F87] hover:bg-[#F3F8F6] disabled:opacity-60"
            >
              <Upload size={22} className="text-[#218F87]" />
              <span className="text-xs font-medium text-[#173B38]">
                Click to choose an Excel file
              </span>
              <span className="text-[11px] text-[#5F7774]">
                Supported format: .xlsx · up to 10 MB
              </span>
            </button>
          )}

          {fileError ? (
            <p className="mt-2 text-[11px] font-medium text-[#A94B4B]">
              {fileError}
            </p>
          ) : null}

          <input
            ref={inputRef}
            type="file"
            accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>

        {selectedFile ? null : (
          <p className="mt-3 text-[11px] leading-5 text-[#5F7774]">
            The file is validated on the server before anything is imported —
            if any row has a problem, nothing is changed.
          </p>
        )}

        <div className="mt-4 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={handleImport}
            disabled={!selectedFile || importing}
            className="flex h-10 items-center justify-center gap-2 rounded-lg bg-[#218F87] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#1B756E] disabled:opacity-60"
          >
            {importing ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Upload size={16} />
            )}
            {importing ? "Importing…" : "Import data"}
          </button>
        </div>

        {lastResult ? (
          <div
            className={`mt-4 rounded-lg border px-4 py-3 text-sm leading-6 ${
              lastResult.ok
                ? "border-[#BFE3DF] bg-[#EFF9F7] text-[#09221F]"
                : "border-red-200 bg-red-50 text-[#7A1D1D]"
            }`}
          >
            <p className="flex items-start gap-2 font-medium">
              {lastResult.ok ? (
                <ShieldCheck size={16} className="mt-0.5 shrink-0 text-[#218F87]" />
              ) : (
                <TriangleAlert size={16} className="mt-0.5 shrink-0 text-red-500" />
              )}
              {lastResult.summary}
            </p>
            {lastResult.stats ? (
              <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-xs sm:grid-cols-4">
                <p>
                  Processed:{" "}
                  <span className="font-semibold">{lastResult.stats.processed ?? 0}</span>
                </p>
                <p>
                  Updated:{" "}
                  <span className="font-semibold">{lastResult.stats.updated ?? 0}</span>
                </p>
                <p>
                  Created:{" "}
                  <span className="font-semibold">{lastResult.stats.created ?? 0}</span>
                </p>
                <p>
                  Errors:{" "}
                  <span className="font-semibold">{lastResult.stats.errors ?? 0}</span>
                </p>
              </div>
            ) : null}
            {lastResult.issues.length > 0 ? (
              <div className="mt-2">
                <p className="text-xs font-semibold">
                  Problems found (nothing was changed):
                </p>
                <ul className="mt-1 list-inside list-disc space-y-0.5 text-xs opacity-90">
                  {lastResult.issues.slice(0, 20).map((issue) => (
                    <li key={issue}>{issue}</li>
                  ))}
                </ul>
                {lastResult.issues.length > 20 ? (
                  <p className="mt-1 text-[11px] opacity-80">
                    …and {lastResult.issues.length - 20} more.
                  </p>
                ) : null}
              </div>
            ) : null}
          </div>
        ) : null}
      </section>
    </div>
  );
}
