"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Mail, ArrowLeft, Check, Sparkles, Bell } from "lucide-react";
import { INITIAL_NOTIFICATIONS, NotificationItemData } from "@/components/layout/notification-drawer";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItemData[]>(INITIAL_NOTIFICATIONS);

  const toggleRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, unread: !n.unread } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  const unreadCount = notifications.filter((n) => n.unread).length;

  return (
    <div className="w-full max-w-4xl mx-auto py-6 sm:py-8 animate-in fade-in duration-300">
      {/* Top Header Card */}
      <div className="rounded-3xl bg-white dark:bg-zinc-900 border border-black/[0.06] dark:border-white/[0.08] shadow-xl overflow-hidden">
        {/* Header (Image 2 style) */}
        <div className="p-6 sm:p-8 border-b border-zinc-100 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <Link
              href="/dashboard"
              className="w-10 h-10 rounded-2xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300 flex items-center justify-center transition-colors"
              aria-label="Back to dashboard"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold font-sans tracking-tight text-zinc-900 dark:text-white">
                Notification
              </h1>
              <p className="text-xs sm:text-sm text-zinc-400 dark:text-zinc-500 mt-0.5">
                You have {unreadCount} notification today.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllAsRead}
                className="px-4 py-2 rounded-full text-xs font-semibold bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 dark:hover:bg-blue-950/60 text-blue-600 dark:text-blue-400 transition-colors"
              >
                Mark all as read
              </button>
            )}
            <span className="px-3 py-1.5 rounded-full text-xs font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
              {notifications.length} total
            </span>
          </div>
        </div>

        {/* Content list */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Today */}
          <div>
            <h2 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider mb-3 px-1">
              Today
            </h2>
            <div className="space-y-2">
              {notifications
                .filter((n) => n.group === "today")
                .map((item) => (
                  <NotificationCard
                    key={item.id}
                    item={item}
                    onToggle={() => toggleRead(item.id)}
                  />
                ))}
            </div>
          </div>

          {/* Yesterday */}
          <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800">
            <h2 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider mb-3 px-1">
              Yesterday
            </h2>
            <div className="space-y-2">
              {notifications
                .filter((n) => n.group === "yesterday")
                .map((item) => (
                  <NotificationCard
                    key={item.id}
                    item={item}
                    onToggle={() => toggleRead(item.id)}
                  />
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function NotificationCard({
  item,
  onToggle,
}: {
  item: NotificationItemData;
  onToggle: () => void;
}) {
  return (
    <div
      onClick={onToggle}
      className={`group flex items-start gap-4 p-4 rounded-2xl cursor-pointer transition-all duration-200 border ${
        item.unread
          ? "bg-blue-50/40 dark:bg-blue-950/20 border-blue-100 dark:border-blue-900/30 hover:border-blue-300 shadow-xs"
          : "bg-white dark:bg-zinc-900/60 border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/40"
      }`}
    >
      {/* Blue Square Mail Icon (Image 2) */}
      <div className="w-11 h-11 rounded-2xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm shadow-blue-500/25 group-hover:scale-105 transition-transform">
        <Mail className="w-5 h-5" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <h3
            className={`text-sm sm:text-base font-semibold truncate ${
              item.unread
                ? "text-zinc-900 dark:text-white"
                : "text-zinc-700 dark:text-zinc-300"
            }`}
          >
            {item.title}
          </h3>
          {item.unread && (
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600 shrink-0" />
          )}
        </div>
        <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 line-clamp-2 mt-1 leading-relaxed">
          {item.description}
        </p>
        <span className="text-[11px] text-zinc-400 font-mono mt-1.5 block">
          {item.time}
        </span>
      </div>
    </div>
  );
}
