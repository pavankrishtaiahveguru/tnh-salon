"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Save, X, Plus, Trash2, Pencil, Check, ArrowUp, ArrowDown } from "lucide-react";
import { SERVICE_STATUSES } from "@/lib/admin/config";
import {
  createCategory,
  updateCategory,
  reorderSubCategories,
} from "@/lib/admin/categories";
import { TextInput, TextArea, Select, FormSection } from "./AdminFields";
import ImageUpload from "./ImageUpload";
import { useAdminToast } from "./AdminToast";

// Reusable category form for /admin/categories/new and /admin/categories/[id].
export default function CategoryForm({ category }) {
  const router = useRouter();
  const toast = useAdminToast();
  const isEdit = Boolean(category);

  const [form, setForm] = useState(() => ({
    name: category?.name ?? "",
    description: category?.description ?? "",
    status: category?.status ?? "Active",
    image: category?.image ?? "",
    // Keep the full { id, name } objects — the backend diff-syncs by id so
    // existing sub-categories keep their DB rows (and their services'
    // sub_category_id links) when the category is saved. `dbId` (the raw
    // numeric sub_categories.id) is carried separately for reordering —
    // undefined for a sub-category the admin just added and hasn't saved yet.
    subCategories: (category?.subCategories ?? []).map((sub) => ({
      id: sub.id,
      dbId: sub.dbId,
      name: sub.name,
    })),
  }));
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  // Inline sub-category editing state.
  const [newSubName, setNewSubName] = useState("");
  const [editingIndex, setEditingIndex] = useState(null);
  const [editingName, setEditingName] = useState("");

  // ---- Up/Down sub-category reordering ----
  // Only sub-categories that already exist in the DB (have a `dbId`) can be
  // moved — a just-added, unsaved entry has no id yet for the reorder
  // endpoint to target, and reordering only makes sense once the category
  // itself has been created (isEdit).
  const canReorder = isEdit;
  const [isReordering, setIsReordering] = useState(false);
  // Guards against a stale response from an earlier reorder overwriting the
  // result of a newer one — only the most recent request may apply its
  // outcome (toast + local state). The buttons are also disabled while
  // isReordering is true, so in practice this is a second line of defense.
  const reorderTokenRef = useRef(0);

  const moveSubCategory = async (index, direction) => {
    if (!canReorder || isReordering) return;
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= form.subCategories.length) return;

    const previous = form.subCategories;
    const sub = previous[index];
    const targetSub = previous[targetIndex];
    // Only swap two PERSISTED rows — an unsaved entry (no dbId) has nothing
    // for the reorder endpoint to target.
    if (sub?.dbId == null || targetSub?.dbId == null) return;

    const next = [...previous];
    [next[index], next[targetIndex]] = [next[targetIndex], next[index]];
    setField("subCategories", next); // 1. update the UI immediately

    const items = next
      .filter((s) => s.dbId != null)
      .map((s, position) => ({ id: s.dbId, displayOrder: position }));

    const token = ++reorderTokenRef.current;
    setIsReordering(true);
    try {
      await reorderSubCategories(category.id, items); // 2. persist to the DB
      if (reorderTokenRef.current === token) {
        toast.success("Subcategory order updated");
      }
    } catch (error) {
      if (reorderTokenRef.current === token) {
        setField("subCategories", previous); // restore — never show an
        // order that failed to save
        toast.error(
          error?.message ??
            "Failed to update subcategory order. Please try again.",
        );
      }
    } finally {
      if (reorderTokenRef.current === token) setIsReordering(false);
    }
  };

  const setField = (field, value) =>
    setForm((current) => ({ ...current, [field]: value }));

  const addSubCategory = () => {
    const name = newSubName.trim();
    if (!name) return;
    if (
      form.subCategories.some(
        (sub) => sub.name.toLowerCase() === name.toLowerCase(),
      )
    ) {
      toast.error("This sub-category already exists.");
      return;
    }
    // New entries have no id yet — the backend INSERTs them.
    setField("subCategories", [...form.subCategories, { name }]);
    setNewSubName("");
  };

  const startRename = (index) => {
    setEditingIndex(index);
    setEditingName(form.subCategories[index]?.name ?? "");
  };

  const commitRename = () => {
    if (editingIndex === null) return;
    const name = editingName.trim();
    if (!name) {
      setEditingIndex(null);
      return;
    }
    setField(
      "subCategories",
      form.subCategories.map((sub, i) =>
        i === editingIndex ? { ...sub, name } : sub,
      ),
    );
    setEditingIndex(null);
  };

  const removeSubCategory = (index) => {
    setField(
      "subCategories",
      form.subCategories.filter((_, i) => i !== index),
    );
  };

  const validate = () => {
    const next = {};
    if (!form.name.trim()) next.name = "Category name is required.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validate()) return;

    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        description: form.description,
        status: form.status,
        image: form.image,
        subCategories: form.subCategories,
      };

      if (isEdit) {
        await updateCategory(category.id, payload);
        toast.success("Category updated successfully.");
      } else {
        await createCategory(payload);
        toast.success("Category created successfully.");
      }
      router.push("/admin/categories");
      router.refresh();
    } catch (error) {
      toast.error(error.message ?? "Something went wrong.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <FormSection
        title="Category Details"
        description="Basic information for this service category."
      >
        <TextInput
          label="Category Name"
          required
          value={form.name}
          onChange={(e) => setField("name", e.target.value)}
          placeholder="e.g. Facials"
          error={errors.name}
        />

        <TextArea
          label="Description"
          value={form.description}
          onChange={(e) => setField("description", e.target.value)}
          placeholder="Short description shown on the customer site…"
          rows={3}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <TextInput
            label="Category Slug"
            value={
              form.name
                ? form.name
                    .toLowerCase()
                    .replace(/[^a-z0-9]+/g, "-")
                    .replace(/(^-|-$)/g, "")
                : ""
            }
            readOnly
            hint="Auto-generated from the category name."
          />
          <Select
            label="Status"
            value={form.status}
            onChange={(e) => setField("status", e.target.value)}
            options={SERVICE_STATUSES}
            showChevron
          />
        </div>

        <ImageUpload
          label="Category Image"
          value={form.image}
          onChange={(value) => setField("image", value)}
          uploadType="categories"
          uploadSlug={form.name}
          hint="Shown beside the category name across the customer site."
        />
      </FormSection>

      <FormSection
        title="Sub-categories"
        description="Group services within this category (e.g. Facials → Basic Facials, Advanced Facials)."
      >
        <div className="flex gap-2">
          <input
            value={newSubName}
            onChange={(e) => setNewSubName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addSubCategory();
              }
            }}
            placeholder="New sub-category name"
            className="h-10 w-full rounded-lg border border-[#D7EAE7] bg-white px-3 text-sm outline-none transition-colors placeholder:text-[#9DB4B0] focus:border-[#218F87] focus:ring-2 focus:ring-[#218F87]/15"
          />
          <button
            type="button"
            onClick={addSubCategory}
            className="flex h-10 shrink-0 items-center gap-1.5 rounded-lg bg-[#218F87] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#1B756E]"
          >
            <Plus size={15} />
            Add
          </button>
        </div>

        {form.subCategories.length === 0 ? (
          <p className="rounded-lg bg-[#F3F8F6] px-3 py-2.5 text-xs text-[#5F7774]">
            No sub-categories yet.
          </p>
        ) : (
          <ul className="space-y-2">
            {form.subCategories.map((sub, index) => {
              const isPersisted = sub.dbId != null;
              const prevPersisted = index > 0 && form.subCategories[index - 1]?.dbId != null;
              const nextPersisted =
                index < form.subCategories.length - 1 &&
                form.subCategories[index + 1]?.dbId != null;
              const canMoveUp =
                canReorder && isPersisted && prevPersisted && !isReordering;
              const canMoveDown =
                canReorder && isPersisted && nextPersisted && !isReordering;
              return (
                <li
                  key={sub.dbId ?? `${sub.id}-${index}`}
                  className="flex items-center justify-between gap-3 rounded-lg border border-[#D7EAE7] bg-[#F9FCFB] px-3 py-2 transition-colors"
                >
                {editingIndex === index ? (
                  <>
                    <input
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          commitRename();
                        }
                      }}
                      className="h-8 w-full rounded-md border border-[#D7EAE7] bg-white px-2.5 text-sm outline-none focus:border-[#218F87]"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={commitRename}
                      aria-label="Save sub-category name"
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-[#218F87] hover:bg-[#EAF6F4]"
                    >
                      <Check size={15} />
                    </button>
                  </>
                ) : (
                  <>
                    <span className="flex min-w-0 items-center gap-3">
                      {canReorder && (
                        <span className="flex shrink-0 flex-col gap-1">
                          <button
                            type="button"
                            disabled={!canMoveUp}
                            onClick={() => moveSubCategory(index, "up")}
                            aria-label={`Move ${sub.name} up`}
                            className="flex h-7 w-7 items-center justify-center rounded-md border border-[#D7EAE7] text-[#3E5450] transition-colors hover:bg-[#EAF6F4] disabled:cursor-not-allowed disabled:opacity-35"
                          >
                            <ArrowUp size={13} />
                          </button>
                          <button
                            type="button"
                            disabled={!canMoveDown}
                            onClick={() => moveSubCategory(index, "down")}
                            aria-label={`Move ${sub.name} down`}
                            className="flex h-7 w-7 items-center justify-center rounded-md border border-[#D7EAE7] text-[#3E5450] transition-colors hover:bg-[#EAF6F4] disabled:cursor-not-allowed disabled:opacity-35"
                          >
                            <ArrowDown size={13} />
                          </button>
                        </span>
                      )}
                      <span className="truncate text-sm text-[#09221F]">
                        {sub.name}
                      </span>
                    </span>
                    <span className="flex shrink-0 items-center gap-1">
                      <button
                        type="button"
                        onClick={() => startRename(index)}
                        aria-label={`Rename ${sub.name}`}
                        className="flex h-8 w-8 items-center justify-center rounded-md text-[#3E5450] hover:bg-[#EAF6F4] hover:text-[#218F87]"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeSubCategory(index)}
                        aria-label={`Remove ${sub.name}`}
                        className="flex h-8 w-8 items-center justify-center rounded-md text-[#3E5450] hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 size={14} />
                      </button>
                    </span>
                  </>
                )}
                </li>
              );
            })}
          </ul>
        )}
      </FormSection>

      {/* Actions */}
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex h-10 items-center justify-center gap-2 rounded-lg border border-[#D7EAE7] bg-white px-5 text-sm font-semibold text-[#173B38] transition-colors hover:bg-[#F3F8F6]"
        >
          <X size={15} />
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving}
          className="flex h-10 items-center justify-center gap-2 rounded-lg bg-[#218F87] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#1B756E] disabled:opacity-60"
        >
          <Save size={15} />
          {saving ? "Saving…" : isEdit ? "Update Category" : "Create Category"}
        </button>
      </div>
    </form>
  );
}
