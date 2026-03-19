'use client';

import { useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Phone, Star, Users, Clock, Award } from 'lucide-react';
import SmartQuoteFlow from '@/components/SmartQuoteFlow';

interface ServicePageQuickQuoteProps {
  serviceName: string;
  serviceSlug: string;
  serviceEmoji?: string;
}

const SERVICE_EMOJIS: Record<string, string> = {
  mowing: '🌿',
  fertilization: '🌱',
  aeration: '🌾',
  'spring-cleanup': '🌸',
  'fall-cleanup': '🍂',
  'leaf-removal': '🍁',
  mulching: '🪵',
  'gutter-cleaning': '🏠',
  'gutter-guards': '🛡️',
  'snow-removal': '❄️',
  herbicide: '🌿',
  weeding: '✂️',
  'garden-beds': '🌺',
  pruning: '🌳',
  hardscaping: '🪨',
};

// Dot pattern SVG as data URI — 1.5px dots on 20px grid at 12% opacity
const DOT_PATTERN = `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='2' cy='2' r='1.5' fill='rgba(34%2C197%2C94%2C0.12)'/%3E%3C/svg%3E")`;

const TRUST_PILLS = [
  { icon: Star,  text: '4.9 Google Rating' },
  { icon: Users, text: '80+ Families Served' },
  { icon: Clock, text: 'Same-Day Response' },
  { icon: Award, text: 'Nextdoor Fave' },
] as const;

export default function ServicePageQuickQuote({
  serviceName,
  serviceSlug,
  serviceEmoji,
}: ServicePageQuickQuoteProps) {
  const [quoteOpen, setQuoteOpen] = useState(false);
  const [btnHovered, setBtnHovered] = useState(false);
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  const emoji = serviceEmoji ?? SERVICE_EMOJIS[serviceSlug] ?? '🌿';

  return (
    <>
      <section
        ref={ref}
        className="relative overflow-hidden"
        style={{ background: '#030c06' }}
      >
        {/* Dot pattern */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: DOT_PATTERN }}
        />

        {/* Left glowing border */}
        <div
          className="absolute left-0 top-0 bottom-0 w-1 pointer-events-none"
          style={{
            background:
              'linear-gradient(180deg, transparent 0%, #22c55e 30%, #22c55e 70%, transparent 100%)',
            boxShadow: '4px 0 24px rgba(34,197,94,0.20)',
          }}
        />

        {/* Top edge shine */}
        <div
          className="absolute top-0 left-0 right-0 h-px pointer-events-none"
          style={{
            background:
              'linear-gradient(90deg, transparent 10%, rgba(34,197,94,0.25) 50%, transparent 90%)',
          }}
        />

        {/* Content */}
        <div className="relative container mx-auto px-6 py-14 md:py-20">
          <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-10">

            {/* ── Left: Text + Trust ── */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="flex-1 max-w-xl"
            >
              {/* Service badge */}
              <div
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-5"
                style={{
                  background: 'rgba(34,197,94,0.10)',
                  border: '1px solid rgba(34,197,94,0.25)',
                  color: '#86efac',
                }}
              >
                <span>{emoji}</span>
                <span>{serviceName}</span>
              </div>

              {/* Headline */}
              <h2
                className="font-display font-bold text-white mb-4 leading-tight"
                style={{ fontSize: 'clamp(28px, 4vw, 42px)' }}
              >
                Get Your Free {serviceName} Quote
              </h2>

              {/* Subline */}
              <p
                className="text-sm mb-8 leading-relaxed"
                style={{ color: 'rgba(255,255,255,0.50)' }}
              >
                Answer a few quick questions — we&apos;ll call you back with a price built for
                your exact property. No obligations. Same-day response.
              </p>

              {/* Trust pills */}
              <div className="flex flex-wrap gap-3">
                {TRUST_PILLS.map(({ icon: Icon, text }) => (
                  <div
                    key={text}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium"
                    style={{
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      color: 'rgba(255,255,255,0.55)',
                    }}
                  >
                    <Icon className="w-3 h-3" style={{ color: '#4ade80' }} />
                    {text}
                  </div>
                ))}
              </div>
            </motion.div>

            {/* ── Right: CTA ── */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.15, ease: 'easeOut' }}
              className="flex flex-col items-center md:items-end gap-4 w-full md:w-auto"
              style={{ minWidth: '240px' }}
            >
              {/* Amber shimmer CTA */}
              <motion.button
                onClick={() => setQuoteOpen(true)}
                onHoverStart={() => setBtnHovered(true)}
                onHoverEnd={() => setBtnHovered(false)}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="relative w-full md:w-auto px-8 py-4 rounded-2xl font-bold text-base text-white overflow-hidden"
                style={{
                  background: 'linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)',
                  boxShadow: btnHovered
                    ? '0 0 48px rgba(245,158,11,0.50), 0 8px 32px rgba(0,0,0,0.40)'
                    : '0 0 24px rgba(245,158,11,0.25), 0 4px 16px rgba(0,0,0,0.30)',
                  transition: 'box-shadow 0.25s ease',
                  minWidth: '220px',
                }}
              >
                {/* Shimmer sweep */}
                <span
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                  style={{ animation: 'shimmer-spcq 2.5s infinite linear' }}
                />
                <span className="relative flex items-center justify-center gap-2">
                  <span>{emoji}</span>
                  <span>Get My Free Quote →</span>
                </span>
              </motion.button>

              {/* Phone link */}
              <a
                href="tel:+16085356057"
                className="flex items-center gap-2 text-sm transition-colors duration-200"
                style={{ color: 'rgba(255,255,255,0.35)' }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.color = 'rgba(255,255,255,0.70)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.color = 'rgba(255,255,255,0.35)';
                }}
              >
                <Phone className="w-3.5 h-3.5" />
                (608) 535-6057
              </a>
            </motion.div>

          </div>
        </div>
      </section>

      {/* Quote flow modal */}
      <SmartQuoteFlow
        serviceSlug={serviceSlug}
        serviceName={serviceName}
        serviceEmoji={emoji}
        isOpen={quoteOpen}
        onClose={() => setQuoteOpen(false)}
      />

      {/* Shimmer keyframe */}
      <style>{`
        @keyframes shimmer-spcq {
          0%   { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
      `}</style>
    </>
  );
}
