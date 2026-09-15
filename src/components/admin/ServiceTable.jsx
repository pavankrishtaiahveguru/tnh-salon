"use client";

import Link from "next/link";
import { Pencil, Trash2, Eye, Scissors } from "lucide-react";
import StatusBadge from "./StatusBadge";
import AdminEmptyState from "./AdminEmptyState";
import ServicesSkeleton from "./ServicesSkeleton";
import {
  branchAvailabilityShortLabel,
  pricingTypeLabel,
} from "@/lib/admin/config";

export function formatServicePrice(service) {
  if (service.pricingType === "fixed") return `₹${service.price}`;
  const prices = (service.variants ?? []).map((v) => v.price);
  if (prices.length === 0) return service.priceRange ?? "—";
  return `₹${Math.min(...prices)} – ₹${Math.max(...prices)}`;
}

// Services table with the full reference columns and a responsive card
// fallback on small screens. Pass `loading` to render skeleton rows instead.
export default function ServiceTable({
  services,
  onEdit,
  onView,
  onDelete,
  onToggleStatus,
  togglingStatusId,
  loading = false,
  actionBaseUrl = "/admin/services",
}) {
  if (loading) {
    return <ServicesSkeleton />;
  }

  if (services.length === 0) {
    return (
      <AdminEmptyState
        icon={Scissors}
        title="No services found"
        description="Try adjusting your search or filters."
      />
    );
  }

  return (
    <>
      {/* Desktop table */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[980px] text-left text-sm">
          <thead>
            <tr className="border-b border-[#E3EFED] text-[11px] uppercase tracking-wider text-[#5F7774]">
              <th className="px-5 py-3 font-semibold">Service</th>
              <th className="px-4 py-3 font-semibold">Category</th>
              <th className="px-4 py-3 font-semibold">Sub-category</th>
              <th className="px-4 py-3 font-semibold">For</th>
              <th className="px-4 py-3 font-semibold">Price Type</th>
              <th className="px-4 py-3 font-semibold">Price</th>
              <th className="px-4 py-3 font-semibold">Branch</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-5 py-3 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E3EFED]">
            {services.map((service) => (
              <tr key={service.id} className="transition-colors hover:bg-[#F9FCFB]">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-[#EAF6F4] text-[#218F87]">
                      {service.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={service.image}
                          alt={service.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <Scissors size={14} />
                      )}
                    </div>
                    <p className="max-w-[220px] truncate font-semibold text-[#09221F]">
                      {service.name}
                    </p>
                  </div>
                </td>
                <td className="px-4 py-3 text-[#3E5450]">{service.category}</td>
                <td className="px-4 py-3 text-[#3E5450]">
                  {service.subCategory || "—"}
                </td>
                <td className="px-4 py-3 text-[#3E5450]">{service.gender || "—"}</td>
                <td className="px-4 py-3 text-[#3E5450]">
                  {pricingTypeLabel(service.pricingType)}
                </td>
                <td className="px-4 py-3 font-semibold text-[#09221F]">
                  {formatServicePrice(service)}
                </td>
                <td className="px-4 py-3 text-[#3E5450]">
                  {branchAvailabilityShortLabel(service.branchIds)}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge
                    status={service.status}
                    onToggle={() => onToggleStatus?.(service)}
                    disabled={togglingStatusId === service.id}
                  />
                </td>
                <td className="px-5 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <Link
                      href={`${actionBaseUrl}/${service.id}`}
                      aria-label={`Edit ${service.name}`}
                      title="Edit"
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-[#3E5450] transition-colors hover:bg-[#EAF6F4] hover:text-[#218F87]"
                    >
                      <Pencil size={15} />
                    </Link>
                    <button
                      type="button"
                      onClick={() => onView?.(service)}
                      aria-label={`View ${service.name}`}
                      title="View"
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-[#3E5450] transition-colors hover:bg-[#EAF6F4] hover:text-[#218F87]"
                    >
                      <Eye size={15} />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete?.(service)}
                      aria-label={`Delete ${service.name}`}
                      title="Delete"
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-[#3E5450] transition-colors hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <ul className="divide-y divide-[#E3EFED] md:hidden">
        {services.map((service) => (
          <li key={service.id} className="p-4">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-[#EAF6F4] text-[#218F87]">
                {service.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={service.image}
                    alt={service.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <Scissors size={16} />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <p className="truncate font-semibold text-[#09221F]">{service.name}</p>
                  <StatusBadge
                    status={service.status}
                    onToggle={() => onToggleStatus?.(service)}
                    disabled={togglingStatusId === service.id}
                  />
                </div>
                <p className="mt-0.5 truncate text-xs text-[#5F7774]">
                  {service.category}
                  {service.subCategory ? ` · ${service.subCategory}` : ""}
                </p>

                <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#3E5450]">
                  <span className="font-semibold text-[#09221F]">
                    {formatServicePrice(service)}
                  </span>
                  <span>For {service.gender || "—"}</span>
                  <span>{branchAvailabilityShortLabel(service.branchIds)}</span>
                </div>

                <div className="mt-3 flex items-center gap-2">
                  <Link
                    href={`${actionBaseUrl}/${service.id}`}
                    className="flex h-8 items-center gap-1.5 rounded-lg border border-[#D7EAE7] bg-white px-3 text-xs font-semibold text-[#173B38]"
                  >
                    <Pencil size={13} />
                    Edit
                  </Link>
                  <button
                    type="button"
                    onClick={() => onView?.(service)}
                    className="flex h-8 items-center gap-1.5 rounded-lg border border-[#D7EAE7] bg-white px-3 text-xs font-semibold text-[#173B38]"
                  >
                    <Eye size={13} />
                    View
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete?.(service)}
                    className="flex h-8 items-center gap-1.5 rounded-lg border border-red-100 bg-white px-3 text-xs font-semibold text-red-600"
                  >
                    <Trash2 size={13} />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
