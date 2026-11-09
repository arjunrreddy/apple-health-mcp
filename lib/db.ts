import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "@/db/schema";
import { requireEnv } from "@/lib/env";

// Plain Postgres over TCP (Railway Postgres). The server is a long-running Node
// process, so one small pool lives for the life of the process.
// Session timezone is set so date_trunc('day', ...) buckets by local calendar day
// instead of UTC (otherwise an 8pm dinner lands on tomorrow).
// Lazily constructed: importing a route must not require DATABASE_URL at import time
// (keeps unit tests hermetic; the DB is only touched when a request actually runs).
let _db: NodePgDatabase<typeof schema> | null = null;

export function getDb(): NodePgDatabase<typeof schema> {
  if (!_db) {
    const tz = process.env.USER_TZ || "America/Chicago";
    const pool = new Pool({
      connectionString: requireEnv("DATABASE_URL"),
      max: 5,
      options: `-c timezone=${tz}`,
    });
    _db = drizzle(pool, { schema });
  }
  return _db;
}
