# Betting Data Entry PWA

A production-ready Progressive Web App for betting/data entry with three roles: **Super Admin**, **Admin**, and **User**.

## Tech stack

| Layer | Technology |
|--------|------------|
| Frontend | Next.js 15 (App Router), TypeScript, Tailwind CSS, shadcn-style UI |
| Backend | Next.js API Routes |
| Database | Prisma + SQLite (local) — PostgreSQL/Supabase ready |
| Auth | NextAuth.js (credentials) |
| PWA | Serwist (service worker + manifest) |
| State | Zustand |

## Folder structure

```
betting-data-pwa/
├── prisma/
│   ├── schema.prisma      # User, Entry, Message models
│   └── seed.ts            # Creates default super admin
├── public/
│   ├── manifest.json      # PWA manifest
│   └── icons/             # 192 & 512 PNG icons
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/[...nextauth]/
│   │   │   ├── entries/           # CRUD entries
│   │   │   ├── users/             # User management
│   │   │   ├── messages/          # Admin → Super Admin messages
│   │   │   └── stats/             # Dashboard aggregates
│   │   ├── dashboard/
│   │   │   ├── user/              # User: submit + history
│   │   │   ├── admin/             # Admin: users, filters, data
│   │   │   │   └── message/       # Admin message to super admin
│   │   │   └── super-admin/       # Overview, users, messages
│   │   ├── login/
│   │   ├── layout.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── entries/               # Form + table
│   │   ├── layout/                # Sidebar shell
│   │   └── ui/                    # shadcn primitives
│   ├── lib/                       # Auth, Prisma, validation
│   ├── store/                     # Zustand (toasts, sidebar, unread)
│   ├── middleware.ts              # RBAC route protection
│   └── sw.ts                      # Service worker (Serwist)
├── .env.example
├── next.config.ts
└── package.json
```

## Role capabilities

| Feature | User | Admin | Super Admin |
|---------|------|-------|-------------|
| Submit entries | ✅ | — | — |
| Edit own entries | If allowed | — | — |
| View own history | ✅ | — | — |
| Create/delete users | — | Own users only | All admins & users |
| Toggle user edit permission | — | ✅ | ✅ |
| Filter data by date/user | — | Own users | All |
| Message super admin | — | ✅ | — |
| Read admin messages | — | — | ✅ + unread badge |
| Reset passwords | — | Own users | All |

## Quick start (local)

### 1. Install dependencies

```bash
npm install
```

### 2. Environment

```bash
cp .env.example .env
```

Edit `.env` — set a strong `NEXTAUTH_SECRET` for production:

```bash
openssl rand -base64 32
```

### 3. Database

```bash
npx prisma db push
npm run db:seed
```

Default super admin (from `.env`):

- **Username:** `superadmin`
- **Password:** `SuperAdmin123!`

### 4. PWA icons (optional but recommended)

Add `public/icons/icon-192.png` and `public/icons/icon-512.png`. See `public/icons/README.md`.

### 5. Run

```bash
npm run dev
```

Open [http://localhost:5000](http://localhost:5000).

### 6. Production build

```bash
npm run build
npm start
```

Service worker is **enabled in production** (`next build`). In dev it is disabled for easier debugging.

## Deploy to Cloudflare

See **[DEPLOY_CLOUDFLARE.md](./DEPLOY_CLOUDFLARE.md)** for full steps (D1 database, Wrangler, secrets, `npm run deploy:cf`).

Quick summary:

```bash
npx wrangler login
npx wrangler d1 create betting-data-db   # copy database_id into wrangler.jsonc
npm run db:migrate:remote
npm run db:seed:remote
npx wrangler secret put NEXTAUTH_SECRET
npx wrangler secret put NEXTAUTH_URL
npm run deploy:cf
```

## Using PostgreSQL / Supabase

1. Change `prisma/schema.prisma`:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

2. Set `DATABASE_URL` in `.env`:

```
DATABASE_URL="postgresql://user:pass@host:5432/dbname?schema=public"
```

3. Run:

```bash
npx prisma db push
npm run db:seed
```

## Entry fields

| Field | Type | Notes |
|-------|------|-------|
| Date | date | Defaults to today |
| System | number | |
| Online | number | |
| Number | number | Defaults to **0** if empty |
| Bonus | number | |
| Win | number | |
| Cash | number | |
| Note | textarea | Optional |

## Security notes

- Passwords hashed with **bcrypt** (12 rounds)
- JWT sessions via NextAuth
- API routes enforce role checks server-side
- Middleware protects `/dashboard/*` routes
- Change default super admin password immediately in production
- Use HTTPS in production for PWA install + secure cookies

## PWA (Progressive Web App)

This app is a full PWA with:

- **Web app manifest** — `src/app/manifest.ts` (served at `/manifest.webmanifest`)
- **Service worker** — Serwist (`src/sw.ts` → `public/sw.js`)
- **Offline fallback** — `/~offline` when navigation fails without network
- **Install prompt** — banner on supported browsers (Chrome, Edge, etc.)
- **Icons** — `public/icons/icon-192.png` & `icon-512.png` (run `npm run icons`)

### Test locally

```bash
npm run icons          # generate icons if missing
npm run dev            # SW enabled in dev (Serwist disable: false)
```

Open **http://localhost:5000** → DevTools → **Application** → Manifest / Service Workers.

For production:

```bash
npm run build && npm start
```

### Install on device

1. Use **HTTPS** in production (localhost is fine for dev).
2. Chrome/Edge: address bar → **Install BetData** (or use the in-app install banner).
3. iOS Safari: **Share** → **Add to Home Screen**.

API calls (login, save entries) still need network; static UI and cached pages work offline.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Development server |
| `npm run build` | Production build + Prisma generate |
| `npm run db:push` | Sync schema to DB |
| `npm run db:seed` | Create super admin |
| `npm run db:studio` | Prisma Studio GUI |

## License

MIT — use freely for your project.
