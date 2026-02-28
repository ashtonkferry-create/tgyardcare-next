'use client';

import Link from "next/link";
import { Button } from '@/components/ui/button';
import { ArrowRight, Shield, Clock, AlertTriangle, CheckCircle2, Zap, Phone, Crown, Star, Sparkles, Users, Leaf, Sun, Wind, Trees, CircleDot, Home, Scissors, Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSeasonalTheme, Season } from '@/contexts/SeasonalThemeContext';

interface PackageProps {
  name: string;
  badge: string;
  tagline: string;
  price: string;
  priceNote: string;
  features: string[];
  isBestDeal?: boolean;
  isCommercial?: boolean;
  savings?: string;
  ctaText: string;
  secondaryCtaText?: string;
  microProof?: string;
  limitedSlots?: boolean;
  serviceKey: string;
  seasonAccent: 'spring' | 'summer' | 'fall';
}

// Season-specific color configurations
// 3-season system: summer (covers spring+summer), fall, winter
// Winter has its own WinterPriorityServices component
const seasonColorConfig: Record<Exclude<Season, 'winter'>, {
  gradient: string;
  lightGradient: string;
  accent: string;
  badge: string;
  badgeLight: string;
  shadow: string;
  iconBg: string;
  icon: string;
  urgency: string;
  bottomCta: string;
  ctaButton: string;
  bgBlur1: string;
  bgBlur2: string;
  seasonIcon: typeof Leaf;
}> = {
  summer: {
    gradient: 'from-green-600 via-emerald-700 to-teal-700',
    lightGradient: 'from-green-500/20 to-teal-500/10',
    accent: 'text-green-600',
    badge: 'from-green-600 to-teal-600',
    badgeLight: 'bg-green-50 text-green-600',
    shadow: 'shadow-green-500/30',
    iconBg: 'bg-green-100',
    icon: 'text-green-600',
    urgency: 'from-amber-500 to-orange-500',
    bottomCta: 'from-green-900 via-emerald-800 to-green-900',
    ctaButton: 'from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600',
    bgBlur1: 'bg-green-100/50',
    bgBlur2: 'bg-emerald-100/50',
    seasonIcon: Sun,
  },
  fall: {
    gradient: 'from-orange-600 via-red-700 to-amber-700',
    lightGradient: 'from-orange-500/20 to-red-500/10',
    accent: 'text-orange-600',
    badge: 'from-orange-600 to-red-600',
    badgeLight: 'bg-orange-50 text-orange-600',
    shadow: 'shadow-orange-500/30',
    iconBg: 'bg-orange-100',
    icon: 'text-orange-600',
    urgency: 'from-orange-500 to-red-500',
    bottomCta: 'from-orange-900 via-red-800 to-orange-900',
    ctaButton: 'from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600',
    bgBlur1: 'bg-orange-100/50',
    bgBlur2: 'bg-amber-100/50',
    seasonIcon: Wind,
  },
};

