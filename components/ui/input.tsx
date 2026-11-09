"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ className, label, error, id, ...props }: InputProps) {
  const generatedId = React.useId();
  const inputId = id || generatedId;
  const errorId = `${inputId}-error`;
  return (
    <div className="space-y-1">
      {label && <label htmlFor={inputId} className="field-label">{label}</label>}
      <input
        id={inputId}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className={cn("input", error && "input-error", className)}
        {...props}
      />
      {error && <p id={errorId} className="field-error" role="alert">{error}</p>}
    </div>
  );
}
