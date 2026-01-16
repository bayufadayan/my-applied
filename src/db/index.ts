import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL!;

// Use pooler connection - disable prefetch for transaction pooling mode
const client = postgres(connectionString, { 
  prepare: false,
  ssl: 'require'
});

export const db = drizzle(client, { schema });
