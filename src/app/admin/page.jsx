"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Scissors,
  CheckCircle2,
  FolderTree,
  MapPin,
  ArrowRight,
  IndianRupee,
  Clock,
  LayoutGrid,
} from "lucide-react";
import { getServices } from "@/lib/admin/services";
import { getCategories } from "@/lib/admin/categories";
import { getBranches } from "@/lib/admin/branches";
import StatusBadge from "@/components/admin/StatusBadge";
import AdminEmptyState from "@/components/admin/AdminEmptyState";

function formatPrice(service) {
  if (service.pricingType === "fixed") return `₹${service.price}`;
  const prices = (service.variants ?? []).map((v) => v.price);
  if (prices.length === 0) return service.priceRange ?? "—";
  return `₹${Math.min(...prices)} – ₹${Math.max(...prices)}`;
}

export default function AdminDashboard() {
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const branches = getBranches(); // static reference data, no API needed

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    let active = true;
    Promise.all([getServices(), getCategories()])
      .then(([servicesData, categoriesData]) => {
        if (!active) return;
        setServices(servicesData);
        setCategories(categoriesData);
      })
      .catch((error) => {
        if (active) setLoadError(error?.message ?? "Unable to load dashboard data.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const activeServices = services.filter(
    (service) => service.status === "Active",
  ).length;

  const recentServices = services.slice(0, 6);

  const stats = [
    {
      label: "Total Services",
      value: services.length,
      icon: Scissors,
      href: "/admin/services",
    },
    {
      label: "Active Services",
      value: activeServices,
      icon: CheckCircle2,
      href: "/admin/services",
    },
    {
      label: "Categories",
      value: categories.length,
    icon: FolderTree,
      href: "/admin/categories",
    },
    {
      label: "Branches",
      value: branches.length,
      icon: MapPin,
      href: "/admin/branches",
    },
  ];

  if (loadError) {
    return (
      <div className="rounded-2xl border border-[#D7EAE7] bg-white p-10 text-center">
        <h2 className="text-base font-bold text-[#09221F]">Unable to load dashboard</h2>
        <p className="mt-1 text-sm text-[#5F7774]">{loadError}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link
              key={stat.label}
              href={stat.href}
              className="group rounded-2xl border border-[#D7EAE7] bg-white p-5 transition-all hover:-translate-y-0.5 hover:shadow-[0_10px_25px_rgba(23,59,56,0.07)]"
            >
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EAF6F4] text-[#218F87]">
                  <Icon size={19} />
                </div>
                <ArrowRight
                  size={16}
                  className="text-[#B9CFCB] transition-all group-hover:translate-x-0.5 group-hover:text-[#218F87]"
                />
              </div>
              <p className="mt-4 text-2xl font-bold text-[#09221F]">
                {loading ? "—" : stat.value}
              </p>
              <p className="mt-0.5 text-xs font-medium text-[#5F7774]">{stat.label}</p>
            </Link>
          );
        })}
      </div>

      {/* Recent services */}
      <section className="rounded-2xl border border-[#D7EAE7] bg-white">
        <header className="flex items-center justify-between gap-4 border-b border-[#E3EFED] px-5 py-4 sm:px-6">
          <div>
            <h2 className="text-sm font-bold text-[#09221F]">Recent Services</h2>
            <p className="mt-0.5 text-xs text-[#5F7774]">
              First {recentServices.length} services in the catalog
            </p>
          </div>
          <Link
            href="/admin/services"
            className="flex h-8 items-center gap-1.5 rounded-lg border border-[#D7EAE7] bg-white px-3 text-xs font-semibold text-[#173B38] transition-colors hover:bg-[#F3F8F6]"
          >
            View all
            <ArrowRight size={13} />
          </Link>
        </header>

        {loading ? (
          <div className="px-6 py-14 text-center text-sm text-[#5F7774]">
            Loading services…
          </div>
        ) : recentServices.length === 0 ? (
          <AdminEmptyState
            icon={LayoutGrid}
            title="No services yet"
            description="Services you add will appear here."
          />
        ) : (
          <ul className="divide-y divide-[#E3EFED]">
            {recentServices.map((service) => (
              <li
                key={service.id}
                className="flex items-center gap-4 px-5 py-3.5 sm:px-6"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-[#EAF6F4] text-[#218F87]">
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
                  <p className="truncate text-sm font-semibold text-[#09221F]">
                    {service.name}
                  </p>
                  <p className="truncate text-xs text-[#5F7774]">
                    {service.category}
                    {service.subCategory ? ` · ${service.subCategory}` : ""}
                  </p>
                </div>

                <div className="hidden items-center gap-4 text-xs text-[#5F7774] sm:flex">
                  <span className="flex items-center gap-1">
                    <IndianRupee size={12} />
                    {formatPrice(service)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={12} />
                    {service.duration || "—"}
                  </span>
                </div>

                <StatusBadge status={service.status} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
