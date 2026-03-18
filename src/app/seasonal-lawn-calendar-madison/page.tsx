import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Madison WI Lawn Care Calendar 2026 | Monthly Guide | TotalGuard Yard Care',
  description:
    'Month-by-month lawn care guide for Madison, WI homeowners. Know exactly when to mow, fertilize, clean gutters, and more.',
  alternates: { canonical: 'https://tgyardcare.com/seasonal-lawn-calendar-madison' },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Article',
      headline: 'The Complete Madison Lawn Care Calendar (Month-by-Month)',
      description:
        'Month-by-month lawn care guide for Madison, WI homeowners covering mowing, fertilization, gutter cleaning, snow removal, and more.',
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
          name: 'Seasonal Lawn Calendar',
          item: 'https://tgyardcare.com/seasonal-lawn-calendar-madison',
        },
      ],
    },
  ],
};

const months = [
  {
    month: 'January',
    season: 'Winter',
    tasks: [
      'Dormant season — no mowing needed.',
      'Inspect and sharpen mower blades.',
      'Check snow blower and spreader equipment.',
      'Snow removal as needed; avoid salt near grass.',
    ],
  },
  {
    month: 'February',
    season: 'Winter',
    tasks: [
      'Still dormant — resist the urge to walk on frozen turf.',
      'Order seed, fertilizer, and soil amendments.',
      'Late month: look for snow mold (pink or gray patches).',
      'Treat snow mold with raking and good airflow.',
    ],
  },
  {
    month: 'March',
    season: 'Early Spring',
    tasks: [
      'First mowing once temps stay above 50°F.',
      'Spring cleanup begins — remove debris, dead leaves, sticks.',
      'Dethatch if thatch layer exceeds ½ inch.',
      'Apply pre-emergent crabgrass control early in the month.',
    ],
  },
  {
    month: 'April',
    season: 'Spring',
    tasks: [
      'Core aeration — breaks up compacted soil for better root growth.',
      'First fertilizer application (slow-release nitrogen).',
      'Overseed bare or thin spots after aeration.',
      'Mulch beds to prevent early-season weeds.',
    ],
  },
  {
    month: 'May',
    season: 'Spring',
    tasks: [
      'Regular mowing schedule begins — typically weekly.',
      'Mow at 3–3.5 inches; never cut more than ⅓ at once.',
      'Mulch beds and landscape borders.',
      'Monitor for grub damage starting mid-month.',
    ],
  },
  {
    month: 'June',
    season: 'Summer',
    tasks: [
      'Raise mow height to 3.5–4 inches to reduce heat stress.',
      'Water deeply (1–1.5 inches/week) rather than frequently.',
      'Apply grub preventative if not done in May.',
      'Spot-treat weeds before they go to seed.',
    ],
  },
  {
    month: 'July',
    season: 'Summer',
    tasks: [
      'Peak summer heat — water 1–1.5 inches per week.',
      'Skip mowing during drought stress (let grass go semi-dormant).',
      'Watch for chinch bugs and fungal disease in dry spells.',
      'Avoid fertilizing during peak heat.',
    ],
  },
  {
    month: 'August',
    season: 'Late Summer',
    tasks: [
      'Core aeration (second pass) if soil is compacted.',
      'Overseed bare or stressed areas late in the month.',
      'Final grub control window if damage appears.',
      'Begin planning fall service schedule.',
    ],
  },
  {
    month: 'September',
    season: 'Fall',
    tasks: [
      'Fall fertilizer application — most important of the year.',
      'Leaf cleanup begins as trees start dropping.',
      'Schedule gutter cleaning before heavy leaf fall.',
      'Aerate and overseed cool-season grass in early September.',
    ],
  },
  {
    month: 'October',
    season: 'Fall',
    tasks: [
      'Lower mow height to 2.5 inches for final cuts.',
      'Full fall cleanup — leaves, debris, and beds.',
      'Prime time for gutter guard installation.',
      'Final gutter cleaning of the season.',
    ],
  },
  {
    month: 'November',
    season: 'Late Fall',
    tasks: [
      'Winterize irrigation system before first hard freeze.',
      'Final gutter cleaning before freeze-up.',
      'Snow removal prep — stock salt, test equipment.',
      'Final mowing if grass is still growing.',
    ],
  },
  {
    month: 'December',
    season: 'Winter',
    tasks: [
      'Snow removal active through the month.',
      'Lawn is dormant — minimal care needed.',
      'Keep foot traffic minimal on frozen turf.',
      'Plan and book spring services early (slots fill fast).',
    ],
  },
];

