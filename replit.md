# Student Lost & Found Portal

A full-stack web application for university students to post and browse lost and found items on campus. Students register/login with JWT auth, report items with images, browse and filter the public listing, manage their own posts via a dashboard, and admins can moderate all content.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm --filter @workspace/student-portal run dev` — run the frontend (assigned port)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string, `SESSION_SECRET` — JWT signing secret

## Default Credentials

- Admin: `admin@campus.edu` / `admin123`
- Student: `alice@campus.edu` / `password123`, `bob@campus.edu` / `password123`

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React 19 + Vite 7 + Tailwind CSS v4 + shadcn/ui + wouter routing
- API: Express 5 + JWT auth (jsonwebtoken) + bcryptjs + multer (file uploads)
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`, Orval-generated Zod schemas
- API codegen: Orval (from `lib/api-spec/openapi.yaml`)

## Where things live

- `lib/api-spec/openapi.yaml` — single source of truth for all API contracts
- `lib/db/src/schema/` — Drizzle table definitions (users.ts, items.ts)
- `artifacts/api-server/src/routes/` — Express route handlers (auth, items, dashboard, stats, admin, upload)
- `artifacts/api-server/src/middlewares/auth.ts` — JWT auth + admin middleware
- `artifacts/api-server/src/seed.ts` — seeds default users and sample items on first run
- `artifacts/student-portal/src/pages/` — React pages (home, browse, item-detail, post, dashboard, login, register, admin)
- `uploads/` — uploaded item images stored here (served at `/api/uploads/...`)

## Architecture decisions

- JWT tokens stored in localStorage; `setAuthTokenGetter` wires all generated hooks to auto-attach Bearer header
- File uploads handled outside the OpenAPI spec (direct `fetch` to `POST /api/upload`) to avoid codegen complexity with multipart/form-data
- All integer/email fields use `type: number`/plain `type: string` in the spec to avoid orval 8.x generating Zod v4-only methods (`zod.int()`, `zod.email()`) that conflict with the `zod` (v3 path) import
- Admin panel is role-gated client-side and server-side; admin role is set in DB only

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- After changing `lib/api-spec/openapi.yaml`, always re-run codegen before editing routes or frontend
- `bcrypt` is in esbuild's external list (native module) — use `bcryptjs` (pure JS) for password hashing
- orval 8.23 generates Zod v4 syntax; avoid `type: integer` and `format: email` in the spec or update import to `zod/v4`
