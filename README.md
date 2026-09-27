# ForgeFit — Premium Gym Management & E-Commerce Platform

A full-stack web application for gyms combining member management, workout and nutrition tracking, an AI-assisted coaching layer, and an integrated e-commerce storefront.

## Features

- **Member & owner dashboards** — role-based views for gym owners and members
- **Workout & progress tracking** — logs, heatmaps, and analytics (Nivo charts)
- **AI coaching service** — a companion Python/FastAPI service (`ai-service/`) providing ML-driven recommendations, backed by OpenRouter-hosted models
- **E-commerce storefront** — product catalog and checkout flow for gym merchandise/supplements
- **Authentication** — session-based auth via Better Auth

## Tech Stack

**Web app**
- Next.js (App Router), TypeScript, React
- Drizzle ORM with an embedded Postgres engine (PGlite) for local/dev data
- Radix UI primitives, Tailwind-based styling
- Vitest for unit tests, Playwright for end-to-end tests

**AI service**
- Python, FastAPI (`ai-service/app`)
- ML model artifacts under `ai-service/ml_models`

## Getting Started

```bash
npm install
cp .env.example .env.local   # fill in your own local secrets — never commit this file
npm run db:setup             # generate & seed the local database
npm run dev
```

The app runs at `http://localhost:3000` by default.

### Environment Variables

Copy `.env.example` to `.env.local` and provide your own values (auth secret, app URL, AI provider API key, etc.). No real credentials are committed to this repository — `.env*` files are git-ignored.

### Running Tests

```bash
npm test          # unit tests (Vitest)
npm run test:e2e  # end-to-end tests (Playwright)
```

## Project Structure

```
├── src/
│   ├── app/            # Next.js routes
│   ├── components/     # UI components
│   └── server/          # Server logic, database schema & seed data
├── ai-service/          # Python FastAPI microservice for AI-driven coaching
├── data/                # Local embedded database (git-ignored)
└── tests/               # Unit & e2e tests
```

## Note on Demo Data

The seed script creates demo accounts (`owner@forgefit.com`, `member@forgefit.com`) purely for local development and UI testing. These are fixture credentials, not real user data, and should be replaced or removed before any production deployment.

## License

This project is private and intended for portfolio/demonstration purposes.