const seasonColor: Record<string, string> = {
  Winter: '#6b9bff',
  'Early Spring': '#86efac',
  Spring: '#22c55e',
  Summer: '#fbbf24',
  'Late Summer': '#f97316',
  Fall: '#fb923c',
  'Late Fall': '#a78bfa',
};

const serviceSchedule = [
  { service: 'Lawn Mowing', months: 'May–October (weekly)' },
  { service: 'Fertilization', months: 'April, June, September' },
  { service: 'Gutter Cleaning', months: 'May, September, November' },
  { service: 'Gutter Guard Installation', months: 'September–October' },
  { service: 'Fall Cleanup', months: 'October–November' },
  { service: 'Spring Cleanup', months: 'March–April' },
  { service: 'Snow Removal', months: 'November–March' },
  { service: 'Hardscaping', months: 'April–October' },
];

export default function SeasonalLawnCalendarMadison() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main className="min-h-screen" style={{ background: '#052e16', color: '#f0f0f5' }}>

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
            <p className="text-sm font-medium mb-4" style={{ color: '#a7f3d0' }}>
              Updated for 2026 &nbsp;·&nbsp; TotalGuard Yard Care
            </p>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight mb-6">
              The Complete{' '}
              <span style={{ color: '#a7f3d0' }}>Madison Lawn Care</span>{' '}
              Calendar (Month-by-Month)
            </h1>
            <p className="text-lg" style={{ color: '#8888a0' }}>
              Know exactly when to mow, fertilize, clean gutters, and prepare for each season.
              Based on Madison, WI climate and growing conditions.
            </p>
          </div>
        </section>

        <div className="max-w-5xl mx-auto px-4 pb-24 space-y-20">

          {/* ── 12-Month Calendar ────────────────────────────────────────── */}
          <section>
            <h2 className="text-2xl font-bold mb-8">Month-by-Month Lawn Care Tasks</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {months.map((entry) => (
                <div
                  key={entry.month}
                  className="rounded-xl p-5 border"
                  style={{
                    background: '#0f1a0f',
                    borderColor: '#1a2e1a',
                    borderTopColor: seasonColor[entry.season] ?? '#22c55e',
                    borderTopWidth: '3px',
                  }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3
                      className="font-bold text-lg"
                      style={{ color: seasonColor[entry.season] ?? '#22c55e' }}
                    >
                      {entry.month}
                    </h3>
                    <span
                      className="text-xs px-2 py-1 rounded-full"
                      style={{
                        background: `${seasonColor[entry.season] ?? '#22c55e'}20`,
                        color: seasonColor[entry.season] ?? '#22c55e',
                      }}
                    >
                      {entry.season}
                    </span>
                  </div>
                  <ul className="space-y-1.5">
                    {entry.tasks.map((task) => (
                      <li key={task} className="flex gap-2 text-sm" style={{ color: '#ccdccc' }}>
                        <span style={{ color: '#22c55e', flexShrink: 0 }}>·</span>
                        {task}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>

          {/* ── Service Schedule Quick Reference ─────────────────────────── */}
          <section>
            <h2 className="text-2xl font-bold mb-2">Service Schedule Quick Reference</h2>
            <p className="mb-6" style={{ color: '#8888a0' }}>
              When each service is most commonly performed in Madison, WI.
            </p>
            <div className="overflow-x-auto rounded-xl border" style={{ borderColor: '#1a2e1a' }}>
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ background: '#22c55e' }}>
                    <th className="text-left px-4 py-3 font-semibold text-black">Service</th>
                    <th className="text-left px-4 py-3 font-semibold text-black">Best Months</th>
                  </tr>
                </thead>
                <tbody>
                  {serviceSchedule.map((row, i) => (
                    <tr
                      key={row.service}
                      style={{
                        background: i % 2 === 0 ? '#0a1a0a' : '#0f1f0f',
                        borderTop: '1px solid #1a2e1a',
                      }}
                    >
                      <td className="px-4 py-3 font-medium">{row.service}</td>
                      <td className="px-4 py-3" style={{ color: '#a0d0a0' }}>{row.months}</td>
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
            <h2 className="text-2xl font-bold mb-3">Schedule Your First Service</h2>
            <p className="mb-2" style={{ color: '#8888a0' }}>
              Bookmark this guide and refer back each month. When you&apos;re ready to schedule,
              we&apos;re one click away.
            </p>
            <p className="text-sm mb-6" style={{ color: '#6b7280' }}>
              Tip: Screenshot the month you&apos;re in and check back monthly.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href="/get-quote"
                className="inline-block px-8 py-3 rounded-lg font-semibold text-black transition-all hover:scale-105"
                style={{ background: '#22c55e' }}
              >
                Get a Free Quote
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

        </div>
      </main>
    </>
  );
}
