import type { Metadata } from 'next';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { WebPageSchema } from '@/components/schemas/WebPageSchema';
import Link from 'next/link';

export const metadata: Metadata = {
  title:
    'Madison Lawn Care Guide 2026 | Complete Wisconsin Yard Care Resource | TotalGuard',
  description:
    "The complete Madison, WI lawn care guide. Month-by-month calendar, seasonal tips, common Wisconsin lawn problems, and professional advice from Dane County's top lawn care company.",
  alternates: { canonical: 'https://tgyardcare.com/lawn-care-guide' },
  openGraph: {
    title: 'Madison Lawn Care Guide 2026 | TotalGuard Yard Care',
    description:
      'Your complete resource for lawn care in Madison, WI. Seasonal schedules, local tips, and expert advice.',
  },
};

const SEASONAL_TIPS = {
  spring: {
    color: '#22c55e',
    months: 'March - May',
    emoji: '🌸',
    tips: [
      'Apply pre-emergent crabgrass control before soil temps reach 55F (typically early April in Madison)',
      'First mowing at 3" height - never remove more than 1/3 of the blade at once',
      "Core aerate compacted areas - Madison's clay soils benefit enormously from this",
      'First fertilizer application (slow-release nitrogen) - ideal window is late April to mid-May',
      'Spring cleanup: remove winter debris, edge beds, cut back ornamental grasses',
    ],
  },
  summer: {
    color: '#eab308',
    months: 'June - August',
    emoji: '☀️',
    tips: [
      'Raise mowing height to 3.5-4" to shade roots and retain moisture during Madison heat',
      'Water deeply and infrequently: 1-1.5" per week, early morning only',
      'Watch for grub damage in July - white grubs peak in Madison mid-July to August',
      'Avoid fertilizing during summer heat - wait until temperatures drop below 85F',
      'Spot-treat weeds rather than blanket applications to protect heat-stressed grass',
    ],
  },
  fall: {
    color: '#f97316',
    months: 'September - November',
    emoji: '🍂',
    tips: [
      'Fall is THE most important fertilization window - apply winterizer in late October',
      'Overseed bare spots in mid-September (soil temp 50-65F) - perfect for Madison',
      'Continue mowing until grass stops growing (~late October), then final cut at 2.5"',
      "Gutter cleaning: Madison's oak and maple trees drop heavily in October-November",
      'Leaf cleanup prevents snow mold - leave no matted leaves going into winter',
    ],
  },
  winter: {
    color: '#38bdf8',
    months: 'December - February',
    emoji: '❄️',
    tips: [
      'Snow removal within 24 hours prevents ice formation on walkways and driveways',
      'Avoid road salt on lawn edges - use sand or calcium chloride near grass',
      'Late January/February: plan your spring schedule and book services early',
      'Inspect irrigation system in late January if any freeze-thaw cycles occurred',
      'Late winter: look for snow mold as snow recedes (pink/gray patches on lawn)',
    ],
  },
};

const SERVICES = [
  {
    name: 'Lawn Mowing',
    slug: 'mowing',
    icon: '🌿',
    why: "Madison's clay soils and variable precipitation create fast growth periods that require consistent mowing to prevent scalping and disease.",
  },
  {
    name: 'Fertilization & Weed Control',
    slug: 'fertilization',
    icon: '🌱',
    why: "Wisconsin's short growing season makes targeted fertilization critical. Our 5-step program is timed to Madison's actual soil temperature data.",
  },
  {
    name: 'Gutter Cleaning',
    slug: 'gutter-cleaning',
    icon: '🏠',
    why: "Madison's oak, maple, and elm tree density means gutters fill twice per year - spring (seeds/pollen) and fall (leaves). Blocked gutters cause ice dams.",
  },
  {
    name: 'Gutter Guard Installation',
    slug: 'gutter-guards',
    icon: '🛡️',
    why: "A permanent solution for Madison homeowners tired of bi-annual cleanings. Our micro-mesh guards handle Wisconsin's heavy leaf loads.",
  },
  {
    name: 'Fall Cleanup',
    slug: 'fall-cleanup',
    icon: '🍂',
    why: 'Leaving matted leaves over winter invites snow mold and suffocates turf. Fall cleanup is the single highest-impact service for long-term lawn health.',
  },
  {
    name: 'Spring Cleanup',
    slug: 'spring-cleanup',
    icon: '🌸',
    why: 'Winter in Madison leaves behind salt damage, downed branches, and compacted areas. A proper spring cleanup sets the tone for the entire growing season.',
  },
  {
    name: 'Snow Removal',
    slug: 'snow-removal',
    icon: '❄️',
    why: 'Madison averages 40"+ of snow annually. Professional removal within 24 hours prevents liability and ice formation on surfaces.',
  },
  {
    name: 'Hardscaping',
    slug: 'hardscaping',
    icon: '🪨',
    why: "Patios, retaining walls, and walkways that survive Wisconsin's freeze-thaw cycles require proper base installation - something we specialize in.",
  },
];

