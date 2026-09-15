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

export function buildWhatsAppMessage({
  selectedServices,
  studioName,
  customerName,
  phone,
  date,
  selectedTime,
}) {
  const lines = [
    "Hi The Nail Hue, I'd like to book an appointment.",
    "",
    "Services",
    "",
  ];
  selectedServices.forEach((entry, index) => {
    const variant = getSelectedVariant(entry.service, entry.selectedVariantId);
    const price = selectedPrice(entry);
    const priceText = isPriceExact(entry)
      ? formatPrice(price)
      : `from ${formatPrice(price)}`;
    lines.push(`${index + 1}. ${entry.service.name} — ${priceText}`);
    if (variant) lines.push(`   ${variant.label}`);
    else if (entry.service.duration) lines.push(`   ${entry.service.duration}`);
    lines.push("");
  });
  const { total, allExact } = computeBookingTotal(selectedServices);
  lines.push(
    `${allExact ? "Estimated total" : "Estimated total from"}: ${formatPrice(total)}`,
  );
  lines.push(`Branch: ${studioName}`);
  lines.push(`Date: ${formatDateDisplay(date)}`);
  lines.push(`Time: ${selectedTime}`);
  lines.push(`Name: ${customerName}`);
  lines.push(`Phone: ${phone}`, "", "Please confirm my appointment.");
  return lines.join("\n");
}

export function openWhatsAppWithMessage(message) {
  const whatsappNumber =
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "919876543210";
  window.open(
    `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`,
    "_blank",
  );
}

export function maskedWhatsAppNumber() {
  const number = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "919876543210";
  return `+${number.slice(0, 2)} ${number.slice(2, 5)} XXXXX`;
}
