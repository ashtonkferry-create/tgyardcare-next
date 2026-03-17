# Annual Plan Billionaire Rebuild — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Rebuild `/annual-plan` into a premium two-column sticky configurator with immediate service rendering, animated pricing panel, and strategic CTA placement across the site.

**Architecture:** `AnnualPlanConfigurator` gets a complete visual rebuild — static service fallback renders instantly, Supabase enriches on load, 2×4 service card grid with season toggles on left, glassmorphism sticky pricing panel on right. `AnnualPlanContent` gets an immersive animated hero. Homepage banner removed; FullSeasonContract gets secondary CTA. Services page gets a bundle savings strip.

**Tech Stack:** Next.js 15, React 19, TypeScript, Tailwind CSS v4, framer-motion (already installed), @tanstack/react-query, Supabase client, lucide-react icons

**Design doc:** `docs/plans/2026-03-17-annual-plan-billionaire-design.md`

---

## CRITICAL RULES

- TypeScript: 0 errors (run `npx tsc --noEmit` after each task — must return no output)
- No `any` types. Type all props and handlers explicitly.
- All framer-motion imports from `framer-motion` (already installed)
- Keep all existing `useReducer` logic, `calculateBundlePricing()`, and `useSubmitLead` — only replace UI layer
- Commit after EVERY task

---

## Task 1: Rebuild AnnualPlanConfigurator — Static Services + Card Grid + Pricing Panel

**Files:**
- Rewrite: `src/components/AnnualPlanConfigurator.tsx`

**Context:**
The current file is 555 lines. We are keeping:
- All imports for `useReducer`, `useQuery`, `supabase`, `useServices`, `useSubmitLead`, `Pricing` type
- `PlanState`, `PlanAction`, `planReducer`, `initialState` (lines 40–110)
- `calculateBundlePricing()` function (lines 122–161)
- `handleSubmit()` logic

We are replacing ALL UI code (loading skeleton, service rows, calendar, pricing card).

**Step 1: Write the new complete file**

Replace `src/components/AnnualPlanConfigurator.tsx` entirely with:

