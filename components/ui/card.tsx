"use client";

import * as React from "react";
import { Heart, Anchor, Tag } from "lucide-react";
import { cn } from "@/lib/utils";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "glass" | "elevated" | "travel-full" | "travel-split";
  image?: string;
  title?: string;
  subtitle?: string;
  price?: string;
  locationCode?: string;
  label?: string;
  action?: string;
  isFavorite?: boolean;
  onFavoriteToggle?: () => void;
  onActionClick?: () => void;
  children?: React.ReactNode;
}

export function Card({
  className,
  variant = "default",
  image,
  title,
  subtitle,
  price,
  locationCode,
  label,
  action = "Verify Document",
  isFavorite: initialFavorite = false,
  onFavoriteToggle,
  onActionClick,
  children,
  ...props
}: CardProps) {
  const [favorite, setFavorite] = React.useState(initialFavorite);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorite(!favorite);
    if (onFavoriteToggle) onFavoriteToggle();
  };

  // Image 1 Variant 1: Full-Bleed Travel Card (e.g. New York)
  if (variant === "travel-full") {
    return (
      <div
        className={cn(
          "group relative w-full max-w-[340px] h-[480px] rounded-[36px] overflow-hidden p-2.5 bg-white dark:bg-zinc-800 shadow-xl hover:shadow-2xl transition-all duration-500 ease-out hover:-translate-y-2 ring-1 ring-black/[0.04] dark:ring-white/[0.08]",
          className
        )}
        {...props}
      >
        {/* Full-bleed background image with subtle zoom on hover */}
        <div className="absolute inset-2.5 rounded-[28px] overflow-hidden">
          <img
            src={
              image ||
              "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=800&q=80"
            }
            alt={title || "Destination"}
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-108"
          />
          {/* Subtle top & bottom gradient overlays */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-transparent to-black/85" />
        </div>

        {/* Top-right translucent heart button (Image 1 style) */}
        <div className="relative z-10 flex justify-end p-4">
          <button
            type="button"
            onClick={handleFavoriteClick}
            aria-label="Add to favorites"
            className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md flex items-center justify-center text-white transition-all duration-200 active:scale-90 shadow-sm"
          >
            <Heart
              className={cn(
                "w-4 h-4 transition-colors",
                favorite ? "fill-rose-500 text-rose-500" : "text-white"
              )}
            />
          </button>
        </div>

        {/* Bottom Frosted Glass Card Area (Image 1 style) */}
        <div className="absolute inset-x-2.5 bottom-2.5 z-10 p-5 rounded-b-[28px] bg-gradient-to-t from-black/80 via-black/50 to-transparent backdrop-blur-md text-white">
          <h3 className="text-2xl font-bold tracking-tight text-white mb-0.5">
            {title || "Nhava Sheva Terminal"}
          </h3>
          <p className="text-xs text-white/75 font-medium mb-3">
            {subtitle || "Bill of Lading • FCL Manifest"}
          </p>

          {/* Meta Chips: Container spec and Port code */}
          <div className="flex items-center gap-4 text-xs text-white/90 mb-4 font-medium">
            <span className="flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-white/80" />
              <span>{price || "40ft Dry Container"}</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Anchor className="w-3.5 h-3.5 text-white/80" />
              <span>{locationCode || "INNSA"}</span>
            </span>
          </div>

          {/* Full-width White Pill Button */}
          <button
            type="button"
            onClick={onActionClick}
            className="w-full py-3 rounded-full bg-white text-zinc-900 hover:bg-zinc-100 font-semibold text-xs tracking-tight shadow-md hover:shadow-lg active:scale-[0.98] transition-all duration-200 flex items-center justify-center"
          >
            {action}
          </button>
        </div>
      </div>
    );
  }

  // Image 1 Variant 2: Split Travel Card (e.g. San Francisco)
  if (variant === "travel-split") {
    return (
      <div
        className={cn(
          "group w-full max-w-[340px] rounded-[36px] overflow-hidden bg-white dark:bg-zinc-900 shadow-xl hover:shadow-2xl transition-all duration-500 ease-out hover:-translate-y-2 ring-1 ring-black/[0.04] dark:ring-white/[0.08] flex flex-col p-2.5",
          className
        )}
        {...props}
      >
        {/* Top Half: Photo with rounded corners */}
        <div className="relative w-full h-[240px] rounded-[28px] overflow-hidden">
          <img
            src={
              image ||
              "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?auto=format&fit=crop&w=800&q=80"
            }
            alt={title || "Destination"}
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-108"
          />
        </div>

        {/* Bottom Half: Clean details */}
        <div className="p-4 pt-5 flex flex-col flex-1 justify-between">
          <div>
            <h3 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white mb-0.5">
              {title || "Mundra Port Terminal"}
            </h3>
            <p className="text-xs text-zinc-400 dark:text-zinc-500 font-medium mb-3">
              {subtitle || "Commercial Invoice & Packing List"}
            </p>

            {/* Meta Chips */}
            <div className="flex items-center gap-4 text-xs text-zinc-600 dark:text-zinc-300 mb-5 font-medium">
              <span className="flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-zinc-400" />
                <span>{price || "20ft Reefer Cargo"}</span>
              </span>
              <span className="flex items-center gap-1.5">
                <Anchor className="w-3.5 h-3.5 text-zinc-400" />
                <span>{locationCode || "INMUN"}</span>
              </span>
            </div>
          </div>

          {/* Action Row: Black pill button + Heart outline circle button */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onActionClick}
              className="flex-1 py-3 rounded-full bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100 text-white font-semibold text-xs tracking-tight shadow-md hover:shadow-lg active:scale-[0.98] transition-all duration-200 flex items-center justify-center"
            >
              {action}
            </button>
            <button
              type="button"
              onClick={handleFavoriteClick}
              aria-label="Add to favorites"
              className={cn(
                "w-11 h-11 rounded-full border flex items-center justify-center transition-all duration-200 active:scale-90 shrink-0",
                favorite
                  ? "border-rose-200 bg-rose-50 dark:bg-rose-950/40 text-rose-500"
                  : "border-zinc-200 dark:border-zinc-700 text-zinc-400 hover:text-rose-500 hover:border-rose-200"
              )}
            >
              <Heart
                className={cn(
                  "w-4 h-4 transition-colors",
                  favorite && "fill-rose-500 text-rose-500"
                )}
              />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Standard Variants (default, glass, elevated)
  const variants = {
    default: "rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-sm hover-lift transition-all duration-300",
    glass: "rounded-2xl border border-[hsl(var(--border))/0.5] glass-panel hover-lift transition-all duration-300",
    elevated: "rounded-2xl border border-[hsl(var(--border))] glass-panel-strong hover-lift transition-all duration-300",
  };

  return (
    <div
      className={cn(variants[variant as keyof typeof variants] || variants.default, className)}
      {...props}
    >
      {image && (
        <div className="relative overflow-hidden rounded-xl">
          <img
            src={image}
            alt=""
            className="w-full h-48 object-cover transition-transform duration-500 ease-out group-hover:scale-105"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[hsl(var(--background))/80] via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
      )}
      <div className="p-5">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
          {title && <h3 className="font-heading font-semibold text-[hsl(var(--foreground))] text-lg">{title}</h3>}
          {label && (
            <span className="text-xs font-medium text-[hsl(var(--primary))] bg-[hsl(var(--primary))/10] px-2 py-0.5 rounded">
              {label}
            </span>
          )}
        </div>
        {subtitle && <p className="text-sm text-[hsl(var(--muted-foreground))] mb-4">{subtitle}</p>}
        <div className="flex items-center justify-between gap-3">
          {price && (
            <span className="font-heading font-semibold text-[hsl(var(--foreground))]">{price}</span>
          )}
          {action && (
            <button
              onClick={onActionClick}
              className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-[hsl(var(--foreground))] px-3 py-1.5 text-[hsl(var(--background))] text-xs font-semibold transition-all duration-200 ease-out hover:bg-[hsl(var(--primary))] hover:text-white hover:shadow-lg hover:shadow-[hsl(var(--primary))/0.4]"
            >
              {action}
              <span className="w-3 h-3">→</span>
            </button>
          )}
        </div>
        {children && <div className="mt-4">{children}</div>}
      </div>
    </div>
  );
}

// Export Customs Cards Showcase Component for embedding wherever required
export function TravelCardsShowcase() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-8 py-8 animate-in fade-in duration-500">
      <Card
        variant="travel-full"
        title="Nhava Sheva Terminal"
        subtitle="Bill of Lading • FCL Manifest"
        price="40ft Dry Container"
        locationCode="INNSA"
        action="Verify Document"
        image="https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=800&q=80"
      />
      <Card
        variant="travel-split"
        title="Mundra Port Terminal"
        subtitle="Commercial Invoice & Packing List"
        price="20ft Reefer Cargo"
        locationCode="INMUN"
        action="Verify Document"
        image="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80"
      />
    </div>
  );
}

export const CustomsCardsShowcase = TravelCardsShowcase;
