# The Nail Hue — Frontend

Customer-facing website and admin panel for **The Nail Hue**, a nail, hair & skin salon in Bengaluru with two branches (Indiranagar and Sarjapur Road). Built with **Next.js (App Router)**, **React 19** and **Tailwind CSS v4**, and backed by a separate Node.js/Express API (`tnh-backend`).

## Overview

This app is the entire frontend of the TNH platform:

- A **public salon website** — home, services catalogue with a WhatsApp booking flow, branch pages, gallery, academy, founder and privacy policy.
- An **admin panel** (`/admin`) — JWT-authenticated management of services, categories, branches and Excel catalogue import/export.

All catalogue content (services, categories, branches) is served from the backend API; static marketing copy lives in `src/data/`.

## Features

### Website & Navigation
- Home page: hero (background video), services preview, branch locations, about, testimonials, FAQs
- Sticky responsive navbar with branch navigation, custom 404 page, footer
- Scroll-smooth navigation and responsive desktop/tablet/mobile layouts

### Services
- Live catalogue served from the backend API with a 60s client-side cache, in-flight de-duplication and prefetching (`src/lib/services.js`)
- Category tiles and **sub-category** chips with server-computed facet counts
- Filters: search (debounced, URL-driven), branch, gender/audience, price range, sort (menu order, name, price)
- Server-side **pagination** (24 per page) with "View More" appending
- Service cards with pricing variants (fixed / size-based / variant / from pricing), images and durations
- Total active-service count endpoint powering the hero stat (constant regardless of filters)

### Booking
- Multi-step booking flow: studio (branch) selection → service selection ("Add another service" across the full active catalogue) → customer details → confirmation
- Variant selection with computed booking totals and validation
- **Booking is submitted via WhatsApp**: a formatted message is built per branch and opened with `wa.me` — there is no booking database write from this app
- Pending-booking bar and per-branch WhatsApp numbers

### Branches
- Dedicated pages for **Indiranagar** and **Sarjapur Road** (hero, about, location with embedded Google Maps iframe, CTA)
- Branch contact details (address, phone, email, hours)

### Gallery
- Categorised photo/video grid (hair, nails, skin, BTS) with filter chips
- Media hosted on **Cloudinary**; videos and images loaded via `next/image`

### Academy / Founder / Privacy
- Academy page with hero media carousel and enquiry section
- Founder page with per-route SEO metadata
- Privacy Policy page with canonical URL metadata

### Admin Panel (`/admin`)
- JWT login with backend session verification (`GET /api/auth/me`), route guard, and 401-aware API client
- Services CRUD with pagination, filters, status toggle and image upload to Cloudinary
- Categories CRUD including sub-categories and reorder
- Branch profile editing
- **Catalogue Excel import/export** — export the live catalogue as `.xlsx`, import it back with full server-side validation applied in one transaction

### AI Assistant
- Floating AI chat widget on every public page (`AiChatWidget`)
- Talks **only to the TNH backend** — never to Cheerio directly
- Conversation **history** and **collectedData** sent with every message, **quick replies** rendered as tappable chips, multiple `answers` rendered as separate bubbles
- Typing indicator, loading and error states; error messages mapped from API status codes

### Communication
- **WhatsApp** floating button and per-branch WhatsApp booking
- **Instagram** floating button
- Embedded **Google Maps** iframes on branch and home sections

### SEO & Metadata
- Root metadata (title template, description, authors, robots, **Open Graph**) in `src/app/layout.js`
- Per-page `metadata` exports (home, branches, privacy policy) and server layouts for client pages (services, gallery, academy)
- Site icons from `/logo/logo.jpg`; canonical URL support via `NEXT_PUBLIC_SITE_URL`

### UI & Animations
- Tailwind CSS v4 with custom brand palette
- Framer Motion is installed as a dependency (no `motion` import was found in the current source)
- Icons: **Lucide React** and **React Icons**
- Skeleton loaders for services, categories and admin tables

## Tech Stack

Confirmed from `package.json` and source imports:

