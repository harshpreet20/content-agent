# Inventory Service

Stub implementation. Scaffolded from PRD section 5/23 (see `../../docs/PRD.md`).
`GET /health` is live and returns 200. Every business route below currently
returns `501 Not Implemented` — wire up persistence (PostgreSQL) and replace
the stub logic per PRD section 30 (repository/service pattern, idempotent
event handlers, strong typing).

## Responsibilities

- Stock, reserved stock, incoming stock
- Warehouses
- Low inventory / limited stock flags

## Consumed by

- Store
- Website
- Checkout
- Admin

## Events published

- `InventoryChanged`

## Events subscribed

- `OrderPlaced`
- `OrderCancelled`

## Routes

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/inventory/:productId/:variantId` | Read stock levels |
| `PATCH` | `/inventory/:productId/:variantId` | Adjust stock (Admin / warehouse feed) |
| `POST` | `/inventory/reserve` | Reserve stock for a pending order |
| `POST` | `/inventory/release` | Release a reservation (cancelled/expired order) |

## Run locally

```bash
npm run dev -w services/inventory-service
```

Health check: `GET http://localhost:4003/health`
