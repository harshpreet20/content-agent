# Notification Service

Stub implementation. Scaffolded from PRD section 5/23 (see `../../docs/PRD.md`).
`GET /health` is live and returns 200. Every business route below currently
returns `501 Not Implemented` — wire up persistence (PostgreSQL) and replace
the stub logic per PRD section 30 (repository/service pattern, idempotent
event handlers, strong typing).

## Responsibilities

- Email
- WhatsApp
- SMS
- Push
- Outbound webhooks

## Consumed by

- Every service, via events

## Events published

_None._

## Events subscribed

- `OrderPlaced`
- `OrderPaid`
- `OrderCancelled`
- `RewardEarned`
- `MembershipUpdated`
- `SubscriptionCreated`
- `SubscriptionCancelled`
- `CustomerCreated`

## Routes

| Method | Path | Description |
| --- | --- | --- |
| `POST` | `/notifications/send` | Send a one-off notification (Admin/manual) |

## Run locally

```bash
npm run dev -w services/notification-service
```

Health check: `GET http://localhost:4011/health`
