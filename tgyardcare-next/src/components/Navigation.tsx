'use client';

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu, ChevronDown, Phone, Sprout, Flower2, Calendar, Home, Snowflake,
  Scissors, SprayCan, Leaf, CircleDot, Trees, Sparkles, CloudRain,
  Shield, ArrowRight, Users, Award, Droplets, Building2,
  TreePine, CheckCircle2, Clock, FileText, type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useSeasonalTheme } from "@/contexts/SeasonalThemeContext";
import { MobileNavMenu } from "@/components/MobileNavMenu";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface MegaMenuItem {
  name: string;
  path: string;
  description: string;
  icon: LucideIcon;
}

interface MegaMenuColumn {
  heading: string;
  icon: LucideIcon;
  items: MegaMenuItem[];
}

interface SidebarBadge {
  icon: LucideIcon;
  label: string;
}

interface MegaMenuSidebar {
  icon: LucideIcon;
  heading: string;
  description: string;
  bullets: string[];
  ctaLabel: string;
  ctaHref: string;
  footnote: string;
  badges: SidebarBadge[];
}

// ---------------------------------------------------------------------------
// Residential Services Data
// ---------------------------------------------------------------------------
const residentialColumns: MegaMenuColumn[] = [
  {
    heading: "Lawn Care & Turf Programs",
    icon: Sprout,
    items: [
      { name: "Lawn Mowing", path: "/services/mowing", description: "Weekly precision cuts", icon: Scissors },
      { name: "Fertilization Programs", path: "/services/fertilization", description: "Thicker, greener lawns", icon: SprayCan },
      { name: "Weed Control", path: "/services/herbicide", description: "Targeted elimination", icon: Leaf },
      { name: "Aeration", path: "/services/aeration", description: "Stronger root systems", icon: CircleDot },
    ],
  },
  {
    heading: "Landscaping & Enhancements",
    icon: Flower2,
    items: [
      { name: "Garden Bed Installation", path: "/services/garden-beds", description: "Design & plant beautiful beds", icon: Flower2 },
      { name: "Mulching Services", path: "/services/mulching", description: "Premium bed coverage", icon: Trees },
      { name: "Shrub & Hedge Pruning", path: "/services/pruning", description: "Expert shaping & care", icon: Scissors },
      { name: "Weeding & Bed Care", path: "/services/weeding", description: "Thorough root-level removal", icon: Leaf },
    ],
  },
  {
    heading: "Seasonal & Exterior Services",
    icon: Calendar,
    items: [
      { name: "Spring Cleanup", path: "/services/spring-cleanup", description: "Fresh season start", icon: Sparkles },
      { name: "Fall Cleanup", path: "/services/fall-cleanup", description: "Complete yard prep", icon: CloudRain },
      { name: "Leaf Removal", path: "/services/leaf-removal", description: "Full yard clearing", icon: Leaf },
      { name: "Snow Removal", path: "/services/snow-removal", description: "Reliable residential plowing", icon: Snowflake },
      { name: "Gutter Cleaning & Guards", path: "/services/gutter-cleaning", description: "Debris-free flow & protection", icon: Home },
    ],
  },
];

const residentialSidebar: MegaMenuSidebar = {
  icon: TreePine,
  heading: "Residential Yard Care Solutions",
  description: "Reliable, professional lawn care for homeowners across Dane County.",
  bullets: [
    "Same crew every visit",
    "Transparent pricing",
    "Licensed & insured",
    "100% satisfaction guarantee",
  ],
  ctaLabel: "Get a Fast Quote",
  ctaHref: "/contact",
  footnote: "Seasonal & annual service plans available",
  badges: [
    { icon: Shield, label: "Licensed & Insured" },
    { icon: Users, label: "Same Crew Every Visit" },
    { icon: Award, label: "Same-Day Quotes" },
  ],
};

