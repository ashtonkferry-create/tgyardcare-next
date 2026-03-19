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
  Star,
  CheckCircle2,
  type LucideIcon,
} from "lucide-react";
import { useSeasonalTheme } from "@/contexts/SeasonalThemeContext";
import { useEffect, useState, useCallback, useRef } from "react";
import { usePathname } from "next/navigation";
import { createPortal } from "react-dom";
import { motion, AnimatePresence, useDragControls, type PanInfo } from "framer-motion";

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

// ── Static data ──────────────────────────────────────────────────────────────

const popularServices: ServiceItem[] = [
  { name: "Lawn Mowing", path: "/services/mowing", icon: Scissors, description: "Weekly precision cuts" },
  { name: "Gutter Cleaning", path: "/services/gutter-cleaning", icon: Home, description: "Debris-free flow" },
  { name: "Spring Cleanup", path: "/services/spring-cleanup", icon: Sparkles, description: "Fresh season start" },
  { name: "Snow Removal", path: "/services/snow-removal", icon: Snowflake, winterOnly: true, description: "Reliable plowing" },
];

const serviceCategories: {
  category: string;
  icon: LucideIcon;
  services: ServiceItem[];
}[] = [
  {
    category: "Lawn Care",
    icon: Sprout,
    services: [
      { name: "Lawn Mowing", path: "/services/mowing", icon: Scissors },
      { name: "Fertilization", path: "/services/fertilization", icon: SprayCan },
      { name: "Aeration", path: "/services/aeration", icon: CircleDot },
      { name: "Weed Control", path: "/services/herbicide", icon: Leaf },
    ],
  },
  {
    category: "Landscaping",
    icon: Flower2,
    services: [
      { name: "Garden Beds", path: "/services/garden-beds", icon: Flower2 },
      { name: "Mulching", path: "/services/mulching", icon: Trees },
      { name: "Pruning", path: "/services/pruning", icon: Scissors },
      { name: "Weeding", path: "/services/weeding", icon: Leaf },
    ],
  },
  {
    category: "Seasonal",
    icon: Calendar,
    services: [
      { name: "Spring Cleanup", path: "/services/spring-cleanup", icon: Sparkles },
      { name: "Fall Cleanup", path: "/services/fall-cleanup", icon: CloudRain },
      { name: "Leaf Removal", path: "/services/leaf-removal", icon: Trash2 },
      { name: "Snow Removal", path: "/services/snow-removal", icon: Snowflake, winterOnly: true },
    ],
  },
  {
    category: "Gutters",
    icon: Droplets,
    services: [
      { name: "Gutter Cleaning", path: "/services/gutter-cleaning", icon: Home },
      { name: "Gutter Guards", path: "/services/gutter-guards", icon: Shield },
    ],
  },
  {
    category: "Hardscaping",
    icon: Layers,
    services: [
      { name: "Hardscaping", path: "/services/hardscaping", icon: Layers },
    ],
  },
];

const commercialServices = [
  { name: "Lawn Maintenance", path: "/commercial/lawn-care" },
  { name: "Seasonal Cleanup", path: "/commercial/seasonal" },
  { name: "Gutter Services", path: "/commercial/gutters" },
  { name: "Property Enhancement", path: "/commercial/property-enhancement" },
  { name: "Fertilization & Weed", path: "/commercial/fertilization-weed-control" },
  { name: "Aeration", path: "/commercial/aeration" },
  { name: "Snow Removal", path: "/commercial/snow-removal", winterOnly: true },
];

const companyPages = [
  { name: "Portfolio", path: "/gallery", icon: Sparkles },
  { name: "About Us", path: "/about", icon: Users },
  { name: "Our Team", path: "/team", icon: Users },
  { name: "Service Areas", path: "/service-areas", icon: MapPin },
  { name: "FAQ", path: "/faq", icon: CheckCircle2 },
  { name: "Blog", path: "/blog", icon: Leaf },
  { name: "Careers", path: "/careers", icon: Star },
];

// ── Animation variants ───────────────────────────────────────────────────────

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

const staggerContainer = {
  visible: {
    transition: { staggerChildren: 0.03, delayChildren: 0.1 },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.2, ease: 'easeOut' as const } },
};

