"use client";

import { ChevronDown } from "lucide-react";

// Shared form field primitives for admin forms.

const inputClasses =
  "w-full rounded-lg border border-[#D7EAE7] bg-white px-3 py-2 text-sm text-[#09221F] placeholder-[#9DB4B0] outline-none transition-colors focus:border-[#218F87] focus:ring-2 focus:ring-[#218F87]/15";

export function FieldLabel({ children, required }) {
  return (
    <label className="mb-1.5 block text-xs font-semibold text-[#173B38]">
      {children}
      {required ? <span className="ml-0.5 text-[#218F87]">*</span> : null}
    </label>
  );
}

export function TextInput({ label, required, hint, ...props }) {
  return (
    <div>
      {label ? <FieldLabel required={required}>{label}</FieldLabel> : null}
      <input className={inputClasses} {...props} />
      {hint ? <p className="mt-1 text-[11px] text-[#5F7774]">{hint}</p> : null}
    </div>
  );
}

export function TextArea({ label, required, hint, rows = 4, ...props }) {
  return (
    <div>
      {label ? <FieldLabel required={required}>{label}</FieldLabel> : null}
      <textarea rows={rows} className={`${inputClasses} resize-y`} {...props} />
      {hint ? <p className="mt-1 text-[11px] text-[#5F7774]">{hint}</p> : null}
    </div>
  );
}

export function Select({ label, required, hint, options, placeholder, showChevron, ...props }) {
  return (
    <div>
      {label ? <FieldLabel required={required}>{label}</FieldLabel> : null}
      <div className="relative">
        <select
          className={`${inputClasses} appearance-none ${showChevron ? "pr-8" : ""}`}
          {...props}
        >
          {placeholder ? <option value="">{placeholder}</option> : null}
          {(options ?? []).map((option) => {
            const value = typeof option === "string" ? option : option.value;
            const label = typeof option === "string" ? option : option.label;
            return (
              <option key={value} value={value}>
                {label}
              </option>
            );
          })}
        </select>
        {showChevron ? (
          <ChevronDown
            size={14}
            aria-hidden="true"
            className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[#5F7774]"
          />
        ) : null}
      </div>
      {hint ? <p className="mt-1 text-[11px] text-[#5F7774]">{hint}</p> : null}
    </div>
  );
}

export function Toggle({ checked, onChange, label, description }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex items-center justify-between gap-4 rounded-lg border border-[#D7EAE7] bg-white px-3 py-2.5 text-left transition-colors hover:bg-[#F9FCFB]"
    >
      <span>
        <span className="block text-sm font-medium text-[#09221F]">{label}</span>
        {description ? (
          <span className="mt-0.5 block text-[11px] text-[#5F7774]">{description}</span>
        ) : null}
      </span>
      <span
        className={`relative h-5.5 w-10 shrink-0 rounded-full transition-colors ${checked ? "bg-[#218F87]" : "bg-[#D3E2DF]"}`}
      >
        <span
          className={`absolute top-0.5 h-4.5 w-4.5 rounded-full bg-white shadow transition-all ${
            checked ? "left-[1.375rem]" : "left-0.5"
          }`}
        />
      </span>
    </button>
  );
}

export function FormSection({ title, description, children }) {
  return (
    <section className="rounded-2xl border border-[#D7EAE7] bg-white p-5 sm:p-6">
      <header className="mb-4">
        <h3 className="text-sm font-bold text-[#09221F]">{title}</h3>
        {description ? (
          <p className="mt-0.5 text-xs text-[#5F7774]">{description}</p>
        ) : null}
      </header>
      <div className="space-y-4">{children}</div>
    </section>
  );
}
