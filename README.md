# TNH Salon

A modern, responsive salon website built with **Next.js (App Router)**, **React 19**, and **Tailwind CSS v4**. It features branch pages, a service catalog with booking flow, a gallery, and founder/brand pages.

## Tech Stack

- **Framework:** Next.js 16 (App Router, React Compiler)
- **UI:** React 19
- **Styling:** Tailwind CSS v4
- **Animations:** Framer Motion
- **Icons:** Lucide React, React Icons

## Getting Started

Install dependencies and run the development server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the result.

### Other Scripts

| Command         | Description                  |
| --------------- | ---------------------------- |
| `npm run dev`   | Start the development server |
| `npm run build` | Build for production         |
| `npm run start` | Start the production server  |
| `npm run lint`  | Run ESLint                   |

## Project File Structure

```
tnh-salon/
├── public/                          # Static assets served at the root
│   ├── images/
│   │   ├── about/
│   │   │   └── salon.jpg            # About section image
│   │   ├── branches/
│   │   │   ├── branch-hero.jpg      # Branch page hero image
│   │   │   ├── indiranagar-about.jpg
│   │   │   └── sarjapur-about.jpg
│   │   └── gallery/
│   │       ├── hair.jpg
│   │       ├── hair2.jpg
│   │       ├── hair3.jpg
│   │       ├── hair4.jpg
│   │       └── nail.jpg
│   ├── logo/
│   │   └── logo.jpg
│   ├── videos/
│   │   └── salon-1.mp4              # Hero background video
│   └── staffarc-logo.avif
│
├── src/
│   ├── app/                         # Next.js App Router pages & layouts
│   │   ├── branches/
│   │   │   ├── indiranagar/
│   │   │   │   └── page.jsx         # Indiranagar branch page
│   │   │   └── sarjapur/
│   │   │       └── page.jsx         # Sarjapur branch page
│   │   ├── founder/
│   │   │   └── page.jsx             # Founder page
│   │   ├── gallery/
│   │   │   └── page.jsx             # Gallery page
│   │   ├── services/
│   │   │   └── page.jsx             # Services & booking page
│   │   ├── globals.css              # Global styles (Tailwind entry)
│   │   ├── layout.js                # Root layout (Navbar, Footer, fonts)
│   │   ├── logo.png
│   │   ├── not-found.jsx            # Custom 404 page
│   │   └── page.js                  # Home page
│   │
│   ├── components/
│   │   ├── branches/                # Branch page section components
│   │   │   ├── BranchAbout.jsx
│   │   │   ├── BranchCTA.jsx
│   │   │   ├── BranchHero.jsx
│   │   │   ├── BranchLocation.jsx
│   │   │   └── BranchStats.jsx
│   │   ├── common/                  # Shared components
│   │   │   ├── Testimonials.jsx
│   │   │   └── WhatsAppButton.jsx
│   │   ├── home/                    # Home page sections
│   │   │   ├── about.jsx
│   │   │   ├── BranchLocations.jsx
│   │   │   ├── Hero.jsx
│   │   │   └── Services.jsx
│   │   ├── layout/                  # Global layout components
│   │   │   ├── Footer.jsx
│   │   │   └── Navbar.jsx
│   │   ├── services/                # Services & booking components
│   │   │   ├── AllServices.jsx
│   │   │   ├── Bookingconfirmation.jsx
│   │   │   ├── BookingModal.jsx
│   │   │   ├── PendingBookingBar.jsx
│   │   │   ├── ServiceCard.jsx
│   │   │   ├── ServiceCategorySelector.jsx
│   │   │   ├── ServiceCategorySidebar.jsx
│   │   │   ├── ServiceFilters.jsx
│   │   │   ├── ServicesCategories.jsx
│   │   │   ├── ServicesHero.jsx
│   │   │   ├── StudioSelectionModal.jsx
│   │   │   ├── bookingUtils.js      # Booking helper functions
│   │   │   └── servicesData.js      # Services page data
│   │   └── DevelopedByStaffArc.jsx  # Credits/branding component
│   │
│   └── data/                        # Static data sources
│       ├── branches.js              # Branch information
│       ├── popularServices.js       # Popular services list
│       ├── serviceCategories.js     # Service categories
│       └── services.js              # Full services catalog
│
├── eslint.config.mjs                # ESLint configuration
├── jsconfig.json                    # Path aliases (@/*)
├── next.config.mjs                  # Next.js configuration
├── package.json
└── postcss.config.mjs               # PostCSS (Tailwind v4) configuration
```

## Pages

| Route                     | Description                        |
| ------------------------- | ---------------------------------- |
| `/`                       | Home — hero, about, services, branches |
| `/services`               | Service catalog with booking flow  |
| `/branches/indiranagar`   | Indiranagar branch details         |
| `/branches/sarjapur`      | Sarjapur branch details            |
| `/gallery`                | Photo gallery                      |
| `/founder`                | About the founder                  |

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Framer Motion Documentation](https://motion.dev/docs/react)
