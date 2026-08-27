-- SkinSnap — orders table
--
-- Run this once in your Supabase project:
--   Dashboard > SQL Editor > New query > paste this > Run
--
-- Safe to re-run: every statement is idempotent.

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),

  -- Human-readable reference shared with the customer, the confirmation email
  -- and Shiprocket. This is how you reconcile the three.
  order_number text unique not null,
  created_at timestamptz not null default now(),

  -- pre_order -> confirmed -> shipped -> delivered | cancelled
  status text not null default 'pre_order',

  -- customer
  customer_name text not null,
  email text not null,
  phone text,

  -- shipping address
  flat_building text,           -- flat / house no. & building name
  locality text,                -- area / locality (from PIN-code lookup)
  address_line text,            -- composed line: flat, street, area
  city text,
  state text,
  pincode text,

  -- cart snapshot: [{ slug, title, qty, priceEach, lineTotal }]
  -- Stored as a snapshot on purpose — if you change a product's price later,
  -- past orders must still show what the customer actually paid.
  items jsonb not null default '[]'::jsonb,

  subtotal numeric(10,2) not null default 0,
  shipping numeric(10,2),                     -- null = no courier quote at checkout
  total numeric(10,2) not null default 0,
  payment_method text,
  shipping_courier text,

  -- online payment (Razorpay). null for COD orders.
  payment_id text,                            -- razorpay_payment_id once paid
  payment_status text,                        -- 'paid' (prepaid) | 'cod'

  -- fulfilment tracking
  email_sent boolean not null default false,
  shiprocket_order_id text,
  shiprocket_shipment_id text,                -- null = never reached Shiprocket
  awb text
);

create index if not exists orders_created_at_idx on public.orders (created_at desc);
create index if not exists orders_status_idx on public.orders (status);

-- ---------------------------------------------------------------------------
-- SECURITY — do not remove.
--
-- This table holds customer PII (name, email, phone, address). RLS is enabled
-- with NO policies, which denies all access to the public `anon` key. The app
-- writes using the SERVICE ROLE key from server-side API routes only, and the
-- service role bypasses RLS by design.
--
-- Net effect: even if your anon key leaks, nobody can read your customers'
-- addresses. Only add a policy here if you knowingly need public access.
-- ---------------------------------------------------------------------------
alter table public.orders enable row level security;

-- Grant table access to the server-side role and revoke it from the public
-- ones. `service_role` bypasses RLS; `anon`/`authenticated` are blocked both
-- by the missing grant AND by RLS. (Newer Supabase projects don't always
-- auto-grant, which surfaces as "permission denied for table orders" — this
-- makes it explicit and idempotent.)
grant usage on schema public to service_role;
grant all privileges on table public.orders to service_role;
revoke all on table public.orders from anon, authenticated;

-- Tell PostgREST to pick up the new table/grants immediately instead of
-- waiting for its cache to refresh.
notify pgrst, 'reload schema';