```tsx
'use client';

import { useReducer, useMemo, useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useServices } from '@/hooks/useServices';
import { useSubmitLead } from '@/hooks/useLeads';
import { type Pricing } from '@/hooks/usePricing';

/* ─────────────────────── Types & Constants ─────────────────────── */

type Season = 'spring' | 'summer' | 'fall' | 'winter';

const SEASONS: { id: Season; label: string; color: string }[] = [
  { id: 'spring', label: 'Spring', color: '#22c55e' },
  { id: 'summer', label: 'Summer', color: '#eab308' },
  { id: 'fall',   label: 'Fall',   color: '#f97316' },
  { id: 'winter', label: 'Winter', color: '#38bdf8' },
];

const MONTH_TO_SEASON: Record<string, Season> = {
  Jan: 'winter', Feb: 'winter', Mar: 'spring', Apr: 'spring', May: 'spring',
  Jun: 'summer', Jul: 'summer', Aug: 'summer', Sep: 'fall', Oct: 'fall',
  Nov: 'fall',   Dec: 'winter',
};

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const SEASON_COLORS: Record<Season, string> = {
  spring: '#22c55e', summer: '#eab308', fall: '#f97316', winter: '#38bdf8',
};

const BUNDLE_DISCOUNT = 0.15;
const BUNDLE_MIN = 3;

/* Static fallback — renders immediately, Supabase enriches on load */
const STATIC_SERVICES: {
  id: string;
  name: string;
  desc: string;
  emoji: string;
  availableSeasons: Season[];
}[] = [
  { id: 'mowing',        name: 'Lawn Mowing',              emoji: '🌿', desc: 'Weekly or bi-weekly cuts, edging & trimming included.',        availableSeasons: ['spring','summer','fall'] },
  { id: 'fertilization', name: 'Fertilization & Weed Control', emoji: '🌱', desc: 'Custom treatment program for a thick, weed-free lawn.',    availableSeasons: ['spring','summer','fall'] },
  { id: 'aeration',      name: 'Aeration & Overseeding',   emoji: '🌾', desc: 'Core aeration + seed for a dense, healthy lawn.',             availableSeasons: ['spring','fall'] },
  { id: 'spring-cleanup',name: 'Spring Cleanup',            emoji: '🌸', desc: 'Full property reset after winter — debris, beds, edging.',    availableSeasons: ['spring'] },
  { id: 'fall-cleanup',  name: 'Fall Cleanup',              emoji: '🍂', desc: 'Leaf removal, bed clearing, and winter prep.',                availableSeasons: ['fall'] },
  { id: 'mulching',      name: 'Mulching',                  emoji: '🪵', desc: 'Fresh mulch installation for garden beds and trees.',         availableSeasons: ['spring','fall'] },
  { id: 'snow-removal',  name: 'Snow Removal',              emoji: '❄️', desc: 'Driveway, walkway, and parking area snow & ice clearing.',    availableSeasons: ['winter'] },
  { id: 'gutter-cleaning',name: 'Gutter Cleaning',          emoji: '🏠', desc: 'Full gutter flush, downspout clear, and debris removal.',     availableSeasons: ['spring','fall'] },
];

/* ─────────────────────── State ─────────────────────── */

interface PlanState {
  selections: Record<string, Record<Season, boolean>>;
  contactForm: { firstName: string; lastName: string; email: string; phone: string; address: string };
  showContactForm: boolean;
}

type PlanAction =
  | { type: 'TOGGLE_SERVICE_SEASON'; serviceId: string; season: Season }
  | { type: 'TOGGLE_ALL_SEASONS'; serviceId: string; availableSeasons: Season[] }
  | { type: 'UPDATE_CONTACT'; field: keyof PlanState['contactForm']; value: string }
  | { type: 'SHOW_CONTACT_FORM' }
  | { type: 'HIDE_CONTACT_FORM' };

const initialState: PlanState = {
  selections: {},
  contactForm: { firstName: '', lastName: '', email: '', phone: '', address: '' },
  showContactForm: false,
};

function planReducer(state: PlanState, action: PlanAction): PlanState {
  switch (action.type) {
    case 'TOGGLE_SERVICE_SEASON': {
      const current = state.selections[action.serviceId]?.[action.season] ?? false;
      return {
        ...state,
        selections: {
          ...state.selections,
          [action.serviceId]: {
            spring: false, summer: false, fall: false, winter: false,
            ...state.selections[action.serviceId],
            [action.season]: !current,
          },
        },
      };
    }
    case 'TOGGLE_ALL_SEASONS': {
      const existing = state.selections[action.serviceId] ?? { spring: false, summer: false, fall: false, winter: false };
      const allSelected = action.availableSeasons.every((s) => existing[s]);
      const updated: Record<Season, boolean> = { spring: false, summer: false, fall: false, winter: false };
      for (const s of action.availableSeasons) {
        updated[s] = !allSelected;
      }
      return { ...state, selections: { ...state.selections, [action.serviceId]: updated } };
    }
    case 'UPDATE_CONTACT':
      return { ...state, contactForm: { ...state.contactForm, [action.field]: action.value } };
    case 'SHOW_CONTACT_FORM':
      return { ...state, showContactForm: true };
    case 'HIDE_CONTACT_FORM':
      return { ...state, showContactForm: false };
    default:
      return state;
  }
}

/* ─────────────────────── Pricing ─────────────────────── */

interface PricingResult {
  monthlyEstimate: number;
  annualEstimate: number;
  savings: number;
  discountActive: boolean;
  originalAnnual: number;
  selectedServiceCount: number;
}

function calculateBundlePricing(
  selections: Record<string, Record<Season, boolean>>,
  allPricing: Pricing[],
): PricingResult {
  let totalAnnual = 0;
  let selectedServiceCount = 0;

  for (const [serviceId, seasons] of Object.entries(selections)) {
    const activeCount = Object.values(seasons).filter(Boolean).length;
    if (activeCount === 0) continue;
    selectedServiceCount++;

    const servicePricing = allPricing.filter((p) => p.service_id === serviceId);
    const tier = servicePricing.find((p) => p.tier === 'better') ?? servicePricing[0];
    if (!tier) continue;

    const midpoint = (tier.price_min + tier.price_max) / 2;
    totalAnnual += midpoint * 12 * (activeCount / 4);
  }

  const discountActive = selectedServiceCount >= BUNDLE_MIN;
  const savings = discountActive ? totalAnnual * BUNDLE_DISCOUNT : 0;
  const finalAnnual = totalAnnual - savings;

  return {
    monthlyEstimate: Math.round(finalAnnual / 12),
    annualEstimate: Math.round(finalAnnual),
    savings: Math.round(savings),
    discountActive,
    originalAnnual: Math.round(totalAnnual),
    selectedServiceCount,
  };
}

/* ─────────────────────── Main Component ─────────────────────── */

export default function AnnualPlanConfigurator() {
  const [state, dispatch] = useReducer(planReducer, initialState);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const { data: dbServices } = useServices();
  const submitLead = useSubmitLead();

  // @ts-ignore -- Supabase deep type instantiation
  const { data: allPricing } = useQuery<Pricing[]>({
    queryKey: ['pricing-all-active'],
    queryFn: async () => {
      // @ts-ignore
      const { data, error } = await supabase.from('pricing').select('*').eq('is_active', true);
      if (error) throw error;
      return (data as unknown as Pricing[]) ?? [];
    },
    staleTime: 1000 * 60 * 10,
  });

  // Merge Supabase IDs onto static services (match by name slug)
  const services = useMemo(() => {
    if (!dbServices) return STATIC_SERVICES;
    return STATIC_SERVICES.map((s) => {
      const match = dbServices.find(
        (d) => d.name.toLowerCase().replace(/\s+/g, '-').includes(s.id.split('-')[0]) ||
               s.name.toLowerCase().includes(d.name.toLowerCase().split(' ')[0])
      );
      return match ? { ...s, id: match.id } : s;
    });
  }, [dbServices]);

  const pricing = useMemo(
    () => calculateBundlePricing(state.selections, allPricing ?? []),
    [state.selections, allPricing],
  );

  const selectedServiceCount = pricing.selectedServiceCount;

  // Active services per month (for mini calendar)
  const monthActiveServices = useMemo(() => {
    const result: Record<string, { emoji: string; color: string }[]> = {};
    for (const month of MONTHS) {
      result[month] = [];
      const season = MONTH_TO_SEASON[month];
      for (const svc of services) {
        if (state.selections[svc.id]?.[season]) {
          result[month].push({ emoji: svc.emoji, color: SEASON_COLORS[season] });
        }
      }
    }
    return result;
  }, [services, state.selections]);

  function buildNotes(): string {
    const entries = services.filter((s) => {
      const seasons = state.selections[s.id];
      return seasons && Object.values(seasons).some(Boolean);
    });
    if (entries.length === 0) return 'Annual Plan: No services selected';
    return (
      'Annual Plan: ' +
      entries.map((s) => {
        const activeSeas = Object.entries(state.selections[s.id] ?? {})
          .filter(([, v]) => v)
          .map(([k]) => k)
          .join(', ');
        return `${s.name} (${activeSeas})`;
      }).join(', ') +
      (pricing.discountActive ? ' | 15% bundle discount applied' : '')
    );
  }

  const handleSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (selectedServiceCount === 0) return;

    const firstEntry = services.find((s) => {
      const seasons = state.selections[s.id];
      return seasons && Object.values(seasons).some(Boolean);
    });

    await submitLead.mutateAsync({
      first_name: state.contactForm.firstName,
      last_name: state.contactForm.lastName,
      email: state.contactForm.email,
      phone: state.contactForm.phone,
      address: state.contactForm.address || undefined,
      service_id: firstEntry?.id ?? '',
      location_id: null,
      notes: buildNotes(),
      referral_source: 'annual_plan_configurator',
    });

    setSubmitSuccess(true);
  }, [services, state, selectedServiceCount, pricing.discountActive, submitLead]);

  /* ─── Success State ─── */
  if (submitSuccess) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          className="rounded-3xl p-10 max-w-md mx-auto"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(34,197,94,0.3)' }}
        >
          <div className="w-16 h-16 mx-auto mb-5 rounded-full flex items-center justify-center"
               style={{ background: 'rgba(34,197,94,0.15)' }}>
            <svg className="w-8 h-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">Plan Locked In!</h3>
          <p className="text-gray-400">We'll reach out within 24 hours with your personalized annual plan and exact pricing.</p>
        </motion.div>
      </div>
    );
  }

  /* ─── Main Layout ─── */
  return (
    <div id="configurator" className="max-w-7xl mx-auto px-4 sm:px-6">
      <div className="lg:grid lg:grid-cols-[1fr_380px] lg:gap-8 xl:gap-12">

        {/* ═══ LEFT: Service Card Grid ═══ */}
        <div>
          <div className="mb-6">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-1">Choose Your Services</h2>
            <p className="text-gray-400 text-sm">
              Toggle seasons for each service. Bundle 3+ to unlock 15% off.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {services.map((service, index) => {
              const svcSeasons = state.selections[service.id] ?? { spring: false, summer: false, fall: false, winter: false };
              const hasAnySelected = service.availableSeasons.some((s) => svcSeasons[s]);
              const allAvailSelected = service.availableSeasons.every((s) => svcSeasons[s]);

              // Dominant active season color for glow
              const activeSeason = SEASONS.find((s) => svcSeasons[s.id]);
              const glowColor = activeSeason?.color ?? 'transparent';

              return (
                <motion.div
                  key={service.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.06 }}
                  className="rounded-2xl p-5 transition-all duration-300"
                  style={{
                    background: hasAnySelected ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.03)',
                    border: hasAnySelected
                      ? `1px solid rgba(255,255,255,0.15)`
                      : '1px solid rgba(255,255,255,0.07)',
                    boxShadow: hasAnySelected ? `0 0 32px ${glowColor}25` : 'none',
                  }}
                >
                  {/* Header */}
                  <div className="flex items-start gap-3 mb-3">
                    <span className="text-2xl flex-shrink-0">{service.emoji}</span>
                    <div>
                      <h3 className="text-white font-semibold text-sm leading-tight">{service.name}</h3>
                      <p className="text-gray-500 text-xs mt-0.5 leading-relaxed">{service.desc}</p>
                    </div>
                  </div>

                  {/* Season toggles */}
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {/* All Year shortcut */}
                    <button
                      type="button"
                      onClick={() => dispatch({ type: 'TOGGLE_ALL_SEASONS', serviceId: service.id, availableSeasons: service.availableSeasons })}
                      className="px-2.5 py-1 text-xs rounded-full font-medium transition-all duration-200"
                      style={
                        allAvailSelected
                          ? { background: 'rgba(255,255,255,0.15)', color: '#fff', border: '1px solid rgba(255,255,255,0.3)' }
                          : { background: 'transparent', color: '#6b7280', border: '1px solid rgba(255,255,255,0.1)' }
                      }
                    >
                      All Year
                    </button>

                    {SEASONS.map((season) => {
                      const available = service.availableSeasons.includes(season.id);
                      const active = svcSeasons[season.id];
                      return (
                        <button
                          key={season.id}
                          type="button"
                          disabled={!available}
                          onClick={() => dispatch({ type: 'TOGGLE_SERVICE_SEASON', serviceId: service.id, season: season.id })}
                          className="px-2.5 py-1 text-xs rounded-full font-medium transition-all duration-200"
                          style={
                            !available
                              ? { background: 'transparent', color: '#374151', border: '1px solid rgba(255,255,255,0.05)', cursor: 'not-allowed', opacity: 0.4 }
                              : active
                              ? { backgroundColor: season.color, color: '#fff', boxShadow: `0 0 10px ${season.color}60`, border: `1px solid ${season.color}`, transform: 'scale(1.05)' }
                              : { background: 'rgba(255,255,255,0.05)', color: '#9ca3af', border: '1px solid rgba(255,255,255,0.1)' }
                          }
                        >
                          {season.label}
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* ═══ RIGHT: Sticky Plan Panel ═══ */}
        <div className="mt-8 lg:mt-0">
          <div
            className="lg:sticky lg:top-6 rounded-2xl p-6 transition-all duration-300"
            style={{
              background: 'rgba(255,255,255,0.04)',
              backdropFilter: 'blur(20px)',
              border: selectedServiceCount > 0
                ? '1px solid rgba(255,255,255,0.12)'
                : '1px solid rgba(255,255,255,0.07)',
            }}
          >
            <h3 className="text-white font-bold text-lg mb-5">Your Annual Plan</h3>

            {/* Bundle Progress */}
            <div className="mb-5">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs text-gray-400">
                  {selectedServiceCount < BUNDLE_MIN
                    ? `Add ${BUNDLE_MIN - selectedServiceCount} more service${BUNDLE_MIN - selectedServiceCount !== 1 ? 's' : ''} for 15% off`
                    : '15% bundle discount unlocked ✓'}
                </span>
                <span className="text-xs font-bold" style={{ color: selectedServiceCount >= BUNDLE_MIN ? '#22c55e' : '#6b7280' }}>
                  {selectedServiceCount}/{BUNDLE_MIN}
                </span>
              </div>
              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
                <motion.div
                  className="h-full rounded-full"
                  animate={{ width: `${Math.min((selectedServiceCount / BUNDLE_MIN) * 100, 100)}%` }}
                  transition={{ duration: 0.4, ease: 'easeOut' }}
                  style={{
                    background: selectedServiceCount >= BUNDLE_MIN
                      ? 'linear-gradient(90deg, #22c55e, #16a34a)'
                      : 'linear-gradient(90deg, #4b5563, #6b7280)',
                    boxShadow: selectedServiceCount >= BUNDLE_MIN ? '0 0 12px rgba(34,197,94,0.4)' : 'none',
                  }}
                />
              </div>
            </div>

            {/* Price Display */}
            <div className="text-center py-4 border-y mb-5" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
              {selectedServiceCount === 0 ? (
                <p className="text-gray-600 text-sm py-2">Select services to see pricing</p>
              ) : (
                <AnimatePresence mode="wait">
                  <motion.div
                    key={pricing.monthlyEstimate}
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="flex items-baseline justify-center gap-2">
                      <span className="text-5xl font-bold text-white">
                        ~${pricing.monthlyEstimate.toLocaleString()}
                      </span>
                      <span className="text-gray-400 text-sm">/mo</span>
                    </div>
                    <div className="mt-1 flex items-center justify-center gap-2">
                      {pricing.discountActive && (
                        <span className="text-gray-500 text-sm line-through">
                          ${Math.round(pricing.originalAnnual / 12).toLocaleString()}/mo
                        </span>
                      )}
                      <span className="text-gray-400 text-sm">
                        ~${pricing.annualEstimate.toLocaleString()}/year
                      </span>
                    </div>
                    {pricing.discountActive && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="inline-flex items-center gap-1.5 mt-3 px-3 py-1.5 rounded-full text-xs font-semibold"
                        style={{ background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)', color: '#4ade80' }}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        You save ${pricing.savings.toLocaleString()}/year
                      </motion.div>
                    )}
                  </motion.div>
                </AnimatePresence>
              )}
            </div>

            {/* Mini Calendar */}
            {selectedServiceCount > 0 && (
              <div className="mb-5">
                <p className="text-xs text-gray-500 mb-2 font-medium uppercase tracking-wide">Your Coverage</p>
                <div className="grid grid-cols-4 gap-1">
                  {MONTHS.map((month) => {
                    const active = monthActiveServices[month] ?? [];
                    const season = MONTH_TO_SEASON[month];
                    return (
                      <div
                        key={month}
                        className="rounded-lg p-1.5 text-center transition-colors duration-200"
                        style={{
                          background: active.length > 0 ? `${SEASON_COLORS[season]}15` : 'rgba(255,255,255,0.03)',
                          border: active.length > 0 ? `1px solid ${SEASON_COLORS[season]}30` : '1px solid rgba(255,255,255,0.05)',
                        }}
                      >
                        <div className="text-xs text-gray-400 font-medium">{month}</div>
                        {active.length > 0 && (
                          <div className="flex justify-center gap-0.5 mt-1 flex-wrap">
                            {active.slice(0, 3).map((svc, i) => (
                              <span key={i} className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: svc.color }} />
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* CTA */}
            <AnimatePresence mode="wait">
              {!state.showContactForm ? (
                <motion.div
                  key="cta"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-2"
                >
                  <button
                    type="button"
                    disabled={selectedServiceCount === 0}
                    onClick={() => dispatch({ type: 'SHOW_CONTACT_FORM' })}
                    className="w-full relative overflow-hidden rounded-xl py-3.5 px-6 font-bold text-white transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
                    style={{
                      background: selectedServiceCount > 0
                        ? 'linear-gradient(135deg, #22c55e, #16a34a)'
                        : '#1f2937',
                      boxShadow: selectedServiceCount > 0 ? '0 0 28px rgba(34,197,94,0.3)' : 'none',
                    }}
                  >
                    {/* Shimmer overlay */}
                    {selectedServiceCount > 0 && (
                      <motion.div
                        className="absolute inset-0 pointer-events-none"
                        style={{ background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.15) 50%, transparent 60%)' }}
                        animate={{ x: ['-100%', '200%'] }}
                        transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 1.5, ease: 'linear' }}
                      />
                    )}
                    <span className="relative">Lock In My Plan</span>
                  </button>
                  <button
                    type="button"
                    disabled={selectedServiceCount === 0}
                    onClick={() => dispatch({ type: 'SHOW_CONTACT_FORM' })}
                    className="w-full py-2.5 px-6 rounded-xl text-sm font-medium transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
                    style={{ border: '1px solid rgba(255,255,255,0.1)', color: '#9ca3af' }}
                  >
                    Get Exact Quote
                  </button>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  onSubmit={handleSubmit}
                  className="space-y-3 overflow-hidden"
                >
                  <div className="grid grid-cols-2 gap-2">
                    {(['firstName', 'lastName'] as const).map((field, i) => (
                      <input
                        key={field}
                        type="text"
                        required
                        placeholder={i === 0 ? 'First name' : 'Last name'}
                        value={state.contactForm[field]}
                        onChange={(e) => dispatch({ type: 'UPDATE_CONTACT', field, value: e.target.value })}
                        className="rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-gray-600 focus:outline-none transition-colors"
                        style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
                      />
                    ))}
                  </div>
                  <input
                    type="email" required placeholder="Email"
                    value={state.contactForm.email}
                    onChange={(e) => dispatch({ type: 'UPDATE_CONTACT', field: 'email', value: e.target.value })}
                    className="w-full rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-gray-600 focus:outline-none transition-colors"
                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
                  />
                  <input
                    type="tel" required placeholder="Phone"
                    value={state.contactForm.phone}
                    onChange={(e) => dispatch({ type: 'UPDATE_CONTACT', field: 'phone', value: e.target.value })}
                    className="w-full rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-gray-600 focus:outline-none transition-colors"
                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
                  />
                  <input
                    type="text" placeholder="Service address (optional)"
                    value={state.contactForm.address}
                    onChange={(e) => dispatch({ type: 'UPDATE_CONTACT', field: 'address', value: e.target.value })}
                    className="w-full rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-gray-600 focus:outline-none transition-colors"
                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
                  />
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={submitLead.isPending}
                      className="flex-1 py-3 rounded-xl font-bold text-white text-sm transition-all duration-200 disabled:opacity-50"
                      style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)', boxShadow: '0 0 20px rgba(34,197,94,0.25)' }}
                    >
                      {submitLead.isPending ? 'Submitting…' : 'Lock In My Plan'}
                    </button>
                    <button
                      type="button"
                      onClick={() => dispatch({ type: 'HIDE_CONTACT_FORM' })}
                      className="px-4 py-3 rounded-xl text-gray-500 hover:text-gray-300 transition-colors text-sm"
                      style={{ border: '1px solid rgba(255,255,255,0.08)' }}
                    >
                      ✕
                    </button>
                  </div>
                  {submitLead.isError && (
                    <p className="text-red-400 text-xs text-center">Something went wrong. Please try again.</p>
                  )}
                </motion.form>
              )}
            </AnimatePresence>

            {/* Trust micro-line */}
            <p className="text-center text-gray-600 text-xs mt-4">
              80+ Madison families · 4.9★ Google · Fully insured
            </p>
          </div>
        </div>
      </div>

      {/* ═══ Mobile Sticky Bottom Bar ═══ */}
      <AnimatePresence>
        {selectedServiceCount > 0 && !state.showContactForm && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="lg:hidden fixed bottom-0 inset-x-0 z-50 px-4 pb-4 pt-3"
            style={{ background: 'linear-gradient(to top, rgba(5,13,7,0.98) 60%, transparent)' }}
          >
            <div
              className="rounded-2xl p-4 flex items-center justify-between gap-4"
              style={{ background: 'rgba(20,30,22,0.95)', border: '1px solid rgba(34,197,94,0.2)', backdropFilter: 'blur(16px)' }}
            >
              <div>
                <div className="text-white font-bold text-xl">
                  ~${pricing.monthlyEstimate > 0 ? pricing.monthlyEstimate.toLocaleString() : '—'}<span className="text-gray-400 text-sm font-normal">/mo</span>
                </div>
                {pricing.discountActive && (
                  <div className="text-emerald-400 text-xs font-semibold">15% off applied ✓</div>
                )}
              </div>
              <button
                type="button"
                onClick={() => {
                  dispatch({ type: 'SHOW_CONTACT_FORM' });
                  document.getElementById('configurator')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="relative overflow-hidden rounded-xl py-3 px-6 font-bold text-white text-sm flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)', boxShadow: '0 0 20px rgba(34,197,94,0.3)' }}
              >
                Lock In My Plan
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
```

