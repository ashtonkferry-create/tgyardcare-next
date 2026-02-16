---
name: api-patterns
description: API route patterns, Server Actions, and external service integrations for workely.ai. Use when creating API routes, server actions, webhooks, or external API calls.
---

# API Patterns — Workely.AI

Use this skill when working with API routes, Server Actions, or external service integrations.

## Server Actions (Primary Mutation Pattern)

```typescript
'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { getOrgContext } from '@/lib/auth';

export async function createLead(formData: FormData) {
  const { orgId, userId } = await getOrgContext();
  const supabase = await createClient();

  const name = formData.get('name') as string;
  const email = formData.get('email') as string;

  // Validate inputs
  if (!name || !email) {
    return { error: 'Name and email are required' };
  }

  const { data, error } = await supabase
    .from('leads')
    .insert({ org_id: orgId, name, email, created_by: userId })
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/app/leads');
  return { data };
}
```

### Rules
- Always `'use server'` directive at top
- Always get org context first
- Validate all inputs before DB operations
- Return `{ data }` or `{ error }` — never throw
- Revalidate affected paths after success

## API Routes (Webhooks & External Callbacks Only)

### Stripe Webhook
```typescript
// src/app/api/webhooks/stripe/route.ts
import { headers } from 'next/headers';
import Stripe from 'stripe';

export async function POST(req: Request) {
  const body = await req.text();
  const signature = (await headers()).get('stripe-signature')!;

  // ALWAYS verify signature
  const event = stripe.webhooks.constructEvent(
    body, signature, process.env.STRIPE_WEBHOOK_SECRET!
  );

  switch (event.type) {
    case 'checkout.session.completed':
      // Handle...
      break;
  }

  return Response.json({ received: true });
}
```

### n8n Webhook
```typescript
// src/app/api/webhooks/n8n/route.ts
import { verifyN8nSignature } from '@/lib/n8n/webhook-security';

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get('x-n8n-signature');

  if (!verifyN8nSignature(body, signature)) {
    return Response.json({ error: 'Invalid signature' }, { status: 401 });
  }

  const payload = JSON.parse(body);
  // Process...

  return Response.json({ success: true });
}
```

## Inngest Job Functions

```typescript
// src/lib/jobs/functions/sync-contacts.ts
import { inngest } from '@/lib/inngest/client';

export const syncContacts = inngest.createFunction(
  { id: 'sync-contacts', name: 'Sync Contacts' },
  { event: 'contacts/sync.requested' },
  async ({ event, step }) => {
    const { orgId, connectorId } = event.data;

    const contacts = await step.run('fetch-contacts', async () => {
      // Fetch from external service
    });

    await step.run('upsert-contacts', async () => {
      // Upsert into Supabase
    });

    return { synced: contacts.length };
  }
);
```

## n8n Workflow Deployment
- Templates at `src/lib/n8n/workflow-templates/`
- Deploy via n8n API or n8n MCP
- Each workflow has: trigger → processing steps → action
- Common patterns: lead nurturing, notification chains, data sync

## Error Handling
- Server Actions: return `{ error: string }`
- API routes: return `Response.json({ error }, { status: 4xx/5xx })`
- Inngest: throw errors for automatic retry
- Client-side: catch errors and show toast notifications

## Optimistic UI Pattern
```typescript
// In client component with Zustand store
const addLead = useLeadStore((s) => s.addLead);

async function handleSubmit(formData: FormData) {
  const optimistic = { id: crypto.randomUUID(), ...formValues };
  addLead(optimistic); // Instant UI update

  const result = await createLead(formData);
  if (result.error) {
    removeLead(optimistic.id); // Rollback
    toast.error(result.error);
  }
}
```
