import { createRequire } from "node:module";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { afterAll } from "vitest";

process.env.JWT_SECRET =
  process.env.JWT_SECRET ?? "vitest-jwt-secret-32-chars-min____________";

type PgClient = {
  connect(): Promise<void>;
  query(statement: string): Promise<unknown>;
  end(): Promise<void>;
};

const requireFromDbPackage = createRequire(
  pathToFileURL(path.resolve(process.cwd(), "../../packages/db/package.json")).href,
);
const { Client } = requireFromDbPackage("pg") as {
  Client: new (config: { connectionString: string }) => PgClient;
};

function requirePostgresUrl() {
  const url = process.env.TEST_DATABASE_URL?.trim() || process.env.DATABASE_URL?.trim();
  if (!url) {
    throw new Error(
      "Les tests API utilisent PostgreSQL. Definis DATABASE_URL dans .env ou TEST_DATABASE_URL.",
    );
  }
  if (!/^postgres(?:ql)?:\/\//i.test(url)) {
    throw new Error("DATABASE_URL/TEST_DATABASE_URL doit pointer vers PostgreSQL.");
  }
  return url;
}

function preferUnpooledNeonUrl(url: string) {
  const parsed = new URL(url);
  parsed.hostname = parsed.hostname.replace("-pooler.", ".");
  return parsed.toString();
}

function quoteIdentifier(value: string) {
  if (!/^[A-Za-z_]\w*$/.test(value)) {
    throw new Error(`Identifiant SQL invalide: ${value}`);
  }
  return `"${value}"`;
}

const databaseUrl = preferUnpooledNeonUrl(requirePostgresUrl());
const testSchema =
  process.env.TEST_DATABASE_SCHEMA?.trim() ||
  `diayko_test_${process.pid}_${Date.now()}`;
const quotedSchema = quoteIdentifier(testSchema);

process.env.DATABASE_URL = databaseUrl;
process.env.DATABASE_SCHEMA = testSchema;

