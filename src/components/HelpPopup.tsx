'use client';
import { useState } from "react";
import { motion } from "framer-motion";
import { HelpCircle, X } from "lucide-react";

const faqData = {
  Bidding: [
    { q: "How do I place a bid?", a: "Click on 'Start Bidding', enter your amount, and confirm." },
    { q: "Can I cancel my bid?", a: "No, bids are final. Contact support for exceptions." },
  ],
  Selling: [
    { q: "How do I sell an item?", a: "Click 'Sell an Item', fill in details, and upload photos." },
    { q: "Is there a listing fee?", a: "Listing is free. A platform fee applies after the sale." },
  ],
  Account: [
    { q: "Do I need an account to bid?", a: "Yes, please sign in or create an account to start bidding." },
    { q: "How do I reset my password?", a: "Go to 'Sign In' and click 'Forgot Password'. Follow instructions." },
  ],
};

type FaqCategory = keyof typeof faqData;

type Message = {
  type: "bot" | "user";
  text: string;
  category?: string;
  questionIndex?: number;
};

export default function HelpChatBot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { type: "bot", text: "Hi! 👋 What do you need help with?" },
  ]);
  const [selectedCategory, setSelectedCategory] = useState<FaqCategory | null>(null);
  const [currentStep, setCurrentStep] = useState<"category" | "question" | "reset">("category");

  const handleCategorySelect = (category: string) => {
    setMessages((prev) => [
      ...prev,
      { type: "user", text: category },
      { type: "bot", text: `Great! Here are some common questions about ${category}:` },
    ]);
    setSelectedCategory(category as FaqCategory);
    setCurrentStep("question");
  };

  const handleQuestionClick = (question: string, answer: string, index: number) => {
    setMessages((prev) => [
      ...prev,
      { type: "user", text: question, category: selectedCategory!, questionIndex: index },
      { type: "bot", text: answer },
    ]);
    setTimeout(() => {
      resetToMainMenu();
    }, 600);
  };

  const resetToMainMenu = () => {
    setMessages((prev) => [
      ...prev,
      { type: "bot", text: "🔙 Back to Main Menu", questionIndex: -1 }
    ]);
    setCurrentStep("reset");
  };

  const handleBackClick = () => {
    setMessages([{ type: "bot", text: "Hi! 👋 What do you need help with?" }]);
    setCurrentStep("category");
    setSelectedCategory(null);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {!open ? (
        <button
          onClick={() => setOpen(true)}
          className="bg-emerald-600 text-white p-3 rounded-full shadow-lg hover:bg-emerald-700"
          aria-label="Open help chatbot"
        >
          <HelpCircle size={24} />
        </button>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-xl p-4 w-[340px] max-h-[70vh] flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-md font-bold text-emerald-700">Assistant</h2>
            <button
              onClick={() => {
                setOpen(false);
                setTimeout(() => {
                  setMessages([{ type: "bot", text: "Hi! 👋 What do you need help with?" }]);
                  setCurrentStep("category");
                  setSelectedCategory(null);
                }, 200);
              }}
              className="text-gray-400 hover:text-gray-600"
            >
              <X size={18} />
            </button>
          </div>

          {/* Chat window */}
          <div className="flex-1 overflow-y-auto space-y-3 px-1 pb-2">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`max-w-[85%] px-3 py-2 rounded-lg text-sm ${
                  msg.type === "bot"
                    ? "bg-gray-100 text-gray-800 self-start"
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

            {/* Show categories if on "category" step */}
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

            {/* Show questions if on "question" step */}
            {currentStep === "question" && selectedCategory && (
              <div className="space-y-2 mt-2">
                {faqData[selectedCategory].map((faq, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleQuestionClick(faq.q, faq.a, idx)}
                    className="w-full text-left px-3 py-2 rounded-md bg-gray-50 border border-gray-200 hover:bg-gray-100 text-sm"
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

