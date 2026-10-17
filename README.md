# Rosa Alba — Online store (COD, Morocco)

Mobile-first, bilingual (FR / AR with RTL) store built for paid-ads traffic and cash-on-delivery.

**Stack:** Next.js 14 (App Router) · Tailwind · Supabase (Postgres + Storage) · deploy on Vercel.

## What's inside

| Area | URL | Notes |
|---|---|---|
| Home | `/` | Hero, trust bar, products, ingredients, how-to-order, FAQ |
| Product page | `/products/[slug]` | Gallery, offers (1/2/3 units with automatic discount), one-page COD form, ingredients / usage / delivery, FAQ, related, **mobile sticky order bar**, JSON-LD |
| Ad landing page | `/lp/[slug]` | No menu/footer, 3 headline variants via `?v=1\|2\|3`, same order box |
| Cart + checkout | `/checkout` | Multi-product COD checkout, prices refreshed from the server |
| Thank-you | `/thank-you/RA-xxxx?t=…` | Order confirmation, "we'll call you", **one-click upsell** (-X% on one more product), Purchase tracking |
| Admin | `/admin` | Dashboard & analytics, orders (status, notes, WhatsApp/call, CSV export), products (prices, stock, photos upload, FR/AR texts, discounts), customers, reviews, settings & pixels |

Language is switched with the button in the header (cookie `lang`). Currency: MAD.

## Deploy in ~15 minutes

### 1. Supabase (database + image storage)
1. Create a project on https://supabase.com (free tier is fine to start).
2. **SQL Editor** → paste and run `supabase/schema.sql`, then `supabase/seed.sql` (5 products with **placeholder prices**).
3. **Project Settings → API**: copy the *Project URL* and the *service_role* key (secret — never put it in the browser).

### 2. Push the code to GitHub
```bash
cd rosa-alba-store
git init && git add . && git commit -m "Rosa Alba store"
# create an empty repo on GitHub, then:
git remote add origin git@github.com:<you>/rosa-alba-store.git
git push -u origin main
```

### 3. Vercel
Import the repo on https://vercel.com/new and add these environment variables:

| Variable | Value |
|---|---|
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | service_role key |
| `ADMIN_PASSWORD` | a long password for `/admin` |
| `ADMIN_SESSION_SECRET` | random string: `openssl rand -hex 32` |
| `NEXT_PUBLIC_SITE_URL` | `https://your-domain.ma` |

Deploy, then connect your domain (Vercel → Settings → Domains).
> Vercel's free *Hobby* plan is meant for non-commercial use — for a live shop check their terms and use *Pro*, or host on any Node 18+ server (`npm run build && npm start`).

