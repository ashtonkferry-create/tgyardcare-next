'use client';

import Link from 'next/link';
import {
  Scissors, Leaf, Droplets, Flower2, SprayCan, TreePine, Snowflake,
  Calendar, Home, Sprout, ArrowRight, type LucideIcon,
} from 'lucide-react';
import { ScrollReveal } from '@/components/ScrollReveal';
import { useSeasonalTheme } from '@/contexts/SeasonalThemeContext';
import { cn } from '@/lib/utils';

export interface CrossSellItem {
  href: string;
  title: string;
  desc: string;
  price: string;
  icon?: string;
}

const iconMap: Record<string, LucideIcon> = {
  fertilization: Droplets,
  aeration: Sprout,
  weeding: Flower2,
  mulching: TreePine,
  mowing: Scissors,
  'leaf-removal': Leaf,
  'fall-cleanup': Leaf,
  'spring-cleanup': Calendar,
  'gutter-cleaning': Home,
  'gutter-guards': Home,
  herbicide: SprayCan,
  'snow-removal': Snowflake,
  'garden-beds': Flower2,
  pruning: TreePine,
};

function getIcon(href: string): LucideIcon {
  const slug = href.split('/').pop() || '';
  return iconMap[slug] || Sprout;
}

const accentMap = {
  summer: {
    iconBg: 'bg-emerald-500/15',
    iconText: 'text-emerald-400',
    priceBadge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    hoverBorder: 'group-hover:border-emerald-500/40',
    arrow: 'text-emerald-400',
    glow: 'group-hover:shadow-emerald-500/10',
  },
  fall: {
    iconBg: 'bg-amber-500/15',
    iconText: 'text-amber-400',
    priceBadge: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    hoverBorder: 'group-hover:border-amber-500/40',
    arrow: 'text-amber-400',
    glow: 'group-hover:shadow-amber-500/10',
  },
  winter: {
    iconBg: 'bg-cyan-500/15',
    iconText: 'text-cyan-400',
    priceBadge: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
    hoverBorder: 'group-hover:border-cyan-500/40',
    arrow: 'text-cyan-400',
    glow: 'group-hover:shadow-cyan-500/10',
  },
} as const;

interface CrossSellGridProps {
  heading: string;
  subheading: string;
  items: CrossSellItem[];
}

export function CrossSellGrid({ heading, subheading, items }: CrossSellGridProps) {
  const { activeSeason } = useSeasonalTheme();
  const accent = accentMap[activeSeason];

  return (
    <section className="py-14 md:py-20">
      <div className="container mx-auto px-4">
        <ScrollReveal>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-3 text-center">
            {heading}
          </h2>
          <p className="text-center text-white/50 mb-10 max-w-2xl mx-auto">
            {subheading}
          </p>
        </ScrollReveal>

        <div className={cn(
          'grid gap-4 max-w-5xl mx-auto',
          items.length <= 3 ? 'grid-cols-1 md:grid-cols-3' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
        )}>
          {items.map((item, i) => {
            const Icon = getIcon(item.href);
            return (
              <ScrollReveal key={i} delay={i * 0.08}>
                <Link href={item.href} className="block group h-full">
                  <div className={cn(
                    'relative h-full rounded-2xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-sm',
                    'p-5 flex flex-col items-center text-center',
                    'transition-all duration-300',
                    'hover:-translate-y-1 hover:shadow-xl',
                    accent.hoverBorder,
                    accent.glow,
                  )}>
                    {/* Icon */}
                    <div className={cn(
                      'w-12 h-12 rounded-xl flex items-center justify-center mb-3',
                      accent.iconBg,
                    )}>
                      <Icon className={cn('w-6 h-6', accent.iconText)} />
                    </div>

                    {/* Title */}
                    <h3 className="text-lg font-semibold text-white mb-1.5 group-hover:text-white transition-colors">
                      {item.title}
                    </h3>

                    {/* Description */}
                    <p className="text-sm text-white/50 mb-3 leading-relaxed flex-1">
                      {item.desc}
                    </p>

                    {/* Price badge */}
                    <span className={cn(
                      'inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border mb-3',
                      accent.priceBadge,
                    )}>
                      From {item.price}
                    </span>

                    {/* Arrow CTA */}
                    <span className={cn(
                      'inline-flex items-center gap-1 text-sm font-medium transition-all duration-300',
                      'opacity-60 group-hover:opacity-100',
                      accent.arrow,
                    )}>
                      Learn More
                      <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                    </span>
                  </div>
                </Link>
              </ScrollReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
