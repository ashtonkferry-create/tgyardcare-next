import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { nanoid } from 'nanoid';
import UpcomingJobsCard from '@/components/portal/UpcomingJobsCard';
import ServiceHistoryCard from '@/components/portal/ServiceHistoryCard';
import InvoicesCard from '@/components/portal/InvoicesCard';
import ReferralCard from '@/components/portal/ReferralCard';
import RequestServiceButton from '@/components/portal/RequestServiceButton';

export default async function PortalDashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/portal/login');

  // Get or create portal customer
  let { data: customer } = await supabase
    .from('portal_customers')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle();

  if (!customer) {
    const code = nanoid(8).toUpperCase();
    const { data: newCustomer } = await supabase
      .from('portal_customers')
      .insert({
        user_id: user.id,
        email: user.email ?? '',
        name: user.user_metadata?.name ?? user.email?.split('@')[0] ?? 'Customer',
        referral_code: code,
      })
      .select()
      .single();
    customer = newCustomer;
  }

  if (!customer) redirect('/portal/login');

  const today = new Date().toISOString().split('T')[0];

  const [upcomingRes, historyRes, invoicesRes, referralsRes, ratingsRes] = await Promise.allSettled([
    supabase.from('upcoming_jobs').select('*').eq('customer_id', customer.id)
      .gte('scheduled_date', today).order('scheduled_date').limit(5),
    supabase.from('service_records').select('*').eq('customer_id', customer.id)
      .order('service_date', { ascending: false }).limit(8),
    supabase.from('customer_invoices').select('*').eq('customer_id', customer.id)
      .order('invoice_date', { ascending: false }).limit(8),
    supabase.from('referral_events').select('*').eq('referral_code', customer.referral_code),
    supabase.from('service_ratings').select('service_record_id').eq('customer_id', customer.id),
  ]);

  const upcoming = upcomingRes.status === 'fulfilled' ? (upcomingRes.value.data ?? []) : [];
  const history = historyRes.status === 'fulfilled' ? (historyRes.value.data ?? []) : [];
  const invoices = invoicesRes.status === 'fulfilled' ? (invoicesRes.value.data ?? []) : [];
  const referrals = referralsRes.status === 'fulfilled' ? (referralsRes.value.data ?? []) : [];
  const ratedIds = new Set(
    (ratingsRes.status === 'fulfilled' ? (ratingsRes.value.data ?? []) : [])
      .map((r: { service_record_id: string }) => r.service_record_id)
  );

  // Summary stats
  const totalCredit = referrals.filter((r: { status: string }) => r.status === 'credited').length * 50;
  const pendingInvoiceTotal = invoices
    .filter((i: { status: string }) => i.status !== 'paid')
    .reduce((sum: number, i: { amount_cents: number }) => sum + i.amount_cents, 0);

  return (
    <div className="p-6 pb-24 lg:pb-8 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-white mb-1" style={{ fontFamily: 'var(--font-display)' }}>
          Welcome back{customer.name ? `, ${customer.name.split(' ')[0]}` : ''}
        </h1>
        <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
          Your TotalGuard service dashboard
        </p>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        {[
          { label: 'Upcoming Jobs', value: upcoming.length.toString(), accent: '#22c55e' },
          { label: 'Services Completed', value: history.length.toString(), accent: '#22c55e' },
          { label: 'Outstanding Balance', value: pendingInvoiceTotal > 0 ? `$${(pendingInvoiceTotal / 100).toFixed(2)}` : '$0', accent: pendingInvoiceTotal > 0 ? '#f97316' : '#22c55e' },
          { label: 'Referral Credits', value: totalCredit > 0 ? `$${totalCredit}` : 'None yet', accent: '#22c55e' },
        ].map(stat => (
          <div key={stat.label} className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(34,197,94,0.1)' }}>
            <p className="text-xs mb-1" style={{ color: 'rgba(255,255,255,0.4)' }}>{stat.label}</p>
            <p className="text-xl font-bold" style={{ color: stat.accent, fontFamily: 'var(--font-display)' }}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Main grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        <UpcomingJobsCard jobs={upcoming} />
        <ReferralCard
          referralCode={customer.referral_code}
          referrals={referrals}
          totalCredit={totalCredit}
        />
        <ServiceHistoryCard history={history} ratedIds={ratedIds} customerId={customer.id} />
        <InvoicesCard invoices={invoices} />
      </div>

      {/* Request service CTA */}
      <div className="mt-8">
        <RequestServiceButton customerId={customer.id} />
      </div>
    </div>
  );
}
