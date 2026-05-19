# Deploy to Cloudflare Workers

This app uses **[@opennextjs/cloudflare](https://opennext.js.org/cloudflare)** and **Cloudflare D1** (SQLite at the edge). Local file SQLite does not work on Workers.

## Prerequisites

1. [Cloudflare account](https://dash.cloudflare.com/sign-up) (free tier works)
2. Node.js 18+
3. Log in to Wrangler:

```bash
npx wrangler login
```

## 1. Install dependencies

```bash
npm install
```

## 2. Create D1 database

```bash
npx wrangler d1 create betting-data-db
```

Copy the `database_id` from the output into `wrangler.jsonc`:

```jsonc
"database_id": "YOUR_DATABASE_ID_HERE"
```

## 3. Apply database migrations

**Local (preview):**

```bash
npx wrangler d1 migrations apply betting-data-db --local
```

**Production (remote):**

```bash
npx wrangler d1 migrations apply betting-data-db --remote
```

## 4. Seed super admin on D1

```bash
node scripts/generate-seed-sql.mjs
npx wrangler d1 execute betting-data-db --remote --file=scripts/seed_superadmin.sql
```

Default login: `superadmin` / `SuperAdmin123!` — change after first login.

## 5. Set secrets (production)

```bash
npx wrangler secret put NEXTAUTH_SECRET
# paste a long random string (openssl rand -base64 32)

npx wrangler secret put NEXTAUTH_URL
# paste your deployed URL, e.g. https://betting-data-pwa.your-subdomain.workers.dev
```

Optional seed overrides:

```bash
npx wrangler secret put SEED_SUPER_ADMIN_USERNAME
npx wrangler secret put SEED_SUPER_ADMIN_PASSWORD
```

## 6. Preview locally (Workers runtime)

```bash
cp .dev.vars.example .dev.vars
# edit .dev.vars — set NEXTAUTH_SECRET

npx wrangler d1 migrations apply betting-data-db --local
node scripts/generate-seed-sql.mjs
npx wrangler d1 execute betting-data-db --local --file=scripts/seed_superadmin.sql

npm run preview:cf
```

Open **http://localhost:8787** (Wrangler default).

## 7. Deploy

```bash
npm run deploy:cf
```

Wrangler prints your live URL (e.g. `https://betting-data-pwa.<account>.workers.dev`).

Update `NEXTAUTH_URL` secret to match that URL exactly (including `https`).

## 8. Git integration (optional)

1. Push code to GitHub/GitLab
2. Cloudflare Dashboard → **Workers & Pages** → **Create** → connect repo
3. Build command: `npm run deploy:cf` or use Workers Builds with:
   - Build: `npx opennextjs-cloudflare build`
   - Deploy via Wrangler in CI

Set the same secrets in the dashboard under **Settings → Variables**.

## Local dev vs Cloudflare

| Command | Use case |
|---------|----------|
| `npm run dev` | Fast Next.js dev (port 5000, local SQLite file) |
| `npm run preview:cf` | Test in real Workers runtime + local D1 |
| `npm run deploy:cf` | Production deploy |

## PWA on Cloudflare

The PWA (manifest + service worker) is included. Users can install from Chrome/Edge on your `https://` Workers URL.

## Troubleshooting

| Issue | Fix |
|-------|-----|
| `database_id` invalid | Run `wrangler d1 create` and update `wrangler.jsonc` |
| Auth redirect loop | `NEXTAUTH_URL` must match deployed URL exactly |
| 500 on API routes | Check D1 migrations applied (`--remote`) and seed ran |
| Build fails | Node 18+, delete `.open-next` and rebuild |

## Files added for Cloudflare

- `wrangler.jsonc` — Worker + D1 binding
- `open-next.config.ts` — OpenNext adapter config
- `migrations/` — D1 SQL migrations
- `src/lib/prisma.ts` — D1 adapter via `getPrisma()`
