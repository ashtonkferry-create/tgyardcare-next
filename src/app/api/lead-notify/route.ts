import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * Lightweight endpoint that calls the contact-form edge function
 * to send confirmation + owner notification emails.
 * Used by QuoteFlow (which inserts to leads directly via client-side mutation).
 * Does NOT insert to DB — only triggers emails.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    if (!body?.name || !body?.email || !body?.phone || !body?.message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY ??
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.error('[lead-notify] Missing Supabase env vars');
      return NextResponse.json({ success: true });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const { error } = await supabase.functions.invoke('contact-form', {
      body: {
        name: body.name,
        email: body.email,
        phone: body.phone,
        address: body.address || '',
        message: body.message,
      },
    });

    if (error) {
      console.error('[lead-notify] Edge function error:', error.message);
    }

    // Trigger n8n lead-capture workflow (Brevo contact creation, scoring, nurture)
    const n8nWebhookUrl = process.env.N8N_LEAD_WEBHOOK_URL;
    if (n8nWebhookUrl) {
      try {
        const nameParts = (body.name || '').trim().split(/\s+/);
        const firstName = nameParts[0] || body.name;
        const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';
        await fetch(n8nWebhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            first_name: firstName,
            last_name: lastName,
            email: body.email,
            phone: body.phone,
            address: body.address || '',
            service: '',
            source: 'quote_flow',
            notes: body.message,
          }),
        });
      } catch (n8nErr) {
        console.error('[lead-notify] n8n webhook error:', n8nErr);
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[lead-notify] Error:', err);
    return NextResponse.json({ success: true });
  }
}
