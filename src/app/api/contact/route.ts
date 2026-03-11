import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { contactFormSchema } from '@/lib/validation';
import { z } from 'zod';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    // Validate with Zod (uses .issues in v4, .errors in v3)
    const result = contactFormSchema.safeParse(body);
    if (!result.success) {
      const issues: Array<{ message: string }> | undefined =
        (result.error as any).issues ?? (result.error as any).errors;
      const message = issues?.[0]?.message ?? 'Validation failed';
      return NextResponse.json({ error: message }, { status: 400 });
    }

    const data = result.data;

    // Save lead to Supabase directly — no edge function dependency
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY ??
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.error('[contact] Missing Supabase env vars');
      // Still return success — don't block the user
      return NextResponse.json({ success: true });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const nameParts = data.name.trim().split(/\s+/);
    const firstName = nameParts[0] ?? data.name;
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';

    const { error: dbError } = await supabase.from('leads').insert({
      first_name: firstName,
      last_name: lastName || null,
      email: data.email,
      phone: data.phone,
      address: data.address,
      notes: data.message,
      status: 'new',
      referral_source: 'contact_form',
      lead_score: 60, // baseline for form submissions
    });

    if (dbError) {
      console.error('[contact] DB insert error:', dbError.message);
      // Don't block user — log and return success
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[contact] Unhandled error:', err);
    return NextResponse.json({ error: 'Failed to submit form. Please try again.' }, { status: 500 });
  }
}
