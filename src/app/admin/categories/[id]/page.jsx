"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, TriangleAlert } from "lucide-react";
import CategoryForm from "@/components/admin/CategoryForm";
import { getCategoryById } from "@/lib/admin/categories";

export default function EditCategoryPage({ params }) {
  const { id } = use(params);
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    getCategoryById(id)
      .then((data) => {
        if (active) setCategory(data);
      })
      .catch((err) => {
        if (active) setError(err?.message ?? "Unable to load category.");
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
        <TriangleAlert className="mx-auto h-10 w-10 text-[#B9AE9E]" />
        <h2 className="mt-3 text-base font-bold text-[#09221F]">
          {error ? "Unable to load category" : "Category not found"}
        </h2>
        <p className="mt-1 text-sm text-[#5F7774]">
          {error ||
            "The category you're looking for doesn't exist or was deleted."}
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

      <CategoryForm category={category} />
    </div>
  );
}
