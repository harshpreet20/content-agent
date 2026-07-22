import express from "express";
import cors from "cors";
import helmet from "helmet";
import { eventBus } from "@rcc/event-bus";
import type { Payment } from "@rcc/shared-types";

const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json());

const parsedPort = Number(process.env.PORT);
const PORT = Number.isInteger(parsedPort) && parsedPort > 0 ? parsedPort : 4009;

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "payment-service", status: "up" });
});

app.post("/payments/charge", (req, res) => {
  // TODO: Create a charge for an order
  res.status(501).json({ ok: false, error: "Not implemented", route: "POST /payments/charge" });
});

app.post("/payments/webhook", (req, res) => {
  // TODO: Receive provider webhook (e.g. Razorpay)
  res.status(501).json({ ok: false, error: "Not implemented", route: "POST /payments/webhook" });
});

app.get("/payments/:orderId", (req, res) => {
  // TODO: Get payment status for an order
  res.status(501).json({ ok: false, error: "Not implemented", route: "GET /payments/:orderId" });
});

eventBus.subscribe("OrderPlaced", (event) => {
  // TODO: react to OrderPlaced
  console.log("[payment-service] received", event.name, event.eventId);
});

/** Example of how a mutation would publish a domain event once persistence is wired up:
  // this service does not publish any domain events
 */

app.listen(PORT, () => {
  console.log(`[payment-service] listening on :${PORT}`);
});
