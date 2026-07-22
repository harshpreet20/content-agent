# Rewards Service

Stub implementation. Scaffolded from PRD section 5/23 (see `/docs/PRD.md`).
Every route currently returns `501 Not Implemented` — wire up persistence
(PostgreSQL) and replace the stub logic per PRD section 30 (repository/service
pattern, idempotent event handlers, strong typing).

## Responsibilities

- Points, achievements, unlocks
- Leaderboards
- Referral rewards

## Consumed by

- Store
- Website
- Admin

## Events published

- `RewardEarned`
- `RewardRedeemed`

## Events subscribed

- `OrderPaid`
- `ReviewCreated`
- `MembershipUpdated`

## Routes

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/rewards/:customerId` | Get a customer's balance and achievements |
| `POST` | `/rewards/earn` | Credit points for a trigger (purchase, referral, ...) |
| `POST` | `/rewards/redeem` | Redeem points |
| `GET` | `/rewards/leaderboard` | Get the leaderboard |

## Run locally

```bash
npm run dev -w services/rewards-service
```

Health check: `GET http://localhost:4006/health`
