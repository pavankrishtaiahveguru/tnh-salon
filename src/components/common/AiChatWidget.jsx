"use client";

import { useEffect, useRef, useState } from "react";
import {  Send, X } from "lucide-react";
import { RiRobot2Line } from "react-icons/ri";
import { interactWithAiAgent } from "@/lib/aiAgent";
import { ApiError } from "@/lib/api";

const FALLBACK_ERROR_MESSAGE =
  "Sorry, I couldn't process your request right now. Please try again.";

let messageIdCounter = 0;
function nextMessageId() {
  messageIdCounter += 1;
  return `msg-${messageIdCounter}`;
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
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
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
      .map(({ role, content }) => ({ role, content }));

    setMessages((prev) => [
      ...prev,
      { id: nextMessageId(), role: "user", content: text },
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
      setCollectedData((prev) => ({ ...prev, ...result.collectedData }));
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
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label={isOpen ? "Close chat assistant" : "Chat with us"}
        aria-expanded={isOpen}
        className="fixed bottom-42 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#27a399] text-white shadow-[0_8px_25px_rgba(39,163,153,0.35)] transition-all duration-300 hover:scale-105 hover:bg-[#218F87] md:bottom-49 md:right-7 md:h-16 md:w-16"
      >
        {isOpen ? (
          <X size={26} />
        ) : (
          <RiRobot2Line size={28} />
        )}
      </button>

      {isOpen && (
        <div className="fixed bottom-62 left-4 right-4 z-50 flex h-[70vh] max-h-[600px] w-auto flex-col overflow-hidden rounded-2xl border border-[#D7EAE7] bg-white shadow-[0_25px_80px_rgba(0,0,0,0.18)] sm:left-auto sm:right-6 sm:w-[380px] md:bottom-72">
          <div className="flex items-center justify-between border-b border-[#E4EFED] bg-[#F8FCFB] px-4 py-3.5">
            <div>
              <p className="text-sm font-bold text-[#09221F]">
                Chat with us
              </p>
              <p className="text-[11px] text-[#718785]">
                We usually reply in a few seconds
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="Close chat"
              className="flex h-8 w-8 items-center justify-center rounded-full border border-[#DCEAE8] text-[#718785] hover:bg-white"
            >
              <X size={15} />
            </button>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
            {messages.length === 0 && (
              <p className="text-center text-[12px] text-[#718785]">
                Hi! Ask us anything about our services, pricing, or
                bookings.
              </p>
            )}

            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed ${
                    message.role === "user"
                      ? "rounded-br-sm bg-[#27a399] text-white"
                      : message.isError
                        ? "rounded-bl-sm bg-[#FBEAEA] text-[#8A3A3A]"
                        : "rounded-bl-sm bg-[#F1F8F6] text-[#163b38]"
                  }`}
                >
                  {message.content}
                </div>
              </div>
            ))}

            {isSending && (
              <div className="flex justify-start">
                <div className="flex items-center gap-1 rounded-2xl rounded-bl-sm bg-[#F1F8F6] px-4 py-3">
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#718785] [animation-delay:-0.3s]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#718785] [animation-delay:-0.15s]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#718785]" />
                </div>
              </div>
            )}

            {quickReplies.length > 0 && !isSending && (
              <div className="flex flex-wrap gap-2 pt-1">
                {quickReplies.map((reply) => (
                  <button
                    key={reply}
                    type="button"
                    onClick={() => sendMessage(reply)}
                    className="rounded-full border border-[#27a399] px-3 py-1.5 text-[12px] font-semibold text-[#218F87] transition hover:bg-[#F1F8F6]"
                  >
                    {reply}
                  </button>
                ))}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <div className="flex items-end gap-2 border-t border-[#E4EFED] px-3 py-3">
            <textarea
              ref={textareaRef}
              value={inputValue}
              onChange={(event) => setInputValue(event.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message..."
              rows={1}
              className="max-h-24 flex-1 resize-none rounded-xl border border-[#DCEAE8] px-3 py-2 text-[13px] text-[#163b38] outline-none focus:border-[#27a399]"
            />
            <button
              type="button"
              onClick={() => sendMessage(inputValue)}
              disabled={isSending || !inputValue.trim()}
              aria-label="Send message"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#27a399] text-white transition hover:bg-[#218F87] disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
