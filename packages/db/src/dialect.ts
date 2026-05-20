export type DbDialect = "postgresql";

export function resolveDbDialect(): DbDialect {
  return "postgresql";
}

export function isPostgresDialect(): boolean {
  return true;
}
