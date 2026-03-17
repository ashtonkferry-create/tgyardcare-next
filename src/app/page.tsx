import type { Metadata } from 'next';
import Link from 'next/link';
import { ScrollProgress } from '@/components/ScrollProgress';
import { WebPageSchema } from '@/components/schemas/WebPageSchema';
import Navigation from '@/components/Navigation';
import { HeroSection } from '@/components/home/HeroSection';
import { StatsStrip } from '@/components/home/StatsStrip';
import { SeasonalServicesSection } from '@/components/home/SeasonalServicesSection';
import { WhyMadisonTrust } from '@/components/WhyMadisonTrust';
import { ServicesCarousel } from '@/components/home/ServicesCarousel';
import { FullSeasonContract } from '@/components/FullSeasonContract';
import { BeforeAfterPreview } from '@/components/home/BeforeAfterPreview';
import { SectionDivider } from '@/components/SectionTransition';
import { GoogleReviewsSection } from '@/components/GoogleReviewsSection';
import { ComparisonTable } from '@/components/ComparisonTable';
import { ServiceStandard } from '@/components/home/ServiceStandard';
import { HowItWorks } from '@/components/home/HowItWorks';
import LatestBlogPosts from '@/components/blog/LatestBlogPosts';
import CTASection from '@/components/CTASection';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: '#1 Lawn Care in Madison WI — 4.9★ Rated | TotalGuard Yard Care',
  description: "Madison's top-rated lawn care company. Same crew every week, 500+ properties served across Dane County. Mowing, aeration, gutters, mulching & cleanups. Call (608) 535-6057 for a free quote.",
  keywords: 'lawn care Madison WI, lawn mowing Middleton, mulching Waunakee, gutter cleaning Sun Prairie, Fitchburg landscaping, Verona yard care, Dane County lawn service, lawn care companies Madison WI, lawn aeration Madison',
  alternates: {
    canonical: 'https://tgyardcare.com',
  },
  openGraph: {
    title: '#1 Lawn Care in Madison WI — 4.9★ Rated | TotalGuard Yard Care',
    description: "Madison's top-rated lawn care company. Same crew every week, 500+ properties served across Dane County. Free quote today!",
    url: '/',
  },
};

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <ScrollProgress variant="minimal" />
      <WebPageSchema name="TotalGuard Yard Care" description="Madison's most reliable lawn care and landscaping" url="/" />
      <Navigation showPromoBanner />

      {/* Server-rendered sr-only section — visible in view-source, indexable by search engines */}
      <section className="sr-only" aria-label="Business Summary">
        <p>TotalGuard Yard Care provides professional lawn care and yard maintenance services in Madison, Middleton, Waunakee, and Dane County, Wisconsin. We assign the same crew to your property every visit for consistent quality. Services include mowing, fertilization, gutter cleaning, snow removal, and seasonal cleanups. Call (608) 535-6057 for a free quote.</p>
      </section>

      {/* Client island — season-aware hero with parallax */}
      <HeroSection />

      {/* Client island — animated stat counters */}
      <StatsStrip />

      {/* Client island — needs seasonal context for service prioritization */}
      <SeasonalServicesSection />

      <WhyMadisonTrust />

      {/* Client island — carousel interaction state */}
      <ServicesCarousel />

      <FullSeasonContract />

      {/* Server component — static before/after content */}
      <BeforeAfterPreview />

      <SectionDivider />
      <GoogleReviewsSection />
      <ComparisonTable />

      {/* Server component — static service standard grid */}
      <ServiceStandard />

      {/* Server component — wraps client ProcessTimeline */}
      <HowItWorks />

      {/* Annual plan CTA — subtle banner between HowItWorks and blog posts */}
      <section className="py-10 md:py-12" style={{ background: '#060e08' }}>
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 border border-primary/20 bg-primary/5 rounded-2xl px-8 py-6">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-primary mb-1">Save 15% annually</p>
              <h3 className="text-xl md:text-2xl font-bold text-white">Build Your Custom Annual Plan</h3>
              <p className="text-white/60 text-sm mt-1">Toggle services by season — see your price instantly.</p>
            </div>
            <Link
              href="/annual-plan"
              className="shrink-0 inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-black animate-shimmer-btn bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 bg-[length:200%_auto] hover:opacity-90 transition-opacity"
            >
              Configure My Plan
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-20" style={{ background: '#0a1a0e' }}>
        <div className="container mx-auto px-4">
          <LatestBlogPosts />
        </div>
      </section>

      <CTASection />
      <Footer showCloser={false} />
    </div>
  );
}
