"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { BellIcon, CheckCircleIcon, XCircleIcon, GavelIcon, InfoIcon, Trash2Icon } from "lucide-react";
import axios from "axios";

interface Notification {
  _id: string;
  type: "bid" | "win" | "close" | "admin" | "general";
  message: string;
  isRead: boolean;
  createdAt: string;
}

export default function NotificationPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  //function for deleting a notification
  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`/api/notification/${id}`);
      setNotifications((prev) => prev.filter((note) => note._id !== id));
    } catch (error) {
      console.error("Failed to delete notification", error);
    }
  };

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await axios.get("/api/notification");
        setNotifications(res.data.notifications);
      } catch (error) {
        if (axios.isAxiosError(error)) {
          console.error("Failed to load notifications:", error.response?.data || error.message);
        } else {
          console.error("Failed to load notifications:", error);
        }
      }

    };

    fetchNotifications();
  }, []);

  const getIcon = (type: Notification["type"]) => {
    switch (type) {
      case "bid":
        return <GavelIcon className="text-indigo-600" />;
      case "win":
        return <CheckCircleIcon className="text-green-600" />;
      case "close":
        return <XCircleIcon className="text-red-600" />;
      case "admin":
        return <InfoIcon className="text-yellow-600" />;
      default:
        return <BellIcon className="text-emerald-600" />;
    }
  };

  return (
    <section className="max-w-4xl mx-auto px-4 py-10 space-y-10">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <h1 className="text-4xl font-bold text-gray-800">Notifications</h1>
        <p className="text-gray-600 mt-2">Stay updated on your auction activity</p>
      </motion.div>

      <div className="space-y-4">
        {notifications.length === 0 ? (
          <div className="text-center text-gray-500">No notifications yet</div>
        ) : (
          notifications.map((note, index) => (
            <motion.div
              key={note._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`flex items-start gap-4 bg-white p-5 rounded-lg shadow hover:shadow-md transition-all ${note.isRead ? "opacity-60" : ""
                }`}
            >
              <div className="p-3 bg-emerald-100 rounded-full">{getIcon(note.type)}</div>
              <div className="flex-1">
                <p className="text-gray-800 font-medium">{note.message}</p>
                <p className="text-sm text-gray-500 mt-1">
                  {new Date(note.createdAt).toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => handleDelete(note._id)}
                className="ml-auto hover:cursor-pointer p-2 text-red-500 hover:text-red-700"
                title="Delete notification"
              >
                <Trash2Icon className="w-5 h-5" />
              </button>
            </motion.div>
          ))
        )}
      </div>
    </section>
  );
}
