"use client";

import { Scissors, Clock, MapPin, Users, Layers, Tag,IndianRupee, Info } from "lucide-react";
import AdminModal from "./AdminModal";
import StatusBadge from "./StatusBadge";
import { branchAvailabilityShortLabel, pricingTypeLabel } from "@/lib/admin/config";

function formatPrice(service) {
  if (service.pricingType === "fixed") return `₹${service.price}`;
  const prices = (service.variants ?? []).map((v) => v.price);
  if (prices.length === 0) return service.priceRange ?? "—";
  return `₹${Math.min(...prices)} – ₹${Math.max(...prices)}`;
}

function DetailRow({ icon: Icon, label, children }) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#EAF6F4] text-[#218F87]">
        <Icon size={14} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-[#5F7774]">
          {label}
        </p>
        <div className="mt-0.5 text-sm text-[#09221F]">{children}</div>
      </div>
    </div>
  );
}

// Read-only service review modal opened from the table's eye icon.
export default function ServiceViewModal({ service, onClose, onEdit }) {
  return (
    <AdminModal
      open={Boolean(service)}
      onClose={onClose}
      title={service?.name ?? "Service"}
      subtitle="Service details"
      maxWidth="max-w-2xl"
    >
      {service ? (
        <div className="space-y-5">
          {/* Image + summary */}
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="flex h-40 w-full shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[#D7EAE7] bg-[#EAF6F4] text-[#218F87] sm:h-36 sm:w-36">
              {service.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={service.image}
                  alt={service.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <Scissors size={30} />
              )}
            </div>

            <div className="min-w-0 flex-1 space-y-2.5">
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge status={service.status} />
                <span className="rounded-full bg-[#F3F8F6] px-2.5 py-1 text-[11px] font-semibold text-[#3E5450]">
                  {service.category}
                </span>
                {service.subCategory ? (
                  <span className="rounded-full bg-[#F3F8F6] px-2.5 py-1 text-[11px] font-semibold text-[#3E5450]">
                    {service.subCategory}
                  </span>
                ) : null}
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="rounded-xl border border-[#D7EAE7] bg-[#F9FCFB] p-3">
                  <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-[#5F7774]">
                    <IndianRupee size={12} />
                    Price
                  </p>
                  <p className="mt-1 text-base font-bold text-[#09221F]">
                    {formatPrice(service)}
                  </p>
                  <p className="text-[11px] text-[#5F7774]">
                    {pricingTypeLabel(service.pricingType)}
                  </p>
                </div>
                <div className="rounded-xl border border-[#D7EAE7] bg-[#F9FCFB] p-3">
                  <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-[#5F7774]">
                    <Clock size={12} />
                    Duration
                  </p>
                  <p className="mt-1 text-base font-bold text-[#09221F]">
                    {service.duration || "—"}
                  </p>
                  <p className="text-[11px] text-[#5F7774]">Approx. time</p>
                </div>
              </div>
            </div>
          </div>

          {/* Detail grid */}
          <div className="grid gap-4 rounded-xl border border-[#D7EAE7] bg-white p-4 sm:grid-cols-2">
            <DetailRow icon={Tag} label="Category">
              {service.category || "—"}
            </DetailRow>
            <DetailRow icon={Layers} label="Sub-category">
              {service.subCategory || "—"}
            </DetailRow>
            <DetailRow icon={Users} label="For">
              {service.gender || "—"}
            </DetailRow>
            <DetailRow icon={MapPin} label="Branch">
              {branchAvailabilityShortLabel(service.branchIds) !== "—"
                ? branchAvailabilityShortLabel(service.branchIds)
                : "—"}
            </DetailRow>
          </div>

          {/* Description */}
          <DetailRow icon={Info} label="Description">
            <p className="leading-6 text-[#3E5450]">
              {service.description || "No description added yet."}
            </p>
          </DetailRow>

          {/* Variants */}
          {service.pricingType !== "fixed" && (service.variants ?? []).length > 0 ? (
            <div>
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-[#5F7774]">
                Price variants
              </p>
              <ul className="divide-y divide-[#E3EFED] rounded-xl border border-[#D7EAE7]">
                {service.variants.map((variant, i) => (
                  <li
                    key={`${variant.label}-${i}`}
                    className="flex items-center justify-between gap-3 px-3.5 py-2 text-sm"
                  >
                    <span className="font-medium text-[#09221F]">{variant.label}</span>
                    <span className="font-semibold text-[#09221F]">₹{variant.price}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {/* Actions */}
          <div className="flex justify-end gap-3 border-t border-[#E3EFED] pt-4">
            <button
              type="button"
              onClick={onClose}
              className="h-10 rounded-lg border border-[#D7EAE7] bg-white px-5 text-sm font-semibold text-[#173B38] transition-colors hover:bg-[#F3F8F6]"
            >
              Close
            </button>
            {onEdit ? (
              <button
                type="button"
                onClick={onEdit}
                className="h-10 rounded-lg bg-[#218F87] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#1B756E]"
              >
                Edit Service
              </button>
            ) : null}
          </div>
        </div>
      ) : null}
    </AdminModal>
  );
}
