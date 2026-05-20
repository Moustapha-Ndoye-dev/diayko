import { Router, type IRouter } from "express";
import { HealthCheckResponse } from "@workspace/api-zod";
import { isPostgresDialect } from "@workspace/db";
import { cleanupExpiredRateLimits } from "../lib/pgRateLimitStore";
import { timingSafeStringEqual } from "../lib/timingSafe";

const router: IRouter = Router();

router.get("/healthz", (_req, res) => {
  const data = HealthCheckResponse.parse({ status: "ok" });
  res.json(data);
});

/**
 * Internal maintenance endpoint — purges expired rows from rate_limits.
 * Intended to be called by a scheduler (e.g. UptimeRobot, a cron job, or
 * any periodic HTTP trigger) as a belt-and-suspenders complement to the
 * in-process setInterval started at boot.
 *
 * Protected by a shared secret: callers must supply the value of the
 * MAINTENANCE_TOKEN environment variable in the X-Maintenance-Token header.
 * If the env var is not set the endpoint is disabled (returns 403) so it is
 * never accidentally left open in production.
 */
router.post("/maintenance/cleanup", async (req, res) => {
  const token = process.env["MAINTENANCE_TOKEN"];

  if (!token) {
    res.status(403).json({ ok: false, error: "maintenance endpoint disabled" });
    return;
  }

  const raw = req.headers["x-maintenance-token"];
  const provided = typeof raw === "string" ? raw : Array.isArray(raw) ? (raw[0] ?? "") : "";
  if (!provided || !timingSafeStringEqual(provided, token)) {
    req.log.warn("maintenance cleanup: invalid or missing token");
    res.status(401).json({ ok: false, error: "unauthorized" });
    return;
  }

  try {
    const deleted = isPostgresDialect() ? await cleanupExpiredRateLimits() : 0;
    req.log.info({ deleted }, "maintenance cleanup: expired rate_limits rows removed");
    res.json({ ok: true, deleted });
  } catch (err) {
    req.log.error({ err }, "maintenance cleanup: failed");
    res.status(500).json({ ok: false, error: "cleanup failed" });
  }
});

export default router;
