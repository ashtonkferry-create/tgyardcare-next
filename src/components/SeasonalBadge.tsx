'use client';

import { useSeasonalTheme, Season } from '@/contexts/SeasonalThemeContext';
import { Leaf, Sun, CloudRain, Snowflake } from 'lucide-react';
import { cn } from '@/lib/utils';

const seasonIcons: Record<Season, typeof Leaf> = {
  summer: Sun,
  fall: CloudRain,
  winter: Snowflake,
};

const seasonColors: Record<Season, string> = {
  summer: 'bg-green-500/10 text-green-600 border-green-500/20',
  fall: 'bg-orange-500/10 text-orange-600 border-orange-500/20',
  winter: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
};

interface SeasonalBadgeProps {
  className?: string;
  showIcon?: boolean;
  size?: 'sm' | 'md';
}

export function SeasonalBadge({ className, showIcon = true, size = 'sm' }: SeasonalBadgeProps) {
  const { activeSeason, seasonBadge, isPreviewMode } = useSeasonalTheme();

  const Icon = seasonIcons[activeSeason];

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border font-semibold transition-all",
        seasonColors[activeSeason],
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm',
        isPreviewMode && 'ring-2 ring-primary ring-offset-1',
        className
      )}
    >
      {showIcon && <Icon className={cn(size === 'sm' ? 'h-3 w-3' : 'h-4 w-4')} />}
      <span>{seasonBadge}</span>
      {isPreviewMode && (
        <span className="ml-1 text-primary">(Preview)</span>
      )}
    </div>
  );
}
