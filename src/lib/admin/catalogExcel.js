// ==================================================
// Excel <-> JSON conversion layer for Admin Import & Export
// ==================================================
// The website's data architecture stays JSON end-to-end:
//   Export:  MySQL -> existing API (JSON) -> [this module] -> .xlsx download
//   Import:  .xlsx upload -> [this module] -> JSON catalog payload -> existing
//            backend /api/catalog/import (unchanged) -> MySQL
//
// Workbook layout (mirrors the original The Nail Hue reference Excel that
// generated src/data/services.js):
//   "Categories"    — one row per category (row order = display order)
//   "SubCategories" — one row per sub-category (never merged into one value)
//   "Services"      — one row per service, reference-Excel service layout
//   "Branches"      — one row per branch (restores branch relationships)
//   "Price Sizes"   — one row per size/variant option (size & variant pricing)
//
// Everything is generated dynamically from the catalog JSON — no hardcoded
// names. Round-trip safe: exporting then importing reproduces the same data.
import ExcelJS from "exceljs";

// ---------- Shared column definitions (single source of truth) ----------

export const CATEGORY_COLUMNS = [
  "ID",
  "Category",
  "Description",
  "Icon",
  "Order",
  "Image",
  "Image URL",
  "Status",
];

export const SUBCATEGORY_COLUMNS = ["Category", "Sub-category", "Sub-order"];

export const SERVICE_COLUMNS = [
  "ID",
  "Category",
  "Sub-category",
  "Service Name",
  "Gender",
  "Description",
  "Pricing Type",
  "Price",
  "Price Range",
  "Duration",
  "Branches",
  "Status",
  "Image",
  "Image URL",
  "Display Order",
];

export const BRANCH_COLUMNS = [
  "ID",
  "Name",
  "Phone",
  "Email",
  "Address",
  "Map URL",
  "Map Embed URL",
  "Title",
  "Subtitle",
  "Hours",
  "About Title",
  "Status",
];

export const SIZE_COLUMNS = [
  "Service ID",
  "Service Name",
  "Label",
  "Price",
  "Duration",
  "Sort Order",
];

// ---------- Shared helpers ----------

const HEADER_FILL = { type: "pattern", pattern: "solid", fgColor: { argb: "FF218F87" } };
const HEADER_FONT = { bold: true, color: { argb: "FFFFFFFF" }, size: 11 };

// ExcelJS cell values can be primitives, rich-text objects, formula results
// or Dates — normalise everything to plain trimmed text.
export function cellText(value) {
  if (value === null || value === undefined) return "";
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  if (typeof value === "object") {
    if (Array.isArray(value.richText)) {
      return value.richText.map((part) => part.text ?? "").join("").trim();
    }
    if (value.text !== undefined) return String(value.text).trim();
    if (value.result !== undefined && value.result !== null) {
      return String(value.result).trim();
    }
    return "";
  }
  return String(value).trim();
}

