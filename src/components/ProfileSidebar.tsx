"use client";

import { Menu, Bell, ChevronLeft, BadgeIndianRupee, User } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import Link from "next/link";

export default function ProfileSidebar() {
  const [isCollapsed, setIsCollapsed] = useState(true); 

  return (
    <div className="flex min-h-[80vh] bg-white relative overflow-hidden">
      {/* Side Panel */}
      <motion.aside
        animate={{ width: isCollapsed ? 64 : 240 }}
        transition={{ duration: 0.3 }}
        className="bg-emerald-100 shadow-lg flex flex-col gap-4 py-4 overflow-hidden"
      >
        <div className="flex flex-col items-center md:items-start px-2">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="mb-4 items-center justify-start w-full p-2 hover:bg-emerald-200 rounded-full transition hidden sm:block"
            aria-label="Toggle Panel"
          >
            {isCollapsed ? (
              <Menu className="w-5 h-5 text-emerald-700" />
            ) : (
              <ChevronLeft className="w-5 h-5 text-emerald-700" />
            )}
          </button>

          {/* Links */}
          <Link
            href="/profile"
            className="flex items-center gap-2 text-gray-700 hover:text-emerald-700 w-full py-2 px-2 transition-colors rounded-md hover:bg-emerald-200"
          >
            <User className="w-5 h-5" />
            {!isCollapsed && <span>Profile</span>}
          </Link>
          <Link
            href="/profile/notifications"
            className="flex items-center gap-2 text-gray-700 hover:text-emerald-700 w-full py-2 px-2 transition-colors rounded-md hover:bg-emerald-200"
          >
            <Bell className="w-5 h-5" />
            {!isCollapsed && <span>Notifications</span>}
          </Link>
          <Link
            href="/profile/my-auction"
            className="flex items-center gap-2 text-gray-700 hover:text-emerald-700 w-full py-2 px-2 transition-colors rounded-md hover:bg-emerald-200"
          >
            <BadgeIndianRupee className="w-5 h-5" />
            {!isCollapsed && <span>Created Auction</span>}
          </Link>
        </div>
      </motion.aside>
    </div>
  );
}

