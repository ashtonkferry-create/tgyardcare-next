-- Phase 9: Email subscribers table for lead magnets
CREATE TABLE IF NOT EXISTS email_subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  name text,
  source text DEFAULT 'blog',
  subscribed_at timestamptz DEFAULT now(),
  status text DEFAULT 'active' CHECK (status IN ('active', 'unsubscribed'))
);

ALTER TABLE email_subscribers ENABLE ROW LEVEL SECURITY;

-- Allow public inserts (subscription form)
CREATE POLICY "public_insert_email_subscribers"
  ON email_subscribers FOR INSERT WITH CHECK (true);
