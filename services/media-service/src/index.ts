import express from "express";
import cors from "cors";
import helmet from "helmet";
import { eventBus } from "@rcc/event-bus";
import type { MediaAsset } from "@rcc/shared-types";

const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json());

const parsedPort = Number(process.env.PORT);
const PORT = Number.isInteger(parsedPort) && parsedPort > 0 ? parsedPort : 4014;

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "media-service", status: "up" });
});

app.post("/media/upload", (req, res) => {
  // TODO: Upload an asset, returns a MediaAsset
  res.status(501).json({ ok: false, error: "Not implemented", route: "POST /media/upload" });
});

app.get("/media/:id", (req, res) => {
  // TODO: Get asset metadata
  res.status(501).json({ ok: false, error: "Not implemented", route: "GET /media/:id" });
});

app.post("/media/gallery/:id/approve", (req, res) => {
  // TODO: Approve a community gallery submission
  res.status(501).json({ ok: false, error: "Not implemented", route: "POST /media/gallery/:id/approve" });
});

// this service does not subscribe to any domain events yet

/** Example of how a mutation would publish a domain event once persistence is wired up:
  // eventBus.publish("GalleryApproved", payload);
 */

app.listen(PORT, () => {
  console.log(`[media-service] listening on :${PORT}`);
});
