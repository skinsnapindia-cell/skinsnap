-- SkinSnap — add Razorpay online-payment columns to the orders table.
--
-- Run this once in your Supabase project (Dashboard > SQL Editor > New query),
-- if your `orders` table was created before online payment was added.
-- Safe to re-run.

alter table public.orders add column if not exists payment_id text;      -- razorpay_payment_id
alter table public.orders add column if not exists payment_status text;  -- 'paid' | 'cod'

-- tell PostgREST to pick up the new columns
notify pgrst, 'reload schema';
