'use client';

import { useState, useMemo, useCallback } from 'react';
import Image from 'next/image';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import CTASection from '@/components/CTASection';
import { GallerySchema } from '@/components/schemas/GallerySchema';
import { WebPageSchema } from '@/components/schemas/WebPageSchema';
import { GlassCard } from '@/components/GlassCard';
import { ScrollReveal } from '@/components/ScrollReveal';
import { AnimatedCounter } from '@/components/AnimatedCounter';
import { AmbientParticles } from '@/components/AmbientParticles';
import { ImageLightbox } from '@/components/ImageLightbox';
import { ComparisonSlider } from '@/components/gallery/ComparisonSlider';
import { useSeasonalTheme } from '@/contexts/SeasonalThemeContext';
import { galleryImages, categories, resolveImageSrc, type GalleryCategory } from '@/lib/galleryData';
import { transformations, serviceCategories, type ServiceCategory } from '@/lib/transformationData';
import { cn } from '@/lib/utils';

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

const seasonalHoverBorder = {
  summer: 'hover:border-emerald-500/30',
  fall: 'hover:border-amber-500/30',
  winter: 'hover:border-cyan-500/30',
} as const;

const seasonalPillActive = {
  summer: 'bg-emerald-500/20 text-emerald-300 shadow-lg shadow-emerald-500/20',
  fall: 'bg-amber-500/20 text-amber-300 shadow-lg shadow-amber-500/20',
  winter: 'bg-cyan-500/20 text-cyan-300 shadow-lg shadow-cyan-500/20',
} as const;

