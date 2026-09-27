# 🏋️ FORGE FIT — Premium Gym Management & E-Commerce Platform

## Complete Technical Blueprint & Implementation Roadmap

> **Project Codename**: Forge Fit  
> **Architecture Style**: Modular Monolith (Next.js) + AI Microservice (FastAPI)  
> **Target Launch**: Production-Ready MVP  
> **Last Updated**: September 17, 2026

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Technology Stack & Architecture](#2-technology-stack--architecture)
3. [Design System & Color Palette](#3-design-system--color-palette)
4. [Project Directory Structure](#4-project-directory-structure)
5. [Database Schema Design](#5-database-schema-design)
6. [Core Modules & Feature Specifications](#6-core-modules--feature-specifications)
7. [UI/UX Component Breakdown](#7-uiux-component-breakdown)
8. [AI Subsystem Architecture](#8-ai-subsystem-architecture)
9. [Open-Source Dependencies & Libraries](#9-open-source-dependencies--libraries)
10. [Media Assets & Sourcing Strategy](#10-media-assets--sourcing-strategy)
11. [API Design & tRPC Router Map](#11-api-design--trpc-router-map)
12. [Security & Authentication](#12-security--authentication)
13. [Deployment & Infrastructure](#13-deployment--infrastructure)
14. [Implementation Roadmap](#14-implementation-roadmap)
15. [Open Questions for Review](#15-open-questions-for-review)

---

## 1. Executive Summary

**Forge Fit** is an enterprise-grade, full-stack gym management and e-commerce platform designed to serve as the operational backbone for premium fitness facilities. It combines membership lifecycle management, supplement retail, equipment education, real-time owner-customer communication, multi-gateway payments with EMI support, and AI-driven predictive analytics — all within a single, cohesive application.

### Core Philosophy

- **80/20 Development Rule**: Leverage battle-tested open-source libraries for 80% of the system (UI components, auth, payments, charts). Write custom code only for gym-specific business logic and integration orchestration.
- **Type Safety Everywhere**: End-to-end TypeScript from database schema (Drizzle ORM) → API layer (tRPC) → frontend components (React/Next.js).
- **Premium Aesthetics**: The UI must communicate luxury, professionalism, and trust — inspired by brands like Equinox, Technogym, and Third Space London.

---

## 2. Technology Stack & Architecture

### 2.1 Core Stack Decision Matrix

| Layer | Technology | Justification |
|:------|:-----------|:-------------|
| **Framework** | Next.js 14+ (App Router) | Server Components, streaming SSR, route groups, parallel routes, intercepting routes. Industry standard for React full-stack. |
| **Language** | TypeScript 5.x (Strict Mode) | End-to-end type safety. Catches bugs at compile time across DB → API → UI. |
| **Styling** | TailwindCSS 3.4+ | Utility-first CSS with design token system. Zero CSS-in-JS runtime overhead. |
| **UI Components** | shadcn/ui + Radix UI + Magic UI | Accessible, composable, premium-looking components. Source-owned (not npm dependency). |
| **Database** | PostgreSQL 16 (via Neon/Supabase) | Enterprise-grade RDBMS with JSONB, GIN indexes, UUID support, Row-Level Security. |
| **ORM** | Drizzle ORM | TypeScript-native, SQL-like syntax, <5ms serverless cold starts, zero Rust binary. |
| **API Layer** | tRPC v11 | End-to-end type-safe RPC. No API schema drift. Auto-generated client types. |
| **Authentication** | Better-Auth | Open-source, TypeScript-native, built-in RBAC + 2FA + session management. |
| **Payments** | Stripe + Razorpay | Stripe for global subscriptions/BNPL. Razorpay for Indian market EMI (Credit/Debit/Cardless). |
| **Real-Time** | Soketi (self-hosted) | Pusher-compatible WebSocket server. Zero monthly fees. C++/uWebSockets engine. |
| **State (Client)** | TanStack Query v5 + Zustand | Server state cache + lightweight UI store. Perfect for App Router hydration. |
| **Charts** | Recharts (via shadcn/ui) + Nivo | Declarative SVG charts for dashboards. Nivo for heatmaps/calendar views. |
| **Email** | React Email + Resend | React-based email templates. High deliverability transactional email API. |
| **Notifications** | Novu | Open-source multi-channel notification engine (In-app, SMS, WhatsApp, Push). |
| **AI Service** | FastAPI (Python) | Decoupled microservice for ML model inference. Async, streaming SSE support. |
| **Validation** | Zod | Runtime type validation shared between tRPC procedures and form schemas. |
| **File Storage** | Uploadthing / AWS S3 | Managed file uploads for product images, equipment videos, avatars. |
| **Testing** | Vitest + Playwright | Unit/integration testing + end-to-end browser testing. |
| **CI/CD** | GitHub Actions | Automated lint, type-check, test, build, and deploy pipelines. |

### 2.2 High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CLIENT LAYER                                   │
│  ┌──────────────┐  ┌──────────────────┐  ┌────────────────────────────┐    │
│  │  Public Site  │  │  Member Portal   │  │  Admin/Owner Dashboard    │    │
│  │  (Marketing)  │  │  (Customer UI)   │  │  (Management UI)         │    │
│  └──────┬───────┘  └────────┬─────────┘  └──────────┬────────────────┘    │
│         │                    │                        │                      │
│  ┌──────┴────────────────────┴────────────────────────┴──────────────────┐  │
│  │              Next.js 14 App Router (TypeScript + TailwindCSS)          │  │
│  │  ┌────────────┐  ┌──────────────┐  ┌────────────┐  ┌──────────────┐  │  │
│  │  │  shadcn/ui │  │  Magic UI    │  │  Recharts  │  │  Zustand     │  │  │
│  │  │  + Radix   │  │  Animations  │  │  + Nivo    │  │  + TanStack  │  │  │
│  │  └────────────┘  └──────────────┘  └────────────┘  └──────────────┘  │  │
│  └───────────────────────────┬───────────────────────────────────────────┘  │
└──────────────────────────────┼──────────────────────────────────────────────┘
                               │
                    ┌──────────┴──────────┐
                    │    tRPC v11 Layer    │
                    │  (Type-Safe RPC)     │
                    └──────────┬──────────┘
                               │
┌──────────────────────────────┼──────────────────────────────────────────────┐
│                         SERVER LAYER                                        │
│  ┌───────────────┐  ┌──────────────┐  ┌────────────┐  ┌──────────────────┐│
│  │  Better-Auth  │  │ Drizzle ORM  │  │  Soketi    │  │  React Email     ││
│  │  (RBAC/Auth)  │  │ (DB Access)  │  │  (WS Chat) │  │  + Resend/Novu   ││
│  └───────┬───────┘  └──────┬───────┘  └─────┬──────┘  └────────┬─────────┘│
│          │                  │                 │                   │          │
│  ┌───────┴──────────────────┴─────────────────┴──────────────────┴───────┐  │
│  │                     PostgreSQL 16 (Primary Database)                   │  │
│  │  UUID PKs • JSONB • GIN Indexes • Partial Indexes • Enums            │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  ┌──────────────────────────────────────────┐  ┌────────────────────────┐  │
│  │  Stripe / Razorpay Payment Gateways      │  │  Uploadthing / S3     │  │
│  │  (Webhooks → Route Handlers)              │  │  (File Storage)       │  │
│  └──────────────────────────────────────────┘  └────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
                               │
                    ┌──────────┴──────────┐
                    │    REST / SSE       │
                    │  (Internal API)      │
                    └──────────┬──────────┘
                               │
┌──────────────────────────────┼──────────────────────────────────────────────┐
│                     AI MICROSERVICE LAYER                                   │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │                    FastAPI (Python 3.11+)                             │  │
│  │  ┌───────────────┐  ┌──────────────────┐  ┌───────────────────────┐ │  │
│  │  │  Model Router │  │  Prediction API  │  │  Background Workers  │ │  │
│  │  │  (Plug & Play)│  │  (SSE Streaming) │  │  (Celery + Redis)    │ │  │
│  │  └───────────────┘  └──────────────────┘  └───────────────────────┘ │  │
│  │  ┌───────────────────────────────────────────────────────────────┐   │  │
│  │  │  ML Model Registry: PyTorch / LightGBM / XGBoost / ONNX     │   │  │
│  │  │  • Sales Forecasting    • Churn Prediction                    │   │  │
│  │  │  • Stock Demand (Creatine/Protein)  • Member LTV             │   │  │
│  │  └───────────────────────────────────────────────────────────────┘   │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Design System & Color Palette

### 3.1 Selected Palette: "Atelier Basalt & Smoked Terracotta"

> **Brand Archetype**: The Architectural Performance & Strength Club  
> **Vibe**: High-end urban athletic sanctuaries — raw architectural materials, cast concrete, matte gunmetal, smoked leather, and warm terracotta clay.

This palette was selected because it communicates **physical power, architectural precision, and warm human vitality** without resorting to neon clichés. The smoked terracotta accent triggers adrenaline associations while remaining sophisticated and grounded.

#### Color Token Table

| Token | Role | Light Mode | Dark Mode | Character |
|:------|:-----|:-----------|:----------|:----------|
| `--color-bg` | Background | `#F8F6F3` | `#131518` | Warm travertine / Deep smoked basalt |
| `--color-surface` | Cards & Panels | `#FFFFFF` | `#1B1E23` | Studio white / Dark graphite slate |
| `--color-surface-elevated` | Modals & Dropdowns | `#F0ECE5` | `#242930` | Limestone tint / Elevated titanium |
| `--color-primary` | Primary Actions | `#1B1E22` | `#EAE7E2` | Smoked obsidian / Warm bone linen |
| `--color-secondary` | Secondary Actions | `#5E6470` | `#9BA1AD` | Slate taupe / Brushed titanium |
| `--color-accent` | CTAs & Highlights | `#C45A3C` | `#E27252` | Tuscan terracotta / Luminous warm clay |
| `--color-text-primary` | Headings & Data | `#191B1F` | `#F4F3F0` | Deep basalt ink / Cashmere bone |
| `--color-text-muted` | Labels & Metadata | `#6C727D` | `#8C939F` | Weathered slate / Smoked pewter |
| `--color-border` | Dividers & Edges | `#E3DFD7` | `#2B303A` | Stone edge / Muted gunmetal |
| `--color-success` | Positive States | `#2A7356` | `#3BB384` | Deep forest pine / Luminous jade |
| `--color-warning` | Warning States | `#C77626` | `#E49646` | Warm clay amber / Polished sienna |
| `--color-error` | Error States | `#B83A38` | `#E25A58` | Smoked carmine / Warm coral-brick |

#### CSS Variables (TailwindCSS Integration)

```css
/* Light Mode (Default) */
:root {
  --color-bg: #F8F6F3;
  --color-surface: #FFFFFF;
  --color-surface-elevated: #F0ECE5;
  --color-primary: #1B1E22;
  --color-primary-contrast: #F8F6F3;
  --color-secondary: #5E6470;
  --color-accent: #C45A3C;
  --color-accent-contrast: #FFFFFF;
  --color-text-primary: #191B1F;
  --color-text-muted: #6C727D;
  --color-border: #E3DFD7;
  --color-success: #2A7356;
  --color-warning: #C77626;
  --color-error: #B83A38;
}

/* Dark Mode */
[data-theme="dark"] {
  --color-bg: #131518;
  --color-surface: #1B1E23;
  --color-surface-elevated: #242930;
  --color-primary: #EAE7E2;
  --color-primary-contrast: #131518;
  --color-secondary: #9BA1AD;
  --color-accent: #E27252;
  --color-accent-contrast: #131518;
  --color-text-primary: #F4F3F0;
  --color-text-muted: #8C939F;
  --color-border: #2B303A;
  --color-success: #3BB384;
  --color-warning: #E49646;
  --color-error: #E25A58;
}
```

### 3.2 Typography System

| Purpose | Font | Weights | Source |
|:--------|:-----|:--------|:-------|
| **Headings** | **Syne** | 600, 700, 800 | Google Fonts |
| **Body & Data** | **DM Sans** | 400, 500, 600 | Google Fonts |
| **Monospace / Metrics** | **JetBrains Mono** | 400, 500 | Google Fonts |

**Typography Rules**:
- Headings: `letter-spacing: -0.03em` for `text-2xl` and above
- Body: `line-height: 1.6` for readability
- Data/Metrics: `font-variant-numeric: tabular-nums` for alignment in dashboards
- Status badges: `uppercase`, `letter-spacing: 0.08em`, `font-weight: 600`

### 3.3 Spacing & Layout Constants

| Token | Value | Usage |
|:------|:------|:------|
| `--radius-sm` | `6px` | Input fields, small buttons |
| `--radius-md` | `10px` | Cards, panels |
| `--radius-lg` | `16px` | Modal dialogs, hero sections |
| `--radius-full` | `9999px` | Avatars, badges, pills |
| `--shadow-sm` | `0 1px 3px rgba(0,0,0,0.08)` | Subtle card elevation |
| `--shadow-md` | `0 4px 20px rgba(0,0,0,0.12)` | Elevated cards |
| `--shadow-lg` | `0 10px 40px rgba(0,0,0,0.18)` | Modals, hero overlays |

---

## 4. Project Directory Structure

```
forge-fit/                          # 🏠 Project Root
│
├── 📄 PLANNING.md                  # This document
├── 📄 README.md                    # Project overview & setup guide
├── 📄 package.json                 # Node.js dependencies
├── 📄 tsconfig.json                # TypeScript configuration
├── 📄 tailwind.config.ts           # TailwindCSS design tokens
├── 📄 drizzle.config.ts            # Drizzle ORM configuration
├── 📄 next.config.mjs              # Next.js configuration
├── 📄 .env.example                 # Environment variables template
├── 📄 .env.local                   # Local environment variables (gitignored)
├── 📄 .eslintrc.cjs                # ESLint configuration
├── 📄 .prettierrc                  # Prettier formatting rules
├── 📄 docker-compose.yml           # Local PostgreSQL + Soketi + Redis
│
├── 📁 .github/
│   └── 📁 workflows/
│       ├── ci.yml                  # Lint, type-check, test pipeline
│       └── deploy.yml              # Production deployment pipeline
│
├── 📁 public/                      # Static assets (served at /)
│   ├── 📁 images/                  # Hero images, marketing photos
│   ├── 📁 videos/                  # Background hero video loops
│   ├── 📁 icons/                   # Favicon, PWA icons
│   └── 📁 fonts/                   # Self-hosted font files (Syne, DM Sans)
│
├── 📁 src/                         # ═══ APPLICATION SOURCE ═══
│   │
│   ├── 📁 app/                     # Next.js App Router (pages & layouts)
│   │   ├── layout.tsx              # Root layout (providers, fonts, metadata)
│   │   ├── page.tsx                # Landing page redirect
│   │   ├── globals.css             # Global CSS variables + Tailwind base
│   │   ├── not-found.tsx           # Custom 404 page
│   │   ├── error.tsx               # Global error boundary
│   │   │
│   │   ├── 📁 (auth)/              # Route Group: Authentication
│   │   │   ├── layout.tsx          # Auth-specific layout (split-screen)
│   │   │   ├── 📁 login/           # Login page
│   │   │   ├── 📁 register/        # Multi-step registration
│   │   │   ├── 📁 forgot-password/ # Password recovery flow
│   │   │   └── 📁 verify-email/    # Email verification landing
│   │   │
│   │   ├── 📁 (marketing)/         # Route Group: Public Marketing Pages
│   │   │   ├── layout.tsx          # Marketing layout (navbar + footer)
│   │   │   ├── 📁 page/            # Home / Landing page (hero + features)
│   │   │   ├── 📁 pricing/         # Membership tier comparison
│   │   │   ├── 📁 about/           # About the gym / brand story
│   │   │   ├── 📁 contact/         # Contact form + map
│   │   │   └── 📁 equipment-guide/ # Public equipment library browser
│   │   │
│   │   ├── 📁 (dashboard)/         # Route Group: Authenticated Dashboard
│   │   │   ├── layout.tsx          # Dashboard shell (sidebar + topbar)
│   │   │   │
│   │   │   ├── 📁 admin/           # ═══ ADMIN/OWNER INTERFACE ═══
│   │   │   │   ├── layout.tsx      # Admin-specific sidebar navigation
│   │   │   │   ├── 📁 overview/    # KPI cards, revenue, active members
│   │   │   │   ├── 📁 members/     # Member CRUD, search, filters
│   │   │   │   ├── 📁 memberships/ # Plan management, tier configuration
│   │   │   │   ├── 📁 inventory/   # Stock levels, reorder alerts, suppliers
│   │   │   │   ├── 📁 orders/      # E-commerce order management
│   │   │   │   ├── 📁 equipment/   # Equipment CRUD, media uploads
│   │   │   │   ├── 📁 analytics/   # AI predictions, charts, reports
│   │   │   │   ├── 📁 payments/    # Transaction history, EMI tracking
│   │   │   │   ├── 📁 chat/        # Owner-side messaging interface
│   │   │   │   └── 📁 settings/    # Gym profile, billing, integrations
│   │   │   │
│   │   │   └── 📁 member/          # ═══ CUSTOMER INTERFACE ═══
│   │   │       ├── layout.tsx      # Member-specific sidebar navigation
│   │   │       ├── 📁 dashboard/   # Personal stats, membership status
│   │   │       ├── 📁 membership/  # Current plan, upgrade/downgrade
│   │   │       ├── 📁 shop/        # Supplement store browsing
│   │   │       ├── 📁 orders/      # Order history & tracking
│   │   │       ├── 📁 chat/        # Customer-side messaging
│   │   │       ├── 📁 profile/     # Profile settings, password change
│   │   │       └── 📁 equipment-guide/ # Equipment tutorials browser
│   │   │
│   │   └── 📁 api/                 # API Route Handlers
│   │       ├── 📁 auth/            # Better-Auth route handler
│   │       ├── 📁 trpc/            # tRPC HTTP handler
│   │       ├── 📁 ai/              # AI service proxy endpoints
│   │       └── 📁 webhooks/
│   │           ├── 📁 stripe/      # Stripe webhook handler
│   │           └── 📁 razorpay/    # Razorpay webhook handler
│   │
│   ├── 📁 components/              # ═══ REACT COMPONENTS ═══
│   │   ├── 📁 ui/                  # shadcn/ui primitives (Button, Card, etc.)
│   │   ├── 📁 layout/             # Navbar, Sidebar, Footer, Topbar
│   │   ├── 📁 marketing/          # Hero, FeatureGrid, PricingCards, Testimonials
│   │   ├── 📁 dashboard/          # KPICard, DataTable, StatWidget, StatusBadge
│   │   ├── 📁 auth/               # LoginForm, RegisterWizard, PasswordInput
│   │   ├── 📁 shop/               # ProductCard, CartDrawer, CheckoutForm
│   │   ├── 📁 chat/               # ChatWindow, MessageBubble, ConversationList
│   │   ├── 📁 equipment/          # EquipmentCard, VideoPlayer, MuscleFilter
│   │   └── 📁 charts/             # RevenueChart, MembershipTrend, AttendanceHeatmap
│   │
│   ├── 📁 server/                  # ═══ SERVER-SIDE LOGIC ═══
│   │   ├── 📁 db/
│   │   │   ├── 📁 schema/         # Drizzle ORM schema definitions
│   │   │   │   ├── users.ts        # Users, profiles, auth tokens
│   │   │   │   ├── memberships.ts  # Plans, facilities, user memberships
│   │   │   │   ├── products.ts     # Product catalog, variants, images
│   │   │   │   ├── orders.ts       # Orders, cart, wishlist, reviews
│   │   │   │   ├── inventory.ts    # Stock, suppliers, alerts
│   │   │   │   ├── equipment.ts    # Equipment, guides, media
│   │   │   │   ├── payments.ts     # Transactions, EMI, invoices, refunds
│   │   │   │   ├── chat.ts         # Conversations, messages, receipts
│   │   │   │   ├── ai.ts           # Models registry, predictions, cache
│   │   │   │   ├── notifications.ts # User notifications, preferences
│   │   │   │   ├── audit.ts        # Activity logs, system events
│   │   │   │   └── index.ts        # Schema barrel export
│   │   │   ├── 📁 migrations/     # Auto-generated Drizzle migrations
│   │   │   ├── 📁 seed/           # Database seeding scripts
│   │   │   │   ├── seed-plans.ts   # Default membership plans
│   │   │   │   ├── seed-equipment.ts # Sample equipment + guides
│   │   │   │   ├── seed-products.ts  # Sample supplement products
│   │   │   │   └── seed-admin.ts   # Default admin user
│   │   │   └── index.ts           # Drizzle client initialization
│   │   │
│   │   ├── 📁 trpc/
│   │   │   ├── index.ts           # tRPC initialization + context
│   │   │   ├── router.ts          # Root router (merges all sub-routers)
│   │   │   └── 📁 routers/
│   │   │       ├── auth.ts         # Auth procedures
│   │   │       ├── members.ts      # Member CRUD
│   │   │       ├── memberships.ts  # Membership management
│   │   │       ├── products.ts     # Product catalog
│   │   │       ├── orders.ts       # Order lifecycle
│   │   │       ├── inventory.ts    # Stock management
│   │   │       ├── equipment.ts    # Equipment catalog
│   │   │       ├── payments.ts     # Payment operations
│   │   │       ├── chat.ts         # Chat operations
│   │   │       ├── analytics.ts    # Dashboard analytics queries
│   │   │       ├── ai.ts           # AI prediction triggers
│   │   │       └── notifications.ts # Notification management
│   │   │
│   │   └── 📁 services/           # Business logic services
│   │       ├── membership.service.ts   # Membership lifecycle (create, renew, cancel)
│   │       ├── inventory.service.ts    # Stock deduction, reorder logic
│   │       ├── payment.service.ts      # Payment processing, EMI calculation
│   │       ├── notification.service.ts # Multi-channel dispatch (Novu)
│   │       └── analytics.service.ts    # Sales aggregation, KPI computation
│   │
│   ├── 📁 lib/                    # ═══ SHARED UTILITIES ═══
│   │   ├── 📁 db/                 # Database connection helpers
│   │   ├── 📁 auth/               # Better-Auth client + server configs
│   │   ├── 📁 payments/           # Stripe + Razorpay client initialization
│   │   ├── 📁 ai/                 # AI service HTTP client
│   │   ├── 📁 email/              # React Email templates + Resend client
│   │   ├── 📁 chat/               # Soketi/Pusher client setup
│   │   ├── 📁 utils/              # cn(), formatCurrency(), formatDate()
│   │   ├── 📁 validators/         # Zod schemas (shared between client/server)
│   │   └── 📁 constants/          # App-wide constants, plan tiers, enums
│   │
│   ├── 📁 hooks/                  # Custom React hooks
│   │   ├── use-auth.ts            # Authentication state hook
│   │   ├── use-cart.ts            # Shopping cart operations
│   │   ├── use-chat.ts            # WebSocket chat connection
│   │   ├── use-media-query.ts     # Responsive breakpoint detection
│   │   └── use-debounce.ts        # Input debouncing
│   │
│   ├── 📁 stores/                 # Zustand client stores
│   │   ├── cart.store.ts          # Shopping cart state
│   │   ├── ui.store.ts            # Sidebar toggle, theme, modals
│   │   └── chat.store.ts          # Active conversation, unread counts
│   │
│   ├── 📁 types/                  # TypeScript type definitions
│   │   ├── auth.types.ts          # User, Session, Role types
│   │   ├── membership.types.ts    # Plan, Membership, Facility types
│   │   ├── product.types.ts       # Product, Variant, Cart types
│   │   ├── payment.types.ts       # Transaction, EMI, Invoice types
│   │   └── api.types.ts           # API response wrappers
│   │
│   ├── 📁 config/                 # App configuration
│   │   ├── site.ts                # Site metadata, SEO defaults
│   │   ├── navigation.ts          # Sidebar nav items per role
│   │   └── plans.ts               # Membership tier configurations
│   │
│   └── 📁 middleware/             # Next.js middleware
│       └── middleware.ts          # Auth + RBAC route protection
│
├── 📁 ai-service/                 # ═══ PYTHON AI MICROSERVICE ═══
│   ├── 📄 Dockerfile              # Container build for FastAPI
│   ├── 📄 requirements.txt        # Python dependencies
│   ├── 📄 pyproject.toml          # Python project configuration
│   ├── 📁 app/
│   │   ├── main.py                # FastAPI application entry
│   │   ├── 📁 core/
│   │   │   ├── config.py          # Environment & DB config
│   │   │   ├── security.py        # JWT validation for internal API calls
│   │   │   └── database.py        # PostgreSQL async connection (asyncpg)
│   │   ├── 📁 routers/
│   │   │   ├── predictions.py     # /predict/* endpoints
│   │   │   ├── models.py          # /models/* (registry, swap)
│   │   │   └── health.py          # /health endpoint
│   │   ├── 📁 schemas/
│   │   │   ├── prediction.py      # Pydantic request/response models
│   │   │   └── model_registry.py  # Model metadata schemas
│   │   ├── 📁 services/
│   │   │   ├── forecasting.py     # Sales/demand forecasting pipeline
│   │   │   ├── churn.py           # Member churn prediction
│   │   │   └── model_loader.py    # Dynamic model loading (plug & play)
│   │   └── 📁 models/
│   │       └── base.py            # Abstract base class for all ML models
│   ├── 📁 ml_models/              # Serialized model artifacts (.pkl, .onnx, .pt)
│   └── 📁 tests/
│       ├── test_predictions.py
│       └── test_model_loader.py
│
├── 📁 docs/                       # Project documentation
│   ├── API.md                     # API endpoint documentation
│   ├── DEPLOYMENT.md              # Deployment guide
│   └── CONTRIBUTING.md            # Contribution guidelines
│
└── 📁 tests/                      # ═══ TESTING SUITE ═══
    ├── 📁 unit/                   # Component & utility unit tests
    ├── 📁 integration/            # API & database integration tests
    └── 📁 e2e/                    # Playwright browser tests
```

---

## 5. Database Schema Design

### 5.1 PostgreSQL Custom Enum Types

```sql
-- User & RBAC
CREATE TYPE user_role_enum AS ENUM ('admin', 'owner', 'trainer', 'staff', 'customer');
CREATE TYPE user_status_enum AS ENUM ('active', 'suspended', 'pending_verification', 'deactivated');
CREATE TYPE gender_enum AS ENUM ('male', 'female', 'other', 'prefer_not_to_say');

-- Memberships
CREATE TYPE subscription_tier_enum AS ENUM ('basic', 'standard', 'premium', 'vip');
CREATE TYPE billing_cycle_enum AS ENUM ('monthly', 'quarterly', 'semi_annual', 'annual');
CREATE TYPE membership_status_enum AS ENUM ('pending', 'active', 'paused', 'expired', 'cancelled');

-- E-Commerce
CREATE TYPE order_status_enum AS ENUM ('pending', 'processing', 'shipped', 'delivered', 'cancelled', 'returned');
CREATE TYPE order_payment_status_enum AS ENUM ('unpaid', 'authorized', 'paid', 'partially_refunded', 'refunded', 'failed');

-- Inventory
CREATE TYPE stock_transaction_type_enum AS ENUM ('purchase_order', 'customer_sale', 'sale_return', 'damage_writeoff', 'manual_adjustment');

-- Equipment
CREATE TYPE equipment_condition_enum AS ENUM ('excellent', 'good', 'fair', 'needs_maintenance', 'out_of_service');
CREATE TYPE media_type_enum AS ENUM ('image', 'video', 'pdf_manual');

-- Payments
CREATE TYPE payment_gateway_enum AS ENUM ('stripe', 'razorpay', 'cash_pos');
CREATE TYPE payment_status_enum AS ENUM ('initiated', 'pending', 'succeeded', 'failed', 'refunded', 'partially_refunded');
CREATE TYPE payment_method_type_enum AS ENUM ('credit_card', 'debit_card', 'upi', 'net_banking', 'wallet', 'emi');
CREATE TYPE emi_status_enum AS ENUM ('active', 'completed', 'defaulted', 'cancelled');

-- Chat
CREATE TYPE conversation_type_enum AS ENUM ('direct_trainer', 'customer_support', 'broadcast');
CREATE TYPE message_type_enum AS ENUM ('text', 'image', 'video', 'system_notice');
CREATE TYPE message_delivery_status_enum AS ENUM ('sent', 'delivered', 'read');

-- AI
CREATE TYPE model_type_enum AS ENUM ('sales_forecasting', 'churn_prediction', 'product_recommendation', 'equipment_usage_forecast', 'member_ltv');
CREATE TYPE model_status_enum AS ENUM ('training', 'active', 'deprecated', 'failed');

-- Notifications
CREATE TYPE notification_channel_enum AS ENUM ('in_app', 'email', 'sms', 'push');
CREATE TYPE notification_type_enum AS ENUM ('order_update', 'membership_renewal', 'payment_reminder', 'chat_message', 'system_alert');

-- Audit
CREATE TYPE audit_action_enum AS ENUM ('create', 'read', 'update', 'delete', 'login', 'logout', 'failed_login');
CREATE TYPE event_severity_enum AS ENUM ('info', 'warning', 'error', 'critical');
```

### 5.2 Entity Relationship Overview

```
┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│      USERS       │────▶│  USER_PROFILES   │     │   PERMISSIONS    │
│  (Master Auth)   │     │  (Demographics)  │     │  (RBAC Matrix)   │
└────────┬─────────┘     └──────────────────┘     └──────────────────┘
         │
    ┌────┴────┬────────────────┬──────────────┬──────────────┐
    │         │                │              │              │
    ▼         ▼                ▼              ▼              ▼
┌────────┐ ┌──────────┐ ┌──────────┐ ┌────────────┐ ┌────────────┐
│MEMBER- │ │ ORDERS   │ │ PAYMENT  │ │ CHAT_      │ │ NOTIFI-    │
│SHIPS   │ │          │ │ TRANS.   │ │ MESSAGES   │ │ CATIONS    │
└────┬───┘ └────┬─────┘ └────┬─────┘ └────────────┘ └────────────┘
     │          │             │
     ▼          ▼             ▼
┌────────┐ ┌──────────┐ ┌──────────┐
│MEMBER- │ │ ORDER    │ │ EMI      │
│SHIP    │ │ ITEMS    │ │ PLANS    │
│HISTORY │ └────┬─────┘ └──────────┘
└────────┘      │
                ▼
         ┌──────────┐     ┌──────────┐     ┌──────────┐
         │ PRODUCT  │────▶│ PRODUCT  │────▶│INVENTORY │
         │ VARIANTS │     │ IMAGES   │     │(Stock)   │
         └────┬─────┘     └──────────┘     └──────────┘
              │
              ▼
         ┌──────────┐
         │ PRODUCTS │
         └────┬─────┘
              │
              ▼
         ┌──────────────┐
         │ PRODUCT      │
         │ CATEGORIES   │
         └──────────────┘
```

### 5.3 Core Table Specifications

#### Module 1: User Management & RBAC

| Table | Key Columns | Relationships |
|:------|:-----------|:-------------|
| `users` | `id` (UUID PK), `email` (UNIQUE), `phone_number`, `password_hash`, `role` (enum), `status` (enum), `email_verified_at`, `two_factor_enabled`, `deleted_at` | 1:1 → `user_profiles`, 1:N → `auth_refresh_tokens`, `user_sessions` |
| `user_profiles` | `user_id` (FK → users, UNIQUE), `first_name`, `last_name`, `avatar_url`, `date_of_birth`, `gender`, `emergency_contact_name`, `medical_conditions` (TEXT[]), `fitness_goals` (TEXT[]), `address_*`, `metadata` (JSONB) | Belongs to `users` |
| `auth_refresh_tokens` | `user_id` (FK), `token_hash` (UNIQUE), `device_info`, `ip_address` (INET), `expires_at`, `revoked_at` | Belongs to `users` |
| `user_sessions` | `user_id` (FK), `session_token_hash` (UNIQUE), `ip_address` (INET), `user_agent`, `is_active`, `expires_at` | Belongs to `users` |
| `permissions` | `module`, `action`, `code` (UNIQUE) | M:N → users via `user_custom_permissions` |

#### Module 2: Membership Management

| Table | Key Columns | Relationships |
|:------|:-----------|:-------------|
| `facilities` | `name` (UNIQUE), `code` (UNIQUE), `description`, `is_active` | M:N → `membership_plans` via `plan_facilities` |
| `membership_plans` | `name`, `tier` (enum), `billing_cycle` (enum), `duration_days`, `base_price` (NUMERIC(10,2)), `discount_percentage`, `signup_fee`, `features` (JSONB) | 1:N → `user_memberships`, M:N → `facilities` |
| `plan_facilities` | `plan_id` (FK), `facility_id` (FK), `access_rules` (JSONB) | Junction table |
| `user_memberships` | `user_id` (FK), `plan_id` (FK), `status` (enum), `start_date`, `end_date`, `auto_renew`, `cancelled_at`, `cancellation_reason` | 1:N → `membership_history` |
| `membership_history` | `membership_id` (FK), `action`, `previous_status`, `new_status`, `previous_plan_id`, `new_plan_id`, `created_by` (FK) | Audit trail |

**Membership Tiers Defined:**

| Tier | Monthly Price | Facilities Included | Supplements | Coach Support |
|:-----|:-------------|:-------------------|:------------|:-------------|
| **Basic** | ₹1,499 / \$19 | Gym Floor, Cardio Zone | ❌ None | ❌ None |
| **Standard** | ₹2,999 / \$39 | + Sauna, Group Classes | ❌ None | ⚡ 2 sessions/month |
| **Premium** | ₹4,999 / \$59 | + Pool, Lounge, All Zones | ✅ 10% store discount | ✅ Unlimited coaching |
| **VIP** | ₹9,999 / \$99 | All Facilities, Priority Booking | ✅ 20% store discount + 1 free supplement/month | ✅ Dedicated personal trainer |

#### Module 3: E-Commerce (Supplements)

| Table | Key Columns | Relationships |
|:------|:-----------|:-------------|
| `product_categories` | `name`, `slug` (UNIQUE), `parent_id` (self-ref FK) | Self-referential tree, 1:N → `products` |
| `products` | `category_id` (FK), `name`, `slug` (UNIQUE), `brand`, `nutritional_info` (JSONB), `rating_avg`, `rating_count`, `deleted_at` | 1:N → `product_variants`, `product_images`, `product_reviews` |
| `product_variants` | `product_id` (FK), `sku` (UNIQUE), `flavor`, `size_or_weight`, `price`, `cost_price` | 1:1 → `inventory`, N → `order_items`, `cart_items` |
| `product_images` | `product_id` (FK), `variant_id` (FK nullable), `image_url`, `alt_text`, `display_order`, `is_primary` | Belongs to `products` |
| `shopping_carts` / `cart_items` | `user_id` (UNIQUE FK), `variant_id` (FK), `quantity` | Ephemeral shopping state |
| `orders` | `order_number` (UNIQUE), `user_id` (FK), `status` (enum), `payment_status` (enum), `subtotal`, `tax_amount`, `total_amount`, `shipping_address` (JSONB) | 1:N → `order_items` |
| `order_items` | `order_id` (FK), `variant_id` (FK), `product_name`, `sku`, `unit_price`, `quantity` | Snapshot at purchase time |
| `product_reviews` | `product_id` (FK), `user_id` (FK), `rating` (1-5 CHECK), `title`, `comment`, `is_verified_purchase` | UNIQUE(user_id, product_id) |

#### Module 4: Inventory Management

| Table | Key Columns | Relationships |
|:------|:-----------|:-------------|
| `suppliers` | `company_name`, `contact_name`, `email`, `lead_time_days` | 1:N → `stock_history` |
| `inventory` | `variant_id` (FK, UNIQUE), `quantity_on_hand`, `quantity_reserved`, `reorder_threshold`, `optimal_stock_level` | 1:1 with `product_variants` |
| `stock_history` | `variant_id` (FK), `supplier_id` (FK nullable), `change_type` (enum), `quantity_change`, `balance_after`, `reference_type`, `reference_id`, `created_by` (FK) | Append-only audit log |
| `low_stock_alerts` | `variant_id` (FK), `current_stock`, `threshold`, `status` (enum), `acknowledged_by` (FK) | Trigger-based alerts |

#### Module 5: Equipment Library

| Table | Key Columns | Relationships |
|:------|:-----------|:-------------|
| `equipment_categories` | `name` (UNIQUE), `description`, `icon_url` | 1:N → `gym_equipment` |
| `gym_equipment` | `category_id` (FK), `name`, `manufacturer`, `target_muscle_groups` (TEXT[]), `condition` (enum), `qr_code_identifier` (UNIQUE), `location_in_gym` | 1:1 → `equipment_usage_guides`, 1:N → `equipment_media` |
| `equipment_usage_guides` | `equipment_id` (FK, UNIQUE), `step_by_step_instructions` (JSONB), `primary_muscles` (TEXT[]), `safety_precautions` (TEXT[]), `difficulty_level` | Detailed form guides |
| `equipment_media` | `equipment_id` (FK), `media_type` (enum), `media_url`, `thumbnail_url`, `duration_seconds`, `is_primary` | Instructional videos/photos |

#### Module 6: Payment System & EMI

| Table | Key Columns | Relationships |
|:------|:-----------|:-------------|
| `payment_methods` | `user_id` (FK), `gateway` (enum), `gateway_payment_method_id`, `type` (enum), `last4`, `is_default` | Tokenized payment references |
| `payment_transactions` | `transaction_ref` (UNIQUE), `user_id` (FK), `amount` (NUMERIC(10,2)), `currency`, `status` (enum), `gateway` (enum), `purpose`, `reference_id` | Master financial ledger |
| `emi_plans` | `user_id` (FK), `total_amount`, `financed_amount`, `tenure_months`, `interest_rate_annual`, `monthly_installment`, `status` (enum) | EMI loan agreements |
| `emi_installments` | `emi_plan_id` (FK), `installment_number`, `due_date`, `amount`, `principal_component`, `interest_component`, `status`, `payment_transaction_id` (FK) | Individual EMI schedule entries |
| `invoices` | `invoice_number` (UNIQUE), `user_id` (FK), `transaction_id` (FK), `tax_details` (JSONB), `total_amount`, `invoice_pdf_url` | GST/Tax compliance invoices |
| `payment_refunds` | `transaction_id` (FK), `amount`, `reason`, `status` (enum), `gateway_refund_id` | Refund operations |

#### Module 7: Real-Time Chat

| Table | Key Columns | Relationships |
|:------|:-----------|:-------------|
| `chat_conversations` | `type` (enum), `title`, `created_by` (FK), `last_message_at` | 1:N → `chat_participants`, `chat_messages` |
| `chat_participants` | `conversation_id` (FK), `user_id` (FK), `role`, `last_read_message_id`, `is_muted` | UNIQUE(conversation_id, user_id) |
| `chat_messages` | `conversation_id` (FK), `sender_id` (FK), `message_type` (enum), `body`, `attachment_url`, `is_edited`, `is_deleted` | Main message store |
| `chat_message_receipts` | `message_id` (FK), `user_id` (FK), `status` (enum: sent/delivered/read) | UNIQUE(message_id, user_id) |

#### Module 8: AI & Analytics

| Table | Key Columns | Relationships |
|:------|:-----------|:-------------|
| `ai_models` | `name`, `model_type` (enum), `version`, `status` (enum), `framework`, `hyperparameters` (JSONB), `metrics` (JSONB), `artifact_uri`, `is_current_champion` | Model registry |
| `ai_predictions` | `model_id` (FK), `prediction_target` (enum), `entity_type`, `entity_id`, `predicted_value`, `confidence_score`, `prediction_metadata` (JSONB), `expires_at` | Cached inference results |
| `analytics_sales_cache` | `aggregation_period`, `period_start`, `period_end`, `total_sales_amount`, `total_orders_count`, `new_memberships_count`, `churned_memberships_count` | Pre-aggregated rollups |

#### Module 9: Notifications

| Table | Key Columns |
|:------|:-----------|
| `notification_preferences` | `user_id` (FK), `channel` (enum), `notification_type` (enum), `is_enabled` — UNIQUE(user_id, channel, type) |
| `user_notifications` | `user_id` (FK), `title`, `body`, `channel` (enum), `type` (enum), `priority` (enum), `action_url`, `is_read`, `read_at` |

#### Module 10: Audit & System Logs

| Table | Key Columns |
|:------|:-----------|
| `activity_logs` | `user_id` (FK), `action` (enum), `entity_name`, `entity_id`, `old_values` (JSONB), `new_values` (JSONB), `ip_address` (INET) |
| `system_events` | `event_type`, `severity` (enum), `source_module`, `message`, `payload` (JSONB), `exception_trace` |

---

## 6. Core Modules & Feature Specifications

### 6.1 Module: Authentication & RBAC

| Feature | Implementation |
|:--------|:-------------|
| Email/Password Login | Better-Auth with Argon2 hashing |
| Social OAuth | Google, GitHub providers via Better-Auth plugins |
| Two-Factor Authentication | TOTP (Time-based One-Time Password) via Better-Auth 2FA plugin |
| Email Verification | Magic link + OTP via Resend transactional email |
| Password Reset | Secure token flow with expiry |
| Role-Based Access | `admin`, `owner`, `trainer`, `staff`, `customer` roles |
| Route Protection | Next.js middleware + tRPC procedure guards |
| Session Management | Server-side sessions with refresh token rotation |

### 6.2 Module: Membership Management

| Feature | Implementation |
|:--------|:-------------|
| Tier Browsing | Public pricing page with feature comparison table |
| Plan Subscription | Stripe Checkout → membership activation via webhook |
| Upgrade/Downgrade | Prorated billing via Stripe proration API |
| Auto-Renewal | Stripe recurring billing with dunning (Smart Retries) |
| Pause/Freeze | Custom logic: set `paused_at`, `pause_resume_date` |
| Cancellation | Cancellation survey → reason stored → immediate or end-of-billing |
| History Tracking | Every state change logged to `membership_history` |
| Facility Access Rules | JSONB-based access matrix per plan (peak hours, monthly limits) |

### 6.3 Module: E-Commerce & Inventory

| Feature | Implementation |
|:--------|:-------------|
| Product Catalog | Hierarchical categories (Supplements → Protein → Whey Isolate) |
| Product Variants | Flavor + size combinations with independent pricing and SKUs |
| Image Gallery | Multiple images per product with primary flag and ordering |
| Shopping Cart | Persistent server-side cart (survives logout) |
| Wishlist | Heart/bookmark products for later |
| Checkout Flow | Address → Payment → Confirmation (multi-step form with Zod) |
| Order Management | Status lifecycle: pending → processing → shipped → delivered |
| Reviews & Ratings | Verified purchase badge, aggregated average rating |
| **Inventory Tracking** | Real-time stock with `quantity_on_hand`, `quantity_reserved` |
| **Auto-Deduction** | Stock automatically deducted upon successful payment webhook |
| **Low-Stock Alerts** | Triggered when `quantity_on_hand < reorder_threshold` |
| **Supplier Management** | Supplier contacts, lead times, purchase order history |

### 6.4 Module: Equipment Guide Library

| Feature | Implementation |
|:--------|:-------------|
| Equipment Catalog | Browseable grid with category filters (Free Weights, Cable, Cardio) |
| Muscle Group Filter | Filter by target muscles (Chest, Back, Legs, etc.) |
| Usage Instructions | Step-by-step JSONB guide with safety precautions |
| Video Tutorials | Embedded video player with instructional clips |
| Photo Gallery | Multiple angles, proper form demonstration |
| QR Code Scan | Each machine has a unique QR → opens its guide page on member's phone |
| Difficulty Level | Beginner, Intermediate, Advanced tagging |

### 6.5 Module: Payment Gateway

| Feature | Implementation |
|:--------|:-------------|
| Stripe Integration | Subscriptions, one-time charges, Payment Element UI |
| Razorpay Integration | Standard Checkout, UPI, Net Banking, Wallets |
| **Credit Card EMI** | Razorpay EMI: 16+ banks (HDFC, ICICI, Axis, SBI) |
| **Debit Card EMI** | Razorpay: HDFC, ICICI debit card installments |
| **Cardless EMI** | ZestMoney, EarlySalary integration via Razorpay |
| **No-Cost EMI** | Gym subsidizes interest for premium annual memberships |
| **BNPL (Global)** | Stripe: Klarna, Afterpay/Clearpay, Affirm |
| Webhook Processing | Idempotent webhook handlers for both gateways |
| Invoice Generation | Auto-generated PDF invoices with GST/Tax details |
| Refund Processing | Partial and full refunds through admin dashboard |

### 6.6 Module: Real-Time Chat

| Feature | Implementation |
|:--------|:-------------|
| Direct Messaging | Owner ↔ Customer 1:1 conversations |
| Message Types | Text, images, system notices |
| Delivery Receipts | Sent → Delivered → Read status tracking |
| Real-Time Updates | Soketi WebSocket server (Pusher-compatible protocol) |
| Unread Badges | Real-time unread count in sidebar navigation |
| Message History | Infinite scroll with cursor-based pagination |
| Typing Indicators | Presence channel events via Soketi |
| Mute Conversations | Per-user conversation muting |

### 6.7 Module: Admin Analytics Dashboard

| Feature | Implementation |
|:--------|:-------------|
| Revenue KPIs | Total revenue, MRR, ARR with delta badges (vs. last period) |
| Membership Analytics | Active members, new signups, churn rate, tier distribution |
| Sales Charts | Line/area charts for daily/weekly/monthly revenue trends |
| Inventory Dashboard | Stock levels, reorder alerts, top-selling products |
| Attendance Heatmap | Nivo calendar heatmap showing peak gym hours by day |
| **AI: Sales Forecast** | Time-series prediction of next 30/60/90 day revenue |
| **AI: Stock Forecast** | Demand prediction for creatine/protein stock replenishment |
| **AI: Churn Risk** | Per-member churn probability scores with risk factors |
| Billing History | Searchable transaction log with filter by status/date/gateway |
| Export Reports | CSV/PDF export of analytics data |

---

## 7. UI/UX Component Breakdown

### 7.1 Public Marketing Pages

#### Hero Section (Landing Page)
```
┌─────────────────────────────────────────────────────────────────────┐
│  ┌─ GLASSMORPHIC NAVBAR ─────────────────────────────────────────┐ │
│  │  [Logo] FORGE FIT    Pricing  Equipment  About  [Login] [Join]│ │
│  └───────────────────────────────────────────────────────────────┘ │
│                                                                     │
│   ╔═══════════════════════════════════════════════════════════════╗ │
│   ║  AUTO-PLAYING BACKGROUND VIDEO (gym interior, training)      ║ │
│   ║                                                               ║ │
│   ║              FORGE YOUR STRENGTH.                            ║ │
│   ║              ELEVATE YOUR LIFE.                              ║ │
│   ║                                                               ║ │
│   ║   [Animated subtitle: Premium fitness, reimagined.]          ║ │
│   ║                                                               ║ │
│   ║   [ ▶ START YOUR JOURNEY ]  [ EXPLORE PLANS → ]             ║ │
│   ║                                                               ║ │
│   ╚═══════════════════════════════════════════════════════════════╝ │
│                                                                     │
│   ┌─ STATS BAR (Animated counters) ─────────────────────────────┐ │
│   │  500+ Active Members  │  15+ Equipment Types  │  98% Happy  │ │
│   └─────────────────────────────────────────────────────────────┘ │
│                                                                     │
│   ┌─ BENTO GRID: Features ──────────────────────────────────────┐ │
│   │ ┌──────────────┐ ┌──────────────┐ ┌──────────────────────┐  │ │
│   │ │ 🏋️ Premium   │ │ 🛒 Supplement │ │ 📊 AI-Powered       │  │ │
│   │ │ Equipment    │ │ Store        │ │ Analytics           │  │ │
│   │ │ (Video BG)   │ │              │ │                     │  │ │
│   │ └──────────────┘ └──────────────┘ └──────────────────────┘  │ │
│   │ ┌────────────────────────┐ ┌────────────────────────────┐   │ │
│   │ │ 💬 Direct Owner Chat   │ │ 📱 Equipment Guides + QR   │   │ │
│   │ └────────────────────────┘ └────────────────────────────┘   │ │
│   └─────────────────────────────────────────────────────────────┘ │
│                                                                     │
│   ┌─ MEMBERSHIP TIERS (Horizontal scroll on mobile) ────────────┐ │
│   │  [ Basic ]  [ Standard ]  [ ★ Premium ]  [ VIP ]            │ │
│   │   ₹1,499      ₹2,999        ₹4,999        ₹9,999           │ │
│   │   /month       /month        /month        /month           │ │
│   └─────────────────────────────────────────────────────────────┘ │
│                                                                     │
│   ┌─ TESTIMONIALS (Carousel) ───────────────────────────────────┐ │
│   │  "Forge Fit transformed my fitness journey..."  ★★★★★       │ │
│   └─────────────────────────────────────────────────────────────┘ │
│                                                                     │
│   ┌─ FOOTER ────────────────────────────────────────────────────┐ │
│   │  Links  │  Social  │  Contact  │  © 2026 Forge Fit         │ │
│   └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
```

**Key Components for Hero:**
- `HeroVideo` — Auto-playing muted `<video>` with gradient overlay
- `AnimatedCounter` — Number count-up animation (Magic UI `NumberTicker`)
- `BentoGrid` — Feature showcase grid (Magic UI)
- `PricingCards` — Tiered membership comparison with CTA buttons
- `TestimonialCarousel` — Auto-scrolling customer reviews
- `GlassmorphicNavbar` — `backdrop-filter: blur(12px)` transparent navbar

### 7.2 Admin Dashboard Layout

```
┌─────────────────────────────────────────────────────────────────────┐
│  ┌─ SIDEBAR (Collapsible) ──┐  ┌─ MAIN CONTENT AREA ───────────┐ │
│  │  [Logo]                   │  │  ┌─ TOP BAR ──────────────────┐│ │
│  │                           │  │  │ 🔍 Search  🔔(3) 💬(2) 👤 ││ │
│  │  📊 Overview              │  │  └─────────────────────────────┘│ │
│  │  👥 Members               │  │                                 │ │
│  │  🎫 Memberships           │  │  ┌─ KPI CARDS ROW ────────────┐│ │
│  │  📦 Inventory             │  │  │ Revenue  │ Members │ Orders ││ │
│  │  🛒 Orders                │  │  │ ₹12.4L   │ 487     │ 156   ││ │
│  │  🏋️ Equipment             │  │  │ +12.3%▲  │ +5.2%▲  │ -2.1%▼││ │
│  │  📈 Analytics             │  │  └─────────────────────────────┘│ │
│  │  💳 Payments              │  │                                 │ │
│  │  💬 Chat                  │  │  ┌─ CHARTS ────────────────────┐│ │
│  │  ⚙️ Settings              │  │  │ [Revenue Trend Line Chart]  ││ │
│  │                           │  │  │ [Membership Pie Chart]      ││ │
│  │  ─── AI INSIGHTS ───     │  │  └─────────────────────────────┘│ │
│  │  🤖 Predictions           │  │                                 │ │
│  │  📊 Forecasts             │  │  ┌─ DATA TABLE ────────────────┐│ │
│  │                           │  │  │ Recent Orders / Members     ││ │
│  │  [Theme Toggle 🌙]       │  │  │ Search, Filter, Sort, Page  ││ │
│  └───────────────────────────┘  │  └─────────────────────────────┘│ │
│                                  └─────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
```

**Key Admin Components:**
- `DashboardShell` — Sidebar + topbar layout wrapper
- `KPICard` — Metric value, delta badge, sparkline
- `DataTable` — shadcn/ui table with sorting, filtering, pagination
- `RevenueChart` — Recharts area chart with period selector
- `MembershipDistribution` — Recharts pie/donut chart
- `AttendanceHeatmap` — Nivo calendar heatmap
- `InventoryAlertBanner` — Low-stock warning notifications
- `PredictionCard` — AI forecast with confidence indicator

### 7.3 Component Library Map

| Component Category | Components | Library Source |
|:------------------|:-----------|:-------------|
| **Primitives** | Button, Input, Select, Checkbox, Radio, Switch, Slider, Textarea, Label, Badge, Avatar, Separator | shadcn/ui (Radix) |
| **Layout** | Card, Sheet (side drawer), Dialog, Popover, Tooltip, Tabs, Accordion, Collapsible, Scroll Area | shadcn/ui (Radix) |
| **Data Display** | Table, DataTable, Calendar, Carousel, Progress, Skeleton, Alert, Toast/Sonner | shadcn/ui |
| **Forms** | Form (React Hook Form + Zod), Command (search), Combobox, Date Picker, File Upload | shadcn/ui |
| **Navigation** | Navigation Menu, Breadcrumb, Pagination, Sidebar, Dropdown Menu, Context Menu | shadcn/ui |
| **Marketing** | Bento Grid, Number Ticker, Spotlight, Meteors, Animated Beam, Marquee | Magic UI |
| **Premium Effects** | 3D Card Tilt, Glowing Border, Lamp Effect, Background Beams | Aceternity UI |
| **Charts** | Area, Bar, Line, Pie, Radar charts + Tooltips | Recharts (shadcn/ui Charts) |
| **Analytics** | Calendar Heatmap, Treemap, Stream | Nivo |

---

## 8. AI Subsystem Architecture

### 8.1 Design Principles

1. **Plug & Play Models**: Every ML model implements a standard `BaseModel` interface. New models are dropped into the `ml_models/` directory and registered in the database. Zero code changes to the serving infrastructure.
2. **Decoupled Microservice**: The AI service runs independently from the Next.js application. Communication is via internal REST API + SSE streaming.
3. **Model Registry**: All models are versioned in the `ai_models` database table with hyperparameters, metrics, and artifact URIs. Champion/challenger model swapping is an admin UI action.

### 8.2 Model Interface Contract

```python
# ai-service/app/models/base.py
from abc import ABC, abstractmethod
from typing import Any, Dict
import numpy as np

class BaseModel(ABC):
    """Standard interface for all pluggable ML models."""
    
    @abstractmethod
    def load(self, artifact_path: str) -> None:
        """Load model weights/artifacts from disk."""
        ...
    
    @abstractmethod
    def predict(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Run inference and return predictions."""
        ...
    
    @abstractmethod
    def get_metadata(self) -> Dict[str, Any]:
        """Return model metadata (version, metrics, etc.)."""
        ...
    
    @property
    @abstractmethod
    def model_type(self) -> str:
        """Return the model type identifier."""
        ...
```

### 8.3 Prediction Endpoints

| Endpoint | Method | Purpose | Input | Output |
|:---------|:-------|:--------|:------|:-------|
| `/predict/sales-forecast` | POST | Forecast revenue for next N days | `{ "days_ahead": 30, "granularity": "daily" }` | Time-series predictions with confidence intervals |
| `/predict/stock-demand` | POST | Predict supplement reorder needs | `{ "product_variant_id": "uuid", "forecast_days": 30 }` | Predicted demand, recommended reorder quantity |
| `/predict/churn-risk` | POST | Per-member churn probability | `{ "user_id": "uuid" }` OR `{ "batch": true }` | Churn score (0–1), top risk factors (SHAP values) |
| `/predict/member-ltv` | POST | Predicted lifetime value | `{ "user_id": "uuid" }` | Predicted LTV in currency, confidence |
| `/models/registry` | GET | List registered models | — | All models with status, metrics, versions |
| `/models/{id}/activate` | POST | Promote model to champion | `{ "model_id": "uuid" }` | Updated status |
| `/health` | GET | Service health check | — | `{ "status": "ok", "models_loaded": 4 }` |

### 8.4 AI-Powered Business Features

1. **Creatine/Protein Stock Forecasting**: Time-series model (Prophet or LightGBM) trained on:
   - Historical sales data per variant (daily/weekly granularity)
   - Billing/subscription patterns (more Premium members = more supplement sales)
   - Seasonal trends (New Year resolution spike, summer body prep)
   - Output: "Order 50 units of Creatine Monohydrate 500g within 7 days to avoid stockout"

2. **Member Churn Prediction**: Classification model trained on:
   - Check-in frequency (declining visits)
   - Session booking cancellation rate
   - Payment failures / late payments
   - Days since last gym visit
   - Membership tier and tenure
   - Output: Risk score + actionable insight ("Member hasn't visited in 12 days, send re-engagement offer")

3. **Revenue Forecasting**: Time-series regression on:
   - Membership revenue (recurring + new signups - churn)
   - E-commerce revenue (supplement sales trends)
   - Seasonality modeling
   - Output: Daily/weekly/monthly revenue projections with confidence bands

---

## 9. Open-Source Dependencies & Libraries

### 9.1 Core Dependencies (npm)

| Package | Purpose | GitHub Stars |
|:--------|:--------|:-------------|
| `next` (14+) | React framework with App Router | 128k+ |
| `react` + `react-dom` (18+) | UI library | 230k+ |
| `typescript` (5.x) | Type safety | 102k+ |
| `tailwindcss` (3.4+) | Utility-first CSS | 84k+ |
| `drizzle-orm` + `drizzle-kit` | TypeScript ORM for PostgreSQL | 36k+ |
| `@trpc/server` + `@trpc/client` + `@trpc/next` | End-to-end type-safe API | 35k+ |
| `better-auth` | Authentication + RBAC | 30k+ |
| `zod` | Schema validation | 35k+ |
| `@tanstack/react-query` | Server state management | 45k+ |
| `zustand` | Client state management | 50k+ |
| `recharts` | Dashboard charting | 24k+ |
| `@nivo/core` + `@nivo/heatmap` | Heatmap visualizations | 13k+ |
| `pusher-js` | WebSocket client (Soketi-compatible) | 10k+ |
| `stripe` + `@stripe/stripe-js` | Payment processing | 4k+ |
| `razorpay` | Indian payment gateway | 400+ |
| `@react-email/*` + `resend` | Email templates + delivery | 15k+ |
| `@novu/node` | Multi-channel notifications | 40k+ |
| `uploadthing` | File upload management | 4k+ |
| `lucide-react` | Icon library | 12k+ |
| `framer-motion` | Animations | 25k+ |
| `react-hook-form` | Form state management | 42k+ |
| `@hookform/resolvers` | Zod resolver for RHF | — |
| `date-fns` | Date utilities | 35k+ |
| `sonner` | Toast notifications | 9k+ |
| `next-themes` | Dark mode management | 6k+ |
| `class-variance-authority` | Component variant API | 6k+ |
| `clsx` + `tailwind-merge` | Class name utilities | 8k+ / 3k+ |

### 9.2 Dev Dependencies

| Package | Purpose |
|:--------|:--------|
| `vitest` | Unit/integration testing |
| `@playwright/test` | End-to-end browser testing |
| `@testing-library/react` | React component testing |
| `eslint` + `eslint-config-next` | Code linting |
| `prettier` + `prettier-plugin-tailwindcss` | Code formatting |
| `husky` + `lint-staged` | Git hooks for quality gates |
| `@types/*` | TypeScript type definitions |

### 9.3 Python AI Service Dependencies

| Package | Purpose |
|:--------|:--------|
| `fastapi` | Async web framework |
| `uvicorn` | ASGI server |
| `pydantic` (v2) | Data validation |
| `asyncpg` | PostgreSQL async driver |
| `sqlalchemy` (async) | Database queries in Python |
| `scikit-learn` | Classical ML algorithms |
| `lightgbm` | Gradient boosting |
| `prophet` | Time-series forecasting |
| `torch` / `onnxruntime` | Deep learning inference |
| `pandas` + `numpy` | Data manipulation |
| `celery` + `redis` | Background task queue |
| `httpx` | Async HTTP client |
| `pytest` | Testing framework |

---

## 10. Media Assets & Sourcing Strategy

### 10.1 Recommended Free Asset Platforms

| Platform | URL | Best For | License |
|:---------|:----|:---------|:--------|
| **Pexels** | [pexels.com](https://www.pexels.com) | 4K gym videos for hero section + photos | Free, no attribution required |
| **Unsplash** | [unsplash.com](https://unsplash.com) | Editorial-grade lifestyle photography | Free, no attribution required |
| **Coverr** | [coverr.co](https://coverr.co) | Curated background video loops | Free commercial use |
| **Mixkit** | [mixkit.co](https://mixkit.co) | Exercise clips + sound effects | Free (by Envato) |
| **Pixabay** | [pixabay.com](https://pixabay.com) | Vector muscle group diagrams | Free, no attribution |

### 10.2 Specific Asset Requirements

| Asset | Source Strategy | Format |
|:------|:--------------|:-------|
| Hero background video | 2-3 looped clips from Pexels/Coverr (gym interior, training) | MP4, 1080p-4K, 15-30s loop |
| Membership tier imagery | Unsplash (premium gym interiors, people training) | WebP, 1200x800px |
| Product images | Admin-uploaded (supplements) + Unsplash fallbacks | WebP, 600x600px square |
| Equipment photos | Admin-uploaded per machine | WebP, 800x600px |
| Equipment tutorial videos | Admin-uploaded instructional clips | MP4, 720p-1080p, 30-120s |
| Trainer portraits | Unsplash (professional headshots) for demo data | WebP, 400x400px square |
| Brand logo | Custom SVG designed in Figma | SVG + PNG (48px, 192px, 512px) |

---

## 11. API Design & tRPC Router Map

### 11.1 Router Architecture

```typescript
// src/server/trpc/router.ts
export const appRouter = createTRPCRouter({
  auth: authRouter,           // Login, register, verify, session
  members: membersRouter,     // Member CRUD, search, bulk actions
  memberships: membershipsRouter, // Plans, subscriptions, renewals
  products: productsRouter,   // Product catalog, variants, reviews
  orders: ordersRouter,       // Cart, checkout, order lifecycle
  inventory: inventoryRouter, // Stock levels, reorder, suppliers
  equipment: equipmentRouter, // Equipment CRUD, guides, media
  payments: paymentsRouter,   // Transactions, EMI, invoices
  chat: chatRouter,           // Conversations, messages, receipts
  analytics: analyticsRouter, // Dashboard KPIs, chart data
  ai: aiRouter,               // Trigger predictions, view results
  notifications: notificationsRouter, // User notifications
});
```

### 11.2 Key Procedure Examples

| Router | Procedure | Type | Access | Description |
|:-------|:---------|:-----|:-------|:-----------|
| `members` | `list` | Query | Admin | Paginated member list with filters |
| `members` | `getById` | Query | Admin | Single member with full profile |
| `memberships` | `subscribe` | Mutation | Customer | Create new subscription (→ Stripe checkout) |
| `memberships` | `cancel` | Mutation | Customer | Cancel with reason survey |
| `products` | `listPublic` | Query | Public | Browse store with category filter |
| `orders` | `addToCart` | Mutation | Customer | Add variant to cart |
| `orders` | `checkout` | Mutation | Customer | Create order from cart |
| `inventory` | `adjustStock` | Mutation | Admin | Manual stock adjustment |
| `inventory` | `getLowStockAlerts` | Query | Admin | Active low-stock alerts |
| `payments` | `getTransactions` | Query | Admin | Filtered transaction history |
| `payments` | `initiateRefund` | Mutation | Admin | Start refund process |
| `chat` | `getConversations` | Query | Authed | User's conversations with last message |
| `chat` | `sendMessage` | Mutation | Authed | Send message + trigger WebSocket event |
| `analytics` | `getDashboardKPIs` | Query | Admin | Revenue, members, orders summary |
| `analytics` | `getRevenueChart` | Query | Admin | Time-series revenue data |
| `ai` | `getSalesForcast` | Query | Admin | Cached forecast or trigger new prediction |
| `ai` | `getChurnRisk` | Query | Admin | Per-member churn scores |

---

## 12. Security & Authentication

### 12.1 Security Measures

| Layer | Measure | Implementation |
|:------|:--------|:-------------|
| **Authentication** | Password hashing | Argon2id (Better-Auth default) |
| **Sessions** | Server-side sessions | HTTP-only, Secure, SameSite=Lax cookies |
| **CSRF** | Cross-site request forgery | Built into Better-Auth + tRPC |
| **XSS** | Cross-site scripting | React auto-escaping + CSP headers |
| **SQL Injection** | Parameterized queries | Drizzle ORM (no raw string concat) |
| **Rate Limiting** | API abuse prevention | `@upstash/ratelimit` on auth + payment endpoints |
| **RBAC** | Role-based access | tRPC middleware procedures per role |
| **Input Validation** | Schema enforcement | Zod on all tRPC inputs + API routes |
| **Webhook Security** | Signature verification | Stripe `constructEvent()` + Razorpay signature verify |
| **File Uploads** | Type + size validation | Uploadthing server-side validation |
| **Environment** | Secret management | `.env.local` (gitignored) + platform env vars |
| **Headers** | Security headers | `next.config.mjs` security headers (HSTS, X-Frame-Options) |

### 12.2 RBAC Middleware Pattern

```typescript
// tRPC middleware for role checking
const isAdmin = t.middleware(async ({ ctx, next }) => {
  if (!ctx.session?.user) throw new TRPCError({ code: "UNAUTHORIZED" });
  if (!["admin", "owner"].includes(ctx.session.user.role)) {
    throw new TRPCError({ code: "FORBIDDEN" });
  }
  return next({ ctx: { ...ctx, user: ctx.session.user } });
});

const adminProcedure = t.procedure.use(isAdmin);
```

---

## 13. Deployment & Infrastructure

### 13.1 Recommended Deployment Stack

| Service | Provider | Purpose |
|:--------|:---------|:--------|
| **Next.js App** | Vercel | Frontend + BFF (zero-config Next.js hosting) |
| **PostgreSQL** | Neon (Serverless) or Supabase | Primary database with auto-scaling |
| **AI Service** | Railway / GCP Cloud Run | Containerized FastAPI |
| **WebSocket Server** | Railway / Fly.io | Soketi container |
| **Redis** | Upstash (Serverless) | Rate limiting + Celery broker |
| **File Storage** | Uploadthing / AWS S3 | Product images, equipment videos |
| **Email** | Resend | Transactional email delivery |
| **Monitoring** | Sentry | Error tracking + performance monitoring |
| **Analytics** | PostHog / Plausible | Privacy-friendly web analytics |

### 13.2 Local Development Stack (Docker Compose)

```yaml
# docker-compose.yml
services:
  postgres:
    image: postgres:16-alpine
    ports: ["5432:5432"]
    environment:
      POSTGRES_DB: forgefit
      POSTGRES_USER: forgefit
      POSTGRES_PASSWORD: localdev
    volumes: ["pgdata:/var/lib/postgresql/data"]

  redis:
    image: redis:7-alpine
    ports: ["6379:6379"]

  soketi:
    image: quay.io/soketi/soketi:latest
    ports: ["6001:6001", "9601:9601"]
    environment:
      SOKETI_DEFAULT_APP_ID: forgefit
      SOKETI_DEFAULT_APP_KEY: forgefit-key
      SOKETI_DEFAULT_APP_SECRET: forgefit-secret

volumes:
  pgdata:
```

---

## 14. Implementation Roadmap

### Phase 1: Foundation & Auth (Week 1–2)
- [ ] Initialize Next.js 14 project with TypeScript + TailwindCSS
- [ ] Configure ESLint, Prettier, Husky
- [ ] Install and configure shadcn/ui components
- [ ] Set up Drizzle ORM + PostgreSQL connection
- [ ] Implement database schema (all 10 modules)
- [ ] Run initial migrations + seed data
- [ ] Set up Better-Auth (login, register, email verify, 2FA)
- [ ] Implement RBAC middleware (admin vs. customer routes)
- [ ] Build auth pages (login, register, forgot password)
- [ ] Configure Docker Compose for local services

### Phase 2: Marketing & Public Pages (Week 2–3)
- [ ] Build landing page with hero video section
- [ ] Source and integrate Pexels/Coverr video assets
- [ ] Build pricing page with tier comparison
- [ ] Build about page with brand story
- [ ] Build contact form page
- [ ] Implement glassmorphic navbar + footer
- [ ] Add animations (Magic UI number tickers, bento grid)
- [ ] Responsive mobile optimization
- [ ] SEO metadata + Open Graph tags

### Phase 3: Admin Dashboard Core (Week 3–5)
- [ ] Build dashboard shell (sidebar, topbar, layout)
- [ ] Implement KPI cards with revenue, members, orders
- [ ] Build revenue trend charts (Recharts)
- [ ] Build membership distribution chart
- [ ] Build DataTable component (reusable across all modules)
- [ ] Member management (CRUD, search, filter)
- [ ] Membership plan management UI

### Phase 4: E-Commerce & Inventory (Week 5–7)
- [ ] Product catalog management (admin CRUD)
- [ ] Product variant management (flavor, size, price)
- [ ] Image upload integration (Uploadthing)
- [ ] Customer-facing shop (grid, filters, search)
- [ ] Product detail page with image gallery
- [ ] Shopping cart (persistent, server-side)
- [ ] Checkout flow (address, payment, confirmation)
- [ ] Order lifecycle management (admin)
- [ ] Inventory tracking + automatic stock deduction
- [ ] Low-stock alert system
- [ ] Product reviews & ratings

### Phase 5: Payments & EMI (Week 7–8)
- [ ] Stripe integration (subscriptions, one-time payments)
- [ ] Razorpay integration (EMI, UPI, net banking)
- [ ] Webhook handlers (idempotent processing)
- [ ] EMI plan creation and installment tracking
- [ ] Invoice generation (PDF)
- [ ] Refund processing flow
- [ ] Payment transaction history (admin)

### Phase 6: Equipment Guide & Chat (Week 8–9)
- [ ] Equipment catalog (admin CRUD)
- [ ] Equipment detail page (video player, usage guide)
- [ ] Muscle group filter system
- [ ] QR code generation per equipment
- [ ] Set up Soketi WebSocket server
- [ ] Build chat conversation list
- [ ] Build chat window (message bubbles, timestamps)
- [ ] Implement real-time message delivery
- [ ] Delivery receipts (sent, delivered, read)
- [ ] Typing indicators + online presence

### Phase 7: AI Integration & Analytics (Week 9–11)
- [ ] Deploy FastAPI microservice (Docker)
- [ ] Implement model registry + loader
- [ ] Build BaseModel interface for plug & play
- [ ] Integrate with Next.js via internal REST calls
- [ ] Admin analytics dashboard (full KPIs + charts)
- [ ] Attendance heatmap (Nivo)
- [ ] AI prediction cards on dashboard
- [ ] Sales forecast visualization
- [ ] Stock demand prediction alerts
- [ ] Churn risk member list with scores

### Phase 8: Notifications, Polish & Testing (Week 11–12)
- [ ] Set up Novu for multi-channel notifications
- [ ] Build in-app notification center
- [ ] React Email templates (welcome, receipt, renewal reminder)
- [ ] Dark mode polish (all components)
- [ ] Accessibility audit (WCAG 2.1 AA)
- [ ] Performance optimization (Core Web Vitals)
- [ ] Unit tests (Vitest)
- [ ] Integration tests (tRPC procedures)
- [ ] E2E tests (Playwright: auth flow, checkout, dashboard)
- [ ] Security audit (CSP headers, rate limiting)

### Phase 9: Deployment & Launch (Week 12–13)
- [ ] Set up production database (Neon/Supabase)
- [ ] Deploy Next.js to Vercel
- [ ] Deploy AI service to Railway/Cloud Run
- [ ] Configure Soketi on Railway/Fly.io
- [ ] Set up Sentry error monitoring
- [ ] Configure GitHub Actions CI/CD
- [ ] Production environment variables
- [ ] DNS + SSL configuration
- [ ] Load testing
- [ ] Launch 🚀

---

## 15. Open Questions for Review

> **Please review the following decisions and confirm or redirect before I proceed to the coding phase.**

### 🔶 Architecture Decisions

1. **Color Palette**: I've selected **"Atelier Basalt & Smoked Terracotta"** (warm charcoal + terracotta accent). Would you prefer one of the alternative palettes?
   - Option 2: **Nordic Alpine & Botanical Sage** (green/wellness focus)
   - Option 3: **Titanium Slate & Storm Indigo** (steel blue/executive feel)
   - Option 4: **Smoked Basalt & Velvet Mulberry** (deep plum/boutique luxury)

2. **Authentication**: I've chosen **Better-Auth** (open-source, self-hosted) over Clerk (managed). Better-Auth gives full control and zero per-user fees. Do you prefer managed auth (Clerk) instead?

3. **ORM**: I've selected **Drizzle ORM** over Prisma for its superior serverless performance (<5ms cold starts), SQL-like syntax, and TypeScript-native schemas. Confirm?

4. **Payment Gateways**: I've included both **Stripe** (global) and **Razorpay** (India). Should we support both simultaneously, or focus on one initially?

5. **Project Name**: I've named the project **"Forge Fit"**. Would you like a different name?

### 🔶 Feature Scoping

6. **Membership Tiers**: I've defined 4 tiers (Basic, Standard, Premium, VIP). The pricing shown is placeholder. Should we adjust the tier count or facilities?

7. **Trainer Role**: The schema supports a `trainer` role alongside `admin`, `owner`, `staff`, `customer`. Should trainers have their own dashboard section, or is this owner + customer only for MVP?

8. **QR Code Equipment Scanning**: This is an advanced feature. Should it be included in the MVP or deferred to Phase 2?

9. **Chat Scope**: Currently scoped as Owner ↔ Customer direct messaging. Should group chats or broadcast messaging be included in MVP?

10. **EMI Interest Handling**: For "No-Cost EMI" (gym subsidizes interest), should the system calculate and absorb the interest internally, or just support standard bank EMI pass-through?

### 🔶 Infrastructure

11. **Database Provider**: Neon (serverless PostgreSQL) vs. Supabase (PostgreSQL + extras like Realtime, Storage, Auth). Since we're using Better-Auth and Drizzle, Neon is lighter. Preference?

12. **Hosting**: Vercel for Next.js is recommended. Any preference for self-hosted alternatives (Coolify, Railway)?

---

> **⏸️ AWAITING YOUR APPROVAL** — No code will be written until you review and approve this blueprint. Please confirm the architecture, color palette, and scope decisions above. Feel free to modify any section.

