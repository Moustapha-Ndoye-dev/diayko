import { drizzle as drizzlePg } from "drizzle-orm/node-postgres";
import pg from "pg";

import { drizzleSchemaBundle } from "./schema";

export * from "./dialect";

const { Pool } = pg;

function resolveDatabaseUrl() {
  const url = process.env.DATABASE_URL?.trim();
  if (!url) {
    throw new Error("DATABASE_URL est obligatoire et doit pointer vers PostgreSQL.");
  }
  if (!/^postgres(?:ql)?:\/\//i.test(url)) {
    throw new Error("DATABASE_URL doit pointer vers PostgreSQL.");
  }
  return url;
}

function resolvePoolOptions(): pg.PoolConfig {
  const schema = process.env.DATABASE_SCHEMA?.trim();
  return {
    connectionString: resolveDatabaseUrl(),
    ...(schema ? { options: `-c search_path=${schema}` } : {}),
  };
}

export const pool: pg.Pool = new Pool(resolvePoolOptions());

export const db = drizzlePg(pool, { schema: drizzleSchemaBundle });

export * from "./schema";
