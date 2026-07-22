import express from "express";
import cors from "cors";
import { eventBus } from "@rcc/event-bus";
import type { RewardBalance, RewardLedgerEntry } from "@rcc/shared-types";

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 4006;

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "rewards-service", status: "up" });
});

app.get("/rewards/:customerId", (req, res) => {
  // TODO: Get a customer's balance and achievements
  res.status(501).json({ ok: false, error: "Not implemented", route: "GET /rewards/:customerId" });
});

app.post("/rewards/earn", (req, res) => {
  // TODO: Credit points for a trigger (purchase, referral, ...)
  res.status(501).json({ ok: false, error: "Not implemented", route: "POST /rewards/earn" });
});

app.post("/rewards/redeem", (req, res) => {
  // TODO: Redeem points
  res.status(501).json({ ok: false, error: "Not implemented", route: "POST /rewards/redeem" });
});

app.get("/rewards/leaderboard", (req, res) => {
  // TODO: Get the leaderboard
  res.status(501).json({ ok: false, error: "Not implemented", route: "GET /rewards/leaderboard" });
});

eventBus.subscribe("OrderPaid", (event) => {
  // TODO: react to OrderPaid
  console.log("[rewards-service] received", event.name, event.eventId);
});

eventBus.subscribe("ReviewCreated", (event) => {
  // TODO: react to ReviewCreated
  console.log("[rewards-service] received", event.name, event.eventId);
});

eventBus.subscribe("MembershipUpdated", (event) => {
  // TODO: react to MembershipUpdated
  console.log("[rewards-service] received", event.name, event.eventId);
});

/** Example of how a mutation would publish a domain event once persistence is wired up:
  // eventBus.publish("RewardEarned", payload);
  // eventBus.publish("RewardRedeemed", payload);
 */

app.listen(PORT, () => {
  console.log(`[rewards-service] listening on :${PORT}`);
});
