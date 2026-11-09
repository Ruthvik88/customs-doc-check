"use client";

import * as React from "react";

// Single icon wrapper used across the app so every icon is lucide,
// drawn at one of two sizes (16px in tables/buttons, 20px in headers),
// with a 1.75 stroke and currentColor. Consumers pass the lucide component
// via the `as` prop, e.g. `<Icon as={Table} size={16} />`.
export function Icon({
  as: IconComponent,
  size = 16,
  strokeWidth = 1.75,
  className,
  ...props
}: {
  as: React.ElementType;
  size?: number;
  strokeWidth?: number;
  className?: string;
} & Omit<React.SVGProps<SVGSVGElement>, "size" | "strokeWidth">) {
  return (
    <IconComponent
      size={size}
      strokeWidth={strokeWidth}
      className={className}
      {...props}
    />
  );
}
