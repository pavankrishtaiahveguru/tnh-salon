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
  parseExcelCatalog,
  importCatalog,
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
  const [preview, setPreview] = useState(null); // { summary, payload }
  const [importing, setImporting] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [fileError, setFileError] = useState("");
  const [lastResult, setLastResult] = useState(null);

  const clearSelectedFile = () => {
    setSelectedFile(null);
    setPreview(null);
    setFileError("");
  };

  // Step 1 — read the .xlsx, convert it to the JSON catalog payload and show
  // a preview summary. Nothing is sent to the backend until the admin clicks
  // "Import data".
  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    setFileError("");
    setLastResult(null);
    setPreview(null);

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
    setParsing(true);
    try {
      const payload = await parseExcelCatalog(file);
      const data = payload?.data ?? {};
      setPreview({
        payload,
        summary: {
          categories: data.categories?.length ?? 0,
          subCategories: (data.categories ?? []).reduce(
            (total, category) => total + (category.subCategories?.length ?? 0),
            0,
          ),
          services: data.services?.length ?? 0,
          branches: data.branches?.length ?? 0,
        },
      });
    } catch (error) {
      const issues = Array.isArray(error?.issues) ? error.issues : [];
      setFileError(
        issues.length > 0
          ? `${error.message} First issue: ${issues[0]}`
          : (error?.message ??
              "This file could not be read. Please use an Excel file exported from this page."),
      );
      setSelectedFile(null);
    } finally {
      setParsing(false);
    }
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

  // Step 2 — commit the parsed payload through the existing backend API.
  const handleImport = async () => {
    if (!preview || importing) return;
    setImporting(true);
    setLastResult(null);
    try {
      const response = await importCatalog(preview.payload);
      const data = response?.data ?? {};
      setLastResult({
        ok: true,
        summary: response?.message ?? "Import completed successfully.",
        issues: Array.isArray(data.issues) ? data.issues : [],
      });
      clearSelectedFile();
      toast.success(response?.message ?? "Import completed successfully.");
    } catch (error) {
      const message =
        error?.message ?? "Import failed. Please check the file and try again.";
      toast.error(message);
      setLastResult({
        ok: false,
        summary: message,
        issues: Array.isArray(error?.issues) ? error.issues : [],
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
            disabled={exporting || importing || parsing}
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
                disabled={importing || parsing}
                className="shrink-0 text-xs font-semibold text-[#5F7774] transition-colors hover:text-[#09221F] disabled:opacity-50"
              >
                Remove
              </button>
            </div>
          ) : (
            <button
              type="button"
              disabled={importing || parsing}
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

        {parsing ? (
          <div className="mt-4 flex items-center gap-2 rounded-lg border border-[#D7EAE7] bg-[#F9FCFB] px-4 py-3 text-sm text-[#5F7774]">
            <Loader2 size={16} className="animate-spin text-[#218F87]" />
            Reading Excel file…
          </div>
        ) : null}

        {preview && !parsing ? (
          <div className="mt-4 rounded-lg border border-[#BFE3DF] bg-[#EFF9F7] px-4 py-3 text-sm leading-6 text-[#09221F]">
            <p className="flex items-start gap-2 font-medium">
              <ShieldCheck size={16} className="mt-0.5 shrink-0 text-[#218F87]" />
              Excel file loaded successfully. Review the summary before
              importing.
            </p>
            <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-xs sm:grid-cols-4">
              <p>
                Categories:{" "}
                <span className="font-semibold">{preview.summary.categories}</span>
              </p>
              <p>
                Sub-categories:{" "}
                <span className="font-semibold">
                  {preview.summary.subCategories}
                </span>
              </p>
              <p>
                Services:{" "}
                <span className="font-semibold">{preview.summary.services}</span>
              </p>
              <p>
                Branches:{" "}
                <span className="font-semibold">{preview.summary.branches}</span>
              </p>
            </div>
          </div>
        ) : null}

        <div className="mt-4 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={handleImport}
            disabled={!preview || importing || parsing}
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
            {lastResult.issues.length > 0 ? (
              <ul className="mt-2 list-inside list-disc space-y-0.5 text-xs opacity-90">
                {lastResult.issues.slice(0, 8).map((issue) => (
                  <li key={issue}>{issue}</li>
                ))}
              </ul>
            ) : null}
          </div>
        ) : null}
      </section>
    </div>
  );
}
