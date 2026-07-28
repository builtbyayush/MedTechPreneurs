# Splice — MedTech Co-Founder Matching

Splice is a Next.js PWA for MedTechPreneurs: a swipe-style co-founder discovery app for Indian healthcare and MedTech founders.

See `SPLICE_DEV_REFERENCE.md` for the full product spec and build phases.

## Getting Started

1. Copy `.env.local.example` to `.env.local` and set `MONGODB_URI`, `AUTH_SECRET`, and related values.
2. Install dependencies and run the dev server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Development Seeding

Seed realistic founders, discovery actions, and mutual matches for local testing:

```bash
npm run seed
```

Clear existing `@splice.dev` seed data first:

```bash
npm run seed -- --clear
```

The command is idempotent — re-running updates existing seed users instead of duplicating them.

### Demo accounts

All demo accounts use the password **`Password@123`**.

| Email | Role | Notes |
| --- | --- | --- |
| `doctor@splice.dev` | Doctor | Matched with `engineer@splice.dev`; seeded chat thread |
| `engineer@splice.dev` | Engineer | Matched with `doctor@splice.dev`; seeded chat thread |
| `business@splice.dev` | Business | Matched with `researcher@splice.dev` |
| `researcher@splice.dev` | Researcher | Matched with `business@splice.dev` |
| `investor@splice.dev` | Investor | One-sided connect to `doctor@splice.dev` |

After seeding, log in as any demo account to browse Discover, view Matches, or open **Messages** for seeded conversations.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run seed` | Seed development data |

## Deployment (Hostinger / VPS)

**Run production mode only.** Never expose `npm run dev` on your public domain — dev/turbopack chunk names change between restarts, which causes `/_next/static/chunks/turbopack-*.js` 404 errors for anyone with cached HTML.

Recommended deploy flow on the server:

```bash
git pull
npm ci
npm run build
# restart the process manager running production (examples):
pm2 restart splice
# or: systemctl restart splice
```

The process must run **`npm run start`** (`next start`), not `npm run dev`.

After each deploy:

1. Restart the Node process so it serves the new `.next` build output.
2. Upload/sync the full `.next` folder if you build elsewhere — missing static files also cause chunk 404s.
3. If users still see a blank page, ask them to hard-refresh (Ctrl+Shift+R) or clear site data for the domain once.

Environment notes:

- **Do not set `NODE_ENV` in your hosting env panel or `.env` files.** If it is set to `development` during `npm run build`, the build fails with `Cannot read properties of null (reading 'useContext')` while prerendering pages.
- Remove `NODE_ENV` from Hostinger environment variables if present; `npm run build` forces `production` for the build step.
- Set production values for `MONGODB_URI`, `AUTH_SECRET` (32+ characters), `AUTH_URL`, and `NEXT_PUBLIC_APP_URL` before deploying.

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Splice Dev Reference](./SPLICE_DEV_REFERENCE.md)
