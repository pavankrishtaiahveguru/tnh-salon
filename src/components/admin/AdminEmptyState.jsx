"use client";

// Reusable empty state for admin tables and lists.
export default function AdminEmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-14 text-center">
      {Icon ? (
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#EEF6F4] text-[#218F87]">
          <Icon size={22} />
        </div>
      ) : null}
      <div>
        <p className="text-sm font-bold text-[#09221F]">{title}</p>
        {description ? (
          <p className="mx-auto mt-1 max-w-sm text-xs leading-5 text-[#5F7774]">
            {description}
          </p>
        ) : null}
      </div>
      {action}
    </div>
  );
}
