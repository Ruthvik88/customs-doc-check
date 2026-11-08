"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/hooks/useSession";
import { useSupabaseClient } from "@/hooks/useSupabaseClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertCircle,
  Eye,
  EyeOff,
  Loader2,
  Mail,
  Lock,
  ArrowRight,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { session, role } = useSession();
  const supabase = useSupabaseClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [authStage, setAuthStage] = useState<"idle" | "verifying" | "success">("idle");

  if (session) {
    if (role === "documentation_manager") router.replace("/export");
    else router.replace("/dashboard");
    return null;
  }
  if (!supabase) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
        <div className="glass rounded-xl p-6 shadow-lg">
          <h2 className="text-lg font-semibold text-[var(--foreground)]">Configuration error</h2>
          <p className="text-sm text-[var(--muted-foreground)] mt-2">
            Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and
            NEXT_PUBLIC_SUPABASE_ANON_KEY in .env, then restart the dev server.
          </p>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email || !password) {
      setError("Email and password are required.");
      return;
    }
    setSubmitting(true);
    setAuthStage("verifying");
    const { error: err } = await supabase.auth.signInWithPassword({ email, password });
    setSubmitting(false);
    if (err) {
      setAuthStage("idle");
      setError(err.message || "Sign in failed");
      return;
    }
    setAuthStage("success");
    if (role === "documentation_manager") router.replace("/export");
    else router.replace("/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--background)] px-4 py-10 relative overflow-x-hidden">
      {/* Ambient background lighting */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-12 left-1/4 w-96 h-48 bg-primary/10 rounded-full blur-3xl -z-10" />
        <div className="absolute -top-10 right-1/4 w-80 h-40 bg-secondary/10 rounded-full blur-3xl -z-10" />
      </div>

      <main className="relative z-10 flex-grow flex items-center justify-center">
        <div className="w-full max-w-[460px]">
          <div className="relative rounded-[1.5rem] glass-elevated p-7 sm:p-9 shadow-2xl transition-all">
            {/* Card header accent bar */}
            <div className="absolute top-0 left-8 right-8 h-[2px] bg-gradient-to-r from-transparent via-blue-500/70 to-transparent" />

            {/* Success banner (shown briefly after authenticated redirect) */}
            {authStage === "success" && (
              <div className="mb-6 p-3 rounded-xl bg-[hsl(var(--approved)/15%)] border border-[hsl(var(--approved)/30%)] text-[hsl(var(--approved-foreground))] text-xs flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="w-6 h-6 rounded-full bg-[hsl(var(--approved)/20%)] flex items-center justify-center shrink-0">
                  <AlertCircle className="w-4 h-4 text-[hsl(var(--approved-foreground))]" />
                </div>
                <div className="flex-1">
                  <span className="font-semibold block">Session authenticated</span>
                  <span className="opacity-80 text-[11px]">Redirecting to console…</span>
                </div>
              </div>
            )}

            {/* Brand title block */}
            <div className="text-center mb-7">
              <div className="mx-auto mb-4 inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[hsl(var(--primary)/20%)] border border-[hsl(var(--primary)/30%)] shadow-lg shadow-blue-900/30">
                <Mail className="w-7 h-7 text-[hsl(var(--primary-foreground))]" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)] flex items-center justify-center gap-2">
                Customs Doc Check
              </h1>
              <p className="mt-2 text-sm text-[var(--muted-foreground)] leading-relaxed">
                Sign in to review and confirm shipment documents.
              </p>
            </div>

            {/* Sign-in form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <Input
                label="Email"
                id="email"
                type="email"
                placeholder="name@company.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={submitting}
                className={authStage === "success" ? "opacity-50 pointer-events-none" : undefined}
              />
              {/* Password */}
              <div className="relative">
                <Input
                  label="Password"
                  id="password"
                  type={passwordVisible ? "text" : "password"}
                  placeholder="••••••••"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={submitting}
                  className="pr-12"
                />
                <button
                  type="button"
                  onClick={() => setPasswordVisible(!passwordVisible)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-[hsl(var(--muted-foreground))] hover:text-[var(--foreground)] transition-colors"
                  aria-label={passwordVisible ? "Hide password" : "Show password"}
                >
                  {passwordVisible ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>

              {/* Primary sign in */}
              <div className="pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  size="default"
                  className="w-full"
                  disabled={submitting || !email || !password}
                >
                  {authStage === "verifying" ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                      <span className="font-medium tracking-wide">Verifying credentials…</span>
                    </>
                  ) : (
                    <>
                      Sign in
                      <ArrowRight className="w-4 h-4 shrink-0 group-hover:translate-x-0.5 transition-transform" />
                    </>
                  )}
                </Button>
              </div>

              {error && (
                <p className="field-error flex items-center gap-2" role="alert">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {error}
                </p>
              )}
            </form>

            {/* Footer */}
            <div className="mt-6 pt-4 border-t border-[var(--border)] flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-[var(--muted-foreground)]">
              <span className="text-[var(--foreground)] text-xs">Cryptographic customs audit ready</span>
              <div className="flex items-center gap-3">
                <a href="#" className="hover:text-[var(--foreground)] transition-colors">
                  Privacy policy
                </a>
                <a href="#" className="hover:text-[var(--foreground)] transition-colors">
                  Compliance documentation
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