**Step 2: Verify TypeScript**

```bash
cd tgyardcare && npx tsc --noEmit 2>&1 | grep "error TS"
```
Expected: no output (zero errors)

**Step 3: Commit**

```bash
git add src/components/AnnualPlanConfigurator.tsx
git commit -m "feat: rebuild AnnualPlanConfigurator — premium card grid + sticky pricing panel"
```

---

## Task 2: Rebuild AnnualPlanContent — Immersive Hero + Layout

**Files:**
- Rewrite: `src/app/annual-plan/AnnualPlanContent.tsx`

**Context:** Current file is 105 lines with a weak hero and basic wrapper. Replace entirely.

**Step 1: Write the new file**

Replace `src/app/annual-plan/AnnualPlanContent.tsx` entirely:

```tsx
'use client';

import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import AnnualPlanConfigurator from '@/components/AnnualPlanConfigurator';
import { WebPageSchema } from '@/components/schemas/WebPageSchema';
import { motion } from 'framer-motion';

const TRUST_ITEMS = [
  { label: '4.9★ Google Rating' },
  { label: '80+ Madison Families' },
  { label: '15% Bundle Savings' },
  { label: 'Fully Insured' },
  { label: 'Locked-In Pricing' },
];

export default function AnnualPlanContent() {
  return (
    <div className="min-h-screen" style={{ background: '#050d07' }}>
      <WebPageSchema
        name="Build Your Custom Annual Lawn Care Plan"
        description="Toggle lawn care services by season, see your price instantly, and lock in an annual plan with TotalGuard Yard Care."
        url="/annual-plan"
      />

      {/* AI/Answer Engine summary */}
      <section className="sr-only" aria-label="Annual Plan Summary">
        <p>
          TotalGuard Yard Care offers customizable annual lawn care plans for Madison, Wisconsin and surrounding
          Dane County communities. Select services by season — spring, summer, fall, and winter. Customers who
          bundle 3 or more services receive a 15% discount. Use the interactive configurator to see your annual
          price estimate and submit a lead to lock in your plan.
        </p>
      </section>

      <Navigation />

      {/* ═══ HERO ═══ */}
      <section className="relative overflow-hidden pt-24 pb-16 md:pt-32 md:pb-20">
        {/* Background layers */}
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(160deg, #050d07 0%, #061a10 40%, #050d07 100%)' }} />

        {/* Radial glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 80%, rgba(34,197,94,0.08) 0%, transparent 70%)' }}
        />

        {/* Dot grid */}
        <div className="absolute inset-0 opacity-[0.06] pointer-events-none">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="hero-grid" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                <circle cx="20" cy="20" r="1" fill="#22c55e" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#hero-grid)" />
          </svg>
        </div>

        {/* Floating particles */}
        {[...Array(16)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full pointer-events-none"
            style={{
              width: Math.random() * 4 + 2,
              height: Math.random() * 4 + 2,
              left: `${(i * 6.25) + Math.random() * 6}%`,
              top: `${20 + Math.random() * 60}%`,
              background: `rgba(34,197,94,${0.15 + Math.random() * 0.25})`,
            }}
            animate={{
              y: [0, -(20 + Math.random() * 30), 0],
              opacity: [0.2, 0.7, 0.2],
            }}
            transition={{
              duration: 4 + Math.random() * 4,
              repeat: Infinity,
              delay: Math.random() * 4,
              ease: 'easeInOut',
            }}
          />
        ))}

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex justify-center mb-6"
            >
              <div
                className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-xs font-bold tracking-widest uppercase"
                style={{
                  background: 'rgba(34,197,94,0.08)',
                  border: '1px solid rgba(34,197,94,0.25)',
                  color: '#4ade80',
                }}
              >
                Custom Annual Lawn Care
              </div>
            </motion.div>

            {/* H1 */}
            <motion.h1
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-[1.05] tracking-tight"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              Build Your Plan.{' '}
              <span
                className="bg-clip-text text-transparent"
                style={{ backgroundImage: 'linear-gradient(135deg, #4ade80, #22c55e, #16a34a)' }}
              >
                Lock In Your Price.
              </span>
            </motion.h1>

            {/* Sub */}
            <motion.p
              className="text-lg md:text-xl leading-relaxed mb-8 max-w-2xl mx-auto"
              style={{ color: 'rgba(255,255,255,0.55)' }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Choose your services by season and watch your annual cost update in real time.
              Bundle 3+ services to unlock <strong className="text-emerald-400">15% off — applied automatically.</strong>
            </motion.p>

            {/* Trust strip */}
            <motion.div
              className="flex flex-wrap justify-center gap-x-5 gap-y-2 mb-10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.35 }}
            >
              {TRUST_ITEMS.map((item, i) => (
                <span key={i} className="flex items-center gap-1.5 text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
                  <span className="w-1 h-1 rounded-full" style={{ background: '#22c55e' }} />
                  {item.label}
                </span>
              ))}
            </motion.div>

            {/* Scroll CTA */}
            <motion.a
              href="#configurator"
              className="inline-flex items-center gap-2 text-sm font-semibold transition-all duration-200"
              style={{ color: '#4ade80' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              whileHover={{ y: 3 }}
            >
              Start Building
              <motion.span
                animate={{ y: [0, 4, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
              >
                ↓
              </motion.span>
            </motion.a>
          </div>
        </div>
      </section>

      {/* ═══ CONFIGURATOR ═══ */}
      <section className="pb-32 pt-6" style={{ background: '#050d07' }}>
        <AnnualPlanConfigurator />
      </section>

      <Footer showCloser={false} />
    </div>
  );
}
```

