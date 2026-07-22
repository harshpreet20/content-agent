# Cart Service

Stub implementation. Scaffolded from PRD section 5/23 (see `/docs/PRD.md`).
Every route currently returns `501 Not Implemented` — wire up persistence
(PostgreSQL) and replace the stub logic per PRD section 30 (repository/service
pattern, idempotent event handlers, strong typing).

## Responsibilities

- Persistent, cross-device cart
- Coupons, rewards, gift cards, bundles on the cart
- Saved cart, recently viewed, recommended products

## Consumed by

- Store
- Website

## Events published

_None._

## Events subscribed

- `InventoryChanged`
- `PriceChanged`

## Routes

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/cart/:cartId` | Get a cart |
| `POST` | `/cart/:cartId/items` | Add/update a line item |
| `DELETE` | `/cart/:cartId/items/:itemId` | Remove a line item |
| `POST` | `/cart/:cartId/coupon` | Apply a coupon code |

## Run locally

```bash
npm run dev -w services/cart-service
```

Health check: `GET http://localhost:4007/health`
