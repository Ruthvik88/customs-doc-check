"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  ArrowRight,
  MoreHorizontal,
  ChevronDown,
  Sparkles,
  CheckCircle2,
  BarChart3,
  FileText,
  Clock,
  Layers,
  Search,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0c] text-slate-900 dark:text-zinc-100 antialiased selection:bg-blue-500/20 selection:text-blue-600 overflow-x-hidden">
      {/* Top Navbar: Deflexai Style (Image 5 Navbar) */}
      <nav className="sticky top-0 z-50 w-full border-b border-black/[0.04] dark:border-white/[0.06] bg-white/80 dark:bg-[#0a0a0c]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Deflexai Brand Logo (Image 5) */}
          <Link
            href="/"
            className="flex items-center gap-2.5 no-underline group focus-visible:outline-none"
          >
            {/* 4-leaf floral geometric symbol */}
            <div className="w-6 h-6 flex items-center justify-center text-slate-900 dark:text-white transition-transform group-hover:scale-105">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path d="M12 2a4 4 0 0 1 4 4v2h-2V6a2 2 0 1 0-4 0v2H8V6a4 4 0 0 1 4-4zm0 20a4 4 0 0 1-4-4v-2h2v2a2 2 0 1 0 4 0v-2h2v2a4 4 0 0 1-4 4zm-6-6a4 4 0 0 1-4-4 4 4 0 0 1 4-4h2v2H6a2 2 0 1 0 0 4h2v2H6zm12 0h-2v-2h2a2 2 0 1 0 0-4h-2v-2h2a4 4 0 0 1 4 4 4 4 0 0 1-4 4z" />
              </svg>
            </div>
            <span className="font-heading font-extrabold text-lg tracking-tight text-slate-900 dark:text-white">
              Deflexai
            </span>
          </Link>

          {/* Center Nav Links */}
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600 dark:text-zinc-300">
            <Link href="#features" className="hover:text-slate-900 dark:hover:text-white transition-colors no-underline">
              Products
            </Link>
            <button type="button" className="flex items-center gap-1 text-sm font-medium text-slate-600 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white transition-colors"><span>Solutions</span><ChevronDown className="w-3.5 h-3.5 text-slate-400" /></button>
            <button type="button" className="flex items-center gap-1.5 text-sm font-medium text-slate-600 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white transition-colors"><span>Services</span><span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800">NEW</span><ChevronDown className="w-3.5 h-3.5 text-slate-400" /></button>
            <Link href="#pricing" className="hover:text-slate-900 dark:hover:text-white transition-colors no-underline">
              Pricing
            </Link>
            <Link href="#insight" className="hover:text-slate-900 dark:hover:text-white transition-colors no-underline">
              Insight
            </Link>
          </div>

          {/* Right Actions: Sign in + Contact */}
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm font-semibold text-slate-700 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white transition-colors no-underline"
            >
              Sign in
            </Link>
            <Link
              href="/dashboard"
              className="bg-black text-white dark:bg-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200 px-5 py-2 rounded-full text-xs font-semibold transition-all duration-150 no-underline shadow-sm"
            >
              Contact
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section with Concentric Orbits & Integration Icons (Image 5) */}
      <section className="relative pt-12 pb-24 lg:pt-20 lg:pb-36 flex flex-col items-center justify-center text-center px-4 overflow-hidden">
        {/* Concentric Radar Orbit Rings (Image 5 Background) */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1120px] h-[1120px] pointer-events-none select-none -z-10">
          {/* Ring 4 */}
          <div className="absolute inset-0 rounded-full border border-slate-200/50 dark:border-zinc-800/40" />
          {/* Ring 3 */}
          <div className="absolute inset-16 sm:inset-28 rounded-full border border-slate-200/60 dark:border-zinc-800/50" />
          {/* Ring 2 */}
          <div className="absolute inset-36 sm:inset-56 rounded-full border border-slate-200/70 dark:border-zinc-800/60" />
          {/* Ring 1 */}
          <div className="absolute inset-60 sm:inset-80 rounded-full border border-slate-200/80 dark:border-zinc-800/70" />

          {/* Floating Orbit Integration Badges (Image 5 exact positions) */}
          {/* Slack (top-left) */}
          <div className="absolute top-[18%] left-[24%] -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white dark:bg-zinc-800 shadow-lg border border-slate-100 dark:border-zinc-700 flex items-center justify-center animate-bounce duration-1000">
            <span className="text-sm font-bold text-rose-500">#</span>
          </div>

          {/* Snowflake cyan star (mid-left) */}
          <div className="absolute top-[40%] left-[16%] -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white dark:bg-zinc-800 shadow-lg border border-slate-100 dark:border-zinc-700 flex items-center justify-center text-sky-500 text-lg">
            ✱
          </div>

          {/* Meta blue infinity (center-left) */}
          <div className="absolute top-[48%] left-[28%] -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white dark:bg-zinc-800 shadow-lg border border-slate-100 dark:border-zinc-700 flex items-center justify-center text-blue-600 font-bold text-lg">
            ∞
          </div>

          {/* Yellow smile badge (lower-left) */}
          <div className="absolute top-[56%] left-[12%] -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-amber-400 shadow-lg flex items-center justify-center text-white text-base">
            ☺
          </div>

          {/* Google Ads colorful triangle (bottom-left) */}
          <div className="absolute top-[68%] left-[29%] -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white dark:bg-zinc-800 shadow-lg border border-slate-100 dark:border-zinc-700 flex items-center justify-center">
            <span className="w-4 h-4 rounded-full bg-gradient-to-tr from-amber-400 via-emerald-400 to-blue-500 inline-block" />
          </div>

          {/* Orange asterisk starburst (top-right) */}
          <div className="absolute top-[26%] right-[24%] translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white dark:bg-zinc-800 shadow-lg border border-slate-100 dark:border-zinc-700 flex items-center justify-center text-orange-500 font-black text-xl">
            ✻
          </div>

          {/* AWS logo badge (mid-right) */}
          <div className="absolute top-[40%] right-[17%] translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white dark:bg-zinc-800 shadow-lg border border-slate-100 dark:border-zinc-700 flex items-center justify-center text-[10px] font-bold text-amber-600">
            aws
          </div>

          {/* Blue bars chart (center-right) */}
          <div className="absolute top-[50%] right-[28%] translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white dark:bg-zinc-800 shadow-lg border border-slate-100 dark:border-zinc-700 flex items-center justify-center text-blue-500 text-sm">
            ☷
          </div>

          {/* Rainbow ring badge (lower-right) */}
          <div className="absolute top-[56%] right-[12%] translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white dark:bg-zinc-800 shadow-lg border border-slate-100 dark:border-zinc-700 flex items-center justify-center">
            <div className="w-5 h-5 rounded-full p-[2px] bg-gradient-to-tr from-pink-500 via-rose-500 to-cyan-500">
              <div className="w-full h-full rounded-full bg-white dark:bg-zinc-800" />
            </div>
          </div>

          {/* Isometric colorful cube (bottom-right) */}
          <div className="absolute top-[68%] right-[22%] translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white dark:bg-zinc-800 shadow-lg border border-slate-100 dark:border-zinc-700 flex items-center justify-center text-amber-500 text-sm">
            ▲
          </div>
        </div>

        {/* Center Hero Content Container */}
        <div className="relative z-10 max-w-3xl mx-auto flex flex-col items-center">
          {/* Top Rating Pill: Google 4.6 & Trustpilot 4.9 */}
          <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 shadow-sm text-xs font-medium text-slate-700 dark:text-zinc-300 mb-8">
            <span className="flex items-center gap-1.5">
              {/* Google G icon */}
              <span className="font-bold text-[#4285F4]">G</span>
              <span>4.6 Google</span>
            </span>
            <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-zinc-700" />
            <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold">
              <span>★</span>
              <span>4.9 Trustpilot</span>
            </span>
          </div>

          {/* Main Headline (Image 5 exact wording) */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-sans font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.08] max-w-2xl mb-6">
            AI-powered tools to<br />
            stay organized
          </h1>

          {/* Subtitle (Image 5 exact wording) */}
          <p className="text-base sm:text-lg text-slate-500 dark:text-zinc-400 max-w-xl mx-auto mb-8 font-normal leading-relaxed">
            From small tasks to complex projects, manage everything in one place and keep your team moving forward.
          </p>

          {/* CTA Buttons (Image 5 exact buttons) */}
          <div className="flex flex-col sm:flex-row items-center gap-3.5 mb-14">
            <Link
              href="/dashboard"
              className="w-full sm:w-auto px-7 py-3.5 rounded-full bg-black text-white dark:bg-white dark:text-black font-semibold text-sm hover:bg-zinc-800 dark:hover:bg-zinc-200 active:scale-[0.98] shadow-md transition-all no-underline"
            >
              Get started free
            </Link>
            <Link
              href="#pricing"
              className="w-full sm:w-auto px-7 py-3.5 rounded-full bg-white text-slate-700 dark:bg-zinc-900 dark:text-zinc-200 border border-slate-200 dark:border-zinc-700 font-semibold text-sm hover:bg-slate-50 dark:hover:bg-zinc-800 active:scale-[0.98] shadow-xs transition-all no-underline"
            >
              Talk to sales team
            </Link>
          </div>

          {/* Glowing Floating Notification Cards (Image 5 exact card stack) */}
          <div className="relative w-full max-w-md mx-auto">
            {/* Soft cyan/blue radial gradient glow behind cards */}
            <div className="absolute -inset-6 bg-gradient-to-r from-blue-400/25 via-sky-300/35 to-blue-400/25 blur-3xl rounded-full -z-10" />

            {/* Stack of 3 Clean White Activity Cards */}
            <div className="space-y-2.5">
              {/* Card 1: Wei Chen joined to Final Presentation */}
              <div className="bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md rounded-2xl p-3.5 border border-slate-200/80 dark:border-zinc-800 shadow-xl flex items-center gap-3 text-left">
                <div className="w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-950 overflow-hidden ring-2 ring-blue-500/20 shrink-0">
                  <img
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&h=120&q=80"
                    alt="Wei Chen"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.currentTarget as HTMLElement).style.display = "none";
                    }}
                  />
                  <div className="w-full h-full flex items-center justify-center text-xs font-bold text-blue-600">
                    WC
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-slate-900 dark:text-white truncate">
                    <span className="font-bold">Wei Chen</span> joined to <span className="font-semibold">Final Presentation</span>
                  </div>
                  <div className="text-[10px] text-slate-400 dark:text-zinc-500">
                    8 min ago • Orixcreative Dribbble
                  </div>
                </div>
              </div>

              {/* Card 2: Matthew Johnson Content Writer */}
              <div className="bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md rounded-2xl p-3.5 border border-slate-200/80 dark:border-zinc-800 shadow-xl flex items-center justify-between text-left">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-emerald-100 dark:bg-emerald-950 overflow-hidden ring-2 ring-emerald-500/20 shrink-0">
                    <img
                      src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&h=120&q=80"
                      alt="Matthew Johnson"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.currentTarget as HTMLElement).style.display = "none";
                      }}
                    />
                    <div className="w-full h-full flex items-center justify-center text-xs font-bold text-emerald-600">
                      MJ
                    </div>
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-slate-900 dark:text-white">
                      Matthew Johnson
                    </div>
                    <div className="text-[10px] text-slate-400 dark:text-zinc-500">
                      Content Writer • @orixcreative
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 p-1 rounded-lg"
                  aria-label="Options"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </div>

              {/* Card 3: Terry Lipshutz Approved the design */}
              <div className="bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md rounded-2xl p-3.5 border border-slate-200/80 dark:border-zinc-800 shadow-xl flex items-center gap-3 text-left">
                <div className="w-9 h-9 rounded-xl bg-[#e0e7ff] dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-sm shrink-0">
                  M
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    Terry Lipshutz
                  </div>
                  <div className="text-[10px] text-slate-400 dark:text-zinc-500 truncate">
                    Approved the design of the iOS app…
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof Section (Image 5 Logos row) */}
      <section className="py-14 border-t border-b border-slate-100 dark:border-zinc-900 bg-[#fbfbfb] dark:bg-[#0c0c0e]">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <p className="text-xs font-medium text-slate-400 dark:text-zinc-500 tracking-wider mb-8">
            Trusted by 200,000+ users worldwide
          </p>

          {/* Monochrome Partner Logos (Image 5 exact brand list) */}
          <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-12 lg:gap-16 opacity-65 grayscale hover:grayscale-0 transition-all duration-300">
            <span className="text-sm sm:text-base font-bold font-sans tracking-tight text-slate-800 dark:text-zinc-200">
              Google
            </span>
            <span className="text-sm sm:text-base font-semibold tracking-tight text-slate-800 dark:text-zinc-200">
              airbnb
            </span>
            <span className="text-sm sm:text-base font-bold tracking-tight text-slate-800 dark:text-zinc-200">
              coinbase
            </span>
            <span className="text-sm sm:text-base font-semibold tracking-tight text-slate-800 dark:text-zinc-200">
              Notion
            </span>
            <span className="text-sm sm:text-base font-extrabold uppercase tracking-tight text-slate-800 dark:text-zinc-200">
              GUMROAD
            </span>
            <span className="text-sm sm:text-base font-bold tracking-tight text-slate-800 dark:text-zinc-200">
              PayPal
            </span>
            <span className="text-sm sm:text-base font-semibold tracking-tight text-slate-800 dark:text-zinc-200">
              upwork
            </span>
            <span className="text-sm sm:text-base font-bold tracking-tight text-slate-800 dark:text-zinc-200">
              shopify
            </span>
            <span className="text-sm sm:text-base font-bold tracking-tight text-slate-800 dark:text-zinc-200">
              stripe
            </span>
            <span className="text-sm sm:text-base font-bold tracking-tight text-slate-800 dark:text-zinc-200">
              zoom
            </span>
          </div>
        </div>
      </section>

      {/* Features Overview */}
      <section id="features" className="py-24 max-w-6xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-white mb-4">
            Engineered for precision customs clearance
          </h2>
          <p className="text-base text-slate-500 dark:text-zinc-400">
            Instantly cross-check bills of lading, commercial invoices, and packing lists to avoid port penalties.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-7 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-4">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
              Automated Document Cross-Check
            </h3>
            <p className="text-sm text-slate-500 dark:text-zinc-400 leading-relaxed">
              Verify container numbers, weights, and consignee details against manifest databases before submission.
            </p>
          </div>

          <div className="p-7 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-orange-50 dark:bg-orange-950 text-[#f97316] flex items-center justify-center mb-4">
              <BarChart3 className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
              High Accuracy AI Extraction
            </h3>
            <p className="text-sm text-slate-500 dark:text-zinc-400 leading-relaxed">
              Gemini Flash extracts key fields with 99.2% accuracy across unstructured PDFs, scans, and multi-page manifests.
            </p>
          </div>

          <div className="p-7 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
              Rapid Review Workflow
            </h3>
            <p className="text-sm text-slate-500 dark:text-zinc-400 leading-relaxed">
              Highlight discrepancies in seconds with side-by-side document comparison and single-click approval routing.
            </p>
          </div>
        </div>
      </section>

      {/* CTA section */}
      <section className="py-20 bg-slate-50 dark:bg-zinc-900/50 border-t border-slate-200/60 dark:border-zinc-800">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-4">
            Ready to streamline your customs clearance?
          </h2>
          <p className="text-base text-slate-500 dark:text-zinc-400 max-w-xl mx-auto mb-8">
            Experience lightning fast extraction, verified reports, and seamless compliance filings.
          </p>
          <div className="flex justify-center gap-4">
            <Link
              href="/login"
              className="px-8 py-3.5 rounded-full bg-black text-white dark:bg-white dark:text-black font-semibold text-sm hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all no-underline shadow-md"
            >
              Get Started Now
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
