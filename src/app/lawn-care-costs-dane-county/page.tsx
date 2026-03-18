import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Lawn Care Costs in Dane County, WI 2026 | Pricing Guide | TotalGuard',
  description:
    'See what lawn care, gutter cleaning, and yard services cost in Dane County in 2026. Real prices for Madison, Middleton, Stoughton, and more.',
  alternates: { canonical: 'https://tgyardcare.com/lawn-care-costs-dane-county' },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Article',
      headline: 'How Much Does Lawn Care Cost in Dane County? (2026 Guide)',
      description:
        'Comprehensive 2026 pricing guide for lawn care, gutter cleaning, fertilization, snow removal, and hardscaping in Dane County, WI.',
      dateModified: '2026-03-01',
      author: { '@type': 'Organization', name: 'TotalGuard Yard Care' },
      publisher: {
        '@type': 'Organization',
        name: 'TotalGuard Yard Care',
        url: 'https://tgyardcare.com',
      },
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://tgyardcare.com' },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Lawn Care Cost Guide',
          item: 'https://tgyardcare.com/lawn-care-costs-dane-county',
        },
      ],
    },
    {
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'How much does lawn mowing cost in Madison, WI?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Lawn mowing in Madison typically costs $45–55 for small lots under 6,000 sq ft, $55–75 for medium lots, and $75–120 for larger properties. Prices can vary based on frequency and terrain.',
          },
        },
        {
          '@type': 'Question',
          name: 'Do prices change between cities in Dane County?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Most cities in Dane County are within ±5% of Madison baseline pricing. More rural communities like Stoughton and Oregon tend to run 10–15% less due to lower cost of living and reduced equipment travel costs.',
          },
        },
        {
          '@type': 'Question',
          name: "What's the cheapest way to maintain a lawn in Dane County?",
          acceptedAnswer: {
            '@type': 'Answer',
            text: "The most cost-effective approach is bundling services — combining mowing, fertilization, and gutter cleaning into a season plan typically saves 15–20% versus booking each individually. Ask about TotalGuard's annual plan.",
          },
        },
        {
          '@type': 'Question',
          name: 'Are there discounts for bundling lawn care services?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: "Yes. TotalGuard offers multi-service discounts of up to 15% when you bundle three or more services into an annual plan. Spring cleanup, regular mowing, fall fertilization, and gutter cleaning are common combinations.",
          },
        },
        {
          '@type': 'Question',
          name: 'How do I get an exact quote for my property?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Request a free quote at tgyardcare.com/get-quote or call (608) 535-6057. Provide your address and we will review satellite imagery of your property and call back within 24 hours with a custom price.',
          },
        },
      ],
    },
  ],
};

const pricingRows = [
  { service: 'Lawn Mowing', small: '$45–55', medium: '$55–75', large: '$75–120' },
  { service: 'Fertilization', small: '$89–119', medium: '$119–159', large: '$159–219' },
  { service: 'Gutter Cleaning', small: '$149–199', medium: '$199–259', large: '$259–349' },
  { service: 'Gutter Guard Installation', small: '$299–499', medium: '$499–799', large: '$799–1,499' },
  { service: 'Fall Cleanup', small: '$199–299', medium: '$299–449', large: '$449–699' },
  { service: 'Spring Cleanup', small: '$179–269', medium: '$269–399', large: '$399–599' },
  { service: 'Snow Removal (per visit)', small: '$65–95', medium: '$95–145', large: '$145–225' },
  { service: 'Hardscaping (patio)', small: '$1,500–3,500', medium: '$3,500–7,000', large: '$7,000–15,000+' },
];

const pricingFactors = [
  {
    title: 'Lot Size',
    points: [
      'Under 6,000 sq ft — smallest tier, quickest service',
      '6,000–12,000 sq ft — most common in Dane County suburbs',
      '12,000+ sq ft — adds time, equipment passes, and material cost',
      'Corner lots and irregularly shaped lots may cost 5–10% more',
    ],
  },
  {
    title: 'Accessibility',
    points: [
      'Fenced yards with narrow gates add 10–15 minutes per visit',
      'Steep slopes require slower equipment passes and more fuel',
      'Properties with debris, tree roots, or poor drainage cost more',
      'Easy-access, flat, open lawns receive the best rates',
    ],
  },
  {
    title: 'Frequency',
    points: [
      'Weekly mowing is cheaper per visit than bi-weekly',
      'Seasonal contracts lock in rates and prevent price increases',
      'One-time or on-call services carry a premium (10–20% above regular rates)',
      'Annual plans bundle services at a 10–15% discount',
    ],
  },
  {
    title: 'Add-Ons & Complexity',
    points: [
      'Edging along driveways and sidewalks: +$10–20/visit',
      'Bagging vs. mulching clippings: +$15–25/visit for bagging',
      'Removal of leaves, sticks, or debris before service: +$25–50',
      'Same-day or rush scheduling: +15–25% premium',
    ],
  },
];

