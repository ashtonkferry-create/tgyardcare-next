'use client';

import Link from "next/link";
import {
  Phone,
  Snowflake,
  Scissors,
  Home,
  ArrowRight,
  Shield,
  Users,
  Clock,
  MapPin,
  Leaf,
  Sparkles,
  X,
  Sprout,
  Flower2,
  Trees,
  SprayCan,
  CircleDot,
  Trash2,
  CloudRain,
  Droplets,
  Calendar,
  ChevronDown,
  Layers,
  type LucideIcon,
  GripHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSeasonalTheme } from "@/contexts/SeasonalThemeContext";
import { useEffect, useState, useCallback } from "react";
import { usePathname } from "next/navigation";
import { createPortal } from "react-dom";
import { motion, AnimatePresence, type PanInfo } from "framer-motion";

interface MobileNavMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ServiceItem {
  name: string;
  path: string;
  icon: LucideIcon;
  description?: string;
  winterOnly?: boolean;
}

// Static data - defined outside component to prevent recreation
const serviceCategories: {
  category: string;
  icon: LucideIcon;
  services: ServiceItem[];
}[] = [
  {
    category: "Lawn Care",
    icon: Sprout,
    services: [
      { name: "Lawn Mowing", path: "/services/mowing", icon: Scissors, description: "Weekly precision cuts" },
      { name: "Fertilization", path: "/services/fertilization", icon: SprayCan, description: "Thicker, greener lawns" },
      { name: "Aeration", path: "/services/aeration", icon: CircleDot, description: "Stronger root systems" },
      { name: "Weed Control", path: "/services/herbicide", icon: Leaf, description: "Targeted elimination" },
    ]
  },
  {
    category: "Landscaping",
    icon: Flower2,
    services: [
      { name: "Garden Beds", path: "/services/garden-beds", icon: Flower2, description: "Design & plant beds" },
      { name: "Mulching", path: "/services/mulching", icon: Trees, description: "Premium bed coverage" },
      { name: "Pruning", path: "/services/pruning", icon: Scissors, description: "Expert shaping" },
      { name: "Weeding", path: "/services/weeding", icon: Leaf, description: "Root-level removal" },
    ]
  },
  {
    category: "Seasonal",
    icon: Calendar,
    services: [
      { name: "Spring Cleanup", path: "/services/spring-cleanup", icon: Sparkles, description: "Fresh season start" },
      { name: "Fall Cleanup", path: "/services/fall-cleanup", icon: CloudRain, description: "Complete yard prep" },
      { name: "Leaf Removal", path: "/services/leaf-removal", icon: Trash2, description: "Full yard clearing" },
      { name: "Snow Removal", path: "/services/snow-removal", icon: Snowflake, winterOnly: true, description: "Reliable plowing" },
    ]
  },
  {
    category: "Gutters",
    icon: Droplets,
    services: [
      { name: "Gutter Cleaning", path: "/services/gutter-cleaning", icon: Home, description: "Debris-free flow" },
      { name: "Gutter Guards", path: "/services/gutter-guards", icon: Shield, description: "Micro-mesh guards" },
    ]
  },
  {
    category: "Hardscaping",
    icon: Layers,
    services: [
      { name: "Hardscaping Services", path: "/services/hardscaping", icon: Layers, description: "Patios & walkways" },
    ]
  }
];

const commercialServices = [
  { name: "Lawn Maintenance", path: "/commercial/lawn-care" },
  { name: "Seasonal Cleanup", path: "/commercial/seasonal" },
  { name: "Gutter Services", path: "/commercial/gutters" },
  { name: "Property Enhancement", path: "/commercial/property-enhancement" },
  { name: "Fertilization & Weed Control", path: "/commercial/fertilization-weed-control" },
  { name: "Aeration", path: "/commercial/aeration" },
  { name: "Snow Removal", path: "/commercial/snow-removal", winterOnly: true },
];

const aboutPages = [
  { name: "Portfolio", path: "/gallery" },
  { name: "About", path: "/about" },
  { name: "Meet Our Team", path: "/team" },
  { name: "Service Areas", path: "/service-areas" },
  { name: "FAQ", path: "/faq" },
  { name: "Blog", path: "/blog" },
  { name: "Careers", path: "/careers" },
];

const trustBadges = [
  { icon: Shield, label: "Insured" },
  { icon: MapPin, label: "Local" },
  { icon: Clock, label: "24/7" },
  { icon: Users, label: "500+" },
];

