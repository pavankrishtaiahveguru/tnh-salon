"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  CalendarDays,
  Check,
  Home,
  MapPin,
  MessageCircle,
  Plus,
  RefreshCw,
  Send,
  Trash2,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import {
  getChatbotBranches,
  getChatbotCategories,
  getChatbotServices,
} from "@/lib/chatbotService";
import { branches as branchMapData } from "@/data/branches";
import { refreshChatbotData } from "@/lib/services";
import {
  TIME_SLOTS,
  areServicesAvailableAtStudio,
  buildWhatsAppMessage,
  computeBookingTotal,
  formatDateDisplay,
  formatBookingServiceLine,
  formatPrice,
  getBasePrice,
  getBranchWhatsAppNumber,
  getSelectedVariant,
  getVariants,
  isPriceExact,
  openWhatsAppWithMessage,
  priceForSelection,
  requiresVariantSelection,
  selectedPrice,
  todayDateString,
  validateBooking,
} from "@/components/services/bookingCore";

// Development-safe debug logging for the chatbot booking flow (STEP 14).
// Stripped from production builds; never logs credentials.
const CHATBOT_DEBUG = process.env.NODE_ENV !== "production";
function debugLog(label, value) {
  if (CHATBOT_DEBUG) console.log(`[Chatbot] ${label}:`, value);
}

// ==================================================
// TNH Service + Booking Assistant (deterministic chat widget)
// ==================================================
// A new UI layer on top of the EXISTING TNH service + booking infrastructure:
//   • Services/categories/subcategories/prices/ordering → the same public
//     TNH APIs the Services page uses (via lib/chatbotService.js).
//   • Booking → the SAME shared logic as the Services-page booking modal
//     (components/services/bookingCore.js): slots, validation, branch→
//     WhatsApp destination mapping, message format and submission.
//   • Greetings, intents and unknown messages → deterministic local rules.
//     No AI provider, no external AI API — the chatbot is fully local.
//
// No hardcoded services, prices, categories, slots or branch numbers here.

// Unknown messages get a friendly LOCAL fallback — no AI API, no network
// request. The reply carries the standard welcome-action row.
const UNKNOWN_MESSAGE_FALLBACK =
  "I'm here to help you with appointments and salon locations. Please choose an option below.";

// Local greeting reply — answered entirely from local logic (no AI service).
const WELCOME_TAIL = "Welcome to The Nail Hue.\nHow can we help you today?";

// Normalizes a user message for greeting detection: lowercase, trim, collapse
// repeated spaces, drop harmless punctuation/emoji. Deliberately small — the
// patterns below handle the rest, so no huge hardcoded greeting list.
function normalizeUserMessage(text) {
  return String(text ?? "")
    .toLowerCase()
    .replace(/[^a-z\s]/g, " ") // strip punctuation/emoji (",", "!", "👋", …)
    .trim()
    .replace(/\s+/g, " ");
}

// Standalone-greeting matcher. The letter-run patterns (h+i+, he+y+, he+l+o+)
// accept stretched words like "hiiii" or "hellooo" without listing them. Only
// STANDALONE greetings match — "Hi, I want to book an appointment" does not,
// so it keeps flowing through normal intent routing.
const GREETING_PATTERN = new RegExp(
  "^(?:" +
    "h+i+" + // hi, hii, hiii, …
    "|he+y+" + // hey, heyy, heyyy, …
    "|he+l+o+" + // hello, helloo, hellooo, …
    "|hiya" + // hiya
    "|good\\s+(?:morning|afternoon|evening|day|night)" +
    "|greetings?" + // greeting / greetings
    "|namaste|namaskar" + // namaste / namaskar
    "|(?:nice|good)\\s+to\\s+(?:meet|see)\\s+you" + // nice/good to meet/see you
    ")" +
    "(?:\\s+(?:there|dear|again|all|everyone|everybody|folks|team))?" + // soft suffix
    "$",
);

function isGreetingMessage(text) {
  return GREETING_PATTERN.test(normalizeUserMessage(text));
}

// Mirrored greeting reply: "Hi" → "Hi! 👋", "Hellooo" → "Hello! 👋",
// "Good morning" → "Good morning! ☀️", etc. Returns null for non-greetings.
// Greeting emojis use ASCII \u{...} escapes for the same reason as the
// WhatsApp message in bookingCore.js: astral (4-byte UTF-8) literals can be
// corrupted into U+FFFD by charset-mishandling bundle layers, while ASCII
// escapes survive byte-exact and produce identical strings at runtime.
function greetingReplyFor(text) {
  if (!isGreetingMessage(text)) return null;
  const normalized = normalizeUserMessage(text);
  const emoji =
    normalized.startsWith("good morning") || normalized.startsWith("good day")
      ? "\u{2600}\u{FE0F}" // ☀️ sun
      : normalized.startsWith("good afternoon")
        ? "\u{1F324}\u{FE0F}" // 🌤️ sun behind cloud
        : normalized.startsWith("good evening") ||
            normalized.startsWith("good night")
          ? "\u{1F319}" // 🌙 crescent moon
          : "\u{1F44B}"; // 👋 waving hand
  // Collapse stretched interjections back to their canonical word
  // ("hiii" → "Hi", "hellooo" → "Hello"); phrases keep sentence casing.
  let greeting;
  if (/^hiya/.test(normalized)) greeting = "Hiya";
  else if (/^hel+o+/.test(normalized)) greeting = "Hello";
  else if (/^he+y+/.test(normalized)) greeting = "Hey";
  else if (/^h+i+/.test(normalized)) greeting = "Hi";
  else greeting = normalized.charAt(0).toUpperCase() + normalized.slice(1);
  return `${greeting}! ${emoji}\n${WELCOME_TAIL}`;
}

// Chatbot views (navigation-stack entries).
const VIEWS = {
  WELCOME: "welcome",
  LOCATIONS: "locations",
  BOOKING_BRANCH: "bookingBranch",
  BOOKING_CATEGORIES: "bookingCategories",
  BOOKING_SUBCATEGORIES: "bookingSubcategories",
  BOOKING_SERVICES_LIST: "bookingServicesList",
  BOOKING_SERVICE_PICK: "bookingServicePick",
  BOOKING_SERVICES: "bookingServices",
  BOOKING_DATE: "bookingDate",
  BOOKING_TIME: "bookingTime",
  BOOKING_CUSTOMER: "bookingCustomer",
  BOOKING_REVIEW: "bookingReview",
  BOOKING_SUCCESS: "bookingSuccess",
};

// Slots shown before "See More" expands the full list (same shared list the
// booking modal renders — see bookingCore.TIME_SLOTS).
const INITIAL_VISIBLE_SLOTS = 6;

// Primary welcome menu — Explore Services removed per the assistant spec:
// services are browsed ONLY inside the Book an Appointment flow.
const WELCOME_ACTIONS = ["Book an Appointment", "Salon Locations"];

let messageIdCounter = 0;

function nextMessageId() {
  messageIdCounter += 1;
  return `msg-${messageIdCounter}`;
}

function variantEntry(service, variantId = null) {
  const variants = getVariants(service);
  return {
    service,
    selectedVariantId:
      variantId ?? (variants.length === 1 ? variants[0].id : null),
  };
}

function pillClasses(extra = "") {
  return `rounded-full border border-[#27A399]/60 bg-white px-3.5 py-1.5 text-[12.5px] font-medium text-[#218F87] transition-colors hover:border-[#27A399] hover:bg-[#EFFAF8] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#27A399] ${extra}`;
}

function primaryButtonClasses(extra = "") {
  return `flex w-full items-center justify-center gap-2 rounded-lg bg-[#28B8B0] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#218F87] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#218F87] ${extra}`;
}

function secondaryButtonClasses(extra = "") {
  return `flex w-full items-center justify-center gap-2 rounded-lg border border-[#DCEAE8] bg-white px-4 py-2.5 text-[11px] font-semibold text-[#456764] transition hover:bg-[#F6FBFA] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#27A399] ${extra}`;
}

