-- Gumroad purchases (written by netlify/functions/gumroad-webhook.ts).
-- One row per Gumroad sale; repeat pings for the same sale update the row.
-- Run once in the Supabase SQL editor. Safe to run again.

CREATE TABLE IF NOT EXISTS public.purchases (
  sale_id text PRIMARY KEY,
  email text NOT NULL,
  product_id text,
  product_name text,
  price_cents integer,
  currency text,
  refunded boolean NOT NULL DEFAULT false,
  purchased_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS purchases_email_idx ON public.purchases (email);

-- Only the server (service role key) may read or write purchases.
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.purchases FROM anon, authenticated;
