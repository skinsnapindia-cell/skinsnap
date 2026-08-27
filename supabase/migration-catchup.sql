-- SkinSnap — catch-up migration.
--
-- Brings an OLDER `orders` table up to date with every column the app writes.
-- Run once in Supabase > SQL Editor > New query. Every statement is idempotent
-- (`add column if not exists`), so it's safe to run on any existing table and
-- safe to re-run.

-- customer
alter table public.orders add column if not exists customer_name text;
alter table public.orders add column if not exists email text;
alter table public.orders add column if not exists phone text;

-- shipping address
alter table public.orders add column if not exists flat_building text;   -- flat / house no. & building
alter table public.orders add column if not exists locality text;        -- area / locality
alter table public.orders add column if not exists address_line text;    -- composed line
alter table public.orders add column if not exists city text;
alter table public.orders add column if not exists state text;
alter table public.orders add column if not exists pincode text;

-- cart + money
alter table public.orders add column if not exists items jsonb not null default '[]'::jsonb;
alter table public.orders add column if not exists subtotal numeric(10,2) not null default 0;
alter table public.orders add column if not exists shipping numeric(10,2);
alter table public.orders add column if not exists total numeric(10,2) not null default 0;

-- payment
alter table public.orders add column if not exists payment_method text;
alter table public.orders add column if not exists payment_id text;      -- razorpay_payment_id (prepaid)
alter table public.orders add column if not exists payment_status text;  -- 'paid' | 'cod'

-- status + fulfilment
alter table public.orders add column if not exists status text not null default 'pre_order';
alter table public.orders add column if not exists shipping_courier text;
alter table public.orders add column if not exists email_sent boolean not null default false;
alter table public.orders add column if not exists shiprocket_order_id text;
alter table public.orders add column if not exists shiprocket_shipment_id text;
alter table public.orders add column if not exists awb text;

-- tell PostgREST (the API layer) to refresh its cached schema
notify pgrst, 'reload schema';
