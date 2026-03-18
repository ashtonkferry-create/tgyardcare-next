import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const { serviceRecordId, rating, comment } = await req.json();
  if (!serviceRecordId || !rating || rating < 1 || rating > 5) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
  }
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: customer } = await supabase.from('portal_customers').select('id').eq('user_id', user.id).maybeSingle();
  if (!customer) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  await supabase.from('service_ratings').upsert({
    customer_id: customer.id,
    service_record_id: serviceRecordId,
    rating,
    comment,
  });
  return NextResponse.json({ ok: true });
}
