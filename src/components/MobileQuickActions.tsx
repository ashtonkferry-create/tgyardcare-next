'use client';

import Link from "next/link";
import { Scissors, Snowflake, Leaf, Home, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSeasonalTheme } from "@/contexts/SeasonalThemeContext";

/**
 * Mobile quick action cards - visible in first/second scroll
 * High-intent service shortcuts for impatient users
 */

interface QuickAction {
  icon: typeof Scissors;
  label: string;
  path: string;
  highlight?: boolean;
}

const summerActions: QuickAction[] = [
  { icon: Scissors, label: "Mowing", path: "/services/mowing", highlight: true },
  { icon: Leaf, label: "Cleanup", path: "/services/spring-cleanup" },
  { icon: Home, label: "Gutters", path: "/services/gutter-cleaning" },
];

const winterActions: QuickAction[] = [
  { icon: Snowflake, label: "Snow", path: "/services/snow-removal", highlight: true },
  { icon: Home, label: "Gutters", path: "/services/gutter-cleaning" },
  { icon: Leaf, label: "Cleanup", path: "/services/fall-cleanup" },
];

const fallActions: QuickAction[] = [
  { icon: Leaf, label: "Cleanup", path: "/services/fall-cleanup", highlight: true },
  { icon: Home, label: "Gutters", path: "/services/gutter-cleaning" },
  { icon: Scissors, label: "Mowing", path: "/services/mowing" },
];

export function MobileQuickActions({ className }: { className?: string }) {
  const { activeSeason } = useSeasonalTheme();

  const actions = activeSeason === 'winter'
    ? winterActions
    : activeSeason === 'fall'
      ? fallActions
      : summerActions;

  return (
    <div className={cn("lg:hidden", className)}>
      <div className="px-4 py-4">
        <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-3">
          Quick Start →
        </p>
        <div className="grid grid-cols-3 gap-2">
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.path}
                href={action.path}
                className={cn(
                  "flex flex-col items-center justify-center gap-1.5",
                  "p-4 rounded-xl",
                  "active:scale-95 transition-transform",
                  "tap-target",
                  action.highlight
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                    : "bg-muted/50 border border-border/50 text-foreground"
                )}
              >
                <Icon className="h-5 w-5" />
                <span className="text-xs font-bold">{action.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// Inline horizontal scroll variant
export function MobileQuickActionsInline({ className }: { className?: string }) {
  const { activeSeason } = useSeasonalTheme();

  const actions = activeSeason === 'winter'
    ? winterActions
    : activeSeason === 'fall'
      ? fallActions
      : summerActions;

  return (
    <div className={cn("lg:hidden overflow-x-auto scrollbar-hide -mx-4 px-4", className)}>
      <div className="flex gap-2 pb-2">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.path}
              href={action.path}
              className={cn(
                "flex items-center gap-2 flex-shrink-0",
                "px-4 py-2.5 rounded-full",
                "active:scale-95 transition-transform",
                action.highlight
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted border border-border text-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              <span className="text-sm font-semibold whitespace-nowrap">{action.label}</span>
              <ArrowRight className="h-3.5 w-3.5 opacity-50" />
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export default MobileQuickActions;
