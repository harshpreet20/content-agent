import express from "express";
import cors from "cors";
import { eventBus } from "@rcc/event-bus";
import type { Subscription } from "@rcc/shared-types";

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 4013;

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "subscription-service", status: "up" });
});

app.post("/subscriptions", (req, res) => {
  // TODO: Create a subscription
  res.status(501).json({ ok: false, error: "Not implemented", route: "POST /subscriptions" });
});

app.patch("/subscriptions/:id/pause", (req, res) => {
  // TODO: Pause a subscription
  res.status(501).json({ ok: false, error: "Not implemented", route: "PATCH /subscriptions/:id/pause" });
});

app.patch("/subscriptions/:id/resume", (req, res) => {
  // TODO: Resume a subscription
  res.status(501).json({ ok: false, error: "Not implemented", route: "PATCH /subscriptions/:id/resume" });
});

app.delete("/subscriptions/:id", (req, res) => {
  // TODO: Cancel a subscription
  res.status(501).json({ ok: false, error: "Not implemented", route: "DELETE /subscriptions/:id" });
});

eventBus.subscribe("OrderPaid", (event) => {
  // TODO: react to OrderPaid
  console.log("[subscription-service] received", event.name, event.eventId);
});

/** Example of how a mutation would publish a domain event once persistence is wired up:
  // eventBus.publish("SubscriptionCreated", payload);
  // eventBus.publish("SubscriptionCancelled", payload);
 */

app.listen(PORT, () => {
  console.log(`[subscription-service] listening on :${PORT}`);
});
