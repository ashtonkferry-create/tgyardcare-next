'use client';

import { Phone, FileText, Calendar, Users, CheckCircle2, ArrowRight } from "lucide-react";
import { motion } from 'framer-motion';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { cn } from "@/lib/utils";

/**
 * Visual timeline showing exactly what happens after contact
 * Eliminates "what now?" hesitation through procedural transparency
 */

interface ProcessTimelineProps {
  variant?: "vertical" | "horizontal" | "compact" | "editorial";
  className?: string;
}

const processSteps = [
  {
    icon: Phone,
    title: "You Reach Out",
    timing: "60 seconds",
    description: "Submit a form or call us directly. We receive your request immediately.",
    outcome: "Confirmation sent to your email"
  },
  {
    icon: FileText,
    title: "We Review & Quote",
    timing: "24 hours",
    description: "We assess your needs and prepare a clear, itemized quote. No hidden fees—ever.",
    outcome: "You receive a detailed proposal"
  },
  {
    icon: Calendar,
    title: "You Approve & Schedule",
    timing: "Your pace",
    description: "Accept the quote, pick your start date. We lock you into our schedule.",
    outcome: "Confirmed service day assigned"
  },
  {
    icon: Users,
    title: "Your Crew Shows Up",
    timing: "Same crew, always",
    description: "A dedicated 2-person team handles your property. No strangers, no surprises.",
    outcome: "Work completed to spec"
  }
];