export function parseNumber(value) {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }
  if (typeof value === "string") {
    const cleaned = value.replace(/[₹,\s]/g, "");
    if (!cleaned) return null;
    const parsed = Number(cleaned);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

export function slugifyValue(value) {
  return String(value ?? "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export const statusFromBoolean = (isActive) =>
  isActive === false ? "Inactive" : "Active";

export function booleanFromStatus(value) {
  const text = cellText(value).toLowerCase();
  if (!text) return true;
  return text !== "inactive" && text !== "hidden" && text !== "0" && text !== "no";
}

// Variants live in the "Price Sizes" sheet; the Services sheet also carries a
// readable summary ("S:450, M:550") for admins who prefer to edit there.
export function formatVariants(variants) {
  return (variants ?? [])
    .map((variant) => `${variant.label}:${variant.price}`)
    .join(", ");
}

export function parseVariants(value) {
  const text = cellText(value);
  if (!text) return [];
  return text
    .split(/[,;\n]/)
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => {
      const match = part.match(/^(.+?)\s*[:\-–]\s*(\d[\d,]*(?:\.\d+)?)$/);
      if (!match) return null;
      const label = match[1].trim();
      const price = parseNumber(match[2]);
      if (!label || price === null) return null;
      return { label, price };
    })
    .filter(Boolean);
}

// JSON hours object <-> compact text ("Mon-Sat: 9AM-8PM, Sun: 10AM-6PM").
export function formatHours(hours) {
  if (!hours || typeof hours !== "object") return "";
  return Object.entries(hours)
    .map(([day, value]) => `${day}: ${value}`)
    .join(", ");
}

export function parseHours(text) {
  const value = cellText(text);
  if (!value) return null;
  const hours = {};
  for (const part of value.split(/[,;\n]/).map((p) => p.trim()).filter(Boolean)) {
    const separatorIndex = part.search(/[:：]/);
    if (separatorIndex <= 0) continue;
    hours[part.slice(0, separatorIndex).trim()] = part
      .slice(separatorIndex + 1)
      .trim();
  }
  return Object.keys(hours).length > 0 ? hours : null;
}

export function branchCell(branchSlugs, branchNameBySlug) {
  return (branchSlugs ?? [])
    .map((slug) => branchNameBySlug.get(slug) ?? slug)
    .join(", ");
}

// "Sarjapura Road, Both branches" -> branch slugs. Accepts branch names or
// slugs (matching is dynamic — nothing is hardcoded); "Both branches"/"All"
// expands to every listed branch, preserving their sheet order.
export function parseBranches(value, branchNameBySlug, slugByName) {
  const text = cellText(value);
  if (!text) return [];
  const out = [];
  for (const raw of text.split(/[,;\n]/).map((p) => p.trim()).filter(Boolean)) {
    const key = slugifyValue(raw);
    if (key === "both-branches" || key === "both" || key === "all") {
      for (const slug of branchNameBySlug.keys()) {
        if (!out.includes(slug)) out.push(slug);
      }
      continue;
    }
    const byName = slugByName.get(key);
    if (byName) {
      if (!out.includes(byName)) out.push(byName);
      continue;
    }
    if (branchNameBySlug.has(key)) {
      if (!out.includes(key)) out.push(key);
      continue;
    }
    if (!out.includes(key)) out.push(key); // unknown — reported by the caller
  }
  return out;
}

function applySheetFormatting(sheet, widths) {
  sheet.views = [{ state: "frozen", ySplit: 1 }];
  sheet.autoFilter = {
    from: { row: 1, column: 1 },
    to: { row: Math.max(sheet.rowCount, 1), column: sheet.columns.length },
  };
  const headerRow = sheet.getRow(1);
  headerRow.font = HEADER_FONT;
  headerRow.height = 20;
  headerRow.eachCell((cell) => {
    cell.fill = HEADER_FILL;
  });
  sheet.columns.forEach((column, index) => {
    column.width = widths[index];
  });
}

// ---------- Export: JSON -> Excel workbook ----------
// Takes the catalog payload exactly as returned by GET /api/catalog/export
// and builds a styled, admin-editable workbook.

export function buildWorkbookFromCatalog(catalog) {
  const data = catalog?.data ?? catalog;
  const branches = Array.isArray(data?.branches) ? data.branches : [];
  const categories = Array.isArray(data?.categories) ? data.categories : [];
  const services = Array.isArray(data?.services) ? data.services : [];

  const branchNameBySlug = new Map(branches.map((b) => [b.slug, b.name]));
  const slugByName = new Map(branches.map((b) => [slugifyValue(b.name), b.slug]));

  const workbook = new ExcelJS.Workbook();
  workbook.creator = "TNH Salon Admin";

  // --- Categories sheet (row order = category display order) ---
  const categoriesSheet = workbook.addWorksheet("Categories");
  categoriesSheet.columns = CATEGORY_COLUMNS.map((header) => ({ header }));
  for (const category of categories) {
    categoriesSheet.addRow([
      category.slug ?? "",
      category.name ?? "",
      category.description ?? "",
      category.icon ?? "",
      category.displayOrder ?? "",
      category.image ?? "",
      category.imageUrl ?? "",
      statusFromBoolean(category.isActive),
    ]);
  }
  applySheetFormatting(categoriesSheet, [22, 32, 60, 14, 10, 30, 30, 10]);

  // --- SubCategories sheet: one row per sub-category, tied to its category ---
  const subCategoriesSheet = workbook.addWorksheet("SubCategories");
  subCategoriesSheet.columns = SUBCATEGORY_COLUMNS.map((header) => ({ header }));
  for (const category of categories) {
    const subs = Array.isArray(category.subCategories) ? category.subCategories : [];
    if (subs.length === 0) {
      // Keep the category visible even when it has no sub-categories yet.
      subCategoriesSheet.addRow([category.name ?? "", "", ""]);
      continue;
    }
    for (const sub of subs) {
      subCategoriesSheet.addRow([category.name ?? "", sub.name ?? "", ""]);
    }
  }
  applySheetFormatting(subCategoriesSheet, [32, 30, 12]);

  // --- Services sheet (reference-Excel layout: one row per service) ---
  const categoryBySlug = new Map(categories.map((c) => [c.slug, c]));
  const servicesSheet = workbook.addWorksheet("Services");
  servicesSheet.columns = SERVICE_COLUMNS.map((header) => ({ header }));
  for (const service of services) {
    const category = categoryBySlug.get(service.categorySlug);
    const subName = service.subCategorySlug
      ? ((category?.subCategories ?? []).find(
          (sub) => sub.slug === service.subCategorySlug,
        )?.name ?? service.subCategorySlug)
      : "";
    servicesSheet.addRow([
      service.slug ?? "",
      category?.name ?? service.categorySlug ?? "",
      subName,
      service.name ?? "",
      service.audience ?? "Unisex",
      service.description ?? "",
      service.pricingType ?? "fixed",
      service.pricingType === "fixed" || service.pricingType === "from"
        ? (service.price ?? null)
        : null,
      service.priceRange ?? "",
      service.duration ?? "",
      branchCell(service.branchSlugs, branchNameBySlug),
      statusFromBoolean(service.isActive),
      service.image ?? "",
      service.imageUrl ?? "",
      service.displayOrder ?? "",
    ]);
  }
  applySheetFormatting(servicesSheet, [34, 24, 16, 30, 12, 70, 13, 10, 18, 16, 30, 10, 30, 30, 10]);
  servicesSheet.getColumn(8).numFmt = "#,##0.##";

  // --- Branches sheet ---
  const branchesSheet = workbook.addWorksheet("Branches");
  branchesSheet.columns = BRANCH_COLUMNS.map((header) => ({ header }));
  for (const branch of branches) {
    branchesSheet.addRow([
      branch.slug ?? "",
      branch.name ?? "",
      branch.phone ?? "",
      branch.email ?? "",
      branch.address ?? "",
      branch.mapUrl ?? "",
      branch.mapEmbedUrl ?? "",
      branch.title ?? "",
      branch.subtitle ?? "",
      formatHours(branch.hours),
      branch.aboutTitle ?? "",
      statusFromBoolean(branch.isActive),
    ]);
  }
  applySheetFormatting(branchesSheet, [22, 24, 16, 28, 44, 44, 44, 26, 26, 42, 26, 10]);

  // --- Price Sizes sheet: one row per variant/size option ---
  const sizesSheet = workbook.addWorksheet("Price Sizes");
  sizesSheet.columns = SIZE_COLUMNS.map((header) => ({ header }));
  for (const service of services) {
    (service.variants ?? []).forEach((variant, index) => {
      sizesSheet.addRow([
        service.slug ?? "",
        service.name ?? "",
        variant.label ?? "",
        variant.price ?? null,
        variant.duration ?? "",
        index + 1,
      ]);
    });
  }
  applySheetFormatting(sizesSheet, [34, 30, 14, 10, 14, 12]);
  sizesSheet.getColumn(4).numFmt = "#,##0.##";

  return workbook;
}

export async function workbookToBuffer(workbook) {
  return Buffer.from(await workbook.xlsx.writeBuffer());
}

// ---------- Import: Excel -> JSON (the existing backend payload) ----------

export class ExcelImportError extends Error {
  constructor(message, issues = []) {
    super(message);
    this.name = "ExcelImportError";
    this.issues = issues;
  }
}

function readSheet(workbook, name, columns) {
  const sheet = workbook.getWorksheet(name);
  if (!sheet) {
    return { missing: true, rows: [] };
  }
  const headerRow = sheet.getRow(1);
  const headerIndexByText = new Map();
  for (let columnIndex = 1; columnIndex <= sheet.columnCount; columnIndex += 1) {
    const text = cellText(headerRow.getCell(columnIndex).text);
    if (text) headerIndexByText.set(text, columnIndex);
  }
  const rows = [];
  sheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;
    const record = {};
    for (const column of columns) {
      const columnIndex = headerIndexByText.get(column);
      record[column] = columnIndex ? row.getCell(columnIndex).value : null;
    }
    const hasContent = Object.values(record).some((value) => cellText(value) !== "");
    if (hasContent) rows.push({ rowNumber, record });
  });
  return { missing: false, rows };
}

