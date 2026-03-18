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
import { CheckCircle2, Clock, Phone, Calendar, Shield, Users, Zap, ArrowRight } from "lucide-react";
import heroImage from "@/assets/service-mowing.jpg";
import mowingImage1 from "@/assets/before-after/mowing-combined.png";
import fertilizationImage from "@/assets/before-after/fertilization-combined.png";
import CTASection from '@/components/CTASection';
import ServiceFAQ from "@/components/ServiceFAQ";
import { mowingFAQs } from "@/data/serviceFAQs";
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

export default function MowingContent() {
  const [quoteOpen, setQuoteOpen] = useState(false);
  const beforeAfterItems = [
    { combinedImage: mowingImage1 },
    { combinedImage: fertilizationImage }
  ];

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#052e16' }}>
      <BreadcrumbSchema items={[
        { name: 'Home', url: 'https://tgyardcare.com' },
        { name: 'Services', url: 'https://tgyardcare.com/services' },
        { name: 'Lawn Mowing', url: 'https://tgyardcare.com/services/mowing' }
      ]} />
      <ScrollProgress variant="minimal" />
      <ServicePageSchemas slug="mowing" faqs={mowingFAQs} />
      <WebPageSchema name="Professional Lawn Mowing" description="Professional lawn mowing services in Madison and Dane County WI" url="/services/mowing" />
      <Navigation />

      {/* TL;DR for AI/Answer Engines */}
      <section className="sr-only" aria-label="Service Summary">
        <p>TotalGuard Yard Care provides professional weekly lawn mowing services in Madison, Middleton, Waunakee, and Dane County, Wisconsin. We assign the same crew to your property every visit, ensuring consistent quality and reliable scheduling. Get a free quote at (608) 535-6057.</p>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          HERO — Cinematic dark with particles
      ════════════════════════════════════════════════════════════════════ */}
      <section className="relative min-h-[55vh] md:min-h-[60vh] flex items-center py-16 md:py-24">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${imgSrc(heroImage)})` }}
          role="img"
          aria-label="Professional lawn mowing service showing freshly mowed residential lawn with perfect stripes and clean edges in Madison Wisconsin"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-[#052e16]/90 via-[#052e16]/50 to-[#052e16]/85" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(5,46,22,0.4)_100%)]" />
        </div>
        <AmbientParticles density="sparse" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl">
            <ScrollReveal>
              <div className="inline-flex items-center bg-white/10 backdrop-blur-sm border border-white/10 text-white/80 px-4 py-1.5 rounded-full text-sm font-medium mb-6">
                Starting at $55/visit
              </div>
            </ScrollReveal>
            <ScrollReveal delay={0.1}>
              <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold text-white mb-4 md:mb-6">
                Lawn Mowing in <span className="text-accent">Madison & Dane County</span>
              </h1>
            </ScrollReveal>
            <ScrollReveal delay={0.2}>
              <p className="text-lg md:text-xl text-white/90 mb-6 md:mb-8 leading-relaxed">
                Wisconsin summers are short&mdash;don&apos;t spend them behind a mower. We handle weekly mowing for homeowners across Madison, Middleton, Waunakee, and Sun Prairie with the same crew every visit.
              </p>
            </ScrollReveal>
            <ScrollReveal delay={0.3}>
              <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
                <Button size="lg" className="text-base md:text-lg font-bold animate-shimmer-btn bg-gradient-to-r from-green-500 via-emerald-400 to-green-500 bg-[length:200%_auto] text-white" asChild>
                  <Link href="/contact?service=mowing">Get My Free Quote <ArrowRight className="ml-2 h-5 w-5" /></Link>
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
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.10)',
            borderLeft: '4px solid #22c55e',
          }}
        >
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">🌿</span>
              <h2 className="text-lg font-bold text-white">Get Your Lawn Mowing Quote</h2>
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
        serviceSlug="mowing"
        serviceName="Lawn Mowing"
        serviceEmoji="🌿"
        isOpen={quoteOpen}
        onClose={() => setQuoteOpen(false)}
      />

      {/* ═══════════════════════════════════════════════════════════════════
          TRUST STRIP — Immediate credibility
      ════════════════════════════════════════════════════════════════════ */}
      <TrustStrip variant="dark" />

      {/* Who This Is For — Quick qualifier */}
      <ScrollReveal>
        <section className="py-6 border-b border-white/10" style={{ background: '#0a3520' }}>
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <p className="text-base md:text-lg text-white/60">
                <strong className="text-white">Ideal for:</strong> Busy Madison-area homeowners who want a pristine lawn without spending weekends mowing. Perfect for professionals, families, and anyone who values their time.
              </p>
            </div>
          </div>
        </section>
      </ScrollReveal>

      {/* ═══════════════════════════════════════════════════════════════════
          PROBLEM / SOLUTION — Build understanding
      ════════════════════════════════════════════════════════════════════ */}
      <ResidentialProblemSection
        serviceName="Lawn Mowing"
        problemPoints={[
          "Overgrown, unevenly cut lawn that creates brown patches and harms your grass",
          "Inconsistent mowing heights that stress your lawn and invite pests",
          "DIY mowing that eats your weekends with equipment hassles and poor results",
          "Neglected appearance that damages curb appeal and property value",
          "Improper technique that leads to costly repairs and reseeding"
        ]}
      />
      <ResidentialSolutionSection
        serviceName="Lawn Mowing"
        solutionPoints={[
          "Professional mowing that creates golf-course-quality stripes using commercial-grade equipment",
          "Optimal mowing height for your grass type ensuring healthy growth and lush appearance",
          "Precision edging available as an add-on service",
          "Thorough cleanup\—you're left with nothing but a beautiful lawn",
          "Reliable weekly or bi-weekly service you can actually count on"
        ]}
      />

      {/* ═══════════════════════════════════════════════════════════════════
          WHAT'S INCLUDED — Visual checklist
      ════════════════════════════════════════════════════════════════════ */}
      <section className="py-14 md:py-20" style={{ background: '#0a3520' }}>
        <div className="container mx-auto px-4">
          <ScrollReveal>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 text-center">
              What&apos;s Included in Every Mowing Visit
            </h2>
            <p className="text-center text-white/60 mb-12 max-w-2xl mx-auto">
              Every service includes the complete package&mdash;no hidden fees or &ldquo;extras&rdquo; to add on.
            </p>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5 max-w-5xl mx-auto">
            {[
              { title: "Precision Mowing", desc: "Consistent height with professional striping patterns that make your lawn look like a golf course" },
              { title: "String Trimming", desc: "Detail work around fences, trees, mailboxes, and hard-to-reach areas" },
              { title: "Surface Blowing", desc: "All clippings blown off driveways, sidewalks, and patios\—no mess left behind" },
              { title: "Height Adjustment", desc: "We raise or lower cutting height based on season and weather conditions" },
              { title: "Pattern Variation", desc: "We rotate mowing direction to prevent ruts and promote upright growth" },
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
      <section className="py-14 md:py-20">
        <div className="container mx-auto px-4">
          <ScrollReveal>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-12 text-center">
              How Our Mowing Service Works
            </h2>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-5xl mx-auto relative">
            {/* Connecting line (desktop) */}
            <div className="hidden md:block absolute top-8 left-[12.5%] right-[12.5%] h-px bg-gradient-to-r from-primary/20 via-primary/40 to-primary/20" />

            {[
              { step: "1", title: "Get Your Quote", desc: "Tell us about your property. We'll respond within 24 hours with clear, honest pricing." },
              { step: "2", title: "Choose Your Schedule", desc: "Pick weekly or bi-weekly service. We'll assign your dedicated crew and route day." },
              { step: "3", title: "We Show Up", desc: "Same crew, same day each week. No need to be home\—we handle everything." },
              { step: "4", title: "Enjoy Your Lawn", desc: "Come home to a perfectly maintained lawn without lifting a finger." },
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
        title="Ready to stop mowing your own lawn?"
        description="Get a free, no-obligation quote. We'll have pricing to you within 24 hours."
        variant="compact"
      />

      {/* ═══════════════════════════════════════════════════════════════════
          TIMING & FREQUENCY — Seasonal knowledge
      ════════════════════════════════════════════════════════════════════ */}
      <section className="py-14 md:py-20">
        <div className="container mx-auto px-4">
          <ScrollReveal>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-12 text-center">
              When & How Often to Mow in Wisconsin
            </h2>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <ScrollReveal delay={0.1}>
              <GlassCard hover="glow" className="h-full">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-primary/10 rounded-full p-2">
                    <Calendar className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-white">Mowing Season</h3>
                </div>
                <p className="text-white/60 mb-4">
                  In Dane County, the mowing season typically runs <strong className="text-white">mid-April through early November</strong>&mdash;about 28 weeks.
                </p>
                <ul className="space-y-2.5 text-sm text-white/60">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    Spring: Faster growth requires weekly service
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    Summer: Heat slows growth; we adjust timing
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    Fall: Final cuts prepare lawn for winter
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
                  <h3 className="text-xl font-semibold text-white">Service Frequency</h3>
                </div>
                <p className="text-white/60 mb-4">
                  <strong className="text-white">Weekly mowing</strong> is ideal for most Madison lawns during peak season.
                </p>
                <ul className="space-y-2.5 text-sm text-white/60">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span><strong className="text-white">Weekly:</strong> Best for lawn health and appearance</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span><strong className="text-white">Bi-weekly:</strong> Budget option during slow growth</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span><strong className="text-white">Custom:</strong> Flexible schedules available</span>
                  </li>
                </ul>
              </GlassCard>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          BENEFITS — Why professional mowing in Madison
      ════════════════════════════════════════════════════════════════════ */}
      <section className="py-14 md:py-20" style={{ background: '#0a3520' }}>
        <div className="container mx-auto px-4">
          <ScrollReveal>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-12 text-center">
              Why Madison Homeowners Choose Professional Mowing
            </h2>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-4xl mx-auto">
            {[
              {
                title: "Wisconsin-Tuned Cutting Heights",
                desc: "Our cool-season grass here in Dane County (Kentucky bluegrass, fescue) needs different care than southern lawns. We adjust cutting height through the season\—typically 3-3.5\" during summer heat."
              },
              {
                title: "Enjoy Your Short Summer",
                desc: "Madison summers average just 14 weeks of prime outdoor weather. Spend yours at the lakes, farmers markets, and Badger games\—not pushing a mower every Saturday morning."
              },
              {
                title: "Neighborhood Curb Appeal",
                desc: "From Nakoma and Maple Bluff to newer developments in Waunakee and Sun Prairie, a professionally striped lawn stands out on any block."
              },
              {
                title: "Same Crew, Same Day",
                desc: "Your TotalGuard crew knows your property, your preferences, and exactly what \"done right\" looks like\—because it's the same team every single week."
              },
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

      {/* ═══════════════════════════════════════════════════════════════════
          WHAT MAKES US DIFFERENT — Final trust
      ════════════════════════════════════════════════════════════════════ */}
      <section className="py-14 md:py-20">
        <div className="container mx-auto px-4">
          <ScrollReveal>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 text-center">
              What Makes TotalGuard Different
            </h2>
            <p className="text-center text-white/60 mb-12 max-w-2xl mx-auto">
              We know you&apos;ve been burned by lawn guys who don&apos;t show up or deliver inconsistent results. Here&apos;s how we&apos;re different:
            </p>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-5xl mx-auto">
            {[
              { icon: Users, title: "Same Crew Guarantee", desc: "No revolving door of random workers. Your dedicated crew learns your property and preferences\—and shows up consistently." },
              { icon: Shield, title: "Satisfaction Promise", desc: "Not happy with any visit? We'll come back and fix it\—no questions asked, no extra charge." },
              { icon: Zap, title: "Rain-Day Flexibility", desc: "When Wisconsin weather doesn't cooperate, we adjust. We'll mow within a day of your scheduled visit." },
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

      {/* Problem Resolution */}
      <ProblemResolution variant="full" />

      {/* ═══════════════════════════════════════════════════════════════════
          PRICING — Clear, cinematic pricing card
      ════════════════════════════════════════════════════════════════════ */}
      <section className={cn("py-14 md:py-20", MOBILE_ORDER.PRICING)}>
        <div className="container mx-auto px-4">
          <ScrollReveal>
            <div className="max-w-2xl mx-auto">
              <GlassCard variant="accent" hover="glow" className="text-center p-8 md:p-10">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Madison-Area Mowing Pricing</h2>
                <div className="flex items-baseline justify-center gap-1 mb-4">
                  <span className="text-5xl md:text-6xl font-bold text-primary">$55</span>
                  <span className="text-2xl text-white/60">&ndash;</span>
                  <span className="text-5xl md:text-6xl font-bold text-primary">$85</span>
                  <span className="text-white/60 text-lg ml-1">/visit</span>
                </div>
                <p className="text-white/60 mb-6 leading-relaxed">
                  Pricing depends on lot size, obstacles, and terrain. We&apos;ll provide an exact quote after a quick property assessment&mdash;no surprises, no hidden fees.
                </p>
                <div className="flex flex-wrap justify-center gap-4 mb-8 text-sm text-white/60">
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4 text-primary" />
                    April through November (28 weeks)
                  </span>
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    20-45 min per visit
                  </span>
                </div>
                <Button size="lg" className="font-bold text-lg" asChild>
                  <Link href="/contact?service=mowing">Get Your Free Quote <ArrowRight className="ml-2 h-5 w-5" /></Link>
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
        heading="Enhance Your Lawn Care"
        subheading="Mowing is the foundation — these services take your lawn to the next level:"
        items={[
          { href: "/services/fertilization", title: "Fertilization", desc: "Feed your lawn for thick, green growth", price: "$95/visit" },
          { href: "/services/aeration", title: "Aeration", desc: "Break up compacted soil for deeper roots", price: "$75/visit" },
          { href: "/services/weeding", title: "Weeding", desc: "Keep your beds weed-free", price: "$40/visit" },
          { href: "/services/mulching", title: "Mulching", desc: "Complete the polished look", price: "$50/yd" },
        ]}
      />

      <ResidentialHomeownerTypesSection serviceName="lawn mowing" />
      <ResidentialExpectationsSection serviceName="lawn mowing" />

      <ServiceFAQ faqs={mowingFAQs} />

      <CTASection />

      {/* Serving Across Dane County */}
      <section className="py-16" style={{ background: 'rgba(255,255,255,0.01)', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="container mx-auto px-4 max-w-5xl">
          <h2 className="text-3xl font-bold text-white mb-3" style={{ fontFamily: 'var(--font-display)' }}>
            We Provide Lawn Mowing Across Dane County
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
                href={`/lawn-mowing-${city.slug}-wi`}
                className="flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium group transition-all duration-200"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(34,197,94,0.1)', color: 'rgba(255,255,255,0.65)' }}
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
