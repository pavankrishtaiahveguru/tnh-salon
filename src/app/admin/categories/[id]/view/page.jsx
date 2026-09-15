"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, FolderTree, Layers, Scissors, Tag } from "lucide-react";
import { getCategoryById } from "@/lib/admin/categories";
import { getServices } from "@/lib/admin/services";
import StatusBadge from "@/components/admin/StatusBadge";

export default function ViewCategoryPage({ params }) {
  const { id } = use(params);
  const [category, setCategory] = useState(null);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    Promise.all([getCategoryById(id), getServices({ category: id })])
      .then(([categoryData, serviceData]) => {
        if (!active) return;
        setCategory(categoryData);
        setServices(serviceData);
      })
      .catch((requestError) => {
        if (active) {
          setError(requestError?.message ?? "Unable to load category details.");
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#D7EAE7] border-t-[#218F87]" />
      </div>
    );
  }

  if (error || !category) {
    return (
      <div className="rounded-2xl border border-[#D7EAE7] bg-white p-10 text-center">
        <FolderTree className="mx-auto h-10 w-10 text-[#B9AE9E]" />
        <h2 className="mt-3 text-base font-bold text-[#09221F]">
          {error ? "Unable to load category" : "Category not found"}
        </h2>
        <p className="mt-1 text-sm text-[#5F7774]">
          {error || "The category could not be found."}
        </p>
        <Link
          href="/admin/categories"
          className="mt-5 inline-flex h-10 items-center gap-2 rounded-lg bg-[#218F87] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#1B756E]"
        >
          <ArrowLeft size={15} />
          Back to categories
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <Link
        href="/admin/categories"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-[#5F7774] transition-colors hover:text-[#218F87]"
      >
        <ArrowLeft size={15} />
        Back to categories
      </Link>

      <div className="rounded-2xl border border-[#D7EAE7] bg-white p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#EAF6F4] text-[#218F87]">
            {category.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={category.image}
                alt={category.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <FolderTree size={28} />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-bold text-[#09221F]">
                {category.name}
              </h1>
              <StatusBadge status={category.status} />
            </div>
            <p className="mt-2 text-sm leading-6 text-[#5F7774]">
              {category.description || "No description added yet."}
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-[#D7EAE7] bg-[#F9FCFB] p-4">
            <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-[#5F7774]">
              <Layers size={13} /> Sub-categories
            </p>
            <p className="mt-2 text-sm text-[#09221F]">
              {category.subCategories.length > 0
                ? category.subCategories.map((sub) => sub.name).join(" · ")
                : "—"}
            </p>
          </div>
          <div className="rounded-xl border border-[#D7EAE7] bg-[#F9FCFB] p-4">
            <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-[#5F7774]">
              <Scissors size={13} /> Services
            </p>
            <p className="mt-2 text-lg font-bold text-[#09221F]">
              {category.serviceCount}
            </p>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-[#D7EAE7] bg-white">
        <div className="border-b border-[#E3EFED] px-5 py-4">
          <h2 className="flex items-center gap-2 text-sm font-bold text-[#09221F]">
            <Tag size={15} className="text-[#218F87]" />
            Services in this category
          </h2>
        </div>
        {services.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-[#5F7774]">
            No services found.
          </p>
        ) : (
          <ul className="divide-y divide-[#E3EFED]">
            {services.map((service) => (
              <li
                key={service.id}
                className="flex items-center justify-between gap-4 px-5 py-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-[#09221F]">
                    {service.name}
                  </p>
                  <p className="mt-0.5 text-xs text-[#5F7774]">
                    {service.subCategory || service.gender || "—"}
                  </p>
                </div>
                <span className="shrink-0 text-sm font-semibold text-[#09221F]">
                  {service.price != null
                    ? `₹${service.price}`
                    : service.priceRange || "—"}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
