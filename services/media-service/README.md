# Media Service

Stub implementation. Scaffolded from PRD section 5/23 (see `../../docs/PRD.md`).
`GET /health` is live and returns 200. Every business route below currently
returns `501 Not Implemented` — wire up persistence (PostgreSQL) and replace
the stub logic per PRD section 30 (repository/service pattern, idempotent
event handlers, strong typing).

## Responsibilities

- Images, videos, 360 assets
- Generated preview images (incl. jersey previews)
- CDN delivery, optimization

## Consumed by

- Website
- Store
- Admin

## Events published

- `GalleryApproved`

## Events subscribed

_None yet._

## Routes

| Method | Path | Description |
| --- | --- | --- |
| `POST` | `/media/upload` | Upload an asset, returns a MediaAsset |
| `GET` | `/media/:id` | Get asset metadata |
| `POST` | `/media/gallery/:id/approve` | Approve a community gallery submission |

## Run locally

```bash
npm run dev -w services/media-service
```

Health check: `GET http://localhost:4014/health`