function LuxuryPackageCard({
  name,
  badge,
  tagline,
  price,
  priceNote,
  features,
  isBestDeal,
  savings,
  ctaText,
  secondaryCtaText,
  microProof,
  limitedSlots,
  isCommercial,
  serviceKey,
  seasonAccent
}: PackageProps) {
  const colors = seasonColorConfig[seasonAccent];

  return (
    <div className={cn(
      "group relative rounded-2xl transition-all duration-500 flex flex-col h-full",
      "hover:-translate-y-2 hover:shadow-2xl",
      isCommercial
        ? "bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460] text-white shadow-2xl shadow-amber-900/20 ring-1 ring-amber-500/20"
        : isBestDeal
          ? `bg-gradient-to-br ${colors.gradient} text-white shadow-xl ${colors.shadow} ring-2 ring-white/30 scale-[1.02] z-10`
          : "bg-white border border-slate-200/80 shadow-lg hover:border-primary/30 hover:shadow-primary/10"
    )}>
      {/* Premium Badge */}
      <div className={cn(
        "absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide shadow-lg flex items-center gap-1.5 whitespace-nowrap",
        isCommercial
          ? "bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-500 text-amber-950 shadow-amber-500/30"
          : isBestDeal
            ? "bg-gradient-to-r from-amber-400 to-yellow-400 text-amber-900"
            : "bg-slate-800 text-white"
      )}>
        {isBestDeal && <Crown className="h-3.5 w-3.5" />}
        {isCommercial && <Crown className="h-3.5 w-3.5" />}
        {badge}
      </div>

      {/* Card Content */}
      <div className="p-6 sm:p-8 pt-8 flex flex-col h-full">
        {/* Package Header */}
        <div className="text-center mb-6">
          {/* Contract Type Label */}
          <div className={cn(
            "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider mb-3",
            isCommercial
              ? "bg-gradient-to-r from-amber-500/15 to-yellow-500/15 text-amber-400 border border-amber-500/25"
              : isBestDeal
                ? "bg-white/15 text-white/90"
                : colors.badgeLight
          )}>
            {isCommercial ? (
              <>
                <Building2 className="h-3 w-3" />
                Commercial
              </>
            ) : (
              <>
                <colors.seasonIcon className="h-3 w-3" />
                Residential
              </>
            )}
          </div>
          <h3 className={cn(
            "text-xl sm:text-2xl font-black mb-1 leading-tight",
            isCommercial
              ? "text-white"
              : isBestDeal
                ? "text-white"
                : "text-slate-900"
          )}>
            {tagline}
          </h3>
          <p className={cn(
            "text-sm",
            isCommercial
              ? "text-amber-200/60"
              : isBestDeal
                ? "text-white/70"
                : "text-slate-500"
          )}>
            {priceNote}
          </p>
        </div>

        {/* Price */}
        <div className="text-center mb-6">
          <div className={cn(
            "text-xs font-semibold uppercase tracking-wider mb-1",
            isCommercial
              ? "text-amber-400/80"
              : isBestDeal
                ? "text-emerald-200/90"
                : "text-slate-500"
          )}>
            Starting at
          </div>
          <div className={cn(
            "text-4xl sm:text-5xl font-black leading-none",
            isCommercial
              ? "bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-300 bg-clip-text text-transparent"
              : isBestDeal
                ? "text-white"
                : "text-slate-900"
          )}>
            {price}
          </div>
          {savings && (
            <div className="inline-flex items-center gap-1.5 mt-2 text-sm font-bold text-emerald-200 bg-emerald-400/20 px-3 py-1 rounded-full">
              <Sparkles className="h-3.5 w-3.5" />
              {savings}
            </div>
          )}
        </div>

        {/* Features */}
        <ul className="space-y-3 mb-6 flex-grow">
          {features.map((feature, idx) => (
            <li key={idx} className="flex items-start gap-2.5 text-sm">
              <div className={cn(
                "p-0.5 rounded-full mt-0.5 flex-shrink-0",
                isCommercial
                  ? "bg-amber-500/20"
                  : isBestDeal
                    ? "bg-white/20"
                    : colors.iconBg
              )}>
                <CheckCircle2 className={cn(
                  "h-3.5 w-3.5",
                  isCommercial
                    ? "text-amber-400"
                    : isBestDeal
                      ? "text-white"
                      : colors.icon
                )} />
              </div>
              <span className={cn(
                "font-medium leading-snug",
                isCommercial
                  ? "text-slate-300"
                  : isBestDeal
                    ? "text-white/95"
                    : "text-slate-700"
              )}>
                {feature}
              </span>
            </li>
          ))}
        </ul>

        {/* Micro Proof */}
        {microProof && (
          <p className={cn(
            "text-xs text-center mb-4 font-medium",
            isCommercial
              ? "text-amber-300/60"
              : isBestDeal
                ? "text-white/60"
                : "text-slate-400"
          )}>
            {microProof}
          </p>
        )}

        {/* Trust Line */}
        <div className="flex items-center justify-center gap-2 mb-5">
          {['Insured', 'Local', 'Reliable'].map((item, idx) => (
            <span
              key={idx}
              className={cn(
                "text-[10px] font-semibold uppercase tracking-wide px-2 py-1 rounded-full",
                isCommercial
                  ? "bg-amber-500/10 text-amber-400/80 border border-amber-500/20"
                  : isBestDeal
                    ? "bg-white/10 text-white/80"
                    : "bg-slate-100 text-slate-500"
              )}
            >
              {item}
            </span>
          ))}
        </div>

        {/* CTA Buttons - Same Height, Aligned */}
        <div className="space-y-2.5 mt-auto">
          <Button
            size="lg"
            className={cn(
              "w-full font-bold text-sm h-12 transition-all duration-300",
              "hover:scale-[1.02] active:scale-[0.98]",
              isCommercial
                ? "relative bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-500 hover:from-amber-500 hover:via-yellow-400 hover:to-amber-400 text-amber-950 shadow-lg shadow-amber-500/30 border border-amber-400/30 font-extrabold tracking-wide"
                : isBestDeal
                  ? "bg-white text-slate-900 hover:bg-slate-50 shadow-md"
                  : `bg-gradient-to-r ${colors.ctaButton} text-white shadow-md ${colors.shadow.replace('shadow-', 'shadow-')}/20`
            )}
            asChild
          >
            <Link href={`/contact?service=${serviceKey}`} className="flex items-center justify-center gap-2">
              {isCommercial && <Crown className="h-4 w-4" />}
              {ctaText}
              <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </Button>

          {secondaryCtaText && (
            <Button
              size="lg"
              variant="outline"
              className={cn(
                "w-full font-semibold text-sm h-12 transition-all duration-300",
                isCommercial
                  ? "border-amber-500/30 text-amber-400 hover:bg-amber-500/10 hover:border-amber-400/50"
                  : isBestDeal
                    ? "border-white/30 text-white hover:bg-white/10"
                    : "border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300"
              )}
              asChild
            >
              <a href="tel:608-535-6057">
                <Phone className="mr-2 h-4 w-4" />
                {secondaryCtaText}
              </a>
            </Button>
          )}
        </div>

        {/* Limited Slots Scarcity */}
        {limitedSlots && (
          <p className={cn(
            "text-[11px] text-center mt-3 font-semibold flex items-center justify-center gap-1",
            isCommercial
              ? "text-amber-400"
              : isBestDeal
                ? "text-amber-200"
                : "text-orange-500"
          )}>
            <AlertTriangle className="h-3 w-3" />
            Limited seasonal slots remaining
          </p>
        )}
      </div>
    </div>
  );
}

