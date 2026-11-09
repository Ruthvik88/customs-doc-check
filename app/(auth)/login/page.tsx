"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-brand-page text-brand-text-primary font-sans antialiased">
      <main className="w-full max-w-[1180px] bg-brand-surface rounded-3xl shadow-card border border-brand-hairline overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[680px]">
        {/* Left Brand Panel */}
        <section
          className="lg:col-span-6 bg-brand-navy p-8 sm:p-12 lg:p-14 relative flex flex-col justify-between overflow-hidden text-white"
          data-purpose="brand-overview"
        >
          {/* Background ambient glow */}
          <div aria-hidden="true" className="absolute -top-32 -left-32 w-80 h-80 bg-brand-cobalt/15 rounded-full blur-3xl pointer-events-none"></div>
          <div aria-hidden="true" className="absolute -bottom-32 -right-32 w-80 h-80 bg-brand-cobalt/10 rounded-full blur-3xl pointer-events-none"></div>

          {/* Header & copy */}
          <div className="relative z-10 space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-brand-cobalt/20 border border-brand-cobalt/40 flex items-center justify-center text-white shadow-inner">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <span className="text-xl font-bold font-heading text-white tracking-tight">
                Customs Doc Check
              </span>
            </div>
            <p className="text-brand-text-secondary text-sm font-normal leading-relaxed pt-2">
              Review extracted shipment data, resolve discrepancies, export with confidence.
            </p>
          </div>

          {/* Abstract vector graphic: document sheets */}
          <div className="relative z-10 my-8 py-4 flex items-center justify-center select-none" data-purpose="vector-illustration">
            <svg
              className="w-full max-w-[280px] h-auto drop-shadow-2xl"
              fill="none"
              viewBox="0 0 280 240"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect fill="#13233E" height="188" rx="8" stroke="#253A5F" strokeDasharray="3 3" strokeWidth="1.5" width="168" x="52" y="16"></rect>
              <line stroke="#2D4671" strokeLinecap="round" strokeWidth="2.5" x1="72" x2="132" y1="36" y2="36"></line>
              <line stroke="#1E3354" strokeLinecap="round" strokeWidth="1.5" x1="72" x2="188" y1="52" y2="52"></line>
              <line stroke="#1E3354" strokeLinecap="round" strokeWidth="1.5" x1="72" x2="164" y1="64" y2="64"></line>
              <rect fill="#152847" height="188" rx="8" stroke="#2C4570" strokeWidth="1.5" width="168" x="62" y="32"></rect>
              <line stroke="#375586" strokeLinecap="round" strokeWidth="2.5" x1="82" x2="148" y1="52" y2="52"></line>
              <line stroke="#223B60" strokeLinecap="round" strokeWidth="1.5" x1="82" x2="202" y1="68" y2="68"></line>
              <line stroke="#223B60" strokeLinecap="round" strokeWidth="1.5" x1="82" x2="176" y1="80" y2="80"></line>
              <rect fill="#1B3156" height="188" rx="8" stroke="#3D5F96" strokeWidth="1.5" width="168" x="74" y="48"></rect>
              <rect fill="#1f5eff" fillOpacity="0.3" height="18" rx="4" width="22" x="90" y="66"></rect>
              <line stroke="#FFFFFF" strokeLinecap="round" strokeOpacity="0.9" strokeWidth="2.5" x1="120" x2="182" y1="72" y2="72"></line>
              <line stroke="#5A7BAE" strokeLinecap="round" strokeWidth="1.5" x1="120" x2="156" y1="82" y2="82"></line>
              <line stroke="#294471" strokeWidth="1" x1="90" x2="226" y1="102" y2="102"></line>
              <line stroke="#7193C8" strokeLinecap="round" strokeWidth="2" x1="90" x2="136" y1="116" y2="116"></line>
              <line stroke="#9BB8E8" strokeLinecap="round" strokeWidth="2" x1="184" x2="226" y1="116" y2="116"></line>
              <line stroke="#486899" strokeLinecap="round" strokeWidth="1.5" x1="90" x2="148" y1="130" y2="130"></line>
              <line stroke="#7193C8" strokeLinecap="round" strokeWidth="1.5" x1="194" x2="226" y1="130" y2="130"></line>
              <line stroke="#294471" strokeDasharray="2 2" strokeWidth="1" x1="90" x2="226" y1="144" y2="144"></line>
              <line stroke="#486899" strokeLinecap="round" strokeWidth="1.5" x1="90" x2="124" y1="158" y2="158"></line>
              <line stroke="#7193C8" strokeLinecap="round" strokeWidth="1.5" x1="178" x2="226" y1="158" y2="158"></line>
              <rect fill="#122440" height="24" rx="4" stroke="#294471" strokeWidth="1" width="136" x="90" y="174"></rect>
              <line stroke="#5A7BAE" strokeLinecap="round" strokeWidth="2" x1="100" x2="138" y1="186" y2="186"></line>
              <line stroke="#38EF7D" strokeLinecap="round" strokeWidth="2" x1="192" x2="216" y1="186" y2="186"></line>
              <g filter="drop-shadow(0px 8px 16px rgba(0,0,0,0.45))">
                <circle cx="216" cy="186" fill="#1f5eff" r="22" stroke="#ffffff" strokeWidth="2.5"></circle>
                <path d="M208.5 186.2L213.5 191.2L224 180.7" stroke="#ffffff" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.75"></path>
              </g>
            </svg>
          </div>

          {/* Bottom system meta: status label + dot */}
          <div className="relative z-10 flex items-center justify-between text-xs text-brand-text-secondary font-mono pt-2 border-t border-white/5">
            <span>Verification Engine v3.4</span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-cobalt animate-soft-pulse"></span>
              <span>Ready</span>
            </span>
          </div>
        </section>

        {/* Right Auth Panel */}
        <section className="lg:col-span-6 bg-brand-surface p-8 sm:p-12 lg:p-14 flex flex-col justify-between">
          {/* Logo header */}
          <header className="flex items-center gap-2.5 mb-8">
            <div className="w-9 h-9 rounded-xl bg-brand-cobalt flex items-center justify-center text-white shadow-sm">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                viewBox="0 0 24 24"
              >
                <path
                  d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <span className="text-xl font-bold font-heading text-brand-text-primary tracking-tight">
              Customs Doc Check
            </span>
          </header>

          <div className="max-w-md w-full mx-auto my-auto">
            {/* Form titles */}
            <div className="mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold font-heading text-brand-text-primary tracking-tight">
                Sign in
              </h2>
              <p className="text-brand-text-secondary text-sm mt-2 leading-relaxed">
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
                <label htmlFor="email" className="block text-xs font-semibold text-brand-text-primary uppercase tracking-wider">
                  Work Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-text-secondary pointer-events-none" />
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
                    className={`w-full pl-10 pr-4 py-3 rounded-lg border text-brand-text-primary placeholder:text-slate-400 text-sm focus:outline-none transition-all duration-150 ${
                      isError
                        ? "border-[#DC2626] bg-[#FEF2F2]/30 ring-1 ring-[#DC2626] focus:border-[#DC2626] focus:ring-2 focus:ring-[#DC2626]"
                        : "border-brand-hairline bg-brand-surface focus:border-brand-cobalt focus:ring-2 focus:ring-brand-cobalt/20"
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
                  <label htmlFor="password" className="block text-xs font-semibold text-brand-text-primary uppercase tracking-wider">
                    Password
                  </label>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-text-secondary pointer-events-none" />
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
                    className={`w-full pl-10 pr-10 py-3 rounded-lg border text-brand-text-primary placeholder:text-slate-400 text-sm focus:outline-none transition-all duration-150 ${
                      isError
                        ? "border-[#DC2626] bg-[#FEF2F2]/30 ring-1 ring-[#DC2626] focus:border-[#DC2626] focus:ring-2 focus:ring-[#DC2626]"
                        : "border-brand-hairline bg-brand-surface focus:border-brand-cobalt focus:ring-2 focus:ring-brand-cobalt/20"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setPasswordVisible(!passwordVisible)}
                    disabled={isDisabled}
                    className={`absolute inset-y-0 right-0 pr-3.5 flex items-center transition-colors duration-150 ${
                      isDisabled
                        ? "text-slate-400 pointer-events-none"
                        : "text-brand-text-secondary hover:text-brand-cobalt"
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
                      ? "bg-brand-cobalt/50 text-white opacity-60 cursor-not-allowed shadow-sm"
                      : "bg-brand-cobalt text-white shadow-cta hover:bg-brand-cobalt-hover hover:-translate-y-0.5 hover:shadow-cta-hover active:translate-y-0 active:scale-[0.99]"
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
                <div className="pt-1.5 flex items-center justify-center gap-2 text-xs font-mono text-brand-text-secondary animate-pulse" role="status">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-cobalt"></span>
                  <span>Verifying secure customs broker session…</span>
                </div>
              )}
            </form>
          </div>

          {/* Card footer */}
          <footer className="pt-6 border-t border-brand-hairline flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-brand-text-secondary">
            <span>© 2026 Customs Doc Check Inc.</span>
            <span className="font-mono text-[11px]">Nhava Sheva Customs House</span>
          </footer>
        </section>
      </main>
    </div>
  );
}
