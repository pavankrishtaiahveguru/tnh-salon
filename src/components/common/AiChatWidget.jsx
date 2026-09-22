"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Send, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { interactWithAiAgent } from "@/lib/aiAgent";
import { ApiError } from "@/lib/api";

const FALLBACK_ERROR_MESSAGE =
  "Sorry, I couldn't process your request right now. Please try again.";

// Static prompts shown only before the very first API response.
const WELCOME_ACTIONS = [
  "Explore Services",
  "Pricing",
  "Book an Appointment",
  "Our Locations",
];

let messageIdCounter = 0;

function nextMessageId() {
  messageIdCounter += 1;
  return `msg-${messageIdCounter}`;
}

function WelcomeState({ onSelect }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 px-2 text-center">
      {/* AI Bot Image */}
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
        {WELCOME_ACTIONS.map((action) => (
          <button
            key={action}
            type="button"
            onClick={() => onSelect(action)}
            className="rounded-full border border-[#27A399]/60 bg-white px-3.5 py-1.5 text-[12.5px] font-medium text-[#218F87] transition-colors hover:border-[#27A399] hover:bg-[#EFFAF8]"
          >
            {action}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function AiChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [quickReplies, setQuickReplies] = useState([]);
  const [collectedData, setCollectedData] = useState({});
  const [inputValue, setInputValue] = useState("");
  const [isSending, setIsSending] = useState(false);

  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, isSending]);

  useEffect(() => {
    if (isOpen) {
      textareaRef.current?.focus();
    }
  }, [isOpen]);

  async function sendMessage(rawText) {
    const text = rawText.trim();

    if (!text || isSending) return;

    const history = messages
      .filter((message) => !message.isError)
      .map(({ role, content }) => ({
        role,
        content,
      }));

    setMessages((prev) => [
      ...prev,
      {
        id: nextMessageId(),
        role: "user",
        content: text,
      },
    ]);

    setInputValue("");
    setQuickReplies([]);
    setIsSending(true);

    try {
      const result = await interactWithAiAgent({
        question: text,
        history,
        collectedData,
      });

      const answerTexts = result.answers.length
        ? result.answers
        : result.answer
          ? [result.answer]
          : [];

      const assistantMessages = answerTexts.length
        ? answerTexts.map((content) => ({
            id: nextMessageId(),
            role: "assistant",
            content,
          }))
        : [
            {
              id: nextMessageId(),
              role: "assistant",
              content: "I'm here to help — could you rephrase that?",
            },
          ];

      setMessages((prev) => [...prev, ...assistantMessages]);

      setQuickReplies(result.quickReplies);

      setCollectedData((prev) => ({
        ...prev,
        ...result.collectedData,
      }));
    } catch (error) {
      const message =
        error instanceof ApiError ? error.message : FALLBACK_ERROR_MESSAGE;

      setMessages((prev) => [
        ...prev,
        {
          id: nextMessageId(),
          role: "assistant",
          content: message || FALLBACK_ERROR_MESSAGE,
          isError: true,
        },
      ]);
    } finally {
      setIsSending(false);
    }
  }

  function handleKeyDown(event) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage(inputValue);
    }
  }

  return (
    <>
      {/* ============================================
    FLOATING AI CHAT BUTTON
    ============================================ */}
      <div className="relative">
        {/* Chat Now label */}
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
            initial={{
              opacity: 0,
              scale: 0.96,
              y: 10,
            }}
            animate={{
              opacity: 1,
              scale: 1,
              y: 0,
            }}
            exit={{
              opacity: 0,
              scale: 0.96,
              y: 10,
            }}
            transition={{
              duration: 0.2,
              ease: "easeOut",
            }}
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
                HEADER
                ============================================ */}
            <div className="flex items-center justify-between gap-3 border-b border-[#E4EFED] bg-[#E8F5F3] px-4 py-3.5">
              <div className="flex min-w-0 items-center gap-2.5">
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
                    className="truncate text-[14.5px] font-semibold text-[#0F2A27]"
                  >
                    Chat with us
                  </p>

                  <p className="truncate text-[11.5px] text-[#5F7774]">
                    Usually replies in a few seconds
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label="Close chat"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#47dbd1] text-[#163B38] transition-colors hover:bg-[#36c9bf] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#27A399]"
              >
                <X size={16} />
              </button>
            </div>

            {/* ============================================
                MESSAGES
                ============================================ */}
            <div className="flex flex-1 flex-col overflow-y-auto px-4 py-4">
              {messages.length === 0 ? (
                <WelcomeState onSelect={sendMessage} />
              ) : (
                <div className="space-y-3">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.role === "user"
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-[13.5px] leading-relaxed ${
                          message.role === "user"
                            ? "rounded-br-md bg-[#27A399] text-white"
                            : message.isError
                              ? "rounded-bl-md bg-[#FBEAEA] text-[#8A3A3A]"
                              : "rounded-bl-md bg-[#F1F8F6] text-[#163B38]"
                        }`}
                      >
                        {message.content}
                      </div>
                    </div>
                  ))}

                  {/* Typing indicator */}
                  {isSending && (
                    <div className="flex justify-start">
                      <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-md bg-[#F1F8F6] px-4 py-3">
                        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#7C9491] [animation-delay:-0.3s]" />
                        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#7C9491] [animation-delay:-0.15s]" />
                        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#7C9491]" />
                      </div>
                    </div>
                  )}

                  {/* Quick replies */}
                  {quickReplies.length > 0 && !isSending && (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {quickReplies.map((reply) => (
                        <button
                          key={reply}
                          type="button"
                          onClick={() => sendMessage(reply)}
                          className="rounded-full border border-[#27A399]/60 bg-white px-3.5 py-1.5 text-[12.5px] font-medium text-[#218F87] transition-colors hover:border-[#27A399] hover:bg-[#EFFAF8]"
                        >
                          {reply}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* ============================================
                INPUT
                ============================================ */}
            <div
              className="flex items-end gap-2 border-t border-[#E4EFED] bg-white px-3 py-2.5"
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
                disabled={isSending || !inputValue.trim()}
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
