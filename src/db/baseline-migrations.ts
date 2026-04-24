import fs from "node:fs";
import path from "node:path";
import * as dotenv from "dotenv";
import postgres from "postgres";

dotenv.config({ path: ".env.local" });

async function run() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error("DATABASE_URL is missing in environment");
  }

  const journalPath = path.join(process.cwd(), "src", "db", "migrations", "meta", "_journal.json");
  const journalRaw = fs.readFileSync(journalPath, "utf-8");
  const journal = JSON.parse(journalRaw) as {
    entries: Array<{ idx: number; when: number; tag: string }>;
  };

  if (!journal.entries?.length) {
    throw new Error("Migration journal is empty");
  }

  const sql = postgres(databaseUrl, {
    prepare: false,
    ssl: "require",
    max: 1,
  });

  try {
    await sql`create schema if not exists drizzle`;
    await sql`
      create table if not exists drizzle.__drizzle_migrations (
        id serial primary key,
        hash text not null,
        created_at bigint
      )
    `;

    const [existing] = await sql<{ created_at: number }[]>`
      select created_at from drizzle.__drizzle_migrations order by created_at desc limit 1
    `;

    if (existing?.created_at) {
      console.log(`Baseline skipped: migration history already exists (${existing.created_at}).`);
      return;
    }

    const [usersTable] = await sql<{ regclass: string | null }[]>`
      select to_regclass('public.users') as regclass
    `;

    if (!usersTable?.regclass) {
      throw new Error(
        "Detected empty schema (public.users not found). Do not run baseline on a fresh database. Use npm run db:migrate instead."
      );
    }

    const [userNotesTable] = await sql<{ regclass: string | null }[]>`
      select to_regclass('public.user_notes') as regclass
    `;

    const latestEntry = journal.entries[journal.entries.length - 1];
    const previousEntry = journal.entries[journal.entries.length - 2];

    const targetEntry = userNotesTable?.regclass ? latestEntry : previousEntry;

    if (!targetEntry) {
      throw new Error("Cannot determine baseline migration target");
    }

    await sql`
      insert into drizzle.__drizzle_migrations (hash, created_at)
      values (${`baseline:${targetEntry.tag}`}, ${targetEntry.when})
    `;

    console.log(
      `Baseline inserted at ${targetEntry.tag} (${targetEntry.when}). Next npm run db:migrate will continue from this point.`
    );
  } finally {
    await sql.end();
  }
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
