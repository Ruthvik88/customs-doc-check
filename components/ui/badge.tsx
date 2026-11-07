"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "outline" | "primary" | "success" | "warning" | "destructive";
}

export function Badge({ className, variant = "outline", ...props }: BadgeProps) {
  const variants = {
    outline: "badge-outline",
    primary: "badge-primary",
    success: "badge-success",
    warning: "badge-warning",
    destructive: "badge-destructive",
  };
  return <span className={cn("badge", variants[variant], className)} {...props} />;
}
