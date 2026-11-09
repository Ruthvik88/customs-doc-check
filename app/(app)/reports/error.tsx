"use client";

import React from "react";
import { X, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ReportsError({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <section className="rounded-xl border border-customs-status-error-bg bg-customs-status-error-bg/20 p-6 shadow-sm" role="alert">
      <div className="flex items-start gap-3">
        <span className="w-9 h-9 rounded-lg bg-customs-error text-customs-on-error flex items-center justify-center shrink-0 shadow-sm">
          <X className="w-5 h-5" aria-hidden="true" />
        </span>
        <div>
          <h2 className="font-headline-md text-headline-md font-bold text-customs-ink-primary mb-1">
            Accuracy Report Unavailable
          </h2>
          <p className="font-body text-body-md text-customs-ink-secondary">
            {error.message}
          </p>
        </div>
      </div>
      <div className="mt-6 flex items-center gap-3">
        <Button type="button" variant="primary" size="sm" onClick={() => reset()} className="bg-customs-primary text-customs-on-primary-container font-headline-sm text-headline-sm flex items-center gap-2 shadow-sm">
          <RefreshCw className="w-4 h-4" aria-hidden="true" />
          Retry
        </Button>
      </div>
    </section>
  );
}
