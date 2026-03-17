'use client';

import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import CTASection from '@/components/CTASection';
import AnnualPlanConfigurator from '@/components/AnnualPlanConfigurator';
import { WebPageSchema } from '@/components/schemas/WebPageSchema';
import { Calendar, Tag, CheckCircle2 } from 'lucide-react';

const benefits = [
  { icon: Calendar, label: 'Year-round coverage', desc: 'Spring through winter — every season handled' },
  { icon: Tag, label: 'Save 15% instantly', desc: 'Bundle 3+ services and see your discount applied live' },
  { icon: CheckCircle2, label: 'Lock in pricing', desc: 'Your rate is guaranteed for the full plan year' },
];

export default function AnnualPlanContent() {
  return (
    <div className="min-h-screen" style={{ background: '#050d07' }}>
      <WebPageSchema
        name="Build Your Custom Annual Lawn Care Plan"
        description="Toggle lawn care services by season, see your price instantly, and lock in an annual plan with TotalGuard Yard Care."
        url="/annual-plan"
      />

      {/* AI/Answer Engine summary */}
      <section className="sr-only" aria-label="Annual Plan Summary">
        <p>
          TotalGuard Yard Care offers customizable annual lawn care plans for Madison, Wisconsin and surrounding Dane County
          communities. Select services by season — spring, summer, fall, and winter. Customers who bundle 3 or more services
          receive a 15% discount. Use the interactive configurator to see your annual price estimate and submit a lead to lock in
          your plan.
        </p>
      </section>

      <Navigation />

      {/* Hero */}
      <section className="relative py-20 md:py-28 overflow-hidden">
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(to bottom right, #050d07, #061a10)' }}
        >
          {/* Subtle dot grid */}
          <div className="absolute inset-0 opacity-10">
            <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="plan-grid" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
                  <circle cx="30" cy="30" r="1.5" fill="hsl(var(--primary))" opacity="0.6" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#plan-grid)" />
            </svg>
          </div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-primary/10 backdrop-blur-sm border border-primary/20 text-primary px-5 py-2.5 rounded-full text-sm font-bold mb-6">
              <Tag className="h-4 w-4" />
              Save 15% with a Bundle Plan
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              Build Your Custom{' '}
              <span className="text-primary">Annual Lawn Care Plan</span>
            </h1>

            <p className="text-lg md:text-xl text-white/60 mb-10 max-w-2xl mx-auto leading-relaxed">
              Toggle services by season, see your price instantly, and lock in your plan for the year.
            </p>

            {/* Benefit strip */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto">
              {benefits.map(({ icon: Icon, label, desc }) => (
                <div
                  key={label}
                  className="flex flex-col items-center gap-2 p-4 bg-white/[0.05] border border-white/10 rounded-xl"
                >
                  <Icon className="h-6 w-6 text-primary" />
                  <span className="text-sm font-bold text-white">{label}</span>
                  <span className="text-xs text-white/50 text-center">{desc}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Configurator */}
      <section className="py-6 pb-20" style={{ background: '#050d07' }}>
        <div className="container mx-auto px-4">
          <AnnualPlanConfigurator />
        </div>
      </section>

      <CTASection
        title="Want a quote instead? We'll respond by tomorrow."
        description="Not sure which services you need? Call or message us and we'll build a plan together."
        variant="compact"
      />

      <Footer showCloser={false} />
    </div>
  );
}