**Step 2: Verify TypeScript**

```bash
npx tsc --noEmit 2>&1 | grep "error TS"
```
Expected: no output

**Step 3: Commit**

```bash
git add src/app/annual-plan/AnnualPlanContent.tsx
git commit -m "feat: rebuild annual plan page — immersive hero + floating particles"
```

---

## Task 3: FullSeasonContract — Add Secondary CTA + Remove Homepage Banner

**Files:**
- Modify: `src/components/FullSeasonContract.tsx`
- Modify: `src/app/page.tsx`

### Part A: FullSeasonContract secondary CTA

**Context:** The CTA div is around line 464–517 in FullSeasonContract.tsx. The primary gold button links to `/contact?service=full-season`. We're adding a secondary link BELOW the primary button pair.

Find this block in `FullSeasonContract.tsx`:
```tsx
<motion.a
  href="tel:608-535-6057"
  className="text-slate-400 hover:text-white font-semibold transition-colors flex items-center gap-2"
  whileHover={{ x: 3 }}
>
  Or call (608) 535-6057
  <ArrowRight className="h-4 w-4" />
</motion.a>
```

Replace with:
```tsx
<motion.a
  href="tel:608-535-6057"
  className="text-slate-400 hover:text-white font-semibold transition-colors flex items-center gap-2"
  whileHover={{ x: 3 }}
>
  Or call (608) 535-6057
  <ArrowRight className="h-4 w-4" />
</motion.a>

{/* Secondary: custom plan builder */}
<motion.div
  className="mt-4 flex justify-center"
  initial={{ opacity: 0 }}
  whileInView={{ opacity: 1 }}
  viewport={{ once: true }}
  transition={{ duration: 0.4, delay: 1.3 }}
>
  <Link
    href="/annual-plan"
    className="inline-flex items-center gap-2 text-sm font-medium transition-all duration-200 hover:gap-3"
    style={{ color: 'rgba(212,168,85,0.65)' }}
  >
    <Sparkles className="h-3.5 w-3.5" />
    Or build your own custom plan
    <ArrowRight className="h-3.5 w-3.5" />
  </Link>
</motion.div>
```

