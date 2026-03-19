'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { usePromoSettings } from '@/hooks/usePromoSettings';
import { useSeasonalTheme } from '@/contexts/SeasonalThemeContext';
import { useExitIntent } from '@/hooks/useExitIntent';
import QuickQuoteDialog from '@/components/QuickQuoteDialog';

/* ─── Seasonal theme tokens (mirrors PromoBanner + QuickQuoteDialog pattern) ─── */
// Fix 4: Removed unreachable `spring` entry — SeasonalThemeContext.Season is 'summer' | 'fall' | 'winter'
const themes = {
  summer: {
    cardBg: 'from-[#0a1f12] via-[#081a10] to-[#060e08]',
    borderColor: '#4ade80',
    glowA: 'rgba(74,222,128,0.10)',
    glowB: 'rgba(74,222,128,0.22)',
    badgeCls: 'bg-green-500/15 border border-green-400/25',
    badgeText: 'text-green-300',
    accentText: 'text-green-400',
    timerCls: 'bg-black/30 border border-green-400/20',
    timerText: 'text-green-300',
    proofText: 'text-green-400/55',
    ctaFrom: '#15803d',
    ctaMid: '#16a34a',
    ctaShadow: '0 4px 24px rgba(74,222,128,0.35)',
    ctaShadowHover: '0 6px 32px rgba(74,222,128,0.52)',
    secondaryText: 'text-white/35 hover:text-green-300',
    divider: 'bg-green-400/10',
    shimmer: 'via-green-400/12',
  },
  fall: {
    cardBg: 'from-stone-950 via-[#1a0e05] to-stone-950',
    borderColor: '#fbbf24',
    glowA: 'rgba(251,191,36,0.10)',
    glowB: 'rgba(251,191,36,0.22)',
    badgeCls: 'bg-amber-500/15 border border-amber-400/25',
    badgeText: 'text-amber-300',
    accentText: 'text-amber-400',
    timerCls: 'bg-black/30 border border-amber-400/20',
    timerText: 'text-amber-300',
    proofText: 'text-amber-400/55',
    ctaFrom: '#d97706',
    ctaMid: '#f59e0b',
    ctaShadow: '0 4px 24px rgba(251,191,36,0.35)',
    ctaShadowHover: '0 6px 32px rgba(251,191,36,0.52)',
    secondaryText: 'text-white/35 hover:text-amber-300',
    divider: 'bg-amber-400/10',
    shimmer: 'via-amber-400/12',
  },
  winter: {
    cardBg: 'from-slate-950 via-blue-950 to-indigo-950',
    borderColor: '#38bdf8',
    glowA: 'rgba(56,189,248,0.10)',
    glowB: 'rgba(56,189,248,0.22)',
    badgeCls: 'bg-cyan-500/15 border border-cyan-400/25',
    badgeText: 'text-cyan-300',
    accentText: 'text-cyan-400',
    timerCls: 'bg-black/30 border border-cyan-400/20',
    timerText: 'text-cyan-300',
    proofText: 'text-cyan-400/55',
    ctaFrom: '#0891b2',
    ctaMid: '#0ea5e9',
    ctaShadow: '0 4px 24px rgba(56,189,248,0.35)',
    ctaShadowHover: '0 6px 32px rgba(56,189,248,0.52)',
    secondaryText: 'text-white/35 hover:text-cyan-300',
    divider: 'bg-cyan-400/10',
    shimmer: 'via-cyan-400/12',
  },
} as const;

/* ─── Service → emoji map ─── */
const SERVICE_EMOJIS: [string, string][] = [
  ['spring cleanup', '🌱'],
  ['fall cleanup', '🍂'],
  ['snow', '❄️'],
  ['fertiliz', '🌾'],
  ['gutter guard', '🔧'],
  ['gutter', '🏠'],
  ['hardscap', '🪨'],
  ['mow', '🌿'],
  ['lawn', '🌿'],
];

function getEmoji(service: string): string {
  const lower = service.toLowerCase();
  return SERVICE_EMOJIS.find(([k]) => lower.includes(k))?.[1] ?? '🌿';
}

function fmt(n: number) {
  return n.toString().padStart(2, '0');
}

