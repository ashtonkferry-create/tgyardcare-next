'use client';

import { useReducer, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useServices, type Service } from '@/hooks/useServices';
import { useSubmitLead } from '@/hooks/useLeads';
import { type Pricing } from '@/hooks/usePricing';

/* ─────────────────────── Types & Constants ─────────────────────── */

type Season = 'spring' | 'summer' | 'fall' | 'winter';

const SEASONS = [
  { id: 'spring' as Season, label: 'Spring', months: ['Mar', 'Apr', 'May'], color: '#22c55e' },
  { id: 'summer' as Season, label: 'Summer', months: ['Jun', 'Jul', 'Aug'], color: '#eab308' },
  { id: 'fall' as Season, label: 'Fall', months: ['Sep', 'Oct', 'Nov'], color: '#f97316' },
  { id: 'winter' as Season, label: 'Winter', months: ['Dec', 'Jan', 'Feb'], color: '#38bdf8' },
] as const;

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const MONTH_TO_SEASON: Record<string, Season> = {
  Jan: 'winter', Feb: 'winter', Mar: 'spring', Apr: 'spring', May: 'spring',
  Jun: 'summer', Jul: 'summer', Aug: 'summer', Sep: 'fall', Oct: 'fall',
  Nov: 'fall', Dec: 'winter',
};

const SEASON_COLORS: Record<Season, string> = {
  spring: '#22c55e',
  summer: '#eab308',
  fall: '#f97316',
  winter: '#38bdf8',
};

const BUNDLE_DISCOUNT = 0.15;
const BUNDLE_MIN_SERVICES = 3;

/* ─────────────────────── State Management ─────────────────────── */

interface PlanState {
  selections: Record<string, Record<Season, boolean>>;
  contactForm: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
  };
  showContactForm: boolean;
}

type PlanAction =
  | { type: 'TOGGLE_SERVICE_SEASON'; serviceId: string; season: Season }
  | { type: 'TOGGLE_ALL_SEASONS'; serviceId: string }
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
      const allSelected = existing.spring && existing.summer && existing.fall && existing.winter;
      return {
        ...state,
        selections: {
          ...state.selections,
          [action.serviceId]: {
            spring: !allSelected,
            summer: !allSelected,
            fall: !allSelected,
            winter: !allSelected,
          },
        },
      };
    }
    case 'UPDATE_CONTACT':
      return {
        ...state,
        contactForm: { ...state.contactForm, [action.field]: action.value },
      };
    case 'SHOW_CONTACT_FORM':
      return { ...state, showContactForm: true };
    case 'HIDE_CONTACT_FORM':
      return { ...state, showContactForm: false };
    default:
      return state;
  }
}

/* ─────────────────────── Pricing Calculation ─────────────────────── */

interface PricingResult {
  monthlyEstimate: number;
  annualEstimate: number;
  savings: number;
  discountActive: boolean;
  originalAnnual: number;
}

function calculateBundlePricing(
  selections: Record<string, Record<Season, boolean>>,
  allPricing: Pricing[],
): PricingResult {
  let totalAnnual = 0;
  let selectedServiceCount = 0;

  for (const [serviceId, seasons] of Object.entries(selections)) {
    const selectedSeasonCount = Object.values(seasons).filter(Boolean).length;
    if (selectedSeasonCount === 0) continue;

    selectedServiceCount++;

    // Find 'better' tier pricing, fall back to first available
    const servicePricing = allPricing.filter((p) => p.service_id === serviceId);
    const betterTier = servicePricing.find((p) => p.tier === 'better');
    const fallbackTier = servicePricing[0];
    const tier = betterTier ?? fallbackTier;

    if (!tier) continue;

    // Midpoint price * proportion of year selected
    const midpoint = (tier.price_min + tier.price_max) / 2;
    // Monthly contribution scaled by fraction of seasons selected
    const annualContribution = midpoint * 12 * (selectedSeasonCount / 4);
    totalAnnual += annualContribution;
  }

  const discountActive = selectedServiceCount >= BUNDLE_MIN_SERVICES;
  const savings = discountActive ? totalAnnual * BUNDLE_DISCOUNT : 0;
  const finalAnnual = totalAnnual - savings;

  return {
    monthlyEstimate: Math.round(finalAnnual / 12),
    annualEstimate: Math.round(finalAnnual),
    savings: Math.round(savings),
    discountActive,
    originalAnnual: Math.round(totalAnnual),
  };
}