function serviceImage(service) {
  if (service.image) {
    return (
      <img
        src={service.image}
        alt={service.name}
        className="h-full w-full object-cover"
      />
    );
  }
  return (
    <span className="text-xs font-bold text-[#28B8B0]">
      {service.name?.slice(0, 2).toUpperCase()}
    </span>
  );
}

// ---------- Chat building blocks ----------

function ChatBubble({ message, actionsDisabled, onAction }) {
  return (
    <div
      className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
    >
      <div className="max-w-[80%] space-y-2">
        <div
          className={`rounded-2xl px-3.5 py-2.5 text-[13.5px] leading-relaxed whitespace-pre-line ${
            message.role === "user"
              ? "rounded-br-md bg-[#27A399] text-white"
              : message.isError
                ? "rounded-bl-md bg-[#FBEAEA] text-[#8A3A3A]"
                : "rounded-bl-md bg-[#F1F8F6] text-[#163B38]"
          }`}
        >
          {message.content}
        </div>
        {message.actions?.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {message.actions.map((label) => (
              <button
                key={label}
                type="button"
                disabled={actionsDisabled || message.actionsUsed}
                onClick={() =>
                  !(actionsDisabled || message.actionsUsed) && onAction?.(label)
                }
                className={pillClasses(
                  actionsDisabled || message.actionsUsed
                    ? "cursor-not-allowed border-[#E5ECEA] bg-[#F3F6F5] text-[#9AA9A6] hover:border-[#E5ECEA] hover:bg-[#F3F6F5]"
                    : "",
                )}
              >
                {label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex justify-start" role="status">
      <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-md bg-[#F1F8F6] px-4 py-3">
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#7C9491] [animation-delay:-0.3s]" />
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#7C9491] [animation-delay:-0.15s]" />
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#7C9491]" />
      </div>
    </div>
  );
}

function SectionLabel({ children }) {
  return (
    <p className="mb-1.5 text-[9px] font-semibold uppercase tracking-[0.16em] text-[#718785]">
      {children}
    </p>
  );
}

function InlineError({ children }) {
  return (
    <p className="mt-1.5 text-[10px] font-medium text-[#B23B23]">{children}</p>
  );
}

function WelcomePanel({ onBook, onLocations, disabled }) {
  const actions = [
    { label: "Book an Appointment", handler: onBook },
    { label: "Salon Locations", handler: onLocations },
  ];

  return (
    <div className="flex flex-col items-center gap-4 py-2 text-center">
      <span className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-[#E8F5F3] shadow-sm">
        <Image
          src="/images/ai-bot.png"
          alt="The Nail Hue AI Assistant"
          width={58}
          height={58}
          className="h-14 w-14 object-contain"
        />
      </span>

      <div className="space-y-1">
        <p className="text-[15px] font-semibold text-[#0F2A27]">
          Welcome to The Nail Hue
        </p>
        <p className="text-[12.5px] text-[#5F7774]">
          How can we help you today?
        </p>
      </div>

      <div className="flex flex-wrap justify-center gap-2 pt-1">
        {actions.map((action) => (
          <button
            key={action.label}
            type="button"
            disabled={disabled}
            onClick={() => !disabled && action.handler()}
            className={pillClasses(
              disabled
                ? "cursor-not-allowed border-[#E5ECEA] bg-[#F3F6F5] text-[#9AA9A6] hover:border-[#E5ECEA] hover:bg-[#F3F6F5]"
                : "",
            )}
          >
            {action.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function ServiceMiniCard({ service, onView, onBook }) {
  const variants = getVariants(service);
  const price = getBasePrice(service);

  return (
    <div className="rounded-xl border border-[#DCEBE8] bg-[#F8FCFB] p-3">
      <div className="flex items-center gap-2.5">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-[#E4F5F2]">
          {serviceImage(service)}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] font-bold text-[#09221F]">
            {service.name}
          </p>
          <p className="mt-0.5 text-[10px] text-[#718785]">
            {service.gender || "Unisex"}
            {service.duration ? ` · ${service.duration}` : ""}
          </p>
          <p className="mt-1 text-[11px] font-semibold text-[#218F87]">
            {variants.length > 1
              ? `From ${formatPrice(price)}`
              : formatPrice(price)}
          </p>
        </div>
      </div>

      {variants.length > 1 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {variants.map((variant) => (
            <span
              key={variant.id}
              className="rounded-md border border-[#D7EAE7] bg-white px-2 py-1 text-[9px] font-semibold text-[#456764]"
            >
              {variant.label} · {formatPrice(variant.price)}
            </span>
          ))}
        </div>
      )}

      <div className="mt-2.5 flex gap-2">
        <button
          type="button"
          onClick={onView}
          className="flex-1 rounded-lg border border-[#DCEAE8] bg-white px-3 py-2 text-[11px] font-semibold text-[#09221F] transition hover:bg-[#F1FAF8] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#27A399]"
        >
          View
        </button>
        <button
          type="button"
          onClick={onBook}
          className="flex-1 rounded-lg bg-[#28B8B0] px-3 py-2 text-[11px] font-bold text-white transition hover:bg-[#218F87] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#218F87]"
        >
          Book
        </button>
      </div>
    </div>
  );
}

function BranchOption({ branch, disabled, onSelect }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => !disabled && onSelect(branch)}
      className={`flex w-full items-center gap-3 rounded-xl border p-3.5 text-left transition ${
        disabled
          ? "cursor-not-allowed border-[#E5ECEA] bg-[#F3F6F5] opacity-55"
          : "border-[#D7EAE7] bg-white hover:border-[#28B8B0] hover:bg-[#F5FBFA] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#27A399]"
      }`}
    >
      <MapPin
        size={18}
        className={disabled ? "text-[#9AA9A6]" : "text-[#28B8B0]"}
      />
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-bold text-[#09221F]">
          {branch.name}
        </span>
        <span className="mt-0.5 block truncate text-[10px] text-[#718785]">
          {disabled
            ? "Unavailable for your selected services"
            : branch.city || "Select this salon"}
        </span>
      </span>
      {!disabled && <Check size={15} className="text-[#718785]" />}
    </button>
  );
}

export default function AiChatWidget() {
  const [isOpen, setIsOpen] = useState(false);

  // Chat log — every assistant reply is generated locally from deterministic
  // rules (no AI provider, no external AI API).
  const [messages, setMessages] = useState([]);
  // Scoped ONLY to the welcome action group (both the WelcomePanel buttons
  // and the actions attached to greeting/fallback messages): once Book an
  // Appointment or Salon Locations has been tapped, that group is disabled so
  // neither flow can be triggered twice. Every other button in the chatbot —
  // categories, services, variants, Continue, etc. — stays fully interactive.
  const [inputValue, setInputValue] = useState("");
  const [welcomeActionsUsed, setWelcomeActionsUsed] = useState(false);

  // Navigation stack (chatbot-internal; never browser history).
  const [view, setView] = useState(VIEWS.WELCOME);
  const [navigationStack, setNavigationStack] = useState([]);

  // Shared loading / error state for data-driven views.
  const [loadingText, setLoadingText] = useState("");
  const [viewError, setViewError] = useState("");

  // Shared service-selection state (used by the booking flow's service pick
  // view). The standalone Explore Services state was removed with that flow.
  const [selectedService, setSelectedService] = useState(null);

  // Booking state — field names match the existing booking system
  // (BookingModal / bookingCore.validateBooking).
  const [bookingEntries, setBookingEntries] = useState([]); // {service, selectedVariantId}
  const [selectedStudio, setSelectedStudio] = useState(null); // branch slug
  const [bookingDate, setBookingDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [visibleSlotCount, setVisibleSlotCount] = useState(
    INITIAL_VISIBLE_SLOTS,
  );
  // Booking browse state — the deterministic hierarchy
  // BRANCH → CATEGORY → SUBCATEGORY → SERVICE → VARIANT. Every level is
  // fetched/scoped from the previous selection (server-filtered — never a
  // hardcoded list and never client-side re-filtering of a wider fetch).
  const [bookingCategories, setBookingCategories] = useState(null); // branch-scoped
  const [bookingCategory, setBookingCategory] = useState(null);
  const [bookingSubCategory, setBookingSubCategory] = useState(null);
  const [bookingServiceList, setBookingServiceList] = useState(null);
  const [pickVariantId, setPickVariantId] = useState(null);
  const [pickError, setPickError] = useState("");

  // Locations.
  const [branches, setBranches] = useState(null);

  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const fetchIdRef = useRef(0);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loadingText, view]);

  useEffect(() => {
    if (isOpen) {
      textareaRef.current?.focus();
    }
  }, [isOpen]);

  // ---------- Messaging helpers ----------

  function pushMessages(list) {
    setMessages((prev) => [...prev, ...list]);
  }

  function pushExchange(userText, assistantText) {
    pushMessages([
      { id: nextMessageId(), role: "user", content: userText },
      ...(assistantText
        ? [{ id: nextMessageId(), role: "assistant", content: assistantText }]
        : []),
    ]);
  }

  function pushAssistant(content, isError = false) {
    pushMessages([{ id: nextMessageId(), role: "assistant", content, isError }]);
  }

  // ---------- Navigation ----------

  function navigateTo(nextView) {
    setNavigationStack((prev) => [...prev, view]);
    setView(nextView);
  }

  function goBack() {
    if (navigationStack.length === 0) return; // never closes the chat
    const previous = navigationStack[navigationStack.length - 1];
    setNavigationStack((prev) => prev.slice(0, -1));
    setView(previous);
    setViewError("");
    setPickError("");
  }

  // Home: back to welcome, keep the chat open and the chat log. Clears all
  // browsing + temporary booking state.
  function goHome() {
    setNavigationStack([]);
    setView(VIEWS.WELCOME);
    setViewError("");
    setLoadingText("");
    // A deliberate Home/Restart is a fresh start — the welcome action group
    // becomes interactive again (the chat log's older action rows stay
    // permanently disabled via their own message state).
    setWelcomeActionsUsed(false);
    setSelectedService(null);
    setBookingEntries([]);
    setSelectedStudio(null);
    setBookingDate("");
    setSelectedTime("");
    setCustomerName("");
    setPhone("");
    setVisibleSlotCount(INITIAL_VISIBLE_SLOTS);
    setBookingCategories(null);
    setBookingCategory(null);
    setBookingSubCategory(null);
    setBookingServiceList(null);
    setPickVariantId(null);
    setPickError("");
    // When the log already has messages, add ONE welcome message carrying the
    // two welcome actions — rendered by the same single action renderer as
    // every other action group. (An empty log shows the WelcomePanel instead.)
    setMessages((prev) =>
      prev.length === 0
        ? prev
        : [
            ...prev,
            {
              id: nextMessageId(),
              role: "assistant",
              content: WELCOME_TAIL,
              actions: WELCOME_ACTIONS,
            },
          ],
    );
  }

  // Refresh: restart the whole chatbot session (chat log included). Keeps the
  // chat open; never reloads the browser. Data refresh goes through the
  // shared invalidator so the chatbot's categories/services caches (and the
  // Services page caches, which share admin data) are dropped together —
  // a refreshed session always refetches from the backend.
  function restartChat() {
    refreshChatbotData();
    setMessages([]);
    setInputValue("");
    goHome();
  }

  // ---------- Data loaders (existing TNH APIs, session-cached) ----------

  async function ensureBranches() {
    if (branches) return branches;
    const fetchId = ++fetchIdRef.current;
    setLoadingText("Loading locations...");
    setViewError("");
    try {
      const data = await getChatbotBranches();
      if (fetchIdRef.current !== fetchId) return null;
      setBranches(data);
      return data;
    } catch (error) {
      if (fetchIdRef.current !== fetchId) return null;
      setViewError(
        "Sorry, we couldn't load our salon locations right now. Please try again.",
      );
      return null;
    } finally {
      if (fetchIdRef.current === fetchId) setLoadingText("");
    }
  }

  // ---- Booking browse loaders (branch → category → subcategory → service) ----

  // Branch-scoped categories: the same public category endpoint the Services
  // page uses (?public=1&branch=<slug>) — the backend hides categories whose
  // ACTIVE-service count for this branch is 0, so the chatbot list can never
  // offer a category with no bookable services here.
  async function loadBookingCategories(branchSlug) {
    const fetchId = ++fetchIdRef.current;
    setLoadingText("Loading categories...");
    setViewError("");
    try {
      const data = await getChatbotCategories(branchSlug);
      if (fetchIdRef.current !== fetchId) return;
      setBookingCategories(data);
    } catch (error) {
      if (fetchIdRef.current !== fetchId) return;
      setViewError(
        "Sorry, we couldn't load our services right now. Please try again.",
      );
    } finally {
      if (fetchIdRef.current === fetchId) setLoadingText("");
    }
  }

  // Subcategories of the selected category AT the selected branch. The
  // branch-scoped category payload carries per-sub service counts already
  // scoped to ACTIVE services at this branch — zero-count subs are dropped
  // so an empty group can never be selected.
  function bookingSubCategoriesFor(category) {
    return (category?.subCategories ?? []).filter((sub) => sub.serviceCount > 0);
  }

  // Services for ALL THREE scopes at once — one server-filtered request
  // (status=Active&branch=&category=&subCategory=), the same API + mapper the
  // Services page uses. No client-side re-filtering.
  async function loadBookingServices(branchSlug, category, sub) {
    const fetchId = ++fetchIdRef.current;
    setLoadingText("Loading services...");
    setViewError("");
    try {
      const rows = await getChatbotServices({
        branch: branchSlug,
        category: category.id,
        subCategory: sub.slug,
      });
      if (fetchIdRef.current !== fetchId) return;
      setBookingServiceList(rows);
    } catch (error) {
      if (fetchIdRef.current !== fetchId) return;
      setViewError(
        "Sorry, we couldn't load our services right now. Please try again.",
      );
    } finally {
      if (fetchIdRef.current === fetchId) setLoadingText("");
    }
  }

  // ---------- Welcome actions + shared service selection ----------

  // Dispatches the two primary welcome actions (chat log included). The
  // welcome action group is disabled IMMEDIATELY (before the flow starts) so
  // rapid double-clicks can never fire the handler twice.
  function handleWelcomeAction(label) {
    if (welcomeActionsUsed) return;
    setWelcomeActionsUsed(true);
    // Permanently stamp every existing action group in the chat log as used,
    // so old greeting buttons stay dead even after a later Home/Restart.
    setMessages((prev) =>
      prev.map((message) =>
        message.actions?.length && !message.actionsUsed
          ? { ...message, actionsUsed: true }
          : message,
      ),
    );
    if (label === "Book an Appointment") return startBooking();
    if (label === "Salon Locations") return startLocations();
    return sendMessage(label);
  }

  // Adds a service (entry shape identical to the booking modal's) to the
  // temporary booking selection. Returns false when a required variant is
  // missing.
  function addServiceToBooking(service, variantId = null) {
    const variants = getVariants(service);
    if (variants.length > 1 && !variantId) {
      return false;
    }
    const entry = variantEntry(service, variantId);
    debugLog(
      "Selected service",
      JSON.stringify({
        id: entry.service.id,
        name: entry.service.name,
        variant: getSelectedVariant(service, entry.selectedVariantId)?.label ?? null,
        price: selectedPrice(entry),
      }),
    );
    setBookingEntries((prev) => {
      if (prev.some((existing) => existing.service.id === service.id)) return prev;
      return [...prev, entry];
    });
    return true;
  }

  // ---------- Booking flow handlers ----------

  // STEP 1 — branch selected: it becomes the scope for every following
  // level. bookingEntries and all other booking state are untouched.
  function handleSelectStudio(branch) {
    const branchData = branches?.find((b) => b.id === branch.id) ?? branch;
    if (
      bookingEntries.length > 0 &&
      !areServicesAvailableAtStudio(bookingEntries, branchData)
    ) {
      pushAssistant(
        "One or more selected services are unavailable at this branch.",
      );
      return;
    }
    setSelectedStudio(branch.id);
    pushExchange(branch.name, null);
    if (bookingEntries.length > 0) {
      // Services already chosen (e.g. an in-progress booking being resumed) —
      // show the summary, never an empty browser.
      navigateTo(VIEWS.BOOKING_SERVICES);
    } else {
      // Deterministic hierarchy: branch → categories.
      navigateTo(VIEWS.BOOKING_CATEGORIES);
      loadBookingCategories(branch.id);
    }
  }

  // STEP 2 — category selected within the branch. Existing entries preserved.
  function handleBookingCategorySelect(category) {
    setBookingCategory(category);
    setBookingSubCategory(null);
    setBookingServiceList(null);
    pushExchange(category.name, null);
    navigateTo(VIEWS.BOOKING_SUBCATEGORIES);
  }

  // STEP 3 — subcategory selected. Existing entries preserved.
  function handleBookingSubCategorySelect(sub) {
    setBookingSubCategory(sub);
    setBookingServiceList(null);
    pushExchange(sub.name, null);
    navigateTo(VIEWS.BOOKING_SERVICES_LIST);
    loadBookingServices(selectedStudio, bookingCategory, sub);
  }

  // STEP 4/5 — service tapped in the branch+category+subcategory list: show
  // its actual variants (from the API service object) in the pick view.
  function handleBookingServiceSelect(service) {
    setSelectedService(service);
    setPickVariantId(
      getVariants(service).length === 1 ? getVariants(service)[0].id : null,
    );
    setPickError("");
    pushExchange(service.name, null);
    navigateTo(VIEWS.BOOKING_SERVICE_PICK);
  }

  // STEP 6/7 — "Add Service": the entry keeps the COMPLETE service object
  // plus the chosen variant id. bookingEntries is appended to, never replaced.
  function handleBookingPickConfirm() {
    const service = selectedService;
    if (!service) return;
    if (requiresVariantSelection(service) && !pickVariantId) {
      setPickError("Pick an option above.");
      return;
    }
    if (!addServiceToBooking(service, pickVariantId)) {
      setPickError("Pick an option above.");
      return;
    }
    pushAssistant(`${service.name} added to your booking.`);
    navigateTo(VIEWS.BOOKING_SERVICES);
  }

  // STEP 8 — "Add More Services": back to categories with the SAME branch,
  // keeping every previously selected service intact.
  function handleBookingAddMore() {
    setBookingCategory(null);
    setBookingSubCategory(null);
    setBookingServiceList(null);
    pushExchange("Add More Services", null);
    navigateTo(VIEWS.BOOKING_CATEGORIES);
    loadBookingCategories(selectedStudio);
  }

  // STEP 9/10 — "Continue": into the existing booking-details flow only now.
  function handleBookingBrowseContinue() {
    if (bookingEntries.length === 0) return;
    const studioData = branches?.find((b) => b.id === selectedStudio);
    if (
      studioData &&
      !areServicesAvailableAtStudio(bookingEntries, studioData)
    ) {
      pushAssistant(
        "One or more selected services are unavailable at this branch.",
      );
      return;
    }
    pushExchange("Continue", "When would you like to come in?");
    navigateTo(VIEWS.BOOKING_DATE);
  }

  function handleRemoveBookingEntry(serviceId) {
    setBookingEntries((prev) =>
      prev.filter((entry) => entry.service.id !== serviceId),
    );
  }

  function handleSelectBookingVariant(serviceId, variantId) {
    const entry = bookingEntries.find(
      (existing) => existing.service.id === serviceId,
    );
    if (entry) {
      const variant = getSelectedVariant(entry.service, variantId);
      debugLog(
        "Selected variant",
        JSON.stringify({
          id: entry.service.id,
          name: entry.service.name,
          variant: variant?.label ?? null,
          price: variant?.price ?? null,
        }),
      );
    }
    setBookingEntries((prev) =>
      prev.map((existing) =>
        existing.service.id === serviceId
          ? { ...existing, selectedVariantId: variantId }
          : existing,
      ),
    );
  }

  function handleDateChange(value) {
    setBookingDate(value);
    if (!value) return;
    setSelectedTime("");
    setVisibleSlotCount(INITIAL_VISIBLE_SLOTS);
    pushExchange(formatDateDisplay(value), null);
    // Same slot source as the booking modal (bookingCore.TIME_SLOTS) — show
    // "Checking available slots..." briefly, then the first few slots.
    setLoadingText("Checking available slots...");
    navigateTo(VIEWS.BOOKING_TIME);
    const fetchId = ++fetchIdRef.current;
    setTimeout(() => {
      if (fetchIdRef.current !== fetchId) return;
      setLoadingText("");
    }, 400);
  }

  function handleSelectTime(time) {
    setSelectedTime(time);
    pushExchange(time, "May we know your name?");
    navigateTo(VIEWS.BOOKING_CUSTOMER);
  }

  function handleCustomerContinue() {
    const studioName = branches?.find((b) => b.id === selectedStudio)?.name;
    const validation = validateBooking({
      selectedServices: bookingEntries,
      selectedStudio: studioName,
      customerName,
      phone,
      date: bookingDate,
      selectedTime,
    });
    if (validation.name || validation.phone) {
      pushAssistant(validation.phone || validation.name);
      return;
    }
    pushExchange("Continue", null);
    navigateTo(VIEWS.BOOKING_REVIEW);
  }

  function handlePhoneChange(value) {
    // Same rule as the booking modal: digits only, max 10.
    setPhone(value.replace(/\D/g, "").slice(0, 10));
  }

  const REVIEW_ERROR_VIEWS = {
    services: VIEWS.BOOKING_SERVICES,
    branch: VIEWS.BOOKING_BRANCH,
    date: VIEWS.BOOKING_DATE,
    time: VIEWS.BOOKING_TIME,
    name: VIEWS.BOOKING_CUSTOMER,
    phone: VIEWS.BOOKING_CUSTOMER,
  };

  function handleConfirmBooking() {
    const studioName = branches?.find((b) => b.id === selectedStudio)?.name;
    const validation = validateBooking({
      selectedServices: bookingEntries,
      selectedStudio: studioName,
      customerName,
      phone,
      date: bookingDate,
      selectedTime,
    });

    const firstErrorKey = Object.keys(validation)[0];
    if (firstErrorKey) {
      pushAssistant(validation[firstErrorKey]);
      const target = REVIEW_ERROR_VIEWS[firstErrorKey];
      if (target && target !== view) {
        setNavigationStack((prev) => [...prev, VIEWS.BOOKING_REVIEW]);
        setView(target);
      }
      return;
    }

    // Branch-specific WhatsApp destination — resolved via the SAME shared
    // mapping the booking modal uses (bookingCore.getBranchWhatsAppNumber).
    // No fallback number exists on purpose: an unmapped branch fails loudly.
    const branchWhatsApp = getBranchWhatsAppNumber(selectedStudio);
    if (!branchWhatsApp) {
      pushAssistant(
        "We couldn't send your booking request. Please try again.",
        true,
      );
      return;
    }

    const message = buildWhatsAppMessage({
      selectedServices: bookingEntries,
      selectedStudio,
      studioName,
      customerName,
      phone,
      date: bookingDate,
      selectedTime,
    });

    debugLog(
      "Booking services",
      JSON.stringify(
        bookingEntries.map((entry) => ({
          id: entry.service.id,
          name: entry.service.name,
          variant:
            getSelectedVariant(entry.service, entry.selectedVariantId)?.label ??
            null,
          price: selectedPrice(entry),
        })),
      ),
    );
    debugLog("Final booking message", `\n${message}`);

    try {
      openWhatsAppWithMessage(message, branchWhatsApp);
    } catch (error) {
      pushAssistant(
        "We couldn't send your booking request. Please try again.",
        true,
      );
      return;
    }

    pushExchange(
      "Confirm Booking",
      "Your booking request has been sent successfully. Our team will confirm your appointment shortly.",
    );
    setNavigationStack([]);
    setView(VIEWS.BOOKING_SUCCESS);
  }

  // ---------- Free-text input (keyword routing + optional AI) ----------

  function routeIntent(text) {
    // Deterministic intent priority (no AI provider involved anywhere):
    // 1. Booking intent — "Hi, I want to book an appointment" starts booking.
    const t = String(text ?? "").toLowerCase();
    if (/(book|appointment)/.test(t)) return "book";
    // 2. Location intent — "Hello, show me your locations" opens locations.
    if (/(location|branch|address|where)/.test(t)) return "locations";
    // 3. Service queries route into the booking flow (Explore Services was
    //    removed — services are browsed only inside booking).
    if (/(service|menu|explore|categor)/.test(t)) return "book";
    // 4. Standalone greeting — only bare greetings ("hi", "hello there",
    //    "good morning", …) land here; real requests were routed above.
    if (isGreetingMessage(text)) return "greeting";
    return null;
  }

  function beginBooking(userText = "Book an Appointment") {
    if (userText) {
      pushExchange(userText, "Which salon would you like to visit?");
    } else {
      pushAssistant("Which salon would you like to visit?");
    }
    navigateTo(VIEWS.BOOKING_BRANCH);
    ensureBranches();
  }

  function startBooking() {
    return beginBooking();
  }

  async function beginLocations(userText = "Salon Locations") {
    if (userText) {
      pushExchange(userText, "Here are our salons:");
    } else {
      pushAssistant("Here are our salons:");
    }
    navigateTo(VIEWS.LOCATIONS);
    await ensureBranches();
  }

  function startLocations() {
    return beginLocations();
  }

  async function sendMessage(rawText) {
    const text = rawText.trim();
    if (!text) return;

    // Deterministic intent routing — every reply comes from local rules and
    // TNH APIs; no AI provider is involved.
    const intent = routeIntent(text);
    if (intent) {
      pushMessages([{ id: nextMessageId(), role: "user", content: text }]);
      setInputValue("");
      // Greeting: reply locally, mirroring the user's greeting, with the two
      // welcome actions attached to THIS message. This message's action row
      // is the ONLY action group rendered — there is no separate global
      // welcome-action row.
      if (intent === "greeting") {
        pushMessages([
          {
            id: nextMessageId(),
            role: "assistant",
            content: greetingReplyFor(text),
            actions: WELCOME_ACTIONS,
          },
        ]);
        return;
      }
      // The user message is already in the log — pass null so the flow does
      // not append it a second time.
      if (intent === "book") beginBooking(null);
      if (intent === "locations") await beginLocations(null);
      return;
    }

    pushMessages([{ id: nextMessageId(), role: "user", content: text }]);
    setInputValue("");

    // Unknown message: friendly local fallback, generated entirely on the
    // frontend — nothing is sent to any AI API or backend endpoint. The reply
    // carries the welcome-action row through the same single action renderer
    // as every other action group.
    pushMessages([
      {
        id: nextMessageId(),
        role: "assistant",
        content: UNKNOWN_MESSAGE_FALLBACK,
        actions: WELCOME_ACTIONS,
      },
    ]);
  }

  function handleKeyDown(event) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage(inputValue);
    }
  }

  // ---------- View panels ----------

  function renderLocationsPanel() {
    if (loadingText) return null;
    if (viewError) {
      return (
        <div className="space-y-2 text-center">
          <InlineError>{viewError}</InlineError>
          <button type="button" onClick={() => startLocations()} className={pillClasses()}>
            Try Again
          </button>
        </div>
      );
    }
    if (!branches) return null;

    return (
      <div className="space-y-2.5">
        {branches.map((branch) => (
          <div
            key={branch.id}
            className="rounded-xl border border-[#DCEBE8] bg-[#F8FCFB] p-3.5"
          >
            <p className="text-sm font-bold text-[#09221F]">{branch.name}</p>
            {branch.address && (
              <p className="mt-1 text-[11px] leading-relaxed text-[#456764]">
                {branch.address}
              </p>
            )}
            {branch.phone && (
              <p className="mt-1 text-[11px] font-medium text-[#285F5A]">
                <a href={`tel:${branch.phone}`} className="underline underline-offset-2">
                  {branch.phone}
                </a>
              </p>
            )}
            {branchMapData[branch.id]?.mapUrl && (
              <a
                href={branchMapData[branch.id]?.mapUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-1.5 inline-block text-[11px] font-semibold text-[#218F87] underline underline-offset-2"
              >
                View on Google Maps
              </a>
            )}
          </div>
        ))}
      </div>
    );
  }

  function renderBookingBranchPanel() {
    if (loadingText) return null;
    if (viewError) {
      return (
        <div className="space-y-2 text-center">
          <InlineError>{viewError}</InlineError>
          <button type="button" onClick={() => startBooking()} className={pillClasses()}>
            Try Again
          </button>
        </div>
      );
    }
    if (!branches) return null;

    return (
      <div className="space-y-2.5">
        <SectionLabel>Choose your salon</SectionLabel>
        {branches.map((branch) => (
          <BranchOption
            key={branch.id}
            branch={branch}
            disabled={
              bookingEntries.length > 0 &&
              !areServicesAvailableAtStudio(bookingEntries, branch)
            }
            onSelect={handleSelectStudio}
          />
        ))}
      </div>
    );
  }

  // ---- Booking browse panels: BRANCH → CATEGORY → SUBCATEGORY → SERVICE →
  // VARIANT. Each level is loaded from the previous selection through the
  // existing TNH APIs (server-filtered — no hardcoded lists, no client-side
  // re-filtering of a wider fetch). bookingEntries is never touched while
  // browsing.

  // STEP 2 — categories scoped to the selected branch: the same public
  // categories endpoint the Services page uses (?public=1&branch=<slug>); the
  // backend hides categories with zero ACTIVE services at this branch.
  function renderBookingCategoriesPanel() {
    const branchData = branches?.find((b) => b.id === selectedStudio);
    if (loadingText) return null;
    if (viewError) {
      return (
        <div className="space-y-2 text-center">
          <InlineError>{viewError}</InlineError>
          <button
            type="button"
            onClick={() => loadBookingCategories(selectedStudio)}
            className={pillClasses()}
          >
            Try Again
          </button>
        </div>
      );
    }
    if (!bookingCategories) return null;
    if (bookingCategories.length === 0) {
      return (
        <p className="rounded-xl border border-dashed border-[#D7EAE7] px-3 py-4 text-center text-[11px] text-[#718785]">
          No services are available at {branchData?.name ?? "this salon"} right
          now.
        </p>
      );
    }

    return (
      <div className="space-y-2.5">
        <SectionLabel>
          Choose a service category
          {branchData ? ` · ${branchData.name}` : ""}
        </SectionLabel>
        <div className="flex flex-wrap gap-2">
          {bookingCategories.map((category) => (
            <button
              key={category.id}
              type="button"
              onClick={() => handleBookingCategorySelect(category)}
              className={pillClasses()}
            >
              {category.name}
              {category.serviceCount ? ` · ${category.serviceCount}` : ""}
            </button>
          ))}
        </div>
      </div>
    );
  }

  // STEP 3 — subcategories of the selected category AT the selected branch
  // (the branch-scoped category payload carries per-sub ACTIVE-service
  // counts, so zero-count subs never appear).
  function renderBookingSubCategoriesPanel() {
    if (loadingText) return null;
    const subs = bookingSubCategoriesFor(bookingCategory);
    if (subs.length === 0) {
      return (
        <p className="rounded-xl border border-dashed border-[#D7EAE7] px-3 py-4 text-center text-[11px] text-[#718785]">
          No subcategories available under {bookingCategory?.name} right now.
        </p>
      );
    }

    return (
      <div className="space-y-2.5">
        <SectionLabel>
          Choose a subcategory · {bookingCategory?.name}
        </SectionLabel>
        <div className="flex flex-wrap gap-2">
          {subs.map((sub) => (
            <button
              key={sub.slug}
              type="button"
              onClick={() => handleBookingSubCategorySelect(sub)}
              className={pillClasses()}
            >
              {sub.name}
              {sub.serviceCount ? ` · ${sub.serviceCount}` : ""}
            </button>
          ))}
        </div>
      </div>
    );
  }

  // STEP 4 — services for branch + category + subcategory in ONE
  // server-filtered request (status=Active&branch=&category=&subCategory=);
  // existing display order preserved.
  function renderBookingServicesListPanel() {
    if (loadingText) return null;
    if (viewError) {
      return (
        <div className="space-y-2 text-center">
          <InlineError>{viewError}</InlineError>
          <button
            type="button"
            onClick={() =>
              loadBookingServices(
                selectedStudio,
                bookingCategory,
                bookingSubCategory,
              )
            }
            className={pillClasses()}
          >
            Try Again
          </button>
        </div>
      );
    }
    if (!bookingServiceList) return null;
    if (bookingServiceList.length === 0) {
      return (
        <p className="rounded-xl border border-dashed border-[#D7EAE7] px-3 py-4 text-center text-[11px] text-[#718785]">
          No services available under {bookingSubCategory?.name} at{" "}
          {branches?.find((b) => b.id === selectedStudio)?.name ?? "this salon"}
          .
        </p>
      );
    }

    return (
      <div className="space-y-2.5">
        <SectionLabel>
          Choose a service · {bookingCategory?.name} / {bookingSubCategory?.name}
        </SectionLabel>
        {bookingServiceList.map((service) => (
          <ServiceMiniCard
            key={service.id}
            service={service}
            onView={() => handleBookingServiceSelect(service)}
            onBook={() => handleBookingServiceSelect(service)}
          />
        ))}

        {bookingEntries.length > 0 && (
          <div className="rounded-xl border border-[#BFE3DE] bg-[#F1FAF8] px-3 py-2.5">
            <SectionLabel>Selected services</SectionLabel>
            <ol className="space-y-0.5 text-[11px] font-medium text-[#285F5A]">
              {bookingEntries.map((entry, index) => (
                <li key={entry.service.id}>
                  {index + 1}. {formatBookingServiceLine(entry)}
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>
    );
  }

  // STEP 5/6 — the service and its ACTUAL variants straight from the API
  // service object. Fixed price shows the fixed price; price-on-request
  // keeps the existing "On Request" behavior.
  function renderBookingServicePickPanel() {
    const service = selectedService;
    if (!service) return null;
    const variants = getVariants(service);

    return (
      <div className="space-y-3">
        <div className="rounded-xl border border-[#DCEBE8] bg-[#F8FCFB] p-3.5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-[#E4F5F2]">
              {serviceImage(service)}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-[#09221F]">{service.name}</p>
              <p className="mt-0.5 text-[10px] text-[#718785]">
                {service.gender || "Unisex"}
                {service.duration ? ` · ${service.duration}` : ""}
              </p>
              <p className="mt-1 text-[12px] font-semibold text-[#218F87]">
                {requiresVariantSelection(service) && !pickVariantId
                  ? `From ${formatPrice(getBasePrice(service))} + tax`
                  : formatPrice(
                      priceForSelection(service, pickVariantId) ??
                        getBasePrice(service),
                    ) + " + tax"}
              </p>
            </div>
          </div>

          {variants.length > 1 && (
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              {variants.map((variant) => {
                const selected = pickVariantId === variant.id;
                return (
                  <button
                    key={variant.id}
                    type="button"
                    onClick={() => {
                      setPickVariantId(variant.id);
                      setPickError("");
                    }}
                    className={`rounded-lg border px-2.5 py-1.5 text-[10px] font-semibold transition ${
                      selected
                        ? "border-[#28B8B0] bg-[#28B8B0] text-white"
                        : "border-[#DCEAE8] bg-white text-[#456764] hover:border-[#28B8B0]"
                    }`}
                  >
                    {variant.label} · {formatPrice(variant.price)}
                  </button>
                );
              })}
            </div>
          )}

          {/* Hint shows up-front for multi-variant services (a disabled
              Continue cannot set it on click) and after a blocked attempt. */}
          {(pickError ||
            (requiresVariantSelection(service) && !pickVariantId)) && (
            <InlineError>Pick an option above.</InlineError>
          )}

          {service.description && (
            <p className="mt-2.5 text-[11px] leading-relaxed text-[#456764]">
              {service.description}
            </p>
          )}
        </div>

        {/* STEP 6 — variant is REQUIRED before Continue: disabled (with the
            "Pick an option above." hint) until pickVariantId is set. */}
        <button
          type="button"
          onClick={handleBookingPickConfirm}
          disabled={requiresVariantSelection(service) && !pickVariantId}
          className={primaryButtonClasses(
            requiresVariantSelection(service) && !pickVariantId
              ? "cursor-not-allowed bg-[#B9D8D4] hover:bg-[#B9D8D4]"
              : "",
          )}
        >
          Continue
        </button>
      </div>
    );
  }

  // STEP 9 — selected-services summary. Reads ONLY from bookingEntries (the
  // single source of truth) so this list, the review screen and the WhatsApp
  // message can never disagree.
  // The selected-services rows used by the summary panel — every row reads
  // from a bookingEntry (complete service object + selectedVariantId) and is
  // formatted with the SHARED bookingCore helpers only.
  function renderBookingEntryRows() {
    return (
      <ol className="space-y-2">
        {bookingEntries.map((entry, index) => {
          const variants = getVariants(entry.service);
          return (
            <li
              key={entry.service.id}
              className="flex items-start justify-between gap-2"
            >
              <div className="min-w-0">
                <p className="text-[12px] font-bold text-[#09221F]">
                  {index + 1}. {entry.service.name}
                </p>
                {variants.length > 1 && (
                  <div className="mt-1 flex flex-wrap gap-1">
                    {variants.map((variant) => {
                      const selected = entry.selectedVariantId === variant.id;
                      return (
                        <button
                          key={variant.id}
                          type="button"
                          onClick={() =>
                            handleSelectBookingVariant(
                              entry.service.id,
                              variant.id,
                            )
                          }
                          className={`rounded-md border px-1.5 py-0.5 text-[9px] font-semibold transition ${
                            selected
                              ? "border-[#28B8B0] bg-[#28B8B0] text-white"
                              : "border-[#DCEAE8] bg-white text-[#456764]"
                          }`}
                        >
                          {variant.label} · {formatPrice(variant.price)}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => handleRemoveBookingEntry(entry.service.id)}
                aria-label={`Remove ${entry.service.name}`}
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-[#DCEAE8] bg-white text-[#718785] transition hover:border-[#E7B5AA] hover:bg-[#FDF1EE] hover:text-[#B23B23]"
              >
                <Trash2 size={13} />
              </button>
            </li>
          );
        })}
      </ol>
    );
  }

  function renderBookingServicesPanel() {
    const branchData = branches?.find((b) => b.id === selectedStudio);

    return (
      <div className="space-y-3">
        <div className="rounded-xl border border-[#DCEBE8] bg-[#F8FCFB] p-3">
          <SectionLabel>
            Selected services{branchData ? ` · ${branchData.name}` : ""}
          </SectionLabel>
          {bookingEntries.length === 0 ? (
            <p className="text-[11px] text-[#718785]">
              No services selected yet — add one below.
            </p>
          ) : (
            renderBookingEntryRows()
          )}
        </div>

        <button
          type="button"
          onClick={handleBookingAddMore}
          className={secondaryButtonClasses("py-3")}
        >
          <Plus size={14} />
          Add More Services
        </button>

        {bookingEntries.length > 0 && (
        <button
          type="button"
          onClick={handleBookingBrowseContinue}
          className={primaryButtonClasses()}
        >
          Continue to Booking
        </button>
        )}
      </div>
    );
  }

  function renderBookingDatePanel() {
    return (
      <div className="space-y-3">
        <label className="block">
          <span className="mb-2 block text-[11px] font-medium text-[#718785]">
            Preferred date
          </span>
          <span className="relative block">
            <CalendarDays
              size={13}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#718785]"
            />
            <input
              type="date"
              value={bookingDate}
              min={todayDateString()}
              onChange={(event) => handleDateChange(event.target.value)}
              className="w-full rounded-lg border border-[#DCEAE8] px-4 py-3 pl-10 text-sm text-[#163B38] outline-none focus:border-[#28B8B0]"
              aria-label="Preferred date"
            />
          </span>
        </label>
        <p className="text-[10px] text-[#718785]">
          Pick today or any future date.
        </p>
      </div>
    );
  }

  function renderBookingTimePanel() {
    if (loadingText) return null;

    // Same shared slot list the Services booking modal renders. When a future
    // availability API replaces the constant, this view needs no change — and
    // the "no slots" state below already handles an empty result.
    if (!TIME_SLOTS.length) {
      return (
        <div className="space-y-2.5 text-center">
          <p className="text-[12px] font-medium text-[#456764]">
            No available slots for this date.
          </p>
          <button
            type="button"
            onClick={goBack}
            className={pillClasses()}
          >
            Choose Another Date
          </button>
        </div>
      );
    }

    const visibleSlots = TIME_SLOTS.slice(0, visibleSlotCount);
    const hasMore = visibleSlotCount < TIME_SLOTS.length;

    return (
      <div className="space-y-3">
        <SectionLabel>Preferred time</SectionLabel>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {visibleSlots.map((time) => {
            const selected = selectedTime === time;
            return (
              <button
                key={time}
                type="button"
                onClick={() => handleSelectTime(time)}
                className={`rounded-lg border px-1 py-2.5 text-[10.5px] font-medium transition ${
                  selected
                    ? "border-[#28B8B0] bg-[#28B8B0] text-white"
                    : "border-[#DCEAE8] bg-white text-[#456764] hover:border-[#28B8B0] hover:bg-[#F1FAF8]"
                }`}
              >
                {selected && <Check size={9} className="mr-0.5 inline-block" />}
                {time}
              </button>
            );
          })}
        </div>
        {hasMore && (
          <button
            type="button"
            onClick={() => setVisibleSlotCount(TIME_SLOTS.length)}
            className={pillClasses()}
          >
            See More
          </button>
        )}
      </div>
    );
  }

  function renderBookingCustomerPanel() {
    return (
      <div className="space-y-3">
        <div>
          <label
            htmlFor="chat-customer-name"
            className="mb-2 block text-[11px] font-medium text-[#718785]"
          >
            What is your name?
          </label>
          <input
            id="chat-customer-name"
            type="text"
            value={customerName}
            onChange={(event) => setCustomerName(event.target.value)}
            placeholder="Your name"
            className="w-full rounded-lg border border-[#DCEAE8] px-4 py-3 text-sm text-[#163B38] outline-none placeholder:text-[#A2B1AF] focus:border-[#28B8B0]"
          />
        </div>
        <div>
          <label
            htmlFor="chat-customer-phone"
            className="mb-2 block text-[11px] font-medium text-[#718785]"
          >
            What is your phone number?
          </label>
          <input
            id="chat-customer-phone"
            type="tel"
            inputMode="numeric"
            value={phone}
            onChange={(event) => handlePhoneChange(event.target.value)}
            placeholder="10-digit mobile number"
            className="w-full rounded-lg border border-[#DCEAE8] px-4 py-3 text-sm text-[#163B38] outline-none placeholder:text-[#A2B1AF] focus:border-[#28B8B0]"
          />
        </div>
        <button
          type="button"
          onClick={handleCustomerContinue}
          className={primaryButtonClasses()}
        >
          Continue
        </button>
      </div>
    );
  }

  function renderBookingReviewPanel() {
    const branchData = branches?.find((b) => b.id === selectedStudio);
    const { total, allExact } = computeBookingTotal(bookingEntries);

    return (
      <div className="space-y-3">
        <div className="rounded-xl border border-[#BFE7E1] bg-[#EAF7F5] p-3.5 text-[12px]">
          <SectionLabel>Please review your appointment</SectionLabel>
          <div className="space-y-1 text-[#285F5A]">
            <p>
              <span className="font-semibold text-[#09221F]">Branch:</span>{" "}
              {branchData?.name ?? "—"}
            </p>
            <p>
              <span className="font-semibold text-[#09221F]">Date:</span>{" "}
              {formatDateDisplay(bookingDate)}
            </p>
            <p>
              <span className="font-semibold text-[#09221F]">Time:</span>{" "}
              {selectedTime}
            </p>
            <div>
              <span className="font-semibold text-[#09221F]">Services:</span>
              <ol className="mt-0.5 space-y-0.5">
                {bookingEntries.map((entry, index) => {
                  const variant = getSelectedVariant(
                    entry.service,
                    entry.selectedVariantId,
                  );
                  const exact = isPriceExact(entry);
                  const price = selectedPrice(entry);
                  return (
                    <li key={entry.service.id}>
                      {index + 1}. {entry.service.name}
                      {variant && (
                        <span className="block pl-4 text-[10.5px] text-[#456764]">
                          Variant: {variant.label} · Price: {formatPrice(price)} + tax
                        </span>
                      )}
                      {!variant && !exact && (
                        <span className="block pl-4 text-[10.5px] text-[#456764]">
                          Price: from {formatPrice(price)} + tax
                        </span>
                      )}
                      {!variant && exact && price != null && (
                        <span className="block pl-4 text-[10.5px] text-[#456764]">
                          Price: {formatPrice(price)} + tax
                        </span>
                      )}
                    </li>
                  );
                })}
              </ol>
            </div>
            <p>
              <span className="font-semibold text-[#09221F]">Name:</span>{" "}
              {customerName}
            </p>
            <p>
              <span className="font-semibold text-[#09221F]">Phone:</span>{" "}
              {phone}
            </p>
            <p className="pt-1 text-[11px] font-semibold text-[#09221F]">
              Estimated total:{" "}
              {allExact
                ? `${formatPrice(total)} + tax`
                : `From ${formatPrice(total)} + tax`}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleConfirmBooking}
          className={primaryButtonClasses()}
        >
          <MessageCircle size={15} />
          Confirm Booking
        </button>
        <button type="button" onClick={goBack} className={secondaryButtonClasses()}>
          Edit
        </button>
      </div>
    );
  }

  function renderBookingSuccessPanel() {
    const branchData = branches?.find((b) => b.id === selectedStudio);
    return (
      <div className="space-y-3 text-center">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#E8F5F3]">
          <Check size={22} className="text-[#218F87]" />
        </span>
        <div className="space-y-1">
          <p className="text-[13.5px] font-semibold text-[#0F2A27]">
            Your booking request has been sent successfully.
          </p>
          <p className="text-[11.5px] text-[#5F7774]">
            Our team will confirm your appointment shortly.
          </p>
        </div>
        <div className="rounded-xl border border-[#BFE7E1] bg-[#EAF7F5] p-3 text-[11.5px] text-[#285F5A]">
          <p className="font-semibold text-[#09221F]">
            {branchData?.name ?? ""}
          </p>
          <p className="mt-0.5">
            {formatDateDisplay(bookingDate)} · {selectedTime}
          </p>
        </div>
        <button
          type="button"
          onClick={goHome}
          className={primaryButtonClasses()}
        >
          Back to Home
        </button>
      </div>
    );
  }

  function renderViewPanel() {
    switch (view) {
      case VIEWS.LOCATIONS:
        return renderLocationsPanel();
      case VIEWS.BOOKING_BRANCH:
        return renderBookingBranchPanel();
      case VIEWS.BOOKING_CATEGORIES:
        return renderBookingCategoriesPanel();
      case VIEWS.BOOKING_SUBCATEGORIES:
        return renderBookingSubCategoriesPanel();
      case VIEWS.BOOKING_SERVICES_LIST:
        return renderBookingServicesListPanel();
      case VIEWS.BOOKING_SERVICE_PICK:
        return renderBookingServicePickPanel();
      case VIEWS.BOOKING_SERVICES:
        return renderBookingServicesPanel();
      case VIEWS.BOOKING_DATE:
        return renderBookingDatePanel();
      case VIEWS.BOOKING_TIME:
        return renderBookingTimePanel();
      case VIEWS.BOOKING_CUSTOMER:
        return renderBookingCustomerPanel();
      case VIEWS.BOOKING_REVIEW:
        return renderBookingReviewPanel();
      case VIEWS.BOOKING_SUCCESS:
        return renderBookingSuccessPanel();
      default:
        return null;
    }
  }

  const canGoBack = navigationStack.length > 0;

  return (
    <>
      {/* ============================================
          FLOATING AI CHAT BUTTON
          ============================================ */}
      <div className="relative">
        {!isOpen && (
          <span
            className="
              absolute
              bottom-full
              right-15
              translate-x-1/2
              whitespace-nowrap
              rounded-tl-lg rounded-tr-lg rounded-bl-lg rounded-br-none
              mb-1
              bg-[#35c1af]
              px-2.5
              py-1
              text-[11px]
              font-medium
              text-white
              shadow-[0_4px_14px_rgba(9,45,42,0.12)]
              md:text-[12px]
            "
          >
            Chat Now
          </span>
        )}

        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          aria-label={isOpen ? "Close chat assistant" : "Chat Now"}
          aria-expanded={isOpen}
          aria-haspopup="dialog"
          aria-controls="ai-chat-popup"
          className={`flex h-18 w-18 items-center justify-center overflow-hidden rounded-full transition-all duration-300 hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#27A399] md:h-16 md:w-16 ${
            isOpen
              ? "bg-[#1e847c] text-white shadow-[0_8px_25px_rgba(39,163,153,0.35)] hover:bg-[#218F87]"
              : "border border-white bg-[#27A399] shadow-[0_8px_25px_rgba(9,45,42,0.18)]"
          }`}
        >
          {isOpen ? (
            <X size={26} />
          ) : (
            <Image
              src="/images/ai-bot.png"
              alt="The Nail Hue AI Assistant"
              width={52}
              height={52}
              priority
              className="h-14 w-14 object-contain md:h-14 md:w-14"
            />
          )}
        </button>
      </div>

      {/* ============================================
          CHAT POPUP
          ============================================ */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="ai-chat-popup"
            id="ai-chat-popup"
            role="dialog"
            aria-modal="false"
            aria-labelledby="ai-chat-title"
            onKeyDown={(event) => {
              if (event.key === "Escape") {
                setIsOpen(false);
              }
            }}
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 10 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="
              fixed
              inset-x-3
              bottom-[calc(24px+env(safe-area-inset-bottom))]
              z-50
              flex
              h-[min(620px,calc(100dvh-110px))]
              max-h-[calc(100dvh-100px)]
              flex-col
              overflow-hidden
              rounded-[22px]
              border
              border-[#D5EBE8]
              bg-white
              shadow-[0_20px_60px_rgba(9,45,42,0.16)]

              sm:inset-x-auto
              sm:bottom-24
              sm:right-6
              sm:h-[520px]
              sm:max-h-[calc(100vh-120px)]
              sm:w-[360px]
              sm:rounded-3xl

              md:bottom-[120px]
              md:right-7
              md:h-[560px]
              md:w-[380px]
            "
          >
            {/* ============================================
                HEADER — Back / identity / Home+Refresh+Close
                ============================================ */}
            <div className="flex shrink-0 items-center justify-between gap-1.5 border-b border-[#E4EFED] bg-[#E8F5F3] px-2.5 py-3 sm:px-4">
              <button
                type="button"
                onClick={goBack}
                disabled={!canGoBack}
                aria-label="Go back"
                title="Go back"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[#163B38] transition-colors hover:bg-[#D9EEEA] disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:bg-transparent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#27A399]"
              >
                <ArrowLeft size={17} />
              </button>

              <div className="flex min-w-0 flex-1 items-center gap-2">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white shadow-sm">
                  <Image
                    src="/images/ai-bot.png"
                    alt=""
                    width={32}
                    height={32}
                    className="h-8 w-8 object-contain"
                  />
                </span>
                <div className="min-w-0">
                  <p
                    id="ai-chat-title"
                    className="truncate text-[13.5px] font-semibold text-[#0F2A27] sm:text-[14.5px]"
                  >
                    Chat with us
                  </p>
                  <p className="truncate text-[10.5px] text-[#5F7774] sm:text-[11.5px]">
                    Usually replies in a few seconds
                  </p>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-1">
                <button
                  type="button"
                  onClick={goHome}
                  aria-label="Go to home"
                  title="Go to home"
                  className="flex h-9 w-9 items-center justify-center rounded-full text-[#163B38] transition-colors hover:bg-[#D9EEEA] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#27A399]"
                >
                  <Home size={16} />
                </button>
                <button
                  type="button"
                  onClick={restartChat}
                  aria-label="Restart chat"
                  title="Restart chat"
                  className="flex h-9 w-9 items-center justify-center rounded-full text-[#163B38] transition-colors hover:bg-[#D9EEEA] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#27A399]"
                >
                  <RefreshCw size={15} />
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  aria-label="Close chat"
                  title="Close chat"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-[#47dbd1] text-[#163B38] transition-colors hover:bg-[#36c9bf] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#27A399]"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* ============================================
                MESSAGES + ACTIVE VIEW PANEL
                ============================================ */}
            <div className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain px-4 py-4">
              {messages.length === 0 && view === VIEWS.WELCOME && !loadingText ? (
                <WelcomePanel
                  onBook={startBooking}
                  onLocations={startLocations}
                  disabled={welcomeActionsUsed}
                />
              ) : (
                <div className="space-y-3">
                  {messages.map((message) => (
                    <ChatBubble
                      key={message.id}
                      message={message}
                      actionsDisabled={welcomeActionsUsed}
                      onAction={handleWelcomeAction}
                    />
                  ))}

                  {loadingText && <TypingIndicator />}

                  {/* NOTE: there is intentionally NO global welcome-action row
                      here. The Book an Appointment / Salon Locations buttons
                      render in exactly ONE place — the action row of the
                      assistant message that carries them (initial WelcomePanel
                      for an empty log, greeting reply, or the post-Home
                      welcome message). A second global row would duplicate
                      the buttons after every greeting. */}

                  {!loadingText && view !== VIEWS.WELCOME && renderViewPanel()}
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* ============================================
                INPUT
                ============================================ */}
            <div
              className="flex shrink-0 items-end gap-2 border-t border-[#E4EFED] bg-white px-3 py-2.5"
              style={{
                paddingBottom: "calc(0.625rem + env(safe-area-inset-bottom))",
              }}
            >
              <textarea
                ref={textareaRef}
                value={inputValue}
                onChange={(event) => setInputValue(event.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your message..."
                aria-label="Type your message"
                rows={1}
                className="max-h-24 flex-1 resize-none rounded-2xl border border-[#DCEAE8] bg-[#FAFDFC] px-3.5 py-2.5 text-[13.5px] leading-snug text-[#163B38] placeholder:text-[#8FA3A1] outline-none transition-colors focus:border-[#27A399] focus:bg-white"
              />

              <button
                type="button"
                onClick={() => sendMessage(inputValue)}
                disabled={!inputValue.trim()}
                aria-label="Send message"
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#27A399] text-white shadow-sm transition hover:bg-[#218F87] disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#218F87]"
              >
                <Send size={17} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
