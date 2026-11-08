"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSession } from "@/hooks/useSession";
import { useSupabaseClient } from "@/hooks/useSupabaseClient";
import {
  AlertCircle,
  Eye,
  EyeOff,
  Loader2,
  LogIn,
  ShieldCheck,
  FileCheck2,
  ShipmentIcon,
  ChevronDown,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { session, role, loading: sessionLoading } = useSession();
  const supabase = useSupabaseClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [authStage, setAuthStage] = useState<"idle" | "verifying" | "success">("idle");

  useEffect(() => {
    if (sessionLoading || !session) return;
    if (role === "documentation_manager") {
      router.replace("/export");
    } else {
      router.replace("/dashboard");
    }
  }, [session, sessionLoading, role, router]);

  if (sessionLoading || session) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email || !password) {
      setError("Email and password are required.");
      return;
    }
    if (!supabase) {
      setError("Supabase authentication is not configured.");
      return;
    }

    setSubmitting(true);
    setAuthStage("verifying");
    const { data, error: err } = await supabase.auth.signInWithPassword({ email, password });
    if (err) {
      setSubmitting(false);
      setAuthStage("idle");
      setError(err.message || "Sign in failed");
      return;
    }
    setAuthStage("success");
    const { data: profile } = data.user
      ? await supabase.from("profiles").select("role").eq("id", data.user.id).maybeSingle()
      : { data: null };
    setSubmitting(false);
    if (profile?.role === "documentation_manager") router.replace("/export");
    else router.replace("/dashboard");
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 lg:p-10 bg-[#e7e5e4]/60 dark:bg-[#0c0a09] transition-colors">
      {/* Outer Card with large rounded corners matching Image 4 */}
      <div className="w-full max-w-[1080px] rounded-[36px] lg:rounded-[44px] shadow-2xl overflow-hidden border border-black/[0.08] dark:border-white/[0.08] bg-white dark:bg-zinc-900 grid grid-cols-1 lg:grid-cols-12 min-h-[660px]">
        {/* Left Column: Dark Panel with Phone Mockup */}
        <div className="lg:col-span-6 bg-[#1a1614] text-white p-8 lg:p-12 relative flex flex-col justify-between overflow-hidden">
          {/* Subtle concentric background radar circles */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] h-[520px] rounded-full border border-white/[0.04] pointer-events-none" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[380px] h-[380px] rounded-full border border-white/[0.05] pointer-events-none" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[240px] h-[240px] rounded-full border border-white/[0.06] pointer-events-none" />

          {/* Top text */}
          <div className="relative z-10 space-y-4">
            <p className="text-xs text-zinc-400 font-normal tracking-wide">
              Customs document verification made simple — AI-powered compliance for brokers and forwarders.
            </p>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-sans font-bold tracking-tight text-white leading-[1.08]">
              Verify your<br />
              shipment documents
            </h1>
          </div>

          {/* Smartphone Mockup */}
          <div className="relative z-10 mt-8 mb-4 flex justify-center lg:justify-start lg:pl-6">
            <div className="relative w-[230px] sm:w-[250px] rounded-[36px] bg-[#0c0a09] p-3 shadow-2xl border-[3px] border-[#292524] ring-1 ring-white/10">
              {/* Dynamic Island / Notch */}
              <div className="absolute top-5 left-1/2 -translate-x-1/2 w-16 h-3.5 bg-black rounded-full z-20" />

              {/* Screen Contents */}
              <div className="rounded-[28px] bg-[#18181b] overflow-hidden pt-7 pb-4 px-3.5 text-white">
                {/* Date / Subtitle */}
                <div className="text-[10px] text-zinc-400 font-medium tracking-tight">
                  Nhava Sheva Port • INNSA
                </div>

                {/* Big Metric Balance */}
                <div className="text-2xl font-bold tracking-tight mt-0.5 mb-3">
                  99.4% <span className="text-xs font-normal text-emerald-400">Accuracy</span>
                </div>

                {/* Red/Orange Bar Chart */}
                <div className="bg-[#27272a]/60 rounded-xl p-2.5 mb-3 border border-white/[0.04]">
                  <div className="h-16 flex items-end justify-between gap-1 pt-1">
                    {[
                      { h: "35%", active: false },
                      { h: "50%", active: false },
                      { h: "75%", active: true },
                      { h: "100%", active: true },
                      { h: "85%", active: true },
                      { h: "60%", active: true },
                      { h: "40%", active: false },
                      { h: "30%", active: false },
                    ].map((bar, i) => (
                      <div
                        key={i}
                        className={`w-full rounded-sm transition-all duration-300 ${
                          bar.active
                            ? "bg-gradient-to-t from-[#ef4444] to-[#f97316]"
                            : "bg-white/20"
                        }`}
                        style={{ height: bar.h }}
                      />
                    ))}
                  </div>
                </div>

                {/* Customs mini cards */}
                <div className="grid grid-cols-2 gap-2 text-[9px] mb-3">
                  <div className="bg-[#27272a]/80 p-2 rounded-lg border border-white/[0.04]">
                    <div className="text-zinc-400 text-[8px]">Bills of Lading</div>
                    <div className="font-semibold mt-0.5 text-zinc-200">28 Cleared</div>
                  </div>
                  <div className="bg-[#27272a]/80 p-2 rounded-lg border border-white/[0.04]">
                    <div className="text-zinc-400 text-[8px]">Invoices</div>
                    <div className="font-semibold mt-0.5 text-zinc-200">32 Verified</div>
                  </div>
                </div>

                {/* Bottom App Navigation Bar */}
                <div className="pt-1 flex items-center justify-around border-t border-white/[0.08]">
                  <div className="w-2.5 h-2.5 rounded-full bg-zinc-600" />
                  <div className="w-5 h-5 rounded-full p-[1.5px] bg-gradient-to-tr from-amber-400 via-rose-500 to-indigo-500 flex items-center justify-center">
                    <div className="w-full h-full rounded-full bg-black" />
                  </div>
                  <div className="w-2.5 h-2.5 rounded-full bg-zinc-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Bottom badge */}
          <div className="relative z-10 flex items-center justify-between text-zinc-500 text-xs">
            <div className="w-6 h-6 rounded-full border border-orange-500/40 flex items-center justify-center text-[10px] text-orange-400 font-bold">
              ✦
            </div>
          </div>
        </div>

        {/* Right Column: Clean White Form */}
        <div className="lg:col-span-6 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 p-8 sm:p-10 lg:p-14 flex flex-col justify-between">
          {/* Header Row: Logo */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-xs">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <span className="font-sans font-bold text-xl tracking-tight text-zinc-900 dark:text-white">
                Customs Doc Check
              </span>
            </div>
          </div>

          {/* Sign In Form Area */}
          <div className="my-auto max-w-md w-full">
            <h2 className="text-3xl lg:text-4xl font-bold tracking-tight text-zinc-900 dark:text-white mb-2">
              Sign In
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-8">
              Sign in to review and verify customs documents.
            </p>

            {authStage === "success" && (
              <div className="mb-6 p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-3">
                <AlertCircle className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>Session authenticated. Redirecting…</span>
              </div>
            )}

            {error && (
              <div className="mb-6 p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 text-xs flex items-center gap-3">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <input
                  id="email"
                  type="email"
                  name="email"
                  autoComplete="email"
                  placeholder="name@company.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={submitting}
                  className="w-full rounded-full border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800/80 px-5 py-3.5 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all shadow-xs"
                />
              </div>

              <div className="relative">
                <input
                  id="password"
                  type={passwordVisible ? "text" : "password"}
                  name="password"
                  autoComplete="current-password"
                  placeholder="Password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={submitting}
                  className="w-full rounded-full border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800/80 px-5 py-3.5 pr-12 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all shadow-xs"
                />
                <button
                  type="button"
                  onClick={() => setPasswordVisible(!passwordVisible)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
                  aria-label={passwordVisible ? "Hide password" : "Show password"}
                >
                  {passwordVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3.5 px-6 rounded-full text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 active:scale-[0.99] shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2 group cursor-pointer disabled:opacity-60"
                >
                  {authStage === "verifying" ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Verifying…</span>
                    </>
                  ) : (
                    <>
                      <LogIn className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                      <span>Sign In</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Footer of Right Card */}
          <div className="mt-8 pt-4 flex flex-col sm:flex-row items-center justify-between text-[11px] text-zinc-400 dark:text-zinc-500 gap-3 border-t border-zinc-100 dark:border-zinc-800">
            <span>© 2026 Customs Doc Check Inc.</span>
            <div className="flex items-center gap-4">
              <span>Nhava Sheva Customs House</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
