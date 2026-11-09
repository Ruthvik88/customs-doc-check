"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type StatusVariant =
  | "confirmed"
  | "error"
  | "review"
  | "progress"
  | "neutral";

const variants: Record<
  StatusVariant,
  { bg: string; text: string; dot: string }
> = {
  confirmed: {
    bg: "bg-customs-status-confirmed-bg",
    text: "text-customs-status-confirmed-text",
    dot: "bg-customs-status-confirmed-text",
  },
  error: {
    bg: "bg-customs-status-error-bg",
    text: "text-customs-status-error-text",
    dot: "bg-customs-status-error-text",
  },
  review: {
    bg: "bg-customs-status-review-bg",
    text: "text-customs-status-review-text",
    dot: "bg-customs-status-review-text",
  },
  progress: {
    bg: "bg-customs-status-progress-bg",
    text: "text-customs-status-progress-text",
    dot: "bg-customs-status-progress-text",
  },
  neutral: {
    bg: "bg-customs-status-neutral-bg",
    text: "text-customs-status-neutral-text",
    dot: "bg-customs-status-neutral-text",
  },
};

interface StatusBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: StatusVariant;
  label: string;
  className?: string;
}

export function StatusBadge({
  className,
  variant = "neutral",
  label,
  ...props
}: StatusBadgeProps) {
  const v = variants[variant];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full font-label-code-sm text-label-code-sm font-semibold uppercase tracking-wider",
        v.bg,
        v.text,
        className,
      )}
      {...props}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${v.dot}`} aria-hidden="true" />
      {label}
    </span>
  );
}
