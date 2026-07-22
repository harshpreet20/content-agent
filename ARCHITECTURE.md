# RCC Commerce Platform — Architecture & Build Status

Source spec: [`docs/PRD.md`](docs/PRD.md). This document tracks what actually
exists in this repo against that spec, and how to run it.

## Repo layout

```text
/                        content-agent-dashboard (root Next.js app, unchanged)
  src/app/                Content Agent Dashboard (Ideator, Hook & Script, ...)
                           + an existing Supabase-backed store admin
                           (products/orders/customers/categories/discounts/settings)
                           — see "Admin Portal today" below.

apps/
  website/                @rcc/website   — marketing site  (racquetsclubcommunity.com)
  store/                  @rcc/store     — storefront       (store.racquetsclubcommunity.com)

services/
  auth-service/           4001
  product-service/        4002
  inventory-service/      4003
  pricing-service/        4004
  membership-service/     4005
  rewards-service/        4006
  cart-service/           4007
  order-service/          4008
  payment-service/        4009
  shipping-service/       4010
  notification-service/   4011
  analytics-service/      4012
  subscription-service/   4013
  media-service/          4014

packages/
  shared-types/           @rcc/shared-types — Product, Membership, Reward, Order,
                           Customer, Cart, Subscription, Media, DomainEvent, ApiResponse
  event-bus/               @rcc/event-bus    — typed pub/sub (EventBus.publish/subscribe)
```

Root `package.json` declares `workspaces: ["apps/*", "services/*", "packages/*"]`,
so `npm install` at the repo root wires every package together via npm's
workspace symlinks (`@rcc/shared-types` and `@rcc/event-bus` resolve locally,
no publishing needed).

## What's real vs. scaffold

| Layer | Status |
| --- | --- |
| `packages/shared-types`, `packages/event-bus` | **Real.** Full type coverage for PRD sections 3, 5, 7–23; in-memory `EventBus` with typed `publish`/`subscribe`. |
| `services/*` (14 services) | **Scaffold.** Each boots a real Express server; `/health` is live and returns 200, but every business route listed in its `README.md` returns `501 Not Implemented`. No database is wired up yet. Each service's `src/index.ts` shows where `eventBus.publish(...)` calls and `eventBus.subscribe(...)` handlers go. |
| `apps/website`, `apps/store` | **Scaffold.** Minimal Next.js 14 apps. One page each, calling `product-service` over HTTP to prove the API-first wiring (no direct DB access from either app, per PRD section 6/30). |
| Root Next app (`src/`) | **Real, deployed, unchanged.** This is the pre-existing Content Agent Dashboard. It already has working Supabase-backed CRUD for products/orders/customers/categories/discounts/settings — see "Admin Portal today" below. |

## Admin Portal today vs. target

The PRD names three separate deployed apps, one of which is
`admin.racquetsclubcommunity.com`. **This repo's root Next.js app already
serves that role** — `src/app/{products,orders,customers,categories,discounts,settings}`
plus `src/app/api/store/*` are a working admin surface backed directly by
Supabase. It was **not** moved or restructured as part of this scaffold,
to avoid breaking the existing Vercel deployment and cron (`vercel.json`).

The gap to the PRD's target state: today the root app talks to Supabase
directly; the target is for it (and `apps/website` / `apps/store`) to talk
only to the services under `services/*`, which own their own datastores and
emit events on every mutation. Migrating `src/app/api/store/*` to proxy
through `product-service` / `inventory-service` / etc. is the next real
step, not done here.

## Event flow (PRD section 4/23)

`packages/event-bus` implements the contract; `packages/shared-types/src/events.ts`
is the source of truth for event names and payload shapes:

```text
ProductCreated / ProductUpdated / CollectionPublished / ReviewCreated  → product-service
InventoryChanged                                                       → inventory-service
PriceChanged                                                           → pricing-service
OrderPlaced / OrderPaid / OrderCancelled                                → order-service
RewardEarned / RewardRedeemed                                           → rewards-service
MembershipUpdated                                                       → membership-service
SubscriptionCreated / SubscriptionCancelled                             → subscription-service
CustomerCreated / CustomerUpdated                                       → auth-service
GalleryApproved                                                         → media-service
```

Each service's README lists which of these it publishes and which it
subscribes to. The current `EventBus` is a same-process `EventEmitter`, so
it only connects publishers and subscribers running inside the **same**
Node process. `npm run dev:services` starts every service as its own
process via `concurrently` — useful for smoke-testing each service's HTTP
routes in isolation, but events published by one service do **not** reach
another service's subscribers that way today. Swapping the transport for
Redis Streams/SQS/Kafka (PRD section 28 lists Redis) is required before
cross-service events work with services running as independent processes;
the `publish`/`subscribe` call signatures are designed to stay the same
when that happens.

## Running it locally

```bash
npm install                 # installs and links every workspace

npm run dev                 # root Content Agent Dashboard / admin (port 3000)
npm run dev:website         # apps/website (port 3001)
npm run dev:store           # apps/store (port 3002)
npm run dev:services        # all 14 services concurrently (ports 4001-4014)
```

Or run one service directly: `npm run dev -w services/order-service`.

## Next steps (not done in this pass)

1. Pick a datastore per service (PRD says PostgreSQL) and replace the `501`
   stubs with real handlers, starting with `product-service` + `inventory-service`
   since everything else reads from them.
2. Point `apps/website` and `apps/store` at real pages beyond the placeholder.
3. Decide whether the existing root admin app keeps talking to Supabase
   directly (fastest) or gets migrated to call the new services (matches
   PRD section 6 — "never directly access another application's database").
4. Replace the in-memory `EventBus` transport with a real broker (Redis
   Streams/SQS/Kafka) — needed for cross-service events even today, since
   `npm run dev:services` already runs each service as its own OS process
   via `concurrently`, and it's required regardless once services are
   deployed independently.
5. Auth: `auth-service` is currently a stub; the existing root app has its
   own Supabase Auth (`src/lib/supabase-authed.ts`) — these need to converge
   on one identity provider per PRD section 5.
