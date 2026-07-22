# Membership Service

Stub implementation. Scaffolded from PRD section 5/23 (see `/docs/PRD.md`).
Every route currently returns `501 Not Implemented` — wire up persistence
(PostgreSQL) and replace the stub logic per PRD section 30 (repository/service
pattern, idempotent event handlers, strong typing).

## Responsibilities

- Membership status, elite status, chapters
- Founding members, expiry
- Member pricing eligibility, access permissions

## Consumed by

- Website
- Store
- Admin

## Events published

- `MembershipUpdated`

## Events subscribed

- `OrderPaid`
- `SubscriptionCreated`
- `SubscriptionCancelled`

## Routes

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/memberships/:customerId` | Get a customer's membership record |
| `PATCH` | `/memberships/:customerId` | Change level/chapter/permissions (Admin) |
| `POST` | `/memberships/:customerId/renew` | Renew or extend membership |

## Run locally

```bash
npm run dev -w services/membership-service
```

Health check: `GET http://localhost:4005/health`
