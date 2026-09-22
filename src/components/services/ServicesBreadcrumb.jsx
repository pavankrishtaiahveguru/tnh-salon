"use client";

// Clickable breadcrumb for the Services page's three-level navigation:
//   Services > {Category} > {Subcategory}
//
// Parent segments navigate BACK one level and remove only the child filter:
//   - "Services" clears category + subCategory (returns to all services).
//   - "{Category}" removes only the subCategory and stays inside the category.
// The final segment is the ACTIVE level: rendered non-interactively (it is
// where the user already is, so it must not trigger a reload).
//
// Visual design mirrors the previous static breadcrumb markup exactly — the
// only difference is that parent segments are buttons with hover/focus states.
export default function ServicesBreadcrumb({
  categoryName,
  subCategoryName,
  onSelectRoot,
  onSelectCategory,
}) {
  const linkClasses =
    "rounded-sm text-[#718785] transition-colors hover:text-[#218F87] hover:underline hover:underline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#218F87]";

  return (
    <nav
      aria-label="Services breadcrumb"
      className="flex flex-wrap items-center gap-2 text-xs text-[#718785]"
    >
      {/* Level 1: Services — clickable whenever a category is selected. */}
      {categoryName ? (
        <button type="button" onClick={onSelectRoot} className={linkClasses}>
          Services
        </button>
      ) : (
        <span aria-current="true">Services</span>
      )}

      <span aria-hidden="true">&gt;</span>

      {/* Level 2: Category — clickable whenever a subcategory is active. */}
      {subCategoryName ? (
        <button type="button" onClick={onSelectCategory} className={linkClasses}>
          {categoryName}
        </button>
      ) : (
        <span aria-current="true" className="font-semibold text-[#09221F]">
          {categoryName}
        </span>
      )}

      {/* Level 3: Subcategory — active level, never interactive. */}
      {subCategoryName && (
        <>
          <span aria-hidden="true">&gt;</span>
          <span aria-current="true" className="font-semibold text-[#218F87]">
            {subCategoryName}
          </span>
        </>
      )}
    </nav>
  );
}
