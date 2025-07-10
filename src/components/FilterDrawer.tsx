"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface FilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export default function FilterDrawer({ isOpen, onClose, title = "Filters", children }: FilterDrawerProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/80 bg-opacity-20"
            onClick={onClose}
          />

          {/* Sliding Panel */}
          <motion.div
            className="relative bg-white rounded-t-xl w-full p-3 max-h-[80vh] overflow-y-auto space-y-3"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">{title}</h3>
              <Button
                size="sm"
                variant="outline"
                onClick={onClose}
                className="bg-red-500 text-white hover:bg-red-600"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