const COMMON_PROBLEMS = [
  {
    problem: 'Clay-Heavy Soil',
    symptom: 'Standing water after rain, compaction, poor drainage',
    solution:
      'Core aeration every fall + topdress with compost to break up clay structure. Most Madison properties benefit from annual aeration.',
    severity: 'Common' as const,
  },
  {
    problem: 'Crabgrass Invasion',
    symptom: 'Low-growing, light-green clumps appearing in summer',
    solution:
      'Pre-emergent application before April 15 (when forsythia blooms in Madison). Overseeding thin areas prevents crabgrass from finding bare soil.',
    severity: 'Common' as const,
  },
  {
    problem: 'Snow Mold',
    symptom: 'Pink or gray circular patches 2-12" across after snow melts',
    solution:
      'Final fall mowing at 2.5", remove leaf piles before snow, and apply preventative fungicide in late October for severe cases.',
    severity: 'Seasonal' as const,
  },
  {
    problem: 'White Grub Damage',
    symptom:
      'Spongy, yellowing turf in July-August that peels back like carpet',
    solution:
      'Apply preventative grub control in June before eggs hatch. Late-summer treatment is less effective. Replace damaged turf in fall.',
    severity: 'Moderate' as const,
  },
  {
    problem: 'Chinch Bugs',
    symptom: 'Brown patches in sunny areas during dry July-August periods',
    solution:
      'Often misdiagnosed as drought stress. Look for bugs at the edge of brown areas. Treat with insecticide and water deeply.',
    severity: 'Less Common' as const,
  },
];

const MONTHLY_CALENDAR = [
  { month: 'Jan', task: 'Dormant. Plan spring services. Snow removal.' },
  { month: 'Feb', task: 'Check for snow mold. Order seed/fertilizer.' },
  { month: 'Mar', task: 'Spring cleanup. First mow if temp >50F.' },
  { month: 'Apr', task: 'Pre-emergent crabgrass. Aeration. First fertilizer.' },
  { month: 'May', task: 'Regular mowing schedule. Mulch beds.' },
  { month: 'Jun', task: 'Raise mow height. Grub prevention.' },
  { month: 'Jul', task: 'Water 1-1.5" weekly. Watch for grubs.' },
  { month: 'Aug', task: 'Aerate (fall prep). Overseeding bare spots.' },
  { month: 'Sep', task: 'Fall fertilizer (critical). Overseeding.' },
  { month: 'Oct', task: 'Final mow at 2.5". Gutter cleaning. Leaf cleanup.' },
  { month: 'Nov', task: 'Winterize irrigation. Final gutter clean.' },
  { month: 'Dec', task: 'Snow removal. Dormant lawn. Plan spring.' },
];

