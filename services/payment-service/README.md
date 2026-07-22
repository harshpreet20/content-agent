# Payment Service

Stub implementation. Scaffolded from PRD section 5/23 (see `/docs/PRD.md`).
Every route currently returns `501 Not Implemented` — wire up persistence
(PostgreSQL) and replace the stub logic per PRD section 30 (repository/service
pattern, idempotent event handlers, strong typing).

## Responsibilities

- Charge creation and capture (Razorpay integration, PRD section 28)
- Payment webhooks
- Refunds

## Consumed by

- Store
- Admin

## Events published

_None._

## Events subscribed

- `OrderPlaced`

## Routes

| Method | Path | Description |
| --- | --- | --- |
| `POST` | `/payments/charge` | Create a charge for an order |
| `POST` | `/payments/webhook` | Receive provider webhook (e.g. Razorpay) |
| `GET` | `/payments/:orderId` | Get payment status for an order |

## Run locally

```bash
npm run dev -w services/payment-service
```

Health check: `GET http://localhost:4009/health`
