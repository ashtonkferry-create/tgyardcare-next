'use client';

import { useRef, useCallback } from 'react';
import Link from "next/link";
import Image from "next/image";
import { Button } from '@/components/ui/button';
import { motion, type Variants } from 'framer-motion';
import { Phone, Shield, Star, CheckCircle2, Sun, ArrowRight, AlertTriangle } from 'lucide-react';
import heroSummerMowing from '@/assets/hero-summer-mowing.jpg';
import { SITE_STATS, getSeasonLabel } from '@/lib/seasonalConfig';
import { MobileValueChips } from '@/components/MobileValueStrip';
import { AmbientParticles } from '@/components/AmbientParticles';
import { MagneticButton } from '@/components/home/MagneticButton';
import { GrassEdge } from '@/components/home/GrassEdge';
import { MowerCharacter } from '@/components/home/MowerCharacter';

/** Stagger container variant */
const stagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

/** Fade-up child variant */
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.4, 0.25, 1] },
  },
};

export function SummerHero() {
  const mowerXRef = useRef(0);

  const handleMowerPosition = useCallback((x: number) => {
    mowerXRef.current = x;
  }, []);

  return (
    <section className="relative overflow-hidden">
      {/* Cinematic gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-green-950 via-[#0a3520] to-green-950" />

      {/*
        VIDEO SWAP SLOT:
        Replace the static background image with a <video> for cinematic looping hero.
        <video autoPlay muted loop playsInline poster={heroSummerMowing.src}
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src="/videos/summer-hero.mp4" type="video/mp4" />
        </video>
      */}

      {/* MOBILE-FIRST: Tightened so grass/character visible without scroll */}
      <div className="min-h-[420px] sm:min-h-[460px] lg:min-h-[560px] pb-[28px]">

        {/* Static background image */}
        <div className="absolute inset-0">
          <Image
            src={heroSummerMowing}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 w-full h-full object-cover opacity-[0.15]"
            priority
            sizes="100vw"
            fill
          />
        </div>

        {/* Gradient overlays for text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-green-950/95 via-[#0a3520]/80 to-[#0a3520]/60" />
        <div className="absolute inset-0 bg-gradient-to-t from-green-950/50 via-transparent to-transparent" />

        {/* Center radial glow — draws the eye to content */}
        <div className="absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] rounded-full blur-[150px] bg-emerald-500/[0.08] pointer-events-none" />

        {/* Ambient Orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none motion-reduce:hidden">
          <div className="absolute -top-20 -right-20 w-[300px] lg:w-[500px] h-[300px] lg:h-[500px] bg-green-800/20 rounded-full blur-3xl animate-drift-1" style={{ animationDuration: '20s' }} />
          <div className="absolute bottom-0 left-0 w-[200px] lg:w-[400px] h-[200px] lg:h-[400px] bg-green-900/15 rounded-full blur-3xl animate-drift-2" style={{ animationDuration: '24s' }} />
          <div className="absolute top-[30%] left-[40%] w-[250px] lg:w-[350px] h-[250px] lg:h-[350px] bg-emerald-800/10 rounded-full blur-3xl animate-drift-3 hidden sm:block" style={{ animationDuration: '18s' }} />
          <div className="absolute top-[10%] right-[30%] w-[180px] lg:w-[280px] h-[180px] lg:h-[280px] bg-green-700/8 rounded-full blur-3xl animate-drift-1 hidden lg:block" style={{ animationDuration: '22s', animationDelay: '-6s' }} />
        </div>

        {/* AmbientParticles */}
        <AmbientParticles density="dense" />

        {/* Cinematic vignette overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(0,0,0,0.25)_100%)] pointer-events-none" />

        {/* Depth gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/25 pointer-events-none" />

        {/* Subtle Grid Pattern - hidden on mobile */}
        <div className="absolute inset-0 opacity-[0.03] hidden lg:block pointer-events-none" style={{
          backgroundImage: 'linear-gradient(rgba(34,197,94,.3) 1px, transparent 1px), linear-gradient(90deg, rgba(34,197,94,.3) 1px, transparent 1px)',
          backgroundSize: '60px 60px'
        }} />

        {/* Main Content */}
        <div className="container mx-auto px-4 sm:px-6 relative z-10 py-6 sm:py-8 md:py-12 lg:py-16">
          <div className="grid lg:grid-cols-2 gap-6 lg:gap-12 items-center max-w-7xl mx-auto">

            {/* Content Column — Staggered Framer Motion reveal */}
            <motion.div
              className="order-1 flex flex-col justify-center"
              variants={stagger}
              initial="hidden"
              animate="visible"
            >
              {/* Season Badge */}
              <motion.div variants={fadeUp} className="inline-flex items-center gap-2 bg-white/[0.06] backdrop-blur-md text-white px-3 py-2 rounded-full text-xs sm:text-sm font-semibold mb-4 lg:mb-6 border border-emerald-500/20 w-fit">
                <Sun className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-yellow-400 animate-spin" style={{ animationDuration: '10s' }} />
                <span className="text-green-100">{getSeasonLabel('summer')}</span>
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                <span className="text-green-300 font-bold">Booking Now</span>
              </motion.div>

              {/* Problem-First Headline — word-by-word blur-fade reveal */}
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black text-white mb-3 sm:mb-4 lg:mb-5 leading-[1.15] tracking-tight">
                {['Tired', 'of', 'Lawn', 'Guys'].map((word, i) => (
                  <motion.span
                    key={word}
                    className="inline-block mr-[0.3em]"
                    initial={{ opacity: 0, y: 12, filter: 'blur(8px)' }}
                    animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                    transition={{ delay: 0.15 + i * 0.08, duration: 0.5, ease: [0.25, 0.4, 0.25, 1] }}
                  >
                    {word}
                  </motion.span>
                ))}{' '}
                {["Who", "Don\u2019t", 'Show', 'Up?'].map((word, i) => (
                  <motion.span
                    key={word}
                    className="inline-block mr-[0.3em] hero-shimmer-text bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 via-green-300 to-emerald-400 bg-[length:200%_auto]"
                    initial={{ opacity: 0, y: 12, filter: 'blur(8px)' }}
                    animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                    transition={{
                      delay: 0.15 + (4 + i) * 0.08,
                      duration: 0.5,
                      ease: [0.25, 0.4, 0.25, 1],
                    }}
                  >
                    {word}
                  </motion.span>
                ))}
              </h1>

              {/* Value Prop Subhead */}
              <motion.p variants={fadeUp} className="text-base sm:text-lg md:text-xl text-green-100/90 mb-4 lg:mb-6 leading-relaxed">
                We show up. Same crew. Same day. Every week.
                <span className="block mt-2 text-emerald-300 font-bold text-lg md:text-xl" style={{ textShadow: '0 0 20px rgba(52,211,153,0.3)' }}>
                  No excuses. No surprises.
                </span>
              </motion.p>

              {/* MOBILE: Compact value chips */}
              <motion.div variants={fadeUp} className="lg:hidden mb-4">
                <MobileValueChips />
              </motion.div>

              {/* DESKTOP: Outcome-Focused Benefits */}
              <motion.ul variants={fadeUp} className="hidden lg:block space-y-3 mb-6 text-green-100/90">
                {[
                  'Weekly mowing\u2014same crew, same schedule, on time',
                  'One call handles your entire property',
                  'Flat pricing. No hidden fees. No surprises.'
                ].map((item, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-3 group hover:translate-x-1 transition-transform duration-200"
                  >
                    <CheckCircle2 className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                    <span className="text-base md:text-lg">{item}</span>
                  </li>
                ))}
              </motion.ul>

              {/* Trust Chips - Hidden on mobile */}
              <motion.div variants={fadeUp} className="hidden lg:flex flex-wrap gap-2 mb-6">
                {['80+ Google Reviews', '4.9\u2605 Rating', 'Fully Insured'].map((chip) => (
                  <span
                    key={chip}
                    className="inline-flex items-center gap-1.5 bg-white/[0.05] backdrop-blur-md text-green-100 px-3.5 py-2 rounded-full text-sm font-medium border border-white/[0.1] hover:bg-white/[0.08] hover:border-white/[0.15] transition-all duration-300 cursor-default"
                  >
                    <Shield className="h-3.5 w-3.5 text-green-400" />
                    {chip}
                  </span>
                ))}
              </motion.div>

              {/* CTAs — Magnetic wrapping */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2, duration: 0.5 }}
                className="flex flex-col sm:flex-row gap-3 mb-4 lg:mb-6"
              >
                <MagneticButton>
                  <Button
                    size="lg"
                    className="group text-white text-base font-bold px-6 sm:px-7 h-12 sm:h-14 shadow-lg transition-all duration-300 hover:scale-[1.02] tap-target w-full sm:w-auto rounded-xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-green-500 hover:from-emerald-500 hover:via-emerald-400 hover:to-green-400 shadow-emerald-900/30 hover:shadow-emerald-800/40 hover:shadow-xl"
                    asChild
                  >
                    <Link href="/contact?service=mowing">
                      <span className="flex items-center justify-center">
                        Get My Free Quote
                        <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                      </span>
                    </Link>
                  </Button>
                </MagneticButton>

                <MagneticButton radius={100} maxDisplacement={6}>
                  <Button
                    size="lg"
                    variant="outline"
                    className="group border-2 border-green-500/50 bg-green-800/20 text-green-100 hover:bg-green-700/30 hover:border-green-400 text-base font-bold px-6 sm:px-7 h-12 sm:h-14 transition-all duration-300 tap-target backdrop-blur-md w-full sm:w-auto"
                    asChild
                  >
                    <a href="tel:608-535-6057">
                      <Phone className="mr-2 h-5 w-5 group-hover:rotate-12 transition-transform" />
                      (608) 535-6057
                    </a>
                  </Button>
                </MagneticButton>
              </motion.div>

              {/* Floating Stats — Glass Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.4, duration: 0.6 }}
                className="hidden lg:grid grid-cols-4 gap-4 mb-4 p-4 rounded-2xl bg-white/[0.04] backdrop-blur-md border border-white/[0.08]"
              >
                {[
                  { value: '500+', label: 'Properties' },
                  { value: '4.9\u2605', label: 'Google Rating' },
                  { value: '12', label: 'Cities Served' },
                  { value: '24hr', label: 'Quote Response' },
                ].map((stat) => (
                  <div key={stat.label} className="text-center">
                    <div className="text-xl font-black text-white">{stat.value}</div>
                    <div className="text-[10px] text-emerald-300/60 font-medium uppercase tracking-wider">{stat.label}</div>
                  </div>
                ))}
              </motion.div>

              {/* Social Proof */}
              <motion.div variants={fadeUp} className="flex flex-wrap items-center gap-3 lg:gap-4 pt-2">
                <div className="flex items-center gap-2 lg:gap-3">
                  <div className="flex -space-x-2">
                    {['J', 'M', 'S', '+'].map((letter, i) => (
                      <div
                        key={letter}
                        className="w-8 h-8 lg:w-10 lg:h-10 rounded-full flex items-center justify-center text-[10px] lg:text-xs font-bold text-white ring-2 ring-green-950 shadow-lg"
                        style={{
                          background: i === 3
                            ? 'linear-gradient(135deg, #475569, #334155)'
                            : `linear-gradient(135deg, ${['#22c55e', '#16a34a', '#15803d'][i]}, ${['#16a34a', '#15803d', '#166534'][i]})`
                        }}
                      >
                        {letter}
                      </div>
                    ))}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-white font-bold text-xs lg:text-sm leading-tight">{SITE_STATS.totalClients}+ Clients</span>
                    <span className="text-green-400/60 text-[10px] lg:text-xs">Madison Area</span>
                  </div>
                </div>

                <div className="hidden sm:block w-px h-8 lg:h-10 bg-green-600/30" />

                <div className="flex items-center gap-2">
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-3.5 w-3.5 lg:h-4 lg:w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-white font-bold text-xs lg:text-sm leading-tight">{SITE_STATS.googleRating}/5</span>
                    <span className="text-green-400/60 text-[10px] lg:text-xs">Google</span>
                  </div>
                </div>
              </motion.div>
            </motion.div>

            {/* Hero Image Column */}
            <motion.div
              className="order-2 relative lg:flex lg:items-center"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.3, ease: 'easeOut' }}
            >
              {/* Subtle Glow Effect */}
              <div className="absolute -inset-6 bg-emerald-500/[0.08] rounded-3xl blur-3xl" />

              <div className="relative w-full group">
                {/* Pulsing green glow border */}
                <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-r from-emerald-500/20 via-transparent to-emerald-500/20 animate-pulse pointer-events-none" style={{ animationDuration: '3s' }} />

                <Image
                  src={heroSummerMowing}
                  alt="Professional lawn mowing service with commercial mower creating perfect striped patterns in Madison Wisconsin"
                  className="rounded-2xl shadow-2xl w-full h-auto object-cover aspect-[16/10] border border-white/[0.1] group-hover:scale-[1.02] transition-transform duration-500"
                  priority
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />

                {/* Floating Stats Card */}
                <div className="absolute -bottom-4 -left-4 rounded-xl p-4 shadow-2xl hidden sm:block animate-fade-in hover:scale-105 transition-transform duration-300 bg-white/[0.06] backdrop-blur-xl border border-white/[0.1]" style={{ animationDelay: '0.6s' }}>
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-full bg-green-600 shadow-lg">
                      <CheckCircle2 className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-white font-black text-lg leading-none">Same Day</p>
                      <p className="text-green-400/70 text-[11px] font-semibold uppercase tracking-wide">Quote Response</p>
                    </div>
                  </div>
                </div>

                {/* Badge */}
                <div className="absolute -top-3 -right-3 bg-amber-500 text-black px-4 py-2 rounded-full shadow-xl text-sm font-bold hidden sm:flex items-center gap-2 animate-fade-in hover:scale-105 transition-transform" style={{ animationDelay: '0.5s' }}>
                  <AlertTriangle className="h-4 w-4" />
                  Routes Filling Fast
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Grass edge + Mower character at bottom */}
      <GrassEdge mowerXRef={mowerXRef} mowerActive={true} />
      <MowerCharacter onPositionChange={handleMowerPosition} traversalDuration={20} />

      {/* Hero shimmer animation */}
      <style>{`
        @keyframes hero-shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        .hero-shimmer-text {
          animation: hero-shimmer 4s linear infinite;
        }
      `}</style>
    </section>
  );
}
