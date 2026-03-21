'use client';

import Link from 'next/link';
import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { ArrowRight, Scissors, CalendarRange, Shield } from 'lucide-react';

const plans = [
  {
    title: 'Weekly Mowing',
    price: 'From $35/visit',
    description: 'Same crew, same day, every week. Edging & trimming included.',
    icon: Scissors,
  },
  {
    title: 'Full Season Care',
    price: 'From $150/mo',
    description: 'Spring through fall coverage. One contract, zero gaps.',
    icon: CalendarRange,
  },
  {
    title: 'Complete Annual',
    price: 'Custom Quote',
    description: 'All 4 seasons. Snow, gutters, everything. We build your plan.',
    icon: Shield,
  },
] as const;

export function PricingPreview() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-80px', amount: 0.2 });

  return (
    <div ref={sectionRef} className="text-center">
      {/* Headline */}
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5, ease: [0.25, 0.4, 0.25, 1] }}
        className="text-3xl md:text-4xl font-bold text-white mb-3"
      >
        Transparent Pricing. No Surprises.
      </motion.h2>

      <motion.p
        initial={{ opacity: 0, y: 16 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5, delay: 0.1, ease: [0.25, 0.4, 0.25, 1] }}
        className="text-white/60 text-lg mb-12 max-w-md mx-auto"
      >
        Most Madison lawns cost less than you think.
      </motion.p>

      {/* Pricing Cards */}
      <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-12">
        {plans.map((plan, i) => {
          const Icon = plan.icon;
          return (
            <motion.div
              key={plan.title}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{
                duration: 0.5,
                delay: 0.15 + i * 0.1,
                ease: [0.25, 0.4, 0.25, 1],
              }}
            >
              <Link
                href="/contact"
                className="group block bg-white/[0.04] backdrop-blur-md border border-white/[0.08] rounded-2xl p-6 md:p-8 transition-all duration-300 hover:-translate-y-1 hover:border-emerald-500/30 hover:shadow-[0_0_30px_rgba(16,185,129,0.1)]"
              >
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-500/10 mx-auto mb-4">
                  <Icon className="w-5 h-5 text-emerald-400" />
                </div>

                <h3 className="text-lg font-semibold text-white mb-2">
                  {plan.title}
                </h3>

                <p className="text-2xl md:text-3xl font-bold text-emerald-400 mb-3">
                  {plan.price}
                </p>

                <p className="text-white/60 text-sm leading-relaxed mb-5">
                  {plan.description}
                </p>

                <span className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-400 group-hover:gap-2.5 transition-all duration-300">
                  Get Quote
                  <ArrowRight className="w-4 h-4" />
                </span>
              </Link>
            </motion.div>
          );
        })}
      </div>

      {/* Bottom CTA */}
      <motion.p
        initial={{ opacity: 0, y: 16 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5, delay: 0.5, ease: [0.25, 0.4, 0.25, 1] }}
        className="text-white/50 text-sm max-w-lg mx-auto"
      >
        Every property is different.{' '}
        <Link
          href="/contact"
          className="text-emerald-400 hover:text-emerald-300 underline underline-offset-2 transition-colors"
        >
          Get your exact price in 24 hours
        </Link>
        .
      </motion.p>
    </div>
  );
}
