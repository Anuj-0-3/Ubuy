'use client';
import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { HelpCircle, X } from "lucide-react";
import faqData from "@/app/data/faqData";

type FaqCategory = keyof typeof faqData;

type Message = {
  type: "bot" | "user";
  text: string;
  category?: string;
  questionIndex?: number;
};

export default function HelpChatBot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("helpChatMessages");
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });
  const [selectedCategory, setSelectedCategory] = useState<FaqCategory | null>(null);
  const [currentStep, setCurrentStep] = useState<"category" | "question" | "reset">("category");
  const [, setIsLoading] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      const initial: Message[] = [{ type: "bot", text: "Hi! 👋 What do you need help with?" }];
      setMessages(initial);
      setCurrentStep("category");
      setSelectedCategory(null);
      localStorage.setItem("helpChatMessages", JSON.stringify(initial));
    }
  }, [open]);

  useEffect(() => {
    localStorage.setItem("helpChatMessages", JSON.stringify(messages));
    const timeout = setTimeout(() => {
      chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight, behavior: "smooth" });
    }, 100);
    return () => clearTimeout(timeout);
  }, [messages]);

  const handleCategorySelect = (category: string) => {
    const newMessages: Message[] = [
      ...messages,
      { type: "user", text: category },
      { type: "bot", text: `Great! Here are some common questions about ${category}:` },
    ];
    setMessages(newMessages);
    setSelectedCategory(category as FaqCategory);
    setCurrentStep("question");
  };

  const handleQuestionClick = (question: string, answer: string, index: number) => {
    const newMessages: Message[] = [
      ...messages,
      { type: "user", text: question, category: selectedCategory!, questionIndex: index },
      { type: "bot", text: "Typing..." },
    ];
    setMessages(newMessages);
    setIsLoading(true);

    setTimeout(() => {
      const updatedMessages: Message[] = [...newMessages];
      updatedMessages.pop();
      updatedMessages.push({ type: "bot", text: answer });
      updatedMessages.push({ type: "bot", text: "🔙 Back to Main Menu", questionIndex: -1 });
      setMessages(updatedMessages);
      setCurrentStep("reset");
      setIsLoading(false);
    }, 800);
  };

  const handleBackClick = () => {
    const initial: Message[] = [{ type: "bot", text: "Hi! 👋 What do you need help with?" }];
    setMessages(initial);
    setCurrentStep("category");
    setSelectedCategory(null);
    localStorage.setItem("helpChatMessages", JSON.stringify(initial));
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 sm:bottom-4 sm:right-4" aria-live="polite">
      {!open ? (
        <div className="relative group">
          <button
            onClick={() => setOpen(true)}
            className="bg-emerald-600 text-white p-3 rounded-full shadow-lg hover:bg-emerald-700"
            aria-label="Open help chatbot"
          >
            <HelpCircle size={24} />
          </button>
          {/* Tooltip */}
          <div className="absolute bottom-2 mt-2 right-2 -translate-x-1/2 px-3 py-1 bg-emerald-600 text-white text-xs rounded shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
            Help Assistant
          </div>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          role="dialog"
          aria-labelledby="help-chat-header"
          className="bg-white rounded-xl shadow-xl p-4 w-[300px] sm:w-[90vw] max-w-sm max-h-[70vh] flex flex-col overflow-hidden"

        >
          {/* Header */}
          <div className="flex justify-between items-center mb-2">
            <h2 id="help-chat-header" className="text-md font-bold text-emerald-700">
              Assistant
            </h2>
            <button
              onClick={() => setOpen(false)}
              className="text-gray-400 hover:text-gray-600"
              aria-label="Close help chatbot"
            >
              <X size={18} />
            </button>
          </div>

          {/* Chat Window */}
          <div ref={chatRef} className="flex-1 overflow-y-auto space-y-3 px-1 pb-2">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`max-w-[85%] px-3 py-2 rounded-lg text-sm cursor-default ${msg.type === "bot"
                  ? `bg-gray-100 text-gray-800 self-start ${msg.text.includes("Back") ? "hover:bg-gray-200 cursor-pointer" : ""}`
                  : "bg-emerald-600 text-white self-end ml-auto"
                  }`}
                onClick={() => {
                  if (msg.text === "🔙 Back to Main Menu") {
                    handleBackClick();
                  }
                }}
              >
                {msg.text}
              </div>
            ))}

            {/* Categories */}
            {currentStep === "category" && (
              <div className="space-y-2 mt-2">
                {Object.keys(faqData).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => handleCategorySelect(cat)}
                    className="w-full text-left px-4 py-2 rounded-md border border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 text-sm font-medium"
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}

            {/* Questions */}
            {currentStep === "question" && selectedCategory && (
              <div className="space-y-2 mt-2">
                {faqData[selectedCategory].map((faq, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleQuestionClick(faq.q, faq.a, idx)}
                    className="w-full text-left px-3 py-2 rounded-md bg-gray-50 border border-gray-200 hover:bg-gray-100 text-sm transition-colors duration-100"
                  >
                    {faq.q}
                  </button>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}
