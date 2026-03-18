import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { WebPageSchema } from '@/components/schemas/WebPageSchema';
import { BreadcrumbSchema } from '@/components/schemas/BreadcrumbSchema';
import Link from 'next/link';
import { getCityServiceParams, parseCityService, SERVICES, CITIES } from '@/data/cityServiceConfig';

export function generateStaticParams() {
  return getCityServiceParams();
}

interface Props {
  params: Promise<{ cityService: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { cityService } = await params;
  const content = parseCityService(cityService);
  if (!content) return {};
  const { service, city } = content;
  const title = `${service.name} in ${city.name}, WI | TotalGuard Yard Care`;
  const description = `Professional ${service.name.toLowerCase()} in ${city.name}, WI. ${city.characteristics.split('.')[0]}. Starting at $${service.startingPrice} per ${service.priceUnit}. Call (608) 535-6057.`;
  return {
    title,
    description,
    alternates: { canonical: `https://tgyardcare.com/${cityService}` },
    openGraph: { title, description, url: `https://tgyardcare.com/${cityService}` },
  };
}

export default async function CityServicePage({ params }: Props) {
  const { cityService } = await params;
  const content = parseCityService(cityService);
  if (!content) notFound();

  const { service, city } = content;

  // Other services in this city
  const otherServices = SERVICES.filter(s => s.slug !== service.slug);

  // Nearby cities (same service)
  const nearbyCities = city.nearbySlug
    .map(slug => CITIES.find(c => c.slug === slug))
    .filter((c): c is NonNullable<typeof c> => c !== undefined);

  const faqs = [
    {
      q: `How much does ${service.name.toLowerCase()} cost in ${city.name}?`,
      a: `${service.name} in ${city.name} starts at $${service.startingPrice} per ${service.priceUnit}. The exact price depends on your property size, accessibility, and frequency. We provide free custom quotes after reviewing your property. Call (608) 535-6057 or request a quote online.`,
    },
    {
      q: `Does TotalGuard serve all neighborhoods in ${city.name}?`,
      a: `Yes, we serve all ${city.name} neighborhoods including ${city.neighborhoods.slice(0, 4).join(', ')}, and surrounding areas. If you're in Dane County, we can serve you. Call (608) 535-6057 to confirm your address.`,
    },
    {
      q: `How do I schedule ${service.name.toLowerCase()} in ${city.name}?`,
      a: `The easiest way is to use our online quote form \u2014 enter your ${city.name} address and we'll call you within 24 hours with a custom price for your property. Or call us directly at (608) 535-6057. We offer flexible scheduling including ${service.seasonality.toLowerCase()}.`,
    },
  ];

  return (
    <div className="min-h-screen" style={{ background: '#052e16' }}>
      <WebPageSchema
        name={`${service.name} in ${city.name}, WI`}
        description={`Professional ${service.name.toLowerCase()} serving ${city.name}, Wisconsin. ${city.characteristics.split('.')[0]}.`}
        url={`/${cityService}`}
      />
      <BreadcrumbSchema items={[
        { name: 'Home', url: 'https://tgyardcare.com' },
        { name: 'Service Areas', url: 'https://tgyardcare.com/service-areas' },
        { name: city.name, url: `https://tgyardcare.com/locations/${city.slug}` },
        { name: service.name, url: `https://tgyardcare.com/${cityService}` },
      ]} />

      {/* FAQ Schema */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqs.map(f => ({
          '@type': 'Question',
          name: f.q,
          acceptedAnswer: { '@type': 'Answer', text: f.a },
        })),
      }) }} />

      {/* LocalBusiness Schema */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'LocalBusiness',
        name: 'TotalGuard Yard Care',
        description: `${service.name} in ${city.name}, WI`,
        url: `https://tgyardcare.com/${cityService}`,
        telephone: '+16085356057',
        address: { '@type': 'PostalAddress', addressLocality: city.name, addressRegion: 'WI', addressCountry: 'US' },
        geo: { '@type': 'GeoCoordinates', latitude: city.coordinates.lat, longitude: city.coordinates.lng },
        areaServed: { '@type': 'City', name: city.name },
        aggregateRating: { '@type': 'AggregateRating', ratingValue: '4.9', reviewCount: '80' },
      }) }} />

      <Navigation />

      {/* HERO */}
      <section className="relative overflow-hidden pt-24 pb-16">
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(160deg, #052e16 0%, #0a3520 40%, #052e16 100%)' }} />
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 80%, rgba(34,197,94,0.07) 0%, transparent 70%)' }} />
        <div className="absolute inset-0 opacity-[0.05] pointer-events-none">
          <svg className="w-full h-full"><defs><pattern id="cs-grid" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse"><circle cx="20" cy="20" r="1" fill="#22c55e" /></pattern></defs><rect width="100%" height="100%" fill="url(#cs-grid)" /></svg>
        </div>

        <div className="container mx-auto px-4 max-w-4xl relative z-10">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs mb-8" style={{ color: 'rgba(255,255,255,0.35)' }}>
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <span>&rsaquo;</span>
            <Link href="/service-areas" className="hover:text-white transition-colors">Service Areas</Link>
            <span>&rsaquo;</span>
            <Link href={`/locations/${city.slug}`} className="hover:text-white transition-colors">{city.name}</Link>
            <span>&rsaquo;</span>
            <span className="text-white">{service.name}</span>
          </nav>

          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-6 text-xs font-semibold" style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', color: '#4ade80' }}>
            <span>{service.emoji}</span>
            Serving {city.name}, WI
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight" style={{ fontFamily: 'var(--font-display)' }}>
            {service.name}{' '}
            <span className="bg-clip-text text-transparent" style={{ backgroundImage: 'linear-gradient(135deg, #4ade80, #22c55e)' }}>
              in {city.name}, WI
            </span>
          </h1>

          <p className="text-lg mb-8" style={{ color: 'rgba(255,255,255,0.55)' }}>
            {city.characteristics}
          </p>

          {/* Trust strip */}
          <div className="flex flex-wrap gap-x-5 gap-y-2 mb-8">
            {['4.9\u2605 Google Rating', '80+ Madison Families', 'Fully Insured', 'No Contracts', 'Free Quotes'].map(item => (
              <span key={item} className="flex items-center gap-1.5 text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
                <span className="w-1 h-1 rounded-full shrink-0" style={{ background: '#22c55e' }} />
                {item}
              </span>
            ))}
          </div>

          {/* CTAs */}
          <div className="flex flex-wrap gap-4">
            <Link href="/get-quote"
              className="px-8 py-4 rounded-2xl text-base font-bold transition-all duration-200"
              style={{ background: '#22c55e', color: '#052e16' }}>
              Get Free {city.name} Quote &rarr;
            </Link>
            <a href="tel:+16085356057"
              className="px-8 py-4 rounded-2xl text-base font-semibold border transition-all duration-200"
              style={{ color: 'rgba(255,255,255,0.8)', borderColor: 'rgba(255,255,255,0.15)' }}>
              (608) 535-6057
            </a>
          </div>
        </div>
      </section>

      {/* WHY HOMEOWNERS CHOOSE US */}
      <section className="py-16 border-t" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-3xl font-bold text-white mb-4" style={{ fontFamily: 'var(--font-display)' }}>
            Why {city.name} Homeowners Trust TotalGuard
          </h2>
          <p className="mb-8" style={{ color: 'rgba(255,255,255,0.45)' }}>
            We know {city.name} yards &mdash; the soil, the trees, the weather patterns &mdash; and we plan your service around them.
          </p>
          <div className="space-y-4">
            {city.yardChallenges.map((challenge, i) => (
              <div key={i} className="flex items-start gap-4 p-5 rounded-2xl" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(34,197,94,0.08)' }}>
                <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.3)' }}>
                  <span style={{ color: '#22c55e', fontSize: '16px' }}>{'\u2713'}</span>
                </div>
                <p className="text-sm" style={{ color: 'rgba(255,255,255,0.65)' }}>{challenge} &mdash; our team trains specifically for this.</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* NEIGHBORHOODS */}
      <section className="py-16 border-t" style={{ borderColor: 'rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.01)' }}>
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-3xl font-bold text-white mb-4" style={{ fontFamily: 'var(--font-display)' }}>
            {service.name} &mdash; Every {city.name} Neighborhood
          </h2>
          <p className="mb-8" style={{ color: 'rgba(255,255,255,0.45)' }}>
            We serve all areas of {city.name}, including:
          </p>
          <div className="flex flex-wrap gap-3">
            {city.neighborhoods.map(n => (
              <span key={n} className="px-4 py-2 rounded-full text-sm" style={{ background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.15)', color: 'rgba(255,255,255,0.7)' }}>
                {n}
              </span>
            ))}
            <span className="px-4 py-2 rounded-full text-sm" style={{ color: 'rgba(255,255,255,0.35)', border: '1px solid rgba(255,255,255,0.10)' }}>
              + all surrounding areas
            </span>
          </div>
        </div>
      </section>

      {/* SERVICE DETAILS */}
      <section className="py-16 border-t" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="grid lg:grid-cols-2 gap-10">
            <div>
              <h2 className="text-3xl font-bold text-white mb-4" style={{ fontFamily: 'var(--font-display)' }}>
                What&apos;s Included
              </h2>
              <p className="mb-6" style={{ color: 'rgba(255,255,255,0.45)' }}>
                Every {service.name.toLowerCase()} service in {city.name} includes:
              </p>
              <ul className="space-y-3">
                {service.included.map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="mt-0.5 w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-xs" style={{ background: 'rgba(34,197,94,0.12)', color: '#22c55e' }}>{'\u2713'}</span>
                    <span className="text-sm" style={{ color: 'rgba(255,255,255,0.65)' }}>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl p-8" style={{ background: 'rgba(34,197,94,0.05)', border: '1px solid rgba(34,197,94,0.15)' }}>
              <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: '#22c55e' }}>Pricing</p>
              <p className="text-4xl font-bold text-white mb-1" style={{ fontFamily: 'var(--font-display)' }}>
                From ${service.startingPrice}
              </p>
              <p className="text-sm mb-4" style={{ color: 'rgba(255,255,255,0.4)' }}>per {service.priceUnit} &mdash; exact price after property review</p>
              <p className="text-xs mb-6" style={{ color: 'rgba(255,255,255,0.35)' }}>
                Pricing varies by lot size in {city.name}. Small lots may qualify for lower rates. Large or complex properties receive custom pricing.
              </p>
              <p className="text-sm font-medium text-white mb-2">Schedule: <span style={{ color: '#4ade80' }}>{service.seasonality}</span></p>
              <Link href="/get-quote"
                className="block text-center py-3 rounded-xl text-sm font-bold mt-6 transition-all duration-200"
                style={{ background: '#22c55e', color: '#052e16' }}>
                Get {city.name} Quote &rarr;
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* NEARBY CITIES -- SAME SERVICE */}
      <section className="py-16 border-t" style={{ borderColor: 'rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.01)' }}>
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-2xl font-bold text-white mb-6" style={{ fontFamily: 'var(--font-display)' }}>
            Also Serving Nearby &mdash; {service.name}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {nearbyCities.map(nearbyCity => (
              <Link
                key={nearbyCity.slug}
                href={`/${service.slug}-${nearbyCity.slug}-wi`}
                className="flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.6)' }}
              >
                {nearbyCity.name}
                <span className="transition-transform group-hover:translate-x-1" style={{ color: '#22c55e' }}>&rarr;</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* MORE SERVICES IN THIS CITY */}
      <section className="py-16 border-t" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-2xl font-bold text-white mb-6" style={{ fontFamily: 'var(--font-display)' }}>
            More Services in {city.name}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {otherServices.map(svc => (
              <Link
                key={svc.slug}
                href={`/${svc.slug}-${city.slug}-wi`}
                className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm transition-all duration-200 group"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.6)' }}
              >
                <span>{svc.emoji}</span>
                <span className="truncate">{svc.shortName}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-16 border-t" style={{ borderColor: 'rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.01)' }}>
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="text-2xl font-bold text-white mb-8" style={{ fontFamily: 'var(--font-display)' }}>
            Frequently Asked Questions &mdash; {service.name} in {city.name}
          </h2>
          <div className="space-y-4">
            {faqs.map(faq => (
              <div key={faq.q} className="p-6 rounded-2xl" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <h3 className="text-base font-bold text-white mb-2">{faq.q}</h3>
                <p className="text-sm" style={{ color: 'rgba(255,255,255,0.55)' }}>{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-20 border-t" style={{ borderColor: 'rgba(255,255,255,0.05)', background: 'rgba(34,197,94,0.03)' }}>
        <div className="container mx-auto px-4 max-w-2xl text-center">
          <p className="text-sm font-semibold mb-4 uppercase tracking-widest" style={{ color: '#22c55e' }}>{service.emoji} Ready to get started?</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6" style={{ fontFamily: 'var(--font-display)' }}>
            Transform Your {city.name} Yard
          </h2>
          <p className="mb-8" style={{ color: 'rgba(255,255,255,0.45)' }}>
            Get a custom quote for your {city.name} property. We&apos;ll call within 24 hours with an accurate price.
          </p>
          <Link href="/get-quote"
            className="inline-flex items-center gap-2 px-10 py-4 rounded-2xl text-base font-bold transition-all duration-200"
            style={{ background: '#22c55e', color: '#052e16' }}>
            Get My Free {city.name} Quote &rarr;
          </Link>
          <p className="mt-4 text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>Or call (608) 535-6057 &bull; No contracts required</p>
        </div>
      </section>

      <Footer showCloser={false} />
    </div>
  );
}
