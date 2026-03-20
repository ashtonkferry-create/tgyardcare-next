'use client';

import { Check, X, Shield, Clock, Users, FileText, Star, Undo2 } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { AmbientParticles } from '@/components/AmbientParticles';
import { useScrollReveal } from '@/hooks/useScrollReveal';

const rows = [
  { feature: 'Response Time', icon: Clock, us: '24 hours', them: '3–5 days' },
  { feature: 'Same Crew', icon: Users, us: 'Every visit', them: 'Random each time' },
  { feature: 'Insurance', icon: Shield, us: '$1M liability', them: 'Often none' },
  { feature: 'Written Quotes', icon: FileText, us: 'Always, before work starts', them: 'Verbal or none' },
  { feature: 'Quality Walk', icon: Star, us: 'After every job', them: 'Never' },
  { feature: 'Satisfaction Guarantee', icon: Undo2, us: '100% or free return visit', them: 'Limited or none' },
];

export function ComparisonTable() {
  const header = useScrollReveal({ once: true, margin: '-60px', amount: 0.3 });
  const table = useScrollReveal({ once: true, margin: '-40px', amount: 0.1 });
  const cta = useScrollReveal({ once: true, margin: '-40px', amount: 0.5 });

  return (
    <section className="relative py-16 md:py-24 overflow-hidden">
      {/* Green cinematic background */}
      <div className="absolute inset-0 bg-gradient-to-b from-green-950 via-[#0a3520] to-green-950" />

      {/* Subtle grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      {/* Ambient glow — pulsing opacity */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full blur-[120px] bg-emerald-500/[0.15] pointer-events-none"
        animate={{ opacity: [0.15, 0.28, 0.15] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Season-adaptive particles */}
      <AmbientParticles density="sparse" />

      <div className="relative container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header — blur-fade reveal on scroll */}
          <motion.div
            ref={header.ref}
            className="text-center mb-12"
            initial={{ opacity: 0, y: 30, filter: 'blur(12px)' }}
            animate={
              header.isInView
                ? { opacity: 1, y: 0, filter: 'blur(0px)' }
                : { opacity: 0, y: 30, filter: 'blur(12px)' }
            }
            transition={{ duration: 0.7, ease: [0.25, 0.4, 0.25, 1] }}
          >
            <p className="text-white/60 text-sm font-medium tracking-widest uppercase mb-3">
              Why TotalGuard
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Not All Yard Care Is{' '}
              <span className="comparison-shimmer-text text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-emerald-200 to-emerald-400">
                Created Equal
              </span>
            </h2>
            <p className="text-white/50 text-base max-w-xl mx-auto">
              See why 500+ Madison homeowners trust TotalGuard over the competition.
            </p>
          </motion.div>

          {/* Table — staggered row reveals */}
          <div ref={table.ref} className="rounded-xl border border-white/[0.06] overflow-hidden bg-white/[0.02] backdrop-blur-sm">
            {/* Table header */}
            <motion.div
              className="grid grid-cols-3 border-b border-white/[0.06]"
              initial={{ opacity: 0, x: -20 }}
              animate={
                table.isInView
                  ? { opacity: 1, x: 0 }
                  : { opacity: 0, x: -20 }
              }
              transition={{ duration: 0.5, ease: 'easeOut' }}
            >
              <div className="px-4 md:px-6 py-4 text-white/40 text-xs font-medium uppercase tracking-wider">
                Feature
              </div>
              <div className="px-4 md:px-6 py-4 text-center">
                <span className="text-emerald-200 text-xs md:text-sm font-bold uppercase tracking-wider">
                  TotalGuard
                </span>
              </div>
              <div className="px-4 md:px-6 py-4 text-center text-white/30 text-xs md:text-sm font-medium uppercase tracking-wider">
                Typical Company
              </div>
            </motion.div>

            {/* Table rows — staggered slide-in from left */}
            {rows.map((row, i) => {
              const Icon = row.icon;
              return (
                <motion.div
                  key={row.feature}
                  className={`grid grid-cols-3 border-b border-white/[0.04] last:border-b-0 ${
                    i % 2 === 0 ? 'bg-white/[0.01]' : ''
                  } transition-colors duration-200`}
                  initial={{ opacity: 0, x: -30 }}
                  animate={
                    table.isInView
                      ? { opacity: 1, x: 0 }
                      : { opacity: 0, x: -30 }
                  }
                  transition={{
                    duration: 0.5,
                    delay: 0.08 * (i + 1),
                    ease: [0.25, 0.4, 0.25, 1],
                  }}
                  whileHover={{
                    scale: 1.01,
                    backgroundColor: 'rgba(255, 255, 255, 0.04)',
                    boxShadow: '0 0 16px rgba(16, 185, 129, 0.12), inset 0 0 0 1px rgba(16, 185, 129, 0.15)',
                    transition: { duration: 0.2 },
                  }}
                >
                  {/* Feature name */}
                  <div className="flex items-center gap-2.5 px-4 md:px-6 py-4">
                    <Icon className="w-4 h-4 text-white/35 flex-shrink-0 hidden sm:block" />
                    <span className="text-white/80 text-sm font-medium">{row.feature}</span>
                  </div>

                  {/* TotalGuard value */}
                  <div className="flex items-center justify-center gap-2 px-3 md:px-6 py-4">
                    <Check className="w-4 h-4 text-emerald-300 flex-shrink-0" />
                    <span className="text-white/90 text-xs md:text-sm font-medium">{row.us}</span>
                  </div>

                  {/* Competitor value */}
                  <div className="flex items-center justify-center gap-2 px-3 md:px-6 py-4">
                    <X className="w-3.5 h-3.5 text-red-400/60 flex-shrink-0" />
                    <span className="text-white/30 text-xs md:text-sm">{row.them}</span>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Bottom CTA — scale-up reveal with pulse glow */}
          <motion.div
            ref={cta.ref}
            className="mt-10 text-center"
            initial={{ opacity: 0, scale: 0.85 }}
            animate={
              cta.isInView
                ? { opacity: 1, scale: 1 }
                : { opacity: 0, scale: 0.85 }
            }
            transition={{ duration: 0.6, delay: 0.1, ease: [0.25, 0.4, 0.25, 1] }}
          >
            <motion.div
              className="inline-block"
              whileHover={{ scale: 1.03 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            >
              <Link
                href="/contact"
                className="comparison-cta-btn inline-flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-semibold text-sm rounded-lg py-3.5 px-8 shadow-lg shadow-emerald-900/30 transition-all duration-200 hover:shadow-[0_0_24px_rgba(16,185,129,0.4),0_0_48px_rgba(16,185,129,0.15)]"
              >
                Experience the Difference: Get a Free Quote
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Shimmer keyframe for "Created Equal" gradient text + CTA pulse */}
      <style jsx global>{`
        @keyframes comparison-shimmer {
          0% {
            background-position: -200% center;
          }
          100% {
            background-position: 200% center;
          }
        }
        .comparison-shimmer-text {
          background-size: 200% auto;
          animation: comparison-shimmer 4s linear infinite;
        }
        @keyframes comparison-cta-pulse {
          0%, 100% {
            box-shadow: 0 0 20px rgba(16, 185, 129, 0.2), 0 4px 12px rgba(16, 185, 129, 0.15);
          }
          50% {
            box-shadow: 0 0 28px rgba(16, 185, 129, 0.35), 0 4px 16px rgba(16, 185, 129, 0.25);
          }
        }
        .comparison-cta-btn {
          animation: comparison-cta-pulse 3s ease-in-out infinite;
        }
      `}</style>
    </section>
  );
}
