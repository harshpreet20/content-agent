import express from "express";
import cors from "cors";
import helmet from "helmet";
import { eventBus } from "@rcc/event-bus";
import type { Membership } from "@rcc/shared-types";

const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json());

const parsedPort = Number(process.env.PORT);
const PORT = Number.isInteger(parsedPort) && parsedPort > 0 ? parsedPort : 4005;

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "membership-service", status: "up" });
});

app.get("/memberships/:customerId", (req, res) => {
  // TODO: Get a customer's membership record
  res.status(501).json({ ok: false, error: "Not implemented", route: "GET /memberships/:customerId" });
});

app.patch("/memberships/:customerId", (req, res) => {
  // TODO: Change level/chapter/permissions (Admin)
  res.status(501).json({ ok: false, error: "Not implemented", route: "PATCH /memberships/:customerId" });
});

app.post("/memberships/:customerId/renew", (req, res) => {
  // TODO: Renew or extend membership
  res.status(501).json({ ok: false, error: "Not implemented", route: "POST /memberships/:customerId/renew" });
});

eventBus.subscribe("OrderPaid", (event) => {
  // TODO: react to OrderPaid
  console.log("[membership-service] received", event.name, event.eventId);
});

eventBus.subscribe("SubscriptionCreated", (event) => {
  // TODO: react to SubscriptionCreated
  console.log("[membership-service] received", event.name, event.eventId);
});

eventBus.subscribe("SubscriptionCancelled", (event) => {
  // TODO: react to SubscriptionCancelled
  console.log("[membership-service] received", event.name, event.eventId);
});

/** Example of how a mutation would publish a domain event once persistence is wired up:
  // eventBus.publish("MembershipUpdated", payload);
 */

app.listen(PORT, () => {
  console.log(`[membership-service] listening on :${PORT}`);
});
