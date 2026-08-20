# Odyssey Ops

A restaurant operations dashboard for **Rosemary & Vine**: live tickets, menu availability, CRM, and ordering settings. Built to the Odyssey fullstack assignment stack — not a substitute stack.

## Stack

| Piece | Choice |
| --- | --- |
| Workspace | pnpm 11 + Turborepo |
| Dashboard | `apps/dashboard` — Expo 57 + React Native Web |
| API | `services/backend` — Hono on Cloudflare Workers (`wrangler dev`) |
| Database | PostgreSQL 16 + Drizzle ORM + drizzle-zod |
| Contract | OpenAPI generated from the Hono app → Orval React Query hooks |
| UI | `packages/shared` — tokens and primitives |
| Types | `packages/types` — error envelope and primitives only (no API DTOs) |
| Client | `packages/api-client` — generated hooks; screens never call `fetch` |

```text
apps/dashboard
services/backend
packages/shared
packages/types
packages/api-client
```

## Run locally

Needs **Node 22+**, **pnpm 11**, **Docker** (for Postgres), and **Windows: Docker Desktop running**.

```bash
pnpm install

# 1. Database
cp services/backend/.dev.vars.example services/backend/.dev.vars
pnpm db:up
pnpm db:migrate
pnpm db:seed

# 2. Dashboard API URL
cp apps/dashboard/.env.example apps/dashboard/.env

# 3. Two terminals
pnpm dev:backend     # http://127.0.0.1:8787
pnpm dev:dashboard   # http://localhost:8081
```

