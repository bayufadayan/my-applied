import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL!;

const postgresConfig = {
  // Use pooler connection safely with Supabase.
  prepare: false,
  ssl: "require" as const,
  // Keep local/runtime pool tiny to avoid exhausting Supabase Session mode clients.
  max: 3,
  idle_timeout: 20,
  connect_timeout: 10,
};

type PostgresClient = ReturnType<typeof postgres>;

const globalForDb = globalThis as typeof globalThis & {
  __myAppliedDbClient?: PostgresClient;
};

const client =
  globalForDb.__myAppliedDbClient ?? postgres(connectionString, postgresConfig);

if (process.env.NODE_ENV !== "production") {
  globalForDb.__myAppliedDbClient = client;
}

export const db = drizzle(client, { schema });