| Layer | Technology |
|---|---|
| Framework | [Next.js](https://nextjs.org) 16 (App Router, React Compiler via `babel-plugin-react-compiler`) |
| UI | React 19 |
| Styling | Tailwind CSS v4 (`@tailwindcss/postcss`) |
| Icons | Lucide React, React Icons |
| Linting | ESLint 9 + `eslint-config-next` |
| Language | JavaScript (JSX) |

Also installed but **not imported anywhere in the current source**: `framer-motion`, `exceljs`. The app uses the native `fetch` API — no Axios.

## Project Structure

```
tnh-salon/
├── public/                  # Static assets (logo, images, academy/founder media)
├── src/
│   ├── app/
│   │   ├── (public)/        # Customer website (Navbar/Footer/FloatingButtons layout)
│   │   ├── admin/           # Admin panel (own layout + auth guard)
│   │   ├── layout.js        # Root layout, fonts, global metadata
│   │   ├── not-found.jsx    # Custom 404
│   │   └── globals.css      # Tailwind entry
│   ├── components/
│   │   ├── admin/           # Admin tables, forms, modals, upload, toast
│   │   ├── branches/        # Branch page sections (hero, about, location, CTA)
│   │   ├── common/          # AiChatWidget, FloatingButtons, Testimonials
│   │   ├── home/            # Hero, Services, BranchLocations, About, FAQs
│   │   ├── layout/          # Navbar, Footer
│   │   ├── privacy/         # Privacy policy content
│   │   └── services/        # Catalogue grid, filters, booking modal + utils
│   ├── data/                # Static marketing data (branches, categories, popular services)
│   └── lib/                 # API client (api.js), services cache, aiAgent, admin/*
├── next.config.mjs          # Cloudinary image domain allow-list
├── jsconfig.json            # @/* path alias
├── package.json
└── postcss.config.mjs
```

## Routes / Pages

Verified against `src/app`:

| Route | Description |
|---|---|
| `/` | Home — hero, services preview, branches, about, testimonials, FAQs |
| `/services` | Services catalogue with filters, pagination and booking flow |
| `/branches/indiranagar` | Indiranagar branch page |
| `/branches/sarjapur` | Sarjapur Road branch page |
| `/gallery` | Photo/video gallery (Cloudinary media) |
| `/academy` | Academy / courses page |
| `/founder` | Founder page |
| `/privacy-policy` | Privacy policy |
| `/admin/login` | Admin login |
| `/admin` | Admin dashboard |
| `/admin/services` (+ `new`, `[id]`) | Services management |
| `/admin/categories` (+ `new`, `[id]`, `[id]/view`) | Categories management |
| `/admin/branches` | Branch profile editing |
| `/admin/import-export` | Catalogue Excel import/export |

There is no `/book` route — booking happens inline on `/services` via a modal and WhatsApp.

## API Integration

All backend calls go through the shared client in `src/lib/api.js`:

- Base URL comes from `NEXT_PUBLIC_API_URL` — no hardcoded backend URLs
- Methods: `api.get/post/put/patch/delete` plus `api.uploadImage` (multipart)
- Authenticated admin requests automatically attach `Authorization: Bearer <token>` from the session store
- A 401 on any authenticated request clears the admin session globally
- Errors are normalised to a typed `ApiError` (`status`, optional row-level `errors`) with user-friendly messages — no backend internals are exposed
- `src/lib/services.js` adds a 60s TTL cache, in-flight de-duplication and bounded memory for catalogue reads

## AI Assistant

Architecture — the frontend never contacts Cheerio and never sees its credentials:

```
Frontend (AiChatWidget)
        │  POST /api/ai-agent/interact
        ▼
TNH Backend (tnh-backend)
        │  server-side API key
        ▼
Cheerio AI Agent
        │
        ▼
TNH Backend  ──▶  mapped JSON response ──▶  Frontend
```

- The widget sends `{ question, history, collectedData }` and receives `{ answer, answers, quickReplies, context, collectedData, products }`
- History excludes error messages; `collectedData` is merged with each response and re-sent on the next turn
- `tokenUsage` from the AI provider is stripped by the backend before it reaches the frontend

## Environment Variables

Frontend variables (public — baked into the client bundle):

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_API_URL` | Base URL of the TNH backend (e.g. `http://localhost:5001`) |
| `NEXT_PUBLIC_SITE_URL` | Public site URL used for canonical links (defaults to `https://thenailhue.com`) |

`NEXT_PUBLIC_API_URL` is the only variable in the committed `.env.example`. `.env` / `.env.local` are git-ignored.

## Installation

```bash
npm install
```

## Development

```bash
npm run dev
```

The app runs at `http://localhost:3000`. Start the backend first (`tnh-backend`) so the catalogue loads.

Other scripts:

| Command | Description |
|---|---|
| `npm run build` | Production build |
| `npm start` | Start the production server |
| `npm run lint` | Run ESLint |

## Production Build

```bash
npm run build
npm start
```

## Deployment

Vercel is the intended hosting platform (the project owner has a Vercel account and `.vercel` is git-ignored), but **no deployment configuration file is present in the repository** — deployment settings are not confirmed from the current codebase.

## Troubleshooting

- **"API URL is not configured"** — set `NEXT_PUBLIC_API_URL` in `.env.local` and restart `npm run dev`. Next.js only reads env files at startup.
- **Catalogue/network errors on `/services`** — the backend is probably not running or unreachable. Start `tnh-backend` and verify the health check (`GET /health` on the backend URL).
- **CORS errors in the browser console** — the backend allow-lists a single origin via its `CLIENT_URL` env var. It must exactly match the frontend origin, including port and protocol.
- **Images fail to load** — Cloudinary images are restricted by hostname in `next.config.mjs` (`res.cloudinary.com/eumjdehq/**`). Image file names are case-sensitive in production; verify paths and extensions.
- **Admin redirected to login** — the JWT expired or `JWT_SECRET` changed on the backend. Sign in again.
- **Type errors around `env`** — environment variables are plain strings at runtime; check for typos between `.env.local` and the names referenced in `src/lib`.
