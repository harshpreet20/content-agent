# Subscription Service

Stub implementation. Scaffolded from PRD section 5/23 (see `../../docs/PRD.md`).
`GET /health` is live and returns 200. Every business route below currently
returns `501 Not Implemented` — wire up persistence (PostgreSQL) and replace
the stub logic per PRD section 30 (repository/service pattern, idempotent
event handlers, strong typing).

## Responsibilities

- Recurring products (monthly/quarterly/yearly)
- Pause, resume, cancel, upgrade, downgrade
- Retry payments, automatic rewards

## Consumed by

- Store
- Admin

## Events published

- `SubscriptionCreated`
- `SubscriptionCancelled`

## Events subscribed

- `OrderPaid`

## Routes

| Method | Path | Description |
| --- | --- | --- |
| `POST` | `/subscriptions` | Create a subscription |
| `PATCH` | `/subscriptions/:id/pause` | Pause a subscription |
| `PATCH` | `/subscriptions/:id/resume` | Resume a subscription |
| `DELETE` | `/subscriptions/:id` | Cancel a subscription |

## Run locally

```bash
npm run dev -w services/subscription-service
```

Health check: `GET http://localhost:4013/health`
