"use client";

import Link from "next/link";
import {
  Pencil,
  Trash2,
  FolderTree,
  ArrowUp,
  ArrowDown,
  Eye,
} from "lucide-react";
import StatusBadge from "./StatusBadge";
import AdminEmptyState from "./AdminEmptyState";

// Categories list with responsive card fallback on small screens.
export default function CategoryTable({
  categories,
  onDelete,
  onMove,
  movingId,
}) {
  if (categories.length === 0) {
    return (
      <AdminEmptyState
        icon={FolderTree}
        title="No categories found"
        description="Create your first category to organise services."
      />
    );
  }

  return (
    <>
      <div className="hidden grid-cols-[72px_minmax(220px,1.2fr)_minmax(240px,2fr)_80px_90px_90px] items-center gap-4 border-b border-[#E3EFED] bg-[#F9FCFB] px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#5F7774] lg:grid">
        <span>Order</span>
        <span>Category</span>
        <span>Sub-categories</span>
        <span>Services</span>
        <span>Shown</span>
        <span>Actions</span>
      </div>
      <ul className="divide-y divide-[#E3EFED]">
        {categories.map((category) => (
          <li
            key={category.id}
            className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:gap-4 sm:px-5 lg:grid lg:grid-cols-[72px_minmax(220px,1.2fr)_minmax(240px,2fr)_80px_90px_90px]"
          >
            <div className="flex items-center gap-2 lg:justify-center">
              <div className="flex shrink-0 flex-col gap-1">
                <button
                  type="button"
                  disabled={
                    movingId === category.id || category === categories[0]
                  }
                  onClick={() => onMove(category, "up")}
                  aria-label={`Move ${category.name} up`}
                  className="flex h-7 w-7 items-center justify-center rounded-md border border-[#D7EAE7] text-[#3E5450] transition-colors hover:bg-[#EAF6F4] disabled:cursor-not-allowed disabled:opacity-35"
                >
                  <ArrowUp size={13} />
                </button>
                <button
                  type="button"
                  disabled={
                    movingId === category.id ||
                    category === categories[categories.length - 1]
                  }
                  onClick={() => onMove(category, "down")}
                  aria-label={`Move ${category.name} down`}
                  className="flex h-7 w-7 items-center justify-center rounded-md border border-[#D7EAE7] text-[#3E5450] transition-colors hover:bg-[#EAF6F4] disabled:cursor-not-allowed disabled:opacity-35"
                >
                  <ArrowDown size={13} />
                </button>
              </div>
            </div>

            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#EAF6F4] text-[#218F87]">
                {category.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={category.image}
                    alt={category.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <FolderTree size={17} />
                )}
              </div>

              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-[#09221F]">
                  {category.name}
                </p>
              </div>
            </div>

            <div className="max-w-md whitespace-normal text-xs text-[#5F7774] lg:block">
              {category.subCategories.length > 0
                ? category.subCategories.map((sub) => sub.name).join(" · ")
                : "—"}
            </div>

            <div className="hidden text-sm font-semibold text-[#09221F] lg:block">
              {category.serviceCount}
            </div>

            <div className="flex items-center justify-between gap-2 sm:justify-end lg:justify-start">
              <StatusBadge status={category.status} />
            </div>

            <div className="flex items-center gap-1.5 lg:justify-start">
              <Link
                href={`/admin/categories/${category.id}/view`}
                aria-label="View category"
                title="View category"
                className="flex h-8 w-8 items-center justify-center rounded-lg text-[#3E5450] transition-colors hover:bg-[#EAF6F4] hover:text-[#218F87]"
              >
                <Eye size={15} />
              </Link>
              <Link
                href={`/admin/categories/${category.id}`}
                aria-label={`Edit ${category.name}`}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-[#3E5450] transition-colors hover:bg-[#EAF6F4] hover:text-[#218F87]"
              >
                <Pencil size={15} />
              </Link>
              <button
                type="button"
                onClick={() => onDelete(category)}
                aria-label={`Delete ${category.name}`}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-[#3E5450] transition-colors hover:bg-red-50 hover:text-red-600"
              >
                <Trash2 size={15} />
              </button>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
