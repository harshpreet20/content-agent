# Order Service

Stub implementation. Scaffolded from PRD section 5/23 (see `/docs/PRD.md`).
Every route currently returns `501 Not Implemented` — wire up persistence
(PostgreSQL) and replace the stub logic per PRD section 30 (repository/service
pattern, idempotent event handlers, strong typing).

## Responsibilities

- Order lifecycle: placed, paid, fulfilled, cancelled, refunded

## Consumed by

- Store
- Website
- Admin

## Events published

- `OrderPlaced`
- `OrderPaid`
- `OrderCancelled`

## Events subscribed

_None yet._

## Routes

| Method | Path | Description |
| --- | --- | --- |
| `POST` | `/orders` | Place an order from a cart |
| `GET` | `/orders/:id` | Get an order |
| `PATCH` | `/orders/:id/cancel` | Cancel an order |
| `POST` | `/orders/:id/mark-paid` | Confirm payment (called by payment-service) |

## Run locally

```bash
npm run dev -w services/order-service
```

Health check: `GET http://localhost:4008/health`
