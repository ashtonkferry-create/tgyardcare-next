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

      <section className="relative py-16 md:py-20 overflow-hidden">
        {/* Green cinematic background */}
        <div className="absolute inset-0 bg-gradient-to-b from-green-950 via-[#0a3520] to-green-950" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_50%,rgba(34,197,94,0.10),transparent_60%)]" />
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
        <div className="relative container mx-auto px-4">
          <LatestBlogPosts />
        </div>
      </section>

      <CTASection />
      <Footer showCloser={false} />
    </div>
  );
}
