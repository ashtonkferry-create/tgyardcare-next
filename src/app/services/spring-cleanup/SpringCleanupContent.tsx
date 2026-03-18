'use client';

import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import BeforeAfterGallery from "@/components/BeforeAfterGallery";
import { ServicePageSchemas } from "@/components/schemas/ServicePageSchemas";
import { WebPageSchema } from "@/components/schemas/WebPageSchema";
import { ScrollProgress } from "@/components/ScrollProgress";
import { ProblemResolution } from "@/components/ProblemResolution";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { CheckCircle2, Sparkles, Phone, Users, Calendar, Shield, Clock, Sprout, ArrowRight } from "lucide-react";
import heroImage from "@/assets/service-spring-cleanup.jpg";
import CTASection from '@/components/CTASection';
import ServiceFAQ from "@/components/ServiceFAQ";
import { springCleanupFAQs } from "@/data/serviceFAQs";
import { ResidentialProblemSection, ResidentialSolutionSection, ResidentialHomeownerTypesSection, ResidentialExpectationsSection } from "@/components/ResidentialSections";
import { BreadcrumbSchema } from "@/components/schemas/BreadcrumbSchema";
import { AmbientParticles } from "@/components/AmbientParticles";
import { ScrollReveal } from "@/components/ScrollReveal";
import { GlassCard } from "@/components/GlassCard";
import { CrossSellGrid } from "@/components/CrossSellGrid";
import { TrustStrip } from "@/components/TrustStrip";
import { useState } from 'react';
import SmartQuoteFlow from '@/components/SmartQuoteFlow';
import { MOBILE_ORDER } from '@/components/mobile/MobileSectionOrder';
import { cn } from '@/lib/utils';

function imgSrc(img: string | { src: string }): string {
  return typeof img === 'string' ? img : img.src;
}

