-- Phase 8: Customer Portal Tables
-- Portal customers table (links auth.users to portal profile)
CREATE TABLE IF NOT EXISTS portal_customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  name text NOT NULL DEFAULT '',
  email text NOT NULL,
  phone text,
  address text,
  referral_code text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Service records (completed past services — populated by admin/n8n)
CREATE TABLE IF NOT EXISTS service_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid REFERENCES portal_customers(id) ON DELETE CASCADE NOT NULL,
  service_date date NOT NULL,
  service_type text NOT NULL,
  description text,
  crew_notes text,
  amount_cents integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Upcoming scheduled jobs
CREATE TABLE IF NOT EXISTS upcoming_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid REFERENCES portal_customers(id) ON DELETE CASCADE NOT NULL,
  scheduled_date date NOT NULL,
  service_type text NOT NULL,
  description text,
  time_window text DEFAULT 'Morning (8am-12pm)',
  status text DEFAULT 'scheduled' CHECK (status IN ('scheduled','confirmed','en_route','completed','cancelled')),
  created_at timestamptz DEFAULT now()
);

-- Customer invoices
CREATE TABLE IF NOT EXISTS customer_invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid REFERENCES portal_customers(id) ON DELETE CASCADE NOT NULL,
  invoice_date date NOT NULL,
  due_date date,
  amount_cents integer NOT NULL DEFAULT 0,
  status text DEFAULT 'pending' CHECK (status IN ('pending','paid','overdue')),
  description text,
  invoice_number text,
  created_at timestamptz DEFAULT now()
);

-- Service ratings (1-5 stars per completed service)
CREATE TABLE IF NOT EXISTS service_ratings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid REFERENCES portal_customers(id) ON DELETE CASCADE NOT NULL,
  service_record_id uuid REFERENCES service_records(id) ON DELETE CASCADE NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(service_record_id)
);

-- Referral events tracking
CREATE TABLE IF NOT EXISTS referral_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referral_code text NOT NULL,
  referred_email text NOT NULL,
  referred_name text,
  status text DEFAULT 'pending' CHECK (status IN ('pending','qualified','credited')),
  referrer_credit_cents integer DEFAULT 5000,
  referred_discount_cents integer DEFAULT 5000,
  created_at timestamptz DEFAULT now(),
  qualified_at timestamptz,
  credited_at timestamptz
);

-- Additional service requests from portal
CREATE TABLE IF NOT EXISTS service_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid REFERENCES portal_customers(id) ON DELETE CASCADE NOT NULL,
  service_type text NOT NULL,
  preferred_date date,
  notes text,
  status text DEFAULT 'pending' CHECK (status IN ('pending','reviewing','scheduled','declined')),
  created_at timestamptz DEFAULT now()
);

-- RLS
ALTER TABLE portal_customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE upcoming_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_requests ENABLE ROW LEVEL SECURITY;

-- portal_customers: user sees own row only
CREATE POLICY "customers_own_row" ON portal_customers
  FOR ALL USING (auth.uid() = user_id);

-- service_records: user sees own records
CREATE POLICY "customers_own_service_records" ON service_records
  FOR ALL USING (
    customer_id IN (SELECT id FROM portal_customers WHERE user_id = auth.uid())
  );

-- upcoming_jobs: user sees own jobs
CREATE POLICY "customers_own_upcoming_jobs" ON upcoming_jobs
  FOR ALL USING (
    customer_id IN (SELECT id FROM portal_customers WHERE user_id = auth.uid())
  );

-- customer_invoices: user sees own invoices
CREATE POLICY "customers_own_invoices" ON customer_invoices
  FOR ALL USING (
    customer_id IN (SELECT id FROM portal_customers WHERE user_id = auth.uid())
  );

-- service_ratings: user manages own ratings
CREATE POLICY "customers_own_ratings" ON service_ratings
  FOR ALL USING (
    customer_id IN (SELECT id FROM portal_customers WHERE user_id = auth.uid())
  );

-- referral_events: public insert (anyone can be referred), user sees events for their code
CREATE POLICY "public_referral_insert" ON referral_events
  FOR INSERT WITH CHECK (true);
CREATE POLICY "customers_own_referral_events" ON referral_events
  FOR SELECT USING (
    referral_code IN (SELECT referral_code FROM portal_customers WHERE user_id = auth.uid())
  );

-- service_requests: user manages own requests
CREATE POLICY "customers_own_service_requests" ON service_requests
  FOR ALL USING (
    customer_id IN (SELECT id FROM portal_customers WHERE user_id = auth.uid())
  );
