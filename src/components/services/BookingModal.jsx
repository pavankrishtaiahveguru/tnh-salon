"use client";

import { useEffect, useState } from "react";
import {
  X,
  Plus,
  CalendarDays,
  MapPin,
  MessageCircle,
  Check,
  Trash2,
} from "lucide-react";

import StudioSelectionModal from "./StudioSelectionModal";
import ServiceCategorySelector from "./ServiceCategorySelector";
import BookingConfirmation from "./Bookingconfirmation";

import {
  getVariants,
  getBasePrice,
  priceForSelection,
  isPriceExact,
  requiresVariantSelection,
  formatPrice,
  computeBookingTotal,
  todayDateString,
  TIME_SLOTS,
  validateBooking,
  buildWhatsAppMessage,
  getBranchWhatsAppNumber,
  openWhatsAppWithMessage,
  areServicesAvailableAtStudio,
  isServiceAvailableAtStudio,
} from "./bookingUtils";

export default function BookingModal({
  service,
  allServices,
  categories,
  branches,
  bookingState,
  onBookingChange,
  onBookingComplete,
  serviceToAdd,
  onServiceAdded,
  initialStep,
  onClose,
}) {
  const studios = branches;
  // "studio" -> "booking" -> "addService" -> "confirmation"
  const [currentStep, setCurrentStep] = useState(initialStep ?? "studio");

  const [selectedStudio, setSelectedStudio] = useState(
    bookingState?.selectedStudio ?? null,
  );

  // Each entry: { service, selectedVariantId }
  const [selectedServices, setSelectedServices] = useState(
    bookingState?.selectedServices ??
      (service
        ? [
            {
              service,
              selectedVariantId:
                getVariants(service).length === 1
                  ? getVariants(service)[0].id
                  : null,
            },
          ]
        : []),
  );

  const [customerName, setCustomerName] = useState(
    bookingState?.customerName ?? "",
  );
  const [phone, setPhone] = useState(bookingState?.phone ?? "");
  const [date, setDate] = useState(bookingState?.date ?? "");
  const [selectedTime, setSelectedTime] = useState(
    bookingState?.selectedTime ?? "",
  );

  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState("");
  const [whatsAppMessage, setWhatsAppMessage] = useState("");
  const [whatsAppNumber, setWhatsAppNumber] = useState("");

  // Lock background scroll for the entire lifetime of this component,
  // regardless of which internal step is showing.
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  const studioName = studios.find((s) => s.id === selectedStudio)?.name;
  const selectedStudioData = studios.find((s) => s.id === selectedStudio);
  const compatibleCandidateStudios = serviceToAdd
    ? studios.filter((studio) =>
        areServicesAvailableAtStudio(selectedServices, studio, serviceToAdd),
      )
    : [];

  const { total, allExact } = computeBookingTotal(selectedServices);

  useEffect(() => {
    onBookingChange?.({
      selectedServices,
      selectedStudio,
      customerName,
      phone,
      date,
      selectedTime,
    });
  }, [
    selectedServices,
    selectedStudio,
    customerName,
    phone,
    date,
    selectedTime,
    onBookingChange,
  ]);

  function handleSelectStudio(studio) {
    if (serviceToAdd) {
      const unavailable = selectedServices.find(
        ({ service: selected }) =>
          !isServiceAvailableAtStudio(selected, studio),
      );
      if (unavailable || !isServiceAvailableAtStudio(serviceToAdd, studio)) {
        setToast(`${serviceToAdd.name} isn't available at ${studio.name}.`);
        setErrors((prev) => ({
          ...prev,
          services: unavailable
            ? `${unavailable.service.name} isn't available at ${studio.name}.`
            : `${serviceToAdd.name} isn't available at ${studio.name}.`,
        }));
        return;
      }
      setSelectedServices((prev) => {
        if (prev.some((entry) => entry.service.id === serviceToAdd.id))
          return prev;
        const variants = getVariants(serviceToAdd);
        return [
          ...prev,
          {
            service: serviceToAdd,
            selectedVariantId: variants.length === 1 ? variants[0].id : null,
          },
        ];
      });
      onServiceAdded?.(serviceToAdd);
    }
    setSelectedStudio(studio.id);
    setCurrentStep("booking");
  }

  function handleKeepBrowsing() {
    onClose();
  }

  function handleAddServices(servicesToAdd) {
    const allServicesCompatible = selectedStudioData
      ? servicesToAdd.every((newService) =>
          isServiceAvailableAtStudio(newService, selectedStudioData),
        )
      : false;

    if (!selectedStudioData) {
      setToast("Please select a branch before adding another service.");
      setErrors((prev) => ({
        ...prev,
        services: "Please select a branch before adding another service.",
      }));
      setCurrentStep("booking");
      return;
    }

    setSelectedServices((prev) => {
      const existingIds = new Set(prev.map((entry) => entry.service.id));
      const additions = (allServicesCompatible ? servicesToAdd : [])
        .filter((newService) => !existingIds.has(newService.id))
        .map((newService) => {
          const variants = getVariants(newService);
          return {
            service: newService,
            selectedVariantId: variants.length === 1 ? variants[0].id : null,
          };
        });
      return [...prev, ...additions];
    });

    if (selectedStudioData && !allServicesCompatible) {
      setErrors((prev) => ({
        ...prev,
        services:
          "One or more selected services are unavailable at this branch.",
      }));
    }
    setCurrentStep("booking");
  }

  function handleRemoveService(serviceId) {
    setSelectedServices((prev) =>
      prev.filter((s) => s.service.id !== serviceId),
    );
  }

  function handleSelectVariant(serviceId, variantId) {
    setSelectedServices((prev) =>
      prev.map((s) =>
        s.service.id === serviceId ? { ...s, selectedVariantId: variantId } : s,
      ),
    );
    setErrors((prev) => ({ ...prev, services: undefined }));
  }

  function handlePhoneChange(value) {
    setPhone(value.replace(/\D/g, "").slice(0, 10));
    setErrors((prev) => ({ ...prev, phone: undefined }));
  }

  function handleSendBooking() {
    const validation = validateBooking({
      selectedServices,
      selectedStudio: studioName,
      customerName,
      phone,
      date,
      selectedTime,
    });

    if (Object.keys(validation).length > 0) {
      setErrors(validation);
      setToast(
        validation.branch
          ? "Please select a branch before continuing."
          : "Please complete the highlighted fields.",
      );
      return;
    }

    // The branch the customer currently sees selected in this modal is the
    // single source of truth for the WhatsApp recipient.
    const branchWhatsApp = getBranchWhatsAppNumber(selectedStudio);
    if (!branchWhatsApp) {
      setToast(
        "WhatsApp booking is unavailable for this branch. Please try again or contact the salon.",
      );
      return;
    }

    const message = buildWhatsAppMessage({
      selectedServices,
      selectedStudio,
      studioName,
      customerName,
      phone,
      date,
      selectedTime,
    });

    setWhatsAppMessage(message);
    setWhatsAppNumber(branchWhatsApp);
    openWhatsAppWithMessage(message, branchWhatsApp);
    onBookingComplete?.();
    setCurrentStep("confirmation");
  }

  function handleOpenWhatsAppAgain() {
    openWhatsAppWithMessage(whatsAppMessage, whatsAppNumber);
  }

  function handleDone() {
    onClose();
  }

  // --- Step 1: studio selection ---
  if (currentStep === "studio") {
    return (
      <StudioSelectionModal
        service={service}
        studios={studios}
        onSelectStudio={handleSelectStudio}
        onKeepBrowsing={handleKeepBrowsing}
        onClose={onClose}
      />
    );
  }

  // --- Add-service sub-flow renders inside the same modal shell ---
  const showingAddService = currentStep === "addService";
  const showingConfirmation = currentStep === "confirmation";

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#09221F]/45 p-3 backdrop-blur-sm sm:p-5"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative flex h-[92vh] w-[calc(100%-24px)] max-w-none flex-col overflow-hidden rounded-[18px] border border-[#D7EAE7] bg-white shadow-[0_25px_80px_rgba(0,0,0,0.18)] sm:max-w-[600px] lg:max-w-[680px]">
        {showingAddService && (
          <ServiceCategorySelector
            categories={categories}
            allServices={allServices}
            selectedServices={selectedServices}
            selectedStudio={selectedStudio}
            studios={studios}
            onContinue={handleAddServices}
            onBack={() => setCurrentStep("booking")}
            onClose={() => setCurrentStep("booking")}
          />
        )}

        {showingConfirmation && (
          <BookingConfirmation
            selectedServices={selectedServices}
            studioName={studioName}
            date={date}
            selectedTime={selectedTime}
            message={whatsAppMessage}
            whatsAppNumber={whatsAppNumber}
            onOpenWhatsAppAgain={handleOpenWhatsAppAgain}
            onDone={handleDone}
            onClose={onClose}
          />
        )}

        {currentStep === "booking" && (
          <>
            {/* Header */}
            <div className="flex shrink-0 items-center justify-between border-b border-[#E4EFED] px-4 py-3.5 sm:px-6 sm:py-4 lg:px-7">
              <div>
                <h2 className="text-base font-bold text-[#09221F] sm:text-lg lg:text-xl">
                  Your booking
                </h2>
                <p className="mt-0.5 text-[10px] text-[#718785] sm:text-xs">
                  {selectedServices.length} service
                  {selectedServices.length === 1 ? "" : "s"}
                </p>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-[#DCEAE8] text-[#718785] transition hover:bg-[#F1F8F6] hover:text-[#09221F]"
              >
                <X size={17} />
              </button>
            </div>

            {/* Content */}
            <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 overscroll-contain sm:px-6 sm:py-5 lg:px-7 lg:py-6">
              {/* Toast */}
              {toast && (
                <div className="mb-3 rounded-lg border border-[#F3C9C0] bg-[#FDF1EE] px-3 py-2 text-[10px] font-medium text-[#B23B23]">
                  {toast}
                </div>
              )}

              {/* Selected services */}
              {serviceToAdd && (
                <div className="mb-3 rounded-xl border border-[#BFE3DE] bg-[#F1FAF8] px-3.5 py-3 text-xs text-[#285F5A]">
                  <p className="font-bold text-[#09221F]">
                    Add {serviceToAdd.name}
                  </p>
                  <p className="mt-1">
                    Select a branch where all services in this booking are
                    available.
                  </p>
                  {selectedStudioData &&
                    !isServiceAvailableAtStudio(
                      serviceToAdd,
                      selectedStudioData,
                    ) && (
                      <p className="mt-1 font-semibold text-[#B23B23]">
                        {serviceToAdd.name} isn&apos;t available at your current
                        branch ({selectedStudioData.name}).
                      </p>
                    )}
                  {compatibleCandidateStudios.length > 0 && (
                    <p className="mt-1 font-semibold text-[#218F87]">
                      Available at:{" "}
                      {compatibleCandidateStudios
                        .map((studio) => studio.name)
                        .join(" or ")}
                    </p>
                  )}
                  {compatibleCandidateStudios.length === 0 && (
                    <p className="mt-1 font-semibold text-[#B23B23]">
                      These services aren&apos;t available together at the same
                      branch. Choose another service or keep your current
                      booking.
                    </p>
                  )}
                  <button
                    type="button"
                    onClick={onClose}
                    className="mt-2 text-[11px] font-semibold text-[#718785] underline underline-offset-2 hover:text-[#09221F]"
                  >
                    Cancel and keep current booking
                  </button>
                </div>
              )}

              <div className="space-y-2">
                {selectedServices.map(({ service: s, selectedVariantId }) => {
                  const variants = getVariants(s);
                  const needsVariant = requiresVariantSelection(s);
                  const exact = isPriceExact({
                    service: s,
                    selectedVariantId,
                  });
                  const price =
                    priceForSelection(s, selectedVariantId) ?? getBasePrice(s);

                  return (
                    <div
                      key={s.id}
                      className="rounded-xl border border-[#DCEBE8] bg-[#F8FCFB] p-3.5 sm:p-4"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex min-w-0 items-center gap-2.5">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-[#E4F5F2] sm:h-12 sm:w-12">
                            {s.image ? (
                              <img
                                src={s.image}
                                alt={s.name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <span className="text-xs font-bold text-[#28B8B0]">
                                {s.name?.slice(0, 2).toUpperCase()}
                              </span>
                            )}
                          </div>

                          <div className="min-w-0">
                            <p className="truncate text-sm font-bold text-[#09221F] sm:text-base">
                              {s.name}
                            </p>
                            <p className="mt-0.5 text-[10px] text-[#718785] sm:text-xs">
                              {s.category || "Beauty Service"}
                              {" • "}
                              {s.gender || "Unisex"}
                            </p>
                          </div>
                        </div>

                        <div className="flex shrink-0 items-center gap-2">
                          <p className="text-sm font-bold text-[#09221F] sm:text-base">
                            {exact
                              ? formatPrice(price)
                              : `from ${formatPrice(price)}`}
                          </p>
                          <button
                            type="button"
                            onClick={() => handleRemoveService(s.id)}
                            aria-label="Remove service"
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#DCEAE8] bg-white text-[#718785] transition hover:border-[#E7B5AA] hover:bg-[#FDF1EE] hover:text-[#B23B23]"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>

                      {selectedStudioData &&
                        !isServiceAvailableAtStudio(s, selectedStudioData) && (
                          <p className="mt-2 rounded-lg bg-[#FDF1EE] px-2.5 py-2 text-[9px] font-medium text-[#B23B23]">
                            Unavailable at {studioName}. Choose another branch
                            before booking.
                          </p>
                        )}

                      {variants.length > 1 && (
                        <div className="mt-2.5 flex flex-wrap gap-1.5">
                          {variants.map((v) => {
                            const selected = selectedVariantId === v.id;
                            return (
                              <button
                                key={v.id}
                                type="button"
                                onClick={() => handleSelectVariant(s.id, v.id)}
                                className={`rounded-lg border px-3 py-2 text-[10px] font-semibold transition sm:px-3.5 sm:py-2.5 sm:text-xs ${
                                  selected
                                    ? "border-[#28B8B0] bg-[#28B8B0] text-white"
                                    : "border-[#DCEAE8] text-[#456764] hover:border-[#28B8B0] hover:bg-white"
                                }`}
                              >
                                {v.label} · {formatPrice(v.price)}
                              </button>
                            );
                          })}
                        </div>
                      )}

                      {needsVariant && !selectedVariantId && (
                        <p className="mt-1.5 text-[9px] font-medium text-[#B23B23]">
                          Pick an option above.
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>

              {errors.services && (
                <p className="mt-1.5 text-[9px] font-medium text-[#B23B23]">
                  {errors.services}
                </p>
              )}

              {/* Add another service */}
              <button
                type="button"
                onClick={() => setCurrentStep("addService")}
                className="mt-4 flex w-full items-center justify-center gap-2 border-y border-[#DDEBE8] py-3.5 text-sm font-semibold text-[#09221F] hover:bg-[#F6FBFA]"
              >
                <Plus size={16} />
                Add another service
              </button>

              {/* Total */}
              <div className="mt-4 flex items-center justify-between border-t border-dashed border-[#D7EAE7] pt-4">
                <span className="text-sm text-[#718785]">Estimated total</span>
                <span className="text-lg font-bold text-[#09221F] sm:text-xl">
                  {allExact ? formatPrice(total) : `From ${formatPrice(total)}`}
                </span>
              </div>

              {/* Branch */}
              <div className="mt-4">
                <label className="mb-2 block text-xs font-medium text-[#718785] sm:text-sm">
                  Branch
                </label>
                <div className="flex flex-wrap gap-2">
                  {studios.map((studio) => {
                    const selected = selectedStudio === studio.id;
                    const available = areServicesAvailableAtStudio(
                      selectedServices,
                      studio,
                      serviceToAdd,
                    );
                    return (
                      <button
                        key={studio.id}
                        type="button"
                        disabled={!available}
                        onClick={() => {
                          if (!available) return;
                          handleSelectStudio(studio);
                          setErrors((prev) => ({ ...prev, branch: undefined }));
                        }}
                        className={`flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold transition ${
                          !available
                            ? "cursor-not-allowed border border-[#E5ECEA] bg-[#F3F6F5] text-[#9AA9A6] opacity-60"
                            : selected
                              ? "bg-[#28B8B0] text-white"
                              : "border border-[#DCEAE8] bg-white text-[#456764] hover:border-[#28B8B0]"
                        }`}
                      >
                        <MapPin size={12} />
                        {studio.name}
                      </button>
                    );
                  })}
                </div>
                {errors.branch && (
                  <p className="mt-1.5 text-[9px] font-medium text-[#B23B23]">
                    {errors.branch}
                  </p>
                )}
              </div>

              {/* Name + Phone */}
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-2 block text-xs font-medium text-[#718785] sm:text-sm">
                    Name
                  </label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => {
                      setCustomerName(e.target.value);
                      setErrors((prev) => ({ ...prev, name: undefined }));
                    }}
                    placeholder="Your name"
                    className={`w-full rounded-lg border px-4 py-3 text-sm outline-none placeholder:text-[#A2B1AF] focus:border-[#28B8B0] ${
                      errors.name ? "border-[#E7A79A]" : "border-[#DCEAE8]"
                    }`}
                  />
                  {errors.name && (
                    <p className="mt-1 text-[9px] font-medium text-[#B23B23]">
                      {errors.name}
                    </p>
                  )}
                </div>

                <div>
                  <label className="mb-2 block text-xs font-medium text-[#718785] sm:text-sm">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    placeholder="+91"
                    className={`w-full rounded-lg border px-4 py-3 text-sm outline-none placeholder:text-[#A2B1AF] focus:border-[#28B8B0] ${
                      errors.phone ? "border-[#E7A79A]" : "border-[#DCEAE8]"
                    }`}
                  />
                  {errors.phone && (
                    <p className="mt-1 text-[9px] font-medium text-[#B23B23]">
                      {errors.phone}
                    </p>
                  )}
                </div>
              </div>

              {/* Date */}
              <div className="mt-4">
                <label className="mb-2 block text-xs font-medium text-[#718785] sm:text-sm">
                  Preferred date
                </label>
                <div className="relative">
                  <CalendarDays
                    size={13}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#718785]"
                  />
                  <input
                    type="date"
                    value={date}
                    min={todayDateString()}
                    onChange={(e) => {
                      setDate(e.target.value);
                      setErrors((prev) => ({ ...prev, date: undefined }));
                    }}
                    className={`w-full rounded-lg border px-4 py-3 pl-10 text-sm outline-none focus:border-[#28B8B0] ${
                      errors.date ? "border-[#E7A79A]" : "border-[#DCEAE8]"
                    }`}
                  />
                </div>
                {errors.date && (
                  <p className="mt-1 text-[9px] font-medium text-[#B23B23]">
                    {errors.date}
                  </p>
                )}
              </div>

              {/* Time */}
              <div className="mt-4">
                <label className="mb-2 block text-xs font-medium text-[#718785] sm:text-sm">
                  Preferred time
                </label>
                <div className="grid grid-cols-4 gap-2 sm:gap-2.5">
                  {TIME_SLOTS.map((time) => {
                    const selected = selectedTime === time;
                    return (
                      <button
                        key={time}
                        type="button"
                        onClick={() => {
                          setSelectedTime(time);
                          setErrors((prev) => ({ ...prev, time: undefined }));
                        }}
                        className={`rounded-lg border px-1 py-3 text-[10px] font-medium transition sm:text-xs ${
                          selected
                            ? "border-[#28B8B0] bg-[#28B8B0] text-white"
                            : "border-[#DCEAE8] text-[#456764] hover:border-[#28B8B0] hover:bg-[#F1FAF8]"
                        }`}
                      >
                        {selected && (
                          <Check size={9} className="mr-0.5 inline-block" />
                        )}
                        {time}
                      </button>
                    );
                  })}
                </div>
                {errors.time && (
                  <p className="mt-1.5 text-[9px] font-medium text-[#B23B23]">
                    {errors.time}
                  </p>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="shrink-0 border-t border-[#E4EFED] bg-white p-4 sm:p-5 lg:px-7">
              <button
                type="button"
                onClick={handleSendBooking}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#28B8B0] px-4 py-3.5 text-sm font-bold text-white transition hover:bg-[#218F87]"
              >
                <MessageCircle size={16} />
                Send booking on WhatsApp
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
