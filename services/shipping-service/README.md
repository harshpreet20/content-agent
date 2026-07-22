# Shipping Service

Stub implementation. Scaffolded from PRD section 5/23 (see `/docs/PRD.md`).
Every route currently returns `501 Not Implemented` — wire up persistence
(PostgreSQL) and replace the stub logic per PRD section 30 (repository/service
pattern, idempotent event handlers, strong typing).

## Responsibilities

- Shipment creation and tracking (Shiprocket integration, PRD section 28)

## Consumed by

- Store
- Admin

## Events published

_None._

## Events subscribed

- `OrderPaid`

## Routes

| Method | Path | Description |
| --- | --- | --- |
| `POST` | `/shipping` | Create a shipment for a paid order |
| `GET` | `/shipping/:orderId` | Get shipment/tracking status |

## Run locally

```bash
npm run dev -w services/shipping-service
```

Health check: `GET http://localhost:4010/health`
