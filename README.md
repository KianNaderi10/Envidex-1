Link to demo: https://www.loom.com/share/d56b2c04a149444997668ce4c9e575a3

# Envidex

Envidex is a mobile-first AI-powered species identification app. Point your camera at any mammal, and Envidex identifies it, shows its conservation status, tells its story, and lets you build a personal field guide of everything you discover.

## Features

- **Live feed** — real-time camera with frame capture and ML model predictions
- **AI identification** — powered by the Anthropic API (Claude)
- **Field guide** — personal collection of discovered species with badges and stats
- **Daily & weekly challenges** — gamified discovery goals
- **Species profiles** — conservation status, habitat, threats, fun facts
- **Share discoveries** — generate shareable links via Vercel Blob
- **Auth** — email/password signup + Google and GitHub OAuth
- **Light & dark mode** — nature-inspired theme in both modes
- **Support conservation** — WWF donation link built in

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| UI | React 19, Tailwind CSS v4, shadcn/ui |
| Animations | Framer Motion |
| State | Zustand (with localStorage persistence) |
| Auth | NextAuth.js v4 + MongoDB adapter |
| Database | MongoDB Atlas |
| AI | Anthropic API via Vercel AI SDK |
| Storage | Vercel Blob |
| ML backend | Python service (port 8000, proxied via `/api/predict`) |
| Deployment | Vercel |

## Open Source Libraries

| Library | Purpose |
|---|---|
| [Next.js](https://nextjs.org) | React framework with App Router and Turbopack |
| [React](https://react.dev) | UI layer |
| [Tailwind CSS](https://tailwindcss.com) | Utility-first styling |
| [shadcn/ui](https://ui.shadcn.com) | Accessible component primitives |
| [Radix UI](https://radix-ui.com) | Headless UI primitives (Avatar, Dialog, Tabs, etc.) |
| [Framer Motion](https://www.framer.com/motion) | Animations and transitions |
| [Zustand](https://zustand-demo.pmnd.rs) | Lightweight state management |
| [NextAuth.js](https://next-auth.js.org) | Authentication |
| [Vercel AI SDK](https://sdk.vercel.ai) | Anthropic API integration |
| [lucide-react](https://lucide.dev) | Icon library |
| [canvas-confetti](https://github.com/catdad/canvas-confetti) | Confetti on species collection |
| [bcryptjs](https://github.com/dcodeIO/bcrypt.js) | Password hashing |
| [nanoid](https://github.com/ai/nanoid) | Share ID generation |
| [clsx](https://github.com/lukeed/clsx) + [tailwind-merge](https://github.com/dcastil/tailwind-merge) | Conditional class utilities |
| [zod](https://zod.dev) | Schema validation |
| [tw-animate-css](https://github.com/jamiebuilds/tailwindcss-animate) | CSS animation utilities |

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Set the following values:

```
MONGODB_URI_REAL=        # MongoDB Atlas or self-hosted connection string
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=         # Long random secret (use: openssl rand -base64 32)
ANTHROPIC_API_KEY=       # From console.anthropic.com
BLOB_READ_WRITE_TOKEN=   # From Vercel dashboard (Storage → Blob)

# Optional — OAuth providers
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
```

### 3. OAuth callback URLs (if using OAuth)

- Google: `http://localhost:3000/api/auth/callback/google`
- GitHub: `http://localhost:3000/api/auth/callback/github`

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## API Routes

| Route | Method | Description |
|---|---|---|
| `/api/auth/signup` | POST | Email/password registration |
| `/api/auth/[...nextauth]` | ANY | NextAuth session handling |
| `/api/identify` | POST | AI species identification (Anthropic) |
| `/api/predict` | POST | ML model prediction (proxies to Python backend) |
| `/api/scans` | POST | Save scan to Vercel Blob for sharing |
| `/api/user` | GET/PATCH | User profile operations |

## Pages

| Route | Description |
|---|---|
| `/` | Home — challenges, recent discoveries, donation |
| `/live-feed` | Live camera feed with ML predictions |
| `/collection` | Personal field guide |
| `/species/[id]` | Species detail page |
| `/share/[shareId]` | Public shared discovery |
| `/profile` | Badges, stats, streaks |
| `/login` `/signup` | Authentication |
| `/settings` `/settings/account` | Account settings |
| `/privacy` `/terms` | Legal pages |