Note: `Link` from `next/link` and `Sparkles`, `ArrowRight` from `lucide-react` are already imported.

### Part B: Remove standalone homepage banner

**Context:** In `src/app/page.tsx`, the executor added an inline CTA banner between `<HowItWorks />` and `<LatestBlogPosts />`. It looks roughly like this (lines ~77–95):

Find and delete this entire block — it will be a `<section>` or `<div>` containing "annual-plan" href and "Save 15%" or "Build Your Annual Plan" text. It is NOT a named component — it's an inline JSX block.

**Step 1: Read page.tsx lines 70-100 to locate exact block**

After reading, delete only the inline annual plan banner. Keep all named components (`<HowItWorks />`, `<LatestBlogPosts />`) intact.

**Step 2: Verify TypeScript**

```bash
npx tsc --noEmit 2>&1 | grep "error TS"
```

**Step 3: Commit**

```bash
git add src/components/FullSeasonContract.tsx src/app/page.tsx
git commit -m "feat: add annual plan CTA to FullSeasonContract, remove stray homepage banner"
```

---

## Task 4: Services Page — Bundle Savings Strip

**Files:**
- Modify: `src/app/services/ServicesContent.tsx`

**Context:** Add a full-width "Bundle & Save" callout after the service category grids (before the `TotalGuard Standard` section or `ServiceGuarantees` component).

