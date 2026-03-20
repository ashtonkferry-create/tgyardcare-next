'use client';

import Link from "next/link";
import { Button } from '@/components/ui/button';
import {
  ArrowRight, Shield, Clock, AlertTriangle,
  Zap, Phone, Crown, Star, Sparkles, Users, Sun, Wind,
  Building2, Check
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSeasonalTheme, Season } from '@/contexts/SeasonalThemeContext';
import { motion, type Variants } from 'framer-motion';
import { AmbientParticles } from '@/components/AmbientParticles';

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

/* ─── Dark cinematic theme tokens per season ─── */

interface DarkTheme {
  sectionBg: string;
  ambientGlow: string;
  accent: string;
  accentBg: string;
  accentBorder: string;
  featuredBorder: string;
  featuredGlow: string;
  featuredHoverGlow: string;
  featuredTopLine: string;
  featuredRadial: string;
  commercialGlow: string;
  commercialTopLine: string;
  headingGradient: string;
  ctaGradient: string;
  ctaHoverGradient: string;
  ctaShadow: string;
  checkColor: string;
  dotColors: string[];
  seasonIcon: typeof Sun;
}

const darkThemes: Record<string, DarkTheme> = {
  summer: {
    sectionBg: 'from-green-950 via-[#0a3520] to-green-950',
    ambientGlow: 'rgba(34, 197, 94, 0.12)',
    accent: 'text-green-400',
    accentBg: 'bg-green-400/10',
    accentBorder: 'border-green-400/20',
    featuredBorder: 'border-green-400/25',
    featuredGlow: '0 0 50px rgba(34,197,94,0.12), 0 0 100px rgba(34,197,94,0.05), inset 0 1px 0 rgba(34,197,94,0.1)',
    featuredHoverGlow: '0 0 70px rgba(34,197,94,0.18), 0 0 140px rgba(34,197,94,0.07), inset 0 1px 0 rgba(34,197,94,0.15)',
    featuredTopLine: 'via-green-400/50',
    featuredRadial: 'rgba(34,197,94,0.06)',
    commercialGlow: '0 0 40px rgba(245,158,11,0.08), 0 0 80px rgba(245,158,11,0.04)',
    commercialTopLine: 'via-amber-400/40',
    headingGradient: 'from-green-400 via-emerald-300 to-green-400',
    ctaGradient: 'from-green-600 to-emerald-600',
    ctaHoverGradient: 'hover:from-green-500 hover:to-emerald-500',
    ctaShadow: 'shadow-green-500/30',
    checkColor: 'text-green-400',
    dotColors: ['bg-green-400', 'bg-emerald-400'],
    seasonIcon: Sun,
  },
  fall: {
    sectionBg: 'from-[#1a110a] via-[#1f150d] to-[#1a110a]',
    ambientGlow: 'rgba(251, 191, 36, 0.04)',
    accent: 'text-amber-400',
    accentBg: 'bg-amber-400/10',
    accentBorder: 'border-amber-400/20',
    featuredBorder: 'border-amber-400/25',
    featuredGlow: '0 0 50px rgba(245,158,11,0.12), 0 0 100px rgba(245,158,11,0.05), inset 0 1px 0 rgba(245,158,11,0.1)',
    featuredHoverGlow: '0 0 70px rgba(245,158,11,0.18), 0 0 140px rgba(245,158,11,0.07), inset 0 1px 0 rgba(245,158,11,0.15)',
    featuredTopLine: 'via-amber-400/50',
    featuredRadial: 'rgba(245,158,11,0.06)',
    commercialGlow: '0 0 40px rgba(245,158,11,0.1), 0 0 80px rgba(245,158,11,0.05)',
    commercialTopLine: 'via-amber-300/40',
    headingGradient: 'from-amber-400 via-orange-300 to-amber-400',
    ctaGradient: 'from-amber-600 to-orange-600',
    ctaHoverGradient: 'hover:from-amber-500 hover:to-orange-500',
    ctaShadow: 'shadow-amber-500/30',
    checkColor: 'text-amber-400',
    dotColors: ['bg-amber-400', 'bg-orange-400'],
    seasonIcon: Wind,
  },
};

/* ─── Premium dark glass pricing card ─── */

