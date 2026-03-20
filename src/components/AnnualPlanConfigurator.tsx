'use client';

import { useReducer, useMemo, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X } from 'lucide-react';

/* ─────────────────────── Types & Constants ─────────────────────── */

type Season = 'spring' | 'summer' | 'fall' | 'winter';

const MONTH_TO_SEASON: Record<string, Season> = {
  Jan: 'winter', Feb: 'winter', Mar: 'spring', Apr: 'spring', May: 'spring',
  Jun: 'summer', Jul: 'summer', Aug: 'summer', Sep: 'fall', Oct: 'fall',
  Nov: 'fall', Dec: 'winter',
};
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const SEASON_CHAPTERS: {
  id: Season;
  label: string;
  emoji: string;
  months: string;
  tagline: string;
  color: string;
  dimColor: string;
  glowRgb: string;
  particles: { left: string; top: string; size: number; opacity: number; duration: number; delay: number }[];
}[] = [
  {
    id: 'spring', label: 'Spring', emoji: '🌸', months: 'Mar · Apr · May',
    tagline: 'Wake your lawn up right.',
    color: '#a7f3d0', dimColor: 'rgba(167,243,208,0.12)', glowRgb: '167,243,208',
    particles: [
      { left: '5%', top: '20%', size: 3, opacity: 0.30, duration: 5.5, delay: 0 },
      { left: '15%', top: '65%', size: 2, opacity: 0.20, duration: 7.0, delay: 1.2 },
      { left: '75%', top: '30%', size: 4, opacity: 0.22, duration: 4.8, delay: 0.6 },
      { left: '88%', top: '70%', size: 2, opacity: 0.18, duration: 6.5, delay: 1.9 },
      { left: '50%', top: '15%', size: 3, opacity: 0.25, duration: 5.8, delay: 0.4 },
      { left: '92%', top: '50%', size: 2, opacity: 0.20, duration: 6.2, delay: 2.1 },
    ],
  },
  {
    id: 'summer', label: 'Summer', emoji: '☀️', months: 'Jun · Jul · Aug',
    tagline: 'Keep it lush all season long.',
    color: '#eab308', dimColor: 'rgba(234,179,8,0.12)', glowRgb: '234,179,8',
    particles: [
      { left: '8%', top: '40%', size: 4, opacity: 0.28, duration: 6.0, delay: 0.3 },
      { left: '20%', top: '25%', size: 2, opacity: 0.22, duration: 5.2, delay: 1.5 },
      { left: '80%', top: '55%', size: 3, opacity: 0.25, duration: 7.2, delay: 0.8 },
      { left: '93%', top: '20%', size: 2, opacity: 0.18, duration: 4.9, delay: 2.0 },
      { left: '55%', top: '80%', size: 3, opacity: 0.20, duration: 6.4, delay: 0.5 },
      { left: '40%', top: '10%', size: 2, opacity: 0.24, duration: 5.7, delay: 1.8 },
    ],
  },
  {
    id: 'fall', label: 'Fall', emoji: '🍂', months: 'Sep · Oct · Nov',
    tagline: 'Prep for the season ahead.',
    color: '#f97316', dimColor: 'rgba(249,115,22,0.12)', glowRgb: '249,115,22',
    particles: [
      { left: '10%', top: '30%', size: 3, opacity: 0.28, duration: 5.3, delay: 0.2 },
      { left: '25%', top: '70%', size: 2, opacity: 0.20, duration: 6.8, delay: 1.4 },
      { left: '70%', top: '25%', size: 4, opacity: 0.22, duration: 5.0, delay: 0.7 },
      { left: '85%', top: '65%', size: 2, opacity: 0.18, duration: 7.1, delay: 2.2 },
      { left: '45%', top: '50%', size: 3, opacity: 0.25, duration: 6.1, delay: 0.9 },
      { left: '60%', top: '85%', size: 2, opacity: 0.20, duration: 5.6, delay: 1.7 },
    ],
  },
  {
    id: 'winter', label: 'Winter', emoji: '❄️', months: 'Dec · Jan · Feb',
    tagline: 'Stay clear all winter.',
    color: '#38bdf8', dimColor: 'rgba(56,189,248,0.12)', glowRgb: '56,189,248',
    particles: [
      { left: '7%', top: '35%', size: 3, opacity: 0.28, duration: 6.3, delay: 0.1 },
      { left: '18%', top: '60%', size: 2, opacity: 0.22, duration: 5.1, delay: 1.6 },
      { left: '78%', top: '40%', size: 4, opacity: 0.20, duration: 7.4, delay: 0.5 },
      { left: '90%', top: '75%', size: 2, opacity: 0.18, duration: 4.7, delay: 2.3 },
      { left: '48%', top: '20%', size: 3, opacity: 0.25, duration: 5.9, delay: 0.8 },
      { left: '35%', top: '85%', size: 2, opacity: 0.20, duration: 6.6, delay: 1.9 },
    ],
  },
];

