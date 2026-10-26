"use client";

import { useRef, useState } from "react";
import { UploadCloud, X } from "lucide-react";
import api from "@/lib/api";
import { getSafeMediaUrl } from "@/lib/media";
import { useAdminToast } from "./AdminToast";

// Reusable R2 image upload field.
export default function ImageUpload({
  label = "Image",
  value,
  onChange,
  onUploaded,
  uploadType,
  uploadSlug,
  aspect = "aspect-square",
  hint,
}) {
  const toast = useAdminToast();
  const inputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const previousUploadRef = useRef(null);
  const previewUrl = getSafeMediaUrl(value);

  const handleFile = async (file) => {
    if (!file) return;
    setError("");
    setSuccess(false);

    if (!file.type.startsWith("image/")) {
      setError("Invalid image format.");
      toast.error("Invalid image format.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      const message =
        "Image size is too large. Please upload an image smaller than or equal to 5 MB.";
      setError(message);
      toast.error(message);
      return;
    }

    setUploading(true);
    try {
      const result = await api.uploadImage(file, uploadType, uploadSlug);
      if (!result?.imageUrl)
        throw new Error("Image upload failed. Please try again.");
      const previousObjectKey = previousUploadRef.current;
      previousUploadRef.current = result.objectKey;
      onUploaded?.(result);
      onChange(result.imageUrl);
      setSuccess(true);
      toast.success("Image uploaded successfully.");
      if (previousObjectKey && previousObjectKey !== result.objectKey) {
        try {
          await api.deleteMedia(previousObjectKey);
        } catch {
          setError("The new image was uploaded, but the previous unsaved upload could not be removed.");
          toast.error("The previous unsaved image could not be removed.");
        }
      }
    } catch (uploadError) {
      const message =
        uploadError?.message ?? "Image upload failed. Please try again.";
      setError(
        message,
      );
      toast.error(message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      {label ? (
        <label className="mb-1.5 block text-xs font-semibold text-[#173B38]">
          {label}
        </label>
      ) : null}

      {previewUrl ? (
        <div
          className={`relative w-40 overflow-hidden rounded-xl border border-[#D7EAE7] bg-white ${aspect}`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={previewUrl}
            alt="Preview"
            className="h-full w-full object-cover"
          />
          <button
            type="button"
            onClick={() => {
              const pendingObjectKey = previousUploadRef.current;
              previousUploadRef.current = null;
              onUploaded?.(null);
              onChange("");
              if (pendingObjectKey) {
                api.deleteMedia(pendingObjectKey).catch(() => {
                  setError("The unsaved upload could not be removed.");
                  toast.error("The unsaved image could not be removed.");
                });
              }
            }}
            aria-label="Remove image"
            className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-[#173B38] shadow-sm transition-colors hover:bg-white"
          >
            <X size={14} />
          </button>
        </div>
      ) : (
        <>
          {value ? (
            <p className="mb-2 text-xs font-medium text-amber-700">
              Existing media is unavailable at the configured media domain. Upload a verified replacement.
            </p>
          ) : null}
        <button
          type="button"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
          onDragOver={(event) => {
            event.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(event) => {
            event.preventDefault();
            setIsDragging(false);
            handleFile(event.dataTransfer.files?.[0]);
          }}
          className={`flex w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed px-4 py-8 text-center transition-colors ${
            isDragging
              ? "border-[#218F87] bg-[#EAF6F4]"
              : "border-[#CBE2DE] bg-[#F9FCFB] hover:border-[#218F87] hover:bg-[#F3F8F6]"
          }`}
        >
          <UploadCloud size={22} className="text-[#218F87]" />
          <span className="text-xs font-medium text-[#173B38]">
            {uploading
              ? "Uploading image..."
              : "Click to upload or drag & drop"}
          </span>
          <span className="text-[11px] text-[#5F7774]">PNG, JPG or WebP</span>
        </button>
        </>
      )}

      {hint ? (
        <p className="mt-1.5 text-[11px] text-[#5F7774]">{hint}</p>
      ) : null}
      {error ? (
        <p className="mt-1.5 text-[11px] font-medium text-[#A94B4B]">{error}</p>
      ) : null}
      {success ? (
        <p className="mt-1.5 text-[11px] font-medium text-[#218F87]">
          Image uploaded successfully.
        </p>
      ) : null}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(event) => {
          handleFile(event.target.files?.[0]);
          event.target.value = "";
        }}
      />
    </div>
  );
}
