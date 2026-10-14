# SIPZO POS — Next.js rebuild

Rebuilt from the original Vite/React + MUI frontend and separate Express
backend into a single Next.js 16 (App Router, TypeScript) app, styled with
Tailwind CSS instead of Material UI. Same screens, same look, same flows —
POS, Orders/Receipts, Admin (products + sales reports).

## Run it

```bash
npm install
npm run dev
```

Open http://localhost:3000. Your MongoDB Atlas connection string is already
in `.env.local` (copied from your original `.env`) — keep that file out of
version control (it's already in `.gitignore`).

For production:

```bash
npm run build
npm start
```

## Why this should feel faster

The old setup had a few things quietly adding delay to every order and every
admin action:

1. **Cross-origin API calls -> CORS preflight on every write.** The frontend
   called `http://localhost:5000` directly, a different origin from the Vite
   dev server. Every `POST`/`PUT`/`DELETE` (checkout, saving a variant) had
   to complete an extra `OPTIONS` preflight round trip *before* the real
   request. Now the API lives at `/api/...` in the same Next.js app — no
   preflight, ever.
2. **Two separate servers -> an extra network hop.** The Express API and the
   frontend were two processes. They're now one app.
3. **No `.lean()` on reads.** Mongoose was hydrating full change-tracked
   documents for read-only product/order lists. Every `GET` route now uses
   `.lean()`.
4. **No index on `createdAt`.** The orders list and every sales report
   aggregate/sort by `createdAt`. There's now an index on it.
5. **Fresh DB connection per cold start.** The Mongo connection is now
   cached globally (`src/lib/mongodb.ts`) so it's reused across requests.
6. **Sequential "Save All" variant updates.** Admin's bulk variant save used
   to fire one request at a time; it now fires them concurrently with
   `Promise.all`.

Order placement itself still makes 2 DB calls (get the next order number,
then create the order) — that's inherent to keeping order numbers
sequential and correct under concurrent orders, so it's left as-is rather
than "fixed" in a way that could double-book order numbers.

## What changed under the hood (same functionality/design)

- **MUI + Emotion -> Tailwind CSS.** Same dark green/orange theme, same
  fonts (Poppins body, Bebas Neue headings via `next/font/google`), same
  rounded pill buttons and card styles — just far less CSS-in-JS overhead.
- **`@mui/icons-material` -> `lucide-react`.** Much smaller icon library.
- **`aos` (scroll-animation library) -> a 10-line CSS keyframe** for the
  same product-card fade-up effect.
- **Express + `multer` -> Next.js Route Handlers + native `FormData`.**
  Uploaded images are written straight to `/public/uploads` and served by
  Next.js directly, no separate static file server.
- **`react-router-dom` -> Next.js App Router.** Same three routes (`/`,
  `/orders`, `/admin`), same navigation.

Net effect: one app instead of two, 6 runtime dependencies instead of ~12,
and no CORS/preflight tax on every write.

## Project layout

```
src/
  app/
    page.tsx              POS screen
    orders/page.tsx       Orders / receipts
    admin/page.tsx        Admin panel
    api/                  All backend routes (was the Express server)
  components/              UI, ported to Tailwind
  context/OrderContext.tsx Cart/checkout state (same reducer logic)
  hooks/                    Data-fetching hooks
  lib/
    mongodb.ts              Cached DB connection
    api/                    Client-side fetch wrappers (same-origin)
  models/                   Mongoose schemas (Product, Order, Counter)
  types/                    Shared TypeScript types
  data/products.ts          Static menu/category/area constants
  utils/generateReceipt.ts  PDF receipt generation (jsPDF)
```
