'use client';

import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

/**
 * Standardized section header component for consistent visual hierarchy.
 * Creates rhythm and reduces cognitive load across pages.
 */

interface SectionHeaderProps {
  badge?: string;
  badgeIcon?: LucideIcon;
  title: string;
  titleHighlight?: string;
  description?: string;
  align?: "left" | "center";
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function SectionHeader({
  badge,
  badgeIcon: BadgeIcon,
  title,
  titleHighlight,
  description,
  align = "center",
  size = "md",
  className
}: SectionHeaderProps) {
  const alignClass = align === "center" ? "text-center mx-auto" : "text-left";

  const titleSizes = {
    sm: "text-2xl md:text-3xl",
    md: "text-3xl md:text-4xl",
    lg: "text-3xl sm:text-4xl md:text-5xl"
  };

  const descSizes = {
    sm: "text-base",
    md: "text-lg",
    lg: "text-lg md:text-xl"
  };

  const maxWidths = {
    sm: "max-w-lg",
    md: "max-w-2xl",
    lg: "max-w-3xl"
  };

  return (
    <div className={cn(alignClass, "mb-10 md:mb-14", className)}>
      {/* Optional hairline above */}
      {align === "center" && (
        <div className="w-12 h-px bg-border mx-auto mb-6" />
      )}

      {/* Badge */}
      {badge && (
        <div className={cn(
          "inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-xs font-bold mb-4 border border-primary/10",
          align === "center" && "mx-auto"
        )}>
          {BadgeIcon && <BadgeIcon className="h-3.5 w-3.5" />}
          {badge}
        </div>
      )}

      {/* Title */}
      <h2 className={cn(
        "font-bold text-foreground leading-tight mb-3",
        titleSizes[size]
      )}>
        {title}
        {titleHighlight && (
          <span className="text-primary"> {titleHighlight}</span>
        )}
      </h2>

      {/* Description */}
      {description && (
        <p className={cn(
          "text-muted-foreground",
          descSizes[size],
          maxWidths[size],
          align === "center" && "mx-auto"
        )}>
          {description}
        </p>
      )}
    </div>
  );
}

export default SectionHeader;
