"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Save, X, Plus, Trash2 } from "lucide-react";
import {
  GENDERS,
  SERVICE_STATUSES,
  PRICING_TYPES,
  branchLabelToIds,
} from "@/lib/admin/config";
import { getCategories } from "@/lib/admin/categories";
import { getBranches } from "@/lib/admin/branches";
import { createService, updateService } from "@/lib/admin/services";
import { TextInput, TextArea, Select, FormSection } from "./AdminFields";
import BranchSelector from "./BranchSelector";
import ImageUpload from "./ImageUpload";
import { useAdminToast } from "./AdminToast";

// Reusable service form for /admin/services/new and /admin/services/[id].
export default function ServiceForm({ service }) {
  const router = useRouter();
  const toast = useAdminToast();
  const isEdit = Boolean(service);

  const [categories, setCategories] = useState([]);
  const [branches, setBranches] = useState([]);
  const [form, setForm] = useState(() => ({
    name: service?.name ?? "",
    categoryId: service?.categoryId ?? "",
    subCategory: service?.subCategory ?? "",
    gender: service?.gender ?? "Unisex",
    description: service?.description ?? "",
    pricingType: service?.pricingType ?? "fixed",
    price: service?.price ?? "",
    priceRange: service?.priceRange ?? "",
    variants: service?.variants ?? [],
    duration: service?.duration ?? "",
    branchIds: service?.branchIds ?? branchLabelToIds(service?.branch),
    status: service?.status ?? "Active",
    image: service?.image ?? "",
  }));

  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState("");

  // Categories come from the backend (they are needed before editing an
  // existing service's category/sub-category selections).
  useEffect(() => {
    let active = true;
    Promise.all([getCategories(), getBranches()])
      .then(([categoryData, branchData]) => {
        if (!active) return;
        setCategories(categoryData);
        setBranches(branchData);
      })
      .catch((error) => {
        if (active)
          setLoadError(error?.message ?? "Unable to load categories.");
      });
    return () => {
      active = false;
    };
  }, []);

  const setField = (field, value) =>
    setForm((current) => ({ ...current, [field]: value }));

  const handleCategoryChange = (categoryId) => {
    setForm((current) => ({
      ...current,
      categoryId,
      subCategory: "",
    }));
  };

  const addVariant = () =>
    setForm((current) => ({
      ...current,
      variants: [...current.variants, { label: "", price: "" }],
    }));

  const updateVariant = (index, field, value) =>
    setForm((current) => ({
      ...current,
      variants: current.variants.map((variant, i) =>
        i === index ? { ...variant, [field]: value } : variant,
      ),
    }));

  const removeVariant = (index) =>
    setForm((current) => ({
      ...current,
      variants: current.variants.filter((_, i) => i !== index),
    }));

  const validate = () => {
    const next = {};
    if (!form.name.trim()) next.name = "Service name is required.";
    if (!form.categoryId) next.categoryId = "Category is required.";
    if (
      (form.pricingType === "fixed" || form.pricingType === "from") &&
      !form.price
    ) {
      next.price = "A starting price is required.";
    }
    if (form.pricingType === "size" || form.pricingType === "variant") {
      const valid = form.variants.filter((v) => v.label && v.price);
      if (valid.length === 0) {
        next.variants = "Add at least one variant with label and price.";
      }
    }
    if (form.branchIds.length === 0) {
      next.branchIds = "Select at least one branch.";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validate()) {
      toast.error("Please fix the highlighted fields.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...form,
        price: form.price === "" ? null : Number(form.price),
        priceRange: form.priceRange || null,
        variants: form.variants
          .filter((v) => v.label && v.price)
          .map((v) => ({
            label: v.label,
            price: Number(v.price),
          })),
      };

      if (isEdit) {
        await updateService(service.id, payload);
        toast.success("Service updated successfully.");
      } else {
        await createService(payload);
        toast.success("Service added successfully.");
      }
      router.push("/admin/services");
      router.refresh();
    } catch (error) {
      toast.error(error.message ?? "Something went wrong.");
    } finally {
      setSaving(false);
    }
  };

  const showVariants =
    form.pricingType === "size" || form.pricingType === "variant";

  const handlePricingTypeChange = (pricingType) => {
    setForm((current) => ({
      ...current,
      pricingType,
      variants:
        (pricingType === "size" || pricingType === "variant") &&
        current.variants.length === 0
          ? ["S", "M", "L"].map((label) => ({ label, price: "" }))
          : current.variants,
    }));
    setErrors((current) => ({
      ...current,
      price: undefined,
      variants: undefined,
    }));
  };

  // Sub-category options follow the selected category (from the backend).
  const subCategoryOptions = (() => {
    const category = categories.find((c) => c.id === form.categoryId);
    if (!category) return [];
    return category.subCategories.map((sub) => sub.name);
  })();

  if (loadError) {
    return (
      <div className="rounded-2xl border border-[#D7EAE7] bg-white p-10 text-center">
        <h2 className="text-base font-bold text-[#09221F]">
          Unable to load categories
        </h2>
        <p className="mt-1 text-sm text-[#5F7774]">{loadError}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Basic Information */}
      <FormSection
        title="Basic Information"
        description="What is this service and how is it classified?"
      >
        <TextInput
          label="Service Name"
          required
          value={form.name}
          onChange={(e) => setField("name", e.target.value)}
          placeholder="e.g. Hydra facial boost"
          error={errors.name}
        />

        <div className="grid gap-4 sm:grid-cols-3">
          <Select
            label="Category"
            required
            value={form.categoryId}
            onChange={(e) => handleCategoryChange(e.target.value)}
            options={categories.map((c) => ({ value: c.id, label: c.name }))}
            placeholder="Select category"
            error={errors.categoryId}
            showChevron
          />
          <Select
            label="Sub-category"
            value={form.subCategory}
            onChange={(e) => setField("subCategory", e.target.value)}
            options={subCategoryOptions}
            placeholder="Select sub-category"
            showChevron
          />
          <Select
            label="Suitable for"
            value={form.gender}
            onChange={(e) => setField("gender", e.target.value)}
            options={GENDERS}
            showChevron
          />
        </div>

        <TextArea
          label="Description"
          value={form.description}
          onChange={(e) => setField("description", e.target.value)}
          placeholder="Short customer-facing description of the service…"
        />
      </FormSection>

      {/* Pricing */}
      <FormSection
        title="Pricing"
        description="Fixed price, size-based pricing or custom variants."
      >
        <div>
          <div className="mb-2 flex items-center gap-2">
            <label className="text-xs font-semibold text-[#173B38]">
              Price type
            </label>
            <span className="text-[11px] text-[#7A8D8A]">
              changes which fields you fill in below
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {PRICING_TYPES.map((option) => {
              const selected = form.pricingType === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handlePricingTypeChange(option.value)}
                  className={`rounded-full border px-4 py-2 text-xs font-medium transition-colors sm:text-sm ${
                    selected
                      ? "border-[#3DD4C8] bg-[#3DD4C8] font-bold text-[#09221F]"
                      : "border-[#D7EAE7] bg-white text-[#173B38] hover:border-[#3DD4C8]"
                  }`}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>

        {!showVariants ? (
          <TextInput
            label={
              form.pricingType === "from" ? "Starting price (₹)" : "Price (₹)"
            }
            required
            type="number"
            min="0"
            value={form.price}
            onChange={(e) => setField("price", e.target.value)}
            placeholder={form.pricingType === "from" ? "e.g. 500" : "e.g. 1500"}
            error={errors.price}
          />
        ) : (
          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="text-xs font-semibold text-[#173B38]">
                {form.pricingType === "size" ? "Price tiers" : "Variants"}
              </label>
              <button
                type="button"
                onClick={addVariant}
                className="flex items-center gap-1 rounded-lg border border-[#D7EAE7] bg-white px-2.5 py-1.5 text-xs font-semibold text-[#218F87] transition-colors hover:bg-[#EAF6F4]"
              >
                <Plus size={13} />
                Add Variant
              </button>
            </div>

            {errors.variants ? (
              <p className="mb-2 text-xs font-medium text-red-500">
                {errors.variants}
              </p>
            ) : null}

            {form.variants.length === 0 ? (
              <p className="rounded-lg bg-[#F3F8F6] px-3 py-2.5 text-xs text-[#5F7774]">
                No variants yet. Add at least one (e.g. Basic ₹500, Premium
                ₹800).
              </p>
            ) : (
              <div className="space-y-2">
                {form.variants.map((variant, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-[1fr_110px_auto] items-center gap-2 rounded-lg border border-[#D7EAE7] bg-[#F9FCFB] p-2"
                  >
                    <input
                      value={variant.label}
                      onChange={(e) =>
                        updateVariant(index, "label", e.target.value)
                      }
                      placeholder="Label (e.g. Premium)"
                      className="w-full rounded-md border border-[#D7EAE7] bg-white px-2.5 py-1.5 text-sm outline-none focus:border-[#218F87]"
                    />
                    <input
                      value={variant.price}
                      onChange={(e) =>
                        updateVariant(index, "price", e.target.value)
                      }
                      type="number"
                      min="0"
                      placeholder="₹ Price"
                      className="w-full rounded-md border border-[#D7EAE7] bg-white px-2.5 py-1.5 text-sm outline-none focus:border-[#218F87]"
                    />
                    <button
                      type="button"
                      onClick={() => removeVariant(index)}
                      aria-label={`Remove variant ${index + 1}`}
                      className="flex h-8 w-8 items-center justify-center rounded-md text-[#8A7F70] transition-colors hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <TextInput
          label="Price Range (display)"
          value={form.priceRange ?? ""}
          onChange={(e) => setField("priceRange", e.target.value)}
          placeholder="e.g. ₹500 – ₹1200 (optional display text)"
          hint="Optional. Usually auto-derived from variants on the customer site."
        />
      </FormSection>

      {/* Details */}
      <FormSection
        title="Details"
        description="Appointment timing and branch availability."
      >
        <TextInput
          label="Duration"
          value={form.duration}
          onChange={(e) => setField("duration", e.target.value)}
          placeholder="e.g. 60–75 min"
        />
        <BranchSelector
          value={form.branchIds}
          branches={branches}
          onChange={(value) => setField("branchIds", value)}
        />
        {errors.branchIds ? (
          <p className="text-xs font-medium text-red-500">{errors.branchIds}</p>
        ) : null}
        <p className="text-[11px] text-[#5F7774]">
          Internally stored as branch IDs so the backend can persist
          availability per branch.
        </p>
      </FormSection>

      {/* Status & Image */}
      <FormSection
        title="Status & Image"
        description="Visibility on the customer site and service image."
      >
        <Select
          label="Status"
          value={form.status}
          onChange={(e) => setField("status", e.target.value)}
          options={SERVICE_STATUSES}
          showChevron
        />

        <ImageUpload
          label="Service Image"
          value={form.image}
          onChange={(value) => setField("image", value)}
          uploadType="services"
          uploadSlug={form.name}
        />
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
          {saving ? "Saving…" : isEdit ? "Update Service" : "Create Service"}
        </button>
      </div>
    </form>
  );
}