const quickActions: ServiceItem[] = [
  { name: "Lawn Mowing", path: "/services/mowing", icon: Scissors, description: "Weekly precision cuts" },
  { name: "Snow Removal", path: "/services/snow-removal", icon: Snowflake, winterOnly: true, description: "Reliable plowing" },
  { name: "Gutter Cleaning", path: "/services/gutter-cleaning", icon: Home, description: "Debris-free flow" },
  { name: "Spring Cleanup", path: "/services/spring-cleanup", icon: Sparkles, description: "Fresh season start" },
];

// Animation variants
const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.15 } },
};

const sheetVariants = {
  hidden: { y: '100%' },
  visible: {
    y: '0%',
    transition: { type: 'spring' as const, stiffness: 350, damping: 35 },
  },
  exit: {
    y: '100%',
    transition: { duration: 0.2, ease: [0.55, 0.06, 0.68, 0.19] as const },
  },
};

const sectionVariants = {
  hidden: { height: 0, opacity: 0 },
  visible: {
    height: 'auto' as const,
    opacity: 1,
    transition: {
      height: { duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] as const },
      opacity: { duration: 0.15, delay: 0.05 },
      staggerChildren: 0.02,
    },
  },
  exit: {
    height: 0,
    opacity: 0,
    transition: {
      height: { duration: 0.15, ease: [0.55, 0.06, 0.68, 0.19] as const },
      opacity: { duration: 0.08 },
    },
  },
};

const itemFadeVariants = {
  hidden: { opacity: 0, x: -6 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.12, ease: 'easeOut' as const } },
  exit: { opacity: 0, x: -6 },
};

