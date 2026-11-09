"use client";

import React, { useState } from "react";
import { X, Mail, Check, Bell } from "lucide-react";

export type NotificationItemData = {
  id: string;
  title: string;
  description: string;
  time: string;
  unread: boolean;
  group: "today" | "yesterday";
};

export const INITIAL_NOTIFICATIONS: NotificationItemData[] = [
  {
    id: "1",
    title: "Email Campaign Sent",
    description: "Your Spring Sale Promo email just went out to 10,000 users. 🎉",
    time: "13 February, 2025 • 10:45 AM",
    unread: true,
    group: "today",
  },
  {
    id: "2",
    title: "Open Rate Update",
    description: "Your last email campaign reached a 45% open rate. Trending u...",
    time: "13 February, 2025 • 8:30 AM",
    unread: true,
    group: "today",
  },
  {
    id: "3",
    title: "High Engagement Alert",
    description: "iPhone 15 Flash Sale push notification had a 28% CTR! That's 🔥.",
    time: "13 February, 2025 • 00:00 AM",
    unread: true,
    group: "today",
  },
  {
    id: "4",
    title: "Ad Budget Update",
    description: "Your sponsored ad for Gaming Laptops has used 75% of its bu...",
    time: "13 February, 2025 • 10:45 AM",
    unread: false,
    group: "yesterday",
  },
  {
    id: "5",
    title: "Scheduled Email Reminder",
    description: "Laptop Clearance Sale email is scheduled for tomorrow at 11:11...",
    time: "13 February, 2025 • 8:30 AM",
    unread: false,
    group: "yesterday",
  },
  {
    id: "6",
    title: "New Leads Captured",
    description: "You gained 350 new email subscribers from the ad campaign! 👥",
    time: "13 February, 2025 • 00:00 AM",
    unread: false,
    group: "yesterday",
  },
  {
    id: "7",
    title: "Sponsored Listing Expiring",
    description: "Your Featured Laptop Ad expires in 24 hours.",
    time: "13 February, 2025 • 00:00 AM",
    unread: false,
    group: "yesterday",
  },
  {
    id: "8",
    title: "Pending Approval",
    description: "Your document export request is awaiting manager approval.",
    time: "13 February, 2025 • 00:00 AM",
    unread: false,
    group: "yesterday",
  },
];

export function NotificationDrawer({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);

  const toggleRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, unread: !n.unread } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  const unreadCount = notifications.filter((n) => n.unread).length;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity duration-300 animate-in fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-over panel (Image 2 style) */}
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <aside
          role="dialog"
          aria-label="Notifications"
          aria-modal="true"
          className="w-screen max-w-md bg-white dark:bg-zinc-900 border-l border-black/[0.06] dark:border-white/[0.08] shadow-2xl flex flex-col animate-in slide-in-from-right duration-300 ease-out"
        >
          {/* Header (Image 2) */}
          <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex items-start justify-between">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white">
                Notification
              </h2>
              <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">
                You have {unreadCount} notification today.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 flex items-center justify-center transition-colors"
              aria-label="Close notifications"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Action: Mark all read */}
          {unreadCount > 0 && (
            <div className="px-6 py-2 bg-blue-50/50 dark:bg-blue-950/20 border-b border-blue-100/50 dark:border-blue-900/30 flex items-center justify-between text-xs">
              <span className="text-blue-600 dark:text-blue-400 font-medium">
                {unreadCount} unread
              </span>
              <button
                type="button"
                onClick={markAllAsRead}
                className="text-blue-600 hover:underline font-semibold"
              >
                Mark all as read
              </button>
            </div>
          )}

          {/* Scrollable List */}
          <div className="flex-1 overflow-y-auto divide-y divide-zinc-50 dark:divide-zinc-800/40 p-4 space-y-4">
            {/* Today Section */}
            <div>
              <div className="px-2 py-1.5 text-xs font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider">
                Today
              </div>
              <div className="space-y-1 mt-1">
                {notifications
                  .filter((n) => n.group === "today")
                  .map((item) => (
                    <NotificationRow
                      key={item.id}
                      item={item}
                      onToggle={() => toggleRead(item.id)}
                    />
                  ))}
              </div>
            </div>

            {/* Yesterday Section */}
            <div className="pt-4">
              <div className="px-2 py-1.5 text-xs font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider">
                Yesterday
              </div>
              <div className="space-y-1 mt-1">
                {notifications
                  .filter((n) => n.group === "yesterday")
                  .map((item) => (
                    <NotificationRow
                      key={item.id}
                      item={item}
                      onToggle={() => toggleRead(item.id)}
                    />
                  ))}
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function NotificationRow({
  item,
  onToggle,
}: {
  item: NotificationItemData;
  onToggle: () => void;
}) {
  return (
    <div
      onClick={onToggle}
      className={`group flex items-start gap-3.5 p-3 rounded-2xl cursor-pointer transition-all duration-200 ${
        item.unread
          ? "bg-blue-50/40 dark:bg-blue-950/20 hover:bg-blue-50/70 dark:hover:bg-blue-950/30"
          : "hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
      }`}
    >
      {/* Blue Square Mail Icon (Image 2) */}
      <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm shadow-blue-500/20 group-hover:scale-105 transition-transform">
        <Mail className="w-4 h-4" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <h4
            className={`text-xs sm:text-sm font-semibold truncate ${
              item.unread
                ? "text-zinc-900 dark:text-white"
                : "text-zinc-700 dark:text-zinc-300"
            }`}
          >
            {item.title}
          </h4>
          {item.unread && (
            <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0" />
          )}
        </div>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-1 mt-0.5 leading-relaxed">
          {item.description}
        </p>
        <span className="text-[10px] text-zinc-400 font-mono mt-1 block">
          {item.time}
        </span>
      </div>
    </div>
  );
}

