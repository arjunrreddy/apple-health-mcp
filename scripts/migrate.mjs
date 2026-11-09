// Applies the SQL migrations in ./drizzle before the server starts.
// Uses drizzle-orm's runtime migrator (a regular dependency), so it works even
// when the host prunes devDependencies like drizzle-kit. Safe to run on every
// boot: already-applied migrations are skipped.
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import pg from "pg";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("[migrate] DATABASE_URL is not set");
  process.exit(1);
}

const pool = new pg.Pool({ connectionString: url, max: 1 });
try {
  await migrate(drizzle(pool), { migrationsFolder: "./drizzle" });
  console.log("[migrate] done");
} finally {
  await pool.end();
}
