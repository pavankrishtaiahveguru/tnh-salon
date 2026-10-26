# The Nail Hue — Frontend

Customer-facing website and admin panel for **The Nail Hue**, a nail, hair & skin salon in Bengaluru with two branches (Indiranagar and Sarjapur Road). Built with **Next.js (App Router)**, **React 19** and **Tailwind CSS v4**, and backed by a separate Node.js/Express API (`tnh-backend`).

## Overview

This app is the entire frontend of the TNH platform:

- A **public salon website** — home, services catalogue with a WhatsApp booking flow, branch pages, gallery, academy, founder and privacy policy.
- An **admin panel** (`/admin`) — JWT-authenticated management of services, categories, branches and Excel catalogue import/export.

All catalogue content (services, categories, branches) is served from the backend API; static marketing copy lives in `src/data/`.

Catalogue media (category and service images) is stored in **Cloudflare R2** (bucket `tnh-service-media`) and served over HTTPS from an R2 public custom media domain. R2 replaced Cloudinary as the media storage provider; see [Cloudinary to Cloudflare R2 Migration](#cloudinary-to-cloudflare-r2-migration).

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
- Remote media is served from the configured **Cloudflare R2** public HTTPS domain; existing files under `public/` remain local

### Academy / Founder / Privacy
- Academy page with hero media carousel and enquiry section
- Founder page with per-route SEO metadata
- Privacy Policy page with canonical URL metadata

### Admin Panel (`/admin`)
- JWT login with backend session verification (`GET /api/auth/me`), route guard, and 401-aware API client
- Services CRUD with pagination, filters, status toggle and image upload to Cloudflare R2 (via the backend `POST /api/upload/image` endpoint)
- Categories CRUD including sub-categories and reorder
- Branch profile editing
- **Catalogue Excel import/export** — export the live catalogue as `.xlsx`, import it back with full server-side validation applied in one transaction

### Deterministic Chatbot
- Floating chat widget on every public page (`AiChatWidget`)
- Fully **local/deterministic** — runs entirely in the browser, no backend or external AI calls
- Guided booking flow: branch → category → sub-category → service → variant → date/time → name/phone → review → WhatsApp hand-off
- Salon locations flow with branch details and Google Maps links
- Typing indicator and error states

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
│   └── lib/                 # API client (api.js), services cache, chatbotService, admin/*
├── next.config.mjs          # Configured R2 image domain allow-list
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
| `/gallery` | Photo/video gallery (local and configured remote media) |
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

## Deterministic Chatbot

The chat widget is fully local/deterministic — it never calls the TNH backend for conversation and never contacts any external AI service:

```
Frontend (AiChatWidget) ──▶ local state machine (chatbotService.js)
        │                        │
        │                        ├── catalogue data via existing backend APIs
        │                        └── WhatsApp hand-off (wa.me, per-branch numbers)
```

- Booking flow: branch → category → sub-category → service → variant → multiple services → date/time → name/phone → review → WhatsApp
- Locations flow: branch details → Google Maps links
- Greetings and unsupported messages are handled locally with quick replies; no AI fallback exists

## Cloudinary to Cloudflare R2 Migration

The platform previously stored catalogue media in **Cloudinary**. Catalogue media is now stored in **Cloudflare R2** (bucket `tnh-service-media`). No Cloudinary SDK or Cloudinary dependency exists in either app.

### Why R2

- S3-compatible object storage in the same Cloudflare account/edge network already used to serve the site, with no egress fees and a custom HTTPS media domain.
- Direct control over the bucket, object keys (`categories/…`, `services/…`, `migration/…`) and cache headers.
- Verified uploads: every object is checked via SHA-256 metadata, a `HEAD`/`GET` round-trip in the bucket, a public-URL fetch and Content-Type match before the database is touched.

### How R2 is used

- **Backend (`tnh-backend`)** owns all R2 access. `src/services/r2Storage.js` builds an S3 client against `https://<R2_ACCOUNT_ID>.r2.cloudflarestorage.com`, validates configuration, scopes object keys to an allow-list of prefixes, and provides `uploadAndVerify`, `objectExists`, `deleteObject` and public-URL helpers used by the upload controller (`POST /api/upload/image`, `POST /api/upload/video`, `DELETE /api/upload/media`).
- **Frontend (`tnh-salon`)** has no R2 credentials and never talks to R2 directly. The admin panel uploads files to the backend, which returns `{ imageUrl, objectKey, publicId }`. `ImageUpload.jsx` previews through `getSafeMediaUrl` and cleans up pending uploads via `api.deleteMedia(objectKey)` when an image is removed or replaced before saving.
- **Database (Neon PostgreSQL)** records (`categories.image` / `categories.image_url`, `services.image` / `services.image_url`) store the **full public HTTPS media URL**. New uploads store R2 URLs of the form `<NEXT_PUBLIC_R2_PUBLIC_BASE_URL>/<type>/<slug>/<hash>.<ext>`.

### Frontend media URL validation (`NEXT_PUBLIC_R2_PUBLIC_BASE_URL`)

`src/lib/media.js` exports `getSafeMediaUrl`, used by every component that renders catalogue media:

- Relative paths starting with `/` (local `public/` assets) are returned unchanged.
- Remote URLs must be `https://`, must match the **origin** of `NEXT_PUBLIC_R2_PUBLIC_BASE_URL`, must sit under the configured base path, and must not contain query strings, fragments or credentials — any other hostname/protocol (including legacy Cloudinary URLs) returns `null` and is treated as *unavailable media*, not rendered as an image.
- `next.config.mjs` derives its `images.remotePatterns` allow-list from the same variable, so Next.js image optimisation and URL validation stay in sync.

If a stored URL is not renderable (for example a leftover Cloudinary URL while the env variable points to R2), components hide the image and the admin upload field shows: *"Existing media is unavailable at the configured media domain. Upload a verified replacement."*

### Migration tooling (backend)

The one-way migration of legacy Cloudinary media into R2 is driven by `tnh-backend/scripts/migrateMediaToR2.mjs`, which is idempotent, records progress in a manifest and never mutates the database without a verified R2 destination:

```bash
# Run inside tnh-backend/ (requires the backend DATABASE_URL and R2_* env vars)
npm run media:prepare     # scan the DB for Cloudinary references and build/update the manifest (no DB writes)
npm run media:migrate     # upload mapped sources to R2, verify them, then update DB references
npm run media:rollback    # restore original Cloudinary URLs for migrated references

# Additional script flags
node scripts/migrateMediaToR2.mjs --dry-run                     # validate mapped sources, no upload or DB writes
node scripts/migrateMediaToR2.mjs --migrate --source-map data/sources.json
node scripts/migrateMediaToR2.mjs --prepare --source-root ../tnh-salon/public
```

- Manifest: `tnh-backend/data/media-migration-manifest.json`. Each asset records its status (`source-available`, `needs-replacement`, `dry-run-source-validated`, `destination-verified`, `migrated`, `failed`, `rolled-back`) plus the affected database records.
- Tests: the backend test suite covers R2 configuration validation, object-key scoping, upload/deletion behaviour and public-URL mapping — run with `npm test` (node:test, `tests/*.test.js`, including `tests/r2Media.test.js`); also use `--dry-run` as a safe pre-flight check.

### Migration limitation — historical Cloudinary assets are **not** automatically migrated

- Re-pointing a database record requires its media to exist and be verified in R2 first. **The underlying Cloudinary image files are not copied for you automatically** — replacement media must be obtained, uploaded to R2, verified and then associated with the appropriate database records (via the migration script or by re-uploading the image from the admin panel).
- As of the latest manifest generation, **235 distinct Cloudinary assets are still referenced by the live database, no local source matches were found, and 235 replacement files are still needed** (`migrationStatus: "needs-replacement"`, `databaseModified: false`). The Cloudinary Admin API and public asset requests were unavailable (HTTP 401) during preparation, so no source bytes could be downloaded from Cloudinary.
- Every affected record is listed in the manifest with its table, record ID/slug, field and admin route, so replacement media can be located, uploaded to R2 and associated with the right records.

## Environment Variables

### Local environment files

- **Frontend (`tnh-salon`)** uses `.env.local` (git-ignored) for local development. A `.env.example` template with placeholder values is present in the project root.
- **Backend (`tnh-backend`)** uses `.env` (git-ignored), with a companion `.env.example` template in the backend project root.

Important: `NEXT_PUBLIC_*` variables are **public** and are **embedded into the client bundle at build time**, not read at runtime. If you change one of them you must restart `npm run dev`, or rebuild and redeploy (`npm run build` / deployment) for the change to take effect.

### Frontend variables (public — baked into the client bundle)

| Variable | Purpose | Example (placeholder) |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | Base URL of the TNH backend (e.g. `http://localhost:5001`) | `backend_url_here` |
| `NEXT_PUBLIC_SITE_URL` | Public site URL used for canonical links (defaults to `https://thenailhue.com`) | `https://www.example.com` |
| `NEXT_PUBLIC_R2_PUBLIC_BASE_URL` | HTTPS public media domain for the Cloudflare R2 bucket, used by `src/lib/media.js` to validate media URLs and by `next.config.mjs` to allow-list the image domain | `https://media.example.com` |

### Backend variables (server-side only — never add these to the frontend)

R2 storage credentials live only in the backend `.env` and are never exposed to the browser:

| Variable | Purpose | Example (placeholder) |
|---|---|---|
| `R2_ACCOUNT_ID` | Bare 32-character Cloudflare account ID used to build the S3 API endpoint (`https://<account>.r2.cloudflarestorage.com`) | `your_cloudflare_account_id` |
| `R2_ACCESS_KEY_ID` | R2 S3 access key ID (Cloudflare R2 tokens page) | `your_r2_access_key_id` |
| `R2_SECRET_ACCESS_KEY` | R2 S3 secret access key — secret, never commit | `your_r2_secret_access_key` |
| `R2_BUCKET_NAME` | R2 bucket that stores catalogue media (`tnh-service-media`) | `tnh-service-media` |
| `R2_PUBLIC_BASE_URL` | HTTPS public custom media domain for the bucket — **not** the S3 API endpoint | `https://media.example.com` |

The `.env.example` template files in both projects contain placeholder values only. Never put real credentials, or any `R2_*` variable, into the frontend environment.

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
- **Remote media is not shown** — set `NEXT_PUBLIC_R2_PUBLIC_BASE_URL` to the HTTPS R2 custom media domain used by the backend, then rebuild the frontend. Remote images from other hosts are intentionally not rendered; local `/public` assets remain available.
- **Admin redirected to login** — the JWT expired or `JWT_SECRET` changed on the backend. Sign in again.
- **Type errors around `env`** — environment variables are plain strings at runtime; check for typos between `.env.local` and the names referenced in `src/lib`.
- **Image upload fails with HTTP 503 / `R2_NOT_CONFIGURED`** — the backend's R2 configuration is invalid, missing, or uses the S3 API endpoint as `R2_PUBLIC_BASE_URL`. Check all five `R2_*` variables in the backend `.env` (`R2_ACCOUNT_ID` must be the bare 32-character account ID, `R2_PUBLIC_BASE_URL` the HTTPS public media domain, not `*.r2.cloudflarestorage.com`), then restart the backend.
- **Admin shows "Existing media is unavailable at the configured media domain"** — the stored URL is a legacy Cloudinary (or otherwise non-R2) URL, so `getSafeMediaUrl` rejects it. Upload a verified replacement image for that service/category from the admin panel (or migrate it via the backend migration script) and save.
- **Uploaded image doesn't appear on the public site** — verify `NEXT_PUBLIC_R2_PUBLIC_BASE_URL` in `.env.local` matches the backend's `R2_PUBLIC_BASE_URL` origin including any base path prefix, and rebuild/redeploy the frontend — `NEXT_PUBLIC_*` values are baked in at build time.
- **Media URLs point at Cloudinary** (`res.cloudinary.com/...`) — historical Cloudinary assets were not migrated automatically. Generate the migration manifest (`npm run media:prepare` in `tnh-backend`), supply replacement/verified source files, then run `media:migrate`; see the *Cloudinary to Cloudflare R2 Migration* section for status and limitations.
- **Migration fails or assets show `needs-replacement` in the manifest** — those assets have no verified source file. Map each asset's source file (via local media search roots or `--source-map`), re-run `media:migrate`, or upload the media directly through the admin panel. Use `--dry-run` first and `media:rollback` to restore Cloudinary URLs if a migration attempt must be undone.
