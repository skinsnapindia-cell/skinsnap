# SkinSnap — Dual-Chamber Pouch Store

A pixel-faithful frontend build of the **SkinSnap** face-pack store, recreated
from the Claude Design handoff bundle. Same theme, layout, product images,
animations, and responsive behaviour as the reference prototype — rebuilt as a
real Next.js app.

Clicking **Buy Now** (on a product card or a product page) opens a checkout
modal that collects the customer's name + email, sends a confirmation email via
the **Resend API**, and then shows a thank-you message confirming the order.

## Stack

- **Next.js 14** (App Router) + **React 18** + **TypeScript**
- **GSAP + ScrollTrigger** and **Lenis** smooth scroll — the exact animation
  toolkit from the prototype (hero petal drift, mouse parallax, scroll reveals,
  the pinned pouch-activation timeline, 3D card tilt, sticky buy bar)
- **Instrument Serif + Manrope** (Google Fonts)
- **Google Analytics 4** page-view tracking via `NEXT_PUBLIC_GA_MEASUREMENT_ID`
- **Resend** for the confirmation email

## Pages

| Route | Page |
| --- | --- |
| `/` | Home — hero slider, featured collection, innovation strip |
| `/products` | Collection grid + filters |
| `/how-it-works` | Scroll-driven pouch activation animation + FAQ |
| `/contact` | Contact form, business info, map, FAQ |
| `/product/[slug]` | Product detail (front/inside/back gallery, reviews, related) |

## "No backend" note

The build is frontend-only **except for one unavoidable piece**: the Resend API
requires a secret key and blocks direct browser (CORS) calls, so the email
cannot be sent from the browser alone. `app/api/order/route.ts` is a single,
minimal serverless relay whose *only* job is to send the confirmation email.
There is **no database and no other backend logic**.

## Getting started

Requires **Node 18+** (developed on Node 20).

```bash
npm install

# configure Resend
cp .env.local.example .env.local
# then edit .env.local and set RESEND_API_KEY=re_xxxxx
# optionally set NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX

npm run dev        # http://localhost:3000
```

### Resend setup

1. Create a free key at <https://resend.com/api-keys>.
2. Put it in `.env.local` as `RESEND_API_KEY`.
3. The default sender is `onboarding@resend.dev`, which Resend only delivers to
   the address you registered with. To email arbitrary customers, verify your
   own domain in Resend and set `RESEND_FROM` accordingly.

Without a key, the checkout still runs and returns a clear "email service not
configured" message instead of silently failing.

### Google Analytics setup

1. Create a GA4 property and copy the measurement ID, which starts with `G-`.
2. Set `NEXT_PUBLIC_GA_MEASUREMENT_ID` in `.env.local`.
3. Analytics loads only when that variable is present, so local development can
  stay untracked unless you opt in.

## Production build

```bash
npm run build && npm run start
```
