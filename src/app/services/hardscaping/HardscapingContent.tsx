'use client';

import Link from 'next/link';
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { WebPageSchema } from "@/components/schemas/WebPageSchema";
import { BreadcrumbSchema } from "@/components/schemas/BreadcrumbSchema";
import { ScrollProgress } from "@/components/ScrollProgress";
import { ScrollReveal } from "@/components/ScrollReveal";
import { GlassCard } from "@/components/GlassCard";
import { TrustStrip } from "@/components/TrustStrip";
import { useState } from 'react';
import SmartQuoteFlow from '@/components/SmartQuoteFlow';
import { AmbientParticles } from "@/components/AmbientParticles";
import { ResidentialProblemSection, ResidentialSolutionSection } from "@/components/ResidentialSections";
import { Button } from "@/components/ui/button";
import {
  Phone, ArrowRight, CheckCircle2, Star, Shield, Users, Award,
  Layers, Landmark, Flame, Footprints, Fence, Mountain,
  MapPin, Clock, ExternalLink,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

// ---------------------------------------------------------------------------
// Data — verified against ydexteriorvisions.com (March 2026)
// ---------------------------------------------------------------------------
const services: { name: string; tagline: string; desc: string; icon: LucideIcon }[] = [
  { name: 'Paver Patios & Pathways', tagline: 'Most Popular', desc: 'Custom-designed paver patio and pathway installations using durable materials with expert craftsmanship, tailored to match your vision.', icon: Layers },
  { name: 'Flagstone Patios & Pathways', tagline: 'Premium', desc: 'Beautiful flagstone patios and pathways, installed with precision for a natural, elegant look that ages beautifully over time.', icon: Landmark },
  { name: 'Retaining Walls', tagline: 'Structural', desc: 'Strong and visually appealing retaining walls using premium materials, designed for long-lasting durability on slopes and terraces.', icon: Mountain },
  { name: 'Stone Edging', tagline: 'Detail Work', desc: 'Professional stone edging that defines garden beds and walkways, adding style and functionality to your landscape.', icon: Fence },
  { name: 'Fire Pits', tagline: 'Lifestyle', desc: 'Custom-built outdoor fire pits crafted from durable stone — the perfect gathering spot for your backyard.', icon: Flame },
  { name: 'Walkways', tagline: 'Functional', desc: 'Safe, attractive walkways blending natural beauty with practical design — expert craftsmanship on every project.', icon: Footprints },
];

const processSteps = [
  { step: '1', title: 'Consultation', desc: 'Free on-site visit to understand your vision, assess the space, and discuss options.' },
  { step: '2', title: 'Design', desc: 'Custom design tailored to your property and preferences with a clear written estimate.' },
  { step: '3', title: 'Preparation', desc: 'Professional site preparation including excavation and grading for a solid foundation.' },
  { step: '4', title: 'Installation', desc: 'Expert installation using premium materials with attention to every detail.' },
  { step: '5', title: 'Finishing', desc: 'Final touches, cleanup, and walkthrough to ensure everything meets your expectations.' },
];

const faqs = [
  { q: 'Do you offer free estimates?', a: 'Yes — every project starts with a free, no-obligation consultation. Call (608) 576-4220, email ydexteriorvisions@gmail.com, or fill out the contact form on their website.' },
  { q: 'What areas do you serve?', a: 'Madison, Dane County, Waunakee, Verona, Middleton, and surrounding Wisconsin communities.' },
  { q: 'What are your hours?', a: 'Monday through Sunday, 7:00 AM to 8:00 PM. Expect a response within 1 business day.' },
  { q: 'What hardscaping services do you offer?', a: 'Paver patios & pathways, flagstone patios & pathways, retaining walls, stone edging, fire pits, and walkways — all installed with premium materials and expert craftsmanship.' },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function HardscapingContent() {
  const [quoteOpen, setQuoteOpen] = useState(false);
  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#052e16' }}>
      <BreadcrumbSchema items={[
        { name: 'Home', url: 'https://tgyardcare.com' },
        { name: 'Services', url: 'https://tgyardcare.com/services' },
        { name: 'Hardscaping', url: 'https://tgyardcare.com/services/hardscaping' },
      ]} />
      <ScrollProgress variant="minimal" />
      <WebPageSchema
        name="Hardscaping Services in Madison WI"
        description="Professional hardscaping in Madison & Dane County — paver patios, retaining walls, fire pits, flagstone, stone walkways and more."
        url="/services/hardscaping"
        type="Service"
      />

      {/* Service schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'Service',
          name: 'Hardscaping Services',
          description: 'Professional hardscaping including paver patios, flagstone patios, retaining walls, fire pits, stone walkways, and stone edging in Madison, Waunakee, and Dane County, Wisconsin.',
          provider: {
            '@type': 'LocalBusiness',
            name: 'YD Exterior Visions',
            telephone: '608-576-4220',
            url: 'https://ydexteriorvisions.com',
            address: {
              '@type': 'PostalAddress',
              addressLocality: 'Madison',
              addressRegion: 'WI',
            },
          },
          areaServed: [
            { '@type': 'AdministrativeArea', name: 'Dane County, WI' },
            { '@type': 'City', name: 'Madison' },
            { '@type': 'City', name: 'Middleton' },
            { '@type': 'City', name: 'Verona' },
            { '@type': 'City', name: 'Waunakee' },
          ],
          serviceType: 'Hardscaping',
          hasOfferCatalog: {
            '@type': 'OfferCatalog',
            name: 'Hardscaping Services',
            itemListElement: services.map((svc, i) => ({
              '@type': 'Offer',
              itemOffered: { '@type': 'Service', name: svc.name, description: svc.desc },
              position: i + 1,
            })),
          },
        }) }}
      />

      <Navigation />

      {/* TL;DR for AI/Answer Engines */}
      <section className="sr-only" aria-label="Service Summary">
        <p>TotalGuard Yard Care partners with YD Exterior Visions for professional hardscaping services in Madison, Waunakee, and Dane County, Wisconsin. Services include paver patios &amp; pathways, flagstone patios &amp; pathways, retaining walls, fire pits, stone walkways, and stone edging. YD Exterior Visions is rated 4.9 stars with 30+ reviews and is a Nextdoor Neighborhood Favorite 2024. Request a free hardscape estimate at (608) 576-4220 or visit ydexteriorvisions.com.</p>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          HERO
      ════════════════════════════════════════════════════════════════════ */}
      <section className="relative min-h-[55vh] md:min-h-[60vh] flex items-center py-16 md:py-24">
        {/* Background layers */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#052e16] via-[#0d1a12] to-[#052e16]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(34,197,94,0.06)_0%,transparent_60%)]" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 40px, rgba(255,255,255,0.04) 40px, rgba(255,255,255,0.04) 41px),
                              repeating-linear-gradient(90deg, transparent, transparent 40px, rgba(255,255,255,0.04) 40px, rgba(255,255,255,0.04) 41px)`,
          }}
        />
        <AmbientParticles density="sparse" />

        <div className="container mx-auto px-6 md:px-8 relative z-10 max-w-6xl">
          <ScrollReveal>
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/10 px-4 py-2 rounded-full text-sm text-white/80 mb-6">
              <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
              4.9 Google Rating &middot; 30+ Reviews &middot; Free Estimates
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.1}>
            <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold text-white mb-4 md:mb-6">
              Hardscaping in{' '}
              <span className="text-primary">Madison &amp; Dane County</span>
            </h1>
          </ScrollReveal>

          <ScrollReveal delay={0.2}>
            <p className="text-lg md:text-xl text-white/90 mb-6 md:mb-8 leading-relaxed max-w-2xl">
              Paver patios, retaining walls, fire pits, and walkways — crafted with premium
              materials and expert craftsmanship by our trusted partner, YD Exterior Visions.
            </p>
          </ScrollReveal>

          {/* CTA row */}
          <ScrollReveal delay={0.3}>
            <div className="flex flex-col sm:flex-row items-start gap-3">
              <Button
                size="lg"
                className="font-bold text-lg px-8 py-4 h-auto animate-shimmer-btn bg-gradient-to-r from-green-500 via-emerald-400 to-green-500 bg-[length:200%_auto] text-white rounded-xl shadow-xl shadow-green-500/20 hover:shadow-2xl hover:shadow-green-500/30 transition-shadow"
                asChild
              >
                <a href="https://ydexteriorvisions.com/ydexteriorvisions-contact" target="_blank" rel="noopener noreferrer">
                  Get Free Estimate <ArrowRight className="ml-2 h-5 w-5" />
                </a>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="font-semibold text-base border-white/30 text-white hover:bg-white/10 px-6 py-4 h-auto rounded-xl transition-all"
                asChild
              >
                <a href="tel:608-576-4220">
                  <Phone className="mr-2 h-5 w-5" />
                  (608) 576-4220
                </a>
              </Button>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Smart Quote CTA */}
      <section className="container mx-auto px-4 py-10 md:py-14">
        <div
          className="max-w-xl mx-auto rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center gap-6"
          style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.10)',
            borderLeft: '4px solid #22c55e',
          }}
        >
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">🪨</span>
              <h2 className="text-lg font-bold text-white">Get Your Hardscaping Quote</h2>
            </div>
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.45)' }}>
              Answer a few quick questions — we&apos;ll call with a price built for your exact property.
            </p>
            <div className="flex flex-wrap items-center gap-3 mt-4 text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
              <span>★ 4.9 Google</span>
              <span>·</span>
              <span>80+ Families</span>
              <span>·</span>
              <span>Same-Day Response</span>
            </div>
          </div>
          <div className="flex flex-col gap-3 w-full md:w-auto">
            <button
              onClick={() => setQuoteOpen(true)}
              className="relative overflow-hidden rounded-xl px-6 py-3.5 text-sm font-bold text-white whitespace-nowrap transition-all duration-200 hover:scale-[1.02]"
              style={{
                background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                boxShadow: '0 0 24px rgba(245,158,11,0.30)',
              }}
            >
              Get My Free Quote →
            </button>
            <a
              href="tel:6085356057"
              className="flex items-center justify-center gap-2 text-sm text-white/50 hover:text-white/80 transition-colors"
            >
              📞 (608) 535-6057
            </a>
          </div>
        </div>
      </section>

      <SmartQuoteFlow
        serviceSlug="hardscaping"
        serviceName="Hardscaping"
        serviceEmoji="🪨"
        isOpen={quoteOpen}
        onClose={() => setQuoteOpen(false)}
      />

      {/* Trust Strip */}
      <TrustStrip variant="dark" />

      {/* Who This Is For */}
      <section className="py-10 md:py-14">
        <div className="container mx-auto px-6 md:px-8 max-w-4xl">
          <ScrollReveal>
            <p className="text-center text-white/70 text-base md:text-lg leading-relaxed">
              <strong className="text-white">Ideal for:</strong> Homeowners in Madison, Middleton, Verona, Waunakee,
              and surrounding Dane County communities who want durable, professionally installed
              hardscaping — patios, walls, walkways, and fire pits.
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* Problem / Solution */}
      <ResidentialProblemSection
        serviceName="Hardscaping"
        problemPoints={[
          "DIY paver projects that shift, sink, or crack after the first winter freeze",
          "Contractors who cut corners on site prep and use cheap materials",
          "Retaining walls that lean or collapse within a few years due to poor drainage",
          "Generic cookie-cutter designs that don't match your property or vision",
          "Surprise costs mid-project because the initial quote wasn't transparent"
        ]}
      />
      <ResidentialSolutionSection
        serviceName="Hardscaping"
        providerName="YD Exterior Visions"
        solutionPoints={[
          "Custom designs tailored to your property — patios, walls, walkways, fire pits, and edging",
          "Premium materials and expert craftsmanship on every installation",
          "Free consultation and transparent, written estimates with no hidden fees",
          "Communicative throughout the entire project from design to completion",
          "4.9-star rating with 30+ reviews — Nextdoor Neighborhood Favorite 2024"
        ]}
      />

      {/* ═══════════════════════════════════════════════════════════════════
          SERVICES GRID
      ════════════════════════════════════════════════════════════════════ */}
      <section className="py-14 md:py-20" style={{ background: '#0a3520' }}>
        <div className="container mx-auto px-6 md:px-8">
          <ScrollReveal>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 text-center">
              Hardscaping Services
            </h2>
            <p className="text-center text-white/60 mb-12 max-w-2xl mx-auto">
              Six ways to transform your outdoor space — each built with premium materials and precision.
            </p>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5 max-w-5xl mx-auto">
            {services.map((svc, i) => {
              const Icon = svc.icon;
              return (
                <ScrollReveal key={svc.name} delay={i * 0.08}>
                  <GlassCard hover="lift" className="h-full">
                    <div className="flex items-start gap-3">
                      <div className="bg-primary/10 rounded-full p-2 flex-shrink-0">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-white">{svc.name}</h3>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-primary/70">{svc.tagline}</span>
                        </div>
                        <p className="text-sm text-white/60 leading-relaxed">{svc.desc}</p>
                      </div>
                    </div>
                  </GlassCard>
                </ScrollReveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          HOW IT WORKS — General process
      ════════════════════════════════════════════════════════════════════ */}
      <section className="py-14 md:py-20">
        <div className="container mx-auto px-6 md:px-8">
          <ScrollReveal>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 text-center">
              How It Works
            </h2>
            <p className="text-center text-white/60 mb-12 max-w-2xl mx-auto">
              From first call to finished project — a straightforward process built on communication and craftsmanship.
            </p>
          </ScrollReveal>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 max-w-5xl mx-auto relative">
            {/* Connecting line */}
            <div className="hidden lg:block absolute top-8 left-[10%] right-[10%] h-px bg-gradient-to-r from-primary/20 via-primary/40 to-primary/20" />

            {processSteps.map((step, i) => (
              <ScrollReveal key={step.step} delay={i * 0.1}>
                <div className="text-center relative">
                  <div className="relative z-10 bg-white/[0.06] backdrop-blur-sm border-2 border-primary/20 rounded-2xl w-16 h-16 flex items-center justify-center mx-auto mb-4 shadow-lg hover:border-primary/50 hover:shadow-primary/10 hover:shadow-xl transition-all duration-300">
                    <span className="text-2xl font-bold text-primary">{step.step}</span>
                  </div>
                  <h3 className="font-semibold text-white mb-2 text-sm">{step.title}</h3>
                  <p className="text-xs text-white/60 leading-relaxed">{step.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Mid-page CTA — Routes to YD contact page */}
      <section className="py-10 md:py-12 bg-white/[0.04]">
        <div className="container mx-auto px-6 md:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 max-w-4xl mx-auto">
            <div className="text-center md:text-left">
              <h3 className="text-xl md:text-2xl font-bold text-white mb-1">Ready to transform your outdoor space?</h3>
              <p className="text-white/70">Get a free estimate — expect a response within 1 business day.</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button size="lg" className="w-full sm:w-auto font-bold bg-green-500 hover:bg-green-400 text-white" asChild>
                <a href="https://ydexteriorvisions.com/ydexteriorvisions-contact" target="_blank" rel="noopener noreferrer">
                  Contact Us <ExternalLink className="ml-2 h-4 w-4" />
                </a>
              </Button>
              <Button size="lg" variant="outline" className="w-full sm:w-auto font-bold" asChild>
                <a href="tel:608-576-4220">
                  <Phone className="mr-2 h-4 w-4" />
                  (608) 576-4220
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          WHY CHOOSE — Differentiators
      ════════════════════════════════════════════════════════════════════ */}
      <section className="py-14 md:py-20" style={{ background: '#0a3520' }}>
        <div className="container mx-auto px-6 md:px-8">
          <ScrollReveal>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 text-center">
              Why YD Exterior Visions
            </h2>
            <p className="text-center text-white/60 mb-12 max-w-2xl mx-auto">
              Our hardscaping partner is insured, dedicated to integrity, and committed to
              efficiency, reliability, and transparent communication on every project.
            </p>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-5xl mx-auto">
            {[
              { icon: Star, title: '4.9-Star Rated', desc: '30+ five-star reviews from real customers. Recognized as a Nextdoor Neighborhood Favorite 2024 and Top Rated Landscaping Service by Madison Business Awards 2023.' },
              { icon: Shield, title: 'Insured & Reliable', desc: 'Fully insured with a commitment to integrity. They show up on time, communicate clearly, and clean up after every project.' },
              { icon: Award, title: 'Premium Craftsmanship', desc: 'Custom designs using premium materials, tailored to your property and vision. Every project built with expert precision and attention to detail.' },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <ScrollReveal key={item.title} delay={i * 0.12}>
                  <GlassCard hover="lift" className="text-center h-full">
                    <div className="bg-primary/10 rounded-full w-14 h-14 flex items-center justify-center mx-auto mb-4">
                      <Icon className="h-7 w-7 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-3">{item.title}</h3>
                    <p className="text-white/60 leading-relaxed">{item.desc}</p>
                  </GlassCard>
                </ScrollReveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* Trust Strip — repeated */}
      <TrustStrip variant="light" />

      {/* ═══════════════════════════════════════════════════════════════════
          FAQ
      ════════════════════════════════════════════════════════════════════ */}
      <section className="py-14 md:py-20">
        <div className="container mx-auto px-6 md:px-8">
          <ScrollReveal>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-12 text-center">
              Hardscaping FAQ
            </h2>
          </ScrollReveal>

          <div className="max-w-3xl mx-auto space-y-4">
            {faqs.map((faq, i) => (
              <ScrollReveal key={i} delay={i * 0.08}>
                <GlassCard hover="glow" className="h-full">
                  <h3 className="font-semibold text-white mb-2">{faq.q}</h3>
                  <p className="text-sm text-white/60 leading-relaxed">{faq.a}</p>
                </GlassCard>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          PARTNER CONTACT — Direct to YD
      ════════════════════════════════════════════════════════════════════ */}
      <section className="py-14 md:py-20" style={{ background: '#0a3520' }}>
        <div className="container mx-auto px-6 md:px-8">
          <ScrollReveal>
            <div className="max-w-2xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                Get Your Free Hardscape Estimate
              </h2>
              <p className="text-white/60 mb-8 leading-relaxed">
                Hardscaping services provided by our trusted partner,{' '}
                <a
                  href="https://ydexteriorvisions.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline font-medium"
                >
                  YD Exterior Visions
                </a>
                {' '}in the Madison, WI area. Contact them directly for consultations and estimates.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
                <Button
                  size="lg"
                  className="w-full sm:w-auto font-bold text-lg px-8 py-4 h-auto animate-shimmer-btn bg-gradient-to-r from-green-500 via-emerald-400 to-green-500 bg-[length:200%_auto] text-white rounded-xl shadow-xl shadow-green-500/20 hover:shadow-2xl hover:shadow-green-500/30 transition-shadow"
                  asChild
                >
                  <a href="https://ydexteriorvisions.com/ydexteriorvisions-contact" target="_blank" rel="noopener noreferrer">
                    Contact YD Exterior Visions <ExternalLink className="ml-2 h-5 w-5" />
                  </a>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto font-semibold text-base border-white/20 text-white/80 hover:bg-white/5 hover:border-white/30 px-8 py-4 h-auto rounded-xl transition-all"
                  asChild
                >
                  <a href="tel:608-576-4220">
                    <Phone className="mr-2 h-5 w-5" />
                    (608) 576-4220
                  </a>
                </Button>
              </div>

              <div className="flex flex-wrap justify-center gap-6 text-sm text-white/40">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  Free estimates
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4 text-primary" />
                  Mon–Sun 7am–8pm
                </span>
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-primary" />
                  Madison, Dane &amp; Green County
                </span>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Serving Across Dane County */}
      <section className="py-16" style={{ background: 'rgba(255,255,255,0.01)', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="container mx-auto px-4 max-w-5xl">
          <h2 className="text-3xl font-bold text-white mb-3" style={{ fontFamily: 'var(--font-display)' }}>
            We Provide Hardscaping Across Dane County
          </h2>
          <p className="mb-8" style={{ color: 'rgba(255,255,255,0.45)' }}>
            Same crew. Same quality. Every city we serve.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {[
              { name: 'Madison', slug: 'madison' },
              { name: 'Middleton', slug: 'middleton' },
              { name: 'Waunakee', slug: 'waunakee' },
              { name: 'Sun Prairie', slug: 'sun-prairie' },
              { name: 'Fitchburg', slug: 'fitchburg' },
              { name: 'Monona', slug: 'monona' },
              { name: 'Verona', slug: 'verona' },
              { name: 'McFarland', slug: 'mcfarland' },
              { name: 'Cottage Grove', slug: 'cottage-grove' },
              { name: 'DeForest', slug: 'deforest' },
              { name: 'Oregon', slug: 'oregon' },
              { name: 'Stoughton', slug: 'stoughton' },
            ].map(city => (
              <Link
                key={city.slug}
                href={`/hardscaping-${city.slug}-wi`}
                className="flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium group transition-all duration-200"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(34,197,94,0.1)', color: 'rgba(255,255,255,0.65)' }}
              >
                {city.name}
                <span style={{ color: '#a7f3d0' }} className="transition-transform group-hover:translate-x-0.5">&rarr;</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <Footer showCloser={false} />
    </div>
  );
}
