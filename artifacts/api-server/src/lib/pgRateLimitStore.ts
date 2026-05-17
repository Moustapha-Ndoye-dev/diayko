import type { Store, Options, ClientRateLimitInfo } from "express-rate-limit";
import { logger } from "./logger";

// Infer the pool type from the workspace db module to avoid a direct
// dependency on `pg` types in this package.
type DbPool = (typeof import("@workspace/db"))["pool"];

// Deferred pool resolution: the @workspace/db module is loaded on first store
// operation rather than at import time. This avoids triggering DATABASE_URL
// validation (and pool creation) when the module is imported in environments
// such as unit tests that set NODE_ENV=test and never create a PgRateLimitStore.
let poolPromise: Promise<DbPool> | undefined;

async function getPool(): Promise<DbPool> {
  if (!poolPromise) {
    poolPromise = import("@workspace/db").then((m) => m.pool);
  }
  return poolPromise;
}

/**
 * PostgreSQL-backed store for express-rate-limit.
 * Counters survive server restarts and work across multiple instances.
 *
 * Each store instance receives a stable `namespace` string prepended to every
 * DB key, so limiters for different endpoints/rules never share rows even
 * when the same user/IP hits both (e.g. "auth:ip:x.x.x.x" vs "like:ip:x.x.x.x").
 */
export class PgRateLimitStore implements Store {
  private windowMs = 60_000;
  private readonly namespace: string;

  constructor(namespace: string) {
    this.namespace = namespace;
  }

  init(options: Options): void {
    this.windowMs = options.windowMs as number;
  }

  private scopedKey(key: string): string {
    return `${this.namespace}:${key}`;
  }

  async increment(key: string): Promise<ClientRateLimitInfo> {
    const pool = await getPool();
    const scoped = this.scopedKey(key);
    const resetTime = new Date(Date.now() + this.windowMs);

    const result = await pool.query<{ hits: number; reset_time: Date }>(
      `INSERT INTO rate_limits (key, hits, reset_time)
       VALUES ($1, 1, $2)
       ON CONFLICT (key) DO UPDATE
         SET hits = CASE
               WHEN rate_limits.reset_time <= NOW() THEN 1
               ELSE rate_limits.hits + 1
             END,
             reset_time = CASE
               WHEN rate_limits.reset_time <= NOW() THEN $2
               ELSE rate_limits.reset_time
             END
       RETURNING hits, reset_time`,
      [scoped, resetTime],
    );

    const row = result.rows[0];
    return {
      totalHits: row.hits,
      resetTime: row.reset_time,
    };
  }

  async decrement(key: string): Promise<void> {
    const pool = await getPool();
    const scoped = this.scopedKey(key);
    await pool.query(
      `UPDATE rate_limits
       SET hits = GREATEST(hits - 1, 0)
       WHERE key = $1 AND reset_time > NOW()`,
      [scoped],
    );
  }

  async resetKey(key: string): Promise<void> {
    const pool = await getPool();
    const scoped = this.scopedKey(key);
    await pool.query(`DELETE FROM rate_limits WHERE key = $1`, [scoped]);
  }

  async resetAll(): Promise<void> {
    const pool = await getPool();
    await pool.query(
      `DELETE FROM rate_limits WHERE key LIKE $1`,
      [`${this.namespace}:%`],
    );
  }
}

/**
 * Delete all rows in `rate_limits` whose window has already expired.
 * Safe to call at any time; expired rows have no effect on active limiting.
 * Returns the number of rows deleted.
 */
export async function cleanupExpiredRateLimits(): Promise<number> {
  const pool = await getPool();
  const result = await pool.query<{ count: string }>(
    `WITH deleted AS (
       DELETE FROM rate_limits WHERE reset_time < NOW() RETURNING 1
     )
     SELECT COUNT(*)::text AS count FROM deleted`,
  );
  return Number(result.rows[0]?.count ?? 0);
}

/**
 * Start a background interval that purges expired rate-limit rows.
 * @param intervalMs How often to run the cleanup (default: 1 hour).
 * Returns the interval handle so callers can clear it if needed.
 */
export function startRateLimitCleanupJob(
  intervalMs = 60 * 60 * 1000,
): ReturnType<typeof setInterval> {
  async function runCleanup(): Promise<void> {
    try {
      const deleted = await cleanupExpiredRateLimits();
      if (deleted > 0) {
        logger.info({ deleted }, "rate_limits cleanup: expired rows removed");
      }
    } catch (err) {
      logger.error({ err }, "rate_limits cleanup: failed");
    }
  }

  // Run once immediately to clear any stale rows left over from before restart.
  void runCleanup();

  const handle = setInterval(runCleanup, intervalMs);

  // Allow the Node.js process to exit even if this interval is still pending.
  handle.unref();

  logger.info(
    { intervalMs },
    "rate_limits cleanup job scheduled",
  );

  return handle;
}
