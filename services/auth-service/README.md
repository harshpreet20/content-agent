# Auth Service

Stub implementation. Scaffolded from PRD section 5/23 (see `../../docs/PRD.md`).
`GET /health` is live and returns 200. Every business route below currently
returns `501 Not Implemented` — wire up persistence (PostgreSQL) and replace
the stub logic per PRD section 30 (repository/service pattern, idempotent
event handlers, strong typing).

## Responsibilities

- Login
- Signup
- JWT issuing/verification
- Refresh tokens
- Google login
- OTP
- Session management

## Consumed by

- Website
- Store
- Admin

## Events published

- `CustomerCreated`
- `CustomerUpdated`

## Events subscribed

_None yet._

## Routes

| Method | Path | Description |
| --- | --- | --- |
| `POST` | `/auth/signup` | Create a customer account |
| `POST` | `/auth/login` | Exchange credentials for a session |
| `POST` | `/auth/refresh` | Rotate an access token using a refresh token |
| `POST` | `/auth/otp/request` | Send an OTP to email/phone |
| `POST` | `/auth/otp/verify` | Verify an OTP and issue a session |
| `GET` | `/auth/session` | Validate the current session |

## Run locally

```bash
npm run dev -w services/auth-service
```

Health check: `GET http://localhost:4001/health`