const cityData = [
  { city: 'Madison', comparison: 'Baseline' },
  { city: 'Middleton', comparison: 'Similar (±5%)' },
  { city: 'Waunakee', comparison: 'Similar (+5%)' },
  { city: 'Sun Prairie', comparison: 'Similar (±5%)' },
  { city: 'Fitchburg', comparison: 'Similar (±5%)' },
  { city: 'Stoughton', comparison: '10–15% less' },
  { city: 'Oregon', comparison: '10–15% less' },
  { city: 'McFarland', comparison: 'Similar (±5%)' },
  { city: 'Cottage Grove', comparison: 'Similar (±5%)' },
  { city: 'Verona', comparison: 'Similar (±5%)' },
  { city: 'Monona', comparison: 'Similar (±5%)' },
  { city: 'DeForest', comparison: 'Similar (±5%)' },
];

const faqs = [
  {
    q: 'How much does lawn mowing cost in Madison, WI?',
    a: 'Lawn mowing in Madison typically costs $45–55 for small lots under 6,000 sq ft, $55–75 for medium lots, and $75–120 for larger properties. Prices vary based on frequency — weekly service is more economical per visit than bi-weekly or one-time mowing.',
  },
  {
    q: 'Do prices change between cities in Dane County?',
    a: 'Most Dane County cities are within ±5% of Madison baseline pricing. Cities like Stoughton and Oregon — which are slightly farther from the urban core — tend to run 10–15% less. Middleton and Waunakee are essentially on par with Madison.',
  },
  {
    q: "What's the cheapest way to maintain a lawn in Dane County?",
    a: "The most cost-effective approach is bundling services. Combining mowing, fertilization, and gutter cleaning into a seasonal plan typically saves 15–20% versus booking each service individually. Consistent weekly mowing is also cheaper per visit than skipping weeks.",
  },
  {
    q: 'Are there discounts for bundling lawn care services?',
    a: "Yes. TotalGuard offers multi-service discounts when you bundle three or more services into an annual plan. Common combinations include spring cleanup + regular mowing + fall fertilization + gutter cleaning. Ask about our annual plan at tgyardcare.com/annual-plan.",
  },
  {
    q: 'How do I get an exact quote for my property?',
    a: 'Request a free quote at tgyardcare.com/get-quote or call (608) 535-6057. Provide your address and we will review your property via satellite and call back within 24 hours with a custom price tailored to your lot size and service needs.',
  },
];

