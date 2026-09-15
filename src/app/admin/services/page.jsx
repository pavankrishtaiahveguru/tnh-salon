"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Search, RotateCcw, TriangleAlert } from "lucide-react";
import {
  getServices,
  deleteService,
  updateServiceStatus,
} from "@/lib/admin/services";
import { getCategories } from "@/lib/admin/categories";
import {
  STATUS_FILTER_OPTIONS,
  BRANCH_FILTER_OPTIONS,
  GENDER_FILTER_OPTIONS,
  SERVICES_PAGE_SIZE,
  branchLabelToIds,
} from "@/lib/admin/config";
import ServiceTable from "@/components/admin/ServiceTable";
import ServiceViewModal from "@/components/admin/ServiceViewModal";
import DeleteConfirmModal from "@/components/admin/DeleteConfirmModal";
import AdminPagination from "@/components/admin/AdminPagination";
import ServicesSkeleton from "@/components/admin/ServicesSkeleton";
import { Select } from "@/components/admin/AdminFields";
import { useAdminToast } from "@/components/admin/AdminToast";

const INITIAL_FILTERS = {
  search: "",
  category: "",
  subCategory: "",
  branch: "",
  gender: "",
  status: "",
};

export default function AdminServicesPage() {
  const toast = useAdminToast();
  const router = useRouter();
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [serviceToDelete, setServiceToDelete] = useState(null);
  const [serviceToView, setServiceToView] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [togglingStatusId, setTogglingStatusId] = useState(null);

  // Load services (and categories for the filter bar) from the backend.
  const loadServices = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    try {
      const [servicesData, categoriesData] = await Promise.all([
        getServices(),
        getCategories(),
      ]);
      setServices(servicesData);
      setCategories(categoriesData);
    } catch (error) {
      setLoadError(
        error?.message ?? "Unable to load services. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadServices();
  }, [loadServices]);

  const refresh = () => loadServices();

  const subCategoryOptions = useMemo(() => {
    const names = new Set();
    for (const service of services) {
      if (filters.category && service.categoryId !== filters.category) continue;
      if (service.subCategory) names.add(service.subCategory);
    }
    return Array.from(names).sort();
  }, [services, filters.category]);

  // All filters combine (search AND category AND sub-category AND branch AND
  // audience AND status). The "both" branch option matches services available
  // at both branches.
  const filtered = useMemo(() => {
    const search = filters.search.trim().toLowerCase();

    return services.filter((service) => {
      if (
        search &&
        !`${service.name} ${service.category} ${service.subCategory}`
          .toLowerCase()
          .includes(search)
      ) {
        return false;
      }
      if (filters.category && service.categoryId !== filters.category) return false;
      if (filters.subCategory && service.subCategory !== filters.subCategory) return false;

      if (filters.branch) {
        const branchIds = service.branchIds ?? branchLabelToIds(service.branch);
        if (filters.branch === "both") {
          if (!(branchIds.includes("indiranagar") && branchIds.includes("sarjapur-road")))
            return false;
        } else if (!branchIds.includes(filters.branch)) {
          return false;
        }
      }

      if (filters.gender && service.gender !== filters.gender) return false;
      if (filters.status && service.status !== filters.status) return false;
      return true;
    });
  }, [services, filters]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / SERVICES_PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginated = useMemo(
    () => filtered.slice((safePage - 1) * SERVICES_PAGE_SIZE, safePage * SERVICES_PAGE_SIZE),
    [filtered, safePage],
  );

  // Every filter change also resets pagination to the first page.
  const setFilter = (field, value) => {
    setFilters((current) => ({ ...current, [field]: value }));
    setPage(1);
  };

  const hasFilters =
    filters.search ||
    filters.category ||
    filters.subCategory ||
    filters.branch ||
    filters.gender ||
    filters.status;

  const clearFilters = () => {
    setFilters(INITIAL_FILTERS);
    setPage(1);
  };

  const handleConfirmDelete = async () => {
    if (!serviceToDelete) return;
    setDeleting(true);
    try {
      const deleted = await deleteService(serviceToDelete.id);
      if (deleted) {
        toast.success("Service deleted successfully.");
      } else {
        toast.error("Service not found.");
      }
      setServices((current) =>
        current.filter((service) => service.id !== serviceToDelete.id),
      );
    } catch (error) {
      toast.error(error.message ?? "Unable to delete service. Please try again.");
    } finally {
      setDeleting(false);
      setServiceToDelete(null);
    }
  };

  const handleToggleStatus = async (service) => {
    const nextStatus = service.status === "Active" ? "Inactive" : "Active";
    setTogglingStatusId(service.id);
    try {
      const updated = await updateServiceStatus(service.id, nextStatus);
      if (updated) {
        toast.success("Service status updated.");
        setServices((current) =>
          current.map((item) => (item.id === service.id ? updated : item)),
        );
      } else {
        toast.error("Service not found.");
      }
    } catch (error) {
      toast.error(error.message ?? "Unable to update service. Please try again.");
    } finally {
      setTogglingStatusId(null);
    }
  };

  if (loadError && !loading) {
    return (
      <div className="rounded-2xl border border-[#D7EAE7] bg-white p-10 text-center">
        <TriangleAlert className="mx-auto h-10 w-10 text-[#B9AE9E]" />
        <h2 className="mt-3 text-base font-bold text-[#09221F]">
          Unable to load services
        </h2>
        <p className="mt-1 text-sm text-[#5F7774]">{loadError}</p>
        <button
          type="button"
          onClick={refresh}
          className="mt-5 inline-flex h-10 items-center gap-2 rounded-lg bg-[#218F87] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#1B756E]"
        >
          <RotateCcw size={15} />
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Page header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#5F7774]">
            {loading
              ? "Loading services…"
              : `${filtered.length} of ${services.length} services`}
          </p>
          <h2 className="mt-1 text-2xl font-bold text-[#09221F]">Services</h2>
        </div>

        <Link
          href="/admin/services/new"
          className="flex h-10 shrink-0 items-center justify-center gap-2 rounded-lg bg-[#218F87] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#1B756E]"
        >
          <Plus size={16} />
          Add service
        </Link>
      </div>

      {/* Search + clear */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative w-full lg:max-w-md">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9DB4B0]" />
          <input
            type="search"
            value={filters.search}
            onChange={(e) => setFilter("search", e.target.value)}
            placeholder="Search by name, category or sub-category"
            className="h-10 w-full rounded-lg border border-[#D7EAE7] bg-white pl-9 pr-3 text-sm outline-none transition-colors placeholder:text-[#9DB4B0] focus:border-[#218F87] focus:ring-2 focus:ring-[#218F87]/15"
          />
        </div>

        {hasFilters ? (
          <button
            type="button"
            onClick={clearFilters}
            className="flex h-10 w-fit items-center gap-1.5 rounded-lg border border-[#D7EAE7] bg-white px-3 text-xs font-semibold text-[#5F7774] transition-colors hover:bg-[#F3F8F6] hover:text-[#173B38]"
          >
            <RotateCcw size={13} />
            Clear filters
          </button>
        ) : null}
      </div>

      {/* Filter bar */}
      <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
        <Select
          value={filters.category}
          onChange={(e) => {
            setFilter("category", e.target.value);
            setFilter("subCategory", "");
          }}
          options={categories.map((c) => ({ value: c.id, label: c.name }))}
          placeholder="All categories"
          showChevron
        />
        <Select
          value={filters.status}
          onChange={(e) => setFilter("status", e.target.value)}
          options={STATUS_FILTER_OPTIONS}
          placeholder="Any status"
          showChevron
        />
        <Select
          value={filters.branch}
          onChange={(e) => setFilter("branch", e.target.value)}
          options={BRANCH_FILTER_OPTIONS}
          placeholder="Any branch"
          showChevron
        />
        <Select
          value={filters.gender}
          onChange={(e) => setFilter("gender", e.target.value)}
          options={GENDER_FILTER_OPTIONS}
          placeholder="Any audience"
          showChevron
        />
      </div>

      {/* Sub-category filter (only when a category is chosen) */}
      {filters.category ? (
        <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
          <Select
            value={filters.subCategory}
            onChange={(e) => setFilter("subCategory", e.target.value)}
            options={subCategoryOptions}
            placeholder="All sub-categories"
          />
        </div>
      ) : null}

      {/* Table card */}
      <div className="overflow-hidden rounded-2xl border border-[#D7EAE7] bg-white">
        {loading ? (
          <ServicesSkeleton />
        ) : (
          <>
            {paginated.length === 0 ? (
              <div className="px-6 py-14 text-center">
                <p className="text-sm font-semibold text-[#09221F]">No services found.</p>
                <p className="mt-1 text-xs text-[#5F7774]">
                  {hasFilters
                    ? "Try adjusting or clearing the filters."
                    : "Services you add will appear here."}
                </p>
              </div>
            ) : (
              <>
                <ServiceTable
                  services={paginated}
                  onView={setServiceToView}
                  onDelete={setServiceToDelete}
                  onToggleStatus={handleToggleStatus}
                  togglingStatusId={togglingStatusId}
                />

                {filtered.length > 0 ? (
                  <AdminPagination
                    page={safePage}
                    pageSize={SERVICES_PAGE_SIZE}
                    totalItems={filtered.length}
                    onPageChange={setPage}
                  />
                ) : null}
              </>
            )}
          </>
        )}
      </div>

      {/* View modal */}
      <ServiceViewModal
        service={serviceToView}
        onClose={() => setServiceToView(null)}
        onEdit={() => {
          const id = serviceToView?.id;
          setServiceToView(null);
          if (id) router.push(`/admin/services/${id}`);
        }}
      />

      {/* Delete confirmation */}
      <DeleteConfirmModal
        open={Boolean(serviceToDelete)}
        onClose={() => setServiceToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Delete this service?"
        message={
          serviceToDelete
            ? `Are you sure you want to delete this service? "${serviceToDelete.name}" will be permanently removed. This action cannot be undone.`
            : ""
        }
        deleting={deleting}
      />
    </div>
  );
}
