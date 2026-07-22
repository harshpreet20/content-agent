# Pricing Service

Stub implementation. Scaffolded from PRD section 5/23 (see `/docs/PRD.md`).
Every route currently returns `501 Not Implemented` — wire up persistence
(PostgreSQL) and replace the stub logic per PRD section 30 (repository/service
pattern, idempotent event handlers, strong typing).

## Responsibilities

- MRP, member price, bulk price
- Bundle / tournament / coupon / reward / subscription price
- No pricing logic in any frontend

## Consumed by

- Website
- Store
- Admin

## Events published

- `PriceChanged`

## Events subscribed

- `MembershipUpdated`

## Routes

| Method | Path | Description |
| --- | --- | --- |
| `POST` | `/pricing/calculate` | Compute a full price breakdown for a cart line |
| `GET` | `/pricing/:productId/:variantId` | Get the current published price breakdown |

## Run locally

```bash
npm run dev -w services/pricing-service
```

Health check: `GET http://localhost:4004/health`
