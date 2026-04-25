# Envidex

Envidex is a Next.js app for species discovery. It now includes:

- OAuth login (Google + GitHub)
- Email/password account creation
- MongoDB-backed user and session storage

## 1) Install dependencies

```bash
npm install
```

## 2) Configure environment variables

Copy `.env.example` to `.env.local`:

```bash
copy .env.example .env.local
```

Set these values in `.env.local`:

- `MONGODB_URI`: your own MongoDB instance connection string (Atlas or self-hosted)
- `NEXTAUTH_URL`: `http://localhost:3000` for local dev
- `NEXTAUTH_SECRET`: long random secret
- `GOOGLE_CLIENT_ID` + `GOOGLE_CLIENT_SECRET` (optional, for Google OAuth)
- `GITHUB_CLIENT_ID` + `GITHUB_CLIENT_SECRET` (optional, for GitHub OAuth)

## 3) OAuth callback URLs

If you enable OAuth providers, configure these redirect URLs:

- Google: `http://localhost:3000/api/auth/callback/google`
- GitHub: `http://localhost:3000/api/auth/callback/github`

## 4) Run the app

```bash
npm run dev
```

Then open `http://localhost:3000`.

## Auth routes/pages

- Login page: `/login`
- Account creation page: `/signup`
- NextAuth endpoint: `/api/auth/[...nextauth]`
- Signup API endpoint: `/api/auth/signup`

