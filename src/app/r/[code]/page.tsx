import { createClient } from '@supabase/supabase-js';
import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import Navigation from '@/components/Navigation';
import Link from 'next/link';

interface Props { params: Promise<{ code: string }>; }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { code } = await params;
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  const { data } = await supabase.from('portal_customers').select('name').eq('referral_code', code).maybeSingle();
  const firstName = data?.name?.split(' ')[0] ?? 'A neighbor';
  return {
    title: `${firstName} invites you to TotalGuard | $50 Off Your First Service`,
    description: `${firstName} recommended TotalGuard Yard Care. Get $50 off your first lawn care service in Madison, WI.`,
  };
}

export default async function ReferralLandingPage({ params }: Props) {
  const { code } = await params;
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  const { data: referrer } = await supabase.from('portal_customers').select('name, referral_code').eq('referral_code', code).maybeSingle();
  if (!referrer) redirect('/get-quote');

  const firstName = referrer.name?.split(' ')[0] ?? 'Your neighbor';

  return (
    <div className="min-h-screen" style={{ background: '#050d07' }}>
      <Navigation />

      {/* Hero */}
      <section className="relative overflow-hidden pt-24 pb-20">
        <div className="absolute inset-0 pointer-events-none" style={{
          background: 'radial-gradient(ellipse 70% 50% at 50% 80%, rgba(34,197,94,0.1) 0%, transparent 70%)'
        }} />
        <div className="absolute inset-0 opacity-[0.05] pointer-events-none">
          <svg className="w-full h-full">
            <defs>
              <pattern id="ref-grid" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                <circle cx="20" cy="20" r="1" fill="#22c55e" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#ref-grid)" />
          </svg>
        </div>

        <div className="container mx-auto px-4 text-center relative z-10 max-w-3xl">
          {/* $50 badge */}
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full mb-8"
            style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)' }}>
            <span style={{ color: '#22c55e', fontSize: '20px' }}>&#x2726;</span>
            <span className="text-sm font-bold" style={{ color: '#4ade80' }}>$50 OFF Your First Service</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight"
            style={{ fontFamily: 'var(--font-display)' }}>
            {firstName} thinks you deserve{' '}
            <span className="bg-clip-text text-transparent" style={{ backgroundImage: 'linear-gradient(135deg, #4ade80, #22c55e)' }}>
              a perfect yard.
            </span>
          </h1>

          <p className="text-lg mb-10" style={{ color: 'rgba(255,255,255,0.55)' }}>
            TotalGuard Yard Care serves Madison, WI and all of Dane County. Join 80+ happy families
            who trust us with their outdoor spaces.
          </p>

          {/* What you get */}
          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-10">
            {[
              { icon: '\uD83D\uDC9A', text: 'You get $50 off your first service' },
              { icon: '\uD83C\uDFE1', text: 'Professional crew, fully insured' },
              { icon: '\u2B50', text: '4.9 Google Rating across 80+ customers' },
            ].map(item => (
              <div key={item.text} className="flex items-center gap-3 text-left px-5 py-3 rounded-xl"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <span className="text-2xl shrink-0">{item.icon}</span>
                <span className="text-sm text-white">{item.text}</span>
              </div>
            ))}
          </div>

          {/* CTA */}
          <Link
            href={`/get-quote?referral=${code}`}
            className="inline-flex items-center gap-3 px-10 py-4 rounded-2xl text-base font-bold transition-all duration-200"
            style={{ background: '#22c55e', color: '#050d07' }}
          >
            Claim Your $50 Off
            <span>&rarr;</span>
          </Link>

          <p className="mt-4 text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
            No contracts. No commitment. Just great lawn care.
          </p>
        </div>
      </section>

      {/* Trust section */}
      <section className="py-16 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="grid sm:grid-cols-3 gap-6 text-center">
            {[
              { stat: '4.9', label: 'Google Rating' },
              { stat: '80+', label: 'Madison Families Served' },
              { stat: '100%', label: 'Satisfaction Guarantee' },
            ].map(item => (
              <div key={item.label}>
                <p className="text-4xl font-bold mb-1" style={{ fontFamily: 'var(--font-display)', color: '#22c55e' }}>{item.stat}</p>
                <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
