'use client';

import { cn } from "@/lib/utils";

/**
 * Visual transition elements that create smooth flow between sections.
 * These eliminate dead zones and create momentum in the scroll journey.
 */

interface SectionTransitionProps {
  variant?: "fade" | "gradient" | "arrow" | "connector" | "wave";
  from?: string; // HSL color values for gradients
  to?: string;
  className?: string;
}

// Subtle fade transition - creates soft visual bridge
export function SectionFade({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "h-16 md:h-24 bg-gradient-to-b from-transparent via-border/30 to-transparent",
        className
      )}
    />
  );
}

// Gradient bridge between sections of different colors
export function SectionGradientBridge({
  from = "background",
  to = "muted",
  className
}: SectionTransitionProps) {
  return (
    <div
      className={cn(
        "h-20 md:h-32 relative overflow-hidden",
        className
      )}
      style={{
        background: `linear-gradient(180deg, hsl(var(--${from})) 0%, hsl(var(--${to})) 100%)`
      }}
    />
  );
}

// Visual arrow/chevron pointing down - subtle scroll cue
export function SectionArrow({ className }: { className?: string }) {
  return (
    <div className={cn("flex justify-center py-6 md:py-10", className)}>
      <div className="relative">
        {/* Soft glow behind arrow */}
        <div className="absolute inset-0 blur-xl bg-primary/10 rounded-full" />
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          className="relative text-muted-foreground/50 animate-bounce-gentle"
        >
          <path
            d="M12 5v14M19 12l-7 7-7-7"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </div>
  );
}

// Connector line with dot - shows progression
export function SectionConnector({ className }: { className?: string }) {
  return (
    <div className={cn("flex flex-col items-center py-6 md:py-8", className)}>
      <div className="w-px h-8 md:h-12 bg-gradient-to-b from-transparent via-border to-border" />
      <div className="w-2 h-2 rounded-full bg-primary/40 my-2" />
      <div className="w-px h-8 md:h-12 bg-gradient-to-b from-border via-border to-transparent" />
    </div>
  );
}

// Elegant wave separator
export function SectionWave({
  from = "#ffffff",
  to = "#f8fafc",
  flip = false,
  className
}: { from?: string; to?: string; flip?: boolean; className?: string }) {
  return (
    <div className={cn("relative -my-px", flip && "rotate-180", className)}>
      <svg
        viewBox="0 0 1440 60"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-12 md:h-16"
        preserveAspectRatio="none"
      >
        <path
          d="M0 60V30C360 0 720 50 1080 30C1260 20 1380 25 1440 30V60H0Z"
          fill={to}
        />
        <path
          d="M0 0V30C360 0 720 50 1080 30C1260 20 1380 25 1440 30V0H0Z"
          fill={from}
        />
      </svg>
    </div>
  );
}

// Hairline divider - subtle visual pause
export function SectionDivider({ className }: { className?: string }) {
  return (
    <div className={cn("py-6 md:py-8", className)}>
      <div className="w-full h-px bg-gradient-to-r from-transparent via-blue-200/40 to-transparent" />
    </div>
  );
}

// Centered hairline with optional label
export function SectionDividerLabeled({
  label,
  className
}: { label?: string; className?: string }) {
  return (
    <div className={cn("py-6 md:py-8 flex items-center gap-4", className)}>
      <div className="flex-1 h-px bg-gradient-to-r from-transparent to-border" />
      {label && (
        <span className="text-xs uppercase tracking-wider text-muted-foreground/50 font-medium">
          {label}
        </span>
      )}
      <div className="flex-1 h-px bg-gradient-to-l from-transparent to-border" />
    </div>
  );
}

// Main transition component with variant selection
export function SectionTransition({
  variant = "fade",
  from,
  to,
  className
}: SectionTransitionProps) {
  switch (variant) {
    case "gradient":
      return <SectionGradientBridge from={from} to={to} className={className} />;
    case "arrow":
      return <SectionArrow className={className} />;
    case "connector":
      return <SectionConnector className={className} />;
    case "wave":
      return <SectionWave from={from} to={to} className={className} />;
    case "fade":
    default:
      return <SectionFade className={className} />;
  }
}

export default SectionTransition;
