# NL.studio — Full-Stack Website Build Prompt

Build a complete, production-ready full-stack web application called **NL.studio** — a visual design & branding portfolio with a digital product store and an admin panel. Use the following tech stack and specifications exactly.

---

## TECH STACK

- **Framework**: Next.js 14 (App Router, TypeScript)
- **Styling**: Tailwind CSS
- **Database & Auth**: Supabase (PostgreSQL + Supabase Auth)
- **Payment Gateway**: Fapshi Direct Pay API (MTN MoMo & Orange Money — Cameroon)
- **Email**: Nodemailer with Gmail SMTP
- **Fonts**: Syne (display, 400/600/700/800) + DM Sans (body, 300/400/500) from Google Fonts

---

## DESIGN SYSTEM

```
Colors:
  Background:  #F8F7F4 (off-white)
  Black:       #0C0C0C
  Accent Red:  #D42B2B
  Gray:        #6B6B6B
  Light Gray:  #EFEFEC

Typography:
  Display font: Syne — font-weight 800, tracking-tighter, line-height 1
  Body font: DM Sans — font-weight 300 (light), line-height loose

Design language:
  - NO rounded corners anywhere (sharp rectangular elements throughout)
  - Minimal whitespace with bold typographic hierarchy
  - Dark sections (#0C0C0C) alternate with light (#F8F7F4 / #EFEFEC)
  - Red (#D42B2B) used as the ONLY accent — sparingly on borders, labels, hover lines, icons
  - Grid-based layout using gap-px with background color tricks for border-like dividers
  - Hover effects: red underline slide-in, red bottom border scale-x, overlay fade on images
  - Custom CSS cursor (10px red dot + 36px black ring) — hidden on mobile
  - All font sizes use clamp() for fluid scaling
```

---

