'use client';

import Link from "next/link";
import { Leaf, Sprout, ShieldCheck, ArrowRight, AlertTriangle, Clock, FlaskConical } from 'lucide-react';
import { Button } from '@/components/ui/button';

const failureReasons = [
  {
    icon: AlertTriangle,
    text: 'Treatments done out of order waste time and money',
  },
  {
    icon: Clock,
    text: 'Store-bought products applied at the wrong time',
  },
  {
    icon: FlaskConical,
    text: 'Weeds thrive when grass is weak—not untreated',
  },
];

const steps = [
  {
    phase: 'FOUNDATION',
    number: '01',
    title: 'Thatching',
    description: 'Remove what\'s suffocating your lawn so water, air, and nutrients reach the roots.',
    icon: Leaf,
  },
  {
    phase: 'ACCELERATION',
    number: '02',
    title: 'Fertilization',
    description: 'Targeted nutrients applied at the exact time grass can absorb them for dense, deep-green growth.',
    icon: Sprout,
  },
  {
    phase: 'DOMINANCE',
    number: '03',
    title: 'Weed Control',
    description: 'Professional-grade herbicides that stop weeds before they spread—so grass wins long-term.',
    icon: ShieldCheck,
  },
];

const proofPoints = [
  'Designed for local soil and climate',
  'Adjusted seasonally for maximum results',
  'Used across residential and commercial properties',
];

export function LawnTransformationSteps() {
  return (
    <section className="py-14 md:py-20 bg-gradient-to-b from-green-50 via-white to-amber-50/40 relative overflow-hidden">
      {/* Subtle organic background */}
      <div className="absolute inset-0 opacity-[0.04]">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-green-700 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-amber-500 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* PATTERN-INTERRUPT HEADLINE */}
        <div className="text-center mb-8 md:mb-10 max-w-3xl mx-auto">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-[2.75rem] font-black text-green-900 mb-3 leading-tight tracking-tight">
            Why Most Lawns in Your Area Fail—<br className="hidden sm:block" />
            <span className="text-green-600">And How Ours Don't</span>
          </h2>
          <p className="text-green-800/70 text-base md:text-lg font-medium">
            No guesswork. No shortcuts. Just results.
          </p>
        </div>

        {/* BELIEF-SHIFTING MICRO BLOCK */}
        <div className="max-w-2xl mx-auto mb-10 md:mb-14">
          <div className="bg-red-50/60 border border-red-200/60 rounded-2xl p-5 md:p-6">
            <p className="text-sm font-bold text-red-800 uppercase tracking-widest mb-4 text-center">
              Why Most DIY Lawn Care Fails
            </p>
            <div className="grid gap-3">
              {failureReasons.map((reason, idx) => {
                const Icon = reason.icon;
                return (
                  <div key={idx} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0">
                      <Icon className="h-4 w-4 text-red-600" strokeWidth={2} />
                    </div>
                    <p className="text-red-900/80 text-sm md:text-base font-medium">{reason.text}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* THE LAWN TRANSFORMATION SYSTEM */}
        <div className="text-center mb-6 md:mb-8">
          <p className="text-green-700 font-bold text-xs md:text-sm tracking-[0.2em] uppercase">
            Our Lawn Transformation System
          </p>
        </div>

        <div className="max-w-5xl mx-auto">
          {/* Desktop: Horizontal Timeline */}
          <div className="hidden md:block">
            <div className="relative">
              {/* Connecting Line */}
              <div className="absolute top-12 left-[12%] right-[12%] h-1 bg-gradient-to-r from-green-300 via-green-500 to-green-300 rounded-full" />

              <div className="grid grid-cols-3 gap-6">
                {steps.map((step) => {
                  const Icon = step.icon;
                  return (
                    <div key={step.number} className="relative flex flex-col">
                      {/* Step Badge */}
                      <div className="flex justify-center mb-5">
                        <div className="relative z-10 w-[88px] h-[88px] rounded-full bg-gradient-to-br from-green-500 to-green-700 flex flex-col items-center justify-center shadow-xl shadow-green-500/30 ring-4 ring-white">
                          <Icon className="h-7 w-7 text-white mb-0.5" strokeWidth={2} />
                          <span className="text-[10px] font-bold text-green-100 tracking-wide">{step.phase}</span>
                        </div>
                      </div>

                      {/* Content Card */}
                      <div className="bg-white border border-green-100 rounded-2xl p-5 shadow-md hover:shadow-xl hover:shadow-green-500/10 hover:border-green-200 transition-all text-center flex-1">
                        <span className="inline-block text-xs font-black text-green-600 tracking-widest mb-1">
                          STEP {step.number}
                        </span>
                        <h3 className="text-xl font-bold text-green-900 mb-2">
                          {step.title}
                        </h3>
                        <p className="text-green-800/70 text-sm leading-relaxed">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Mobile: Condensed Vertical Timeline */}
          <div className="md:hidden">
            <div className="relative pl-10">
              {/* Vertical Line */}
              <div className="absolute left-[14px] top-3 bottom-3 w-1 bg-gradient-to-b from-green-500 via-green-400 to-green-300 rounded-full" />

              <div className="space-y-4">
                {steps.map((step, idx) => {
                  const Icon = step.icon;
                  return (
                    <div key={step.number} className="relative">
                      {/* Step Indicator */}
                      <div className="absolute -left-10 w-7 h-7 rounded-full bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center z-10 ring-2 ring-white shadow-md">
                        <Icon className="h-3.5 w-3.5 text-white" strokeWidth={2.5} />
                      </div>

                      {/* Content */}
                      <div className="bg-white border border-green-100 rounded-xl p-4 shadow-sm">
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="text-[10px] font-black text-amber-600 tracking-widest bg-amber-100 px-2 py-0.5 rounded-full">
                            {step.phase}
                          </span>
                          <span className="text-[10px] font-bold text-green-500">
                            STEP {step.number}
                          </span>
                        </div>
                        <h3 className="text-base font-bold text-green-900 mb-1">
                          {step.title}
                        </h3>
                        <p className="text-green-800/70 text-sm leading-snug">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* AUTHORITY REINFORCEMENT */}
        <div className="text-center mt-8 md:mt-10 mb-8">
          <p className="text-green-900 font-semibold text-sm md:text-base mb-3">
            This system is repeated on every lawn we service—<span className="text-green-600">because it works.</span>
          </p>
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs md:text-sm text-green-700/80">
            {proofPoints.map((point, idx) => (
              <span key={idx} className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                {point}
              </span>
            ))}
          </div>
        </div>

        {/* MONEY CTA */}
        <div className="text-center">
          <Button asChild size="lg" className="font-bold bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white shadow-xl shadow-amber-500/30 hover:shadow-2xl hover:shadow-amber-500/40 hover:scale-[1.02] transition-all border-0 text-base md:text-lg px-6 md:px-10 h-12 md:h-14 rounded-xl">
              <Link
                href="/contact"
              >
                Check If Your Lawn Qualifies
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
          </Button>
          <p className="text-green-700/60 text-xs md:text-sm mt-3 font-medium">
            Takes 60 seconds • No obligation
          </p>
        </div>
      </div>
    </section>
  );
}
