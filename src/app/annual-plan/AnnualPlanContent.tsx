'use client';

import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import AnnualPlanConfigurator from '@/components/AnnualPlanConfigurator';
import { WebPageSchema } from '@/components/schemas/WebPageSchema';
import { motion } from 'framer-motion';

const TRUST_ITEMS = [
  { label: '4.9★ Google Rating' },
  { label: '80+ Madison Families' },
  { label: 'Custom Property Quotes' },
  { label: 'Fully Insured' },
  { label: 'No Contracts Required' },
];

// Deterministic particle positions to avoid hydration mismatches
const PARTICLES = [
  { left: '6%',  top: '25%', size: 3, opacity: 0.3, duration: 5.2, delay: 0 },
  { left: '12%', top: '60%', size: 2, opacity: 0.2, duration: 6.8, delay: 1.2 },
  { left: '19%', top: '40%', size: 4, opacity: 0.35, duration: 4.5, delay: 0.5 },
  { left: '25%', top: '70%', size: 2, opacity: 0.2, duration: 7.1, delay: 2.0 },
  { left: '31%', top: '30%', size: 3, opacity: 0.25, duration: 5.8, delay: 0.8 },
  { left: '38%', top: '55%', size: 2, opacity: 0.3, duration: 6.3, delay: 1.5 },
  { left: '44%', top: '20%', size: 5, opacity: 0.2, duration: 4.9, delay: 0.3 },
  { left: '50%', top: '65%', size: 3, opacity: 0.25, duration: 5.5, delay: 1.8 },
  { left: '56%', top: '35%', size: 2, opacity: 0.3, duration: 7.2, delay: 0.6 },
  { left: '63%', top: '75%', size: 4, opacity: 0.2, duration: 4.7, delay: 2.2 },
  { left: '69%', top: '45%', size: 3, opacity: 0.28, duration: 6.0, delay: 1.0 },
  { left: '75%', top: '28%', size: 2, opacity: 0.22, duration: 5.3, delay: 0.4 },
  { left: '81%', top: '58%', size: 3, opacity: 0.3, duration: 6.7, delay: 1.6 },
  { left: '88%', top: '38%', size: 4, opacity: 0.25, duration: 5.1, delay: 0.9 },
  { left: '93%', top: '68%', size: 2, opacity: 0.2, duration: 7.4, delay: 2.4 },
  { left: '97%', top: '22%', size: 3, opacity: 0.28, duration: 4.8, delay: 1.3 },
];

export default function AnnualPlanContent() {
  return (
    <div className="min-h-screen" style={{ background: '#052e16' }}>
      <WebPageSchema
        name="Build Your Custom Annual Lawn Care Plan"
        description="Toggle lawn care services by season, see your price instantly, and lock in an annual plan with TotalGuard Yard Care."
        url="/annual-plan"
      />

      {/* AI/Answer Engine summary */}
      <section className="sr-only" aria-label="Annual Plan Summary">
        <p>
          TotalGuard Yard Care offers customizable annual lawn care plans for Madison, Wisconsin and surrounding
          Dane County communities. Select services by season — spring, summer, fall, and winter. Use the
          interactive configurator to build your service wishlist and submit a request — we&apos;ll call with a
          custom quote built for your exact property.
        </p>
      </section>

      <Navigation />

      {/* ═══ HERO ═══ */}
      <section className="relative overflow-hidden pt-24 pb-16 md:pt-32 md:pb-20">
        {/* Background gradient */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'linear-gradient(160deg, #052e16 0%, #0a3520 40%, #052e16 100%)' }}
        />

        {/* Radial glow from bottom center */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse 80% 60% at 50% 80%, rgba(34,197,94,0.08) 0%, transparent 70%)',
          }}
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

        {/* Floating particles — deterministic positions */}
        {PARTICLES.map((p, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full pointer-events-none"
            style={{
              width: p.size,
              height: p.size,
              left: p.left,
              top: p.top,
              background: `rgba(34,197,94,${p.opacity})`,
            }}
            animate={{
              y: [0, -28, 0],
              opacity: [p.opacity * 0.5, p.opacity, p.opacity * 0.5],
            }}
            transition={{
              duration: p.duration,
              repeat: Infinity,
              delay: p.delay,
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
                Get Your Quote.
              </span>
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              className="text-lg md:text-xl leading-relaxed mb-8 max-w-2xl mx-auto"
              style={{ color: 'rgba(255,255,255,0.55)' }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Tell us what you want. We&apos;ll call with a price built for your exact property.
              Choose your services by season and submit — we handle everything from there.
            </motion.p>

            {/* Trust strip */}
            <motion.div
              className="flex flex-wrap justify-center gap-x-5 gap-y-2 mb-10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.35 }}
            >
              {TRUST_ITEMS.map((item, i) => (
                <span
                  key={i}
                  className="flex items-center gap-1.5 text-sm"
                  style={{ color: 'rgba(255,255,255,0.4)' }}
                >
                  <span className="w-1 h-1 rounded-full" style={{ background: '#22c55e' }} />
                  {item.label}
                </span>
              ))}
            </motion.div>

            {/* Scroll anchor CTA */}
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

      {/* ═══ SEASON GUIDE STRIP ═══ */}
      <section className="pb-8 pt-2" style={{ background: '#052e16' }}>
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto">
            {[
              { emoji: '🌸', label: 'Spring', months: 'Mar–May', color: '#22c55e', glow: '34,197,94' },
              { emoji: '☀️', label: 'Summer', months: 'Jun–Aug', color: '#eab308', glow: '234,179,8' },
              { emoji: '🍂', label: 'Fall',   months: 'Sep–Nov', color: '#f97316', glow: '249,115,22' },
              { emoji: '❄️', label: 'Winter', months: 'Dec–Feb', color: '#38bdf8', glow: '56,189,248' },
            ].map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.6 + i * 0.08 }}
                className="flex items-center gap-3 px-4 py-3 rounded-2xl"
                style={{
                  background: `rgba(${s.glow},0.06)`,
                  border: `1px solid rgba(${s.glow},0.18)`,
                }}
              >
                <span className="text-xl shrink-0">{s.emoji}</span>
                <div>
                  <p className="text-xs font-bold text-white">{s.label}</p>
                  <p className="text-[10px]" style={{ color: s.color }}>{s.months}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CONFIGURATOR ═══ */}
      <section id="configurator" className="pb-32 pt-4" style={{ background: '#052e16' }}>
        <AnnualPlanConfigurator />
      </section>

      <Footer showCloser={false} />
    </div>
  );
}