function PricingCard({ pkg, theme }: { pkg: PackageProps; theme: DarkTheme }) {
  const { isBestDeal, isCommercial } = pkg;
  const SeasonIcon = theme.seasonIcon;

  return (
    <div
      className={cn(
        "group relative rounded-2xl flex flex-col h-full transition-all duration-500",
        "hover:-translate-y-2",
        isBestDeal && "lg:scale-[1.04] z-10",
      )}
      style={{
        boxShadow: isBestDeal
          ? theme.featuredGlow
          : isCommercial
            ? theme.commercialGlow
            : 'none',
      }}
      onMouseEnter={(e) => {
        if (isBestDeal) e.currentTarget.style.boxShadow = theme.featuredHoverGlow;
      }}
      onMouseLeave={(e) => {
        if (isBestDeal) e.currentTarget.style.boxShadow = theme.featuredGlow;
      }}
    >
      {/* Glass background */}
      <div className={cn(
        "absolute inset-0 rounded-2xl border backdrop-blur-sm transition-colors duration-500",
        isCommercial
          ? "bg-gradient-to-b from-amber-950/30 via-white/[0.03] to-amber-950/20 border-amber-500/15 group-hover:border-amber-500/25"
          : isBestDeal
            ? cn("bg-white/[0.06]", theme.featuredBorder, "group-hover:bg-white/[0.08]")
            : "bg-white/[0.03] border-white/[0.06] group-hover:border-white/[0.12]"
      )} />

      {/* Top glow line */}
      {(isBestDeal || isCommercial) && (
        <div className={cn(
          "absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent to-transparent",
          isBestDeal ? theme.featuredTopLine : theme.commercialTopLine
        )} />
      )}

      {/* Radial glow for featured card */}
      {isBestDeal && (
        <div
          className="absolute inset-0 rounded-2xl pointer-events-none"
          style={{ background: `radial-gradient(ellipse at top, ${theme.featuredRadial}, transparent 60%)` }}
        />
      )}

      {/* Badge */}
      <div className={cn(
        "absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-widest flex items-center gap-1.5 whitespace-nowrap backdrop-blur-md border z-20",
        isCommercial
          ? "bg-amber-500/20 border-amber-400/30 text-amber-300 shadow-lg shadow-amber-500/10"
          : isBestDeal
            ? cn(theme.accentBg, theme.accentBorder, theme.accent, "shadow-lg")
            : "bg-white/[0.08] border-white/[0.1] text-white/70"
      )}>
        {(isBestDeal || isCommercial) && <Crown className="h-3 w-3" />}
        {pkg.badge}
      </div>

      {/* Card content */}
      <div className="relative p-6 sm:p-8 pt-9 flex flex-col h-full">
        {/* Type label */}
        <div className="text-center mb-5">
          <div className={cn(
            "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest mb-3 border",
            isCommercial
              ? "bg-amber-500/10 border-amber-500/15 text-amber-400/70"
              : isBestDeal
                ? cn(theme.accentBg, theme.accentBorder, theme.accent, "opacity-70")
                : "bg-white/[0.03] border-white/[0.05] text-white/40"
          )}>
            {isCommercial ? <Building2 className="h-3 w-3" /> : <SeasonIcon className="h-3 w-3" />}
            {isCommercial ? 'Commercial' : 'Residential'}
          </div>

          <h3 className="text-xl sm:text-2xl font-black text-white mb-1 leading-tight">
            {pkg.tagline}
          </h3>
          <p className="text-sm text-white/35">{pkg.priceNote}</p>
        </div>

        {/* Price */}
        <div className="text-center mb-6">
          <div className="text-[10px] font-semibold uppercase tracking-widest text-white/25 mb-1">
            Starting at
          </div>
          {pkg.price === 'Custom' ? (
            <div className="text-4xl sm:text-5xl font-black leading-none bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 bg-clip-text text-transparent">
              Custom
            </div>
          ) : (
            <div className={cn(
              "leading-none",
              isCommercial
                ? "bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 bg-clip-text text-transparent"
                : "text-white"
            )}>
              <span className="text-5xl sm:text-6xl font-black tracking-tight">{pkg.price.replace('+', '')}</span>
              {pkg.price.includes('+') && <span className="text-3xl font-bold opacity-40">+</span>}
            </div>
          )}
          {pkg.savings && (
            <div className={cn(
              "inline-flex items-center gap-1.5 mt-3 text-xs font-bold px-3 py-1 rounded-full border",
              theme.accentBg, theme.accentBorder, theme.accent
            )}>
              <Sparkles className="h-3 w-3" />
              {pkg.savings}
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent mb-6" />

        {/* Features */}
        <ul className="space-y-3 mb-6 flex-grow">
          {pkg.features.map((feature, idx) => (
            <li key={idx} className="flex items-start gap-3 text-sm">
              <div className={cn(
                "p-0.5 rounded-full mt-0.5 flex-shrink-0",
                isCommercial ? "bg-amber-500/15" : isBestDeal ? cn(theme.accentBg) : "bg-white/[0.06]"
              )}>
                <Check className={cn(
                  "h-3.5 w-3.5",
                  isCommercial ? "text-amber-400" : isBestDeal ? theme.checkColor : "text-white/50"
                )} />
              </div>
              <span className={cn(
                "font-medium leading-snug",
                isBestDeal ? "text-white/80" : "text-white/60"
              )}>{feature}</span>
            </li>
          ))}
        </ul>

        {/* Micro proof */}
        {pkg.microProof && (
          <p className="text-[11px] text-center mb-5 text-white/25 font-medium">{pkg.microProof}</p>
        )}

        {/* CTA Buttons */}
        <div className="space-y-2.5 mt-auto">
          <Button
            size="lg"
            className={cn(
              "w-full font-bold text-sm h-12 transition-all duration-300",
              "hover:scale-[1.02] active:scale-[0.98]",
              isCommercial
                ? "bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-500 hover:from-amber-500 hover:to-amber-400 text-amber-950 shadow-lg shadow-amber-500/20 font-extrabold"
                : isBestDeal
                  ? cn("bg-gradient-to-r text-white shadow-lg", theme.ctaGradient, theme.ctaHoverGradient, theme.ctaShadow)
                  : "bg-white/[0.08] hover:bg-white/[0.12] text-white border border-white/[0.08] hover:border-white/[0.15]"
            )}
            asChild
          >
            <Link href={`/contact?service=${pkg.serviceKey}`} className="flex items-center justify-center gap-2">
              {isCommercial && <Crown className="h-4 w-4" />}
              {pkg.ctaText}
              <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </Button>

          {pkg.secondaryCtaText && (
            <Button
              size="lg"
              variant="outline"
              className="w-full font-semibold text-sm h-12 border-white/[0.06] text-white/50 hover:bg-white/[0.04] hover:text-white/70 hover:border-white/[0.12] transition-all duration-300"
              asChild
            >
              <a href="tel:608-535-6057">
                <Phone className="mr-2 h-4 w-4" />
                {pkg.secondaryCtaText}
              </a>
            </Button>
          )}
        </div>

        {/* Limited slots */}
        {pkg.limitedSlots && (
          <p className="text-[11px] text-center mt-3 font-semibold flex items-center justify-center gap-1 text-amber-400/70">
            <AlertTriangle className="h-3 w-3" />
            Limited seasonal slots remaining
          </p>
        )}
      </div>
    </div>
  );
}

/* ─── Package data ─── */

const summerPackages: PackageProps[] = [
  {
    name: "Weekly",
    badge: "FLEXIBLE",
    tagline: "Weekly Mowing",
    price: "$55+",
    priceNote: "per visit \u2022 recurring service",
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
    price: "$197+",
    priceNote: "per month \u2022 complete maintenance",
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

/* ─── Season messages ─── */

const seasonMessages: Record<string, { title: string; subtitle: string; badge: string; urgency: string }> = {
  summer: {
    title: "Summer Protection",
    subtitle: "Three strategic options to keep your property pristine all season. Consistent crews, reliable service.",
    badge: "Summer 2026 Services",
    urgency: "Weekly mowing routes filling fast"
  },
  fall: {
    title: "Fall Preparation",
    subtitle: "Three strategic options to protect your lawn before winter. Book early for best availability.",
    badge: "Fall 2026 Services",
    urgency: "Only 10 Premium Fall packages remaining"
  }
};

/* ─── Stagger animation variants ─── */

const stagger = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.15 }
  }
};

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }
  }
} as Variants;

