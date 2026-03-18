import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const { serviceType, preferredDate, notes } = await req.json();
  if (!serviceType) return NextResponse.json({ error: 'Missing service type' }, { status: 400 });
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: customer } = await supabase.from('portal_customers').select('id').eq('user_id', user.id).maybeSingle();
  if (!customer) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  await supabase.from('service_requests').insert({
    customer_id: customer.id,
    service_type: serviceType,
    preferred_date: preferredDate || null,
    notes,
  });
  return NextResponse.json({ ok: true });
}