// Season-specific package configurations
// Note: Spring dates use summer packages (3-season system)

const summerPackages: PackageProps[] = [
  {
    name: "Weekly",
    badge: "FLEXIBLE",
    tagline: "Weekly Mowing",
    price: "$45+",
    priceNote: "per visit • recurring service",
    features: [
      "Professional mowing every week",
      "Edging & trimming included",
      "Clipping cleanup",
      "Consistent same-day service",
      "Same crew every visit"
    ],
    ctaText: "Start Weekly",
    secondaryCtaText: "Call Us",
    microProof: "Most popular summer service",
    serviceKey: "mowing",
    seasonAccent: 'summer'
  },
  {
    name: "Premium",
    badge: "BEST VALUE",
    tagline: "Full Property Care",
    price: "$149+",
    priceNote: "per month • complete maintenance",
    features: [
      "Weekly mowing included",
      "Hedge & shrub trimming",
      "Weed control maintenance",
      "Garden bed care",
      "Fertilization add-on available",
      "Priority scheduling"
    ],
    isBestDeal: true,
    savings: "Save 25% bundled",
    ctaText: "Lock In Rate",
    secondaryCtaText: "Call Now",
    microProof: "Top choice for busy homeowners",
    limitedSlots: true,
    serviceKey: "summer-premium",
    seasonAccent: 'summer'
  },
  {
    name: "Commercial",
    badge: "ENTERPRISE",
    tagline: "Commercial Grounds",
    price: "Custom",
    priceNote: "tailored to your property",
    features: [
      "Weekly commercial mowing",
      "Large property coverage",
      "Parking area maintenance",
      "Professional appearance",
      "Multi-property discounts"
    ],
    isCommercial: true,
    ctaText: "Get Custom Quote",
    secondaryCtaText: "Schedule Call",
    microProof: "Trusted by Dane County businesses",
    serviceKey: "commercial-lawn-care",
    seasonAccent: 'summer'
  }
];

