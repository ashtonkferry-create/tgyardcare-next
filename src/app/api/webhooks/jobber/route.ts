import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * POST /api/webhooks/jobber
 * Receives webhook events from Jobber (JOB_CLOSED, CLIENT_CREATE, etc.).
 * Logs every event to jobber_events table for processing by cron automations.
 */
export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();
    const eventType = payload?.topic ?? payload?.event ?? 'UNKNOWN';

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    await supabase.from('jobber_events').insert({
      event_type: eventType,
      payload,
      processed: false,
    });

    return NextResponse.json({ received: true, event: eventType });
  } catch (err) {
    console.error('Jobber webhook error:', err);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