export function ProcessTimeline({ variant = "vertical", className }: ProcessTimelineProps) {
  const { ref: timelineRef, isInView } = useScrollReveal();

  // ─── EDITORIAL: Premium flowing layout ────────────────────────────
  if (variant === "editorial") {
    return (
      <div ref={timelineRef} className={cn("relative", className)}>
        {/* Section header */}
        <div className="text-center mb-16 md:mb-20">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
            className="text-xs uppercase tracking-[0.3em] text-emerald-600 font-semibold mb-4"
          >
            The Process
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 tracking-tight mb-5"
          >
            Four steps. Zero guesswork.
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-base md:text-lg text-gray-400 max-w-md mx-auto"
          >
            From first contact to finished lawn—here&apos;s exactly what happens.
          </motion.p>
        </div>

        {/* Desktop: Flowing horizontal with SVG path */}
        <div className="hidden md:block relative">
          {/* The flowing SVG connector */}
          <motion.svg
            initial={{ pathLength: 0, opacity: 0 }}
            animate={isInView ? { pathLength: 1, opacity: 1 } : {}}
            transition={{ duration: 1.8, delay: 0.4, ease: "easeInOut" }}
            className="absolute top-[52px] left-0 w-full h-12 pointer-events-none"
            viewBox="0 0 1200 48"
            fill="none"
            preserveAspectRatio="none"
          >
            <motion.path
              d="M60 24 C200 24, 220 24, 340 24 C380 24, 400 24, 440 24 C520 24, 520 24, 600 24 C680 24, 680 24, 760 24 C800 24, 820 24, 860 24 C980 24, 1000 24, 1140 24"
              stroke="url(#flowGrad)"
              strokeWidth="1.5"
              strokeLinecap="round"
              fill="none"
              initial={{ pathLength: 0 }}
              animate={isInView ? { pathLength: 1 } : {}}
              transition={{ duration: 2, delay: 0.6, ease: "easeInOut" }}
            />
            <defs>
              <linearGradient id="flowGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#d1d5db" />
                <stop offset="50%" stopColor="#10b981" />
                <stop offset="100%" stopColor="#d1d5db" />
              </linearGradient>
            </defs>
          </motion.svg>

          <div className="grid grid-cols-4 gap-0">
            {processSteps.map((step, idx) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={step.title}
                  initial={{ opacity: 0, y: 30 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: 0.3 + idx * 0.2, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                  className="relative group px-6"
                >
                  {/* Giant watermark number */}
                  <div className="absolute -top-8 left-4 select-none pointer-events-none">
                    <span className="text-[8rem] font-black leading-none text-gray-100 tracking-tighter transition-colors duration-500 group-hover:text-emerald-50">
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                  </div>

                  {/* Content layer */}
                  <div className="relative z-10 pt-4">
                    {/* Icon node on the line */}
                    <div className="mb-8">
                      <div className="relative inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-white border border-gray-200 shadow-sm transition-all duration-500 group-hover:border-emerald-300 group-hover:shadow-lg group-hover:shadow-emerald-100 group-hover:scale-105">
                        <Icon className="h-5 w-5 text-gray-400 transition-colors duration-500 group-hover:text-emerald-600" />
                      </div>
                    </div>

                    {/* Text content */}
                    <div className="space-y-3">
                      <h3 className="text-lg font-bold text-gray-900 tracking-tight">
                        {step.title}
                      </h3>

                      <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full transition-all duration-300 group-hover:bg-emerald-100">
                        <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                        {step.timing}
                      </div>

                      <p className="text-sm text-gray-500 leading-relaxed pr-4">
                        {step.description}
                      </p>

                      {/* Outcome - reveals on hover */}
                      <div className="flex items-center gap-1.5 text-xs text-emerald-600 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                        <CheckCircle2 className="h-3.5 w-3.5 flex-shrink-0" />
                        <span className="font-medium">{step.outcome}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Mobile: Alternating offset timeline */}
        <div className="md:hidden relative">
          {/* Vertical line */}
          <motion.div
            initial={{ scaleY: 0 }}
            animate={isInView ? { scaleY: 1 } : {}}
            transition={{ duration: 1.2, delay: 0.3, ease: "easeOut" }}
            className="absolute left-8 top-0 bottom-0 w-px origin-top"
            style={{ background: 'linear-gradient(to bottom, transparent, #10b981 20%, #10b981 80%, transparent)' }}
          />

          <div className="space-y-10">
            {processSteps.map((step, idx) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={step.title}
                  initial={{ opacity: 0, x: -20 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ delay: 0.3 + idx * 0.15, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  className="relative flex items-start gap-5 pl-2"
                >
                  {/* Node on line */}
                  <div className="relative flex-shrink-0">
                    <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-white border border-gray-200 shadow-sm z-10 relative">
                      <Icon className="h-5 w-5 text-emerald-600" />
                    </div>
                    {/* Step number */}
                    <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-emerald-600 text-white text-[10px] font-bold flex items-center justify-center shadow-sm">
                      {idx + 1}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="pt-1 flex-1 min-w-0">
                    <h3 className="text-base font-bold text-gray-900 mb-1">
                      {step.title}
                    </h3>
                    <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full mb-2">
                      <span className="w-1 h-1 rounded-full bg-emerald-500" />
                      {step.timing}
                    </span>
                    <p className="text-sm text-gray-500 leading-relaxed">
                      {step.description}
                    </p>
                    <div className="flex items-center gap-1.5 text-xs text-emerald-600 mt-2">
                      <CheckCircle2 className="h-3 w-3 flex-shrink-0" />
                      <span className="font-medium">{step.outcome}</span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // ─── COMPACT ──────────────────────────────────────────────────────
  if (variant === "compact") {
    return (
      <div className={cn("py-6 border-y border-border/50", className)}>
        <div className="flex flex-wrap justify-center gap-x-8 gap-y-2 text-sm">
          {processSteps.map((step, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <div className="flex items-center justify-center w-5 h-5 rounded-full bg-primary/10 text-primary text-xs font-bold">
                {idx + 1}
              </div>
              <span className="text-foreground font-medium">{step.title}</span>
              {idx < processSteps.length - 1 && (
                <span className="text-muted-foreground ml-2 hidden sm:inline">→</span>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ─── HORIZONTAL ───────────────────────────────────────────────────
  if (variant === "horizontal") {
    return (
      <div ref={timelineRef} className={cn("py-8", className)}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {processSteps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: idx * 0.15, duration: 0.5 }}
                className="relative text-center"
              >
                {idx < processSteps.length - 1 && (
                  <div className="hidden md:block absolute top-6 left-[60%] w-[80%] h-px bg-gradient-to-r from-blue-200/50 via-blue-300/30 to-blue-200/50" />
                )}

                <div className="relative inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 border border-transparent hover:shadow-blue-300/30 hover:shadow-lg hover:border-blue-400 transition-all duration-300 mb-3">
                  <Icon className="h-5 w-5 text-primary" />
                  <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
                    {idx + 1}
                  </span>
                </div>

                <h4 className="text-sm font-bold text-gray-900 mb-1">{step.title}</h4>
                <p className="text-xs text-primary font-medium mb-1">{step.timing}</p>
                <p className="text-xs text-gray-500">{step.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    );
  }

  // ─── VERTICAL (default) ───────────────────────────────────────────
  return (
    <div ref={timelineRef} className={cn("py-8", className)}>
      <div className="space-y-0">
        {processSteps.map((step, idx) => {
          const Icon = step.icon;
          const isLast = idx === processSteps.length - 1;

          return (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: idx * 0.15, duration: 0.5 }}
              className="relative flex gap-4"
            >
              <div className="flex flex-col items-center">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 border-2 border-primary hover:shadow-blue-300/30 hover:shadow-lg hover:border-blue-400 transition-all duration-300 z-10">
                  <Icon className="h-4 w-4 text-primary" />
                </div>
                {!isLast && (
                  <div className="w-0.5 h-full bg-gradient-to-b from-blue-200/50 via-blue-300/30 to-blue-200/50 min-h-[60px]" />
                )}
              </div>

              <div className={cn("pb-6", isLast && "pb-0")}>
                <div className="flex items-baseline gap-3 mb-1">
                  <h4 className="text-base font-bold text-foreground">{step.title}</h4>
                  <span className="text-xs text-primary font-medium bg-primary/10 px-2 py-0.5 rounded-full">
                    {step.timing}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mb-2">{step.description}</p>
                <div className="flex items-center gap-1.5 text-xs text-primary">
                  <CheckCircle2 className="h-3 w-3" />
                  <span className="font-medium">{step.outcome}</span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

export default ProcessTimeline;