### Order e-mail alerts (optional, Resend)
Add `RESEND_API_KEY` (from https://resend.com/api-keys) to get an e-mail for every new order.
`ORDER_NOTIFY_EMAIL` (default: the owner's address, comma-separate several) and `RESEND_FROM` are optional.
Without a verified domain Resend only delivers from `onboarding@resend.dev` to the e-mail of your Resend account;
verify your own domain in Resend to send from `orders@your-domain.ma`.

### 4. First login (5 minutes)
1. Open `/admin` → log in with `ADMIN_PASSWORD`.
2. **Réglages & tracking**: WhatsApp number, delivery time, Meta/TikTok/GA4 IDs.
3. **Produits**: set the real prices, stock and upload real photos (the first image is the main one).
4. Place a test order on your site, then check it in **Commandes**.

## Local development
```bash
cp .env.example .env.local   # fill it in
npm install
npm run dev                  # http://localhost:3000
```
Without Supabase variables the storefront runs in **demo mode** (reads the seed products, orders are refused) — handy to preview the design.

## How it works

* **Prices are never trusted from the browser.** `POST /api/orders` re-reads products from the DB, applies the quantity discount (`disc_2`, `disc_3` per product) and computes the totals.
* **Anti-spam:** honeypot field, Moroccan phone validation (06/07/05…), duplicate guard (same phone + total within 3 minutes).
* **Stock** is decremented on order and restored when an order becomes *cancelled/returned*.
* **Thank-you page** is only readable with the private token in the URL (orders contain personal data).
* **Upsell** (`/api/orders/upsell`): adds one discounted product to an order that is still *new* (within 6 h). Toggle/discount in Settings.
* **Attribution:** `utm_*`, `fbclid`, `ttclid`, `gclid` are saved with each order → "Sources de trafic" in the dashboard.
* **Admin security:** signed httpOnly cookie (JWT, 14 days), checked in middleware **and** inside every server action / API route.

### Tracking events (client-side)
| Event | Meta | TikTok | GA4 |
|---|---|---|---|
| Product / LP view | ViewContent | ViewContent | view_item |
| Add to cart | AddToCart | AddToCart | add_to_cart |
| First touch of the order form | InitiateCheckout | InitiateCheckout | begin_checkout |
| Order placed (thank-you page, once) | Purchase (eventID = order n°) | CompletePayment | purchase |

Pixels are **not** loaded in `/admin`. Test with Meta Pixel Helper / TikTok Pixel Helper after adding the IDs.

### Ad URLs
```
https://your-domain.ma/lp/serum-anti-age?v=1&utm_source=meta&utm_campaign=serum_cbo&utm_content=ugc1
https://your-domain.ma/lp/masque-eclat-rose?v=2&utm_source=tiktok&utm_campaign=masque_test
```
Slugs: `serum-anti-age`, `creme-de-nuit-anti-age`, `masque-eclat-rose`, `huile-seche-moukhalat`, `gel-gommage-visage`.

## File structure
```
app/
  layout.tsx                    html, fonts, providers, UTM capture
  (shop)/                       pages with header/footer/WhatsApp + pixels
    page.tsx                    home
    products/[slug]/page.tsx    product page
    checkout/page.tsx           cart + COD checkout
    thank-you/[num]/page.tsx    confirmation + upsell
  (lp)/lp/[slug]/page.tsx       ad landing page (minimal chrome)
  admin/
    login/page.tsx
    actions.ts                  server actions (products, orders, reviews, settings)
    (panel)/…                   dashboard, orders, products, customers, reviews, settings
  api/
    orders/route.ts             create order (COD)
    orders/upsell/route.ts      thank-you upsell
    products/route.ts           fresh prices for cart
    admin/{login,logout,upload,orders/export}
components/                     storefront UI + components/admin/*
lib/                            data access, pricing, i18n helper, tracking, auth
middleware.ts                   protects /admin and /api/admin
supabase/schema.sql, seed.sql, seed-products.json
docs/BRAND.md                   brand & product summary (Phase 1 notes)
```

## Before you spend on ads — checklist
- [ ] Replace `public/logo.svg` with your real logo (SVG/PNG) — the current one is only a stand-in.
- [ ] Upload real product photos in Admin → Produits (until then a branded turquoise placeholder is shown).
- [ ] Set real prices, WhatsApp number and delivery time. Sizes (ml) are only filled where visible on the photos (serum 30 ml, mask 100 ml, dry oil about 100 ml): add the others.
- [ ] Re-read the FAQ answers in `lib/content.ts` and the product texts: adjust anything you can't promise (delivery time, returns, ingredients list vs. packaging — I wrote the ingredients from your Instagram photos; **check them against the boxes**).
- [ ] Add **real** customer reviews in Admin → Avis (the section stays hidden while empty; I did not invent any).
- [ ] Add pixel IDs, place a test order, check events in each platform's debugger.
- [ ] Meta/TikTok ad policies restrict skin "treatment" promises (e.g. "removes pigmentation", before/after claims). Product copy uses softer wording ("aide à atténuer l'aspect…"); keep ads in the same spirit.

## Not included yet (good next steps)
* Server-side events (Meta Conversions API / TikTok Events API) for better attribution.
* Courier integration (Amana, Ozeki, Cathedis…) & automatic tracking numbers — CSV export works for now.
* Rate limiting at the edge / reCAPTCHA if you get fake orders.
* SMS/WhatsApp automation for order confirmation.
