'use client';

import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { CheckCircle2, Scissors, Phone, Calendar, Shield, Clock, ArrowRight } from "lucide-react";
import { ServicePageSchemas } from "@/components/schemas/ServicePageSchemas";
import { WebPageSchema } from "@/components/schemas/WebPageSchema";
import CTASection from '@/components/CTASection';
import ServiceFAQ from "@/components/ServiceFAQ";
import { pruningFAQs } from "@/data/serviceFAQs";
import BeforeAfterGallery from "@/components/BeforeAfterGallery";
import pruningCombined from "@/assets/before-after/pruning-combined.png";
import pruningCombined2 from "@/assets/before-after/pruning-combined-2.png";
import heroImage from "@/assets/service-pruning.jpg";
import { ResidentialProblemSection, ResidentialSolutionSection, ResidentialHomeownerTypesSection, ResidentialExpectationsSection } from "@/components/ResidentialSections";
import { BreadcrumbSchema } from "@/components/schemas/BreadcrumbSchema";
import { ScrollReveal } from "@/components/ScrollReveal";
import { GlassCard } from "@/components/GlassCard";
import { CrossSellGrid } from "@/components/CrossSellGrid";
import { TrustStrip } from "@/components/TrustStrip";
import { useState } from 'react';
import SmartQuoteFlow from '@/components/SmartQuoteFlow';
import { MOBILE_ORDER } from '@/components/mobile/MobileSectionOrder';
import { cn } from '@/lib/utils';
import { AmbientParticles } from "@/components/AmbientParticles";

function imgSrc(img: string | { src: string }): string {
  return typeof img === 'string' ? img : img.src;
}