export default function GalleryContent() {
  const { activeSeason } = useSeasonalTheme();
  const acc = seasonalAccent[activeSeason];
  const bg = seasonalBg[activeSeason];

  const [activeCategory, setActiveCategory] = useState<GalleryCategory>('all');
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  // Transformation comparison state
  const [activeService, setActiveService] = useState<ServiceCategory | 'all'>('all');
  const [fullscreenPair, setFullscreenPair] = useState<typeof transformations[number] | null>(null);

  const filteredTransformations = useMemo(
    () => activeService === 'all' ? transformations : transformations.filter(t => t.service === activeService),
    [activeService]
  );

  const openFullscreen = useCallback((pair: typeof transformations[number]) => {
    setFullscreenPair(pair);
    document.body.style.overflow = 'hidden';
  }, []);

  const closeFullscreen = useCallback(() => {
    setFullscreenPair(null);
    document.body.style.overflow = 'unset';
  }, []);

  const filteredImages = useMemo(
    () => activeCategory === 'all' ? galleryImages : galleryImages.filter(img => img.category === activeCategory),
    [activeCategory]
  );

  const openLightbox = (index: number) => {
    setSelectedIndex(index);
    setIsLightboxOpen(true);
  };

  const closeLightbox = () => {
    setIsLightboxOpen(false);
    setSelectedIndex(null);
  };

  const isBeforeAfter = (img: { category: string }) => img.category === 'before-after';

  return (
    <div className="min-h-screen text-white" style={{ background: bg.page }}>
      <GallerySchema images={galleryImages.filter(img => typeof img.src === 'string').map(img => img.src as string)} />
      <WebPageSchema name="Work Gallery" description="Before and after photos of our lawn care work in Madison, WI" url="/gallery" />
      <Navigation />

      {/* SEO hidden text */}
      <section className="sr-only">
        <h2>TotalGuard Yard Care Project Gallery</h2>
        <p>Browse before-and-after photos of TotalGuard Yard Care&apos;s lawn mowing, mulching, garden bed, gutter cleaning, and seasonal cleanup projects across Madison, Wisconsin. Our portfolio showcases the quality and attention to detail that has earned us a 4.9-star Google rating from 80+ satisfied customers.</p>
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
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white mb-5 leading-tight">
              Our Work Speaks for Itself
            </h1>
          </ScrollReveal>

          <ScrollReveal delay={0.08}>
            <p className="text-xl md:text-2xl text-white/55 max-w-2xl mx-auto mb-8 leading-relaxed">
              33+ real project photos from properties across Madison, Middleton, Waunakee &amp; surrounding Dane County communities.
            </p>
          </ScrollReveal>

          <ScrollReveal delay={0.15}>
            <div className="h-1 w-24 rounded-full mx-auto" style={{ background: acc.solid }} />
          </ScrollReveal>
        </div>
      </section>

      {/* ── BEFORE & AFTER TRANSFORMATIONS ── */}
      <section className="py-16 md:py-20" style={{ background: bg.section }}>
        <div className="container mx-auto px-4 max-w-7xl">
          <ScrollReveal>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white text-center mb-4">
              Before &amp; After Transformations
            </h2>
          </ScrollReveal>
          <ScrollReveal delay={0.06}>
            <p className="text-white/50 text-center text-lg max-w-2xl mx-auto mb-10">
              Drag the slider to see the difference our services make across Madison-area neighborhoods.
            </p>
          </ScrollReveal>

          {/* Service category filter pills */}
          <ScrollReveal delay={0.1}>
            <div className="flex flex-wrap justify-center gap-3 mb-10">
              <button
                onClick={() => setActiveService('all')}
                className={cn(
                  'px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300',
                  activeService === 'all'
                    ? seasonalPillActive[activeSeason]
                    : 'bg-white/[0.06] text-white/60 hover:text-white hover:bg-white/[0.1] border border-white/[0.08]'
                )}
              >
                All
              </button>
              {serviceCategories.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => setActiveService(cat.value)}
                  className={cn(
                    'px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300',
                    activeService === cat.value
                      ? seasonalPillActive[activeSeason]
                      : 'bg-white/[0.06] text-white/60 hover:text-white hover:bg-white/[0.1] border border-white/[0.08]'
                  )}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </ScrollReveal>

          {/* Transformation grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            {filteredTransformations.map((pair, index) => (
              <ScrollReveal key={pair.id} delay={Math.min(index * 0.08, 0.4)}>
                <div
                  className={cn(
                    'group relative rounded-2xl overflow-hidden border border-white/[0.08] cursor-pointer',
                    'hover:-translate-y-1 hover:shadow-2xl transition-all duration-500',
                    seasonalHoverBorder[activeSeason]
                  )}
                  onClick={() => openFullscreen(pair)}
                >
                  <ComparisonSlider
                    beforeSrc={pair.beforeSrc}
                    afterSrc={pair.afterSrc}
                    beforeAlt={pair.beforeAlt}
                    afterAlt={pair.afterAlt}
                    neighborhood={pair.neighborhood}
                  />
                  {pair.description && (
                    <p className="text-sm text-white/40 px-4 py-3 bg-black/30">
                      {pair.description}
                    </p>
                  )}
                </div>
              </ScrollReveal>
            ))}
          </div>

          {filteredTransformations.length === 0 && (
            <div className="text-center py-16">
              <p className="text-white/50 text-lg">No transformations in this category yet. Check back soon!</p>
            </div>
          )}
        </div>
      </section>

      {/* ── SECTION DIVIDER ── */}
      <div className="flex justify-center py-8" style={{ background: bg.page }}>
        <div className="h-1 w-24 rounded-full" style={{ background: acc.solid }} />
      </div>

      {/* ── CATEGORY FILTER BAR ── */}
      <section className="py-8 md:py-12" style={{ background: bg.page }}>
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-3">
            {categories.map((cat) => (
              <button
                key={cat.key}
                onClick={() => setActiveCategory(cat.key)}
                className={cn(
                  'px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300',
                  activeCategory === cat.key
                    ? seasonalPillActive[activeSeason]
                    : 'bg-white/[0.06] text-white/60 hover:text-white hover:bg-white/[0.1] border border-white/[0.08]'
                )}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── PORTFOLIO GRID ── */}
      <section className="pb-16 md:pb-24" style={{ background: bg.page }}>
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6 max-w-7xl mx-auto">
            {filteredImages.map((img, index) => {
              const imgSrc = resolveImageSrc(img.src);
              const isPublicPath = typeof img.src === 'string' && img.src.startsWith('/');
              const imgWidth = isBeforeAfter(img) ? 800 : 600;
              const imgHeight = isBeforeAfter(img) ? 400 : 400;

              return (
                <ScrollReveal key={img.id} delay={Math.min(index * 0.06, 0.5)}>
                  <div
                    className={cn(
                      'group relative rounded-2xl overflow-hidden border border-white/[0.08] cursor-pointer',
                      'hover:-translate-y-1 hover:shadow-2xl transition-all duration-500',
                      seasonalHoverBorder[activeSeason]
                    )}
                    onClick={() => openLightbox(index)}
                  >
                    <Image
                      src={imgSrc}
                      alt={`${img.service} — ${img.title} — TotalGuard Yard Care Madison WI`}
                      width={imgWidth}
                      height={imgHeight}
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="w-full h-auto"
                      unoptimized={isPublicPath}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col items-center justify-end pb-6">
                      <p className="text-white font-semibold text-base">{img.title}</p>
                      <p className="text-white/50 text-xs mt-1">{img.service}</p>
                      <span className="text-white/40 text-xs mt-2 uppercase tracking-wider">View Full Size</span>
                    </div>
                  </div>
                </ScrollReveal>
              );
            })}
          </div>

          {filteredImages.length === 0 && (
            <div className="text-center py-16">
              <p className="text-white/50 text-lg">No projects found in this category yet. Check back soon!</p>
            </div>
          )}
        </div>
      </section>

      {/* ── STATS STRIP ── */}
      <section className="py-16 md:py-20" style={{ background: bg.section }}>
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 max-w-5xl mx-auto">
            {[
              { value: 100, suffix: '+', decimals: 0, label: 'Properties Transformed' },
              { value: 4.9, suffix: '',  decimals: 1, label: 'Google Rating' },
              { value: 80, suffix: '+',  decimals: 0, label: 'Five-Star Reviews' },
            ].map((stat, i) => (
              <ScrollReveal key={i} delay={i * 0.08}>
                <GlassCard variant="dark" hover="lift" className="text-center py-8">
                  <div className={`text-4xl md:text-5xl font-bold ${acc.text}`}>
                    <AnimatedCounter end={stat.value} suffix={stat.suffix} decimals={stat.decimals} />
                  </div>
                  <p className="text-white/60 text-sm font-medium mt-2">{stat.label}</p>
                </GlassCard>
              </ScrollReveal>
            ))}
            <ScrollReveal delay={0.24}>
              <GlassCard variant="dark" hover="lift" className="text-center py-8">
                <div className={`text-4xl md:text-5xl font-bold ${acc.text}`}>
                  24hr
                </div>
                <p className="text-white/60 text-sm font-medium mt-2">Response Time</p>
              </GlassCard>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ── TRANSFORMATION FULLSCREEN ── */}
      <AnimatePresence>
        {fullscreenPair && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex flex-col items-center justify-center p-4"
            onClick={closeFullscreen}
          >
            <button
              onClick={closeFullscreen}
              className="absolute top-4 right-4 z-50 p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
              aria-label="Close fullscreen"
            >
              <X className="w-6 h-6 text-white" />
            </button>

            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.25, ease: [0.25, 0.4, 0.25, 1] }}
              className="w-full max-w-4xl"
              onClick={(e) => e.stopPropagation()}
            >
              <ComparisonSlider
                beforeSrc={fullscreenPair.beforeSrc}
                afterSrc={fullscreenPair.afterSrc}
                beforeAlt={fullscreenPair.beforeAlt}
                afterAlt={fullscreenPair.afterAlt}
                neighborhood={fullscreenPair.neighborhood}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.3 }}
              className="mt-4 text-center"
              onClick={(e) => e.stopPropagation()}
            >
              <p className="text-white font-semibold text-lg">{fullscreenPair.neighborhood}</p>
              {fullscreenPair.description && (
                <p className="text-white/50 text-sm mt-1">{fullscreenPair.description}</p>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── LIGHTBOX ── */}
      {selectedIndex !== null && (
        <ImageLightbox
          isOpen={isLightboxOpen}
          onClose={closeLightbox}
          imageUrl={resolveImageSrc(filteredImages[selectedIndex].src)}
          title={filteredImages[selectedIndex].title}
          service={filteredImages[selectedIndex].service}
          onPrevious={selectedIndex > 0 ? () => setSelectedIndex(selectedIndex - 1) : undefined}
          onNext={selectedIndex < filteredImages.length - 1 ? () => setSelectedIndex(selectedIndex + 1) : undefined}
          currentIndex={selectedIndex}
          totalImages={filteredImages.length}
        />
      )}

      <CTASection />
      <Footer showCloser={false} />
    </div>
  );
}
