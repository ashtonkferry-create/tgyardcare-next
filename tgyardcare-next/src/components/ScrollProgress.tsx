'use client';

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

/**
 * Subtle scroll progress indicator that shows reading depth.
 * Increases engagement signals and provides subtle momentum cue.
 */

interface ScrollProgressProps {
  className?: string;
  showPercentage?: boolean;
  variant?: "bar" | "dots" | "minimal";
}

export function ScrollProgress({
  className,
  showPercentage = false,
  variant = "minimal"
}: ScrollProgressProps) {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      setScrollProgress(Math.min(progress, 100));
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // Initial calculation

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (variant === "minimal") {
    return (
      <div
        className={cn(
          "fixed top-0 left-0 right-0 h-0.5 z-50 pointer-events-none",
          className
        )}
      >
        <div
          className="h-full bg-gradient-to-r from-primary via-primary to-primary/70 transition-all duration-150 ease-out"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>
    );
  }

  if (variant === "bar") {
    return (
      <div
        className={cn(
          "fixed top-0 left-0 right-0 h-1 z-50 bg-border/30 pointer-events-none",
          className
        )}
      >
        <div
          className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-150 ease-out shadow-sm shadow-primary/20"
          style={{ width: `${scrollProgress}%` }}
        />
        {showPercentage && scrollProgress > 5 && (
          <div
            className="absolute top-2 text-[10px] font-bold text-primary bg-background/90 px-1.5 py-0.5 rounded shadow-sm transition-all duration-150"
            style={{ left: `${Math.min(scrollProgress, 95)}%`, transform: 'translateX(-50%)' }}
          >
            {Math.round(scrollProgress)}%
          </div>
        )}
      </div>
    );
  }

  // Dots variant - subtle side indicator
  if (variant === "dots") {
    const totalDots = 5;
    const activeDots = Math.ceil((scrollProgress / 100) * totalDots);

    return (
      <div
        className={cn(
          "fixed right-4 top-1/2 -translate-y-1/2 z-50 hidden lg:flex flex-col gap-2",
          className
        )}
      >
        {Array.from({ length: totalDots }).map((_, i) => (
          <div
            key={i}
            className={cn(
              "w-1.5 h-1.5 rounded-full transition-all duration-300",
              i < activeDots
                ? "bg-primary scale-110"
                : "bg-border"
            )}
          />
        ))}
      </div>
    );
  }

  return null;
}

export default ScrollProgress;
