'use client';

import { useReducer, useMemo, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useServices } from '@/hooks/useServices';
import { useSubmitLead } from '@/hooks/useLeads';

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

/* ─────────────────────── Main Component ─────────────────────── */

export default function AnnualPlanConfigurator() {
  const [state, dispatch] = useReducer(planReducer, initialState);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const { data: dbServices } = useServices();
  const submitLead = useSubmitLead();

  // Merge Supabase IDs onto static services (match by name slug)
  const services = useMemo(() => {
    if (!dbServices) return STATIC_SERVICES;
    return STATIC_SERVICES.map((s) => {
      const match = dbServices.find(
        (d) =>
          d.name.toLowerCase().replace(/\s+/g, '-').includes(s.id.split('-')[0]) ||
          s.name.toLowerCase().includes(d.name.toLowerCase().split(' ')[0])
      );
      return match ? { ...s, id: match.id } : s;
    });
  }, [dbServices]);

  const selectedServiceCount = useMemo(() => {
    return Object.values(state.selections).filter((seasons) =>
      Object.values(seasons).some(Boolean)
    ).length;
  }, [state.selections]);

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
      entries
        .map((s) => {
          const activeSeas = Object.entries(state.selections[s.id] ?? {})
            .filter(([, v]) => v)
            .map(([k]) => k)
            .join(', ');
          return `${s.name} (${activeSeas})`;
        })
        .join(', ')
    );
  }

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (selectedServiceCount === 0) return;

      const firstEntry = services.find((s) => {
        const seasons = state.selections[s.id];
        return seasons && Object.values(seasons).some(Boolean);
      });

      try {
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
      } catch {
        // submitLead.isError handles the UI
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [services, state, selectedServiceCount, submitLead],
  );

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
          <div
            className="w-16 h-16 mx-auto mb-5 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(34,197,94,0.15)' }}
          >
            <svg className="w-8 h-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">Request Received!</h3>
          <p className="text-gray-400">
            We&apos;ll reach out within 24 hours to discuss your property and provide an exact quote.
          </p>
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
              Toggle seasons for each service you want. We&apos;ll build a custom quote for your property.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {services.map((service, index) => {
              const svcSeasons = state.selections[service.id] ?? {
                spring: false,
                summer: false,
                fall: false,
                winter: false,
              };
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
                      ? '1px solid rgba(255,255,255,0.15)'
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
                      onClick={() =>
                        dispatch({
                          type: 'TOGGLE_ALL_SEASONS',
                          serviceId: service.id,
                          availableSeasons: service.availableSeasons,
                        })
                      }
                      className="px-2.5 py-1 text-xs rounded-full font-medium transition-all duration-200"
                      style={
                        allAvailSelected
                          ? {
                              background: 'rgba(255,255,255,0.15)',
                              color: '#fff',
                              border: '1px solid rgba(255,255,255,0.3)',
                            }
                          : {
                              background: 'transparent',
                              color: '#6b7280',
                              border: '1px solid rgba(255,255,255,0.1)',
                            }
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
                          aria-label={!available ? `${season.label} — not available for ${service.name}` : season.label}
                          onClick={() =>
                            dispatch({
                              type: 'TOGGLE_SERVICE_SEASON',
                              serviceId: service.id,
                              season: season.id,
                            })
                          }
                          className="px-2.5 py-1 text-xs rounded-full font-medium transition-all duration-200"
                          style={
                            !available
                              ? {
                                  background: 'transparent',
                                  color: '#374151',
                                  border: '1px solid rgba(255,255,255,0.05)',
                                  cursor: 'not-allowed',
                                  opacity: 0.4,
                                }
                              : active
                              ? {
                                  backgroundColor: season.color,
                                  color: '#fff',
                                  boxShadow: `0 0 10px ${season.color}60`,
                                  border: `1px solid ${season.color}`,
                                  transform: 'scale(1.05)',
                                }
                              : {
                                  background: 'rgba(255,255,255,0.05)',
                                  color: '#9ca3af',
                                  border: '1px solid rgba(255,255,255,0.1)',
                                }
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
              border:
                selectedServiceCount > 0
                  ? '1px solid rgba(255,255,255,0.12)'
                  : '1px solid rgba(255,255,255,0.07)',
            }}
          >
            <h3 className="text-white font-bold text-lg mb-5 uppercase tracking-wide">Your Service Wishlist</h3>

            {/* Selected services list */}
            <div
              className="border-y py-4 mb-5"
              style={{ borderColor: 'rgba(255,255,255,0.08)' }}
            >
              {(() => {
                const selected = Object.entries(state.selections).filter(([, seasons]) =>
                  Object.values(seasons).some(Boolean)
                );
                if (selected.length === 0) {
                  return (
                    <p className="text-sm text-center py-2" style={{ color: 'rgba(255,255,255,0.30)' }}>
                      Select services on the left to start building your wishlist.
                    </p>
                  );
                }
                return (
                  <div className="space-y-2 py-1">
                    {selected.map(([serviceId, seasons]) => {
                      const activeSeasons = (Object.entries(seasons) as [string, boolean][])
                        .filter(([, active]) => active)
                        .map(([s]) => s.charAt(0).toUpperCase() + s.slice(1));
                      const svc = STATIC_SERVICES.find(s => s.id === serviceId) ?? services.find(s => s.id === serviceId);
                      if (!svc) return null;
                      return (
                        <div key={serviceId} className="flex items-start gap-2 text-sm">
                          <span className="text-base leading-tight">{svc.emoji}</span>
                          <div className="min-w-0">
                            <span className="text-white/80 font-medium">{svc.name}</span>
                            <span className="text-white/40 text-xs ml-1">— {activeSeasons.join(', ')}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>

            {/* Mini Calendar */}
            {selectedServiceCount > 0 && (
              <div className="mb-5">
                <p className="text-xs text-gray-500 mb-2 font-medium uppercase tracking-wide">
                  Your Coverage
                </p>
                <div className="grid grid-cols-4 gap-1">
                  {MONTHS.map((month) => {
                    const active = monthActiveServices[month] ?? [];
                    const season = MONTH_TO_SEASON[month];
                    return (
                      <div
                        key={month}
                        className="rounded-lg p-1.5 text-center transition-colors duration-200"
                        style={{
                          background:
                            active.length > 0
                              ? `${SEASON_COLORS[season]}15`
                              : 'rgba(255,255,255,0.03)',
                          border:
                            active.length > 0
                              ? `1px solid ${SEASON_COLORS[season]}30`
                              : '1px solid rgba(255,255,255,0.05)',
                        }}
                      >
                        <div className="text-xs text-gray-400 font-medium">{month}</div>
                        {active.length > 0 && (
                          <div className="flex justify-center gap-0.5 mt-1 flex-wrap">
                            {active.slice(0, 3).map((svc) => (
                              <span
                                key={svc.color}
                                className="w-1.5 h-1.5 rounded-full"
                                style={{ backgroundColor: svc.color }}
                              />
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
                    className="w-full relative overflow-hidden rounded-xl py-3.5 px-6 font-bold text-white transition-all duration-200"
                    style={{
                      background:
                        selectedServiceCount > 0
                          ? 'linear-gradient(135deg, #f59e0b, #d97706)'
                          : '#1f2937',
                      boxShadow:
                        selectedServiceCount > 0 ? '0 0 28px rgba(245,158,11,0.3)' : 'none',
                      opacity: selectedServiceCount === 0 ? 0.5 : 1,
                      cursor: selectedServiceCount === 0 ? 'not-allowed' : 'pointer',
                    }}
                  >
                    {/* Shimmer overlay */}
                    {selectedServiceCount > 0 && (
                      <motion.div
                        className="absolute inset-0 pointer-events-none"
                        style={{
                          background:
                            'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.15) 50%, transparent 60%)',
                        }}
                        animate={{ x: ['-100%', '200%'] }}
                        transition={{
                          duration: 2.5,
                          repeat: Infinity,
                          repeatDelay: 1.5,
                          ease: 'linear',
                        }}
                      />
                    )}
                    <span className="relative">Get My Custom Quote</span>
                  </button>
                  {!state.showContactForm && (
                    <p className="text-center text-xs mt-2" style={{ color: 'rgba(255,255,255,0.30)' }}>
                      We&apos;ll reach out to discuss your property and get you scheduled.
                    </p>
                  )}
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
                        onChange={(e) =>
                          dispatch({ type: 'UPDATE_CONTACT', field, value: e.target.value })
                        }
                        className="rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-gray-600 focus:outline-none transition-colors"
                        style={{
                          background: 'rgba(255,255,255,0.06)',
                          border: '1px solid rgba(255,255,255,0.1)',
                        }}
                      />
                    ))}
                  </div>
                  <input
                    type="email"
                    required
                    placeholder="Email"
                    value={state.contactForm.email}
                    onChange={(e) =>
                      dispatch({ type: 'UPDATE_CONTACT', field: 'email', value: e.target.value })
                    }
                    className="w-full rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-gray-600 focus:outline-none transition-colors"
                    style={{
                      background: 'rgba(255,255,255,0.06)',
                      border: '1px solid rgba(255,255,255,0.1)',
                    }}
                  />
                  <input
                    type="tel"
                    required
                    placeholder="Phone"
                    value={state.contactForm.phone}
                    onChange={(e) =>
                      dispatch({ type: 'UPDATE_CONTACT', field: 'phone', value: e.target.value })
                    }
                    className="w-full rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-gray-600 focus:outline-none transition-colors"
                    style={{
                      background: 'rgba(255,255,255,0.06)',
                      border: '1px solid rgba(255,255,255,0.1)',
                    }}
                  />
                  <input
                    type="text"
                    required
                    placeholder="Property Address"
                    value={state.contactForm.address}
                    onChange={(e) =>
                      dispatch({ type: 'UPDATE_CONTACT', field: 'address', value: e.target.value })
                    }
                    className="w-full rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-gray-600 focus:outline-none transition-colors"
                    style={{
                      background: 'rgba(255,255,255,0.06)',
                      border: '1px solid rgba(255,255,255,0.1)',
                    }}
                  />
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={submitLead.isPending}
                      className="flex-1 py-3 rounded-xl font-bold text-white text-sm transition-all duration-200 disabled:opacity-50"
                      style={{
                        background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                        boxShadow: '0 0 20px rgba(245,158,11,0.25)',
                      }}
                    >
                      {submitLead.isPending ? 'Submitting\u2026' : 'Get My Custom Quote'}
                    </button>
                    <button
                      type="button"
                      onClick={() => dispatch({ type: 'HIDE_CONTACT_FORM' })}
                      className="px-4 py-3 rounded-xl text-gray-500 hover:text-gray-300 transition-colors text-sm"
                      style={{ border: '1px solid rgba(255,255,255,0.08)' }}
                    >
                      &#x2715;
                    </button>
                  </div>
                  {submitLead.isError && (
                    <p className="text-red-400 text-xs text-center">
                      Something went wrong. Please try again.
                    </p>
                  )}
                </motion.form>
              )}
            </AnimatePresence>

            {/* Trust micro-line */}
            <p className="text-center text-gray-600 text-xs mt-4">
              80+ Madison families &middot; 4.9&#x2605; Google &middot; Fully insured
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
            style={{
              background:
                'linear-gradient(to top, rgba(5,13,7,0.98) 60%, transparent)',
            }}
          >
            <div
              className="rounded-2xl p-4 flex items-center justify-between gap-4"
              style={{
                background: 'rgba(20,30,22,0.95)',
                border: '1px solid rgba(245,158,11,0.2)',
                backdropFilter: 'blur(16px)',
              }}
            >
              <div>
                <div className="text-white font-bold text-base">
                  {selectedServiceCount} service{selectedServiceCount !== 1 ? 's' : ''} selected
                </div>
                <div className="text-amber-400 text-xs font-medium">
                  Ready for a custom quote
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  dispatch({ type: 'SHOW_CONTACT_FORM' });
                  document.getElementById('configurator')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="relative overflow-hidden rounded-xl py-3 px-6 font-bold text-white text-sm flex-shrink-0"
                style={{
                  background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                  boxShadow: '0 0 20px rgba(245,158,11,0.3)',
                }}
              >
                Get My Custom Quote
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
