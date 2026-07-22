import express from "express";
import cors from "cors";
import helmet from "helmet";
import { eventBus } from "@rcc/event-bus";

const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json());

const parsedPort = Number(process.env.PORT);
const PORT = Number.isInteger(parsedPort) && parsedPort > 0 ? parsedPort : 4011;

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "notification-service", status: "up" });
});

app.post("/notifications/send", (req, res) => {
  // TODO: Send a one-off notification (Admin/manual)
  res.status(501).json({ ok: false, error: "Not implemented", route: "POST /notifications/send" });
});

eventBus.subscribe("OrderPlaced", (event) => {
  // TODO: react to OrderPlaced
  console.log("[notification-service] received", event.name, event.eventId);
});

eventBus.subscribe("OrderPaid", (event) => {
  // TODO: react to OrderPaid
  console.log("[notification-service] received", event.name, event.eventId);
});

eventBus.subscribe("OrderCancelled", (event) => {
  // TODO: react to OrderCancelled
  console.log("[notification-service] received", event.name, event.eventId);
});

eventBus.subscribe("RewardEarned", (event) => {
  // TODO: react to RewardEarned
  console.log("[notification-service] received", event.name, event.eventId);
});

eventBus.subscribe("MembershipUpdated", (event) => {
  // TODO: react to MembershipUpdated
  console.log("[notification-service] received", event.name, event.eventId);
});

eventBus.subscribe("SubscriptionCreated", (event) => {
  // TODO: react to SubscriptionCreated
  console.log("[notification-service] received", event.name, event.eventId);
});

eventBus.subscribe("SubscriptionCancelled", (event) => {
  // TODO: react to SubscriptionCancelled
  console.log("[notification-service] received", event.name, event.eventId);
});

eventBus.subscribe("CustomerCreated", (event) => {
  // TODO: react to CustomerCreated
  console.log("[notification-service] received", event.name, event.eventId);
});

/** Example of how a mutation would publish a domain event once persistence is wired up:
  // this service does not publish any domain events
 */

app.listen(PORT, () => {
  console.log(`[notification-service] listening on :${PORT}`);
});
