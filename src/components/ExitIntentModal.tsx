'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, Check } from 'lucide-react';
import { usePromoSettings } from '@/hooks/usePromoSettings';
import { useSeasonalTheme } from '@/contexts/SeasonalThemeContext';
import { useExitIntent } from '@/hooks/useExitIntent';

/* ─────────────────────────────────────────────────────────────────────────────
 * Seasonal accent palette
 *
 * Card stays NEUTRAL DARK (obsidian glass). Only accent elements pick up
 * the seasonal color: discount text, glow ring, CTA button, timer.
 * Dark canvas, luminous product — jeweler's-display effect.
 * ───────────────────────────────────────────────────────────────────────────── */
const palette = {
  summer: {
    accent: '#4ade80',
    accentMuted: 'rgba(74,222,128,0.50)',
    glowSoft: 'rgba(74,222,128,0.06)',
    glowMed: 'rgba(74,222,128,0.14)',
    glowBorder: 'rgba(74,222,128,0.12)',
    gradientFrom: '#22c55e',
    gradientTo: '#86efac',
    ctaBg: 'linear-gradient(135deg, #15803d 0%, #22c55e 50%, #15803d 100%)',
    ctaShadow: '0 0 28px rgba(74,222,128,0.25)',
    ctaShadowHover: '0 0 44px rgba(74,222,128,0.45)',
  },
  fall: {
    accent: '#fbbf24',
    accentMuted: 'rgba(251,191,36,0.50)',
    glowSoft: 'rgba(251,191,36,0.06)',
    glowMed: 'rgba(251,191,36,0.14)',
    glowBorder: 'rgba(251,191,36,0.12)',
    gradientFrom: '#f59e0b',
    gradientTo: '#fde68a',
    ctaBg: 'linear-gradient(135deg, #b45309 0%, #f59e0b 50%, #b45309 100%)',
    ctaShadow: '0 0 28px rgba(251,191,36,0.25)',
    ctaShadowHover: '0 0 44px rgba(251,191,36,0.45)',
  },
  winter: {
    accent: '#38bdf8',
    accentMuted: 'rgba(56,189,248,0.50)',
    glowSoft: 'rgba(56,189,248,0.06)',
    glowMed: 'rgba(56,189,248,0.14)',
    glowBorder: 'rgba(56,189,248,0.12)',
    gradientFrom: '#0ea5e9',
    gradientTo: '#7dd3fc',
    ctaBg: 'linear-gradient(135deg, #0369a1 0%, #0ea5e9 50%, #0369a1 100%)',
    ctaShadow: '0 0 28px rgba(56,189,248,0.25)',
    ctaShadowHover: '0 0 44px rgba(56,189,248,0.45)',
  },
} as const;

/* ─── Service → emoji ─── */
const SERVICE_EMOJIS: [string, string][] = [
  ['spring cleanup', '🌱'], ['fall cleanup', '🍂'], ['snow', '❄️'],
  ['fertiliz', '🌾'], ['gutter guard', '🔧'], ['gutter', '🏠'],
  ['hardscap', '🪨'], ['mow', '🌿'], ['lawn', '🌿'],
];

function getEmoji(svc: string): string {
  const s = svc.toLowerCase();
  return SERVICE_EMOJIS.find(([k]) => s.includes(k))?.[1] ?? '🌿';
}

function pad(n: number) {
  return n.toString().padStart(2, '0');
}

/* ═══════════════════════════════════════════════════════════════════════════ */

