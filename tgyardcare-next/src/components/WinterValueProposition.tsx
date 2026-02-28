'use client';

import { Shield, Clock, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';

export function WinterValueProposition() {
  const cheapProviderFailures = [
    { text: "Unreliable response times", detail: "Stuck waiting while snow piles up" },
    { text: "Equipment breakdowns mid-storm", detail: "Your property sits uncleared" },
    { text: "No-show during major storms", detail: "When you need them most, they vanish" },
    { text: "Hidden fees after the fact", detail: "Surprise charges on every invoice" },
  ];

  const totalGuardDifference = [
    { text: "24/7 priority response guaranteed", icon: Clock },
    { text: "Commercial-grade equipment, always ready", icon: Shield },
    { text: "Fully insured with documentation", icon: Shield },
    { text: "Fixed pricing - no surprises ever", icon: CheckCircle2 },
  ];

  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(210_40%_20%/0.5),transparent_60%)]" />
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-cyan-500/5 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-12 md:mb-16">
          <div className="inline-flex items-center gap-2 bg-red-500/20 text-red-300 px-4 py-2 rounded-full text-sm font-semibold mb-5 border border-red-500/30">
            <AlertTriangle className="h-4 w-4" />
            Before You Choose a Provider
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-4 leading-tight">
            Why <span className="text-red-400">Budget Providers Fail</span> When It Matters Most
          </h2>
          <p className="text-slate-400 text-base md:text-lg max-w-2xl mx-auto">
            When a winter storm hits Madison, the difference between a reliable provider and a cheap one becomes crystal clear.
          </p>
        </div>

        {/* Comparison Grid with floating animation */}
        <div className="grid md:grid-cols-2 gap-6 md:gap-8 max-w-5xl mx-auto">
          {/* Cheap Providers - Problems */}
          <div className="bg-gradient-to-br from-red-950/50 via-slate-800/50 to-slate-900/50 rounded-2xl p-6 md:p-8 border border-red-500/20 shadow-xl animate-sway-left motion-reduce:animate-none">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-red-500/20 p-2.5 rounded-xl">
                <XCircle className="h-6 w-6 text-red-400" />
              </div>
              <h3 className="text-xl font-bold text-white">Cheap Providers</h3>
            </div>
            <ul className="space-y-4">
              {cheapProviderFailures.map((item, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <div className="bg-red-500/20 p-1 rounded-full mt-0.5 flex-shrink-0">
                    <XCircle className="h-4 w-4 text-red-400" />
                  </div>
                  <div>
                    <p className="text-white font-medium text-sm">{item.text}</p>
                    <p className="text-slate-500 text-xs mt-0.5">{item.detail}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* TotalGuard - Solutions */}
          <div className="bg-gradient-to-br from-emerald-950/50 via-slate-800/50 to-slate-900/50 rounded-2xl p-6 md:p-8 border border-emerald-500/20 shadow-xl animate-sway-right motion-reduce:animate-none">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-emerald-500/20 p-2.5 rounded-xl">
                <Shield className="h-6 w-6 text-emerald-400" />
              </div>
              <h3 className="text-xl font-bold text-white">TotalGuard Difference</h3>
            </div>
            <ul className="space-y-4">
              {totalGuardDifference.map((item, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <div className="bg-emerald-500/20 p-1 rounded-full mt-0.5 flex-shrink-0">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  </div>
                  <p className="text-white font-medium text-sm">{item.text}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Trust Line */}
        <div className="text-center mt-10 md:mt-14">
          <p className="text-slate-400 text-sm md:text-base max-w-xl mx-auto">
            <span className="text-white font-semibold">500+ Madison homeowners</span> trust TotalGuard for reliable winter protection. Don't gamble with your safety.
          </p>
        </div>
      </div>
    </section>
  );
}
