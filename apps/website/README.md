# @rcc/website

The marketing website. Product showcase, collections, membership badges — all read from the shared Product/Membership/Rewards APIs, never a local database.

Scaffolded per the RCC Commerce Platform PRD (`../../docs/PRD.md`, section 2). This is a placeholder Next.js app — it renders one page that calls product-service to prove the API-first wiring works. Build out real pages/routes here as each backend service moves past its 501 stub.

## Run locally

```bash
npm run dev -w apps/website
```

Opens on http://localhost:3001. Uses `PRODUCT_SERVICE_URL` when set; otherwise defaults to `http://localhost:4002` (product-service running via `npm run dev -w services/product-service`).
