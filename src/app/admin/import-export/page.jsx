import ImportExportClient from "./ImportExportClient";

// /admin/import-export — Server Component. All interactivity (file picking,
// upload/download handlers, toasts) lives in ImportExportClient so no event
// handlers are ever passed across the Server/Client Component boundary.
export const metadata = {
  title: "Import & Export",
};

export default function ImportExportPage() {
  return <ImportExportClient />;
}