export function ExitIntentModal() {
  const { triggered, dismiss } = useExitIntent();
  const { promotions, isLoading, getPromoIndex } = usePromoSettings();
  const { activeSeason } = useSeasonalTheme();
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const [isMobile, setIsMobile] = useState(false);
  const [ctaHovered, setCtaHovered] = useState(false);

  /* ── Inline form state ── */
  const [showForm, setShowForm] = useState(false);
  const [formState, setFormState] = useState<'idle' | 'submitting' | 'success'>('idle');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [formError, setFormError] = useState('');

  const dismissRef = useRef<HTMLButtonElement>(null);
  const prevFocusRef = useRef<HTMLElement | null>(null);

  /* ── Responsive detection ── */
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)');
    const handler = () => setIsMobile(mq.matches);
    handler();
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const promo = promotions.length > 0
    ? (promotions[getPromoIndex()] ?? promotions[0])
    : null;

  const p = palette[activeSeason] ?? palette.summer;

  /* ── Reset form when modal re-opens ── */
  useEffect(() => {
    if (triggered) {
      setShowForm(false);
      setFormState('idle');
      setName('');
      setPhone('');
      setFormError('');
    }
  }, [triggered]);

  /* ── Countdown timer (only ticks while modal open) ── */
  useEffect(() => {
    if (!triggered || !promo) return;
    const dur = (promo.duration_hours ?? 24) * 3_600_000;
    const origin = new Date('2025-01-01T00:00:00').getTime();
    const tick = () => {
      const rem = dur - ((Date.now() - origin) % dur);
      setTimeLeft({
        hours: Math.floor(rem / 3_600_000),
        minutes: Math.floor((rem % 3_600_000) / 60_000),
        seconds: Math.floor((rem % 60_000) / 1_000),
      });
    };
    tick();
    const id = setInterval(tick, 1_000);
    return () => clearInterval(id);
  }, [triggered, promo]);

  /* ── Escape key ── */
  useEffect(() => {
    if (!triggered) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') dismiss(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [triggered, dismiss]);

  /* ── Focus management ── */
  useEffect(() => {
    if (triggered) {
      prevFocusRef.current = document.activeElement as HTMLElement;
      const t = setTimeout(() => dismissRef.current?.focus(), 50);
      return () => clearTimeout(t);
    }
    prevFocusRef.current?.focus();
  }, [triggered]);

  /* ── Submit handler ── */
  const handleMiniSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || name.trim().length < 2) {
      setFormError('Please enter your name');
      return;
    }
    const digits = phone.replace(/\D/g, '');
    if (digits.length < 10) {
      setFormError('Please enter a valid phone number');
      return;
    }
    setFormError('');
    setFormState('submitting');

    try {
      const placeholderEmail = `cb-${digits}@callback.tg`;
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: placeholderEmail,
          phone: phone.trim(),
          address: 'To be confirmed via callback',
          message: `Exit intent capture — ${promo?.discount ?? ''} off ${promo?.service ?? ''}. Customer requested callback pricing.`,
          service: promo?.service ?? '',
        }),
      });
      if (!res.ok) throw new Error('Submission failed');
      setFormState('success');
      try { localStorage.setItem('tg-converted', 'true'); } catch { /* private browsing — safe to ignore */ }
    } catch {
      setFormState('idle');
      setFormError('Something went wrong. Please call us at (608) 535-6057.');
    }
  }, [name, phone, promo]);

  if (isLoading || !promo) return null;

  const show = triggered;
  const emoji = getEmoji(promo.service);
  const discount = promo.discount;
  const hasOff = discount.toLowerCase().includes('off');

  /* ── Motion variants ──
   * Desktop: include x/y '-50%' in ALL states so framer-motion's composite
   * transform never overrides the CSS centering (fixes the original bug). */
  const cardVariants = isMobile
    ? {
        hidden: { y: '100%' },
        visible: { y: 0 },
        exit: { y: '100%' },
      }
    : {
        hidden: { scale: 0.92, opacity: 0, x: '-50%', y: '-50%' },
        visible: { scale: 1, opacity: 1, x: '-50%', y: '-50%' },
        exit: { scale: 0.92, opacity: 0, x: '-50%', y: '-50%' },
      };

  return (
    <AnimatePresence>
      {/* ── Backdrop ── */}
      {show && (
        <motion.div
          key="eim-backdrop"
          className="fixed inset-0 bg-black/60 backdrop-blur-[6px] z-[9998]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={dismiss}
          aria-hidden
        />
      )}

      {/* ── Card ── */}
      {show && (
        <motion.div
          key="eim-card"
          role="dialog"
          aria-modal="true"
          aria-label={`Special offer: ${discount} off ${promo.service}`}
          className={[
            'fixed z-[9999] overflow-hidden',
            'bg-[#0b0b11]/[0.97] backdrop-blur-2xl',
            isMobile
              ? 'bottom-0 left-0 right-0 rounded-t-3xl border-t border-x border-white/[0.06]'
              : 'top-1/2 left-1/2 w-full max-w-[440px] rounded-2xl border border-white/[0.06]',
          ].join(' ')}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          transition={{ type: 'spring', damping: 28, stiffness: 240 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Outer glow ring — slow, wide pulse */}
          <motion.div
            className="absolute -inset-[2px] rounded-[inherit] pointer-events-none"
            animate={{
              boxShadow: [
                `0 0 30px ${p.glowSoft}, inset 0 0 0 1px ${p.glowBorder}`,
                `0 0 60px ${p.glowMed}, inset 0 0 0 1px ${p.accent}40`,
                `0 0 30px ${p.glowSoft}, inset 0 0 0 1px ${p.glowBorder}`,
              ],
            }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          />

          {/* Inner glow ring — faster, tighter */}
          <motion.div
            className="absolute -inset-px rounded-[inherit] pointer-events-none"
            animate={{
              boxShadow: [
                `inset 0 0 0 1px ${p.glowBorder}`,
                `inset 0 0 0 1px ${p.accent}55`,
                `inset 0 0 0 1px ${p.glowBorder}`,
              ],
            }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
          />

          {/* Top accent line */}
          <div
            className="absolute top-0 left-0 right-0 h-px"
            style={{
              background: `linear-gradient(90deg, transparent 10%, ${p.accent}18 50%, transparent 90%)`,
            }}
          />

          {/* Mobile drag handle */}
          {isMobile && (
            <div className="flex justify-center pt-3">
              <div className="w-10 h-1 rounded-full bg-white/12" />
            </div>
          )}

          {/* Dismiss */}
          <button
            ref={dismissRef}
            onClick={dismiss}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/[0.06] transition-colors group z-10"
            aria-label="Close offer"
          >
            <X className="h-4 w-4 text-white/20 group-hover:text-white/50 transition-colors" />
          </button>

          {/* ── Content (center-aligned announcement layout) ── */}
          <div className={`text-center ${isMobile ? 'px-6 pt-4 pb-10' : 'px-8 pt-10 pb-9'}`}>

            {/* Service badge */}
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold mb-3"
              style={{
                background: `${p.accent}14`,
                border: `1px solid ${p.accent}40`,
                color: p.accent,
              }}
            >
              <span className="text-base">{emoji}</span>
              <span>{promo.service}</span>
            </motion.div>

            {/* Soft hook headline */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.08 }}
              className="text-white/25 text-sm mb-7"
            >
              Before you go&hellip;
            </motion.p>

            {/* ── HERO: Discount as gradient text ── */}
            <motion.div
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.12, type: 'spring', stiffness: 200 }}
              className="mb-2"
            >
              <motion.div
                animate={{ scale: [1, 1.02, 1] }}
                transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut', repeatDelay: 1.2 }}
              >
                <span
                  className="text-[4rem] sm:text-[5rem] leading-none font-black tracking-tight"
                  style={{
                    background: `linear-gradient(135deg, ${p.gradientFrom}, ${p.gradientTo})`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  {discount}{!hasOff ? ' OFF' : ''}
                </span>
              </motion.div>
            </motion.div>

            {/* Service context */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.16 }}
              className="text-white/35 text-sm mb-6"
            >
              your {promo.service} service
            </motion.p>

            {/* Social proof */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.20 }}
              className="text-xs mb-5"
              style={{ color: p.accentMuted }}
            >
              ★ 47+ Madison area homeowners booked this month
            </motion.p>

            {/* Timer — inline, refined */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.24 }}
              className="flex items-center justify-center gap-2.5 mb-8"
            >
              <Clock className="h-3 w-3 text-white/20" />
              <span className="text-[11px] uppercase tracking-[0.12em] text-white/20">
                Offer expires in
              </span>
              <span
                className="font-mono text-sm font-bold tracking-wide"
                style={{ color: p.accent }}
              >
                {pad(timeLeft.hours)}:{pad(timeLeft.minutes)}:{pad(timeLeft.seconds)}
              </span>
            </motion.div>

            {/* Divider */}
            <div className="h-px bg-white/[0.04] mx-6 mb-7" />

            {/* Step 1: Claim offer button (shows before form is revealed) */}
            {!showForm && formState !== 'success' && (
              <motion.button
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.28 }}
                onClick={() => setShowForm(true)}
                onMouseEnter={() => setCtaHovered(true)}
                onMouseLeave={() => setCtaHovered(false)}
                className="relative w-full py-4 rounded-xl font-bold text-[15px] text-white overflow-hidden transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                style={{
                  background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 50%, #f59e0b 100%)',
                  boxShadow: ctaHovered
                    ? '0 0 44px rgba(245,158,11,0.50)'
                    : '0 0 28px rgba(245,158,11,0.30)',
                }}
              >
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.15] to-transparent animate-shimmer-btn" />
                <span className="relative">Claim {discount} Off — Get My Price →</span>
              </motion.button>
            )}

            {/* Step 2: Mini form — revealed after clicking Claim */}
            <AnimatePresence>
              {showForm && formState !== 'success' && (
                <motion.form
                  key="mini-form"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                  onSubmit={handleMiniSubmit}
                  className="overflow-hidden"
                >
                  <div className="pt-4 space-y-3">
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your name"
                      autoComplete="name"
                      className="w-full rounded-xl px-4 py-3 text-sm text-white outline-none transition-all"
                      style={{
                        background: 'rgba(255,255,255,0.06)',
                        border: '1px solid rgba(255,255,255,0.12)',
                      }}
                      onFocus={(e) => { e.currentTarget.style.border = `1px solid ${p.accent}50`; }}
                      onBlur={(e) => { e.currentTarget.style.border = '1px solid rgba(255,255,255,0.12)'; }}
                    />

                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="(608) 555-0100"
                      autoComplete="tel"
                      className="w-full rounded-xl px-4 py-3 text-sm text-white outline-none transition-all"
                      style={{
                        background: 'rgba(255,255,255,0.06)',
                        border: '1px solid rgba(255,255,255,0.12)',
                      }}
                      onFocus={(e) => { e.currentTarget.style.border = `1px solid ${p.accent}50`; }}
                      onBlur={(e) => { e.currentTarget.style.border = '1px solid rgba(255,255,255,0.12)'; }}
                    />

                    {formError && (
                      <p className="text-xs text-red-400">{formError}</p>
                    )}

                    <motion.button
                      type="submit"
                      disabled={formState === 'submitting'}
                      whileHover={formState === 'submitting' ? {} : { scale: 1.02 }}
                      whileTap={formState === 'submitting' ? {} : { scale: 0.98 }}
                      className="relative w-full py-3.5 rounded-xl font-bold text-[14px] text-white overflow-hidden transition-all duration-200 disabled:opacity-60"
                      style={{
                        background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 50%, #f59e0b 100%)',
                        boxShadow: '0 0 20px rgba(245,158,11,0.25)',
                      }}
                    >
                      <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.15] to-transparent animate-shimmer-btn" />
                      <span className="relative">
                        {formState === 'submitting' ? 'Sending...' : 'Call Me With My Price →'}
                      </span>
                    </motion.button>

                    <p className="text-center text-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>
                      Or call directly:{' '}
                      <a href="tel:+16085356057" style={{ color: 'rgba(255,255,255,0.45)' }}>
                        (608) 535-6057
                      </a>
                    </p>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>

            {/* Step 3: Success state */}
            {formState === 'success' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-4"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 300, delay: 0.1 }}
                  className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3"
                  style={{ background: `${p.accent}18`, border: `1px solid ${p.accent}40` }}
                >
                  <Check className="w-5 h-5" style={{ color: p.accent }} />
                </motion.div>
                <p className="font-bold text-white text-base mb-1">You&apos;re on the list!</p>
                <p className="text-xs" style={{ color: 'rgba(255,255,255,0.45)' }}>
                  We&apos;ll call within the hour with your personalized price.
                </p>
              </motion.div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