## ENVIRONMENT VARIABLES NEEDED

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
FAPSHI_API_USER=
FAPSHI_API_KEY=
FAPSHI_BASE_URL=https://live.fapshi.com
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=
EMAIL_PASS=
EMAIL_FROM="NL.studio <your@gmail.com>"
NEXT_PUBLIC_APP_URL=
```

All Fapshi and Supabase service role variables must NEVER be exposed to the client (no NEXT_PUBLIC_ prefix).

---

## SUPABASE DATABASE SCHEMA

Create these 3 tables:

### `products`
```sql
id          uuid primary key default gen_random_uuid()
name        text not null
description text
price       integer not null  -- in XAF (minimum 100)
image_url   text              -- public image URL
product_link text not null   -- Google Drive / Mega / Dropbox link sent after purchase
category    text default 'Digital'
active      boolean default true
created_at  timestamptz default now()
updated_at  timestamptz default now()
```

### `orders`
```sql
id              uuid primary key default gen_random_uuid()
product_id      uuid references products(id)
product_name    text not null
product_link    text not null
buyer_name      text not null
buyer_email     text not null
buyer_phone     text not null
amount          integer not null
fapshi_trans_id text
status          text default 'pending'  -- pending | successful | failed
email_sent      boolean default false
created_at      timestamptz default now()
updated_at      timestamptz default now()
```

### `page_content`
```sql
id         uuid primary key default gen_random_uuid()
section    text not null   -- hero | about | contact | store
key        text not null
value      text not null
updated_at timestamptz default now()
unique(section, key)
```

Seed `page_content` with default values for all text on the landing page (hero titles, subtitles, stats, about paragraphs, contact info, store title/subtitle, WhatsApp number, Instagram URL, Behance URL, email).

Enable RLS on all tables. Products and page_content are publicly readable. Orders and all writes use the service role only.

Admin auth: Supabase email+password auth. No self-signup — admin user is created manually in the Supabase dashboard. Disable email confirmation in Auth settings.

---

## FILE STRUCTURE

```
src/
├── app/
│   ├── layout.tsx
│   ├── globals.css
│   ├── page.tsx                        ← Landing page (server component)
│   ├── store/
│   │   ├── page.tsx                    ← Store listing (server component)
│   │   └── [id]/
│   │       ├── page.tsx                ← Product detail (server component)
│   │       └── CheckoutForm.tsx        ← Client component with payment polling
│   ├── admin/
│   │   ├── layout.tsx                  ← Auth guard layout
│   │   ├── login/page.tsx
│   │   ├── dashboard/page.tsx
│   │   ├── products/page.tsx
│   │   ├── orders/page.tsx
│   │   └── content/page.tsx
│   └── api/
│       ├── checkout/route.ts
│       ├── payment-status/[transId]/route.ts
│       └── admin/
│           ├── products/route.ts       ← GET, POST, PUT, DELETE
│           └── content/route.ts        ← GET, PUT
├── components/
│   ├── Cursor.tsx
│   ├── Navbar.tsx
│   └── admin/
│       └── Sidebar.tsx
├── lib/
│   ├── fapshi.ts
│   ├── email.ts
│   └── supabase/
│       ├── client.ts                   ← Browser client (SSR)
│       └── server.ts                   ← Server client + service role client
└── middleware.ts
```

---

## PAGE-BY-PAGE SPECIFICATION

### `/` — Landing Page (server component, revalidate: 60s)

Fetch all `page_content` from Supabase at build/revalidation time. If Supabase is unconfigured, use hardcoded defaults so the page always renders. The page has these sections in order:

1. **Navbar** (fixed, transparent → opaque on scroll, logo + nav links + CTA button, hamburger on mobile)
2. **Hero** — 2-column grid:
   - Left (dark #0C0C0C): huge watermark "NL" text at 3% opacity, tag line in red, 3-line title (line 2 in red), subtitle, 2 CTA buttons ("Voir mes travaux" → #works, "Boutique" → /store)
   - Right (light): 2×2 stat grid showing: Projects count, Years of experience, Clients, 100% Passion (last cell red background)
   - Right column hidden on mobile
3. **About** — 2-column: text (label, big title, 2 paragraphs, red divider bar) + visual box with quote and red bottom bar + NL badge top-right
4. **Workflow** — dark section, 4-step process cards in a row (01-04), each with icon in red square, title, description, red slide-in bottom border on hover
5. **Works** — light gray section, masonry-style grid of 6 work items with colored placeholder backgrounds, hover overlay showing label + title
6. **Contact** — dark section, large "TALK" watermark, title from DB, WhatsApp CTA button (green), social links row (Instagram, Behance, Email)
7. **Footer** — dark, logo left, copyright right

All text content (titles, subtitles, stats, links) must come from `page_content` DB table with fallback defaults.

---

### `/store` — Store Page (server component, revalidate: 60s)

- Dark header section with page title and subtitle from `page_content`
- Fetch all `products` where `active = true`, ordered by `created_at DESC`
- Display in responsive 3-column grid (1 col mobile, 2 tablet, 3 desktop)
- Each product card: image (aspect-ratio 4:3, dark bg fallback with initial letter), category label in red, name, description (2-line clamp), price in XAF, "Acheter →" link
- Red top border slides in on hover
- If no products, show empty state with shopping bag icon
- Clicking card → `/store/[id]`

---

### `/store/[id]` — Product Detail + Checkout (server component + client CheckoutForm)

Server component fetches product by ID. Shows:
- Left: product image (full height, dark bg fallback)
- Right: category, name, description, price with divider, then `<CheckoutForm>` client component

**CheckoutForm** (client component) has 4 states:

1. **`form`**: 3 inputs (name, email, phone) + submit button "Payer X XAF via MoMo/OM"
   - Phone validation: strip `237` prefix, must match `/^[67]\d{8}$/`
   - On submit → `POST /api/checkout`

2. **`pending`**: spinner, instruction to check phone for MoMo/Orange Money push notification
   - Poll `GET /api/payment-status/[transId]` every 5 seconds (max 60 attempts = 5 minutes)

3. **`success`**: green checkmark, "Paiement confirmé!", tells user to check their email

4. **`error`**: red X, "Paiement échoué", retry button

---

### Admin Panel `/admin/*`

Protected by `middleware.ts` — redirects to `/admin/login` if no Supabase session.

**`/admin/login`** — client component, email + password form, calls `supabase.auth.signInWithPassword`, redirects to `/admin/dashboard` on success.

**Admin Layout** — server-side auth check, sidebar navigation:
- Desktop: fixed left sidebar (64px wide) with logo, nav links, logout button
- Mobile: fixed bottom tab bar with icons

**`/admin/dashboard`** — 4 stat cards (total products, total orders, successful orders, total revenue in XAF), recent orders table (last 5)

**`/admin/products`** — client component:
- Grid of product cards with edit (pencil) and delete (trash) icon buttons
- "Nouveau" button opens modal
- Modal form fields: Name, Category, Price (XAF), Image URL, Product Link (Drive/Mega/etc), Description (textarea), Active toggle (custom pill toggle)
- CRUD via `/api/admin/products` (GET/POST/PUT/DELETE)
- Inactive products show dark overlay with "Inactif" label

**`/admin/orders`** — server component (force-dynamic):
- Full scrollable table: Product, Client (name + email), Phone, Amount, Status badge, Email Sent, Date
- Status badges: successful=green, failed=red, pending=yellow
- All with appropriate opacity/background tint

**`/admin/content`** — client component:
- Grouped by section: Hero, About, Contact, Store
- Each field has a label, input or textarea, and individual "Sauver" button
- On save: calls `PUT /api/admin/content`, button temporarily shows green "OK" with checkmark for 2 seconds
- Fetches current values from `GET /api/admin/content` on mount

---

## API ROUTES

### `POST /api/checkout`
1. Validate all fields present + phone format
2. Fetch product from Supabase (service role, must be active)
3. Create order in DB with `status: 'pending'`
4. Call Fapshi Direct Pay:
   ```
   POST https://live.fapshi.com/direct-pay
   Headers: apiuser, apikey
   Body: { amount, phone, name, email, externalId: orderId, message: "Achat: [product name] — NL.studio" }
   ```
5. Update order with `fapshi_trans_id`
6. Return `{ orderId, transId, message }`

### `GET /api/payment-status/[transId]`
1. Call Fapshi: `GET https://live.fapshi.com/payment-status/[transId]`
2. If `status === 'SUCCESSFUL'` and `email_sent === false`:
   - Send product link email via Nodemailer
   - Update order: `status: 'successful'`, `email_sent: true`
3. If `status === 'FAILED'`: update order to failed
4. Return `{ status }` to client

### `/api/admin/*` routes
All must re-verify Supabase session server-side before any DB operation. Use service role client for DB writes.

---

## FAPSHI API INTEGRATION (`src/lib/fapshi.ts`)

```typescript
Base URLs:
  Sandbox: https://sandbox.fapshi.com
  Live:    https://live.fapshi.com

Direct Pay endpoint: POST /direct-pay
Headers: { apiuser: string, apikey: string, Content-Type: application/json }

Request body:
  amount: number (min 100 XAF, required)
  phone: string (e.g. "677000000", required)
  medium?: "mobile money" | "orange money" (omit to auto-detect)
  name?: string
  email?: string
  externalId?: string (your order ID, 1-100 chars, alphanumeric + dash + underscore)
  message?: string

Response 200:
  { message: string, transId: string, dateInitiated: string }

Payment Status endpoint: GET /payment-status/:transId
Response: { transId, status: "PENDING"|"SUCCESSFUL"|"FAILED", amount, ... }

Direct Pay transactions do NOT expire — final state is SUCCESSFUL or FAILED only.
```

---

## EMAIL TEMPLATE (`src/lib/email.ts`)

HTML email in the same NL.studio design language:
- Dark background (#0C0C0C), red (#D42B2B) top accent bar
- Logo "NL.studio" header
- "Merci, [Name] 🎉" heading
- Product name + amount in a darker box
- Large red CTA button "Accéder au produit →" linking to the product link
- Fallback plain URL below button
- Footer with transaction reference ID and copyright
- Subject: `✅ Votre achat — [Product Name]`

---

## SECURITY REQUIREMENTS

- `middleware.ts` must protect ALL `/admin/*` routes except `/admin/login`
- Service role Supabase key NEVER in any client component or `NEXT_PUBLIC_` variable
- All API routes must re-verify auth using server-side Supabase session check
- Product download links are NEVER included in any client-visible API response
- Links only sent via email after `SUCCESSFUL` Fapshi status confirmation
- `email_sent` boolean flag prevents duplicate emails on repeated polling
- Phone number stripped and validated before sending to Fapshi
- Use `try/catch` on all external API calls (Fapshi, email, Supabase)

---

## RESPONSIVENESS

- Mobile-first throughout
- Navbar: hamburger menu on mobile, full links on desktop
- Hero: single column on mobile (right stat panel hidden), 2-column on desktop
- Store grid: 1 col (mobile) → 2 col (sm) → 3 col (lg)
- Admin sidebar: bottom tab bar on mobile, fixed left sidebar on desktop
- All font sizes use `clamp()` for fluid scaling between breakpoints
- Touch-friendly tap targets (minimum 44px)
- Custom cursor hidden on mobile (pointer: auto)

---

## ADDITIONAL DETAILS

- `revalidate = 60` on landing and store pages (ISR)
- `force-dynamic` on admin orders page
- `next/image` for all product images with dark fallback
- `notFound()` for invalid product IDs
- WhatsApp floating button (bottom-right, fixed, green, pulsing shadow animation) on all public pages
- Loading/error states on all client components
- Empty states with icons when no products/orders exist
- All admin modals are scroll-locked overlays with X close button
- Tailwind arbitrary values avoided where possible — use `opacity-[0.03]`, `bg-black/[0.08]` etc. only when necessary
- No `localStorage` usage anywhere
- All dates formatted in French locale (`fr-FR`)

---

## DEPLOYMENT

Target: **Vercel**. All environment variables set via Vercel dashboard. `FAPSHI_BASE_URL` switches between sandbox and live. ISR handled by Vercel's edge network. Supabase handles DB, auth session cookies via `@supabase/ssr`.
