"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Plus, RotateCcw, TriangleAlert } from "lucide-react";
import {
  getCategories,
  deleteCategory,
  reorderCategory,
} from "@/lib/admin/categories";
import CategoryTable from "@/components/admin/CategoryTable";
import DeleteConfirmModal from "@/components/admin/DeleteConfirmModal";
import { useAdminToast } from "@/components/admin/AdminToast";

export default function AdminCategoriesPage() {
  const toast = useAdminToast();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [movingId, setMovingId] = useState(null);

  const loadCategories = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    try {
      setCategories(await getCategories());
    } catch (error) {
      setLoadError(
        error?.message ?? "Unable to load categories. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const handleConfirmDelete = async () => {
    if (!categoryToDelete) return;
    setDeleting(true);
    try {
      const deleted = await deleteCategory(categoryToDelete.id);
      if (deleted) {
        toast.success("Category deleted successfully.");
      } else {
        toast.error("Category not found.");
      }
      setCategories((current) =>
        current.filter((category) => category.id !== categoryToDelete.id),
      );
    } catch (error) {
      toast.error(
        error.message ?? "Unable to delete category. Please try again.",
      );
    } finally {
      setDeleting(false);
      setCategoryToDelete(null);
    }
  };

  const handleMove = async (category, direction) => {
    setMovingId(category.id);
    try {
      await reorderCategory(category.id, direction);
      setCategories(await getCategories());
      toast.success("Category order updated.");
    } catch (error) {
      toast.error(error.message ?? "Unable to update category order.");
    } finally {
      setMovingId(null);
    }
  };

  if (loadError && !loading) {
    return (
      <div className="rounded-2xl border border-[#D7EAE7] bg-white p-10 text-center">
        <TriangleAlert className="mx-auto h-10 w-10 text-[#B9AE9E]" />
        <h2 className="mt-3 text-base font-bold text-[#09221F]">
          Unable to load categories
        </h2>
        <p className="mt-1 text-sm text-[#5F7774]">{loadError}</p>
        <button
          type="button"
          onClick={loadCategories}
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
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-[#5F7774]">
          {loading
            ? "Loading categories…"
            : `${categories.length} category${categories.length === 1 ? "" : "s"}`}
        </p>

        <Link
          href="/admin/categories/new"
          className="flex h-10 shrink-0 items-center gap-2 rounded-lg bg-[#218F87] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#1B756E]"
        >
          <Plus size={16} />
          Add Category
        </Link>
      </div>

      <div className="overflow-hidden rounded-2xl border border-[#D7EAE7] bg-white">
        {loading ? (
          <div className="px-6 py-14 text-center text-sm text-[#5F7774]">
            Loading categories…
          </div>
        ) : categories.length === 0 ? (
          <div className="px-6 py-14 text-center">
            <p className="text-sm font-semibold text-[#09221F]">
              No categories found.
            </p>
            <p className="mt-1 text-xs text-[#5F7774]">
              Categories you add will appear here.
            </p>
          </div>
        ) : (
          <CategoryTable
            categories={categories}
            onDelete={(category) => setCategoryToDelete(category)}
            onMove={handleMove}
            movingId={movingId}
          />
        )}
      </div>

      <DeleteConfirmModal
        open={Boolean(categoryToDelete)}
        onClose={() => setCategoryToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Delete this category?"
        message={
          categoryToDelete
            ? `"${categoryToDelete.name}" and its sub-category changes will be removed. Services in this category are not deleted. This action cannot be undone.`
            : ""
        }
        deleting={deleting}
      />
    </div>
  );
}