Open [http://localhost:8081](http://localhost:8081). The dashboard talks to [http://localhost:8787](http://localhost:8787).

`DATABASE_URL` must use **`127.0.0.1`**, not `localhost`. Wrangler’s local TCP proxy on Windows cannot reliably reach Docker Postgres via IPv6 `localhost`.

The API has no HTML homepage. Open `http://127.0.0.1:8787/` or `/health` — both return JSON. The product UI is the dashboard on port 8081.

## Seed data

`pnpm db:seed` is idempotent: it no-ops if the settings row already exists.

Demo restaurant **Rosemary & Vine**:

- 3 categories (Small plates, Pasta, Dessert) and 5 items (`m_1`–`m_5`)
- **Braised Short Rib Pappardelle (`m_4`) is sold out** — used to prove unavailable-item rejection
- 5 customers (`c_1`–`c_5`)
- Open and completed tickets (`RV-1036`+) plus settings: tax **8.75%** (`875` bps), auto-accept **on**, prep **18** minutes, service **open**

To re-seed from scratch:

```bash
docker compose down -v
pnpm db:up
pnpm db:migrate
pnpm db:seed
```

## Scripts

```bash
pnpm dev:dashboard   # Expo web on :8081
pnpm dev:backend     # Wrangler / Hono on :8787
pnpm gen:contract    # OpenAPI from Hono → Orval client/hooks
pnpm lint
pnpm typecheck
pnpm test

pnpm db:up           # docker compose up -d
pnpm db:migrate      # apply Drizzle DDL
pnpm db:seed         # Rosemary & Vine demo data
```

Do not hand-edit `services/backend/openapi.json` or `packages/api-client/src/generated/**`. Change the Drizzle schema / Hono routes, then `pnpm gen:contract`.

## Architecture

Contract flow, start to finish:

```text
Drizzle schema → drizzle-zod → Hono OpenAPI → openapi.json → Orval → generated hooks
```

- **Persisted truth** lives in `services/backend/src/db/schema.ts` (tables, enums, money as integer cents, tax as basis points).
- **Request/response Zod schemas** are derived with drizzle-zod (`createSelectSchema` / `createInsertSchema`), then attached to Hono routes. The same app emits OpenAPI.
- **Frontend API types and React Query hooks** come only from `@ody/api-client`. Pages import `useGetOrders`, `usePostOrdersIdActions`, etc. Display labels (e.g. “Start preparing”) live in the UI; they are not a second copy of the state machine.
- **Business rules stay on the server**: totals, availability, service-hours, auto-accept, and status transitions.

### Orders are a state machine, not a status PATCH

Clients cannot set `status`. The only mutation is:

```http
POST /orders/{id}/actions
{ "action": "accept" | "start_preparing" | "mark_ready" | "complete" | "cancel" }
```

| Current | Allowed actions |
| --- | --- |
| pending | accept, cancel |
| accepted | start_preparing, cancel |
| preparing | mark_ready, cancel |
| ready | complete, cancel |
| completed / cancelled | none |

Illegal actions return **409** `order.invalid_transition`. Each order payload includes `allowedActions` so the dashboard only renders buttons the server will accept.

Other deliberate backend behavior:

- Empty item list → **400** `validation_failed`
- Unknown item → **422** `order.unknown_item`
- Unavailable item → **422** `order.unavailable_item`
- Location closed or channel disabled → **422** `ordering.service_closed` / channel error
- Line prices are snapped from the catalog; **subtotal / tax / total are computed server-side**. A client-supplied total is ignored because it is never a field.

### Workers + Postgres

Cloudflare Workers isolate I/O per request, so the postgres.js socket is opened for the duration of `fetch` and closed in `finally` (`services/backend/src/index.ts`). Caching a client across requests throws `Cannot perform I/O on behalf of a different request`.

The Hono app (`createApp(db)`) is runtime-agnostic. Tests inject PGlite; Wrangler injects Postgres; migrate/seed use Node postgres.js.

### Dashboard structure

- `app/*` — screens (layout, loading/error/empty via shared primitives)
- `src/features/orders` — filter mapping, create-order dialog, status *labels*
- `src/lib` — error formatting and React Query invalidation
- `packages/shared` — tokens (color, type, space, radius, elevation, layout) and primitives (Button, Input, Select, Dialog, Card/Surface, DataTable, Badge, Nav, Skeleton, Empty/Error/Callout, Toast, Metric, Avatar, Switch)

Route `/ui-library` is the living design system.

## Testing

Backend tests run in-process against **PGlite** (no Docker required):

- Reject empty items, unknown items, unavailable items
- Server-side totals (`1400 + 2×2400` @ 8.75% → **6743**)
- Named actions vs a client-controlled status field
- Legal accept; no actions on a completed ticket
- Service closed; auto-accept off → `pending`
- Mark item unavailable, then refuse it on create

Frontend tests cover `toOrdersQuery` so “all” / blank search do not leak into the API.

```bash
pnpm test
# 13 backend + 2 dashboard tests
```

## Tradeoffs and incomplete areas

- **No auth / multi-location.** Out of scope for the timebox; a single location settings row (`id = 'default'`).
- **No realtime.** Home and Orders refetch via React Query after mutations; there is no websocket.
- **Native is untested.** Web is the assignment requirement. Expo config is native-ready; we did not run iOS/Android.
- **Create-order UI picks an existing customer.** The API also accepts `{ customer: { name, email } }` and will upsert; the dialog does not expose that yet.
- **Seed auto-accept is on**, so newly created demo orders land in `accepted`. Turn it off in Settings to exercise the `pending` queue.
- **Local Wrangler + Docker Postgres on Windows** needs `127.0.0.1` in `DATABASE_URL`. First requests after a reload can be slower while the TCP proxy warms up.
- **Generated Orval files are not Prettier-linted** so `pnpm gen:contract` does not fight `pnpm lint`.
- **Not deployed to Cloudflare.** Production would want Hyperdrive (or a similar pooler) in front of Postgres; the Worker entry is already the `fetch` adapter.
- **pnpm `nodeLinker: hoisted`** so Metro can resolve workspace packages. Isolated pnpm layout breaks Expo autolinking.

## Pages

| Route | Behavior |
| --- | --- |
| `/` | Today’s KPIs, live tickets, popular items from `/summary` |
| `/orders` | Filterable queue, create-order dialog, detail drawer, action buttons from `allowedActions` |
| `/menu` | Categories and items, availability toggle, create/edit item, new category |
| `/crm` | Customers, order count, lifetime spend, detail with history |
| `/settings` | Prep time, auto-accept, channels, hours, tax; GET then PUT |
| `/ui-library` | Tokens, type, surfaces, primitives, component states |