// ---------------------------------------------------------------------------
// Commercial Services Data
// ---------------------------------------------------------------------------
const commercialColumns: MegaMenuColumn[] = [
  {
    heading: "Lawn & Grounds Management",
    icon: Sprout,
    items: [
      { name: "Commercial Lawn Maintenance", path: "/commercial/lawn-care", description: "Weekly property-wide turf management", icon: Scissors },
      { name: "Fertilization & Turf Programs", path: "/commercial/fertilization-weed-control", description: "Custom nutrient & weed control plans", icon: SprayCan },
      { name: "Aeration & Soil Health", path: "/commercial/aeration", description: "Core aeration for high-traffic turf", icon: CircleDot },
      { name: "Weed & Vegetation Control", path: "/commercial/fertilization-weed-control", description: "Selective & broad-leaf elimination", icon: Leaf },
    ],
  },
  {
    heading: "Landscape & Enhancements",
    icon: Flower2,
    items: [
      { name: "Commercial Mulching", path: "/commercial/property-enhancement", description: "Large-scale bed coverage & refresh", icon: Trees },
      { name: "Property Enhancements", path: "/commercial/property-enhancement", description: "Curb appeal for commercial tenants", icon: Sparkles },
      { name: "Tree & Shrub Pruning", path: "/commercial/property-enhancement", description: "Expert shaping for commercial sites", icon: Scissors },
      { name: "HOA Landscape Care", path: "/commercial/property-enhancement", description: "Common area maintenance programs", icon: Home },
    ],
  },
  {
    heading: "Winter & Exterior Services",
    icon: Snowflake,
    items: [
      { name: "Commercial Snow Plowing", path: "/commercial/snow-removal", description: "Priority fleet-based lot clearing", icon: Snowflake },
      { name: "Ice Management & Deicing", path: "/commercial/snow-removal", description: "Proactive anti-icing & salt application", icon: Droplets },
      { name: "Sidewalk & Entry Clearing", path: "/commercial/snow-removal", description: "ADA-compliant walkway maintenance", icon: Shield },
      { name: "Gutter Services", path: "/commercial/gutters", description: "Commercial-grade gutter maintenance", icon: Home },
    ],
  },
];

const commercialSidebar: MegaMenuSidebar = {
  icon: Building2,
  heading: "Commercial Property Solutions",
  description: "Serving office parks, retail centers, HOAs & industrial properties across Dane County.",
  bullets: [
    "Dedicated crew assignments",
    "Licensed & fully insured",
    "24/7 winter monitoring",
    "Transparent contract pricing",
  ],
  ctaLabel: "Request a Commercial Quote",
  ctaHref: "/contact",
  footnote: "Annual & multi-year contracts available",
  badges: [
    { icon: Shield, label: "Licensed & Fully Insured" },
    { icon: Clock, label: "24/7 Winter Monitoring" },
    { icon: Users, label: "Dedicated Crew Assignments" },
    { icon: FileText, label: "Board-Ready Documentation" },
  ],
};

// ---------------------------------------------------------------------------
// About pages
// ---------------------------------------------------------------------------
const aboutPages = [
  { name: "About Us", path: "/about" },
  { name: "Meet Our Team", path: "/team" },
  { name: "Service Areas", path: "/service-areas" },
  { name: "FAQ", path: "/faq" },
  { name: "Blog", path: "/blog" },
  { name: "Careers", path: "/careers" },
];