export function MobileNavMenu({ isOpen, onClose }: MobileNavMenuProps) {
  const { activeSeason } = useSeasonalTheme();
  const pathname = usePathname();
  const isWinter = activeSeason === 'winter';
  const [mounted, setMounted] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);

  // Auto-collapse siblings — one section open at a time
  const toggleSection = useCallback((section: string) => {
    setActiveSection(prev => prev === section ? null : section);
  }, []);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      setActiveSection(null); // Reset on close
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  // Drag to close handler
  const handleDragEnd = useCallback((_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    // Close if dragged down fast or far enough
    if (info.velocity.y > 300 || info.offset.y > 200) {
      onClose();
    }
  }, [onClose]);

  if (!mounted) return null;

  const filteredQuickActions = quickActions.filter(s => !s.winterOnly || isWinter);

  // Seasonal accent line color
  const accentLine = activeSeason === 'winter' ? 'via-cyan-400/40' :
    activeSeason === 'fall' ? 'via-amber-400/40' : 'via-green-400/40';

  const menuContent = (
    <AnimatePresence>
      {isOpen && (
        <div className="lg:hidden fixed inset-0" style={{ zIndex: 9999 }}>
          {/* Backdrop with frosted blur */}
          <motion.div
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="absolute inset-0 bg-black/75"
            onClick={onClose}
          />

          {/* Bottom Sheet Panel */}
          <motion.div
            variants={sheetVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.4 }}
            onDragEnd={handleDragEnd}
            className="absolute inset-x-0 bottom-0 top-[5%] bg-[#0a1628] rounded-t-3xl flex flex-col shadow-2xl"
            style={{ willChange: 'transform', touchAction: 'none' }}
          >
            {/* Drag Handle */}
            <div className="flex justify-center pt-3 pb-1 cursor-grab active:cursor-grabbing">
              <div className="w-10 h-1 bg-white/20 rounded-full" />
            </div>

            {/* Header */}
            <div className="flex-shrink-0 px-4 pb-3 border-b border-white/10">
              <div className="flex items-center justify-between">
                <a href="tel:608-535-6057" className="flex items-center gap-2">
                  <div className="w-10 h-10 flex items-center justify-center rounded-full bg-primary/20">
                    <Phone className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-base font-bold text-white tracking-tight">(608) 535-6057</span>
                    <span className="text-[10px] text-primary font-medium">Tap to call now</span>
                  </div>
                </a>
                <button
                  onClick={onClose}
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 active:bg-white/20 transition-colors"
                  aria-label="Close menu"
                >
                  <X className="h-5 w-5 text-white" />
                </button>
              </div>
              {/* Seasonal accent line */}
              <div className={`h-px mt-3 bg-gradient-to-r from-transparent ${accentLine} to-transparent`} />
            </div>

            {/* Scrollable Content */}
            <div
              className="flex-1 overflow-y-auto overscroll-contain"
              style={{ WebkitOverflowScrolling: 'touch' }}
            >
              <div className="px-4 py-4 space-y-4">

                {/* QUICK ACTIONS — 2x2 glassmorphism cards */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="h-4 w-4 text-primary" />
                    <p className="text-xs font-bold text-white uppercase tracking-wide">Quick Actions</p>
                    <span className="text-[10px] text-white/30">Most requested</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2.5">
                    {filteredQuickActions.map((service) => {
                      const ServiceIcon = service.icon;
                      const isSnow = service.winterOnly;
                      const isSeasonal = service.path.includes('spring-cleanup') || service.path.includes('fall-cleanup');
                      return (
                        <Link
                          key={service.path}
                          href={service.path}
                          onClick={onClose}
                          className={`relative flex flex-col gap-1.5 p-3.5 rounded-xl text-sm font-semibold border transition-all active:scale-[0.97] ${
                            isSnow
                              ? 'bg-sky-600/10 text-sky-300 border-sky-400/20'
                              : 'bg-white/[0.06] text-white border-white/[0.08]'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <ServiceIcon className={`h-5 w-5 ${isSnow ? 'text-sky-400' : 'text-primary'}`} />
                            {isSeasonal && (
                              <span className="flex items-center gap-1 text-[8px] font-bold text-emerald-300/80">
                                <span className="w-1 h-1 bg-emerald-400 rounded-full animate-pulse" />
                                Booking Now
                              </span>
                            )}
                          </div>
                          <span className="text-sm font-semibold">{service.name}</span>
                          {service.description && (
                            <span className="text-[10px] text-white/35 font-normal -mt-0.5">{service.description}</span>
                          )}
                        </Link>
                      );
                    })}
                  </div>
                </div>

                {/* DIVIDER */}
                <div className="h-px bg-white/[0.06]" />

                {/* RESIDENTIAL SECTIONS */}
                <div className="space-y-1.5">
                  <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest px-1">Residential</p>

                  {serviceCategories.map((category) => {
                    const CategoryIcon = category.icon;
                    const isActive = activeSection === `res-${category.category}`;
                    const visibleServices = category.services.filter(s => !s.winterOnly || isWinter);

                    return (
                      <div key={category.category}>
                        <button
                          onClick={() => toggleSection(`res-${category.category}`)}
                          className={`flex items-center justify-between w-full p-3 rounded-xl transition-all ${
                            isActive
                              ? 'bg-primary/10 border border-primary/20'
                              : 'bg-white/[0.04] border border-white/[0.06] active:bg-white/[0.08]'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <CategoryIcon className={`h-4 w-4 ${isActive ? 'text-primary' : 'text-white/50'}`} />
                            <span className={`text-sm font-medium ${isActive ? 'text-white' : 'text-white/80'}`}>{category.category}</span>
                            <span className="text-[10px] text-white/30">({visibleServices.length})</span>
                          </div>
                          <motion.span
                            animate={{ rotate: isActive ? 180 : 0 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                          >
                            <ChevronDown className={`h-4 w-4 ${isActive ? 'text-primary' : 'text-white/40'}`} />
                          </motion.span>
                        </button>

                        <AnimatePresence>
                          {isActive && (
                            <motion.div
                              variants={sectionVariants}
                              initial="hidden"
                              animate="visible"
                              exit="exit"
                              className="overflow-hidden"
                            >
                              <div className="mt-1 ml-3 pl-3 border-l-2 border-primary/20 space-y-0.5 py-1">
                                {visibleServices.map((service) => {
                                  const ServiceIcon = service.icon;
                                  return (
                                    <motion.div key={service.path} variants={itemFadeVariants}>
                                      <Link
                                        href={service.path}
                                        onClick={onClose}
                                        className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm transition-all active:bg-white/[0.06] ${
                                          pathname === service.path
                                            ? 'text-primary font-bold bg-primary/10'
                                            : service.winterOnly ? 'text-sky-400' : 'text-white/70'
                                        }`}
                                      >
                                        <ServiceIcon className={`h-3.5 w-3.5 ${
                                          pathname === service.path ? 'text-primary' : 'text-white/30'
                                        }`} />
                                        <span className="flex-1">{service.name}</span>
                                        <ArrowRight className="h-3 w-3 text-white/20" />
                                      </Link>
                                    </motion.div>
                                  );
                                })}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>

                {/* COMMERCIAL */}
                <div>
                  <button
                    onClick={() => toggleSection('commercial')}
                    className={`flex items-center justify-between w-full p-3 rounded-xl transition-all ${
                      activeSection === 'commercial'
                        ? 'bg-amber-500/10 border border-amber-500/20'
                        : 'bg-white/[0.04] border border-white/[0.06] active:bg-white/[0.08]'
                    }`}
                  >
                    <span className={`text-sm font-medium ${activeSection === 'commercial' ? 'text-white' : 'text-white/80'}`}>
                      Commercial Services
                    </span>
                    <motion.span
                      animate={{ rotate: activeSection === 'commercial' ? 180 : 0 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    >
                      <ChevronDown className={`h-4 w-4 ${activeSection === 'commercial' ? 'text-amber-400' : 'text-white/40'}`} />
                    </motion.span>
                  </button>

                  <AnimatePresence>
                    {activeSection === 'commercial' && (
                      <motion.div
                        variants={sectionVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className="overflow-hidden"
                      >
                        <div className="mt-1 ml-3 pl-3 border-l-2 border-amber-500/20 space-y-0.5 py-1">
                          {commercialServices.filter(s => !s.winterOnly || isWinter).map((service) => (
                            <motion.div key={service.path} variants={itemFadeVariants}>
                              <Link
                                href={service.path}
                                onClick={onClose}
                                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm transition-all active:bg-white/[0.06] ${
                                  pathname === service.path
                                    ? 'text-amber-400 font-bold bg-amber-500/10'
                                    : service.winterOnly ? 'text-sky-400' : 'text-white/70'
                                }`}
                              >
                                <span className="flex-1">{service.name}</span>
                                <ArrowRight className="h-3 w-3 text-white/20" />
                              </Link>
                            </motion.div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* COMPANY */}
                <div>
                  <button
                    onClick={() => toggleSection('company')}
                    className={`flex items-center justify-between w-full p-3 rounded-xl transition-all ${
                      activeSection === 'company'
                        ? 'bg-primary/10 border border-primary/20'
                        : 'bg-white/[0.04] border border-white/[0.06] active:bg-white/[0.08]'
                    }`}
                  >
                    <span className={`text-sm font-medium ${activeSection === 'company' ? 'text-white' : 'text-white/80'}`}>
                      Company
                    </span>
                    <motion.span
                      animate={{ rotate: activeSection === 'company' ? 180 : 0 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    >
                      <ChevronDown className={`h-4 w-4 ${activeSection === 'company' ? 'text-primary' : 'text-white/40'}`} />
                    </motion.span>
                  </button>

                  <AnimatePresence>
                    {activeSection === 'company' && (
                      <motion.div
                        variants={sectionVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className="overflow-hidden"
                      >
                        <div className="mt-1 ml-3 pl-3 border-l-2 border-primary/20 space-y-0.5 py-1">
                          {aboutPages.map((page) => (
                            <motion.div key={page.path} variants={itemFadeVariants}>
                              <Link
                                href={page.path}
                                onClick={onClose}
                                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm transition-all active:bg-white/[0.06] ${
                                  pathname === page.path
                                    ? 'text-primary font-bold bg-primary/10'
                                    : 'text-white/70'
                                }`}
                              >
                                <span className="flex-1">{page.name}</span>
                                <ArrowRight className="h-3 w-3 text-white/20" />
                              </Link>
                            </motion.div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* TRUST BADGES */}
                <div className="flex items-center justify-between py-3 border-t border-b border-white/[0.06]">
                  {trustBadges.map((badge) => {
                    const BadgeIcon = badge.icon;
                    return (
                      <div key={badge.label} className="flex flex-col items-center gap-1">
                        <BadgeIcon className="h-4 w-4 text-primary" />
                        <span className="text-[10px] font-medium text-white/50">{badge.label}</span>
                      </div>
                    );
                  })}
                </div>

                {/* BOTTOM SPACER for fixed footer */}
                <div className="h-32" />
              </div>
            </div>

            {/* PERSISTENT BOTTOM BAR — dual CTA */}
            <div className="flex-shrink-0 absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-[#0a1628] via-[#0a1628]/95 to-transparent pt-10">
              <div className="flex gap-2">
                {/* Primary CTA — Get Quote */}
                <Link href="/contact" onClick={onClose} className="flex-[3] block">
                  <Button
                    size="lg"
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-sm py-5 shadow-lg relative overflow-hidden"
                  >
                    Get My Free Quote
                    <ArrowRight className="ml-1.5 h-4 w-4" />
                  </Button>
                </Link>
                {/* Secondary CTA — Call Now */}
                <a href="tel:608-535-6057" className="flex-[2] block">
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full border-primary/30 text-primary hover:bg-primary/10 font-bold text-sm py-5"
                  >
                    <Phone className="mr-1.5 h-4 w-4" />
                    Call Now
                  </Button>
                </a>
              </div>
              <p className="text-center text-[10px] text-white/30 mt-1.5 flex items-center justify-center gap-1">
                <span>⚡</span> Average response: 12 min · No obligation
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  return createPortal(menuContent, document.body);
}
