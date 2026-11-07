"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/hooks/useSession";
import { useSupabaseClient } from "@/hooks/useSupabaseClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

export default function LoginPage() {
  const router = useRouter();
  const { session, role } = useSession();
  const supabase = useSupabaseClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (session) {
    if (role === "documentation_manager") router.replace("/export");
    else router.replace("/dashboard");
    return null;
  }
  if (!supabase) return <Skeleton height="340" width="320" className="mx-auto" />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    const { error: err } = await supabase.auth.signInWithPassword({ email, password });
    setSubmitting(false);
    if (err) {
      setError(err.message || "Sign in failed");
      return;
    }
    if (role === "documentation_manager") router.replace("/export");
    else router.replace("/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
      <form onSubmit={handleSubmit} className="w-full max-w-md p-6">
        <h1 className="text-lg font-semibold text-[var(--foreground)] mb-2">Customs Doc Check</h1>
        <p className="text-sm text-[var(--muted-foreground)] mb-6">
          Sign in to review and confirm shipment documents.
        </p>
        <Input label="Email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <Input label="Password" type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        {error && <p className="text-sm text-red-600 mb-3">{error}</p>}
        <Button type="submit" variant="primary" disabled={submitting || !email || !password} className="w-full">
          Sign in
        </Button>
        <p className="mt-5 text-xs text-center text-[var(--muted-foreground)]">
          Demo accounts: exec@demo.local / manager@demo.local
        </p>
      </form>
    </div>
  );
}