/* ─── Main section ─── */

export function SeasonalPriorityServices() {
  const { activeSeason, isLoading } = useSeasonalTheme();

  if (activeSeason === 'winter') return null;

  if (isLoading) {
    return (
      <section className="py-20 md:py-28 bg-gradient-to-b from-green-950 via-[#0a3520] to-green-950">
        <div className="container mx-auto px-4">
          <div className="animate-pulse text-center">
            <div className="h-8 w-64 bg-white/[0.06] rounded mb-4 mx-auto" />
            <div className="h-6 w-96 bg-white/[0.04] rounded mb-8 mx-auto" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-[520px] bg-white/[0.03] rounded-2xl border border-white/[0.06]" />
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  const theme = darkThemes[activeSeason] || darkThemes.summer;
  const packages = (activeSeason === 'fall') ? fallPackages : summerPackages;
  const messages = seasonMessages[activeSeason] || seasonMessages.summer;

  return (
    <section className={cn("py-20 md:py-28 bg-gradient-to-b relative overflow-hidden", theme.sectionBg)}>

      {/* Ambient center glow */}
      <div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] rounded-full blur-3xl pointer-events-none"
        style={{ background: `radial-gradient(ellipse, ${theme.ambientGlow}, transparent)` }}
      />

      {/* Season-adaptive particles — dense for rich atmosphere */}
      <AmbientParticles density="dense" />

      <div className="container mx-auto px-4 sm:px-6 relative z-10">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 md:mb-16"
        >
          <div className={cn(
            "inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-6 border backdrop-blur-sm",
            theme.accentBg, theme.accentBorder, theme.accent
          )}>
            <Sparkles className="h-3.5 w-3.5" />
            {messages.badge}
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white mb-4 leading-tight">
            Choose Your{' '}
            <span className={cn("bg-gradient-to-r bg-clip-text text-transparent", theme.headingGradient)}>
              {messages.title}
            </span>
          </h2>

          <p className="text-white/40 text-base md:text-lg max-w-2xl mx-auto">
            {messages.subtitle}
          </p>
        </motion.div>

        {/* Urgency — premium pulsing dot */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="flex items-center justify-center mb-12 md:mb-14"
        >
          <div className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full border border-amber-400/15 bg-amber-400/[0.05] backdrop-blur-sm">
            <span className="relative flex h-2 w-2 flex-shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400" />
            </span>
            <span className="font-bold text-sm text-amber-300">{messages.urgency}</span>
            <span className="bg-amber-400/15 px-2 py-0.5 rounded text-[10px] font-black text-amber-300/80 tracking-wider hidden sm:inline border border-amber-400/10">
              HURRY
            </span>
          </div>
        </motion.div>

        {/* Cards Grid */}
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-5 items-stretch max-w-6xl mx-auto mb-16 md:mb-20"
        >
          {packages.map((pkg, idx) => (
            <motion.div key={idx} variants={fadeUp}>
              <PricingCard pkg={pkg} theme={theme} />
            </motion.div>
          ))}
        </motion.div>

        {/* Trust Strip */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="flex flex-wrap justify-center gap-3 mb-16 md:mb-20"
        >
          {[
            { icon: Shield, text: 'Fully Insured' },
            { icon: Clock, text: 'Fast Response' },
            { icon: Star, text: '4.9\u2605 Rating' },
            { icon: Users, text: '500+ Served' }
          ].map((item, idx) => (
            <div
              key={idx}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-full border bg-white/[0.03] border-white/[0.06] hover:border-white/[0.1] transition-colors"
            >
              <item.icon className={cn("h-3.5 w-3.5", theme.accent)} />
              <span className="text-white/50 font-semibold text-xs">{item.text}</span>
            </div>
          ))}
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center rounded-2xl p-8 sm:p-10 md:p-12 max-w-4xl mx-auto border bg-white/[0.02] border-white/[0.06] backdrop-blur-sm relative overflow-hidden"
        >
          {/* Inner ambient glow */}
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-24 rounded-full blur-3xl pointer-events-none"
            style={{ background: `radial-gradient(ellipse, ${theme.ambientGlow}, transparent)` }}
          />

          <div className="relative z-10">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Zap className="h-4 w-4 text-amber-400" />
              <span className="text-amber-400/70 font-bold uppercase tracking-widest text-[11px]">Fast Response Guaranteed</span>
            </div>
            <h3 className="text-2xl sm:text-3xl md:text-4xl font-black text-white mb-3">
              Questions? Let&apos;s Talk!
            </h3>
            <p className="text-white/35 mb-8 max-w-lg mx-auto text-sm sm:text-base">
              Not sure which package is right? Get a free custom quote in under 2 minutes.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                size="lg"
                className={cn(
                  "bg-gradient-to-r text-white font-bold px-8 h-12 sm:h-14 text-base shadow-lg hover:shadow-xl transition-all hover:scale-[1.02]",
                  theme.ctaGradient, theme.ctaHoverGradient, theme.ctaShadow
                )}
                asChild
              >
                <Link href="/contact">
                  Get Your Free Quote <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white/[0.08] text-white/60 hover:bg-white/[0.04] hover:text-white font-bold px-8 h-12 sm:h-14 text-base transition-all"
                asChild
              >
                <a href="tel:608-535-6057">
                  <Phone className="mr-2 h-5 w-5" />
                  (608) 535-6057
                </a>
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
