"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useSession } from "@/hooks/useSession";
import { useSupabaseClient } from "@/hooks/useSupabaseClient";
import {
  AlertCircle,
  Eye,
  EyeOff,
  Loader2,
  LogIn,
  Mail,
  Lock,
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
  const [authStage, setAuthStage] = useState<"idle" | "verifying" | "error" | "success">("idle");

  const isVerifying = authStage === "verifying";
  const isError = authStage === "error";

  if (session) {
    if (sessionLoading) return null;
    if (role === "documentation_manager") router.replace("/export");
    else router.replace("/dashboard");
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email || !password) {
      setError("Email and password are required.");
      setAuthStage("error");
      return;
    }
    if (!supabase) {
      setError("Supabase authentication is not configured.");
      setAuthStage("error");
      return;
    }

    setSubmitting(true);
    setAuthStage("verifying");
    const { data, error: err } = await supabase.auth.signInWithPassword({ email, password });
    if (err) {
      setSubmitting(false);
      setAuthStage("error");
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

  const isDisabled = isVerifying || submitting;

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-slate-100 text-slate-900 font-sans antialiased">
      <main className="w-full max-w-[1180px] bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[680px]">
        {/* Left Brand Panel */}
        <section
          className="lg:col-span-6 bg-[#10213d] p-8 sm:p-12 lg:p-14 relative flex flex-col justify-between overflow-hidden text-white"
          data-purpose="brand-overview"
        >
          {/* Background ambient glow */}
          <div aria-hidden="true" className="absolute -top-32 -left-32 w-80 h-80 bg-brand-cobalt/15 rounded-full blur-3xl pointer-events-none"></div>
          <div aria-hidden="true" className="absolute -bottom-32 -right-32 w-80 h-80 bg-brand-cobalt/10 rounded-full blur-3xl pointer-events-none"></div>

          {/* Header & copy */}
          <div className="relative z-10 space-y-5">
            <div className="max-w-[min(100%,520px)]">
              <Image src="/branding/logo-full.png" alt="Customs Doc Check — Extract · Verify · Export" width={1536} height={1024} priority className="h-auto w-full object-contain object-left" />
            </div>
            <p className="max-w-md text-slate-200 text-sm font-normal leading-relaxed pt-2">
              Review extracted shipment data, resolve discrepancies, export with confidence.
            </p>
          </div>

          {/* Bottom system meta: status label + dot */}
          <div className="relative z-10 flex items-center justify-between text-xs text-slate-200 font-mono pt-3 border-t border-white/15">
            <span className="font-medium">Verification Engine v3.4</span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span className="text-emerald-300 font-semibold">Ready</span>
            </span>
          </div>
        </section>

        {/* Right Auth Panel */}
        <section className="lg:col-span-6 bg-white p-8 sm:p-12 lg:p-14 flex flex-col justify-between">
          {/* Logo header */}
          <header className="mb-8 flex items-center">
            <Image src="/branding/logo-full.png" alt="Customs Doc Check" width={1536} height={1024} priority className="h-auto w-56 max-w-full object-contain object-left" />
          </header>

          <div className="max-w-md w-full mx-auto my-auto">
            {/* Form titles */}
            <div className="mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold font-heading text-slate-900 tracking-tight">
                Sign in
              </h2>
              <p className="text-slate-600 text-sm mt-2 leading-relaxed">
                Enter your credentials to access your customs clearance dashboard.
              </p>
            </div>

            {/* Error banner (error state only) */}
            {isError && error && (
              <div className="mb-5 rounded-lg p-3.5 bg-[#FEF2F2] border border-[#FCA5A5] flex items-start gap-3 shadow-sm" role="alert">
                <AlertCircle className="w-5 h-5 text-[#DC2626] flex-shrink-0 mt-0.5" />
                <div className="text-xs text-[#991B1B] font-medium leading-snug">
                  {error}
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5" id="loginForm">
              {/* Email field */}
              <div className="space-y-1.5">
                <label htmlFor="email" className="block text-xs font-semibold text-slate-800 uppercase tracking-wider">
                  Work Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                  <input
                    id="email"
                    type="email"
                    name="email"
                    autoComplete="email"
                    placeholder="name@company.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isDisabled}
                    aria-describedby={isError ? "emailError" : undefined}
                    className={`w-full pl-10 pr-4 py-3 rounded-lg border text-slate-900 placeholder:text-slate-500 text-sm focus:outline-none transition-all duration-150 ${
                      isError
                        ? "border-[#DC2626] bg-[#FEF2F2]/30 ring-1 ring-[#DC2626] focus:border-[#DC2626] focus:ring-2 focus:ring-[#DC2626]"
                        : "border-slate-300 bg-white focus:border-blue-700 focus:ring-2 focus:ring-blue-700/30"
                    }`}
                  />
                </div>
                {isError && !email && (
                  <p className="text-xs text-[#DC2626] font-medium flex items-center gap-1 mt-1" id="emailError">
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                    Please enter your work email address
                  </p>
                )}
              </div>

              {/* Password field */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="block text-xs font-semibold text-slate-800 uppercase tracking-wider">
                    Password
                  </label>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                  <input
                    id="password"
                    type={passwordVisible ? "text" : "password"}
                    name="password"
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isDisabled}
                    aria-describedby={isError ? "passwordError" : undefined}
                    className={`w-full pl-10 pr-10 py-3 rounded-lg border text-slate-900 placeholder:text-slate-500 text-sm focus:outline-none transition-all duration-150 ${
                      isError
                        ? "border-[#DC2626] bg-[#FEF2F2]/30 ring-1 ring-[#DC2626] focus:border-[#DC2626] focus:ring-2 focus:ring-[#DC2626]"
                        : "border-slate-300 bg-white focus:border-blue-700 focus:ring-2 focus:ring-blue-700/30"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setPasswordVisible(!passwordVisible)}
                    disabled={isDisabled}
                    className={`absolute inset-y-0 right-0 pr-3.5 flex items-center transition-colors duration-150 ${
                      isDisabled
                        ? "text-slate-400 pointer-events-none"
                        : "text-slate-600 hover:text-blue-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-700 focus-visible:outline-offset-2"
                    }`}
                    aria-label={passwordVisible ? "Hide password" : "Show password"}
                  >
                    {passwordVisible ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {isError && !password && (
                  <p className="text-xs text-[#DC2626] font-medium flex items-center gap-1 mt-1" id="passwordError">
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                    Please enter your password
                  </p>
                )}
              </div>

              {/* Primary sign-in button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isDisabled}
                  className={`w-full py-3.5 px-4 text-sm font-semibold font-heading rounded-lg transition-all duration-150 cursor-pointer flex items-center justify-center gap-2 ${
                    isDisabled
                      ? "bg-blue-900 text-white cursor-not-allowed shadow-sm"
                      : "bg-blue-800 text-white shadow-cta hover:bg-blue-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-900 active:scale-[0.99]"
                  }`}
                >
                  {isVerifying ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Verifying credentials…</span>
                    </>
                  ) : (
                    <>
                      <LogIn className="w-4 h-4" />
                      <span>Sign in</span>
                    </>
                  )}
                </button>
              </div>

              {/* Verifying status indicator (verifying state only) */}
              {isVerifying && (
                <div className="pt-1.5 flex items-center justify-center gap-2 text-xs font-mono text-slate-600 animate-pulse" role="status">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-700"></span>
                  <span>Verifying secure customs broker session…</span>
                </div>
              )}
            </form>
          </div>

          {/* Card footer */}
          <footer className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-center sm:justify-between gap-2 text-xs text-slate-600">
            <span>© 2026 Customs Doc Check Inc.</span>
          </footer>
        </section>
      </main>
    </div>
  );
}