const STATIC_SERVICES: {
  id: string;
  name: string;
  desc: string;
  emoji: string;
  availableSeasons: Season[];
}[] = [
  { id: 'mowing',          name: 'Lawn Mowing',                 emoji: '🌿', desc: 'Weekly or bi-weekly cuts, edging & trimming.',      availableSeasons: ['spring','summer','fall'] },
  { id: 'fertilization',   name: 'Fertilization & Weed Control',emoji: '🌱', desc: 'Custom treatment for a thick, weed-free lawn.',    availableSeasons: ['spring','summer','fall'] },
  { id: 'herbicide',       name: 'Herbicide Treatment',         emoji: '🧪', desc: 'Targeted weed & pest spray with 7-14 day results.', availableSeasons: ['spring','summer','fall'] },
  { id: 'aeration',        name: 'Aeration & Overseeding',      emoji: '🌾', desc: 'Core aeration + seed for a dense, healthy lawn.',   availableSeasons: ['spring','fall'] },
  { id: 'spring-cleanup',  name: 'Spring Cleanup',              emoji: '🌸', desc: 'Full property reset — debris, beds, edging.',       availableSeasons: ['spring'] },
  { id: 'fall-cleanup',    name: 'Fall Cleanup',                emoji: '🍂', desc: 'Leaf removal, bed clearing, and winter prep.',      availableSeasons: ['fall'] },
  { id: 'leaf-removal',    name: 'Leaf Removal',                emoji: '🍁', desc: 'Full property cleared and hauled. Zero left behind.', availableSeasons: ['fall'] },
  { id: 'mulching',        name: 'Mulching',                    emoji: '🪵', desc: 'Fresh mulch for garden beds and trees.',            availableSeasons: ['spring','fall'] },
  { id: 'weeding',         name: 'Weeding',                     emoji: '🌻', desc: 'Hand-pulled, roots removed. Chemical-free option.', availableSeasons: ['spring','summer','fall'] },
  { id: 'garden-beds',     name: 'Garden Beds',                 emoji: '🌺', desc: 'Edging, weeding, seasonal planting & maintenance.', availableSeasons: ['spring','summer','fall'] },
  { id: 'pruning',         name: 'Bush Trimming & Pruning',     emoji: '✂️', desc: 'Shrubs shaped, cleaned, debris removed.',           availableSeasons: ['spring','summer','fall'] },
  { id: 'snow-removal',    name: 'Snow Removal',                emoji: '❄️', desc: 'Driveway, walkway, and parking area snow & ice.',   availableSeasons: ['winter'] },
  { id: 'salting',          name: 'Salting & Ice Management',    emoji: '🧂', desc: 'Sidewalk, driveway & entry salt application.',     availableSeasons: ['winter'] },
  { id: 'gutter-cleaning', name: 'Gutter Cleaning',             emoji: '🏠', desc: 'Full gutter flush and downspout clear.',            availableSeasons: ['spring','fall'] },
  { id: 'gutter-guards',   name: 'Gutter Guards',               emoji: '🛡️', desc: 'Micro-mesh guard installation with warranty.',      availableSeasons: ['spring','summer','fall'] },
];

/* ─────────────────────── State ─────────────────────── */

interface PlanState {
  selections: Record<string, Record<Season, boolean>>;
  contactForm: { firstName: string; lastName: string; email: string; phone: string; address: string };
  showContactForm: boolean;
}

