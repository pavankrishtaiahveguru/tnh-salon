"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, TriangleAlert } from "lucide-react";
import ServiceForm from "@/components/admin/ServiceForm";
import { getServiceById } from "@/lib/admin/services";

export default function EditServicePage({ params }) {
  const { id } = use(params);
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    getServiceById(id)
      .then((data) => {
        if (active) setService(data);
      })
      .catch((err) => {
        if (active) setError(err?.message ?? "Unable to load service.");
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

  if (error || !service) {
    return (
      <div className="rounded-2xl border border-[#D7EAE7] bg-white p-10 text-center">
        <TriangleAlert className="mx-auto h-10 w-10 text-[#B9AE9E]" />
        <h2 className="mt-3 text-base font-bold text-[#09221F]">
          {error ? "Unable to load service" : "Service not found"}
        </h2>
        <p className="mt-1 text-sm text-[#5F7774]">
          {error ||
            "The service you're looking for doesn't exist or was deleted."}
        </p>
        <Link
          href="/admin/services"
          className="mt-5 inline-flex h-10 items-center gap-2 rounded-lg bg-[#218F87] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#1B756E]"
        >
          <ArrowLeft size={15} />
          Back to services
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <Link
        href="/admin/services"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-[#5F7774] transition-colors hover:text-[#218F87]"
      >
        <ArrowLeft size={15} />
        Back to services
      </Link>

      <ServiceForm service={service} />
    </div>
  );
}
