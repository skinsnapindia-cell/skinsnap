# Supabase setup (order database)

Step-by-step, ~10 minutes. Until you finish this, the store still works
perfectly — orders just aren't recorded anywhere except the customer's inbox.

## 1. Create the project

1. Go to <https://supabase.com> and sign up (free).
2. **New project**. Give it a name (e.g. `skinsnap`), set a database password
   (save it in your password manager — you won't need it for this app, but
   you'll want it later), and pick a region close to your customers —
   **Mumbai (ap-south-1)** for India.
3. Wait ~2 minutes while it provisions.

## 2. Create the orders table

1. In the left sidebar: **SQL Editor** → **New query**.
2. Open [`supabase/schema.sql`](../supabase/schema.sql) in this repo, copy the
   whole file, paste it in.
3. Click **Run**. You should see "Success".

To confirm: sidebar → **Table Editor** → you'll see an `orders` table. This is
also where you'll view real orders later — it works like a spreadsheet.

## 3. Get your keys

1. Sidebar → **Project Settings** (gear icon) → **API**.
2. Copy **Project URL** → paste into `.env.local` as `SUPABASE_URL`.
3. Under *Project API keys*, reveal and copy the **`service_role`** key →
   paste into `.env.local` as `SUPABASE_SERVICE_ROLE_KEY`.

> ⚠️ **Use `service_role`, not `anon`.** The `anon` key is blocked by Row Level
> Security and writes will silently fail. The `service_role` key is a secret —
> never commit it, never put it in client-side code, never prefix it with
> `NEXT_PUBLIC_`.

Your `.env.local` should now have:

```
SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...
```

## 4. Restart

Env vars are only read at server start:

```bash
npm run dev          # or: npm run build && npm run start
```

Place a test order. Then check **Table Editor → orders** — you should see the
row, with `order_number` matching the reference in the confirmation email.

## 5. Deploying (Vercel)

Add the same two vars in **Vercel → Project → Settings → Environment
Variables**. `.env.local` is gitignored and never leaves your machine, so
Vercel needs its own copy.

---

## Day-to-day: useful queries

SQL Editor → New query. (You can also just browse the Table Editor.)

**Today's orders**

```sql
select order_number, customer_name, phone, city, total, created_at
from orders
where created_at >= current_date
order by created_at desc;
```

**Orders that never reached Shiprocket** — these need creating by hand in the
Shiprocket dashboard. This is the reconciliation gap to watch:

```sql
select order_number, customer_name, phone, address_line, city, state, pincode, total
from orders
where shiprocket_shipment_id is null
  and status <> 'cancelled'
order by created_at;
```

**Revenue this month**

```sql
select count(*) as orders, sum(total) as revenue
from orders
where created_at >= date_trunc('month', now());
```

**Best sellers**

```sql
select item->>'title' as product,
       sum((item->>'qty')::int) as units
from orders, jsonb_array_elements(items) as item
group by 1
order by units desc;
```

## Notes

- **Free projects pause after ~7 days of no activity.** Irrelevant once you
  have real traffic; if it happens during quiet development, just open the
  dashboard and un-pause.
- **Prices are snapshotted** into `items` per order. Changing a product's price
  later won't rewrite history — past orders still show what was actually paid.
- **The DB never blocks a sale.** If Supabase is down, the order still goes
  through and the customer still gets their email; the failure is logged as
  `[orders] FAILED to save …`. Grep your server logs for `[orders]` and
  `[shiprocket]` if something looks missing.
