import { ScrollRevealWrapper } from '@/components/home/ScrollRevealWrapper';

/**
 * SERVER COMPONENT — no 'use client' directive.
 *
 * Renders 4 trust stat counters (500+, 4.9 stars, 12 cities, 24hr response).
 * Uses ScrollRevealWrapper (client island) for scroll-triggered reveal animation,
 * keeping the stats markup itself as a Server Component for zero JS overhead.
 */

const trustStats = [
  { value: '500+', label: 'Dane County Properties' },
  { value: '4.9\u2605', label: '80+ Google Reviews' },
  { value: '12', label: 'Madison-Area Cities' },
  { value: '24hr', label: 'Quote Response' },
] as const;

export function StatsStrip() {
  return (
    <section className="py-6 md:py-8 bg-gradient-to-r from-[#0f2a1a] via-[#1a3a2a] to-[#0f2a1a] text-white">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 text-center">
          {trustStats.map((stat, index) => (
            <ScrollRevealWrapper
              key={stat.label}
              delay={index * 0.1}
              direction="up"
            >
              <div className="w-8 h-0.5 bg-white/30 mx-auto mb-3" />
              <div className="text-4xl md:text-5xl font-bold mb-1">
                {stat.value}
              </div>
              <div className="text-sm md:text-base opacity-90">
                {stat.label}
              </div>
            </ScrollRevealWrapper>
          ))}
        </div>
      </div>
    </section>
  );
}