export function ExitIntentModal() {
  const { triggered, dismiss } = useExitIntent();
  // Fix 3: Removed getTimeUntilNextPromo from destructure — calculated inline below
  const { promotions, isLoading, getPromoIndex } = usePromoSettings();
  const { activeSeason } = useSeasonalTheme();
  const [quoteOpen, setQuoteOpen] = useState(false);
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const [isMobile, setIsMobile] = useState(false);
  // Fix 7: useState hover instead of direct DOM mutation
  const [ctaHovered, setCtaHovered] = useState(false);
  const router = useRouter();

  // Fix 2: Refs for focus management
  const dismissBtnRef = useRef<HTMLButtonElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  // Mobile detection (runs after hydration only)
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)');
    const check = () => setIsMobile(mq.matches);
    check();
    mq.addEventListener('change', check);
    return () => mq.removeEventListener('change', check);
  }, []);

  const currentPromo = promotions.length > 0
    ? (promotions[getPromoIndex()] ?? promotions[0])
    : null;

  // Fix 4: Safe cast — activeSeason is always 'summer' | 'fall' | 'winter' (SeasonalThemeContext guarantees this)
  const t = (themes as unknown as Record<string, typeof themes.summer>)[activeSeason] ?? themes.summer;

  // Fix 3: Inline calculation — no unstable function in deps array
  // Live countdown — only ticks while modal is open
  useEffect(() => {
    if (!triggered || !currentPromo) return;
    const durationMs = (currentPromo.duration_hours ?? 24) * 3_600_000;
    const startDate = new Date('2025-01-01T00:00:00').getTime();
    const update = () => {
      const elapsed = Date.now() - startDate;
      const remaining = durationMs - (elapsed % durationMs);
      setTimeLeft({
        hours: Math.floor(remaining / 3_600_000),
        minutes: Math.floor((remaining % 3_600_000) / 60_000),
        seconds: Math.floor((remaining % 60_000) / 1_000),
      });
    };
    update();
    const id = setInterval(update, 1_000);
    return () => clearInterval(id);
  }, [triggered, currentPromo]);

  // Fix 1: Escape key dismiss
  useEffect(() => {
    if (!triggered) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') dismiss();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [triggered, dismiss]);

  // Fix 2: Focus management — save previous focus, move into dialog on open, restore on close
  useEffect(() => {
    if (triggered) {
      previousFocusRef.current = document.activeElement as HTMLElement;
      // Small delay to let AnimatePresence mount the dialog
      const t = setTimeout(() => dismissBtnRef.current?.focus(), 50);
      return () => clearTimeout(t);
    } else {
      previousFocusRef.current?.focus();
    }
  }, [triggered]);

  const handleOpenQuote = useCallback(() => setQuoteOpen(true), []);

  const handleQuoteChange = useCallback((open: boolean) => {
    setQuoteOpen(open);
    if (!open) dismiss();
  }, [dismiss]);

  const handleExplore = useCallback(() => {
    if (currentPromo?.path) {
      dismiss();
      router.push(currentPromo.path);
    }
  }, [currentPromo, dismiss, router]);

  if (isLoading || !currentPromo) return null;

  const show = triggered && !quoteOpen;
  const emoji = getEmoji(currentPromo.service);

  const cardVariants = isMobile
    ? { hidden: { y: '100%' }, visible: { y: 0 }, exit: { y: '100%' } }
    : { hidden: { scale: 0.94, opacity: 0 }, visible: { scale: 1, opacity: 1 }, exit: { scale: 0.94, opacity: 0 } };

  return (
    <>
      {/* Fix 6: Direct children of AnimatePresence instead of wrapping fragment */}
      <AnimatePresence>
        {show && (
          <motion.div
            key="eim-backdrop"
            className="fixed inset-0 bg-black/55 backdrop-blur-sm z-[9998]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={dismiss}
            aria-hidden
          />
        )}
        {show && (
          <motion.div
            key="eim-card"
            role="dialog"
            aria-modal="true"
            aria-label={`Special offer: ${currentPromo.discount} off ${currentPromo.service}`}
            className={[
              'fixed z-[9999] overflow-hidden',
              `bg-gradient-to-br ${t.cardBg}`,
              'backdrop-blur-xl',
              isMobile
                ? 'bottom-0 left-0 right-0 rounded-t-[24px]'
                : 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[480px] rounded-2xl',
            ].join(' ')}
            style={{ border: `1px solid ${t.borderColor}38` }}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ type: 'spring', damping: 26, stiffness: 200 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Animated glow border */}
            <motion.div
              className="absolute inset-0 rounded-[inherit] pointer-events-none"
              animate={{
                boxShadow: [
                  `inset 0 0 0 1px ${t.borderColor}22, 0 0 28px ${t.glowA}`,
                  `inset 0 0 0 1px ${t.borderColor}55, 0 0 55px ${t.glowB}`,
                  `inset 0 0 0 1px ${t.borderColor}22, 0 0 28px ${t.glowA}`,
                ],
              }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            />

            {/* Shimmer line at top */}
            <div className={`absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent ${t.shimmer} to-transparent`} />

            {/* Mobile drag handle */}
            {isMobile && (
              <div className="flex justify-center pt-3 pb-0">
                <div className="w-10 h-1 rounded-full bg-white/20" />
              </div>
            )}

            {/* Fix 2: ref added to dismiss button */}
            {/* Dismiss × */}
            <button
              ref={dismissBtnRef}
              onClick={dismiss}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-white/10 transition-colors duration-200 group z-10"
              aria-label="Close offer"
            >
              <X className="h-4 w-4 text-white/30 group-hover:text-white/65 transition-colors" />
            </button>

            {/* ── Body ── */}
            <div className={`px-6 ${isMobile ? 'pt-3 pb-8' : 'pt-7 pb-6'}`}>

              {/* Service label */}
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className={`flex items-center gap-1.5 text-sm font-medium ${t.accentText} mb-1`}
              >
                <span className="text-base">{emoji}</span>
                <span>{currentPromo.service}</span>
              </motion.div>

              {/* Soft headline */}
              <motion.p
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.10 }}
                className="text-white/35 text-sm mb-5"
              >
                Before you go...
              </motion.p>

              {/* Discount badge — the hero */}
              <motion.div
                initial={{ opacity: 0, scale: 0.88 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.14, type: 'spring', stiffness: 220 }}
              >
                <motion.div
                  className={`${t.badgeCls} rounded-xl px-5 py-4 mb-4`}
                  animate={{ scale: [1, 1.025, 1] }}
                  transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut', repeatDelay: 0.8 }}
                >
                  <div className={`text-[2.25rem] font-black leading-none tracking-tight ${t.badgeText}`}>
                    {currentPromo.discount} OFF
                  </div>
                  <div className="text-white/45 text-sm mt-1">
                    your {currentPromo.service} service
                  </div>
                </motion.div>
              </motion.div>

              {/* Social proof */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.20 }}
                className={`text-xs ${t.proofText} mb-3`}
              >
                ★ 47+ Madison area homeowners booked this month
              </motion.p>

              {/* Countdown */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.25 }}
                className={`${t.timerCls} rounded-lg px-4 py-2.5 flex items-center gap-3 mb-5`}
              >
                <span className="text-white/35 text-xs uppercase tracking-wider">Offer expires in</span>
                <span className={`font-mono font-bold text-sm ${t.timerText}`}>
                  {fmt(timeLeft.hours)}:{fmt(timeLeft.minutes)}:{fmt(timeLeft.seconds)}
                </span>
              </motion.div>

              {/* Divider */}
              <div className={`h-px ${t.divider} mb-5`} />

              {/* Fix 7: Primary CTA — useState hover instead of direct DOM mutation */}
              <motion.button
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.30 }}
                onClick={handleOpenQuote}
                className="relative w-full py-3.5 rounded-xl font-bold text-sm text-white overflow-hidden transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                style={{
                  background: `linear-gradient(to right, ${t.ctaFrom}, ${t.ctaMid}, ${t.ctaFrom})`,
                  backgroundSize: '200% auto',
                  boxShadow: ctaHovered ? t.ctaShadowHover : t.ctaShadow,
                }}
                onMouseEnter={() => setCtaHovered(true)}
                onMouseLeave={() => setCtaHovered(false)}
              >
                {/* shimmer sweep — reuses existing keyframe from globals.css */}
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent animate-shimmer-btn" />
                <span className="relative">
                  Claim {currentPromo.discount} Off — Get a Quote
                </span>
              </motion.button>

              {/* Fix 5: Secondary CTA — only render when a path exists */}
              {currentPromo.path && (
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.36 }}
                  onClick={handleExplore}
                  className={`w-full mt-3 py-2 text-sm transition-colors duration-200 flex items-center justify-center gap-1 ${t.secondaryText}`}
                >
                  Explore {currentPromo.service}
                  <ChevronRight className="h-3.5 w-3.5" />
                </motion.button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quote dialog — pre-populated with promo service + discount */}
      {currentPromo && (
        <QuickQuoteDialog
          open={quoteOpen}
          onOpenChange={handleQuoteChange}
          promoService={currentPromo.service}
          promoDiscount={currentPromo.discount}
        />
      )}
    </>
  );
}
