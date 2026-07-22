# Analytics Service

Stub implementation. Scaffolded from PRD section 5/23 (see `/docs/PRD.md`).
Every route currently returns `501 Not Implemented` — wire up persistence
(PostgreSQL) and replace the stub logic per PRD section 30 (repository/service
pattern, idempotent event handlers, strong typing).

## Responsibilities

- Views, clicks, orders, revenue, funnels
- Membership/subscription/reward/campaign analytics (PRD section 22)

## Consumed by

- Admin

## Events published

_None._

## Events subscribed

- `ProductCreated`
- `ProductUpdated`
- `OrderPlaced`
- `OrderPaid`
- `OrderCancelled`
- `RewardEarned`
- `RewardRedeemed`
- `MembershipUpdated`
- `SubscriptionCreated`
- `SubscriptionCancelled`

## Routes

| Method | Path | Description |
| --- | --- | --- |
| `POST` | `/analytics/track` | Record a raw event (view/click) |
| `GET` | `/analytics/summary` | Get an aggregate summary |

## Run locally

```bash
npm run dev -w services/analytics-service
```

Health check: `GET http://localhost:4012/health`
