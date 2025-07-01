"use client";

import { Menu, Bell, ChevronLeft, BadgeIndianRupee, User, Heart } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import Link from "next/link";

export default function ProfileSidebar() {
  const [isCollapsed, setIsCollapsed] = useState(true);

  const menuItems = [
    { href: "/profile", icon: <User className="w-5 h-5" />, label: "Profile" },
    { href: "/profile/notifications", icon: <Bell className="w-5 h-5" />, label: "Notifications" },
    { href: "/profile/my-auction", icon: <BadgeIndianRupee className="w-5 h-5" />, label: "Created Auction" },
    { href: "/profile/wishlist", icon: <Heart className="w-5 h-5" />, label: "Wishlist" }, 
  ];

  return (
    <div className="flex min-h-[80vh] bg-white relative overflow-visible">
      {/* Side Panel */}
      <motion.aside
        animate={{ width: isCollapsed ? 64 : 240 }}
        transition={{ duration: 0.3 }}
        className="bg-emerald-100 shadow-lg flex flex-col gap-4 py-4 overflow-visible relative"
      >
        <div className="flex flex-col items-center md:items-start px-2">
          {/* Collapse/Expand Button with tooltip */}
          <div className="relative group w-full hidden sm:block">
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="mb-4 flex items-center justify-center sm:justify-start w-full p-2 hover:bg-emerald-200 rounded-full transition"
              aria-label="Toggle Panel"
            >
              {isCollapsed ? (
                <Menu className="w-5 h-5 text-emerald-700" />
              ) : (
                <ChevronLeft className="w-5 h-5 text-emerald-700" />
              )}
            </button>

            {isCollapsed && (
              <div className="absolute left-full top-1/2 ml-2 -translate-y-1/2 px-3 py-1 bg-emerald-600 text-white text-xs rounded shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50">
                {isCollapsed ? "Expand Menu" : "Collapse Menu"}
              </div>
            )}
          </div>

          {/* Menu Links with tooltips */}
          {menuItems.map((item, idx) => (
            <div key={idx} className="relative group w-full">
              <Link
                href={item.href}
                className="flex items-center justify-center sm:justify-start gap-2 text-gray-700 hover:text-emerald-700 w-full py-2 px-2 transition-colors rounded-md hover:bg-emerald-200"
              >
                {item.icon}
                {!isCollapsed && <span>{item.label}</span>}
              </Link>

              {/* Tooltip for menu items */}
              {isCollapsed && (
                <div className="absolute left-full top-1/2 ml-2 -translate-y-1/2 px-3 py-1 bg-emerald-600 text-white text-xs rounded shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                  {item.label}
                </div>
              )}
            </div>
          ))}
        </div>
      </motion.aside>
    </div>
  );
}