// ---------------------------------------------------------------------------
// Seasonal Particles (shared between both mega menus)
// ---------------------------------------------------------------------------
function SeasonalParticles({ season }: { season: string }) {
  if (season === 'winter') {
    return (
      <>
        <Snowflake className="absolute top-[10%] left-[10%] w-4 h-4 text-sky-300/40 animate-drift-1" />
        <Snowflake className="absolute top-[20%] right-[15%] w-3 h-3 text-sky-200/30 animate-drift-2" />
        <Snowflake className="absolute bottom-[25%] left-[30%] w-4 h-4 text-sky-300/35 animate-drift-3" />
        <Snowflake className="absolute top-[40%] left-[55%] w-2.5 h-2.5 text-sky-200/25 animate-drift-1" style={{ animationDelay: '-3s' }} />
        <Snowflake className="absolute bottom-[35%] right-[25%] w-3 h-3 text-sky-300/30 animate-drift-2" style={{ animationDelay: '-5s' }} />
        <Snowflake className="absolute top-[15%] right-[40%] w-3.5 h-3.5 text-sky-200/35 animate-drift-3" style={{ animationDelay: '-7s' }} />
      </>
    );
  }

  if (season === 'fall') {
    return (
      <>
        <Leaf className="absolute top-[10%] left-[10%] w-4 h-4 text-orange-400/40 animate-drift-1" />
        <Leaf className="absolute top-[20%] right-[15%] w-3 h-3 text-amber-500/30 animate-drift-2" />
        <Leaf className="absolute bottom-[25%] left-[30%] w-4 h-4 text-orange-300/35 animate-drift-3" />
        <Leaf className="absolute top-[40%] left-[55%] w-2.5 h-2.5 text-amber-400/25 animate-drift-1" style={{ animationDelay: '-3s' }} />
        <Leaf className="absolute bottom-[35%] right-[25%] w-3 h-3 text-orange-500/30 animate-drift-2" style={{ animationDelay: '-5s' }} />
        <Leaf className="absolute top-[15%] right-[40%] w-3.5 h-3.5 text-amber-300/35 animate-drift-3" style={{ animationDelay: '-7s' }} />
      </>
    );
  }

  // Spring / Summer default
  return (
    <>
      <Flower2 className="absolute top-[10%] left-[10%] w-4 h-4 text-primary/40 animate-drift-1" />
      <Sparkles className="absolute top-[20%] right-[15%] w-3 h-3 text-yellow-400/30 animate-drift-2" />
      <Flower2 className="absolute bottom-[25%] left-[30%] w-4 h-4 text-primary/35 animate-drift-3" />
      <Sparkles className="absolute top-[40%] left-[55%] w-2.5 h-2.5 text-yellow-300/25 animate-drift-1" style={{ animationDelay: '-3s' }} />
      <Flower2 className="absolute bottom-[35%] right-[25%] w-3 h-3 text-primary/30 animate-drift-2" style={{ animationDelay: '-5s' }} />
      <Sparkles className="absolute top-[15%] right-[40%] w-3.5 h-3.5 text-yellow-400/35 animate-drift-3" style={{ animationDelay: '-7s' }} />
    </>
  );
}

