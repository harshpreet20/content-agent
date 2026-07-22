import express from "express";
import cors from "cors";
import { eventBus } from "@rcc/event-bus";

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 4012;

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "analytics-service", status: "up" });
});

app.post("/analytics/track", (req, res) => {
  // TODO: Record a raw event (view/click)
  res.status(501).json({ ok: false, error: "Not implemented", route: "POST /analytics/track" });
});

app.get("/analytics/summary", (req, res) => {
  // TODO: Get an aggregate summary
  res.status(501).json({ ok: false, error: "Not implemented", route: "GET /analytics/summary" });
});

eventBus.subscribe("ProductCreated", (event) => {
  // TODO: react to ProductCreated
  console.log("[analytics-service] received", event.name, event.eventId);
});

eventBus.subscribe("ProductUpdated", (event) => {
  // TODO: react to ProductUpdated
  console.log("[analytics-service] received", event.name, event.eventId);
});

eventBus.subscribe("OrderPlaced", (event) => {
  // TODO: react to OrderPlaced
  console.log("[analytics-service] received", event.name, event.eventId);
});

eventBus.subscribe("OrderPaid", (event) => {
  // TODO: react to OrderPaid
  console.log("[analytics-service] received", event.name, event.eventId);
});

eventBus.subscribe("OrderCancelled", (event) => {
  // TODO: react to OrderCancelled
  console.log("[analytics-service] received", event.name, event.eventId);
});

eventBus.subscribe("RewardEarned", (event) => {
  // TODO: react to RewardEarned
  console.log("[analytics-service] received", event.name, event.eventId);
});

eventBus.subscribe("RewardRedeemed", (event) => {
  // TODO: react to RewardRedeemed
  console.log("[analytics-service] received", event.name, event.eventId);
});

eventBus.subscribe("MembershipUpdated", (event) => {
  // TODO: react to MembershipUpdated
  console.log("[analytics-service] received", event.name, event.eventId);
});

eventBus.subscribe("SubscriptionCreated", (event) => {
  // TODO: react to SubscriptionCreated
  console.log("[analytics-service] received", event.name, event.eventId);
});

eventBus.subscribe("SubscriptionCancelled", (event) => {
  // TODO: react to SubscriptionCancelled
  console.log("[analytics-service] received", event.name, event.eventId);
});

/** Example of how a mutation would publish a domain event once persistence is wired up:
  // this service does not publish any domain events
 */

app.listen(PORT, () => {
  console.log(`[analytics-service] listening on :${PORT}`);
});