**Step 1: Find insertion point**

Read `src/app/services/ServicesContent.tsx`. Find the end of the last service category grid (likely the "Gutter Services" or "Seasonal Cleanup" section). Add the following block immediately after:

```tsx
{/* Bundle Savings Strip */}
<div className="mx-auto max-w-5xl px-4 my-10">
  <div
    className="rounded-2xl px-6 py-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
    style={{
      background: 'rgba(34,197,94,0.05)',
      border: '1px solid rgba(34,197,94,0.15)',
      borderLeft: '4px solid #22c55e',
    }}
  >
    <div>
      <p className="text-white font-semibold text-sm mb-0.5">
        💰 Bundle any 3+ services and save 15% automatically
      </p>
      <p className="text-gray-500 text-xs">
        Build a custom annual plan with exactly the services you need — price updates in real time.
      </p>
    </div>
    <a
      href="/annual-plan"
      className="flex-shrink-0 inline-flex items-center gap-2 text-sm font-semibold transition-all duration-200 hover:gap-3 whitespace-nowrap"
      style={{ color: '#4ade80' }}
    >
      Build your custom plan →
    </a>
  </div>
</div>
```

Note: This uses plain HTML `<a>` not `Link` — check if `Link` is already imported in the file. If yes, use `<Link href="/annual-plan">` instead of `<a href>`.