export default function PruningContent() {
  const [quoteOpen, setQuoteOpen] = useState(false);
  const beforeAfterItems = [
    { combinedImage: imgSrc(pruningCombined) },
    { combinedImage: imgSrc(pruningCombined2) }
  ];

  return (
    <>
      <BreadcrumbSchema items={[
        { name: 'Home', url: 'https://tgyardcare.com' },
        { name: 'Services', url: 'https://tgyardcare.com/services' },
        { name: 'Pruning', url: 'https://tgyardcare.com/services/pruning' }
      ]} />
      <ServicePageSchemas slug="pruning" faqs={pruningFAQs} />
      <WebPageSchema name="Bush Trimming and Pruning" description="Professional bush trimming and shrub pruning in Madison and Dane County WI" url="/services/pruning" />
      <div className="min-h-screen flex flex-col relative isolate" style={{ background: '#052e16' }}>
        <AmbientParticles density="sparse" className="-z-10" />
        <Navigation />

        {/* TL;DR for AI/Answer Engines */}
        <section className="sr-only" aria-label="Service Summary">
          <p>TotalGuard Yard Care provides professional bush trimming and shrub pruning services in Madison, Middleton, Waunakee, and Dane County, Wisconsin. We shape and restore overgrown landscaping with debris removed. Before and after photos provided. Call (608) 535-6057 for a free quote.</p>
        </section>

        {/* ═══════════════════════════════════════════════════════════════════
            HERO — Cinematic dark with particles
        ════════════════════════════════════════════════════════════════════ */}
        <section className="relative min-h-[55vh] md:min-h-[60vh] flex items-center justify-center overflow-hidden py-16 md:py-24">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${imgSrc(heroImage)})` }}
            role="img"
            aria-label="Professional bush trimming and pruning service showing well-maintained shrubs in Madison Wisconsin"
          >
            <div className="absolute inset-0 bg-gradient-to-b from-[#052e16]/90 via-[#052e16]/50 to-[#052e16]/85" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(5,46,22,0.4)_100%)]" />
          </div>
          <div className="relative z-10 text-center text-white px-4 max-w-4xl mx-auto">
            <ScrollReveal>
              <div className="inline-flex items-center bg-white/10 backdrop-blur-sm border border-white/10 text-white/80 px-4 py-1.5 rounded-full text-sm font-medium mb-6">
                Starting at $75
              </div>
            </ScrollReveal>
            <ScrollReveal delay={0.1}>
              <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold mb-4 md:mb-6">
                Bush Trimming & Shrub Pruning in Madison
              </h1>
            </ScrollReveal>
            <ScrollReveal delay={0.2}>
              <p className="text-lg md:text-xl mb-6 md:mb-8 text-gray-200 leading-relaxed">
                Overgrown shrubs make even the nicest home look neglected. We restore your landscaping with expert trimming and shaping across Madison, Middleton, Waunakee, and Sun Prairie.
              </p>
            </ScrollReveal>
            <ScrollReveal delay={0.3}>
              <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center">
                <Button size="lg" asChild className="text-base md:text-lg font-bold animate-shimmer-btn bg-gradient-to-r from-green-500 via-emerald-400 to-green-500 bg-[length:200%_auto] text-white">
                  <Link href="/contact?service=pruning">Get My Free Quote <ArrowRight className="ml-2 h-5 w-5" /></Link>
                </Button>
                <Button size="lg" variant="outline" asChild className="text-base md:text-lg border-white/30 text-white hover:bg-white/10">
                  <a href="tel:608-535-6057">
                    <Phone className="mr-2 h-5 w-5" />
                    (608) 535-6057
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
                <span className="text-2xl">🌳</span>
                <h2 className="text-lg font-bold text-white">Get Your Tree &amp; Shrub Pruning Quote</h2>
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
          serviceSlug="pruning"
          serviceName="Tree & Shrub Pruning"
          serviceEmoji="🌳"
          isOpen={quoteOpen}
          onClose={() => setQuoteOpen(false)}
        />

        {/* ═══════════════════════════════════════════════════════════════════
            TRUST STRIP — Immediate credibility
        ════════════════════════════════════════════════════════════════════ */}
        <TrustStrip variant="dark" />

        {/* Who This Is For — Quick qualifier */}
        <ScrollReveal>
          <section className="py-6 border-b border-border" style={{ background: '#0a3520' }}>
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto text-center">
                <p className="text-base md:text-lg text-white/60">
                  <strong className="text-white">Ideal for:</strong> Homeowners with overgrown foundation plantings, out-of-control hedges, or shrubs that haven&apos;t been trimmed in years. Perfect for pre-sale property prep or seasonal maintenance.
                </p>
              </div>
            </div>
          </section>
        </ScrollReveal>

        {/* ═══════════════════════════════════════════════════════════════════
            PROBLEM / SOLUTION — Build understanding
        ════════════════════════════════════════════════════════════════════ */}
        <ResidentialProblemSection
          serviceName="Bush Trimming & Pruning"
          problemPoints={[
            "Overgrown bushes and shrubs hurting your home's curb appeal",
            "Untrimmed plants blocking windows, walkways, and natural light",
            "Pest and disease problems from neglected, dense landscaping",
            "Dead branches and weak growth making plants look shabby",
            "Foundation obscured by out-of-control shrub growth"
          ]}
        />
        <ResidentialSolutionSection
          serviceName="Bush Trimming & Pruning"
          solutionPoints={[
            "Expert shaping and sizing that restores your landscape's polished look",
            "Promotion of healthy growth, more flowering, and fuller plants",
            "Prevention of disease and pest issues through proper pruning",
            "Complete cleanup with all debris removed from your property",
            "Timing recommendations for optimal plant health year-round"
          ]}
        />

        {/* ═══════════════════════════════════════════════════════════════════
            WHAT'S INCLUDED — Visual checklist
        ════════════════════════════════════════════════════════════════════ */}
        <section className="py-14 md:py-20" style={{ background: '#0a3520' }}>
          <div className="container mx-auto px-4 max-w-4xl">
            <ScrollReveal>
              <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-white">
                What&apos;s Included in Our Pruning Service
              </h2>
              <p className="text-center text-white/60 mb-12 max-w-2xl mx-auto">
                Complete service from assessment to cleanup. No extra charges for debris removal.
              </p>
            </ScrollReveal>
            <div className="grid md:grid-cols-2 gap-4 md:gap-5">
              {[
                { title: "Professional Assessment", desc: "We evaluate each shrub's species, health, and optimal timing before cutting" },
                { title: "Precision Trimming", desc: "Sharp, sanitized tools for clean cuts that heal quickly and prevent disease" },
                { title: "Shape Restoration", desc: "Return overgrown shrubs to their natural or desired form" },
                { title: "Dead Wood Removal", desc: "Remove all dead, diseased, or damaged branches to promote health" },
                { title: "Size Control", desc: "Keep plants at appropriate heights for your landscape design" },
                { title: "Complete Cleanup", desc: "All trimmings bagged and removed. Property left spotless" }
              ].map((item, i) => (
                <ScrollReveal key={i} delay={i * 0.08}>
                  <GlassCard hover="lift" className="h-full">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <h3 className="font-semibold text-white">{item.title}</h3>
                        <p className="text-sm text-white/60 leading-relaxed">{item.desc}</p>
                      </div>
                    </div>
                  </GlassCard>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════════
            WHEN TO PRUNE — Seasonal knowledge
        ════════════════════════════════════════════════════════════════════ */}
        <section className="py-14 md:py-20" style={{ background: '#052e16' }}>
          <div className="container mx-auto px-4 max-w-4xl">
            <ScrollReveal>
              <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-white">
                When to Prune in Wisconsin
              </h2>
            </ScrollReveal>
            <div className="grid md:grid-cols-2 gap-6">
              <ScrollReveal delay={0.1}>
                <GlassCard variant="accent" hover="glow" className="h-full relative">
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-semibold">
                    Best Time
                  </div>
                  <div className="flex items-center gap-3 mb-4 mt-2">
                    <div className="bg-primary/10 rounded-full p-2">
                      <Calendar className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="text-2xl font-bold text-white">Late Winter / Early Spring</h3>
                  </div>
                  <p className="text-white/60 mb-4">
                    February through early April, before new growth begins, is ideal for most shrubs in Dane County.
                    Plants are dormant, making it easier to see structure and shape.
                  </p>
                  <ul className="space-y-2.5 text-sm text-white/60">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      Best for: Most deciduous shrubs
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      Promotes vigorous spring growth
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      Less stress on plants
                    </li>
                  </ul>
                </GlassCard>
              </ScrollReveal>

              <ScrollReveal delay={0.2}>
                <GlassCard hover="glow" className="h-full">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="bg-primary/10 rounded-full p-2">
                      <Calendar className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="text-2xl font-bold text-white">After Flowering</h3>
                  </div>
                  <p className="text-white/60 mb-4">
                    Spring-blooming shrubs (lilacs, forsythia, rhododendrons) should be pruned immediately after
                    flowering to avoid cutting off next year&apos;s buds.
                  </p>
                  <ul className="space-y-2.5 text-sm text-white/60">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      Best for: Flowering shrubs
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      Preserves next year&apos;s blooms
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      Shapes without sacrificing flowers
                    </li>
                  </ul>
                </GlassCard>
              </ScrollReveal>
            </div>
            <ScrollReveal delay={0.3}>
              <p className="text-center text-white/60 mt-8 max-w-2xl mx-auto">
                <strong className="text-white">Not sure when your shrubs should be pruned?</strong> We&apos;ll assess your specific plants and recommend the optimal timing for each species in your landscape.
              </p>
            </ScrollReveal>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════════
            BENEFITS — Professional pruning
        ════════════════════════════════════════════════════════════════════ */}
        <section className="py-14 md:py-20" style={{ background: '#0a3520' }}>
          <div className="container mx-auto px-4 max-w-4xl">
            <ScrollReveal>
              <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-white">
                Benefits of Professional Pruning
              </h2>
            </ScrollReveal>
            <div className="grid md:grid-cols-2 gap-5">
              {[
                { title: "Enhanced Curb Appeal", desc: "Well-maintained shrubs instantly elevate your property's appearance and value" },
                { title: "Healthier Plants", desc: "Proper pruning improves air circulation and reduces disease and pest problems" },
                { title: "Better Flowering", desc: "Correct timing and technique leads to more blooms and fuller growth" },
                { title: "Controlled Growth", desc: "Keep plants at appropriate sizes without constant maintenance battles" },
                { title: "Safety & Access", desc: "Clear walkways, windows, and sight lines for safety and functionality" },
                { title: "Long-Term Savings", desc: "Regular maintenance prevents costly replacements and major restorations" }
              ].map((item, i) => (
                <ScrollReveal key={i} delay={i * 0.08}>
                  <GlassCard hover="lift" accentBorder className="h-full">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                      <div>
                        <h3 className="font-semibold text-white">{item.title}</h3>
                        <p className="text-white/60 leading-relaxed">{item.desc}</p>
                      </div>
                    </div>
                  </GlassCard>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* Before/After Gallery */}
        <BeforeAfterGallery items={beforeAfterItems} />

        {/* Mid-page CTA */}
        <CTASection
          title="Ready for professional pruning help?"
          description="Get a free, no-obligation quote. We'll have pricing to you within 24 hours."
          variant="compact"
        />

        {/* ═══════════════════════════════════════════════════════════════════
            WHY CHOOSE US — Final trust
        ════════════════════════════════════════════════════════════════════ */}
        <section className="py-14 md:py-20" style={{ background: '#052e16' }}>
          <div className="container mx-auto px-4 max-w-4xl">
            <ScrollReveal>
              <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-white">
                Why Madison Homeowners Trust TotalGuard
              </h2>
              <p className="text-center text-white/60 mb-12 max-w-2xl mx-auto">
                We&apos;re not the cheapest, but we&apos;re the most reliable. Here&apos;s what you can expect:
              </p>
            </ScrollReveal>
            <div className="grid md:grid-cols-3 gap-5">
              {[
                { icon: Scissors, title: "Species Knowledge", desc: "We know which shrubs thrive in Wisconsin and how each species should be pruned for optimal health." },
                { icon: Shield, title: "Fully Insured", desc: "Complete liability coverage protects your property. You'll never worry about damage or accidents." },
                { icon: Clock, title: "On-Time Service", desc: "We show up when we say we will and finish the job completely before we leave." },
              ].map((item, i) => {
                const Icon = item.icon;
                return (
                  <ScrollReveal key={i} delay={i * 0.12}>
                    <GlassCard hover="lift" className="text-center h-full">
                      <div className="bg-primary/10 rounded-full w-14 h-14 flex items-center justify-center mx-auto mb-4">
                        <Icon className="h-7 w-7 text-primary" />
                      </div>
                      <h3 className="font-semibold text-white mb-2">{item.title}</h3>
                      <p className="text-sm text-white/60 leading-relaxed">{item.desc}</p>
                    </GlassCard>
                  </ScrollReveal>
                );
              })}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════════
            PRICING — Cinematic pricing card
        ════════════════════════════════════════════════════════════════════ */}
        <section className={cn("py-14 md:py-20", MOBILE_ORDER.PRICING)} style={{ background: '#0a3520' }}>
          <div className="container mx-auto px-4 max-w-4xl">
            <ScrollReveal>
              <div className="max-w-2xl mx-auto">
                <GlassCard variant="accent" hover="glow" className="text-center p-8 md:p-10">
                  <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">
                    Pruning Service Pricing
                  </h2>
                  <p className="text-lg text-white/60 mb-8 max-w-2xl mx-auto leading-relaxed">
                    Pricing depends on the number of shrubs, their size, current condition, and accessibility. Most Madison-area homes with 10-20 shrubs range from <strong className="text-white">$200-$500</strong> for complete pruning. We provide detailed, upfront estimates with no hidden fees.
                  </p>
                  <GlassCard className="mb-8 text-left">
                    <p className="font-semibold text-white mb-2">Maintenance Plans Available</p>
                    <p className="text-sm text-white/60">
                      Book annual or semi-annual pruning and save. Consistent maintenance keeps shrubs healthy and costs predictable.
                    </p>
                  </GlassCard>
                  <Button size="lg" className="font-bold text-lg" asChild>
                    <Link href="/contact?service=pruning">Get Your Free Quote <ArrowRight className="ml-2 h-5 w-5" /></Link>
                  </Button>
                </GlassCard>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* Trust Strip — Repeated for reinforcement */}
        <TrustStrip variant="light" />

        {/* ═══════════════════════════════════════════════════════════════════
            RELATED SERVICES — Cross-sell
        ════════════════════════════════════════════════════════════════════ */}
        <CrossSellGrid
          heading="Complete Your Landscape Care"
          subheading="Pruning pairs well with these services for a fully polished property:"
          items={[
            { href: "/services/mulching", title: "Mulching", desc: "Fresh mulch completes the polished look after pruning", price: "$50/yd" },
            { href: "/services/weeding", title: "Weeding", desc: "Clear beds for a clean, professional appearance", price: "$40/visit" },
            { href: "/services/garden-beds", title: "Garden Beds", desc: "Full bed renovation for a complete transformation", price: "$100/visit" },
          ]}
        />

        <ResidentialHomeownerTypesSection serviceName="bush trimming and pruning" />
        <ResidentialExpectationsSection serviceName="bush trimming and pruning" />

        <ServiceFAQ faqs={pruningFAQs} />
        <CTASection />

        <Footer showCloser={false} />
      </div>
    </>
  );
}
