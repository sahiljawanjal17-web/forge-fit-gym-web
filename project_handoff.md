# Forge Fit — Project Handoff

Premium **global gym** website (5 clubs: London, New York, Dubai, Mumbai, Singapore) with membership management, a supplement/gear store, an owner console, and an **AI agent for both owner and customer** that can read data and take actions.
Project root: `C:\Users\Admin\OneDrive\data_science\forge-fit`. Original blueprint: `PLANNING.md` (partially superseded, see "Deviations").

## 1. Architecture & tech stack

- **Next.js 14.2 App Router + React 18 + TypeScript**, Tailwind 3 (+ `tailwindcss-animate`), shadcn/ui (Radix), Magic UI (marquee, number-ticker, blur-fade), framer-motion, recharts, sonner, lucide.
- **Database:** Drizzle ORM 0.45 on **PGlite** (embedded Postgres, no server needed). All data lives in **`data/pglite/`** (gitignored). Override the path with `FORGE_DATA_DIR`.
  - On server start, `src/instrumentation.ts` runs `ensureDatabase()`. It applies migrations and seeds demo data if the database is empty.
- **Auth:** Better-Auth 1.7 (email + password) using the drizzle adapter, mapped onto our own `users` table plus `auth_sessions`, `auth_accounts` and `auth_verifications`.
  - Roles are `owner | admin | customer`. Sign-up cannot set a role (`input:false`).
  - Middleware only checks that the session cookie exists (the edge runtime can't reach PGlite). Role checks happen in layouts via `requireUser()` / `requireStaff()`.
- **Data flow:**
  - Server components call `src/server/services/*` directly.
  - Mutations go through server actions in `src/server/actions.ts`.
  - The AI tools call the same services.
  - tRPC infrastructure still exists but the UI does not use it.
- **AI:** Vercel AI SDK v7 (`ai`, `@ai-sdk/react`) + `@openrouter/ai-sdk-provider`.
  - Uses the **free** OpenRouter models from `data_science/engine/model_config.py`. Primary: `nvidia/nemotron-3-super-120b-a12b:free`. Fallbacks: nemotron ultra, laguna-s-2.1, north-mini-code (all support tool calling).
  - Config lives in `.env.local` (`OPENROUTER_API_KEY`, `AI_MODEL_PRIMARY`, `AI_MODEL_FALLBACKS`, `BETTER_AUTH_SECRET`).
- **Currency:** USD (`formatCurrency` in `src/lib/utils`). Default theme is dark, with a light toggle.
- **Reused code sources:**
  - basir/next-pg-shadcn-ecommerce: shop, cart and admin patterns, plus `ui/table.tsx` and `ui/alert-dialog.tsx`.
  - fitzone-gym-project: gym content and images.
  - aminagr/gym-nextjs: hero concept and images.
  - magicuidesign/magicui: animation components.
  - Kiranism dashboard: AI chat UI pattern.
  - Media: Unsplash photos and Mixkit videos, stored in `public/`.

**Run:** `npm install` → `npm run dev` (http://localhost:3000). `npm run db:setup` migrates, seeds and prints row counts.
**Demo logins:** owner `owner@forgefit.com / Owner@12345` · member `member@forgefit.com / Member@12345`. The other 48 seeded members use `Member@12345`.
**Reset data:** stop the server and delete `data/`.

## 2. Completed features

- **Public site:**
  - Home: video hero, animated stats, bento features, club marquee, pricing, featured products, trainers, testimonials, CTA.
  - Pricing: monthly/annual toggle, compare table, FAQ.
  - Store: category filter + search. Product page: variants, stock, member discount.
  - Cart and checkout: address + card/UPI/pay-at-club payment choice.
  - Clubs/about, contact form (sends an in-app notification to the owner), equipment guide list + detail (steps, safety, QR code).
- **Auth:** split-screen login/register with demo-account buttons. Sign-out from the nav and the sidebar.
- **Member area (`/member/*`):**
  - Dashboard: stats, club check-in, recent orders, visits, notifications.
  - Forge AI page.
  - Membership: pause, resume, cancel, switch plan.
  - Orders list + detail: progress tracker, cancel (restores stock).
  - Message club (DB chat, polls every 5s) and profile.
- **Owner console (`/admin/*`):**
  - Overview: KPIs (revenue, MRR/ARR, members, orders), low-stock banner, revenue and tier charts, latest orders.
  - Analytics & AI: 30-day revenue forecast (least squares), stock-demand forecast, churn-risk scoring, attendance heatmap, top products.
  - Members with churn score; memberships.
  - Orders: status filter + inline status change, plus a detail page.
  - Inventory: stock with forecast + restock.
  - Equipment, payments by gateway, messages inbox, settings (integration status + data folder path), Forge AI co-pilot.
- **AI agent:**
  - Route: `src/app/api/ai/chat/route.ts`.
  - Customer tools: search/get product, view cart, add/update cart, place order, list/cancel orders, plans, subscribe, pause/resume/cancel membership, equipment guides, clubs.
  - Owner tools: KPIs, revenue trend, forecast, inventory status, restock, list/update orders, members + churn, top products.
  - The system prompt requires an explicit "yes" before any change that mutates data.
  - UI: a floating widget on all public pages (sign-in prompt if logged out) plus full pages.
- **Business logic:**
  - Tier discounts: Premium 10%, VIP 20%. Tax 8%. Free shipping over $100, otherwise $8.
  - Placing an order runs in a transaction: stock deduction, stock history, low-stock alert, payment transaction, notification.
- **Verified so far:** migrations + seed run (50 users, 15 products/31 variants, 140 orders, 49 memberships, 375 check-ins, 11 equipment). Home page returns HTTP 200. Nothing else has been click-tested yet.

## 2b. Progress log (2026-09-17 session)

- DONE: `npx tsc --noEmit` clean. tRPC `analytics/members/products` routers rewritten as service wrappers, unused `inArray` removed, seed `Set` error gone.
- DONE: Missing reverse Drizzle relations added (`productImages`, `productReviews`, `equipmentUsageGuides`, `equipmentMedia`). Fixed 500 errors on `/shop/[slug]` and `/equipment-guide`.
- DONE: Hydration error in `site-nav.tsx` theme icon (both icons render, CSS `dark:` picks one).
- DONE: `useEffect(() => ref.scrollIntoView())` returned a Promise in new Chrome and crashed `AiChat`. Now uses braces in `ai-chat.tsx` and `support-chat.tsx` (not yet re-verified in the browser).
- DONE: `src/server/db/index.ts` closes PGlite on SIGINT/SIGTERM, so a hard stop doesn't leave the data folder needing recovery.
- DONE: Playwright suite `playwright.config.ts` + `tests/e2e/{helpers,routes}.spec.ts` (uses system Chrome, `channel: "chrome"`). All 10 public route tests pass. Member/owner page tests still need a re-run.
- DONE: Project moved out of OneDrive to **`C:\Users\Admin\GYM_WEB\forge-fit`** (the new root). OneDrive broke `.next` symlinks and marked folders Read-only.
- DONE: **Crash fix (root causes + permanent fixes):**
  - Read-only folders (mode 444) made PGlite refuse to create `postmaster.pid`. `paths.ts#ensureWritable` clears the flag on start.
  - A hard kill corrupted the DB ("could not locate a valid checkpoint record"). Fixes:
    - `recovery.ts` probes the DB before it opens. If broken, it moves the folder to `data/pglite-corrupt-<ts>` and restores `data/backup/pglite-latest.tar.gz`, or re-seeds when there is no backup.
    - `setup.ts` runs a CHECKPOINT every 60s, a backup at startup and every 10 min, and a clean close on SIGINT/SIGTERM.
    - The DB client (`db/index.ts`) is imported lazily so recovery runs first.
  - Verified: corrupt DB → auto-recovered + seeded; hard kill → restart clean; all 12 Playwright route tests pass (public, member, owner).
- NOTE: the demo DB was re-seeded on 2026-09-17. The old damaged folder `data/pglite-corrupt-*` can be deleted.
- NEXT: step 3 below (end-to-end flows).

## 3. Remaining ~15% (next steps, in order)

1. **Fix TypeScript errors** (`npx tsc --noEmit`). They are all in the old tRPC routers:
   - `src/server/trpc/routers/analytics.ts`, `members.ts`, `products.ts` reference columns that no longer exist (`memberStatus`, `totalAmount`, `price`).
   - Replace them with thin wrappers around the services, e.g. `analyticsRouter.getDashboardKPIs → analytics.getKpis()`, `productsRouter.listPublic → store.listProducts()`. Rewrite drafts were prepared but not saved.
   - A `Set` iteration error in `src/server/db/seed/index.ts` should clear now that `tsconfig.json` has `"target": "ES2017"`. Delete `tsconfig.tsbuildinfo` if it persists.
   - Also drop the unused `inArray` import in `services/store.ts` and `ne` if lint complains.
2. **Smoke-test every route** (curl for 200s, or a browser/Playwright check):
   - Public pages: `/pricing /shop /shop/forge-whey-gold-standard /about /contact /equipment-guide /equipment-guide/[id] /login /register`.
   - After login: `/cart /checkout /member/* /admin/*`.
   - Likely runtime issues to watch: drizzle raw SQL in `services/analytics.ts` (`getRevenueByMonth` interval, `getInventory` `$with` CTE, correlated subqueries in `listMembers`), hydration or `"use client"` gaps, and `next/image` with local 6MB images.
3. **End-to-end flows:** register → subscribe to a plan → add to cart → checkout → order detail → cancel. Owner: change order status, restock, reply to a member chat.
4. **Test the AI live** with both roles (tool calls + mutations). Tune the model or fallbacks if free models rate-limit (429) or mishandle tools. Check the `providerOptions.openrouter.reasoning` setting and `convertToModelMessages` behaviour on tool messages.
5. **`npm run build`** must pass (type check + lint; `.eslintrc.cjs` may need adjusting).
6. **Polish:**
   - Responsive/mobile check. Consider compressing `public/images/site/fitness*.jpg` (1–6 MB).
   - Write a `README.md` (setup, demo logins, data folder, AI config).
7. **Optional / not started** (from PLANNING.md): real Stripe/Razorpay integration (webhook route folders exist but are empty; payments are currently simulated "demo"), Soketi real-time chat, email (Resend), Python FastAPI ML service, product/equipment CRUD forms in admin, uploads, tests.

## 4. Files most likely to be modified next

- `src/server/trpc/routers/{analytics,members,products}.ts`: type-error fixes
- `src/server/services/analytics.ts`, `store.ts`, `gym.ts`, `chat.ts`: runtime SQL fixes found during testing
- `src/server/actions.ts`: server actions used by the UI
- `src/lib/ai/tools.ts`, `src/app/api/ai/chat/route.ts`, `src/components/ai/ai-chat.tsx`: AI tuning
- `src/app/(marketing)/**`, `src/app/(dashboard)/{admin,member}/**`: page fixes
- `next.config.mjs`, `tsconfig.json`, `.eslintrc.cjs`, `package.json`: build issues
- New: `README.md`, and optionally `src/app/api/webhooks/{stripe,razorpay}/route.ts`

## 5. Core files map

**Config / infra**
- `package.json`: scripts `dev`, `build`, `db:setup`, `db:generate`
- `next.config.mjs`: PGlite external package, instrumentation hook, image hosts, security headers
- `tailwind.config.ts`, `src/app/globals.css`: design tokens ("Atelier Basalt & Smoked Terracotta"), `container-x`, `eyebrow`, `glass` utilities
- `drizzle.config.ts`, `.env.local` (secrets, gitignored), `.env.example`
- `src/instrumentation.ts`: DB bootstrap on server start
- `src/middleware.ts`: session-cookie guard for `/admin`, `/member`, `/cart`, `/checkout`

**Database**
- `src/server/db/index.ts`: PGlite client (globalThis singleton) + `DATA_DIR`
- `src/server/db/setup.ts`: `ensureDatabase()` (migrate + seed once)
- `src/server/db/schema/*.ts`: `users`, `auth` (Better-Auth tables), `memberships`, `products`, `orders`, `inventory`, `equipment`, `payments`, `chat`, `ai`, `notifications`, `audit`, `enums`; barrel in `index.ts`
- `src/server/db/migrations/0000_init.sql`: regenerate with `npx drizzle-kit generate` after schema changes
- `src/server/db/seed/data.ts`: clubs, plans + features, products, equipment, trainers
- `src/server/db/seed/index.ts`: `seedDatabase()`, `DEMO_ACCOUNTS`
- `scripts/db-setup.ts`

**Server logic**
- `src/lib/auth/index.ts`: Better-Auth config, `getSession`, `requireUser`, `requireStaff`, `isStaff`
- `src/lib/auth/client.ts`: `signIn`, `signUp`, `signOut`
- `src/server/services/store.ts`: catalog, cart, discounts, `placeOrder`, orders, status update, cancel
- `src/server/services/gym.ts`: plans, membership subscribe/pause/cancel, equipment, check-ins, clubs, notifications
- `src/server/services/analytics.ts`: KPIs, revenue by month, tiers, heatmap, inventory + demand forecast, `adjustStock`, members + churn, payments, top products, `forecastRevenue`
- `src/server/services/chat.ts`: support conversations/messages
- `src/server/actions.ts`: all `"use server"` actions
- `src/server/trpc/*`: legacy tRPC (index, router, routers)

**AI**
- `src/app/api/ai/chat/route.ts`: streaming endpoint, role-based system prompt and tools
- `src/lib/ai/tools.ts`: `customerTools(userId)`, `ownerTools(ownerId)`
- `src/components/ai/ai-chat.tsx` (chat UI), `src/components/ai/ai-widget.tsx` (floating button)

**UI**
- `src/app/layout.tsx`: fonts, ThemeProvider, Toaster, `force-dynamic`
- `src/app/(marketing)/layout.tsx`: nav + footer + AI widget
- Marketing pages: `page.tsx` (home), `pricing`, `shop`, `shop/[slug]`, `cart`, `checkout`, `about`, `contact`, `equipment-guide`, `equipment-guide/[id]`
- `src/app/(auth)/{layout,login,register}` + `src/components/auth/auth-form.tsx`
- `src/app/(dashboard)/member/*`: `layout`, `dashboard`, `ai`, `membership`, `orders`, `orders/[id]`, `chat`, `profile`
- `src/app/(dashboard)/admin/*`: `layout`, `overview`, `ai`, `analytics`, `members`, `memberships`, `orders`, `orders/[id]`, `inventory`, `equipment`, `payments`, `chat`, `settings`
- `src/components/layout/{site-nav,site-footer}.tsx`
- `src/components/dashboard/`:
  - `shell.tsx`: `DashboardShell`, `PageTitle`, `StatCard`, `StatusBadge`
  - `action-button.tsx`, `admin-controls.tsx`, `order-detail.tsx`, `profile-form.tsx`
- `src/components/shop/{product-card,add-to-cart,cart-lines,checkout-form}.tsx`
- `src/components/marketing/{pricing-cards,page-header}.tsx`
- `src/components/charts/charts.tsx`, `src/components/chat/support-chat.tsx`
- `src/components/ui/*` (shadcn), `src/components/magicui/*`
- Assets: `public/images/{products,equipment,trainers,site}`, `public/videos/hero-{1,2,3}.mp4`

## Deviations from PLANNING.md (intentional)
- PGlite instead of Neon/Docker Postgres, so data stays local in `data/`.
- Server actions + services instead of tRPC for the UI.
- DB polling instead of Soketi for chat.
- Rule-based/statistical forecasts instead of the FastAPI ML service.
- USD pricing ($29/$49/$79/$149 monthly) for a global brand.
- Payments are simulated until gateway keys are added.
