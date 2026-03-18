'use client';

import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, ArrowLeft, MapPin } from 'lucide-react';
import AddressAutocomplete from '@/components/AddressAutocomplete';
import { getServiceQuestions, type ServiceQuestion } from '@/lib/serviceQuestions';

// ─── Types ───────────────────────────────────────────────────────────────────

interface SmartQuoteFlowProps {
  serviceSlug: string;
  serviceName: string;
  serviceEmoji: string;
  isOpen: boolean;
  onClose: () => void;
}

type Step = 0 | 1 | 2 | 3 | 4 | 5;

interface ContactInfo {
  name: string;
  email: string;
  phone: string;
}

interface FlowState {
  step: Step;
  currentQuestionIndex: number;
  address: string;
  lat: number | null;
  lng: number | null;
  lotSizeSqft: number | null;
  turfAreaSqft: number | null;
  isLookingUpParcel: boolean;
  parcelLookupFailed: boolean;
  manualSqft: string;
  editingSize: boolean;
  selections: Record<string, string>;
  contact: ContactInfo;
  isSubmitting: boolean;
  submitError: string | null;
  selectedSlug: string;
  selectedName: string;
  selectedEmoji: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const ALL_SERVICES = [
  { slug: 'mowing', name: 'Lawn Mowing', emoji: '🌿' },
  { slug: 'fertilization', name: 'Fertilization & Weed Control', emoji: '🌱' },
  { slug: 'aeration', name: 'Aeration & Overseeding', emoji: '🌾' },
  { slug: 'spring-cleanup', name: 'Spring Cleanup', emoji: '🌸' },
  { slug: 'fall-cleanup', name: 'Fall Cleanup', emoji: '🍂' },
  { slug: 'leaf-removal', name: 'Leaf Removal', emoji: '🍁' },
  { slug: 'mulching', name: 'Mulching', emoji: '🪵' },
  { slug: 'gutter-cleaning', name: 'Gutter Cleaning', emoji: '🏠' },
  { slug: 'gutter-guards', name: 'Gutter Guards', emoji: '🛡️' },
  { slug: 'snow-removal', name: 'Snow Removal', emoji: '❄️' },
  { slug: 'herbicide', name: 'Herbicide Treatment', emoji: '🌿' },
  { slug: 'weeding', name: 'Weeding', emoji: '✂️' },
  { slug: 'garden-beds', name: 'Garden Bed Care', emoji: '🌺' },
  { slug: 'pruning', name: 'Tree & Shrub Pruning', emoji: '🌳' },
  { slug: 'hardscaping', name: 'Hardscaping', emoji: '🪨' },
];

const PARTICLES = [
  { left: '8%', top: '20%', size: 3, opacity: 0.25, duration: 5.5, delay: 0 },
  { left: '20%', top: '65%', size: 2, opacity: 0.18, duration: 7.0, delay: 1.2 },
  { left: '35%', top: '30%', size: 4, opacity: 0.22, duration: 4.8, delay: 0.6 },
  { left: '52%', top: '70%', size: 2, opacity: 0.20, duration: 6.5, delay: 1.8 },
  { left: '68%', top: '25%', size: 3, opacity: 0.28, duration: 5.2, delay: 0.3 },
  { left: '80%', top: '55%', size: 2, opacity: 0.18, duration: 6.9, delay: 1.5 },
  { left: '91%', top: '38%', size: 3, opacity: 0.24, duration: 5.7, delay: 0.9 },
  { left: '15%', top: '45%', size: 2, opacity: 0.20, duration: 7.3, delay: 2.1 },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildMessage(
  serviceName: string,
  address: string,
  lotSizeSqft: number | null,
  turfAreaSqft: number | null,
  selections: Record<string, string>,
  questions: ServiceQuestion[],
): string {
  const lines: string[] = [`Quote request for ${serviceName}.`];
  if (address) lines.push(`Property: ${address}`);
  if (lotSizeSqft) {
    lines.push(
      `Lot size: ${lotSizeSqft.toLocaleString()} sq ft | Turf area: ~${(turfAreaSqft ?? 0).toLocaleString()} sq ft`
    );
  }
  for (const q of questions) {
    const selectedValue = selections[q.id];
    if (selectedValue) {
      const option = q.options.find((o) => o.value === selectedValue);
      if (option) lines.push(`${q.question} → ${option.label}`);
    }
  }
  return lines.join('\n');
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function SmartQuoteFlow({
  serviceSlug,
  serviceName,
  serviceEmoji,
  isOpen,
  onClose,
}: SmartQuoteFlowProps) {
  const startStep: Step = serviceSlug ? 1 : 0;

  const initialState: FlowState = {
    step: startStep,
    currentQuestionIndex: 0,
    address: '',
    lat: null,
    lng: null,
    lotSizeSqft: null,
    turfAreaSqft: null,
    isLookingUpParcel: false,
    parcelLookupFailed: false,
    manualSqft: '',
    editingSize: false,
    selections: {},
    contact: { name: '', email: '', phone: '' },
    isSubmitting: false,
    submitError: null,
    selectedSlug: serviceSlug,
    selectedName: serviceName,
    selectedEmoji: serviceEmoji,
  };

  const [state, setState] = useState<FlowState>(initialState);

  // Reset when opened
  useEffect(() => {
    if (isOpen) {
      setState({
        ...initialState,
        selectedSlug: serviceSlug,
        selectedName: serviceName,
        selectedEmoji: serviceEmoji,
        step: serviceSlug ? 1 : 0,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, serviceSlug, serviceName, serviceEmoji]);

  // Lock body scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const activeSlug = state.selectedSlug;
  const activeName = state.selectedName;
  const questions = getServiceQuestions(activeSlug);

  // Progress: steps 1-5 fill the bar (step 0 = 0%)
  const progressPct = state.step === 0 ? 0 : ((state.step - 1) / 4) * 100;

  // ── Address Selection ──────────────────────────────────────────────────────

  const handleAddressSelect = useCallback(
    async (data: {
      full_address: string;
      city: string;
      state: string;
      zip: string;
      coordinates: [number, number];
    }) => {
      const [lng, lat] = data.coordinates;
      setState((s) => ({ ...s, address: data.full_address, isLookingUpParcel: true }));

      try {
        const res = await fetch('/api/parcel-lookup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ lat, lng }),
        });
        const json = (await res.json()) as { lotSizeSqft: number | null };
        const lotSizeSqft = json.lotSizeSqft;
        const turfAreaSqft = lotSizeSqft ? Math.max(lotSizeSqft - 800, 500) : null;
        setState((s) => ({
          ...s,
          lat,
          lng,
          lotSizeSqft,
          turfAreaSqft,
          isLookingUpParcel: false,
          parcelLookupFailed: !lotSizeSqft,
          step: 2,
        }));
      } catch {
        setState((s) => ({
          ...s,
          lat,
          lng,
          isLookingUpParcel: false,
          parcelLookupFailed: true,
          step: 2,
        }));
      }
    },
    []
  );

  // ── Navigation ─────────────────────────────────────────────────────────────

  const goBack = useCallback(() => {
    setState((s) => {
      if (s.step === 3 && s.currentQuestionIndex > 0) {
        return { ...s, currentQuestionIndex: s.currentQuestionIndex - 1 };
      }
      const prevStep = Math.max(s.step - 1, startStep) as Step;
      return { ...s, step: prevStep, currentQuestionIndex: 0 };
    });
  }, [startStep]);

  // ── Question Selection ─────────────────────────────────────────────────────

  const handleOptionSelect = useCallback(
    (questionId: string, value: string) => {
      setState((s) => {
        const newSelections = { ...s.selections, [questionId]: value };
        return { ...s, selections: newSelections };
      });

      setTimeout(() => {
        setState((s) => {
          if (s.currentQuestionIndex < questions.length - 1) {
            return { ...s, currentQuestionIndex: s.currentQuestionIndex + 1 };
          }
          return { ...s, step: 4 };
        });
      }, 300);
    },
    [questions.length]
  );

  // ── Submit ─────────────────────────────────────────────────────────────────

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setState((s) => ({ ...s, isSubmitting: true, submitError: null }));

      const effectiveLot =
        state.lotSizeSqft ??
        (state.manualSqft ? parseInt(state.manualSqft, 10) : null);
      const effectiveTurf = effectiveLot ? Math.max(effectiveLot - 800, 500) : null;

      const message = buildMessage(
        activeName,
        state.address,
        effectiveLot,
        effectiveTurf,
        state.selections,
        questions,
      );

      try {
        const res = await fetch('/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: state.contact.name,
            email: state.contact.email,
            phone: state.contact.phone,
            address: state.address,
            service: activeSlug,
            message,
          }),
        });

        if (!res.ok) throw new Error('Submission failed');

        setState((s) => ({ ...s, isSubmitting: false, step: 5 }));
      } catch {
        setState((s) => ({
          ...s,
          isSubmitting: false,
          submitError: 'Something went wrong. Please call us at (608) 535-6057.',
        }));
      }
    },
    [state, activeName, activeSlug, questions]
  );

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="smart-quote-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[9999] overflow-y-auto"
          style={{ background: '#052e16' }}
        >
          {/* Gradient mesh */}
          <div
            className="fixed inset-0 pointer-events-none"
            style={{
              background:
                'radial-gradient(ellipse 80% 60% at 50% 80%, rgba(34,197,94,0.06) 0%, transparent 70%)',
            }}
          />

