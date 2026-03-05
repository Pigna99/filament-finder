import postgres from "postgres";

declare global {
  // eslint-disable-next-line no-var
  var _sql: ReturnType<typeof postgres> | undefined;
}

// Singleton per evitare troppi pool in dev con HMR
const sql =
  globalThis._sql ??
  postgres(process.env.DATABASE_URL!, {
    max: 10,
    idle_timeout: 20,
    connect_timeout: 10,
  });

if (process.env.NODE_ENV !== "production") {
  globalThis._sql = sql;
}

export { sql };
