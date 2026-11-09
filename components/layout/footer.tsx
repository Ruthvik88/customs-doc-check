"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ShieldCheck, Check, X, Mail } from "lucide-react";

export function Footer() {
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessage, setChatMessage] = useState("");
  const [chatSent, setChatSent] = useState(false);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;
    setChatSent(true);
    setTimeout(() => {
      setChatMessage("");
      setChatSent(false);
      setChatOpen(false);
    }, 2000);
  };

  return (
    <footer className="relative w-full border-t border-slate-100 dark:border-zinc-800 bg-[#fafafa] dark:bg-[#09090b] text-slate-800 dark:text-zinc-200">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-8 items-start">
          {/* Column 1: Brand Info */}
          <div className="lg:col-span-4 space-y-3">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2.5 text-slate-900 dark:text-white no-underline group"
            >
              <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-sm shadow-blue-500/20 group-hover:scale-105 transition-transform">
                <ShieldCheck className="w-4 h-4" aria-hidden="true" />
              </div>
              <span className="font-heading font-extrabold text-xl tracking-tight text-slate-900 dark:text-white">
                Customs Doc Check
              </span>
            </Link>

            <p className="text-xs text-slate-500 dark:text-zinc-400 font-normal leading-relaxed max-w-sm">
              AI document extraction and cross-check tool for customs brokerage at Nhava Sheva. Verify, cross-reference, and export shipment documentation.
            </p>

            <p className="text-xs text-slate-400 dark:text-zinc-500">
              © 2026 Customs Doc Check. All rights reserved.
            </p>
          </div>

          {/* Column 2: LINKS */}
          <div className="lg:col-span-3 space-y-3">
            <h3 className="text-xs font-bold text-slate-900 dark:text-zinc-100 uppercase tracking-widest">
              CUSTOMS SYSTEMS
            </h3>
            <ul className="space-y-2.5 text-xs text-slate-500 dark:text-zinc-400 list-none p-0 m-0">
              <li>
                <Link
                  href="/dashboard"
                  className="hover:text-slate-900 dark:hover:text-white transition-colors no-underline"
                >
                  Shipments Registry
                </Link>
              </li>
              <li>
                <Link
                  href="/reports"
                  className="hover:text-slate-900 dark:hover:text-white transition-colors no-underline"
                >
                  Extraction Accuracy Report
                </Link>
              </li>
              <li>
                <Link
                  href="/export"
                  className="hover:text-slate-900 dark:hover:text-white transition-colors no-underline"
                >
                  Approved Shipments Export
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: LEGAL */}
          <div className="lg:col-span-2 space-y-3">
            <h3 className="text-xs font-bold text-slate-900 dark:text-zinc-100 uppercase tracking-widest">
              COMPLIANCE
            </h3>
            <ul className="space-y-2.5 text-xs text-slate-500 dark:text-zinc-400 list-none p-0 m-0">
              <li>
                <span className="text-zinc-500 dark:text-zinc-400">
                  Terms of Service
                </span>
              </li>
              <li>
                <span className="text-zinc-500 dark:text-zinc-400">
                  Customs Privacy Policy
                </span>
              </li>
              <li>
                <span className="text-zinc-500 dark:text-zinc-400">
                  Data Processing Agreement
                </span>
              </li>
            </ul>
          </div>

          {/* Column 4: CONTACT */}
          <div className="lg:col-span-3 space-y-3">
            <h3 className="text-xs font-bold text-slate-900 dark:text-zinc-100 uppercase tracking-widest">
              CONTACT
            </h3>
            <div className="space-y-2 text-xs text-slate-500 dark:text-zinc-400">
              <div>
                <a
                  href="mailto:support@customsdoc.example"
                  className="text-slate-700 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white transition-colors no-underline font-medium"
                >
                  support@customsdoc.example
                </a>
              </div>
              <div className="text-xs text-slate-400 dark:text-zinc-500 leading-relaxed">
                Nhava Sheva Customs House,<br />
                Jawaharlal Nehru Port Trust,<br />
                Mumbai, Maharashtra 400038
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Support Pill */}
        <div className="mt-8 pt-4 flex justify-end">
          <div className="relative">
            <div className="bg-zinc-900 dark:bg-zinc-800 text-white px-4 py-2 rounded-2xl flex items-center gap-3 shadow-lg border border-zinc-700/60">
              <div className="relative shrink-0">
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center font-bold text-xs text-white">
                  CD
                </div>
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-black" />
              </div>

              <div className="flex flex-col text-left">
                <span className="text-xs font-semibold text-white tracking-tight">
                  Customs Support Specialist
                </span>
                <span className="text-[10px] text-zinc-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                  Online
                </span>
              </div>

              <button
                type="button"
                onClick={() => setChatOpen(!chatOpen)}
                className="ml-2 bg-white text-zinc-900 hover:bg-zinc-100 active:scale-95 px-3 py-1 rounded-full text-xs font-semibold shadow-xs transition-all duration-150"
              >
                Inquire
              </button>
            </div>

            {/* Interactive Chat Popup */}
            {chatOpen && (
              <div className="absolute bottom-14 right-0 w-80 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-2xl p-4 z-50 text-slate-800 dark:text-zinc-100 animate-in fade-in slide-in-from-bottom-2 duration-200">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="text-xs font-bold">Customs Broker Support</span>
                  </div>
                  <button
                    onClick={() => setChatOpen(false)}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200"
                    aria-label="Close chat"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                {chatSent ? (
                  <div className="py-6 text-center text-xs text-emerald-600 dark:text-emerald-400 flex flex-col items-center gap-2">
                    <Check className="w-6 h-6 bg-emerald-100 dark:bg-emerald-950 p-1 rounded-full" />
                    <span>Inquiry logged. A customs document specialist will follow up shortly.</span>
                  </div>
                ) : (
                  <form onSubmit={handleSendMessage} className="mt-3 space-y-3">
                    <p className="text-xs text-slate-500 dark:text-zinc-400">
                      Need help reviewing bills of lading, invoices, or packing lists for Nhava Sheva filings?
                    </p>
                    <textarea
                      value={chatMessage}
                      onChange={(e) => setChatMessage(e.target.value)}
                      placeholder="Enter shipment reference or question..."
                      rows={3}
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-blue-500 text-zinc-900 dark:text-white"
                      required
                    />
                    <button
                      type="submit"
                      className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold transition-colors"
                    >
                      Submit Inquiry
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}