          {/* Floating particles */}
          {PARTICLES.map((p, i) => (
            <motion.div
              key={i}
              className="fixed rounded-full pointer-events-none"
              style={{
                width: p.size,
                height: p.size,
                left: p.left,
                top: p.top,
                background: `rgba(34,197,94,${p.opacity})`,
              }}
              animate={{ y: [0, -20, 0], opacity: [p.opacity * 0.5, p.opacity, p.opacity * 0.5] }}
              transition={{ duration: p.duration, repeat: Infinity, delay: p.delay, ease: 'easeInOut' }}
            />
          ))}

          {/* Progress bar */}
          <div className="fixed top-0 left-0 right-0 z-10 h-[2px]" style={{ background: 'rgba(255,255,255,0.06)' }}>
            <motion.div
              className="h-full"
              style={{ background: '#22c55e' }}
              animate={{ width: `${progressPct}%` }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
            />
          </div>

          {/* Close button */}
          <button
            onClick={onClose}
            className="fixed top-4 right-4 z-20 flex items-center justify-center w-9 h-9 rounded-full transition-all duration-200"
            style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.45)' }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = 'white'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.45)'; }}
            aria-label="Close"
          >
            <X size={16} />
          </button>

          {/* Service badge (steps 1-5) */}
          {state.step >= 1 && state.selectedSlug && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="fixed top-4 left-4 z-20 flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold"
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(34,197,94,0.30)',
                color: 'rgba(255,255,255,0.75)',
              }}
            >
              <span>{state.selectedEmoji}</span>
              <span>{state.selectedName}</span>
            </motion.div>
          )}

          {/* Main content */}
          <div className="relative min-h-screen flex flex-col items-center justify-center px-4 py-20">
            <div className="w-full max-w-lg mx-auto">

              {/* Back button (steps 2-4) */}
              {state.step >= 2 && state.step <= 4 && (
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  onClick={goBack}
                  className="flex items-center gap-1.5 text-sm mb-8 transition-colors duration-200"
                  style={{ color: 'rgba(255,255,255,0.35)' }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.75)'; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.35)'; }}
                >
                  <ArrowLeft size={14} />
                  Back
                </motion.button>
              )}

              <AnimatePresence mode="wait">
                <motion.div
                  key={`step-${state.step}-${state.currentQuestionIndex}`}
                  initial={{ opacity: 0, x: 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -40 }}
                  transition={{ duration: 0.25, ease: 'easeInOut' }}
                >
                  {/* ── Step 0: Service Picker ── */}
                  {state.step === 0 && (
                    <div>
                      <h1 className="text-3xl font-bold text-white mb-2">What service are you looking for?</h1>
                      <p className="text-sm mb-8" style={{ color: 'rgba(255,255,255,0.45)' }}>
                        Choose a service and we&apos;ll guide you through a quick quote.
                      </p>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {ALL_SERVICES.map((svc) => (
                          <button
                            key={svc.slug}
                            onClick={() => setState((s) => ({
                              ...s,
                              selectedSlug: svc.slug,
                              selectedName: svc.name,
                              selectedEmoji: svc.emoji,
                              step: 1,
                            }))}
                            className="flex flex-col items-center gap-2 p-4 rounded-xl text-center transition-all duration-200 hover:-translate-y-0.5"
                            style={{
                              background: 'rgba(255,255,255,0.05)',
                              border: '1px solid rgba(255,255,255,0.10)',
                            }}
                            onMouseEnter={(e) => {
                              (e.currentTarget as HTMLButtonElement).style.border = '1px solid rgba(34,197,94,0.40)';
                              (e.currentTarget as HTMLButtonElement).style.background = 'rgba(34,197,94,0.04)';
                            }}
                            onMouseLeave={(e) => {
                              (e.currentTarget as HTMLButtonElement).style.border = '1px solid rgba(255,255,255,0.10)';
                              (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.05)';
                            }}
                          >
                            <span className="text-2xl">{svc.emoji}</span>
                            <span className="text-xs font-semibold text-white leading-tight">{svc.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* ── Step 1: Address ── */}
                  {state.step === 1 && (
                    <div>
                      <h1 className="text-3xl font-bold text-white mb-2">Where&apos;s your property?</h1>
                      <p className="text-sm mb-8" style={{ color: 'rgba(255,255,255,0.45)' }}>
                        We&apos;ll look up your lot size automatically — no manual measuring needed.
                      </p>

                      {state.isLookingUpParcel ? (
                        <div className="flex flex-col items-center gap-6 py-12">
                          <div className="relative">
                            <motion.div
                              className="absolute inset-0 rounded-full"
                              style={{ border: '2px solid rgba(34,197,94,0.3)' }}
                              animate={{ scale: [1, 1.4, 1], opacity: [0.6, 0, 0.6] }}
                              transition={{ duration: 1.8, repeat: Infinity }}
                            />
                            <motion.div
                              className="absolute inset-0 rounded-full"
                              style={{ border: '2px solid rgba(34,197,94,0.2)', margin: '-12px' }}
                              animate={{ scale: [1, 1.6, 1], opacity: [0.4, 0, 0.4] }}
                              transition={{ duration: 1.8, repeat: Infinity, delay: 0.4 }}
                            />
                            <div
                              className="w-14 h-14 rounded-full flex items-center justify-center"
                              style={{ background: 'rgba(34,197,94,0.10)', border: '1px solid rgba(34,197,94,0.30)' }}
                            >
                              <MapPin size={20} style={{ color: '#a7f3d0' }} />
                            </div>
                          </div>
                          <div className="text-center">
                            <p className="text-white font-semibold mb-1">Analyzing your property...</p>
                            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.40)' }}>
                              Fetching Dane County parcel data
                            </p>
                          </div>
                        </div>
                      ) : (
                        <>
                          <AddressAutocomplete
                            onSelect={handleAddressSelect}
                            placeholder="123 Main Street, Madison, WI..."
                          />
                          <button
                            onClick={() => setState((s) => ({ ...s, parcelLookupFailed: true, step: 2 }))}
                            className="mt-4 text-xs transition-colors duration-200"
                            style={{ color: 'rgba(255,255,255,0.30)' }}
                            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.60)'; }}
                            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.30)'; }}
                          >
                            Skip — I&apos;ll enter my size manually
                          </button>
                        </>
                      )}
                    </div>
                  )}

                  {/* ── Step 2: Property Confirmed ── */}
                  {state.step === 2 && (
                    <div>
                      <h1 className="text-3xl font-bold text-white mb-2">
                        {state.parcelLookupFailed ? "Tell us about your property" : "We found your property"}
                      </h1>
                      <p className="text-sm mb-8" style={{ color: 'rgba(255,255,255,0.45)' }}>
                        {state.parcelLookupFailed
                          ? 'Enter your lot size and we\'ll calculate the turf area.'
                          : 'Confirm your details below — or edit if needed.'}
                      </p>

                      <div
                        className="rounded-2xl p-6 mb-6"
                        style={{
                          background: 'rgba(255,255,255,0.05)',
                          border: '1px solid rgba(255,255,255,0.10)',
                        }}
                      >
                        {!state.parcelLookupFailed && state.lotSizeSqft ? (
                          <>
                            <div className="flex items-start gap-3 mb-4">
                              <div
                                className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                                style={{ background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.30)' }}
                              >
                                <Check size={14} style={{ color: '#a7f3d0' }} />
                              </div>
                              <div>
                                <p className="text-white font-semibold text-sm leading-snug">{state.address}</p>
                              </div>
                            </div>

                            {!state.editingSize ? (
                              <>
                                <div className="flex items-center justify-between text-sm mb-1" style={{ color: 'rgba(255,255,255,0.55)' }}>
                                  <span>Lot size</span>
                                  <span className="font-medium text-white">{state.lotSizeSqft.toLocaleString()} sq ft</span>
                                </div>
                                <div className="flex items-center justify-between text-sm mb-4" style={{ color: 'rgba(255,255,255,0.55)' }}>
                                  <span>Est. turf area</span>
                                  <span className="font-medium" style={{ color: '#a7f3d0' }}>~{(state.turfAreaSqft ?? 0).toLocaleString()} sq ft</span>
                                </div>
                                <button
                                  onClick={() => setState((s) => ({ ...s, editingSize: true, manualSqft: String(s.lotSizeSqft ?? '') }))}
                                  className="text-xs transition-colors"
                                  style={{ color: 'rgba(255,255,255,0.30)' }}
                                  onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.60)'; }}
                                  onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.30)'; }}
                                >
                                  Edit size
                                </button>
                              </>
                            ) : (
                              <div className="mt-2">
                                <label className="text-xs mb-1.5 block" style={{ color: 'rgba(255,255,255,0.45)' }}>
                                  Lot size (sq ft)
                                </label>
                                <input
                                  type="number"
                                  value={state.manualSqft}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    const sqft = parseInt(val, 10);
                                    const turf = sqft > 800 ? sqft - 800 : null;
                                    setState((s) => ({ ...s, manualSqft: val, lotSizeSqft: sqft || null, turfAreaSqft: turf }));
                                  }}
                                  className="w-full rounded-xl px-4 py-3 text-sm text-white outline-none"
                                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)' }}
                                  placeholder="e.g. 8400"
                                />
                                {state.manualSqft && parseInt(state.manualSqft, 10) > 800 && (
                                  <p className="text-xs mt-2" style={{ color: 'rgba(255,255,255,0.40)' }}>
                                    Est. turf area: ~{(parseInt(state.manualSqft, 10) - 800).toLocaleString()} sq ft
                                  </p>
                                )}
                              </div>
                            )}
                          </>
                        ) : (
                          <>
                            {state.address && (
                              <div className="flex items-center gap-2 mb-4">
                                <MapPin size={14} style={{ color: 'rgba(255,255,255,0.40)' }} />
                                <p className="text-sm text-white">{state.address}</p>
                              </div>
                            )}
                            <label className="text-xs mb-1.5 block" style={{ color: 'rgba(255,255,255,0.45)' }}>
                              Lot size (sq ft)
                            </label>
                            <input
                              type="number"
                              value={state.manualSqft}
                              onChange={(e) => {
                                const val = e.target.value;
                                const sqft = parseInt(val, 10);
                                setState((s) => ({ ...s, manualSqft: val, lotSizeSqft: sqft || null, turfAreaSqft: sqft > 800 ? sqft - 800 : null }));
                              }}
                              className="w-full rounded-xl px-4 py-3 text-sm text-white outline-none mb-2"
                              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)' }}
                              placeholder="e.g. 8400"
                            />
                            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
                              We&apos;ll subtract ~800 sq ft for your home&apos;s footprint.
                            </p>
                            {state.manualSqft && parseInt(state.manualSqft, 10) > 800 && (
                              <p className="text-xs mt-1" style={{ color: '#a7f3d0' }}>
                                Est. turf area: ~{(parseInt(state.manualSqft, 10) - 800).toLocaleString()} sq ft
                              </p>
                            )}
                          </>
                        )}
                      </div>

                      <button
                        onClick={() => {
                          if (questions.length === 0) {
                            setState((s) => ({ ...s, step: 4 }));
                          } else {
                            setState((s) => ({ ...s, step: 3 }));
                          }
                        }}
                        className="w-full rounded-xl px-6 py-4 text-sm font-bold text-white transition-all duration-200 hover:scale-[1.01]"
                        style={{
                          background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                          boxShadow: '0 0 24px rgba(34,197,94,0.25)',
                        }}
                      >
                        Looks Right — Continue →
                      </button>
                    </div>
                  )}

                  {/* ── Step 3: Service Questions ── */}
                  {state.step === 3 && questions.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ background: 'rgba(167,243,208,0.10)', color: '#a7f3d0' }}>
                          Question {state.currentQuestionIndex + 1} of {questions.length}
                        </span>
                      </div>
                      <h1 className="text-2xl font-bold text-white mb-2">
                        {questions[state.currentQuestionIndex].question}
                      </h1>
                      <p className="text-sm mb-8" style={{ color: 'rgba(255,255,255,0.40)' }}>
                        Select one to continue.
                      </p>

                      <div className={`grid gap-3 ${questions[state.currentQuestionIndex].options.length === 4 ? 'grid-cols-2' : 'grid-cols-2 sm:grid-cols-3'}`}>
                        {questions[state.currentQuestionIndex].options.map((option) => {
                          const isSelected = state.selections[questions[state.currentQuestionIndex].id] === option.value;
                          return (
                            <button
                              key={option.value}
                              onClick={() => handleOptionSelect(questions[state.currentQuestionIndex].id, option.value)}
                              className="flex flex-col items-center gap-2 p-4 rounded-xl text-center transition-all duration-200 hover:-translate-y-0.5"
                              style={{
                                background: isSelected ? 'rgba(34,197,94,0.08)' : 'rgba(255,255,255,0.05)',
                                border: isSelected ? '1px solid rgba(34,197,94,0.50)' : '1px solid rgba(255,255,255,0.10)',
                                boxShadow: isSelected ? '0 0 16px rgba(34,197,94,0.12)' : 'none',
                              }}
                            >
                              <span className="text-2xl">{option.emoji}</span>
                              <span className="text-sm font-bold text-white">{option.label}</span>
                              <span className="text-xs leading-tight" style={{ color: 'rgba(255,255,255,0.40)' }}>{option.desc}</span>
                              {isSelected && (
                                <div
                                  className="w-5 h-5 rounded-full flex items-center justify-center"
                                  style={{ background: '#22c55e' }}
                                >
                                  <Check size={10} className="text-white" />
                                </div>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* ── Step 4: Contact Info ── */}
                  {state.step === 4 && (
                    <div>
                      <h1 className="text-3xl font-bold text-white mb-2">How should we reach you?</h1>
                      <p className="text-sm mb-8" style={{ color: 'rgba(255,255,255,0.45)' }}>
                        We&apos;ll call to discuss your property and get you scheduled.
                      </p>

                      <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Name */}
                        <div>
                          <label className="text-xs mb-1.5 block" style={{ color: 'rgba(255,255,255,0.50)' }}>
                            Full Name *
                          </label>
                          <input
                            type="text"
                            required
                            value={state.contact.name}
                            onChange={(e) => setState((s) => ({ ...s, contact: { ...s.contact, name: e.target.value } }))}
                            className="w-full rounded-xl px-4 py-3.5 text-sm text-white outline-none transition-all"
                            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.10)' }}
                            placeholder="Jane Smith"
                            onFocus={(e) => { e.currentTarget.style.border = '1px solid rgba(34,197,94,0.40)'; }}
                            onBlur={(e) => { e.currentTarget.style.border = '1px solid rgba(255,255,255,0.10)'; }}
                          />
                        </div>

                        {/* Email */}
                        <div>
                          <label className="text-xs mb-1.5 block" style={{ color: 'rgba(255,255,255,0.50)' }}>
                            Email *
                          </label>
                          <input
                            type="email"
                            required
                            value={state.contact.email}
                            onChange={(e) => setState((s) => ({ ...s, contact: { ...s.contact, email: e.target.value } }))}
                            className="w-full rounded-xl px-4 py-3.5 text-sm text-white outline-none transition-all"
                            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.10)' }}
                            placeholder="jane@example.com"
                            onFocus={(e) => { e.currentTarget.style.border = '1px solid rgba(34,197,94,0.40)'; }}
                            onBlur={(e) => { e.currentTarget.style.border = '1px solid rgba(255,255,255,0.10)'; }}
                          />
                        </div>

                        {/* Phone */}
                        <div>
                          <label className="text-xs mb-1.5 block" style={{ color: 'rgba(255,255,255,0.50)' }}>
                            Phone *
                          </label>
                          <input
                            type="tel"
                            required
                            value={state.contact.phone}
                            onChange={(e) => setState((s) => ({ ...s, contact: { ...s.contact, phone: e.target.value } }))}
                            className="w-full rounded-xl px-4 py-3.5 text-sm text-white outline-none transition-all"
                            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.10)' }}
                            placeholder="(608) 555-0100"
                            onFocus={(e) => { e.currentTarget.style.border = '1px solid rgba(34,197,94,0.40)'; }}
                            onBlur={(e) => { e.currentTarget.style.border = '1px solid rgba(255,255,255,0.10)'; }}
                          />
                        </div>

                        {/* Address read-only */}
                        {state.address && (
                          <div
                            className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm"
                            style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}
                          >
                            <MapPin size={14} style={{ color: 'rgba(255,255,255,0.30)', flexShrink: 0 }} />
                            <span style={{ color: 'rgba(255,255,255,0.45)' }}>{state.address}</span>
                          </div>
                        )}

                        {state.submitError && (
                          <p className="text-sm text-red-400" role="alert">{state.submitError}</p>
                        )}

                        <button
                          type="submit"
                          disabled={state.isSubmitting}
                          className="w-full rounded-xl px-6 py-4 text-sm font-bold text-white transition-all duration-200 hover:scale-[1.01] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                          style={{
                            background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                            boxShadow: '0 0 24px rgba(34,197,94,0.25)',
                          }}
                        >
                          {state.isSubmitting ? 'Sending...' : 'Get My Free Quote →'}
                        </button>
                      </form>
                    </div>
                  )}

                  {/* ── Step 5: Confirmation ── */}
                  {state.step === 5 && (
                    <div className="text-center">
                      {/* Animated checkmark */}
                      <motion.div
                        className="flex items-center justify-center mb-8"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 200, damping: 12, delay: 0.1 }}
                      >
                        <div
                          className="w-20 h-20 rounded-full flex items-center justify-center"
                          style={{ background: 'rgba(34,197,94,0.12)', border: '2px solid rgba(34,197,94,0.40)' }}
                        >
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.3, type: 'spring', stiffness: 300 }}
                          >
                            <Check size={32} style={{ color: '#a7f3d0' }} />
                          </motion.div>
                        </div>
                      </motion.div>

                      <h1 className="text-3xl font-bold text-white mb-3">You&apos;re All Set</h1>
                      <p className="text-sm mb-8 max-w-sm mx-auto" style={{ color: 'rgba(255,255,255,0.50)' }}>
                        Our team will review your property details and reach out within the same business day.
                      </p>

                      {/* Summary card */}
                      <div
                        className="rounded-2xl p-6 mb-8 text-left"
                        style={{
                          background: 'rgba(255,255,255,0.05)',
                          border: '1px solid rgba(255,255,255,0.10)',
                        }}
                      >
                        <div className="flex items-center gap-2 mb-4">
                          <span className="text-xl">{state.selectedEmoji}</span>
                          <span className="font-bold text-white">{state.selectedName}</span>
                        </div>

                        {state.address && (
                          <div className="flex items-start gap-2 mb-3 text-sm" style={{ color: 'rgba(255,255,255,0.55)' }}>
                            <MapPin size={14} className="mt-0.5 shrink-0" />
                            <span>{state.address}</span>
                          </div>
                        )}

                        {(state.lotSizeSqft || state.turfAreaSqft) && (
                          <p className="text-sm mb-3" style={{ color: 'rgba(255,255,255,0.45)' }}>
                            Turf area: ~{((state.turfAreaSqft) ?? 0).toLocaleString()} sq ft
                          </p>
                        )}

                        {questions.map((q) => {
                          const val = state.selections[q.id];
                          const option = val ? q.options.find((o) => o.value === val) : null;
                          if (!option) return null;
                          return (
                            <div key={q.id} className="flex items-center justify-between text-sm py-2 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.50)' }}>
                              <span className="truncate pr-4">{q.question}</span>
                              <span className="font-semibold text-white shrink-0">{option.label}</span>
                            </div>
                          );
                        })}
                      </div>

                      <button
                        onClick={onClose}
                        className="text-sm transition-colors duration-200"
                        style={{ color: 'rgba(255,255,255,0.40)' }}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.70)'; }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.40)'; }}
                      >
                        Back to Site
                      </button>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
