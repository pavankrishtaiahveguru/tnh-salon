"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, TriangleAlert, ArrowUp, ArrowDown } from "lucide-react";
import {
  getServicesInScope,
  reorderServices,
} from "@/lib/admin/services";
import { useAdminToast } from "./AdminToast";

// ==================================================
// ServiceOrderPanel — persistent service display-order editor
// ==================================================
// Shown on the admin Services page once BOTH a category and a sub-category
// are selected. Lists every service in that category+subcategory scope in
// the persisted display order (display_order ASC, id ASC — straight from the
// backend) and lets the admin reorder it with ↑/↓ arrow buttons in a
// left-hand ORDER column — the SAME interaction and visual pattern as the
// admin Category ordering UI (CategoryTable.jsx). No drag-and-drop.
//
// Ordering is scoped: reordering here only ever touches
// (categoryId + subCategoryId) — no other scope's order can change.
//
// Save model: each arrow click persists the COMPLETE new order in one
// PUT /api/services/reorder request (never one request per service). The
// UI updates optimistically, then refreshes from the backend's confirmed
// response; on failure the previous order is restored and an error toast is
// shown. Concurrent saves are prevented via a saving flag + token ref.
export default function ServiceOrderPanel({ categoryId, subCategoryId }) {
  const toast = useAdminToast();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [saving, setSaving] = useState(false);
  // Guards against a stale response from an earlier save overwriting the
  // result of a newer one (mirrors CategoryForm's reorderTokenRef).
  const tokenRef = useRef(0);

  const loadServices = async () => {
    setLoading(true);
    setLoadError("");
    try {
      const data = await getServicesInScope(categoryId, subCategoryId);
      setServices(data);
    } catch (error) {
      setLoadError(
        error?.message ?? "Unable to load the current service order.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Defer to a microtask so the first setState (setLoading) is not called
    // synchronously inside the effect body (react-hooks/set-state-in-effect).
    let cancelled = false;
    Promise.resolve().then(() => {
      if (!cancelled) loadServices();
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryId, subCategoryId]);

  // Persist the complete new order after every committed move.
  const persistOrder = async (next) => {
    const previous = services;
    setServices(next); // 1. optimistic UI update
    const items = next.map((service, index) => ({
      id: service.dbId,
      displayOrder: index,
    }));

    const token = ++tokenRef.current;
    setSaving(true);
    try {
      // 2. one request with the complete ordered id list
      const confirmed = await reorderServices(categoryId, subCategoryId, items);
      if (tokenRef.current === token) {
        // 3. refresh from the backend's authoritative response (never trust
        // only the optimistic state).
        setServices(confirmed);
        toast.success("Service order updated successfully.");
      }
    } catch (error) {
      if (tokenRef.current === token) {
        setServices(previous); // restore the pre-move order
        toast.error(
          error?.message ??
            "Failed to update service order. Please try again.",
        );
      }
    } finally {
      if (tokenRef.current === token) setSaving(false);
    }
  };

  // Move a service one position up/down (swap with its neighbour) and
  // persist the resulting order. First row can only move down, last row
  // only up — enforced by the buttons' disabled state below.
  const moveService = (index, direction) => {
    if (saving) return;
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= services.length) return;
    const next = [...services];
    [next[index], next[targetIndex]] = [next[targetIndex], next[index]];
    persistOrder(next);
  };

  if (loading) {
    return (
      <div className="rounded-2xl border border-[#D7EAE7] bg-white p-5">
        <div className="flex items-center gap-2 text-sm text-[#5F7774]">
          <Loader2 size={15} className="animate-spin" />
          Loading current order…
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="rounded-2xl border border-[#F3C9C0] bg-[#FDF6F4] p-5">
        <div className="flex items-center gap-2 text-sm font-semibold text-[#B23B23]">
          <TriangleAlert size={15} />
          {loadError}
        </div>
        <button
          type="button"
          onClick={loadServices}
          className="mt-3 rounded-lg bg-[#218F87] px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#1B756E]"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-[#D7EAE7] bg-white">
      <div className="flex flex-col gap-1 border-b border-[#E3EFED] bg-[#F9FCFB] px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#173B38]">
            Display order
          </p>
          <p className="mt-0.5 text-xs text-[#5F7774]">
            Use the arrows to reorder — this order is what customers see on the
            public Services page.{saving ? " Saving…" : ""}
          </p>
        </div>
        {saving ? (
          <span className="flex items-center gap-1.5 text-xs font-semibold text-[#218F87]">
            <Loader2 size={13} className="animate-spin" />
            Saving order…
          </span>
        ) : null}
      </div>

      {services.length === 0 ? (
        <p className="px-5 py-8 text-center text-sm text-[#5F7774]">
          No services in this category + sub-category yet.
        </p>
      ) : (
        <>
          {/* Column header — same layout/styling as the Category table's
              header row (hidden below lg, where the panel title covers it). */}
          <div className="hidden grid-cols-[72px_minmax(0,1fr)] items-center gap-4 border-b border-[#E3EFED] bg-[#F9FCFB] px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#5F7774] lg:grid">
            <span>Order</span>
            <span>Service</span>
          </div>

          <ol className="divide-y divide-[#E3EFED]">
            {services.map((service, index) => (
              <li
                key={service.dbId}
                className="flex items-center gap-3 px-4 py-2.5 sm:gap-4 sm:px-5 lg:grid lg:grid-cols-[72px_minmax(0,1fr)]"
              >
                {/* ORDER column — ↑/↓ controls (Category button styling) plus
                    the current position. No drag handle, no draggable area. */}
                <div className="flex items-center gap-2 lg:justify-center">
                  <div className="flex shrink-0 flex-col gap-1">
                    <button
                      type="button"
                      disabled={
                        // Disable ALL move buttons while any reorder is in
                        // flight — rapid ↑/↓ clicks on different rows must
                        // not interleave conflicting requests.
                        saving || index === 0
                      }
                      onClick={() => moveService(index, -1)}
                      aria-label={`Move ${service.name} up`}
                      className="flex h-7 w-7 items-center justify-center rounded-md border border-[#D7EAE7] text-[#3E5450] transition-colors hover:bg-[#EAF6F4] disabled:cursor-not-allowed disabled:opacity-35"
                    >
                      <ArrowUp size={13} />
                    </button>
                    <button
                      type="button"
                      disabled={saving || index === services.length - 1}
                      onClick={() => moveService(index, 1)}
                      aria-label={`Move ${service.name} down`}
                      className="flex h-7 w-7 items-center justify-center rounded-md border border-[#D7EAE7] text-[#3E5450] transition-colors hover:bg-[#EAF6F4] disabled:cursor-not-allowed disabled:opacity-35"
                    >
                      <ArrowDown size={13} />
                    </button>
                  </div>
                  <span
                    aria-hidden="true"
                    className="w-4 text-right text-xs font-bold text-[#5F7774]"
                  >
                    {index + 1}
                  </span>
                </div>

                {/* SERVICE column — name + audience/status, nothing else. */}
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-[#09221F]">
                    {service.name}
                  </p>
                  <p className="truncate text-xs text-[#5F7774]">
                    {service.gender || "Unisex"} ·{" "}
                    {service.status === "Active" ? "Active" : "Inactive"}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </>
      )}
    </div>
  );
}