const sectionVariants = {
  hidden: { height: 0, opacity: 0 },
  visible: {
    height: 'auto' as const,
    opacity: 1,
    transition: {
      height: { duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] as const },
      opacity: { duration: 0.15, delay: 0.05 },
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

// ── Component ────────────────────────────────────────────────────────────────

export function MobileNavMenu({ isOpen, onClose }: MobileNavMenuProps) {
  const { activeSeason } = useSeasonalTheme();
  const pathname = usePathname();
  const isWinter = activeSeason === 'winter';
  const [mounted, setMounted] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const dragControls = useDragControls();
  const contentRef = useRef<HTMLDivElement>(null);

  const toggleSection = useCallback((section: string) => {
    setActiveSection(prev => (prev === section ? null : section));
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
      setActiveSection(null);
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  // Only the drag handle triggers close — content area scrolls normally
  const handleDragEnd = useCallback((_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (info.velocity.y > 300 || info.offset.y > 200) {
      onClose();
    }
  }, [onClose]);

  if (!mounted) return null;

  const filteredPopular = popularServices.filter(s => !s.winterOnly || isWinter);

  // Season-adaptive accent
  const accent = activeSeason === 'winter'
    ? { line: 'via-cyan-400/40', glow: 'rgba(34,211,238,0.15)', text: 'text-cyan-400' }
    : activeSeason === 'fall'
      ? { line: 'via-amber-400/40', glow: 'rgba(251,191,36,0.15)', text: 'text-amber-400' }
      : { line: 'via-emerald-400/40', glow: 'rgba(52,211,153,0.20)', text: 'text-emerald-400' };

  const menuContent = (
    <AnimatePresence>
      {isOpen && (
        <div className="lg:hidden fixed inset-0" style={{ zIndex: 9999 }}>
          {/* Backdrop */}
          <motion.div
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Bottom Sheet */}
          <motion.div
            variants={sheetVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            drag="y"
            dragControls={dragControls}
            dragListener={false}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.4 }}
            onDragEnd={handleDragEnd}
            className="absolute inset-x-0 bottom-0 top-[5%] rounded-t-3xl flex flex-col shadow-2xl overflow-hidden"
            style={{
              background: 'linear-gradient(180deg, #0a3520 0%, #052e16 15%, #052e16 100%)',
              willChange: 'transform',
            }}
          >
            {/* ── Drag Handle (only this triggers close gesture) ── */}
            <div
              className="flex justify-center pt-3 pb-1 cursor-grab active:cursor-grabbing touch-none"
              onPointerDown={(e) => dragControls.start(e)}
            >
              <div className="w-12 h-1.5 bg-white/20 rounded-full" />
            </div>

            {/* ── Header: Phone + Rating + Close ── */}
            <div className="flex-shrink-0 px-5 pb-3">
              <div className="flex items-center justify-between">
                {/* Phone + rating cluster */}
                <a href="tel:6085356057" className="flex items-center gap-3 active:opacity-70 transition-opacity">
                  <div
                    className="w-11 h-11 flex items-center justify-center rounded-xl"
                    style={{ background: 'rgba(34,197,94,0.15)', boxShadow: `0 0 20px ${accent.glow}` }}
                  >
                    <Phone className="h-5 w-5 text-emerald-400" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-base font-bold text-white tracking-tight">(608) 535-6057</span>
                    <div className="flex items-center gap-1.5">
                      <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
                      <span className="text-[10px] text-white/50 font-medium">4.9 Google &middot; Same-day response</span>
                    </div>
                  </div>
                </a>
                <button
                  onClick={onClose}
                  className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/[0.06] border border-white/[0.08] active:bg-white/15 transition-colors"
                  aria-label="Close menu"
                >
                  <X className="h-4 w-4 text-white/60" />
                </button>
              </div>
              <div className={`h-px mt-3 bg-gradient-to-r from-transparent ${accent.line} to-transparent`} />
            </div>

            {/* ── Scrollable Content ── */}
            <div
              ref={contentRef}
              className="flex-1 overflow-y-auto overscroll-contain"
              style={{ WebkitOverflowScrolling: 'touch' }}
            >
              <motion.div
                className="px-5 py-3 space-y-5"
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
              >
                {/* ── HERO CTA — Above fold ── */}
                <motion.div variants={fadeUp}>
                  <Link
                    href="/contact"
                    onClick={onClose}
                    className="block relative overflow-hidden rounded-2xl p-5 active:scale-[0.98] transition-transform"
                    style={{
                      background: 'linear-gradient(135deg, #15803d 0%, #16a34a 50%, #15803d 100%)',
                      boxShadow: '0 4px 30px rgba(34,197,94,0.3), inset 0 1px 0 rgba(255,255,255,0.1)',
                    }}
                  >
                    {/* Shimmer */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer-btn" />
                    <div className="relative flex items-center justify-between">
                      <div>
                        <p className="text-white/70 text-xs font-medium mb-0.5">Free estimate &middot; No obligation</p>
                        <p className="text-white text-lg font-bold tracking-tight">Get Your Free Quote</p>
                      </div>
                      <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                        <ArrowRight className="h-5 w-5 text-white" />
                      </div>
                    </div>
                  </Link>
                </motion.div>

                {/* ── POPULAR SERVICES — Horizontal scroll cards ── */}
                <motion.div variants={fadeUp}>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-bold text-white/40 uppercase tracking-widest">Popular Services</p>
                    <span className="flex items-center gap-1 text-[10px] text-emerald-400/70">
                      <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                      Booking now
                    </span>
                  </div>
                  <div className="flex gap-2.5 overflow-x-auto pb-1 -mx-5 px-5 scrollbar-hide">
                    {filteredPopular.map((service) => {
                      const Icon = service.icon;
                      const isActive = pathname === service.path;
                      return (
                        <Link
                          key={service.path}
                          href={service.path}
                          onClick={onClose}
                          className={`flex-shrink-0 w-[130px] p-3.5 rounded-xl border transition-all active:scale-[0.97] ${
                            isActive
                              ? 'bg-emerald-500/15 border-emerald-500/30'
                              : 'bg-white/[0.04] border-white/[0.06] active:bg-white/[0.08]'
                          }`}
                        >
                          <Icon className={`h-5 w-5 mb-2 ${isActive ? 'text-emerald-400' : 'text-white/40'}`} />
                          <p className={`text-sm font-semibold mb-0.5 ${isActive ? 'text-emerald-300' : 'text-white/90'}`}>{service.name}</p>
                          <p className="text-[10px] text-white/30">{service.description}</p>
                        </Link>
                      );
                    })}
                  </div>
                </motion.div>

                {/* ── DIVIDER ── */}
                <div className="h-px bg-white/[0.06]" />

                {/* ── ALL SERVICES — Accordion sections ── */}
                <motion.div variants={fadeUp} className="space-y-2">
                  <p className="text-xs font-bold text-white/40 uppercase tracking-widest mb-1">Residential Services</p>

                  {serviceCategories.map((cat) => {
                    const CatIcon = cat.icon;
                    const key = `res-${cat.category}`;
                    const isActive = activeSection === key;
                    const visible = cat.services.filter(s => !s.winterOnly || isWinter);

                    return (
                      <div key={cat.category}>
                        <button
                          onClick={() => toggleSection(key)}
                          className={`flex items-center justify-between w-full px-4 py-3 rounded-xl transition-all ${
                            isActive
                              ? 'bg-emerald-500/10 border border-emerald-500/20'
                              : 'bg-white/[0.03] border border-white/[0.05] active:bg-white/[0.06]'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <CatIcon className={`h-4 w-4 ${isActive ? 'text-emerald-400' : 'text-white/35'}`} />
                            <span className={`text-sm font-medium ${isActive ? 'text-white' : 'text-white/75'}`}>
                              {cat.category}
                            </span>
                          </div>
                          <motion.span
                            animate={{ rotate: isActive ? 180 : 0 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                          >
                            <ChevronDown className={`h-4 w-4 ${isActive ? 'text-emerald-400' : 'text-white/25'}`} />
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
                              <div className="mt-1 ml-4 pl-4 border-l border-emerald-500/15 space-y-0.5 py-1">
                                {visible.map((s) => {
                                  const SIcon = s.icon;
                                  const isCurrent = pathname === s.path;
                                  return (
                                    <Link
                                      key={s.path}
                                      href={s.path}
                                      onClick={onClose}
                                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all active:bg-white/[0.06] ${
                                        isCurrent
                                          ? 'text-emerald-400 font-semibold bg-emerald-500/10'
                                          : s.winterOnly ? 'text-sky-400' : 'text-white/65'
                                      }`}
                                    >
                                      <SIcon className={`h-3.5 w-3.5 ${isCurrent ? 'text-emerald-400' : 'text-white/25'}`} />
                                      <span className="flex-1">{s.name}</span>
                                      <ArrowRight className="h-3 w-3 text-white/15" />
                                    </Link>
                                  );
                                })}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </motion.div>

                {/* ── COMMERCIAL ── */}
                <motion.div variants={fadeUp}>
                  <button
                    onClick={() => toggleSection('commercial')}
                    className={`flex items-center justify-between w-full px-4 py-3 rounded-xl transition-all ${
                      activeSection === 'commercial'
                        ? 'bg-amber-500/10 border border-amber-500/20'
                        : 'bg-white/[0.03] border border-white/[0.05] active:bg-white/[0.06]'
                    }`}
                  >
                    <span className={`text-sm font-medium ${activeSection === 'commercial' ? 'text-white' : 'text-white/75'}`}>
                      Commercial Services
                    </span>
                    <motion.span
                      animate={{ rotate: activeSection === 'commercial' ? 180 : 0 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    >
                      <ChevronDown className={`h-4 w-4 ${activeSection === 'commercial' ? 'text-amber-400' : 'text-white/25'}`} />
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
                        <div className="mt-1 ml-4 pl-4 border-l border-amber-500/15 space-y-0.5 py-1">
                          {commercialServices.filter(s => !s.winterOnly || isWinter).map((s) => (
                            <Link
                              key={s.path}
                              href={s.path}
                              onClick={onClose}
                              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all active:bg-white/[0.06] ${
                                pathname === s.path
                                  ? 'text-amber-400 font-semibold bg-amber-500/10'
                                  : 'text-white/65'
                              }`}
                            >
                              <span className="flex-1">{s.name}</span>
                              <ArrowRight className="h-3 w-3 text-white/15" />
                            </Link>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>

                {/* ── DIVIDER ── */}
                <div className="h-px bg-white/[0.06]" />

                {/* ── COMPANY PAGES — Clean grid ── */}
                <motion.div variants={fadeUp}>
                  <p className="text-xs font-bold text-white/40 uppercase tracking-widest mb-3">Company</p>
                  <div className="grid grid-cols-2 gap-2">
                    {companyPages.map((page) => {
                      const PageIcon = page.icon;
                      const isCurrent = pathname === page.path;
                      return (
                        <Link
                          key={page.path}
                          href={page.path}
                          onClick={onClose}
                          className={`flex items-center gap-2.5 px-3.5 py-3 rounded-xl text-sm transition-all active:scale-[0.97] ${
                            isCurrent
                              ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-semibold'
                              : 'bg-white/[0.03] border border-white/[0.05] text-white/65 active:bg-white/[0.06]'
                          }`}
                        >
                          <PageIcon className={`h-4 w-4 ${isCurrent ? 'text-emerald-400' : 'text-white/25'}`} />
                          <span>{page.name}</span>
                        </Link>
                      );
                    })}
                  </div>
                </motion.div>

                {/* ── TRUST STRIP ── */}
                <motion.div variants={fadeUp}>
                  <div className="flex items-center justify-between px-2 py-3.5 rounded-xl bg-white/[0.03] border border-white/[0.05]">
                    {[
                      { icon: Shield, label: "Licensed & Insured" },
                      { icon: MapPin, label: "Dane County" },
                      { icon: Clock, label: "Same-Day" },
                      { icon: Users, label: "500+ Served" },
                    ].map((b) => {
                      const BIcon = b.icon;
                      return (
                        <div key={b.label} className="flex flex-col items-center gap-1 flex-1">
                          <BIcon className="h-4 w-4 text-emerald-400/60" />
                          <span className="text-[9px] text-white/40 font-medium text-center leading-tight">{b.label}</span>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>

                {/* Bottom spacer for sticky CTA */}
                <div className="h-28" />
              </motion.div>
            </div>

            {/* ── STICKY BOTTOM CTA ── */}
            <div
              className="flex-shrink-0 absolute bottom-0 left-0 right-0 p-4 pt-8"
              style={{
                background: 'linear-gradient(to top, #052e16 60%, transparent)',
              }}
            >
              <a
                href="tel:6085356057"
                className="flex items-center justify-center gap-2 w-full py-4 rounded-xl font-bold text-sm text-white transition-all active:scale-[0.98]"
                style={{
                  background: 'linear-gradient(135deg, #15803d, #16a34a, #15803d)',
                  backgroundSize: '200% auto',
                  boxShadow: '0 4px 24px rgba(34,197,94,0.3)',
                }}
              >
                <Phone className="h-4 w-4" />
                Call (608) 535-6057
              </a>
              <p className="text-center text-[10px] text-white/30 mt-2">
                Mon-Sat 7am-7pm &middot; Free estimates &middot; No obligation
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  return createPortal(menuContent, document.body);
}