type PlanAction =
  | { type: 'TOGGLE_SERVICE_SEASON'; serviceId: string; season: Season }
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

/* ─────────────────────── Service Card ─────────────────────── */

function ServiceCard({
  service,
  season,
  isSelected,
  seasonColor,
  seasonGlowRgb,
  onToggle,
}: {
  service: typeof STATIC_SERVICES[0];
  season: Season;
  isSelected: boolean;
  seasonColor: string;
  seasonGlowRgb: string;
  onToggle: () => void;
}) {
  return (
    <motion.button
      onClick={onToggle}
      whileHover={{ y: -3 }}
      whileTap={{ scale: 0.97 }}
      className="w-full text-left rounded-2xl p-5 transition-all duration-300 relative overflow-hidden"
      style={{
        background: isSelected ? `rgba(${seasonGlowRgb},0.08)` : 'rgba(255,255,255,0.05)',
        border: isSelected ? `1px solid rgba(${seasonGlowRgb},0.50)` : '1px solid rgba(255,255,255,0.10)',
        boxShadow: isSelected ? `0 0 28px rgba(${seasonGlowRgb},0.15)` : 'none',
      }}
    >
      {/* Selected badge */}
      <AnimatePresence>
        {isSelected && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            className="absolute top-3 right-3 w-6 h-6 rounded-full flex items-center justify-center"
            style={{ background: seasonColor }}
          >
            <Check size={12} className="text-white" />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-start gap-3">
        <span className="text-2xl shrink-0">{service.emoji}</span>
        <div>
          <p className="font-bold text-sm text-white mb-0.5 pr-6">{service.name}</p>
          <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.40)' }}>
            {service.desc}
          </p>
        </div>
      </div>

      {/* Season tag */}
      <div className="mt-3">
        <span
          className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full"
          style={{
            background: isSelected ? `rgba(${seasonGlowRgb},0.15)` : 'rgba(255,255,255,0.05)',
            color: isSelected ? seasonColor : 'rgba(255,255,255,0.35)',
          }}
        >
          {isSelected ? '✓ Added' : '+ Add'}
        </span>
      </div>
    </motion.button>
  );
}

/* ─────────────────────── Main Component ─────────────────────── */

