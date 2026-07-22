import express from "express";
import cors from "cors";
import helmet from "helmet";
import { eventBus } from "@rcc/event-bus";
import type { PriceBreakdown, PriceCalculationRequest } from "@rcc/shared-types";

const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json());

const parsedPort = Number(process.env.PORT);
const PORT = Number.isInteger(parsedPort) && parsedPort > 0 ? parsedPort : 4004;

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "pricing-service", status: "up" });
});

app.post("/pricing/calculate", (req, res) => {
  // TODO: Compute a full price breakdown for a cart line
  res.status(501).json({ ok: false, error: "Not implemented", route: "POST /pricing/calculate" });
});

app.get("/pricing/:productId/:variantId", (req, res) => {
  // TODO: Get the current published price breakdown
  res.status(501).json({ ok: false, error: "Not implemented", route: "GET /pricing/:productId/:variantId" });
});

eventBus.subscribe("MembershipUpdated", (event) => {
  // TODO: react to MembershipUpdated
  console.log("[pricing-service] received", event.name, event.eventId);
});

/** Example of how a mutation would publish a domain event once persistence is wired up:
  // eventBus.publish("PriceChanged", payload);
 */

app.listen(PORT, () => {
  console.log(`[pricing-service] listening on :${PORT}`);
});