**Step 2: Verify TypeScript**

```bash
npx tsc --noEmit 2>&1 | grep "error TS"
```

**Step 3: Commit**

```bash
git add src/app/services/ServicesContent.tsx
git commit -m "feat: add bundle savings strip to services page"
```

---

## Task 5: Final Verification

**Step 1: Full TypeScript check**

```bash
cd tgyardcare && npx tsc --noEmit 2>&1
```
Expected: no output (zero errors)

**Step 2: Full build**

```bash
npm run build 2>&1 | tail -20
```
Expected: "Route (app)" table shown, exit code 0

**Step 3: Verify key files changed**

```bash
# AnnualPlanConfigurator has static services
grep "STATIC_SERVICES" src/components/AnnualPlanConfigurator.tsx

# Sticky panel present
grep "sticky" src/components/AnnualPlanConfigurator.tsx

# Mobile bar present
grep "fixed bottom-0" src/components/AnnualPlanConfigurator.tsx

# Hero particles present
grep "floating particles" src/app/annual-plan/AnnualPlanContent.tsx || grep "Array(16)" src/app/annual-plan/AnnualPlanContent.tsx

# FullSeasonContract has annual-plan link
grep "annual-plan" src/components/FullSeasonContract.tsx

# Homepage banner removed
grep -c "annual-plan" src/app/page.tsx  # should be 0 or very low if nav links only

# Services page has strip
grep "Bundle" src/app/services/ServicesContent.tsx
```

**Step 4: Push + commit**

```bash
git push
```

---

## Acceptance Criteria

1. `/annual-plan` loads instantly with 8 service cards (no Supabase wait)
2. Season toggles are colored, season-aware (unavailable seasons dimmed + disabled)
3. Sticky pricing panel visible on desktop while scrolling service grid
4. Price animates on every toggle
5. Bundle progress bar fills per service selected
6. Discount badge appears at 3+ services
7. Mini calendar shows coverage per month
8. "Lock In My Plan" reveals contact form in panel (no page scroll needed)
9. Mobile sticky bottom bar appears when any service selected
10. FullSeasonContract on homepage has "Or build your own custom plan" secondary CTA
11. Standalone homepage annual-plan banner is gone
12. Services page has bundle savings emerald strip
13. Build passes, 0 TypeScript errors
