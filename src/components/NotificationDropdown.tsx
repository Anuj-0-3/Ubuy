'use client';

import React, { useState } from 'react';
import { Trash2Icon, CheckCircleIcon, XCircleIcon, GavelIcon, InfoIcon, BellIcon } from "lucide-react";
import axios from 'axios';
import Link from 'next/link';

type Notification = {
  _id: string;
  type: string;
  message: string;
  isRead: boolean;
  createdAt: string;
};

interface NotificationDropdownProps {
  notifications: Notification[];
  onClose: () => void; // Callback to close the dropdown
}

function NotificationDropdown({ notifications, onClose }: NotificationDropdownProps) {
  const [notificationsState, setNotificationsState] = useState<Notification[]>(notifications);

  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`/api/notification/${id}`);
      setNotificationsState((prev: Notification[]) => prev.filter((note: Notification) => note._id !== id));
    } catch (error) {
      console.error("Failed to delete notification", error);
    }
  };

  const getIcon = (type: string): React.ReactElement => {
    switch (type) {
      case 'win':
        return <CheckCircleIcon className="text-green-600" />;
      case 'bid':
        return <GavelIcon className="text-indigo-600" />;
      case 'close':
        return <XCircleIcon className="text-red-600" />;
      case 'admin':
        return <InfoIcon className="text-yellow-600" />;
      default:
        return <BellIcon className="text-emerald-600" />;
    }
  };

  return (
    <div className="fixed top-16 right-72 sm:right-16 w-80 sm:w-96 bg-white shadow-lg rounded-lg z-50 p-4 max-h-96 overflow-y-auto md:max-h-[400px] md:top-16">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-700">Notifications</h2>
        <button onClick={onClose} className="text-gray-500">
          <XCircleIcon className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-3">
        {notificationsState.length === 0 ? (
          <div className="text-sm text-gray-500">No new notifications</div>
        ) : (
          notificationsState.map((notification) => (
            <div
              key={notification._id}
              className={`flex items-center gap-3 p-3 rounded-md ${notification.isRead ? 'bg-gray-100' : 'bg-emerald-100'}`}
            >
              {getIcon(notification.type)}
              <div className="flex-1">
                <span className="text-sm text-gray-800">{notification.message}</span>
                <p className="text-xs text-gray-500">{new Date(notification.createdAt).toLocaleString()}</p>
              </div>
              <button onClick={() => handleDelete(notification._id)} className="ml-auto text-red-500">
                <Trash2Icon className="w-5 h-5" />
              </button>
            </div>
          ))
        )}
      </div>

      {/* See all activity link */}
      <div className="mt-4 text-center">
        <Link href="/profile/notifications" className="text-sm text-emerald-600 hover:underline">
          See all recent activity
        </Link>
      </div>
    </div>
  );
}

export default NotificationDropdown;