export default function AnnualPlanConfigurator() {
  const [state, dispatch] = useReducer(planReducer, initialState);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const selectedServiceCount = useMemo(() => {
    return Object.values(state.selections).filter((seasons) =>
      Object.values(seasons).some(Boolean)
    ).length;
  }, [state.selections]);

  // Build selected services list for display
  const selectedBySeasonList = useMemo(() => {
    return SEASON_CHAPTERS.map((chapter) => {
      const services = STATIC_SERVICES.filter((svc) =>
        svc.availableSeasons.includes(chapter.id) &&
        state.selections[svc.id]?.[chapter.id]
      );
      return { chapter, services };
    }).filter((s) => s.services.length > 0);
  }, [state.selections]);

  // Month calendar dots
  const monthDots = useMemo(() => {
    const result: Record<string, { color: string }[]> = {};
    for (const month of MONTHS) {
      result[month] = [];
      const season = MONTH_TO_SEASON[month];
      const chapter = SEASON_CHAPTERS.find((c) => c.id === season);
      if (!chapter) continue;
      const hasService = STATIC_SERVICES.some(
        (svc) => svc.availableSeasons.includes(season) && state.selections[svc.id]?.[season]
      );
      if (hasService) result[month].push({ color: chapter.color });
    }
    return result;
  }, [state.selections]);

  function buildNotes(): string {
    const lines = ['Annual Plan Wishlist:'];
    for (const { chapter, services } of selectedBySeasonList) {
      lines.push(`${chapter.label}: ${services.map((s) => s.name).join(', ')}`);
    }
    return lines.join('\n');
  }

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (selectedServiceCount === 0) return;

      setIsSubmitting(true);
      setSubmitError(null);

      const firstEntry = STATIC_SERVICES.find((s) => {
        const seasons = state.selections[s.id];
        return seasons && Object.values(seasons).some(Boolean);
      });

      try {
        const res = await fetch('/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: `${state.contactForm.firstName} ${state.contactForm.lastName}`.trim(),
            email: state.contactForm.email,
            phone: state.contactForm.phone,
            address: state.contactForm.address,
            service: firstEntry?.id ?? '',
            message: buildNotes(),
          }),
        });
        if (!res.ok) throw new Error('Submission failed');
        setSubmitSuccess(true);
      } catch {
        setSubmitError('Something went wrong. Please call us at (608) 535-6057.');
      } finally {
        setIsSubmitting(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [state, selectedServiceCount]
  );

  /* ─── Success State ─── */
  if (submitSuccess) {
    return (
      <div className="flex flex-col items-center justify-center py-32 px-4 text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          className="rounded-3xl p-12 max-w-md mx-auto"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(34,197,94,0.3)' }}
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 300, damping: 15 }}
            className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.35)' }}
          >
            <Check size={32} style={{ color: '#a7f3d0' }} />
          </motion.div>
          <h3 className="text-3xl font-bold text-white mb-3">Plan Received!</h3>
          <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.50)' }}>
            Our team will review your wishlist and reach out within the same business day with a price built for your exact property.
          </p>
        </motion.div>
      </div>
    );
  }

  /* ─── Main Layout ─── */
  return (
    <div id="configurator" className="max-w-7xl mx-auto px-4 sm:px-6">
      <div className="lg:grid lg:grid-cols-[1fr_360px] lg:gap-12 xl:gap-16">

        {/* ═══ LEFT: Season Chapters ═══ */}
        <div className="space-y-2 pb-16">

          {SEASON_CHAPTERS.map((chapter, chapterIdx) => {
            const chapterServices = STATIC_SERVICES.filter((s) =>
              s.availableSeasons.includes(chapter.id)
            );

            return (
              <motion.div
                key={chapter.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.5, delay: chapterIdx * 0.1 }}
                className="relative rounded-3xl overflow-hidden"
                style={{
                  background: 'rgba(255,255,255,0.02)',
                  border: `1px solid rgba(${chapter.glowRgb},0.15)`,
                }}
              >
                {/* Season background glow */}
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background: `radial-gradient(ellipse 70% 50% at 50% 100%, rgba(${chapter.glowRgb},0.07) 0%, transparent 70%)`,
                  }}
                />

                {/* Floating particles */}
                {chapter.particles.map((p, i) => (
                  <motion.div
                    key={i}
                    className="absolute rounded-full pointer-events-none"
                    style={{
                      width: p.size,
                      height: p.size,
                      left: p.left,
                      top: p.top,
                      background: `rgba(${chapter.glowRgb},${p.opacity})`,
                    }}
                    animate={{ y: [0, -16, 0], opacity: [p.opacity * 0.5, p.opacity, p.opacity * 0.5] }}
                    transition={{ duration: p.duration, repeat: Infinity, delay: p.delay, ease: 'easeInOut' }}
                  />
                ))}

                <div className="relative z-10 p-6 md:p-8">
                  {/* Season header */}
                  <div className="flex items-center gap-4 mb-6">
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0"
                      style={{ background: chapter.dimColor, border: `1px solid rgba(${chapter.glowRgb},0.25)` }}
                    >
                      {chapter.emoji}
                    </div>
                    <div>
                      <div className="flex items-center gap-3">
                        <h2 className="text-xl font-bold text-white">{chapter.label}</h2>
                        <span
                          className="text-xs font-semibold px-2.5 py-0.5 rounded-full"
                          style={{ background: chapter.dimColor, color: chapter.color }}
                        >
                          {chapter.months}
                        </span>
                      </div>
                      <p className="text-sm mt-0.5" style={{ color: 'rgba(255,255,255,0.40)' }}>
                        {chapter.tagline}
                      </p>
                    </div>
                  </div>

                  {/* Service cards */}
                  <div className={`grid gap-3 ${chapterServices.length === 1 ? 'grid-cols-1 max-w-sm' : 'grid-cols-1 sm:grid-cols-2'}`}>
                    {chapterServices.map((service, svcIdx) => (
                      <motion.div
                        key={service.id}
                        initial={{ opacity: 0, y: 16 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: '-40px' }}
                        transition={{ duration: 0.35, delay: svcIdx * 0.07 }}
                      >
                        <ServiceCard
                          service={service}
                          season={chapter.id}
                          isSelected={!!state.selections[service.id]?.[chapter.id]}
                          seasonColor={chapter.color}
                          seasonGlowRgb={chapter.glowRgb}
                          onToggle={() =>
                            dispatch({ type: 'TOGGLE_SERVICE_SEASON', serviceId: service.id, season: chapter.id })
                          }
                        />
                      </motion.div>
                    ))}
                  </div>

                  {/* Chapter divider accent */}
                  <div
                    className="absolute bottom-0 left-0 right-0 h-[1px]"
                    style={{ background: `linear-gradient(90deg, transparent, rgba(${chapter.glowRgb},0.25), transparent)` }}
                  />
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* ═══ RIGHT: Sticky Plan Panel ═══ */}
        <div className="hidden lg:block">
          <div
            ref={panelRef}
            className="sticky top-28 rounded-3xl overflow-hidden"
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.10)',
              maxHeight: 'calc(100vh - 120px)',
              overflowY: 'auto',
            }}
          >
            {/* Panel header */}
            <div className="px-6 pt-6 pb-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <p className="text-xs font-bold tracking-widest uppercase mb-1" style={{ color: 'rgba(255,255,255,0.30)' }}>
                Your Plan
              </p>
              <h3 className="text-lg font-bold text-white">
                {selectedServiceCount === 0
                  ? 'Build Your Year'
                  : `${selectedServiceCount} Service${selectedServiceCount !== 1 ? 's' : ''} Selected`}
              </h3>
            </div>

            <div className="px-6 py-5">
              {/* Empty state */}
              <AnimatePresence mode="wait">
                {selectedServiceCount === 0 && (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-center py-8"
                  >
                    <div className="text-4xl mb-3">🌿</div>
                    <p className="text-sm" style={{ color: 'rgba(255,255,255,0.30)' }}>
                      Select services on the left to start building your plan.
                    </p>
                  </motion.div>
                )}

                {/* Selected services list */}
                {selectedServiceCount > 0 && (
                  <motion.div
                    key="selected"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-4 mb-5"
                  >
                    {selectedBySeasonList.map(({ chapter, services: svcs }) => (
                      <div key={chapter.id}>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-base">{chapter.emoji}</span>
                          <span className="text-xs font-bold uppercase tracking-wider" style={{ color: chapter.color }}>
                            {chapter.label}
                          </span>
                        </div>
                        <div className="space-y-1 pl-6">
                          {svcs.map((svc) => (
                            <div key={svc.id} className="flex items-center justify-between">
                              <span className="text-sm text-white">{svc.name}</span>
                              <button
                                onClick={() =>
                                  dispatch({ type: 'TOGGLE_SERVICE_SEASON', serviceId: svc.id, season: chapter.id })
                                }
                                className="p-0.5 rounded transition-colors hover:text-white"
                                style={{ color: 'rgba(255,255,255,0.25)' }}
                                aria-label={`Remove ${svc.name}`}
                              >
                                <X size={12} />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* 12-Month Calendar */}
              <div
                className="rounded-2xl p-4 mb-5"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.10)' }}
              >
                <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'rgba(255,255,255,0.30)' }}>
                  Your Coverage
                </p>
                <div className="grid grid-cols-4 gap-2">
                  {MONTHS.map((month) => {
                    const dots = monthDots[month] ?? [];
                    const hasCoverage = dots.length > 0;
                    return (
                      <div
                        key={month}
                        className="flex flex-col items-center gap-1 py-2 px-1 rounded-xl transition-all duration-300"
                        style={{
                          background: hasCoverage ? `rgba(${SEASON_CHAPTERS.find(c => c.id === MONTH_TO_SEASON[month])?.glowRgb ?? '255,255,255'},0.06)` : 'transparent',
                        }}
                      >
                        <span className="text-[10px] font-medium" style={{ color: hasCoverage ? 'rgba(255,255,255,0.70)' : 'rgba(255,255,255,0.25)' }}>
                          {month}
                        </span>
                        <div className="flex gap-0.5 flex-wrap justify-center min-h-[8px]">
                          {dots.map((dot, i) => (
                            <motion.div
                              key={`${month}-dot-${i}`}
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              exit={{ scale: 0 }}
                              className="w-1.5 h-1.5 rounded-full"
                              style={{ background: dot.color }}
                            />
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* CTA / Contact Form */}
              <AnimatePresence mode="wait">
                {!state.showContactForm ? (
                  <motion.div
                    key="cta"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                  >
                    <button
                      onClick={() => {
                        if (selectedServiceCount > 0) dispatch({ type: 'SHOW_CONTACT_FORM' });
                      }}
                      disabled={selectedServiceCount === 0}
                      className="w-full py-3.5 rounded-xl font-bold text-sm text-white transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed hover:scale-[1.02] hover:shadow-lg"
                      style={{
                        background: selectedServiceCount > 0
                          ? 'linear-gradient(135deg, #22c55e, #16a34a)'
                          : 'rgba(255,255,255,0.08)',
                        boxShadow: selectedServiceCount > 0 ? '0 0 24px rgba(34,197,94,0.30)' : 'none',
                      }}
                    >
                      Get My Custom Quote →
                    </button>
                    {selectedServiceCount === 0 && (
                      <p className="text-center text-xs mt-2" style={{ color: 'rgba(255,255,255,0.25)' }}>
                        Add services to continue
                      </p>
                    )}
                    {selectedServiceCount > 0 && (
                      <p className="text-center text-xs mt-3" style={{ color: 'rgba(255,255,255,0.30)' }}>
                        We&apos;ll reach out to discuss your property and get you scheduled.
                      </p>
                    )}
                  </motion.div>
                ) : (
                  <motion.form
                    key="form"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    onSubmit={handleSubmit}
                    className="space-y-3"
                  >
                    <div className="grid grid-cols-2 gap-2">
                      {(['firstName', 'lastName'] as const).map((field) => (
                        <input
                          key={field}
                          type="text"
                          required
                          value={state.contactForm[field]}
                          onChange={(e) => dispatch({ type: 'UPDATE_CONTACT', field, value: e.target.value })}
                          placeholder={field === 'firstName' ? 'First Name' : 'Last Name'}
                          className="w-full rounded-xl px-3 py-3 text-sm text-white outline-none transition-all"
                          style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)' }}
                          onFocus={(e) => { e.currentTarget.style.border = '1px solid rgba(34,197,94,0.40)'; }}
                          onBlur={(e) => { e.currentTarget.style.border = '1px solid rgba(255,255,255,0.10)'; }}
                        />
                      ))}
                    </div>
                    {(['email', 'phone', 'address'] as const).map((field) => (
                      <input
                        key={field}
                        type={field === 'email' ? 'email' : field === 'phone' ? 'tel' : 'text'}
                        required
                        value={state.contactForm[field]}
                        onChange={(e) => dispatch({ type: 'UPDATE_CONTACT', field, value: e.target.value })}
                        placeholder={field === 'email' ? 'Email' : field === 'phone' ? 'Phone' : 'Property Address'}
                        className="w-full rounded-xl px-3 py-3 text-sm text-white outline-none transition-all"
                        style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)' }}
                        onFocus={(e) => { e.currentTarget.style.border = '1px solid rgba(34,197,94,0.40)'; }}
                        onBlur={(e) => { e.currentTarget.style.border = '1px solid rgba(255,255,255,0.10)'; }}
                      />
                    ))}

                    {submitError && (
                      <p className="text-red-400 text-xs text-center" role="alert">{submitError}</p>
                    )}

                    <div className="flex gap-2 pt-1">
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex-1 py-3 rounded-xl font-bold text-white text-sm transition-all duration-200 disabled:opacity-50 hover:scale-[1.02]"
                        style={{
                          background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                          boxShadow: '0 0 20px rgba(34,197,94,0.25)',
                        }}
                      >
                        {isSubmitting ? 'Sending...' : 'Get My Custom Quote'}
                      </button>
                      <button
                        type="button"
                        onClick={() => dispatch({ type: 'HIDE_CONTACT_FORM' })}
                        className="px-4 py-3 rounded-xl transition-colors text-sm hover:text-white"
                        style={{ border: '1px solid rgba(255,255,255,0.10)', color: 'rgba(255,255,255,0.40)' }}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </motion.form>
                )}
              </AnimatePresence>

              {/* Trust strip */}
              <div className="flex items-center justify-center gap-3 mt-5 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                {['80+ Madison families', '4.9★ Google', 'Fully insured'].map((item) => (
                  <span key={item} className="text-[10px]" style={{ color: 'rgba(255,255,255,0.25)' }}>
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ MOBILE: Floating Plan Bar ═══ */}
      <AnimatePresence>
        {selectedServiceCount > 0 && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed bottom-0 left-0 right-0 z-50 lg:hidden px-4 pb-safe"
          >
            <div
              className="rounded-2xl p-4 mb-4 flex items-center justify-between gap-4"
              style={{
                background: 'rgba(5,46,22,0.95)',
                border: '1px solid rgba(255,255,255,0.12)',
                backdropFilter: 'blur(16px)',
                boxShadow: '0 -8px 40px rgba(0,0,0,0.5)',
              }}
            >
              <div>
                <p className="text-xs font-semibold text-white">
                  {selectedServiceCount} service{selectedServiceCount !== 1 ? 's' : ''} selected
                </p>
                <p className="text-xs" style={{ color: 'rgba(255,255,255,0.40)' }}>
                  We&apos;ll build your custom quote
                </p>
              </div>
              <button
                onClick={() => dispatch({ type: 'SHOW_CONTACT_FORM' })}
                className="shrink-0 rounded-xl px-5 py-2.5 text-sm font-bold text-white"
                style={{
                  background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                  boxShadow: '0 0 20px rgba(34,197,94,0.30)',
                }}
              >
                Get Quote →
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile contact form sheet */}
      <AnimatePresence>
        {state.showContactForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-end justify-center lg:hidden"
            style={{ background: 'rgba(0,0,0,0.80)' }}
            onClick={(e) => { if (e.target === e.currentTarget) dispatch({ type: 'HIDE_CONTACT_FORM' }); }}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="w-full rounded-t-3xl p-6"
              style={{ background: '#052e16', border: '1px solid rgba(255,255,255,0.10)' }}
            >
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="text-lg font-bold text-white">Get Your Quote</h3>
                  <p className="text-xs" style={{ color: 'rgba(255,255,255,0.40)' }}>
                    {selectedServiceCount} service{selectedServiceCount !== 1 ? 's' : ''} selected
                  </p>
                </div>
                <button
                  onClick={() => dispatch({ type: 'HIDE_CONTACT_FORM' })}
                  className="p-2 rounded-full"
                  style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.50)' }}
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  {(['firstName', 'lastName'] as const).map((field) => (
                    <input
                      key={field}
                      type="text"
                      required
                      value={state.contactForm[field]}
                      onChange={(e) => dispatch({ type: 'UPDATE_CONTACT', field, value: e.target.value })}
                      placeholder={field === 'firstName' ? 'First' : 'Last'}
                      className="w-full rounded-xl px-3 py-3 text-sm text-white outline-none"
                      style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)' }}
                    />
                  ))}
                </div>
                {(['email', 'phone', 'address'] as const).map((field) => (
                  <input
                    key={field}
                    type={field === 'email' ? 'email' : field === 'phone' ? 'tel' : 'text'}
                    required
                    value={state.contactForm[field]}
                    onChange={(e) => dispatch({ type: 'UPDATE_CONTACT', field, value: e.target.value })}
                    placeholder={field === 'email' ? 'Email' : field === 'phone' ? 'Phone' : 'Property Address'}
                    className="w-full rounded-xl px-3 py-3 text-sm text-white outline-none"
                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)' }}
                  />
                ))}
                {submitError && (
                  <p className="text-red-400 text-xs text-center" role="alert">{submitError}</p>
                )}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 rounded-xl font-bold text-sm text-white disabled:opacity-50"
                  style={{
                    background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                    boxShadow: '0 0 24px rgba(34,197,94,0.30)',
                  }}
                >
                  {isSubmitting ? 'Sending...' : 'Get My Custom Quote →'}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
