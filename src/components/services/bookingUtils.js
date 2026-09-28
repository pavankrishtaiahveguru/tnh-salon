// ==================================================
// TNH booking utils — compatibility re-export layer
// ==================================================
// The booking logic itself now lives in bookingCore.js so the Services-page
// booking modal and the AI chat assistant share ONE implementation (see the
// comment header there). This file keeps every existing import working —
// the Services page, BookingModal, StudioSelectionModal, Bookingconfirmation
// and ServiceCategorySelector all import from here.
export * from "./bookingCore";