// ---------------------------------------------------------------------------
// MegaMenu Component (reusable for Residential + Commercial)
// ---------------------------------------------------------------------------
function MegaMenu({
  columns,
  sidebar,
  season,
  isActivePath,
}: {
  columns: MegaMenuColumn[];
  sidebar: MegaMenuSidebar;
  season: string;
  isActivePath: (p: string) => boolean;
}) {
  const SidebarIcon = sidebar.icon;

  return (
    <div className="w-[920px] bg-gradient-to-br from-[#1a1a1a] via-[#222222] to-[#1a1a1a] rounded-xl shadow-2xl border border-primary/20 overflow-hidden animate-fade-in">
      {/* Gradient top bar */}
      <div className="h-1 bg-gradient-to-r from-primary via-primary/80 to-primary" />

      {/* Seasonal floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <SeasonalParticles season={season} />
      </div>

      <div className="flex relative">
        {/* ---- 3 Service Columns ---- */}
        <div className="flex-1 p-5 grid grid-cols-3 gap-6">
          {columns.map((col) => {
            const ColIcon = col.icon;
            return (
              <div key={col.heading} className="space-y-3">
                {/* Column header */}
                <div className="flex items-center gap-2 pb-2.5 border-b border-white/20">
                  <div className="p-1.5 bg-white/10 rounded-lg">
                    <ColIcon className="h-4 w-4 text-primary" />
                  </div>
                  <span className="text-sm font-bold text-white tracking-tight">{col.heading}</span>
                </div>

                {/* Service items */}
                <div className="space-y-0.5">
                  {col.items.map((item) => {
                    const ItemIcon = item.icon;
                    const active = isActivePath(item.path);

                    return (
                      <Link
                        key={item.path + item.name}
                        href={item.path}
                        className={`group flex items-start gap-2.5 py-2 px-2 -mx-2 rounded-lg transition-all duration-200 ${
                          active
                            ? 'bg-primary/20 text-primary'
                            : 'hover:bg-white/10 hover:translate-x-1'
                        }`}
                      >
                        <ItemIcon className={`h-3.5 w-3.5 mt-0.5 flex-shrink-0 transition-colors ${
                          active ? 'text-primary' : 'text-white/50 group-hover:text-primary'
                        }`} />
                        <div className="min-w-0">
                          <span className={`block text-sm leading-tight transition-colors ${
                            active ? 'text-primary font-semibold' : 'text-white font-medium group-hover:text-primary'
                          }`}>
                            {item.name}
                          </span>
                          <span className="block text-[11px] leading-tight text-white/40 mt-0.5 group-hover:text-white/60 transition-colors">
                            {item.description}
                          </span>
                        </div>
                        {active && (
                          <div className="ml-auto mt-1 w-1.5 h-1.5 bg-primary rounded-full animate-pulse flex-shrink-0" />
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* ---- Sidebar Panel ---- */}
        <div className="w-[240px] bg-white/5 border-l border-white/10 p-5 flex flex-col">
          {/* Icon + heading */}
          <div className="flex items-center gap-2 mb-3">
            <div className="p-2 bg-primary/20 rounded-lg">
              <SidebarIcon className="h-5 w-5 text-primary" />
            </div>
            <h3 className="text-sm font-bold text-white leading-tight">{sidebar.heading}</h3>
          </div>

          {/* Description */}
          <p className="text-[11px] text-white/50 leading-relaxed mb-3">
            {sidebar.description}
          </p>

          {/* Bullet list */}
          <ul className="space-y-1.5 mb-4">
            {sidebar.bullets.map((bullet) => (
              <li key={bullet} className="flex items-start gap-2 text-[11px] text-white/70">
                <CheckCircle2 className="h-3 w-3 text-primary flex-shrink-0 mt-0.5" />
                <span>{bullet}</span>
              </li>
            ))}
          </ul>

          {/* CTA button */}
          <Link
            href={sidebar.ctaHref}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground text-sm font-bold rounded-xl hover:bg-primary/90 hover:scale-105 transition-all shadow-lg hover:shadow-primary/25 mb-2"
          >
            {sidebar.ctaLabel}
            <ArrowRight className="h-4 w-4" />
          </Link>

          {/* Footnote */}
          <p className="text-[10px] text-white/30 text-center mb-4">
            {sidebar.footnote}
          </p>

          {/* Trust badges */}
          <div className="mt-auto space-y-2 pt-3 border-t border-white/10">
            {sidebar.badges.map((badge) => {
              const BadgeIcon = badge.icon;
              return (
                <div key={badge.label} className="flex items-center gap-2 group/badge">
                  <div className="p-1 bg-white/10 rounded group-hover/badge:bg-primary/20 transition-colors">
                    <BadgeIcon className="h-3 w-3 text-white/50 group-hover/badge:text-primary transition-colors" />
                  </div>
                  <span className="text-[10px] text-white/50 group-hover/badge:text-white/80 transition-colors">{badge.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Navigation Component
// ---------------------------------------------------------------------------
export default function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [residentialOpen, setResidentialOpen] = useState(false);
  const [commercialOpen, setCommercialOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const pathname = usePathname();

  const { activeSeason } = useSeasonalTheme();
  const isWinter = activeSeason === 'winter';

  const isActivePath = (path: string) => pathname === path;

  return (
    <nav className={cn(
      "sticky top-0 z-50 border-b shadow-sm nav-seasonal overflow-hidden",
      isWinter
        ? "bg-gradient-to-r from-slate-900 via-slate-800 to-blue-900 border-cyan-500/20"
        : "bg-background/95 backdrop-blur-lg border-border/50"
    )}>
      {/* Winter snow particles */}
      {isWinter && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="absolute bg-white/25 rounded-full animate-snow-fall"
              style={{
                width: `${1.5 + Math.random() * 2.5}px`,
                height: `${1.5 + Math.random() * 2.5}px`,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${-(Math.random() * 10)}s`,
                animationDuration: `${6 + Math.random() * 4}s`,
                filter: 'blur(0.5px)',
              }}
            />
          ))}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(59,130,246,0.08)_0%,transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(147,197,253,0.06)_0%,transparent_50%)]" />
        </div>
      )}
      <div className="container mx-auto px-3 sm:px-4 relative z-10">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* ---- Logo ---- */}
          <Link href="/" className="flex items-center group flex-shrink-0">
            <img
              alt="TotalGuard Yard Care - Professional Lawn Care Services in Madison Wisconsin"
              src="/images/totalguard-logo-full.png"
              className="h-12 md:h-16 lg:h-[72px] w-auto hover:scale-105 transition-transform duration-300"
              loading="eager"
              fetchPriority="high"
              decoding="async"
            />
          </Link>

          {/* ---- Desktop Navigation ---- */}
          <div className="hidden lg:flex items-center space-x-1">
            {/* Residential Services Mega Menu */}
            <div
              className="relative"
              onMouseEnter={() => setResidentialOpen(true)}
              onMouseLeave={() => setResidentialOpen(false)}
            >
              <button className="flex items-center text-foreground hover:text-primary transition-all font-semibold text-sm tracking-wide px-4 py-2 rounded-lg hover:bg-primary/5">
                Residential Services
                <ChevronDown className={`ml-1.5 h-4 w-4 transition-transform duration-200 ${residentialOpen ? 'rotate-180' : ''}`} />
              </button>

              {residentialOpen && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 z-[100]">
                  <MegaMenu
                    columns={residentialColumns}
                    sidebar={residentialSidebar}
                    season={activeSeason}
                    isActivePath={isActivePath}
                  />
                </div>
              )}
            </div>

            {/* Commercial Services Mega Menu */}
            <div
              className="relative"
              onMouseEnter={() => setCommercialOpen(true)}
              onMouseLeave={() => setCommercialOpen(false)}
            >
              <button className="flex items-center text-foreground hover:text-primary transition-all font-semibold text-sm tracking-wide px-4 py-2 rounded-lg hover:bg-primary/5">
                Commercial Services
                <ChevronDown className={`ml-1.5 h-4 w-4 transition-transform duration-200 ${commercialOpen ? 'rotate-180' : ''}`} />
              </button>

              {commercialOpen && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 z-[100]">
                  <MegaMenu
                    columns={commercialColumns}
                    sidebar={commercialSidebar}
                    season={activeSeason}
                    isActivePath={isActivePath}
                  />
                </div>
              )}
            </div>

            {/* Portfolio link (no dropdown) */}
            <Link
              href="/gallery"
              className="text-foreground hover:text-primary hover:bg-primary/5 transition-all font-semibold text-sm tracking-wide px-4 py-2 rounded-lg"
            >
              Portfolio
            </Link>

            {/* About Us Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setAboutOpen(true)}
              onMouseLeave={() => setAboutOpen(false)}
            >
              <button className="flex items-center text-foreground hover:text-primary transition-all font-semibold text-sm tracking-wide px-4 py-2 rounded-lg hover:bg-primary/5">
                About Us
                <ChevronDown className={`ml-1.5 h-4 w-4 transition-transform duration-200 ${aboutOpen ? 'rotate-180' : ''}`} />
              </button>

              {aboutOpen && (
                <div className="absolute top-full left-0 pt-2 z-[100]">
                  <div className="w-56 bg-gradient-to-br from-[#1a1a1a] via-[#222222] to-[#1a1a1a] rounded-xl shadow-2xl border border-primary/20 overflow-hidden animate-fade-in">
                    <div className="h-1 bg-gradient-to-r from-primary via-primary/80 to-primary" />
                    <div className="p-2">
                      {aboutPages.map((page) => (
                        <Link
                          key={page.path}
                          href={page.path}
                          className={`block px-3 py-2.5 text-sm rounded-lg transition-all duration-200 ${
                            isActivePath(page.path)
                              ? 'bg-primary/20 text-primary font-semibold'
                              : 'text-white/90 hover:bg-white/10 hover:translate-x-1'
                          }`}
                        >
                          {page.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ---- Desktop Right Side (Phone + CTA) ---- */}
          <div className="hidden lg:flex items-center space-x-2 xl:space-x-4">
            <a
              href="tel:608-535-6057"
              className="flex items-center gap-2 border border-border/60 rounded-full px-4 py-2 text-foreground hover:text-primary hover:border-primary/40 transition-all font-bold text-sm xl:text-base group"
            >
              <Phone className="h-4 w-4 text-primary" />
              <span>(608) 535-6057</span>
            </a>
            <Button
              variant="accent"
              size="lg"
              className="font-bold text-sm xl:text-base px-4 xl:px-8 shadow-lg hover:shadow-xl hover:scale-105 transition-all"
              asChild
            >
              <Link href="/contact">
                Get a Free Quote
                <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </div>

          {/* ---- Mobile Menu Button ---- */}
          <div className="flex items-center gap-1 sm:gap-2 lg:hidden">
            <a
              href="tel:608-535-6057"
              className="p-2.5 rounded-full bg-primary/10 hover:bg-primary/20 transition-all tap-target flex items-center justify-center"
            >
              <Phone className="h-5 w-5 text-primary" />
            </a>
            <button
              className="p-2.5 text-foreground hover:text-primary hover:bg-primary/10 transition-all rounded-lg tap-target flex items-center justify-center"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* ---- Mobile Menu ---- */}
        <MobileNavMenu isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
      </div>
    </nav>
  );
}