export default function SpringCleanupContent() {
  const [quoteOpen, setQuoteOpen] = useState(false);
  const beforeAfterItems: { combinedImage: string }[] = [];

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#050d07' }}>
      <BreadcrumbSchema items={[
        { name: 'Home', url: 'https://tgyardcare.com' },
        { name: 'Services', url: 'https://tgyardcare.com/services' },
        { name: 'Spring Cleanup', url: 'https://tgyardcare.com/services/spring-cleanup' }
      ]} />
      <ScrollProgress variant="minimal" />
      <ServicePageSchemas slug="spring-cleanup" faqs={springCleanupFAQs} />
      <WebPageSchema name="Spring Cleanup Services" description="Professional spring cleanup in Madison and Dane County WI" url="/services/spring-cleanup" />
      <Navigation />

      {/* TL;DR for AI/Answer Engines */}
      <section className="sr-only" aria-label="Service Summary">
        <p>TotalGuard Yard Care provides professional spring cleanup services in Madison, Middleton, Waunakee, and Dane County, Wisconsin. We remove winter debris, prep garden beds, and perform first mow of the season in one 2-4 hour visit. Call (608) 535-6057 for a free quote.</p>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          HERO — Cinematic dark with particles
      ════════════════════════════════════════════════════════════════════ */}
      <section className="relative min-h-[55vh] md:min-h-[60vh] flex items-center py-16 md:py-24">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${imgSrc(heroImage)})` }}
          role="img"
          aria-label="Professional spring cleanup service showing yard maintenance with raking debris and preparing garden beds for growing season"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-[#0a1f14]/90 via-[#0a1f14]/50 to-[#0a1f14]/85" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(10,31,20,0.4)_100%)]" />
        </div>
        <AmbientParticles density="sparse" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl">
            <ScrollReveal>
              <div className="inline-flex items-center bg-white/10 backdrop-blur-sm border border-white/10 text-white/80 px-4 py-1.5 rounded-full text-sm font-medium mb-6">
                Starting at $125/visit
              </div>
            </ScrollReveal>
            <ScrollReveal delay={0.1}>
              <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold text-white mb-4 md:mb-6">
                Spring Cleanup in <span className="text-accent">Madison & Dane County</span>
              </h1>
            </ScrollReveal>
            <ScrollReveal delay={0.2}>
              <p className="text-lg md:text-xl text-white/90 mb-6 md:mb-8 leading-relaxed">
                Wisconsin winters leave behind a mess&mdash;but you don&apos;t have to deal with it. Complete spring cleanup across Madison, Middleton, Waunakee, and Sun Prairie to jumpstart your growing season.
              </p>
            </ScrollReveal>
            <ScrollReveal delay={0.3}>
              <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
                <Button size="lg" className="text-base md:text-lg font-bold animate-shimmer-btn bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 bg-[length:200%_auto] text-black" asChild>
                  <Link href="/contact?service=spring-cleanup">Get My Free Quote <ArrowRight className="ml-2 h-5 w-5" /></Link>
                </Button>
                <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 text-base md:text-lg" asChild>
                  <a href="tel:608-535-6057">
                    <Phone className="mr-2 h-5 w-5" />
                    (608) 535-6057
                  </a>
                </Button>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Smart Quote CTA */}
      <section className="container mx-auto px-4 py-10 md:py-14">
        <div
          className="max-w-xl mx-auto rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center gap-6"
          style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderLeft: '4px solid #22c55e',
          }}
        >
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">🌸</span>
              <h2 className="text-lg font-bold text-white">Get Your Spring Cleanup Quote</h2>
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
        serviceSlug="spring-cleanup"
        serviceName="Spring Cleanup"
        serviceEmoji="🌸"
        isOpen={quoteOpen}
        onClose={() => setQuoteOpen(false)}
      />

      {/* ═══════════════════════════════════════════════════════════════════
          TRUST STRIP — Immediate credibility
      ════════════════════════════════════════════════════════════════════ */}
      <TrustStrip variant="dark" />

      {/* Who This Is For */}
      <ScrollReveal>
        <section className="py-14 md:py-20" style={{ background: '#0a1a0e' }}>
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <ScrollReveal>
                <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">Who Spring Cleanup Is For</h2>
                <p className="text-lg text-white/60 text-center mb-12">
                  This service is designed for Dane County homeowners who want to maximize their short Wisconsin growing season.
                </p>
              </ScrollReveal>
              <div className="grid md:grid-cols-2 gap-5">
                {[
                  { icon: Users, title: "Busy Professionals", desc: "No time for weekend yard work when the snow finally melts" },
                  { icon: Sprout, title: "Lawn Enthusiasts", desc: "Those who want the best possible start to the growing season" },
                  { icon: Shield, title: "Homeowners Who Skipped Fall Cleanup", desc: "Need to catch up before the damage becomes permanent" },
                  { icon: Clock, title: "Those Preparing to Sell", desc: "First impressions matter\—curb appeal starts with a clean yard" },
                ].map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <ScrollReveal key={i} delay={i * 0.08}>
                      <GlassCard hover="lift" className="h-full">
                        <div className="flex items-start gap-4">
                          <Icon className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                          <div>
                            <h3 className="font-semibold mb-1">{item.title}</h3>
                            <p className="text-sm text-white/60">{item.desc}</p>
                          </div>
                        </div>
                      </GlassCard>
                    </ScrollReveal>
                  );
                })}
              </div>
            </div>
          </div>
        </section>
      </ScrollReveal>

      {/* ═══════════════════════════════════════════════════════════════════
          PROBLEM / SOLUTION — Build understanding
      ════════════════════════════════════════════════════════════════════ */}
      <ResidentialProblemSection
        serviceName="Spring Cleanup"
        problemPoints={[
          "Dead leaves, fallen branches, and thatch buildup littering your yard after winter",
          "Matted grass that delays lawn greening and looks abandoned",
          "Weeds establishing early while your lawn struggles to recover",
          "Neglected spring prep wasting the valuable early growing period",
          "Plants struggling all season long without proper preparation"
        ]}
      />
      <ResidentialSolutionSection
        serviceName="Spring Cleanup"
        solutionPoints={[
          "Complete removal of all winter debris from your entire property",
          "Lawn dethatching to promote air circulation and healthy growth",
          "Pruning of dead growth and refreshing of garden bed mulch",
          "Redefining bed edges and borders for a clean, organized look",
          "Results within weeks as your yard springs to life beautifully"
        ]}
      />

      {/* ═══════════════════════════════════════════════════════════════════
          WHAT'S INCLUDED — Visual checklist
      ════════════════════════════════════════════════════════════════════ */}
      <section className="py-14 md:py-20" style={{ background: '#0a1a0e' }}>
        <div className="container mx-auto px-4">
          <ScrollReveal>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 text-center">
              What&apos;s Included in Spring Cleanup
            </h2>
            <p className="text-center text-white/60 mb-12 max-w-2xl mx-auto">
              Every service includes the complete package&mdash;no hidden fees or &ldquo;extras&rdquo; to add on.
            </p>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5 max-w-5xl mx-auto">
            {[
              { title: "Debris Removal", desc: "Clear all winter leaves, sticks, and branches from lawn, beds, and hardscapes" },
              { title: "Lawn Dethatching", desc: "Remove dead grass layer for better air, water, and nutrient penetration" },
              { title: "Bed Renovation", desc: "Cut back perennials and refresh mulch for a polished look" },
              { title: "Edging & Borders", desc: "Redefine bed edges and borders for clean, crisp lines" },
              { title: "Initial Mowing", desc: "First cut of season at proper height to encourage dense growth" },
              { title: "Complete Haul-Away", desc: "All debris bagged and removed\—nothing left behind" },
            ].map((item, i) => (
              <ScrollReveal key={i} delay={i * 0.08}>
                <GlassCard hover="lift" className="h-full">
                  <div className="flex items-start space-x-3">
                    <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-white mb-1">{item.title}</h3>
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
          HOW IT WORKS — Animated process timeline
      ════════════════════════════════════════════════════════════════════ */}
      <section className="py-14 md:py-20" style={{ background: '#050d07' }}>
        <div className="container mx-auto px-4">
          <ScrollReveal>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-12 text-center">
              How Spring Cleanup Works
            </h2>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-5xl mx-auto relative">
            {/* Connecting line (desktop) */}
            <div className="hidden md:block absolute top-8 left-[12.5%] right-[12.5%] h-px bg-gradient-to-r from-primary/20 via-primary/40 to-primary/20" />

            {[
              { step: "1", title: "Book Early", desc: "Schedule in February-March before the spring rush. We'll lock in your spot on our rotation." },
              { step: "2", title: "Weather Watch", desc: "We monitor conditions and schedule your cleanup once ground thaws and dries\—typically mid-April in Dane County." },
              { step: "3", title: "Deep Clean", desc: "We clear debris, dethatch, cut back perennials, edge beds, and complete first mow\—all in one visit." },
              { step: "4", title: "Ready to Grow", desc: "Your property is primed for Wisconsin's short but productive growing season." },
            ].map((item, i) => (
              <ScrollReveal key={i} delay={i * 0.12}>
                <div className="text-center relative">
                  <div className="relative z-10 bg-white/[0.06] backdrop-blur-sm border-2 border-primary/20 rounded-2xl w-16 h-16 flex items-center justify-center mx-auto mb-4 shadow-lg hover:border-primary/50 hover:shadow-primary/10 hover:shadow-xl transition-all duration-300">
                    <span className="text-2xl font-bold text-primary">{item.step}</span>
                  </div>
                  <h3 className="font-semibold text-white mb-2">{item.title}</h3>
                  <p className="text-sm text-white/60 leading-relaxed">{item.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          BEFORE & AFTER — Dark cinematic gallery
      ════════════════════════════════════════════════════════════════════ */}
      <BeforeAfterGallery items={beforeAfterItems} />

      {/* Mid-page CTA */}
      <CTASection
        title="Ready for a fresh start this spring?"
        description="Get a free, no-obligation quote. We'll have pricing to you within 24 hours."
        variant="compact"
      />

      {/* ═══════════════════════════════════════════════════════════════════
          WHY IT MATTERS — Wisconsin context
      ════════════════════════════════════════════════════════════════════ */}
      <section className="py-14 md:py-20" style={{ background: '#0a1a0e' }}>
        <div className="container mx-auto px-4">
          <ScrollReveal>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-12 text-center">
              Why Spring Cleanup Matters in Wisconsin
            </h2>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-5xl mx-auto">
            {[
              { icon: Sparkles, title: "Beat the Weeds", desc: "Wisconsin weeds like crabgrass and dandelions germinate early. A March-April cleanup lets you apply pre-emergent treatment before weed seeds sprout\—giving your lawn a head start." },
              { icon: Sparkles, title: "Thaw Damage Recovery", desc: "Dane County's freeze-thaw cycles push debris into lawns and compact soil. Dethatching and debris removal helps your grass recover from 5 months of Wisconsin winter." },
              { icon: Sparkles, title: "Maximize Short Summers", desc: "Madison's growing season is only about 150 days. Early spring cleanup means your lawn is actively growing by May\—not still recovering while neighbors' lawns thrive." },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <ScrollReveal key={i} delay={i * 0.12}>
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

      {/* ═══════════════════════════════════════════════════════════════════
          TIMING & FREQUENCY — Seasonal knowledge
      ════════════════════════════════════════════════════════════════════ */}
      <section className="py-14 md:py-20" style={{ background: '#050d07' }}>
        <div className="container mx-auto px-4">
          <ScrollReveal>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-12 text-center">
              When & How Often
            </h2>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <ScrollReveal delay={0.1}>
              <GlassCard hover="glow" className="h-full">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-primary/10 rounded-full p-2">
                    <Calendar className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-white">Timing</h3>
                </div>
                <ul className="space-y-2.5 text-sm text-white/60">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span><strong className="text-white">Book:</strong> February-March for priority scheduling</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span><strong className="text-white">Service window:</strong> Mid-April through early May</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span><strong className="text-white">Ideal conditions:</strong> After ground thaws and dries</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span><strong className="text-white">Before:</strong> First mowing cycle of the season</span>
                  </li>
                </ul>
              </GlassCard>
            </ScrollReveal>

            <ScrollReveal delay={0.2}>
              <GlassCard hover="glow" className="h-full">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-primary/10 rounded-full p-2">
                    <Clock className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-white">Frequency</h3>
                </div>
                <ul className="space-y-2.5 text-sm text-white/60">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span><strong className="text-white">Standard:</strong> One comprehensive visit</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span><strong className="text-white">Heavy cleanup:</strong> May require two visits for neglected properties</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span><strong className="text-white">Annual service:</strong> Every spring for best lawn health</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span><strong className="text-white">Pairs with:</strong> First fertilizer application, pre-emergent</span>
                  </li>
                </ul>
              </GlassCard>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          WHAT MAKES US DIFFERENT — Final trust
      ════════════════════════════════════════════════════════════════════ */}
      <section className="py-14 md:py-20" style={{ background: '#050d07' }}>
        <div className="container mx-auto px-4">
          <ScrollReveal>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 text-center">
              What Makes TotalGuard Different
            </h2>
            <p className="text-center text-white/60 mb-12 max-w-2xl mx-auto">
              We know you&apos;ve been burned by lawn guys who don&apos;t show up or deliver inconsistent results. Here&apos;s how we&apos;re different:
            </p>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-4xl mx-auto">
            {[
              { title: "We Beat the Rush", desc: "While other companies are still booking, we're already working. Early scheduling means your lawn starts recovering weeks ahead of neighbors." },
              { title: "Complete Property Coverage", desc: "We don't just rake and leave. Beds, borders, hardscapes, lawn\—everything gets attention. Your whole property looks refreshed." },
              { title: "Weather-Smart Scheduling", desc: "We monitor soil conditions and schedule when the ground is dry enough to work without compaction damage. No rushed jobs on soggy lawns." },
              { title: "Season-Long Relationship", desc: "Spring cleanup is just the start. We'll recommend what your lawn needs next\—aeration, fertilization, or regular mowing\—to keep momentum going." },
            ].map((item, i) => (
              <ScrollReveal key={i} delay={i * 0.1}>
                <GlassCard hover="lift" accentBorder className="h-full">
                  <h3 className="text-lg font-semibold text-white mb-3">{item.title}</h3>
                  <p className="text-white/60 leading-relaxed">{item.desc}</p>
                </GlassCard>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Problem Resolution */}
      <ProblemResolution variant="full" />

      {/* ═══════════════════════════════════════════════════════════════════
          PRICING — Clear, cinematic pricing card
      ════════════════════════════════════════════════════════════════════ */}
      <section className={cn("py-14 md:py-20", MOBILE_ORDER.PRICING)} style={{ background: '#050d07' }}>
        <div className="container mx-auto px-4">
          <ScrollReveal>
            <div className="max-w-2xl mx-auto">
              <GlassCard variant="accent" hover="glow" className="text-center p-8 md:p-10">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Madison-Area Spring Cleanup Pricing</h2>
                <div className="flex items-baseline justify-center gap-1 mb-4">
                  <span className="text-5xl md:text-6xl font-bold text-primary">$125</span>
                  <span className="text-2xl text-white/60">&ndash;</span>
                  <span className="text-5xl md:text-6xl font-bold text-primary">$500</span>
                  <span className="text-white/60 text-lg ml-1">/visit</span>
                </div>
                <p className="text-white/60 mb-6 leading-relaxed">
                  Most Madison, Middleton, Waunakee, and Sun Prairie properties get complete spring cleanup. Wisconsin&apos;s spring window is short&mdash;schedule early to ensure your property is ready when growing season hits.
                </p>
                <div className="flex flex-wrap justify-center gap-4 mb-8 text-sm text-white/60">
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4 text-primary" />
                    Mid-April through early May
                  </span>
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    2-4 hour visit
                  </span>
                </div>
                <Button size="lg" className="font-bold text-lg" asChild>
                  <Link href="/contact?service=spring-cleanup">Reserve Your Spring Cleanup <ArrowRight className="ml-2 h-5 w-5" /></Link>
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
        heading="Pair With These Services"
        subheading="Many Madison homeowners combine spring cleanup with these related services for maximum growing season impact:"
        items={[
          { href: "/services/mulching", title: "Mulch Refresh", desc: "Complete the polished look", price: "$50/yd" },
          { href: "/services/aeration", title: "Spring Aeration", desc: "Break up compacted soil for deeper roots", price: "$75/visit" },
          { href: "/services/fertilization", title: "First Fertilizer", desc: "Feed your lawn for rapid green-up", price: "$95/visit" },
          { href: "/services/herbicide", title: "Pre-Emergent", desc: "Stop weeds before they start", price: "$95/visit" },
        ]}
      />

      <ResidentialHomeownerTypesSection serviceName="spring cleanup" />
      <ResidentialExpectationsSection serviceName="spring cleanup" />

      <ServiceFAQ faqs={springCleanupFAQs} />

      <CTASection />

      {/* Serving Across Dane County */}
      <section className="py-16" style={{ background: 'rgba(255,255,255,0.01)', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="container mx-auto px-4 max-w-5xl">
          <h2 className="text-3xl font-bold text-white mb-3" style={{ fontFamily: 'var(--font-display)' }}>
            We Provide Spring Cleanup Across Dane County
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
                href={`/spring-cleanup-${city.slug}-wi`}
                className="flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium group transition-all duration-200"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(34,197,94,0.1)', color: 'rgba(255,255,255,0.65)' }}
              >
                {city.name}
                <span style={{ color: '#22c55e' }} className="transition-transform group-hover:translate-x-0.5">&rarr;</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <Footer showCloser={false} />
    </div>
  );
}
