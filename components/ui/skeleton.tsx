"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  height?: number | string;
  width?: number | string;
}

export function Skeleton({ className, height = 16, width = "100%", ...props }: SkeletonProps) {
  return (
    <div
      className={cn("skeleton", className)}
      style={{ height: typeof height === "number" ? `${height}px` : height, width }}
      {...props}
    />
  );
}