const FAQS = [
  {
    q: 'When should I start lawn care in Madison, WI?',
    a: 'Madison lawns typically wake up in late March to early April. Your first task is spring cleanup and pre-emergent crabgrass control when soil temperatures reach 50F, usually around April 1-15.',
  },
  {
    q: 'How often should I mow my lawn in Madison?',
    a: 'During peak growing season (May-June), mow every 5-7 days. In the heat of summer, every 7-10 days. Never remove more than 1/3 of the grass blade at once, and keep your blade sharp.',
  },
  {
    q: 'Why is fall the most important season for Madison lawns?',
    a: "Fall fertilization stores nutrients in grass roots for winter and fuels spring green-up. Overseeding in September catches the ideal soil temperature window. And thorough leaf cleanup prevents snow mold - Madison's #1 winter lawn disease.",
  },
  {
    q: 'How do I fix clay soil in my Madison yard?',
    a: 'Annual core aeration is the most effective treatment. For severe compaction, topdress with 1/4" of compost after aeration. Over 3-5 years, this dramatically improves drainage and reduces compaction.',
  },
  {
    q: 'Does TotalGuard serve my Madison neighborhood?',
    a: 'We serve all Madison neighborhoods including Nakoma, Maple Bluff, Shorewood Hills, Westmorland, Regent, and all surrounding Dane County communities including Middleton, Waunakee, Sun Prairie, Fitchburg, and more.',
  },
];

function getSeverityStyle(severity: string): { bg: string; color: string } {
  switch (severity) {
    case 'Common':
      return { bg: 'rgba(245,158,11,0.1)', color: '#f59e0b' };
    case 'Seasonal':
      return { bg: 'rgba(56,189,248,0.1)', color: '#38bdf8' };
    case 'Moderate':
      return { bg: 'rgba(249,115,22,0.1)', color: '#f97316' };
    default:
      return { bg: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.35)' };
  }
}

