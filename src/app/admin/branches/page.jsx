"use client";

import { useEffect, useState } from "react";
import { Pencil, MapPin, Phone, Mail, Clock, Building2 } from "lucide-react";
import { getBranches, updateBranch } from "@/lib/admin/branches";
import AdminModal from "@/components/admin/AdminModal";
import StatusBadge from "@/components/admin/StatusBadge";
import { TextInput, TextArea, Toggle } from "@/components/admin/AdminFields";
import { useAdminToast } from "@/components/admin/AdminToast";

function BranchForm({ branch, onSaved }) {
  const toast = useAdminToast();
  const [form, setForm] = useState(() => ({
    name: branch.name,
    phone: branch.phone,
    email: branch.email,
    address: branch.address,
    hoursWeekdays: branch.hours.weekdays,
    hoursWeekends: branch.hours.weekends,
    active: branch.active,
  }));
  const [saving, setSaving] = useState(false);

  const setField = (field, value) =>
    setForm((current) => ({ ...current, [field]: value }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      await updateBranch(branch.id, {
        name: form.name,
        phone: form.phone,
        email: form.email,
        address: form.address,
        hours: { weekdays: form.hoursWeekdays, weekends: form.hoursWeekends },
        active: form.active,
      });
      toast.success("Branch details updated successfully.");
      onSaved();
    } catch (error) {
      toast.error(error.message ?? "Failed to update branch.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <TextInput
        label="Branch Name"
        required
        value={form.name}
        onChange={(e) => setField("name", e.target.value)}
      />
      <TextInput
        label="Phone"
        value={form.phone}
        onChange={(e) => setField("phone", e.target.value)}
      />
      <TextInput
        label="Email"
        type="email"
        value={form.email}
        onChange={(e) => setField("email", e.target.value)}
      />
      <TextArea
        label="Address"
        rows={3}
        value={form.address}
        onChange={(e) => setField("address", e.target.value)}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <TextInput
          label="Weekday Hours"
          value={form.hoursWeekdays}
          onChange={(e) => setField("hoursWeekdays", e.target.value)}
          placeholder="e.g. 11:00 AM to 8:30 PM"
        />
        <TextInput
          label="Weekend Hours"
          value={form.hoursWeekends}
          onChange={(e) => setField("hoursWeekends", e.target.value)}
          placeholder="e.g. 10:30 AM to 8:30 PM"
        />
      </div>
      <Toggle
        checked={form.active}
        onChange={(value) => setField("active", value)}
        label="Branch active"
        description="Inactive branches can be hidden from the customer site."
      />

      <div className="flex justify-end pt-2">
        <button
          type="submit"
          disabled={saving}
          className="flex h-10 items-center gap-2 rounded-lg bg-[#218F87] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#1B756E] disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save Changes"}
        </button>
      </div>
    </form>
  );
}

export default function AdminBranchesPage() {
  const toast = useAdminToast();
  const [editingBranch, setEditingBranch] = useState(null);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getBranches()
      .then(setBranches)
      .catch((error) =>
        toast.error(error.message ?? "Failed to load branches."),
      )
      .finally(() => setLoading(false));
  }, [toast]);

  const handleSaved = () => {
    getBranches()
      .then(setBranches)
      .catch((error) =>
        toast.error(error.message ?? "Failed to load branches."),
      )
      .finally(() => setEditingBranch(null));
  };

  return (
    <div className="space-y-5">
      <p className="text-sm text-[#5F7774]">{branches.length} branches</p>

      <div className="grid gap-4 lg:grid-cols-2">
        {loading ? (
          <p className="text-sm text-[#5F7774]">Loading branches…</p>
        ) : (
          branches.map((branch) => (
            <article
              key={branch.id}
              className="rounded-2xl border border-[#D7EAE7] bg-white p-5 sm:p-6"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#EAF6F4] text-[#218F87]">
                    <Building2 size={19} />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-[#09221F]">
                      {branch.name}
                    </h2>
                    <p className="text-xs text-[#5F7774]">
                      Branch ID: {branch.id}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <StatusBadge status={branch.active ? "Active" : "Inactive"} />
                  <button
                    type="button"
                    onClick={() => setEditingBranch(branch)}
                    aria-label={`Edit ${branch.name}`}
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#D7EAE7] text-[#3E5450] transition-colors hover:bg-[#EAF6F4] hover:text-[#218F87]"
                  >
                    <Pencil size={15} />
                  </button>
                </div>
              </div>

              <dl className="mt-5 space-y-3 text-sm">
                <div className="flex items-start gap-2.5">
                  <MapPin
                    size={15}
                    className="mt-0.5 shrink-0 text-[#218F87]"
                  />
                  <dd className="text-[#3E5450]">{branch.address}</dd>
                </div>
                <div className="flex items-center gap-2.5">
                  <Phone size={15} className="shrink-0 text-[#218F87]" />
                  <dd className="text-[#3E5450]">{branch.phone}</dd>
                </div>
                <div className="flex items-center gap-2.5">
                  <Mail size={15} className="shrink-0 text-[#218F87]" />
                  <dd className="break-all text-[#3E5450]">{branch.email}</dd>
                </div>
                <div className="flex items-start gap-2.5">
                  <Clock size={15} className="mt-0.5 shrink-0 text-[#218F87]" />
                  <dd className="text-[#3E5450]">
                    <span className="block">
                      <span className="font-medium text-[#09221F]">
                        Mon–Fri:
                      </span>{" "}
                      {branch.hours.weekdays}
                    </span>
                    <span className="block">
                      <span className="font-medium text-[#09221F]">
                        Sat–Sun:
                      </span>{" "}
                      {branch.hours.weekends}
                    </span>
                  </dd>
                </div>
              </dl>
            </article>
          ))
        )}
      </div>

      <AdminModal
        open={Boolean(editingBranch)}
        onClose={() => setEditingBranch(null)}
        title={`Edit ${editingBranch?.name ?? ""}`}
        subtitle="These details appear across the customer website."
      >
        {editingBranch ? (
          <BranchForm branch={editingBranch} onSaved={handleSaved} />
        ) : null}
      </AdminModal>
    </div>
  );
}
