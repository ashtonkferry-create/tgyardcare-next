'use client';

import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import Link from "next/link";
import Image from "next/image";
import { motion, type Variants } from 'framer-motion';
import { Phone, Shield, Star, CheckCircle2, Leaf, ArrowRight, Zap } from 'lucide-react';
import heroFallLeaves from '@/assets/hero-fall-leaves.jpg';
import { SEASONAL_STATS, SITE_STATS, getSeasonLabel } from '@/lib/seasonalConfig';
import { MobileValueChips } from '@/components/MobileValueStrip';

/** Stagger container variant */
const stagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
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

export function FallHero() {
  const stats = SEASONAL_STATS.fall;
  const sectionRef = useRef<HTMLElement>(null);
  const [scrollY, setScrollY] = useState(0);

  // Parallax scroll effect
  useEffect(() => {
    function handleScroll() {
      if (sectionRef.current) {
        const rect = sectionRef.current.getBoundingClientRect();
        if (rect.bottom > 0) {
          setScrollY(window.scrollY * 0.3);
        }
      }
    }
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative bg-gradient-to-br from-stone-950 via-amber-950 to-stone-900 overflow-hidden min-h-[600px] lg:min-h-[700px]"
    >
      {/*
        VIDEO SWAP SLOT:
        Replace the static background with a <video> for cinematic looping hero.
        <video autoPlay muted loop playsInline poster={heroFallLeaves.src}
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src="/videos/fall-hero.mp4" type="video/mp4" />
        </video>
      */}

      {/* Parallax background layer */}
      <div
        className="absolute inset-0 will-change-transform"
        style={{ transform: `translateY(${scrollY}px)` }}
      >
        <Image
          src={heroFallLeaves}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover opacity-20"
          priority
          sizes="100vw"
          fill
        />
      </div>

      {/* Gradient overlay for text readability */}
      <div className="absolute inset-0 bg-gradient-to-r from-stone-950/95 via-stone-950/80 to-stone-950/60" />
      <div className="absolute inset-0 bg-gradient-to-t from-stone-950/50 via-transparent to-transparent" />

      {/* Falling Leaves Animation */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none motion-reduce:hidden">
        {[...Array(40)].map((_, i) => {
          const colors = ['#d97706', '#b45309', '#92400e', '#78350f', '#fbbf24', '#ea580c', '#c2410c'];
          const duration = 8 + Math.random() * 8;
          const startY = Math.random() * 100;
          return (
            <div
              key={i}
              className="absolute animate-fall-leaf"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${startY}%`,
                animationDelay: `${-Math.random() * duration}s`,
                animationDuration: `${duration}s`,
                color: colors[Math.floor(Math.random() * colors.length)]
              }}
            >
              <Leaf
                className="opacity-40"
                style={{
                  transform: `rotate(${Math.random() * 360}deg)`,
                  width: `${12 + Math.random() * 10}px`,
                  height: `${12 + Math.random() * 10}px`
                }}
              />
            </div>
          );
        })}
      </div>

      {/* Luxury Gradient Orbs - Deep Amber/Gold */}
      <div className="absolute top-10 left-10 w-80 h-80 bg-amber-600/15 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-orange-700/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      <div className="absolute top-1/2 right-1/4 w-72 h-72 bg-yellow-600/8 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />

      {/* Dark Luxury Gradient Overlays */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(180,83,9,0.15)_0%,transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(120,53,15,0.12)_0%,transparent_50%)]" />

      {/* Subtle Grid Pattern */}
      <div className="absolute inset-0 opacity-[0.02]" style={{
        backgroundImage: 'linear-gradient(rgba(251,191,36,.15) 1px, transparent 1px), linear-gradient(90deg, rgba(251,191,36,.15) 1px, transparent 1px)',
        backgroundSize: '60px 60px'
      }} />

      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 relative z-10 py-12 sm:py-16 md:py-20 lg:py-24">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center max-w-7xl mx-auto">

          {/* Content Column — Staggered Framer Motion reveal */}
          <motion.div
            className="order-1 flex flex-col justify-center"
            variants={stagger}
            initial="hidden"
            animate="visible"
          >
            {/* Season Badge - Luxury Gold */}
            <motion.div variants={fadeUp} className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-900/40 to-orange-900/30 backdrop-blur-md text-white px-4 py-2.5 rounded-full text-sm font-semibold mb-6 border border-amber-500/30 w-fit shadow-lg shadow-amber-900/20">
              <Leaf className="h-4 w-4 text-amber-400 animate-bounce" style={{ animationDuration: '2s' }} />
              <span className="text-amber-100">{getSeasonLabel('fall')}</span>
              <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse" />
              <span className="text-amber-300 font-bold">Book Early</span>
            </motion.div>

            {/* Main Headline */}
            <motion.h1 variants={fadeUp} className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white mb-5 leading-[1.1] tracking-tight">
              <span className="inline-block">Stop Raking.</span>{' '}
              <span className="inline-block bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 bg-clip-text text-transparent bg-[length:200%_auto]" style={{ animation: 'gradient-shift 3s ease infinite' }}>
                We&apos;ll Handle Fall.
              </span>
            </motion.h1>

            {/* Value Prop Subhead */}
            <motion.p variants={fadeUp} className="text-lg md:text-xl text-amber-100/90 mb-4 leading-relaxed">
              Leaf removal, gutter cleaning, and aeration\u2014done before the snow flies.
              <span className="block mt-1 text-amber-300 font-semibold">Same crew. Clear pricing. No leaf left behind.</span>
            </motion.p>

            {/* MOBILE: Compact trust chips */}
            <motion.div variants={fadeUp} className="lg:hidden mb-4">
              <MobileValueChips />
            </motion.div>

            {/* Value Props */}
            <motion.ul variants={fadeUp} className="space-y-3 mb-6 text-amber-100/80">
              {[
                'Multi-visit leaf cleanup packages',
                'Gutter cleaning so you never climb that ladder',
                'Aeration + overseeding for a thicker spring lawn'
              ].map((item, i) => (
                <li
                  key={i}
                  className="flex items-start gap-3 group hover:translate-x-1 transition-transform duration-200"
                >
                  <CheckCircle2 className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                  <span className="text-base md:text-lg">{item}</span>
                </li>
              ))}
            </motion.ul>

            {/* Trust Chips - Gold Accent -- desktop only */}
            <motion.div variants={fadeUp} className="hidden lg:flex flex-wrap gap-2 mb-6">
              {['80+ Google Reviews', '4.9\u2605 Rating', 'Fully Insured'].map((chip) => (
                <span
                  key={chip}
                  className="inline-flex items-center gap-1.5 bg-amber-900/30 backdrop-blur-md text-amber-100 px-3.5 py-2 rounded-full text-sm font-medium border border-amber-600/30 hover:bg-amber-800/40 hover:border-amber-500/40 transition-all duration-300 cursor-default"
                >
                  <Shield className="h-3.5 w-3.5 text-amber-400" />
                  {chip}
                </span>
              ))}
            </motion.div>

            {/* Premium CTAs - Luxury Gold Gradient */}
            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-3 mb-6">
              <Button
                size="lg"
                className="group bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white text-base font-bold px-7 h-14 shadow-xl shadow-amber-900/40 hover:shadow-2xl hover:shadow-amber-800/50 transition-all duration-300 hover:scale-[1.02] tap-target relative overflow-hidden"
                asChild
              >
                <Link href="/contact?service=fall-cleanup">
                  <span className="relative z-10 flex items-center">
                    Get My Free Quote
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-yellow-500 to-amber-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </Link>
              </Button>

              <Button
                size="lg"
                variant="outline"
                className="group border-2 border-amber-500/40 bg-amber-900/20 text-amber-100 hover:bg-amber-800/30 hover:border-amber-400/60 text-base font-bold px-7 h-14 transition-all duration-300 tap-target backdrop-blur-md"
                asChild
              >
                <a href="tel:608-535-6057">
                  <Phone className="mr-2 h-5 w-5 group-hover:rotate-12 transition-transform" />
                  (608) 535-6057
                </a>
              </Button>
            </motion.div>

            {/* Social Proof - Gold Theme */}
            <motion.div variants={fadeUp} className="flex flex-wrap items-center gap-4 pt-2">
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2.5">
                  {['J', 'M', 'S', '+'].map((letter, i) => (
                    <div
                      key={letter}
                      className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold text-white ring-2 ring-stone-900 shadow-lg hover:scale-110 transition-transform cursor-default"
                      style={{
                        background: i === 3
                          ? 'linear-gradient(135deg, #57534e, #44403c)'
                          : `linear-gradient(135deg, ${['#d97706', '#b45309', '#92400e'][i]}, ${['#b45309', '#92400e', '#78350f'][i]})`
                      }}
                    >
                      {letter}
                    </div>
                  ))}
                </div>
                <div className="flex flex-col">
                  <span className="text-white font-bold text-sm leading-tight">{SITE_STATS.totalClients}+ Clients</span>
                  <span className="text-amber-300/50 text-xs">Madison Area</span>
                </div>
              </div>

              <div className="hidden sm:block w-px h-10 bg-amber-600/30" />

              <div className="flex items-center gap-2">
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-3.5 w-3.5 lg:h-4 lg:w-4 fill-amber-400 text-amber-400 hover:scale-125 transition-transform" />
                  ))}
                </div>
                <div className="flex flex-col">
                  <span className="text-white font-bold text-xs lg:text-sm leading-tight">{SITE_STATS.googleRating}/5</span>
                  <span className="text-amber-300/50 text-[10px] lg:text-xs">Google</span>
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
            {/* Premium Glow Effect - Gold */}
            <div className="absolute -inset-8 bg-gradient-to-r from-amber-600/20 via-orange-600/15 to-amber-600/20 rounded-3xl blur-3xl animate-pulse" />

            <div className="relative w-full group">
              <Image
                src={heroFallLeaves}
                alt="Professional fall leaf cleanup with leaf blower scattering autumn leaves in Madison Wisconsin"
                className="rounded-2xl shadow-2xl w-full h-auto object-cover aspect-[16/10] border border-amber-500/20 group-hover:scale-[1.02] transition-transform duration-500"
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
              />

              {/* Floating Stats Card - Gold Theme */}
              <div className="absolute -bottom-4 -left-4 bg-gradient-to-br from-stone-900 to-stone-800 rounded-xl p-4 shadow-2xl border border-amber-600/30 hidden sm:block animate-fade-in hover:scale-105 transition-transform duration-300" style={{ animationDelay: '0.6s' }}>
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg">
                    <CheckCircle2 className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-white font-black text-lg leading-none">{stats.heroStat.value}</p>
                    <p className="text-amber-400/70 text-[11px] font-semibold uppercase tracking-wide">{stats.heroStat.label}</p>
                  </div>
                </div>
              </div>

              {/* Badge - Gold Luxury */}
              <div className="absolute -top-3 -right-3 bg-gradient-to-r from-amber-600 to-orange-600 text-white px-4 py-2 rounded-full shadow-xl text-sm font-bold hidden sm:flex items-center gap-2 animate-fade-in hover:scale-105 transition-transform" style={{ animationDelay: '0.5s' }}>
                <Zap className="h-4 w-4 text-yellow-300 animate-pulse" />
                {stats.badgeText}
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Custom Animations */}
      <style>{`
        @keyframes fall-leaf {
          0% { transform: translateY(-20px) rotate(0deg) translateX(0); opacity: 0; }
          10% { opacity: 0.4; }
          25% { transform: translateY(25vh) rotate(90deg) translateX(40px); }
          50% { transform: translateY(50vh) rotate(180deg) translateX(-20px); }
          75% { transform: translateY(75vh) rotate(270deg) translateX(30px); }
          90% { opacity: 0.4; }
          100% { transform: translateY(110vh) rotate(360deg) translateX(-10px); opacity: 0; }
        }
        @keyframes gradient-shift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-fall-leaf {
          animation: fall-leaf linear infinite;
        }
      `}</style>
    </section>
  );
}