// Converts an uploaded .xlsx buffer into the exact JSON catalog payload the
// existing backend /api/catalog/import endpoint already accepts. Full
// validation happens here — a file with problems throws ExcelImportError with
// row-level issues before anything is sent to the backend, so existing data
// can never be partially corrupted by a bad file.
export async function parseWorkbookToCatalog(buffer) {
  const workbook = new ExcelJS.Workbook();
  try {
    await workbook.xlsx.load(buffer);
  } catch {
    throw new ExcelImportError(
      "This file could not be read as an Excel workbook. Please upload the .xlsx file generated by the Export Excel button.",
    );
  }

  const branchSheet = readSheet(workbook, "Branches", BRANCH_COLUMNS);
  const categorySheet = readSheet(workbook, "Categories", CATEGORY_COLUMNS);
  const subSheet = readSheet(workbook, "SubCategories", SUBCATEGORY_COLUMNS);
  const sizeSheet = readSheet(workbook, "Price Sizes", SIZE_COLUMNS);
  const serviceSheet = readSheet(workbook, "Services", SERVICE_COLUMNS);

  if (categorySheet.missing || serviceSheet.missing) {
    throw new ExcelImportError(
      "This file is not a catalog export. Please upload the Excel file generated by the Export Excel button.",
    );
  }

  const issues = [];

  // ---- Branches (slug is the identifier, matching the backend logic) ----
  const branchRecords = [];
  const branchNameBySlug = new Map();
  const slugByName = new Map();
  for (const { rowNumber, record } of branchSheet.rows) {
    const slug = slugifyValue(record["ID"]);
    const name = cellText(record["Name"]);
    if (!slug || !name) {
      issues.push(`Branches row ${rowNumber}: ID and Name are required.`);
      continue;
    }
    if (branchNameBySlug.has(slug)) {
      issues.push(`Branches row ${rowNumber}: duplicate branch "${name}". Skipped.`);
      continue;
    }
    branchNameBySlug.set(slug, name);
    slugByName.set(slugifyValue(name), slug);
    branchRecords.push({
      slug,
      name,
      phone: cellText(record["Phone"]) || null,
      email: cellText(record["Email"]) || null,
      address: cellText(record["Address"]) || null,
      mapUrl: cellText(record["Map URL"]) || null,
      mapEmbedUrl: cellText(record["Map Embed URL"]) || null,
      title: cellText(record["Title"]) || null,
      subtitle: cellText(record["Subtitle"]) || null,
      hours: parseHours(record["Hours"]),
      aboutTitle: cellText(record["About Title"]) || null,
      isActive: booleanFromStatus(record["Status"]),
    });
  }

  // ---- Categories (name is the Excel identifier; slug derived) ----
  const categoriesOut = [];
  const categorySlugByName = new Map();
  const seenCategoryNames = new Set();
  let categoryCounter = 0;
  for (const { rowNumber, record } of categorySheet.rows) {
    const name = cellText(record["Category"]);
    if (!name) {
      issues.push(`Categories row ${rowNumber}: Category name is required.`);
      continue;
    }
    if (seenCategoryNames.has(name)) {
      issues.push(`Categories row ${rowNumber}: duplicate category "${name}". Skipped.`);
      continue;
    }
    seenCategoryNames.add(name);
    categoryCounter += 1;
    const orderValue = parseNumber(record["Order"]);
    const slug = slugifyValue(record["ID"]) || slugifyValue(name);
    categorySlugByName.set(name, slug);
    categoriesOut.push({
      slug,
      name,
      description: cellText(record["Description"]) || null,
      icon: cellText(record["Icon"]) || "sparkles",
      displayOrder: orderValue != null ? orderValue : categoryCounter,
      image: cellText(record["Image"]) || null,
      imageUrl: cellText(record["Image URL"]) || null,
      isActive: booleanFromStatus(record["Status"]),
      subCategories: [],
    });
  }

  // ---- Sub-categories (Category -> Sub-category rows, one per value) ----
  const seenSubKeys = new Set();
  for (const { rowNumber, record } of subSheet.rows) {
    const categoryName = cellText(record["Category"]);
    const subName = cellText(record["Sub-category"]);
    if (!categoryName || !subName) continue; // placeholder rows keep categories visible
    const categorySlug = categorySlugByName.get(categoryName);
    if (!categorySlug) {
      issues.push(`SubCategories row ${rowNumber}: category "${categoryName}" was not found in the Categories sheet. Skipped.`);
      continue;
    }
    const subKey = `${categoryName}::${subName}`;
    if (seenSubKeys.has(subKey)) {
      issues.push(`SubCategories row ${rowNumber}: duplicate sub-category "${subName}" under "${categoryName}". Skipped.`);
      continue;
    }
    seenSubKeys.add(subKey);
    categoriesOut
      .find((category) => category.name === categoryName)
      .subCategories.push({ name: subName, slug: slugifyValue(subName) });
  }

  // ---- Price Sizes (variants, joined to services by Service ID) ----
  const variantsByServiceId = new Map();
  for (const { rowNumber, record } of sizeSheet.rows) {
    const serviceId = cellText(record["Service ID"]);
    const label = cellText(record["Label"]);
    if (!serviceId && !label) continue;
    if (!serviceId || !label) {
      issues.push(`Price Sizes row ${rowNumber}: Service ID and Label are required.`);
      continue;
    }
    const price = parseNumber(record["Price"]);
    if (price === null) {
      issues.push(`Price Sizes row ${rowNumber}: Price must be a number. Skipped.`);
      continue;
    }
    if (!variantsByServiceId.has(serviceId)) {
      variantsByServiceId.set(serviceId, []);
    }
    const duration = cellText(record["Duration"]);
    variantsByServiceId.get(serviceId).push(
      duration ? { label, price, duration } : { label, price },
    );
  }

  // ---- Services (the core sheet) ----
  const servicesOut = [];
  const seenServiceIds = new Set();
  let serviceCounter = 0;
  for (const { rowNumber, record } of serviceSheet.rows) {
    const name = cellText(record["Service Name"]);
    if (!name) {
      issues.push(`Services row ${rowNumber}: Service Name is required.`);
      continue;
    }
    serviceCounter += 1;

    let serviceId = cellText(record["ID"]);
    if (!serviceId) {
      // Same fallback rule the backend uses for its own import.
      serviceId = slugifyValue(`${name}-${cellText(record["Gender"]) || "unisex"}`) || slugifyValue(name);
    }
    if (seenServiceIds.has(serviceId)) {
      issues.push(`Services row ${rowNumber}: duplicate service ID "${serviceId}". Skipped.`);
      continue;
    }
    seenServiceIds.add(serviceId);

    const categoryName = cellText(record["Category"]);
    const categorySlug = categorySlugByName.get(categoryName);
    if (!categorySlug) {
      issues.push(`Services row ${rowNumber} ("${name}"): category "${categoryName || "missing"}" was not found in the Categories sheet. Skipped.`);
      continue;
    }

    const subCategoryName = cellText(record["Sub-category"]);
    let subCategorySlug = null;
    if (subCategoryName) {
      const categoryRecord = categoriesOut.find(
        (category) => category.name === categoryName,
      );
      const matchedSub = (categoryRecord?.subCategories ?? []).find(
        (sub) => sub.name === subCategoryName,
      );
      if (matchedSub) {
        subCategorySlug = matchedSub.slug;
      } else {
        issues.push(`Services row ${rowNumber} ("${name}"): sub-category "${subCategoryName}" does not belong to category "${categoryName}". Skipped.`);
        continue;
      }
    }

    const pricingType = cellText(record["Pricing Type"]) || "fixed";
    if (!["fixed", "size", "variant", "from"].includes(pricingType)) {
      issues.push(`Services row ${rowNumber} ("${name}"): unknown Pricing Type "${pricingType}" (use fixed, size, variant or from). Skipped.`);
      continue;
    }

    const price = parseNumber(record["Price"]);
    const variants = variantsByServiceId.get(serviceId) ?? [];
    if ((pricingType === "size" || pricingType === "variant") && variants.length === 0) {
      issues.push(`Services row ${rowNumber} ("${name}"): pricing type "${pricingType}" needs at least one row in the Price Sizes sheet. Skipped.`);
      continue;
    }
    if ((pricingType === "fixed" || pricingType === "from") && price === null) {
      issues.push(`Services row ${rowNumber} ("${name}"): Price must be a number for "${pricingType}" pricing. Skipped.`);
      continue;
    }

    const branchSlugs = parseBranches(record["Branches"], branchNameBySlug, slugByName);
    for (const unknownSlug of branchSlugs.filter((s) => !branchNameBySlug.has(s))) {
      issues.push(`Services row ${rowNumber} ("${name}"): branch "${unknownSlug}" was not found in the Branches sheet. That branch was skipped for this service.`);
    }
    const validBranchSlugs = branchSlugs.filter((s) => branchNameBySlug.has(s));

    servicesOut.push({
      slug: serviceId,
      categorySlug,
      subCategorySlug,
      name,
      audience: cellText(record["Gender"]) || "Unisex",
      description: cellText(record["Description"]) || null,
      pricingType,
      price: pricingType === "fixed" || pricingType === "from" ? price : null,
      priceRange: cellText(record["Price Range"]) || null,
      duration: cellText(record["Duration"]) || null,
      image: cellText(record["Image"]) || null,
      imageUrl: cellText(record["Image URL"]) || null,
      displayOrder: parseNumber(record["Display Order"]) ?? serviceCounter,
      isActive: booleanFromStatus(record["Status"]),
      variants,
      branchSlugs: validBranchSlugs,
    });
  }

  // ---- Final payload (the existing backend JSON structure) ----
  const hasAnyData = servicesOut.length + categoriesOut.length + branchRecords.length > 0;
  if (!hasAnyData && issues.length === 0) {
    throw new ExcelImportError(
      "The Excel file contains no branches, categories or services to import.",
    );
  }

  if (issues.length > 0) {
    throw new ExcelImportError(
      `Import stopped: ${issues.length} row${issues.length === 1 ? "" : "s"} have problems that must be fixed first. Nothing was changed.`,
      issues,
      );
  }

  return {
    format: "tnh-salon-catalog",
    version: 1,
    exportedAt: new Date().toISOString(),
    data: {
      branches: branchRecords,
      categories: categoriesOut,
      services: servicesOut,
    },
  };
}

// Counts used by the import preview card ("Excel file loaded successfully...").
export function summarizeCatalog(catalog) {
  const data = catalog?.data ?? catalog;
  return {
    branches: data?.branches?.length ?? 0,
    categories: data?.categories?.length ?? 0,
    subCategories: (data?.categories ?? []).reduce(
      (total, category) => total + (category.subCategories?.length ?? 0),
      0,
    ),
    services: data?.services?.length ?? 0,
  };
}