const fallPackages: PackageProps[] = [
  {
    name: "Essential",
    badge: "POPULAR",
    tagline: "Leaf Cleanup Bundle",
    price: "$199+",
    priceNote: "multi-visit package available",
    features: [
      "Complete leaf removal",
      "Lawn debris cleanup",
      "Bed cleanup included",
      "Haul-away service",
      "Multi-visit discounts"
    ],
    ctaText: "Book Cleanup",
    secondaryCtaText: "Call Us",
    microProof: "Most popular fall service",
    serviceKey: "fall-cleanup",
    seasonAccent: 'fall'
  },
  {
    name: "Premium",
    badge: "BEST VALUE",
    tagline: "Fall + Aeration Bundle",
    price: "$449+",
    priceNote: "complete fall transformation",
    features: [
      "Multi-visit leaf cleanup",
      "Core aeration service",
      "Overseeding for spring thickness",
      "Gutter cleaning included",
      "Winter prep complete",
      "Priority fall scheduling"
    ],
    isBestDeal: true,
    savings: "Save 25% bundled",
    ctaText: "Lock In Rate",
    secondaryCtaText: "Call Now",
    microProof: "Top choice for lawn health",
    limitedSlots: true,
    serviceKey: "fall-premium",
    seasonAccent: 'fall'
  },
  {
    name: "Commercial",
    badge: "ENTERPRISE",
    tagline: "Commercial Fall Prep",
    price: "Custom",
    priceNote: "tailored to your property",
    features: [
      "Large property leaf removal",
      "Commercial gutter service",
      "Parking lot cleanup",
      "Multi-property discounts",
      "Priority business scheduling"
    ],
    isCommercial: true,
    ctaText: "Get Custom Quote",
    secondaryCtaText: "Schedule Call",
    microProof: "Trusted by Dane County businesses",
    serviceKey: "commercial-seasonal",
    seasonAccent: 'fall'
  }
];

