"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "outline" | "ghost" | "danger";
  size?: "default" | "sm" | "icon";
}

export function Button({ className, variant = "primary", size = "default", disabled, ...props }: ButtonProps) {
  const base = "btn";
  const variants = {
    primary: "btn-primary",
    outline: "btn-outline",
    ghost: "btn-outline",
    danger: "btn-danger",
  };
  const sizes = {
    default: "",
    sm: "btn-sm",
    icon: "btn-icon",
  };
  return (
    <button
      className={cn(base, variants[variant], sizes[size], className)}
      disabled={disabled}
      {...props}
    />
  );
}
