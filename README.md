# ALIZAIN MEGA MART — Customer Store + Admin Panel (ONE app)

**One Vite + React 18 + TypeScript single-page app containing both the customer
storefront and the admin panel.** The admin panel is inside this same app at
the private `/admin` route. **There is no admin link, button, menu entry or
hint anywhere on the storefront** — the panel is opened only by typing the
`/admin` address directly. The backend is a separate deployment
(`alizain-mega-mart-backend.zip` — Netlify Functions + PostgreSQL); this app
talks only to that backend API, never to a database directly.

## Routes

### Customer storefront

| Route | Page |
| --- | --- |
| `/` | Home (banners, featured / accounts / latest / best-selling / offers / new arrivals, reviews) |
| `/shop` | Shop — search, category / type / price / rating / availability filters, sorting |
| `/product/:id` | Product page (specs, reviews, buy now / add to cart) |
| `/cart` | Cart |
| `/checkout` | Checkout with coupons + JazzCash manual payment (Transaction ID + screenshot) |
| `/auth/login`, `/auth/register`, `/auth/forgot`, `/auth/reset`, `/auth/verify` | Customer auth (registration compulsory before purchase; in-app email verification code) |
| `/account`, `/account/orders`, `/account/orders/:id`, `/account/payments`, `/account/reviews`, `/account/wishlist` | Customer account: profile / change password, order history & tracking, payment history, reviews, wishlist |

English/Urdu switcher with full RTL Urdu (saved per customer) and a floating
WhatsApp support button (real `wa.me` link from store settings) are on the
storefront. JazzCash payment is **manual**: the customer sends the JazzCash
number/holder and amount, submits a Transaction ID + payment screenshot, and
the team verifies every payment by hand — an order is never marked paid
automatically.

### Admin panel (private — `/admin/*`, no storefront link)

| Route | Page |
| --- | --- |
| `/admin` | Login + one-time Super Admin setup (no default password) — with an admin token it redirects to `/admin/dashboard` |
| `/admin/dashboard` | Dashboard (real analytics from the API) |
| `/admin/products` | Products & gaming-account management (dynamic custom fields, image upload) |
| `/admin/categories` | Categories |
| `/admin/orders` | Orders |
| `/admin/payments` | JazzCash payment verification (approve / reject with reason — never auto-paid) |
| `/admin/delivery` | Manual delivery |
| `/admin/customers` | Customers |
| `/admin/reviews` | Review moderation |
| `/admin/stock` | Stock statuses (Available / Reserved / Sold / Out of Stock) |
| `/admin/coupons` | Coupons & discounts |
| `/admin/banners` | Homepage banners |
| `/admin/settings` | Website settings |
| `/admin/whatsapp` | WhatsApp settings |
| `/admin/language` | Language settings |
| `/admin/reports` | Sales reports |
| `/admin/staff` | Staff management |
| `/admin/permissions` | Admin permissions (per-permission RBAC) |
| `/admin/logs` | Security & activity logs |

Admin pages are gated client-side: without the admin token
(`mega_mart_admin_token`) they redirect to `/admin` login. A customer token
(`mega_mart_token`) never grants admin access — the two tokens, sessions and
API clients are kept fully separate (`src/store/lib/api.ts` vs
`src/admin/lib/api.ts`). Server-side role protection lives in the backend API
(unchanged) — the frontend gating is an extra layer, not a replacement.
Staff accounts see only the nav items they have permission for, and the
backend also denies staff access to Super Admin settings server-side.

## Deploy to Netlify (free plan)

### 1. Extract and install

```bash
unzip alizain-mega-mart.zip
cd mega-mart
npm install
```

### 2. Point the app at the backend

The app needs the deployed backend URL (from the separate
`alizain-mega-mart-backend.zip` deployment). Without it, pages load their
shell but show an error state, because every page fetches its data from the
backend API in the browser.

```bash
cp .env.example .env
# Edit .env and set:
#   VITE_API_URL=https://your-deployed-backend.example.com   (no trailing slash)
#   VITE_SITE_URL=https://your-site.netlify.app              (optional)
```

On Netlify, set the same variables in **Site settings → Environment
variables** instead of (or as well as) a `.env` file — `VITE_API_URL` is baked
into the build, so change it there and redeploy after any backend URL change.
Never commit a real `.env` file.

### 3. Build

```bash
npm run build          # output in dist/
npm run typecheck      # tsc --noEmit
```

No database is needed at build time: every page fetches its data from the
backend API in the browser, so the build works with the API offline.

### 4. Deploy to Netlify

- **Option A — drag & drop:** upload the `dist/` folder at
  https://app.netlify.com/drop (after setting `VITE_API_URL` before building).
- **Option B — Git / Netlify CLI:** push this folder to a repo and connect it
  in Netlify, or run `netlify deploy --prod --dir dist`. Build command
  `npm run build`, publish directory `dist`, Node 20 (already in
  `netlify.toml`). The SPA redirect in `netlify.toml` (`/*` → `/index.html`,
  status 200) makes deep links such as `/shop` and `/admin/dashboard` work
  on refresh.

### 5. Test the live site

1. Open `/` — the store home loads (title "ALIZAIN MEGA MART — Your Ultimate
   Gaming Marketplace"). With no backend configured yet it shows its
   "could not be loaded" error state; that is expected until `VITE_API_URL`
   points at the deployed backend.
2. Open `/shop` and `/auth/login` — both load.
3. Open `/admin` — the admin login page loads (or, on first use, the
   one-time Super Admin setup form). There is **no default password**.
4. Complete the **first-use Super Admin setup** at `/admin`: enter the owner
   name, email, phone and a password (min 8 characters) and keep those
   credentials safe — staff accounts are created later from inside the panel.
   After setup you land on `/admin/dashboard`.
5. In the panel, set Website Settings (JazzCash number/holder, WhatsApp
   number, store notice) — the storefront reads these from the API.
6. Confirm there is **no admin link anywhere on the storefront** (header,
   footer, home, shop, checkout, account pages, error messages).

## Run locally

```bash
cp .env.example .env   # set VITE_API_URL to the backend URL
npm install
npm run dev            # http://localhost:5173
```

The backend must be running for the store/panel to show data — locally it
runs on `http://localhost:4000` (the default `VITE_API_URL` fallback). Without
a backend the pages load but show an API error; that is expected.

## Project layout

```
src/
  main.tsx            BrowserRouter entry
  App.tsx             all routes: storefront + /admin/*
  index.css           merged stylesheet (store theme + namespaced admin styles)
  store/              customer storefront (pages, components, lib/api.ts, lib/i18n.ts)
  admin/              admin panel (pages, components/AdminShell.tsx, lib/api.ts)
```

The two `api.ts` files are intentionally separate: different localStorage
token keys (`mega_mart_token` vs `mega_mart_admin_token`), different session
users, different helpers (`apiForm` + `idempotencyKey` on the store side,
`apiUpload` + `ALL_PERMISSIONS` on the admin side). No endpoint, field name
or response shape was changed in the merge.