export function SeasonalPriorityServices() {
  const { activeSeason, isLoading } = useSeasonalTheme();

  // Don't render for winter (uses WinterPriorityServices)
  if (activeSeason === 'winter') return null;

  if (isLoading) {
    return (
      <section className="py-16 md:py-24 bg-gradient-to-b from-slate-50 via-white to-slate-50">
        <div className="container mx-auto px-4">
          <div className="animate-pulse text-center">
            <div className="h-8 w-64 bg-slate-200 rounded mb-4 mx-auto" />
            <div className="h-6 w-96 bg-slate-200 rounded mb-8 mx-auto" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-[500px] bg-slate-200 rounded-xl" />
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  // 3-season system: summer (covers spring+summer), fall, winter
  const packagesBySeasonMap: Record<Exclude<Season, 'winter'>, PackageProps[]> = {
    summer: summerPackages,
    fall: fallPackages,
  };

  const packages = packagesBySeasonMap[activeSeason as Exclude<Season, 'winter'>] || summerPackages;
  const colors = seasonColorConfig[activeSeason as Exclude<Season, 'winter'>] || seasonColorConfig.summer;
  const SeasonIcon = colors.seasonIcon;

  const seasonMessages: Record<Exclude<Season, 'winter'>, { title: string; subtitle: string; badge: string; urgency: string }> = {
    summer: {
      title: "Summer Protection",
      subtitle: "Three strategic options to keep your property pristine all season. Consistent crews, reliable service.",
      badge: "Summer 2025 Services",
      urgency: "Weekly mowing routes filling fast"
    },
    fall: {
      title: "Fall Preparation",
      subtitle: "Three strategic options to protect your lawn before winter. Book early for best availability.",
      badge: "Fall 2025 Services",
      urgency: "Only 10 Premium Fall packages remaining"
    }
  };

  const { title, subtitle, badge, urgency } = seasonMessages[activeSeason as Exclude<Season, 'winter'>] || seasonMessages.summer;

  return (
    <section className="py-16 md:py-24 lg:py-28 bg-gradient-to-b from-slate-50 via-white to-slate-50 relative overflow-hidden">
      {/* Background Decorations */}
      <div className={cn("absolute top-0 left-0 w-[400px] h-[400px] rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2", colors.bgBlur1)} />
      <div className={cn("absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full blur-3xl translate-x-1/2 translate-y-1/2", colors.bgBlur2)} />

      {/* Floating Icons - respect reduced motion */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none motion-reduce:hidden">
        {[...Array(8)].map((_, i) => (
          <SeasonIcon
            key={i}
            className={cn("absolute opacity-10", colors.icon)}
            style={{
              left: `${10 + Math.random() * 80}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              width: `${18 + Math.random() * 14}px`,
              height: `${18 + Math.random() * 14}px`
            }}
          />
        ))}
      </div>

      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        {/* Header */}
        <div className="text-center mb-10 md:mb-14">
          <div className={cn("inline-flex items-center gap-2 bg-gradient-to-r text-white px-5 py-2 rounded-full text-sm font-bold mb-5 shadow-lg", colors.badge, colors.shadow)}>
            <Sparkles className="h-4 w-4" />
            {badge}
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 mb-4 leading-tight">
            Choose Your{' '}
            <span className={cn("bg-gradient-to-r bg-clip-text text-transparent", colors.badge)}>
              {title}
            </span>
          </h2>
          <p className="text-slate-600 text-base md:text-lg max-w-2xl mx-auto">
            {subtitle}
          </p>
        </div>

        {/* Urgency Banner */}
        <div className="flex items-center justify-center mb-10 md:mb-12">
          <div className={cn("inline-flex items-center gap-2 sm:gap-3 bg-gradient-to-r text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-full shadow-lg", colors.urgency)}>
            <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
            <span className="font-bold text-sm sm:text-base">{urgency}</span>
            <span className="bg-white/20 px-2 py-0.5 rounded text-xs font-black hidden sm:inline">HURRY</span>
          </div>
        </div>

        {/* Packages Grid - Luxury 3-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-5 items-stretch max-w-6xl mx-auto mb-14 md:mb-16">
          {packages.map((pkg, idx) => (
            <div
              key={idx}
              className="animate-slide-up"
              style={{ animationDelay: `${(idx + 1) * 100}ms` }}
            >
              <LuxuryPackageCard {...pkg} />
            </div>
          ))}
        </div>

        {/* Trust Strip */}
        <div className="flex flex-wrap justify-center gap-3 sm:gap-4 mb-12 md:mb-14">
          {[
            { icon: Shield, text: 'Fully Insured' },
            { icon: Clock, text: 'Fast Response' },
            { icon: Star, text: '4.9★ Rating' },
            { icon: Users, text: '500+ Served' }
          ].map((item, idx) => (
            <div key={idx} className="flex items-center gap-2 bg-white px-3 sm:px-4 py-2 rounded-full shadow-md border border-slate-100">
              <item.icon className={cn("h-4 w-4", colors.icon)} />
              <span className="text-slate-700 font-semibold text-xs sm:text-sm">{item.text}</span>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className={cn("text-center bg-gradient-to-br rounded-2xl p-8 sm:p-10 md:p-12 shadow-2xl border border-slate-700/50 max-w-4xl mx-auto", colors.bottomCta)}>
          <div className="flex items-center justify-center gap-2 mb-3">
            <Zap className="h-5 w-5 text-yellow-400" />
            <span className="text-yellow-400 font-bold uppercase tracking-wider text-xs sm:text-sm">Fast Response Guaranteed</span>
          </div>
          <h3 className="text-2xl sm:text-3xl md:text-4xl font-black text-white mb-3">
            Questions? Let's Talk!
          </h3>
          <p className="text-slate-400 mb-6 sm:mb-8 max-w-lg mx-auto text-sm sm:text-base">
            Not sure which package is right for you? Get a free custom quote in under 2 minutes.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              size="lg"
              className={cn("bg-gradient-to-r text-white font-bold px-8 h-12 sm:h-14 text-base shadow-lg hover:shadow-xl transition-all hover:scale-[1.02]", colors.ctaButton)}
              asChild
            >
              <Link href="/contact">
                Get Your Free Quote <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-2 border-white/25 text-white hover:bg-white hover:text-slate-900 font-bold px-8 h-12 sm:h-14 text-base transition-all"
              asChild
            >
              <a href="tel:608-535-6057">
                <Phone className="mr-2 h-5 w-5" />
                (608) 535-6057
              </a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
