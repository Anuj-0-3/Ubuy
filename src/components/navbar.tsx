'use client';

import React, { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { Button } from './ui/button';
import { Menu, X, Bell } from "lucide-react";
import { motion } from 'framer-motion';
import axios from 'axios';
import NotificationDropdown from './NotificationDropdown';  // Import NotificationDropdown component
import Link from 'next/link';

type Notification = {
  _id: string;
  type: string;
  message: string;
  isRead: boolean;
  createdAt: string;
};

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);  // Control the notification dropdown
  const [notifications, setNotifications] = useState<Notification[]>([]);  // Ensure notifications use the correct type
  const { data: session } = useSession();

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await axios.get("/api/notification");
        setNotifications(res.data.notifications);  // Fetch and set notifications from API
      } catch (error) {
        console.error("Failed to load notifications:", error);
      }
    };

    if (session) fetchNotifications();  // Fetch notifications if session exists
  }, [session]);

  const unreadCount = notifications.filter(notification => !notification.isRead).length;

  return (
    <nav className="fixed top-0 left-0 w-full px-8 sm:px-16 z-50 p-6 shadow-md bg-emerald-600 text-white">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-xl font-bold">
          <h1 className='text-3xl font-bold text-slate-100 font-sans'>U-Buy</h1>
        </Link>

        {/* Mobile Navigation */}
        <div className="md:hidden flex items-center space-x-4">
          {session && (
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="relative p-2 hover:bg-emerald-700 rounded-full"
            >
              <Bell className="text-white w-6 h-6" />
              {/* Badge for unread notifications */}
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>
          )}

          {/* Mobile Menu Button */}
          <button className="text-white" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-4">
          {session ? (
            <>
              <Link href="/auctions" className="hover:text-slate-100">Auctions</Link>
              <Link href="/create-auction" className="hover:text-slate-100">Create Auction</Link>
              <Link href="/bidded-auctions" className="hover:text-slate-100">Bidded Auctions</Link>
              <Link href="/profile" className="hover:text-slate-100">Profile</Link>
              <Button onClick={() => signOut()} className="bg-slate-100 hover:cursor-pointer text-emerald-600" variant='outline'>Logout</Button>
            </>
          ) : (
            <>
              <Link href="/sign-in">
                <Button className="bg-slate-100 hover:cursor-pointer text-emerald-600" variant='outline'>Login</Button>
              </Link>
              <Link href="/sign-up">
                <Button className="bg-slate-100 hover:cursor-pointer text-emerald-600" variant='outline'>Sign-Up</Button>
              </Link>
            </>
          )}

          {/* Bell Icon for Notifications - Desktop view */}
          {session && (
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="relative p-2 hover:bg-emerald-700 rounded-full"
            >
              <Bell className="text-white w-6 h-6" />
              {/* Badge for unread notifications */}
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>
          )}

          {/* Notification Dropdown */}
          {notificationsOpen && <NotificationDropdown notifications={notifications} onClose={() => setNotificationsOpen(false)} />}
        </div>
      </div>

      {/* Mobile Navigation sliding from the right */}
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: isOpen ? 0 : '100%' }}
        transition={{ type: 'tween', duration: 0.3 }}
        className="fixed top-0 right-0 h-full w-64 bg-emerald-700 text-white flex flex-col p-6 space-y-4 md:hidden z-50"
      >
        <button className="self-end mb-4" onClick={() => setIsOpen(false)}>
          <X size={24} />
        </button>
        {session ? (
          <>
            <Link href="/auctions" className="hover:text-slate-100" onClick={() => setIsOpen(false)}>Auctions</Link>
            <Link href="/create-auction" className="hover:text-slate-100" onClick={() => setIsOpen(false)}>Create Auction</Link>
            <Link href="/bidded-auctions" className="hover:text-slate-100" onClick={() => setIsOpen(false)}>Bidded Auction</Link>
            <Link href="/profile" className="hover:text-slate-100" onClick={() => setIsOpen(false)}>Profile</Link>
            <Button
              onClick={() => { signOut(); setIsOpen(false); }}
              className="bg-slate-100 text-emerald-600"
              variant='outline'
            >
              Logout
            </Button>
          </>
        ) : (
          <>
            <Link href="/sign-in" onClick={() => setIsOpen(false)}>
              <Button className="bg-slate-100 w-full text-emerald-600" variant='outline'>Login</Button>
            </Link>
            <Link href="/sign-up" onClick={() => setIsOpen(false)}>
              <Button className="bg-slate-100 w-full text-emerald-600" variant='outline'>Sign-Up</Button>
            </Link>
          </>
        )}

      {/* Notification Dropdown for mobile */}
      {notificationsOpen && <NotificationDropdown notifications={notifications} onClose={() => setNotificationsOpen(false)} />}
    </motion.div>
    </nav >
  );
}

export default Navbar;



