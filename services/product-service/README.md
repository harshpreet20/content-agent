# Product Service

Stub implementation. Scaffolded from PRD section 5/23 (see `/docs/PRD.md`).
Every route currently returns `501 Not Implemented` — wire up persistence
(PostgreSQL) and replace the stub logic per PRD section 30 (repository/service
pattern, idempotent event handlers, strong typing).

## Responsibilities

- Products, variants, collections
- Images, videos, 360 view references
- Personalization (jersey) records
- Reviews
- Recommendations

## Consumed by

- Website
- Store
- Admin

## Events published

- `ProductCreated`
- `ProductUpdated`
- `CollectionPublished`
- `ReviewCreated`

## Events subscribed

- `InventoryChanged`
- `PriceChanged`

## Routes

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/products` | List products (filters: collection, tag, status) |
| `GET` | `/products/:id` | Get a single product |
| `POST` | `/products` | Create a product (Admin) |
| `PATCH` | `/products/:id` | Update a product (Admin) |
| `GET` | `/collections` | List collections |
| `POST` | `/products/:id/reviews` | Submit a product review |

## Run locally

```bash
npm run dev -w services/product-service
```

Health check: `GET http://localhost:4002/health`
