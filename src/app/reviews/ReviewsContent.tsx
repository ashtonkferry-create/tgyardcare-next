'use client';

import { Star, Quote, ThumbsUp, CheckCircle, ExternalLink, MessageSquare } from "lucide-react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import CTASection from '@/components/CTASection';
import { ReviewPageSchema } from "@/components/schemas/ReviewPageSchema";
import { WebPageSchema } from "@/components/schemas/WebPageSchema";
import { GlassCard } from '@/components/GlassCard';
import { ScrollReveal } from '@/components/ScrollReveal';
import { AnimatedCounter } from '@/components/AnimatedCounter';
import { AmbientParticles } from '@/components/AmbientParticles';
import { useSeasonalTheme } from '@/contexts/SeasonalThemeContext';
import Link from "next/link";

const seasonalAccent = {
  summer: { text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', solid: '#10b981' },
  fall:   { text: 'text-amber-400',   bg: 'bg-amber-500/10',   border: 'border-amber-500/30',   solid: '#f59e0b' },
  winter: { text: 'text-cyan-400',    bg: 'bg-cyan-500/10',    border: 'border-cyan-500/30',    solid: '#06b6d4' },
} as const;

const seasonalBg = {
  summer: {
    hero:    'radial-gradient(ellipse 70% 50% at 50% 0%, rgba(16,185,129,0.15) 0%, transparent 70%), linear-gradient(to bottom, #050d07, #0a1a0e, #060e08)',
    page:    '#050d07',
    section: '#0a1a0e',
  },
  fall: {
    hero:    'radial-gradient(ellipse 70% 50% at 50% 0%, rgba(245,158,11,0.15) 0%, transparent 70%), linear-gradient(to bottom, #0d0900, #1a1000, #0d0900)',
    page:    '#0d0900',
    section: '#1a1000',
  },
  winter: {
    hero:    'radial-gradient(ellipse 70% 50% at 50% 0%, rgba(6,182,212,0.15) 0%, transparent 70%), linear-gradient(to bottom, #020810, #060f1a, #020810)',
    page:    '#020810',
    section: '#060f1a',
  },
} as const;

const reviews = [
  { name: "Kaleb D.", rating: 5, date: "Yesterday", text: "TotalGuard Yard Care has been fantastic to work with. The lawn mowing and trimming are always done professionally.", service: "Lawn Mowing & Trimming" },
  { name: "Will J.", rating: 5, date: "4 weeks ago", text: "We hired TotalGuard Yard Care after dealing with inconsistent service from other companies, and the difference was immediate.", service: "Lawn Care" },
  { name: "Nick B.", rating: 5, date: "5 weeks ago", text: "I recently purchased a seasonal round of herbicide treatment and I am beyond grateful for TotalGuard. They were very prompt on their response time, and did a great job killing my dandelions. Highly recommend.", service: "Herbicide Treatment" },
  { name: "Barb O.", rating: 5, date: "16 weeks ago", text: "Vance is responsive and the work is well done. They took on a job that others would not. They are also very quick. They have lots of energy. Highly recommend.", service: "Mulching & Weeding" },
  { name: "Bryce", rating: 5, date: "36 weeks ago", text: "Called for a gutter cleaning and ended up hiring them for mowing too. These guys are punctual, friendly, and very detail-oriented. My gutters used to overflow — now they drain perfectly. Worth every penny.", service: "Gutter Cleaning" },
  { name: "Matthew W.", rating: 5, date: "38 weeks ago", text: "Vance and Alex did an excellent job of mulching our perennial beds, several located on fairly steep pitches. Very professional, careful attention to detail, good cleanup.", service: "Mulching" },
  { name: "Kyle G.", rating: 5, date: "Jul 2024", text: "I recently hired TotalGuard Yard Care to take care of my lawn, and I couldn't be more pleased with the service they provided.", service: "Lawn Care" },
  { name: "Tracy B.", rating: 5, date: "Jun 2024", text: "Vance was quick to respond to my request, was easy to work with, arrived as promised and did an amazing job with helping clear out weeds and get my plant bed looking great.", service: "Garden Beds & Weeding" },
  { name: "Carla R.", rating: 5, date: "Jun 2024", text: "They did such a good job with my gutters. Fast responses and they came over the next day I contacted them. Would totally recommend their services.", service: "Gutter Cleaning" },
  { name: "Ian F.", rating: 5, date: "Jun 2024", text: "Total Guard Yard care exceeded my expectations with their professionalism and attention to detail. My yard has never looked better.", service: "Lawn Care" },
  { name: "Peter M.", rating: 5, date: "4 weeks ago", text: "Very professional and easy to work with. Communication was clear, pricing was fair, and the results were solid. Our lawn hasn't looked this clean in a long time.", service: "Lawn Care" },
  { name: "Erica S.", rating: 5, date: "31 weeks ago", text: "TotalGuard Yard Care did a fantastic job installing edging to prevent runoff in my front yard at a reasonable cost!", service: "Edging & Garden Beds" },
];

// Pull quotes — featured at top
const highlights = [
  { quote: "We hired TotalGuard Yard Care after dealing with inconsistent service from other companies, and the difference was immediate.", name: "Will J.", service: "Lawn Care" },
  { quote: "I started out looking in Nextdoor for someone to mow my lawn on a regular basis. Let me tell you how satisfied I am with TotalGuard Yard Care.", name: "Janice G.", service: "Weekly Mowing" },
  { quote: "Vance and Alex did an excellent job of mulching our perennial beds, several located on fairly steep pitches. Very professional, careful attention to detail, good cleanup.", name: "Matthew W.", service: "Mulching" },
];

export default function ReviewsContent() {
  const { activeSeason } = useSeasonalTheme();
  const acc = seasonalAccent[activeSeason];
  const bg = seasonalBg[activeSeason];

  return (
    <div className="min-h-screen text-white" style={{ background: bg.page }}>
      <ReviewPageSchema />
      <WebPageSchema name="Customer Reviews" description="Read what Madison homeowners say about TotalGuard Yard Care" url="/reviews" />
      <Navigation />

      {/* SEO hidden text */}
      <section className="sr-only">
        <h2>TotalGuard Yard Care Customer Reviews</h2>
        <p>TotalGuard Yard Care has earned a 4.9-star rating from 79 verified Google reviews in Madison, Wisconsin. Customers consistently praise reliability, attention to detail, and same-crew-every-visit commitment.</p>
      </section>

      {/* ── HERO ── */}
      <section
        className="relative overflow-hidden py-28 md:py-40"
        style={{ background: bg.hero }}
      >
        <AmbientParticles density="sparse" className="absolute inset-0" />
        <div className={`absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl opacity-10 ${acc.bg}`} />

        <div className="container mx-auto px-4 relative z-10 text-center">
          <ScrollReveal>
            {/* Giant rating display */}
            <div className={`inline-flex items-center gap-3 px-6 py-3 rounded-2xl ${acc.bg} border ${acc.border} mb-10`}>
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <span className="text-white font-bold">Verified Google Reviews</span>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.08}>
            <div className={`text-8xl md:text-[10rem] font-black leading-none mb-2 ${acc.text} tabular-nums`}>
              <AnimatedCounter end={4.9} decimals={1} suffix="★" duration={1800} />
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.15}>
            <h1 className="text-4xl md:text-6xl font-black text-white mb-4 leading-tight">
              What Madison Homeowners Say
            </h1>
          </ScrollReveal>

          <ScrollReveal delay={0.2}>
            <p className="text-xl text-white/55 max-w-2xl mx-auto mb-10 leading-relaxed">
              79 verified Google reviews. Real clients. Real results. Read what homeowners across Dane County say about TotalGuard.
            </p>
          </ScrollReveal>

          <ScrollReveal delay={0.25}>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-black text-lg transition-all duration-300 hover:scale-105 hover:shadow-xl shadow-lg"
                style={{ background: acc.solid }}
              >
                Get a Free Quote
              </Link>
              <a
                href="https://g.page/r/CRW5Dsg2JgwBEBM/review"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-semibold text-white/80 border border-white/10 backdrop-blur-sm hover:border-white/20 hover:text-white transition-all duration-300"
              >
                <MessageSquare className="h-5 w-5" />
                Leave a Review
                <ExternalLink className="h-4 w-4 opacity-60" />
              </a>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ── STATS BAR ── */}
      <section className="py-6 border-y border-white/5" style={{ background: bg.section }}>
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-10 md:gap-20">
            {[
              { value: 4.9, suffix: '★', decimals: 1, label: 'Google Rating', icon: Star },
              { value: 79, suffix: '+', decimals: 0, label: 'Verified Reviews', icon: ThumbsUp },
              { value: 100, suffix: '%', decimals: 0, label: 'Would Recommend', icon: CheckCircle },
            ].map((s, i) => {
              const Icon = s.icon;
              return (
                <ScrollReveal key={i} delay={i * 0.08}>
                  <div className="flex items-center gap-3 text-center">
                    <Icon className={`h-6 w-6 ${acc.text}`} />
                    <div>
                      <div className={`text-2xl font-black ${acc.text}`}>
                        <AnimatedCounter end={s.value} suffix={s.suffix} decimals={s.decimals} />
                      </div>
                      <div className="text-white/40 text-xs font-medium uppercase tracking-wide">{s.label}</div>
                    </div>
                  </div>
                </ScrollReveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── HIGHLIGHT QUOTES ── */}
      <section className="py-16 md:py-20" style={{ background: bg.page }}>
        <div className="container mx-auto px-4">
          <ScrollReveal className="text-center mb-10">
            <h2 className="text-2xl font-black text-white">Top-Rated by Homeowners</h2>
          </ScrollReveal>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {highlights.map((h, i) => (
              <ScrollReveal key={i} delay={i * 0.08}>
                <GlassCard variant="dark" hover="lift" className="text-center h-full">
                  <Quote className={`h-8 w-8 mx-auto mb-4 ${acc.text} opacity-60`} />
                  <p className="text-white/80 text-lg font-medium italic mb-4">&ldquo;{h.quote}&rdquo;</p>
                  <div className="flex justify-center gap-1 mb-3">
                    {[...Array(5)].map((_, j) => (
                      <Star key={j} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <div className="text-white/50 text-sm">
                    <span className="font-semibold text-white/70">{h.name}</span> · {h.service}
                  </div>
                </GlassCard>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── ALL REVIEWS GRID ── */}
      <section className="py-16 md:py-24" style={{ background: bg.section }}>
        <div className="container mx-auto px-4">
          <ScrollReveal className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-black text-white mb-3">
              All Customer Reviews
            </h2>
            <p className="text-white/50 text-lg">Real reviews from real clients across Madison, Middleton, and Waunakee</p>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 max-w-7xl mx-auto">
            {reviews.map((review, index) => (
              <ScrollReveal key={index} delay={(index % 6) * 0.06}>
                <GlassCard variant="dark" hover="lift" className="flex flex-col h-full">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        {/* Avatar initials */}
                        <div
                          className={`w-8 h-8 rounded-full ${acc.bg} border ${acc.border} flex items-center justify-center text-xs font-black ${acc.text}`}
                        >
                          {review.name.charAt(0)}
                        </div>
                        <span className="text-white font-bold">{review.name}</span>
                      </div>
                      <span className="text-white/30 text-xs">{review.date}</span>
                    </div>
                    {/* Google G icon */}
                    <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0">
                      <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                      </svg>
                    </div>
                  </div>

                  {/* Stars */}
                  <div className="flex gap-0.5 mb-4">
                    {[...Array(review.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>

                  {/* Review text */}
                  <p className="text-white/65 flex-grow leading-relaxed text-sm mb-5">
                    &ldquo;{review.text}&rdquo;
                  </p>

                  {/* Service tag */}
                  <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${acc.bg} border ${acc.border} ${acc.text}`}>
                    <CheckCircle className="h-3 w-3" />
                    {review.service}
                  </div>
                </GlassCard>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── LEAVE A REVIEW CTA ── */}
      <section className="py-16" style={{ background: bg.hero }}>
        <div className="container mx-auto px-4 text-center">
          <ScrollReveal>
            <GlassCard variant="dark" hover="none" className="max-w-2xl mx-auto py-12">
              <MessageSquare className={`h-10 w-10 mx-auto mb-5 ${acc.text}`} />
              <h2 className="text-2xl font-black text-white mb-3">Had a Great Experience?</h2>
              <p className="text-white/50 mb-8">Help other Madison homeowners find reliable lawn care. Leave us a review on Google.</p>
              <a
                href="https://g.page/r/CRW5Dsg2JgwBEBM/review"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-black transition-all duration-300 hover:scale-105 hover:shadow-xl shadow-lg"
                style={{ background: acc.solid }}
              >
                Leave a Google Review
                <ExternalLink className="h-4 w-4" />
              </a>
            </GlassCard>
          </ScrollReveal>
        </div>
      </section>

      <CTASection />
      <Footer showCloser={false} />
    </div>
  );
}