const pgSchema = [
  `CREATE TABLE IF NOT EXISTS users (
    id varchar PRIMARY KEY,
    email varchar UNIQUE,
    first_name varchar,
    last_name varchar,
    profile_image_url varchar,
    name text,
    bio text,
    password_hash varchar,
    role varchar NOT NULL DEFAULT 'user',
    token_version integer NOT NULL DEFAULT 0,
    rating numeric(3, 2) NOT NULL DEFAULT '5.00',
    review_count integer NOT NULL DEFAULT 0,
    item_count integer NOT NULL DEFAULT 0,
    followers_count integer NOT NULL DEFAULT 0,
    following_count integer NOT NULL DEFAULT 0,
    verified boolean NOT NULL DEFAULT false,
    seller_status text NOT NULL DEFAULT 'none',
    created_at timestamp NOT NULL DEFAULT now(),
    updated_at timestamp NOT NULL DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS sessions (
    sid varchar PRIMARY KEY,
    sess jsonb NOT NULL,
    expire timestamp NOT NULL
  )`,
  `CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON sessions (expire)`,
  `CREATE TABLE IF NOT EXISTS items (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    title text NOT NULL,
    brand text NOT NULL,
    price numeric(10, 2) NOT NULL,
    original_price numeric(10, 2),
    size text NOT NULL,
    condition text NOT NULL,
    category text NOT NULL,
    description text NOT NULL,
    color text,
    seller_id varchar NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    likes_count integer NOT NULL DEFAULT 0,
    views_count integer NOT NULL DEFAULT 0,
    status text NOT NULL DEFAULT 'available',
    created_at timestamp NOT NULL DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS item_images (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    item_id uuid NOT NULL REFERENCES items(id) ON DELETE CASCADE,
    url text NOT NULL,
    position integer NOT NULL DEFAULT 0
  )`,
  `CREATE TABLE IF NOT EXISTS conversations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    buyer_id varchar NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    seller_id varchar NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    item_id uuid REFERENCES items(id) ON DELETE SET NULL,
    unread_count integer NOT NULL DEFAULT 0,
    buyer_unread_count integer NOT NULL DEFAULT 0,
    seller_unread_count integer NOT NULL DEFAULT 0,
    last_message text,
    last_message_at timestamp,
    created_at timestamp NOT NULL DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS messages (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id uuid NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id varchar NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    text text NOT NULL,
    created_at timestamp NOT NULL DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS likes (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id varchar NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    item_id uuid NOT NULL REFERENCES items(id) ON DELETE CASCADE,
    created_at timestamp NOT NULL DEFAULT now(),
    UNIQUE (user_id, item_id)
  )`,
  `CREATE TABLE IF NOT EXISTS orders (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    buyer_id varchar NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    seller_id varchar NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    item_id uuid NOT NULL REFERENCES items(id) ON DELETE RESTRICT,
    total_price numeric(10, 2) NOT NULL,
    status text NOT NULL DEFAULT 'processing',
    payment_method text NOT NULL,
    carrier text,
    tracking_id text,
    eta text,
    delivery_address jsonb,
    created_at timestamp NOT NULL DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS order_events (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    label text NOT NULL,
    position integer NOT NULL,
    done boolean NOT NULL DEFAULT false,
    occurred_at timestamp
  )`,
  `CREATE TABLE IF NOT EXISTS reviews (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    reviewer_id varchar NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rating integer NOT NULL,
    comment text,
    created_at timestamp NOT NULL DEFAULT now(),
    UNIQUE (order_id, reviewer_id)
  )`,
  `CREATE TABLE IF NOT EXISTS rate_limits (
    key varchar PRIMARY KEY,
    hits integer NOT NULL DEFAULT 0,
    reset_time timestamp NOT NULL
  )`,
  `CREATE INDEX IF NOT EXISTS "IDX_rate_limits_reset_time" ON rate_limits (reset_time)`,
  `CREATE TABLE IF NOT EXISTS auth_tokens (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id varchar NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type text NOT NULL,
    token varchar NOT NULL UNIQUE,
    expires_at timestamp NOT NULL,
    created_at timestamp NOT NULL DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS notifications (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id varchar NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title text NOT NULL,
    body text NOT NULL,
    read boolean NOT NULL DEFAULT false,
    created_at timestamp NOT NULL DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS wallets (
    user_id varchar PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    available numeric(12, 2) NOT NULL DEFAULT 0,
    pending numeric(12, 2) NOT NULL DEFAULT 0,
    currency text NOT NULL DEFAULT 'XOF',
    updated_at timestamp NOT NULL DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS wallet_withdrawals (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id varchar NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    amount numeric(12, 2) NOT NULL,
    method text NOT NULL,
    phone text NOT NULL,
    status text NOT NULL DEFAULT 'pending',
    created_at timestamp NOT NULL DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS support_tickets (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id varchar NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    subject text NOT NULL,
    message text NOT NULL,
    status text NOT NULL DEFAULT 'open',
    created_at timestamp NOT NULL DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS conversation_reports (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id uuid NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    reporter_id varchar NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reason text NOT NULL,
    details text,
    created_at timestamp NOT NULL DEFAULT now()
  )`,
];

async function createPostgresTestSchema() {
  const client = new Client({ connectionString: databaseUrl });
  await client.connect();
  try {
    await client.query(`CREATE EXTENSION IF NOT EXISTS pgcrypto`);
    await client.query(`DROP SCHEMA IF EXISTS ${quotedSchema} CASCADE`);
    await client.query(`CREATE SCHEMA ${quotedSchema}`);
    await client.query(`SET search_path TO ${quotedSchema}`);
    for (const statement of pgSchema) {
      await client.query(statement);
    }
  } finally {
    await client.end();
  }
}

await createPostgresTestSchema();

afterAll(async () => {
  const { pool } = await import("@workspace/db");
  await pool.end();

  const client = new Client({ connectionString: databaseUrl });
  await client.connect();
  try {
    await client.query(`DROP SCHEMA IF EXISTS ${quotedSchema} CASCADE`);
  } finally {
    await client.end();
  }
});
