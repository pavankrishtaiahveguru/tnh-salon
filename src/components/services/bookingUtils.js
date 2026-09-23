export const TIME_SLOTS = [
  "10:30 AM",
  "11:00 AM",
  "11:30 AM",
  "12:00 PM",
  "12:30 PM",
  "1:00 PM",
  "1:30 PM",
  "2:00 PM",
  "2:30 PM",
  "3:00 PM",
  "3:30 PM",
  "4:00 PM",
  "4:30 PM",
  "5:00 PM",
  "5:30 PM",
  "6:00 PM",
  "6:30 PM",
  "7:00 PM",
  "7:30 PM",
  "8:00 PM",
];

export function getVariants(service) {
  return (service?.variants ?? []).map((variant, index) => ({
    ...variant,
    id: variant.id ?? `${service.id}-variant-${index}`,
  }));
}

export function getBasePrice(service) {
  return service?.price ?? getVariants(service)[0]?.price ?? null;
}

export function normalizeBranch(value) {
  const normalized = String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[\s_-]+/g, " ");

  if (
    normalized === "sarjapur" ||
    normalized === "sarjapur road" ||
    normalized === "sarjapura" ||
    normalized === "sarjapura road" ||
    normalized === "sarjapur branch"
  ) {
    return "sarjapur road";
  }
  if (normalized === "indiranagar" || normalized === "indiranagar branch") {
    return "indiranagar";
  }
  if (normalized === "both" || normalized === "both branches")
    return "both branches";
  return normalized;
}

export function isServiceAvailableAtStudio(service, studio) {
  const serviceBranch = normalizeBranch(service?.branch);
  const studioName = normalizeBranch(studio?.name ?? studio);

  if (!serviceBranch || !studioName) return false;
  if (serviceBranch === "both branches") return true;
  return serviceBranch === studioName;
}

export function areServicesAvailableAtStudio(
  entries,
  studio,
  additionalService,
) {
  const services = [
    ...entries.map((entry) => entry.service ?? entry),
    ...(additionalService ? [additionalService] : []),
  ];
  return services.every((service) =>
    isServiceAvailableAtStudio(service, studio),
  );
}

export function priceForSelection(service, variantId) {
  if (!variantId) return null;
  return (
    getVariants(service).find((variant) => variant.id === variantId)?.price ??
    null
  );
}

export function requiresVariantSelection(service) {
  return getVariants(service).length > 1;
}

export function getSelectedVariant(service, variantId) {
  return (
    getVariants(service).find((variant) => variant.id === variantId) ?? null
  );
}

export function selectedPrice(entry) {
  return (
    priceForSelection(entry.service, entry.selectedVariantId) ??
    getBasePrice(entry.service)
  );
}

export function isPriceExact(entry) {
  return (
    !requiresVariantSelection(entry.service) || Boolean(entry.selectedVariantId)
  );
}

export function computeBookingTotal(entries) {
  const prices = entries.map(selectedPrice).filter((price) => price != null);
  return {
    total: prices.reduce((sum, price) => sum + price, 0),
    allExact: entries.length > 0 && entries.every(isPriceExact),
  };
}

export function formatPrice(price) {
  return price == null ? "On Request" : `₹${price.toLocaleString("en-IN")}`;
}

export function todayDateString() {
  return new Date().toISOString().split("T")[0];
}

export function formatDateDisplay(date) {
  if (!date) return "";
  return new Intl.DateTimeFormat("en-IN", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(`${date}T00:00:00`));
}

export function validateBooking({
  selectedServices,
  selectedStudio,
  customerName,
  phone,
  date,
  selectedTime,
}) {
  const errors = {};
  if (!selectedServices.length) errors.services = "Add at least one service.";
  if (!selectedStudio) errors.branch = "Choose a branch.";
  if (!customerName.trim()) errors.name = "Enter your name.";
  if (!/^\d{10}$/.test(phone))
    errors.phone = "Enter a valid 10-digit phone number.";
  if (!date) errors.date = "Choose a date.";
  if (date && date < todayDateString())
    errors.date = "Choose today or a future date.";
  if (!selectedTime) errors.time = "Choose a time.";
  if (
    selectedServices.some(
      (entry) =>
        requiresVariantSelection(entry.service) && !entry.selectedVariantId,
    )
  ) {
    errors.services = "Choose an option for every service.";
  }
  if (
    selectedStudio &&
    selectedServices.some(
      (entry) => !isServiceAvailableAtStudio(entry.service, selectedStudio),
    )
  ) {
    errors.services = "One or more services are unavailable at this branch.";
  }
  return errors;
}

// Branch → WhatsApp recipient. Keys are the branch slugs used by the booking
// flow (`/api/branches`: "indiranagar" | "sarjapur-road") and are resolved via
// normalizeBranch so branch-name variants ("Sarjapura Road", "Indiranagar
// Branch", …) resolve to the same number. Numbers are stored WITHOUT the 91
// country-code prefix; openWhatsAppWithMessage adds it for the wa.me URL.
// NOTE: there is intentionally NO fallback number — an unmapped branch must
// fail loudly instead of sending the booking to the wrong branch.
export const branchWhatsAppNumbers = {
  indiranagar: "9177185103",
  "sarjapur road": "9740355663",
};

export function getBranchWhatsAppNumber(branch) {
  const key = normalizeBranch(
    typeof branch === "string" ? branch : branch?.name ?? branch?.slug,
  );
  if (!key) return null;
  return branchWhatsAppNumbers[key] ?? null;
}

export function buildWhatsAppMessage({
  selectedServices,
  studioName,
  customerName,
  phone,
  date,
  selectedTime,
}) {
  const lines = [
    "Hi! I'd like to book an appointment at The Nail Hue",
    "",
    `📍 Branch: ${studioName ?? ""}`,
    `📅 Date: ${formatDateDisplay(date)}`,
    `🕐 Preferred time: ${selectedTime ?? ""}`,
    "✂️ Services requested:",
  ];
  selectedServices.forEach((entry, index) => {
    lines.push(`       ${index + 1}) ${entry?.service?.name ?? ""}`);
  });
  lines.push(
    "",
    `👤 Name: ${customerName ?? ""}`,
    `📱 Phone: ${phone ?? ""}`,
    "",
    "Please confirm my booking. Thank you!",
  );
  return lines.join("\n");
}

export function openWhatsAppWithMessage(message, whatsappNumber) {
  // wa.me requires the full international format; stored branch numbers are
  // 10-digit locals, so prefix the 91 country code when needed.
  const digits = String(whatsappNumber ?? "").replace(/\D/g, "");
  const fullNumber = digits.length === 10 ? `91${digits}` : digits;
  window.open(
    `https://wa.me/${fullNumber}?text=${encodeURIComponent(message)}`,
    "_blank",
  );
}

export function maskedWhatsAppNumber(whatsappNumber) {
  let digits = String(whatsappNumber ?? "").replace(/\D/g, "");
  // Mirror openWhatsAppWithMessage: 10-digit stored numbers dial as +91.
  if (digits.length === 10) digits = `91${digits}`;
  if (digits.length < 5) return "";
  const local = digits.length === 12 ? digits.slice(2) : digits;
  return `+${digits.slice(0, 2)} ${local.slice(0, 3)} XXXXX`;
}