export default function LawnCareGuidePage() {
  const currentMonth = new Date().getMonth(); // 0-11

  return (
    <div className="min-h-screen" style={{ background: '#052e16' }}>
      <WebPageSchema
        name="Madison Lawn Care Guide 2026"
        description="The complete lawn care guide for Madison, Wisconsin homeowners. Monthly calendar, seasonal tips, and local expertise."
        url="/lawn-care-guide"
      />

      {/* FAQ Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: FAQS.map((faq) => ({
              '@type': 'Question',
              name: faq.q,
              acceptedAnswer: { '@type': 'Answer', text: faq.a },
            })),
          }),
        }}
      />

      <Navigation />

      {/* Hero */}
      <section className="relative overflow-hidden pt-24 pb-16">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'linear-gradient(160deg, #052e16 0%, #0a3520 40%, #052e16 100%)',
          }}
        />
        <div className="absolute inset-0 opacity-[0.05] pointer-events-none">
          <svg className="w-full h-full">
            <defs>
              <pattern
                id="guide-grid"
                x="0"
                y="0"
                width="40"
                height="40"
                patternUnits="userSpaceOnUse"
              >
                <circle cx="20" cy="20" r="1" fill="#22c55e" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#guide-grid)" />
          </svg>
        </div>

        <div className="container mx-auto px-4 max-w-4xl relative z-10">
          <div
            className="flex items-center gap-2 mb-4 text-xs font-semibold uppercase tracking-widest"
            style={{ color: '#22c55e' }}
          >
            <span>TotalGuard Yard Care</span>
            <span style={{ color: 'rgba(34,197,94,0.4)' }}>›</span>
            <span>Madison Lawn Care Guide</span>
          </div>

          <h1
            className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            The Complete Madison{' '}
            <span
              className="bg-clip-text text-transparent"
              style={{
                backgroundImage: 'linear-gradient(135deg, #4ade80, #22c55e)',
              }}
            >
              Lawn Care Guide
            </span>
          </h1>

          <p
            className="text-lg mb-4"
            style={{ color: 'rgba(255,255,255,0.55)' }}
          >
            Wisconsin&apos;s climate is unforgiving — cold winters, clay soils,
            and a short growing season demand a precise, locally-informed
            approach. This guide covers everything Madison homeowners need to
            know, month by month.
          </p>

          <div
            className="flex flex-wrap gap-4 text-sm"
            style={{ color: 'rgba(255,255,255,0.35)' }}
          >
            <span>Updated March 2026</span>
            <span>·</span>
            <span>Written by TotalGuard professionals</span>
            <span>·</span>
            <span>Serving Madison, WI since 2019</span>
          </div>
        </div>
      </section>

      {/* Seasonal Guide */}
      <section
        className="py-16 border-t"
        style={{ borderColor: 'rgba(255,255,255,0.05)' }}
      >
        <div className="container mx-auto px-4 max-w-5xl">
          <h2
            className="text-3xl font-bold text-white mb-3"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Seasonal Lawn Care Guide
          </h2>
          <p className="mb-10" style={{ color: 'rgba(255,255,255,0.45)' }}>
            What to do — and when — for a Madison lawn that thrives year-round.
          </p>

          <div className="grid sm:grid-cols-2 gap-6">
            {Object.entries(SEASONAL_TIPS).map(([season, data]) => (
              <div
                key={season}
                id={season}
                className="rounded-2xl p-6"
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: `1px solid ${data.color}22`,
                }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-3xl">{data.emoji}</span>
                  <div>
                    <h3
                      className="text-lg font-bold capitalize"
                      style={{
                        color: data.color,
                        fontFamily: 'var(--font-display)',
                      }}
                    >
                      {season}
                    </h3>
                    <p
                      className="text-xs"
                      style={{ color: 'rgba(255,255,255,0.3)' }}
                    >
                      {data.months}
                    </p>
                  </div>
                </div>
                <ul className="space-y-2">
                  {data.tips.map((tip, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-3 text-sm"
                      style={{ color: 'rgba(255,255,255,0.65)' }}
                    >
                      <span
                        className="mt-1 w-4 h-4 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold"
                        style={{
                          background: `${data.color}20`,
                          color: data.color,
                        }}
                      >
                        {i + 1}
                      </span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Monthly Calendar */}
      <section
        className="py-16 border-t"
        style={{
          borderColor: 'rgba(255,255,255,0.05)',
          background: 'rgba(255,255,255,0.01)',
        }}
      >
        <div className="container mx-auto px-4 max-w-5xl">
          <h2
            className="text-3xl font-bold text-white mb-3"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Lawn Care Calendar
          </h2>
          <p className="mb-10" style={{ color: 'rgba(255,255,255,0.45)' }}>
            Month-by-month quick reference for Madison, WI yards.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {MONTHLY_CALENDAR.map((m, i) => {
              const isCurrent = i === currentMonth;
              return (
                <div
                  key={m.month}
                  className="rounded-xl p-4"
                  style={{
                    background: isCurrent
                      ? 'rgba(34,197,94,0.08)'
                      : 'rgba(255,255,255,0.02)',
                    border: isCurrent
                      ? '1px solid rgba(34,197,94,0.3)'
                      : '1px solid rgba(255,255,255,0.06)',
                  }}
                >
                  <p
                    className="text-sm font-bold mb-1"
                    style={{
                      color: isCurrent
                        ? '#22c55e'
                        : 'rgba(255,255,255,0.6)',
                      fontFamily: 'var(--font-display)',
                    }}
                  >
                    {m.month}{' '}
                    {isCurrent && (
                      <span
                        className="text-[10px] ml-1 px-1.5 py-0.5 rounded-full"
                        style={{
                          background: 'rgba(34,197,94,0.2)',
                          color: '#22c55e',
                        }}
                      >
                        Now
                      </span>
                    )}
                  </p>
                  <p
                    className="text-xs"
                    style={{ color: 'rgba(255,255,255,0.4)' }}
                  >
                    {m.task}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Common Problems */}
      <section
        className="py-16 border-t"
        style={{ borderColor: 'rgba(255,255,255,0.05)' }}
      >
        <div className="container mx-auto px-4 max-w-5xl">
          <h2
            className="text-3xl font-bold text-white mb-3"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Common Madison Lawn Problems
          </h2>
          <p className="mb-10" style={{ color: 'rgba(255,255,255,0.45)' }}>
            Diagnose and solve the most common issues in Dane County yards.
          </p>

          <div className="space-y-4">
            {COMMON_PROBLEMS.map((problem) => {
              const severity = getSeverityStyle(problem.severity);
              return (
                <div
                  key={problem.problem}
                  className="rounded-2xl p-6"
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.06)',
                  }}
                >
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <h3
                      className="text-lg font-bold text-white"
                      style={{ fontFamily: 'var(--font-display)' }}
                    >
                      {problem.problem}
                    </h3>
                    <span
                      className="text-xs px-2 py-1 rounded-full shrink-0"
                      style={{ background: severity.bg, color: severity.color }}
                    >
                      {problem.severity}
                    </span>
                  </div>
                  <p
                    className="text-sm mb-2"
                    style={{ color: 'rgba(255,255,255,0.45)' }}
                  >
                    <strong className="text-white">Symptoms:</strong>{' '}
                    {problem.symptom}
                  </p>
                  <p
                    className="text-sm"
                    style={{ color: 'rgba(255,255,255,0.55)' }}
                  >
                    <strong className="text-white">Solution:</strong>{' '}
                    {problem.solution}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Services */}
      <section
        className="py-16 border-t"
        style={{
          borderColor: 'rgba(255,255,255,0.05)',
          background: 'rgba(255,255,255,0.01)',
        }}
      >
        <div className="container mx-auto px-4 max-w-5xl">
          <h2
            className="text-3xl font-bold text-white mb-3"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Our Services — Why They Matter in Madison
          </h2>
          <p className="mb-10" style={{ color: 'rgba(255,255,255,0.45)' }}>
            Every service is tuned to Wisconsin&apos;s specific climate and soil
            conditions.
          </p>

          <div className="grid sm:grid-cols-2 gap-4">
            {SERVICES.map((service) => (
              <Link
                key={service.slug}
                href={`/services/${service.slug}`}
                className="flex items-start gap-4 p-5 rounded-2xl group transition-all duration-200 hover:border-green-500/20"
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.06)',
                }}
              >
                <span className="text-3xl shrink-0">{service.icon}</span>
                <div>
                  <h3
                    className="text-base font-bold text-white mb-1 group-hover:text-green-400 transition-colors"
                    style={{ fontFamily: 'var(--font-display)' }}
                  >
                    {service.name}
                  </h3>
                  <p
                    className="text-sm"
                    style={{ color: 'rgba(255,255,255,0.45)' }}
                  >
                    {service.why}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section
        className="py-16 border-t"
        style={{ borderColor: 'rgba(255,255,255,0.05)' }}
      >
        <div className="container mx-auto px-4 max-w-3xl">
          <h2
            className="text-3xl font-bold text-white mb-10"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {FAQS.map((faq) => (
              <div
                key={faq.q}
                className="p-6 rounded-2xl"
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.06)',
                }}
              >
                <h3 className="text-base font-bold text-white mb-2">
                  {faq.q}
                </h3>
                <p
                  className="text-sm"
                  style={{ color: 'rgba(255,255,255,0.55)' }}
                >
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Lead Magnet CTA */}
      <section
        className="py-16 border-t"
        style={{
          borderColor: 'rgba(255,255,255,0.05)',
          background: 'rgba(34,197,94,0.03)',
        }}
      >
        <div className="container mx-auto px-4 max-w-2xl text-center">
          <h2
            className="text-3xl font-bold text-white mb-4"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Want a Free Madison Lawn Assessment?
          </h2>
          <p className="mb-8" style={{ color: 'rgba(255,255,255,0.5)' }}>
            Our team will evaluate your specific property, soil type, and
            current condition — then give you a personalized care plan. No cost,
            no obligation.
          </p>
          <Link
            href="/get-quote"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl text-base font-bold transition-all duration-200 hover:brightness-110"
            style={{ background: '#22c55e', color: '#050d07' }}
          >
            Get My Free Assessment →
          </Link>
          <p
            className="mt-4 text-xs"
            style={{ color: 'rgba(255,255,255,0.25)' }}
          >
            Or call us at (608) 535-6057
          </p>
        </div>
      </section>

      <Footer showCloser={false} />
    </div>
  );
}