export default function LawnCareCostsDaneCounty() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main className="min-h-screen" style={{ background: '#050d07', color: '#f0f0f5' }}>

        {/* ── Hero ─────────────────────────────────────────────────────── */}
        <section className="relative py-20 px-4 text-center overflow-hidden">
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(34,197,94,0.12) 0%, transparent 70%)',
            }}
          />
          <div className="relative z-10 max-w-3xl mx-auto">
            <p className="text-sm font-medium mb-4" style={{ color: '#22c55e' }}>
              Updated March 2026 &nbsp;·&nbsp; TotalGuard Yard Care
            </p>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight mb-6">
              How Much Does Lawn Care Cost in{' '}
              <span style={{ color: '#22c55e' }}>Dane County</span>? (2026 Guide)
            </h1>
            <p className="text-lg" style={{ color: '#8888a0' }}>
              Actual price ranges for mowing, fertilization, gutter cleaning, snow removal, and more.
              Based on real jobs completed across Madison and Dane County in 2025–2026.
            </p>
          </div>
        </section>

        <div className="max-w-4xl mx-auto px-4 pb-24 space-y-20">

          {/* ── Pricing Tables ───────────────────────────────────────────── */}
          <section>
            <h2 className="text-2xl font-bold mb-2">2026 Service Price Ranges</h2>
            <p className="mb-6" style={{ color: '#8888a0' }}>
              Prices shown are typical ranges for Dane County. Your quote may vary based on lot
              size, access, and frequency. &ldquo;Small&rdquo; = under 6,000 sq ft,
              &ldquo;Medium&rdquo; = 6,000–12,000 sq ft, &ldquo;Large&rdquo; = 12,000+ sq ft.
            </p>
            <div className="overflow-x-auto rounded-xl border" style={{ borderColor: '#1a2e1a' }}>
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ background: '#22c55e' }}>
                    <th className="text-left px-4 py-3 font-semibold text-black">Service</th>
                    <th className="text-left px-4 py-3 font-semibold text-black">Small Lot (&lt;6k sqft)</th>
                    <th className="text-left px-4 py-3 font-semibold text-black">Medium (6k–12k sqft)</th>
                    <th className="text-left px-4 py-3 font-semibold text-black">Large (12k+ sqft)</th>
                  </tr>
                </thead>
                <tbody>
                  {pricingRows.map((row, i) => (
                    <tr
                      key={row.service}
                      style={{
                        background: i % 2 === 0 ? '#0a1a0a' : '#0f1f0f',
                        borderTop: '1px solid #1a2e1a',
                      }}
                    >
                      <td className="px-4 py-3 font-medium">{row.service}</td>
                      <td className="px-4 py-3" style={{ color: '#a0d0a0' }}>{row.small}</td>
                      <td className="px-4 py-3" style={{ color: '#a0d0a0' }}>{row.medium}</td>
                      <td className="px-4 py-3" style={{ color: '#a0d0a0' }}>{row.large}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-xs" style={{ color: '#6b7280' }}>
              * All prices are estimates. Request a free quote for your exact property.
            </p>
          </section>

          {/* ── What Affects Pricing ─────────────────────────────────────── */}
          <section>
            <h2 className="text-2xl font-bold mb-6">What Affects Lawn Care Pricing</h2>
            <div className="grid sm:grid-cols-2 gap-6">
              {pricingFactors.map((factor) => (
                <div
                  key={factor.title}
                  className="rounded-xl p-6 border"
                  style={{ background: '#0a1a0a', borderColor: '#1a2e1a' }}
                >
                  <h3 className="font-semibold text-lg mb-4" style={{ color: '#22c55e' }}>
                    {factor.title}
                  </h3>
                  <ul className="space-y-2">
                    {factor.points.map((point) => (
                      <li key={point} className="flex gap-2 text-sm" style={{ color: '#c0d0c0' }}>
                        <span style={{ color: '#22c55e', flexShrink: 0 }}>·</span>
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>

          {/* ── By City ──────────────────────────────────────────────────── */}
          <section>
            <h2 className="text-2xl font-bold mb-2">Prices by City in Dane County</h2>
            <p className="mb-6" style={{ color: '#8888a0' }}>
              How Dane County cities compare to Madison pricing as a baseline.
            </p>
            <div className="overflow-x-auto rounded-xl border" style={{ borderColor: '#1a2e1a' }}>
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ background: '#22c55e' }}>
                    <th className="text-left px-4 py-3 font-semibold text-black">City</th>
                    <th className="text-left px-4 py-3 font-semibold text-black">vs. Madison Baseline</th>
                  </tr>
                </thead>
                <tbody>
                  {cityData.map((row, i) => (
                    <tr
                      key={row.city}
                      style={{
                        background: i % 2 === 0 ? '#0a1a0a' : '#0f1f0f',
                        borderTop: '1px solid #1a2e1a',
                      }}
                    >
                      <td className="px-4 py-3 font-medium">{row.city}</td>
                      <td
                        className="px-4 py-3"
                        style={{
                          color: row.comparison.includes('less') ? '#86efac' : '#a0d0a0',
                        }}
                      >
                        {row.comparison}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* ── CTA ──────────────────────────────────────────────────────── */}
          <section
            className="rounded-2xl p-10 text-center border"
            style={{
              background: 'linear-gradient(135deg, #0a1a0a 0%, #0f2010 100%)',
              borderColor: '#22c55e',
            }}
          >
            <h2 className="text-2xl font-bold mb-3">Get an Exact Quote for Your Property</h2>
            <p className="mb-6" style={{ color: '#8888a0' }}>
              Pricing ranges are helpful, but every property is different. Get a custom quote
              for your Dane County home — we review your lot and call back within 24 hours.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href="/get-quote"
                className="inline-block px-8 py-3 rounded-lg font-semibold text-black transition-all hover:scale-105"
                style={{ background: '#22c55e' }}
              >
                Get My Free Quote
              </Link>
              <a
                href="tel:6085356057"
                className="inline-block px-8 py-3 rounded-lg font-semibold border transition-all hover:scale-105"
                style={{ borderColor: '#22c55e', color: '#22c55e' }}
              >
                Call (608) 535-6057
              </a>
            </div>
          </section>

          {/* ── FAQ ──────────────────────────────────────────────────────── */}
          <section>
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-3">
              {faqs.map((faq) => (
                <details
                  key={faq.q}
                  className="rounded-xl border overflow-hidden"
                  style={{ background: '#0a1a0a', borderColor: '#1a2e1a' }}
                >
                  <summary
                    className="px-6 py-4 cursor-pointer font-semibold select-none hover:opacity-80 transition-opacity"
                    style={{ color: '#22c55e', listStyle: 'none' }}
                  >
                    {faq.q}
                  </summary>
                  <p className="px-6 pb-5 text-sm leading-relaxed" style={{ color: '#c0d0c0' }}>
                    {faq.a}
                  </p>
                </details>
              ))}
            </div>
          </section>

        </div>
      </main>
    </>
  );
}