/* ─────────────────────── Component ─────────────────────── */

export default function AnnualPlanConfigurator() {
  const [state, dispatch] = useReducer(planReducer, initialState);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Fetch services
  const { data: services, isLoading: servicesLoading } = useServices();

  // Fetch all active pricing in one query
  // @ts-ignore -- Supabase deep type instantiation with 163+ tables
  const { data: allPricing } = useQuery({
    queryKey: ['pricing-all-active'],
    queryFn: async () => {
      // @ts-ignore -- Supabase deep type instantiation with 163+ tables
      const { data, error } = await supabase
        // @ts-ignore -- Supabase deep type instantiation with 163+ tables
        .from('pricing')
        .select('*')
        .eq('is_active', true);
      if (error) throw error;
      return (data as unknown as Pricing[]) ?? [];
    },
    staleTime: 1000 * 60 * 10,
  });

  // Lead submission
  const submitLead = useSubmitLead();

  // Pricing calculation
  const pricing = useMemo(
    () => calculateBundlePricing(state.selections, allPricing ?? []),
    [state.selections, allPricing],
  );

  // Services with at least 1 season selected
  const selectedServiceEntries = useMemo(() => {
    if (!services) return [];
    return services
      .filter((s) => {
        const seasons = state.selections[s.id];
        return seasons && Object.values(seasons).some(Boolean);
      })
      .map((s) => ({
        serviceId: s.id,
        serviceName: s.name,
        seasons: Object.entries(state.selections[s.id] ?? {})
          .filter(([, v]) => v)
          .map(([k]) => k),
      }));
  }, [services, state.selections]);

  // Active services per month (for calendar)
  const monthActiveServices = useMemo(() => {
    const result: Record<string, { name: string; color: string }[]> = {};
    for (const month of MONTHS) {
      result[month] = [];
      const season = MONTH_TO_SEASON[month];
      if (!services) continue;
      for (const svc of services) {
        if (state.selections[svc.id]?.[season]) {
          result[month].push({ name: svc.name, color: SEASON_COLORS[season] });
        }
      }
    }
    return result;
  }, [services, state.selections]);

  const selectedServiceCount = selectedServiceEntries.length;

  // Build human-readable notes for lead
  function buildNotes(): string {
    if (selectedServiceEntries.length === 0) return 'Annual Plan: No services selected';
    return (
      'Annual Plan: ' +
      selectedServiceEntries.map((e) => `${e.serviceName} (${e.seasons.join(', ')})`).join(', ') +
      (pricing.discountActive ? ` | 15% bundle discount applied` : '')
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (selectedServiceEntries.length === 0) return;

    const firstServiceId = selectedServiceEntries[0].serviceId;

    await submitLead.mutateAsync({
      first_name: state.contactForm.firstName,
      last_name: state.contactForm.lastName,
      email: state.contactForm.email,
      phone: state.contactForm.phone,
      address: state.contactForm.address || undefined,
      service_id: firstServiceId,
      location_id: null,
      notes: buildNotes(),
      referral_source: 'annual_plan_configurator',
    });

    setSubmitSuccess(true);
  }

  /* ─────────────── Render Helpers ─────────────── */

  function renderSeasonToggle(service: Service, season: typeof SEASONS[number]) {
    const active = state.selections[service.id]?.[season.id] ?? false;
    return (
      <button
        key={season.id}
        type="button"
        onClick={() => dispatch({ type: 'TOGGLE_SERVICE_SEASON', serviceId: service.id, season: season.id })}
        className="px-3 py-1.5 text-sm rounded-full font-medium transition-all duration-200"
        style={
          active
            ? { backgroundColor: season.color, color: '#fff', boxShadow: `0 0 12px ${season.color}40` }
            : { backgroundColor: 'rgba(255,255,255,0.05)', color: '#9ca3af' }
        }
      >
        {season.label}
      </button>
    );
  }

  /* ─────────────── Loading State ─────────────── */

  if (servicesLoading) {
    return (
      <section className="bg-[#0a0a0f] py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-white/10 rounded w-80 mx-auto" />
            <div className="h-4 bg-white/5 rounded w-60 mx-auto" />
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-16 bg-[#1a1a24] rounded-xl" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  /* ─────────────── Success State ─────────────── */

  if (submitSuccess) {
    return (
      <section className="bg-[#0a0a0f] py-16 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-[#1a1a24] border border-emerald-500/30 rounded-2xl p-10">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-500/20 flex items-center justify-center">
              <svg className="w-8 h-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-2xl font-display font-bold text-white mb-2">Plan Locked In!</h3>
            <p className="text-gray-400">
              We will reach out within 24 hours with your personalized annual plan and exact pricing.
            </p>
          </div>
        </div>
      </section>
    );
  }

  /* ─────────────── Main Render ─────────────── */

  return (
    <section className="bg-[#0a0a0f] py-16 px-4" id="annual-plan">
      <div className="max-w-5xl mx-auto space-y-10">
        {/* Header */}
        <div className="text-center space-y-3">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-white">
            Build Your Annual Plan
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Select services by season and see your bundle pricing update in real time.
            {selectedServiceCount < BUNDLE_MIN_SERVICES && (
              <span className="block mt-1 text-emerald-400 text-sm">
                Add {BUNDLE_MIN_SERVICES - selectedServiceCount} more service{BUNDLE_MIN_SERVICES - selectedServiceCount !== 1 ? 's' : ''} to unlock 15% bundle discount
              </span>
            )}
          </p>
        </div>

        {/* ─── Section A: Service / Season Toggle Grid ─── */}
        <div className="space-y-3">
          {(services ?? []).map((service) => {
            const svcSeasons = state.selections[service.id] ?? { spring: false, summer: false, fall: false, winter: false };
            const allSelected = svcSeasons.spring && svcSeasons.summer && svcSeasons.fall && svcSeasons.winter;
            return (
              <div
                key={service.id}
                className="bg-[#1a1a24] border border-white/10 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-3"
              >
                <div className="sm:w-48 flex-shrink-0">
                  <span className="text-white font-semibold text-sm">{service.name}</span>
                </div>
                <div className="flex flex-wrap items-center gap-2 flex-1">
                  <button
                    type="button"
                    onClick={() => dispatch({ type: 'TOGGLE_ALL_SEASONS', serviceId: service.id })}
                    className={`px-3 py-1.5 text-xs rounded-full font-medium border transition-all duration-200 ${
                      allSelected
                        ? 'border-emerald-500 text-emerald-400 bg-emerald-500/10'
                        : 'border-white/20 text-gray-500 hover:border-white/40'
                    }`}
                  >
                    All Year
                  </button>
                  {SEASONS.map((season) => renderSeasonToggle(service, season))}
                </div>
              </div>
            );
          })}
        </div>

        {/* ─── Section B: 12-Month Calendar Preview ─── */}
        <div>
          <h3 className="text-lg font-display font-semibold text-white mb-4">Your 12-Month Calendar</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {MONTHS.map((month) => {
              const season = MONTH_TO_SEASON[month];
              const activeServices = monthActiveServices[month] ?? [];
              return (
                <div
                  key={month}
                  className="rounded-xl border border-white/10 p-3 min-h-[100px] transition-all duration-200"
                  style={{ backgroundColor: activeServices.length > 0 ? `${SEASON_COLORS[season]}10` : '#111118' }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: SEASON_COLORS[season] }}
                    />
                    <span className="text-white text-sm font-semibold">{month}</span>
                  </div>
                  {activeServices.length === 0 ? (
                    <span className="text-gray-600 text-xs">Rest</span>
                  ) : (
                    <div className="space-y-1">
                      {activeServices.map((svc, i) => (
                        <div key={i} className="flex items-center gap-1.5">
                          <span
                            className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                            style={{ backgroundColor: svc.color }}
                          />
                          <span className="text-gray-300 text-xs truncate">{svc.name}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ─── Section C: Pricing Summary + CTA ─── */}
        <div className="bg-[#1a1a24] border border-white/10 rounded-2xl p-6 md:p-8">
          {selectedServiceCount === 0 ? (
            <div className="text-center py-4">
              <p className="text-gray-500">Select services above to see your annual pricing</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Pricing display */}
              <div className="text-center space-y-2">
                <div className="flex items-baseline justify-center gap-3">
                  <span className="text-4xl md:text-5xl font-display font-bold text-white">
                    ~${pricing.monthlyEstimate.toLocaleString()}
                  </span>
                  <span className="text-gray-400">/month</span>
                </div>
                <p className="text-gray-400">
                  ~${pricing.annualEstimate.toLocaleString()}/year
                  {pricing.discountActive && (
                    <span className="ml-2 line-through text-gray-600">
                      ${pricing.originalAnnual.toLocaleString()}
                    </span>
                  )}
                </p>
                {pricing.discountActive && (
                  <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 rounded-full px-4 py-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-emerald-400 text-sm font-medium">
                      You save ${pricing.savings.toLocaleString()} (15% bundle discount)
                    </span>
                  </div>
                )}
              </div>

              {/* Selected services summary */}
              <div className="flex flex-wrap justify-center gap-2">
                {selectedServiceEntries.map((entry) => (
                  <span
                    key={entry.serviceId}
                    className="bg-white/5 border border-white/10 rounded-full px-3 py-1 text-xs text-gray-300"
                  >
                    {entry.serviceName} ({entry.seasons.join(', ')})
                  </span>
                ))}
              </div>

              {/* CTAs */}
              {!state.showContactForm ? (
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button
                    type="button"
                    onClick={() => dispatch({ type: 'SHOW_CONTACT_FORM' })}
                    className="px-8 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-semibold text-lg transition-all duration-200 hover:scale-[1.02] hover:shadow-[0_0_24px_rgba(16,185,129,0.3)]"
                  >
                    Lock In My Plan
                  </button>
                  <button
                    type="button"
                    onClick={() => dispatch({ type: 'SHOW_CONTACT_FORM' })}
                    className="px-8 py-3.5 rounded-xl border border-white/20 text-gray-300 hover:text-white hover:border-white/40 font-medium transition-all duration-200"
                  >
                    Get Exact Quote
                  </button>
                </div>
              ) : (
                /* Contact Form */
                <form onSubmit={handleSubmit} className="max-w-lg mx-auto space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      required
                      placeholder="First name"
                      value={state.contactForm.firstName}
                      onChange={(e) => dispatch({ type: 'UPDATE_CONTACT', field: 'firstName', value: e.target.value })}
                      className="bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder:text-gray-500 focus:outline-none focus:border-emerald-500/50 transition-colors"
                    />
                    <input
                      type="text"
                      required
                      placeholder="Last name"
                      value={state.contactForm.lastName}
                      onChange={(e) => dispatch({ type: 'UPDATE_CONTACT', field: 'lastName', value: e.target.value })}
                      className="bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder:text-gray-500 focus:outline-none focus:border-emerald-500/50 transition-colors"
                    />
                  </div>
                  <input
                    type="email"
                    required
                    placeholder="Email"
                    value={state.contactForm.email}
                    onChange={(e) => dispatch({ type: 'UPDATE_CONTACT', field: 'email', value: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder:text-gray-500 focus:outline-none focus:border-emerald-500/50 transition-colors"
                  />
                  <input
                    type="tel"
                    required
                    placeholder="Phone"
                    value={state.contactForm.phone}
                    onChange={(e) => dispatch({ type: 'UPDATE_CONTACT', field: 'phone', value: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder:text-gray-500 focus:outline-none focus:border-emerald-500/50 transition-colors"
                  />
                  <input
                    type="text"
                    placeholder="Service address"
                    value={state.contactForm.address}
                    onChange={(e) => dispatch({ type: 'UPDATE_CONTACT', field: 'address', value: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder:text-gray-500 focus:outline-none focus:border-emerald-500/50 transition-colors"
                  />
                  <div className="flex gap-3">
                    <button
                      type="submit"
                      disabled={submitLead.isPending}
                      className="flex-1 px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-semibold transition-all duration-200 hover:scale-[1.02] hover:shadow-[0_0_24px_rgba(16,185,129,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {submitLead.isPending ? 'Submitting...' : 'Lock In My Plan'}
                    </button>
                    <button
                      type="button"
                      onClick={() => dispatch({ type: 'HIDE_CONTACT_FORM' })}
                      className="px-4 py-3 rounded-xl border border-white/10 text-gray-400 hover:text-white transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                  {submitLead.isError && (
                    <p className="text-red-400 text-sm text-center">
                      Something went wrong. Please try again.
                    </p>
                  )}
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
