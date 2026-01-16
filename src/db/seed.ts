import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { platforms } from "./schema";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

export async function seedPlatforms() {
  const platformData = [
    { name: "LinkedIn", icon: null },
    { name: "JobStreet", icon: null },
    { name: "Glints", icon: null },
    { name: "Kalibrr", icon: null },
    { name: "Indeed", icon: null },
    { name: "Instagram", icon: null },
    { name: "Twitter/X", icon: null },
    { name: "Facebook", icon: null },
    { name: "Telegram", icon: null },
    { name: "WhatsApp", icon: null },
    { name: "Email Langsung", icon: null },
    { name: "Website Perusahaan", icon: null },
    { name: "Referral", icon: null },
    { name: "Job Fair", icon: null },
    { name: "Lainnya", icon: null },
  ];

  // Create dedicated connection for seeding
  const connectionString = process.env.DATABASE_URL!;
  const client = postgres(connectionString, {
    max: 1,
    ssl: 'require',
    connect_timeout: 10,
  });
  const db = drizzle(client, { schema: { platforms } });

  try {
    console.log("🌱 Seeding platforms...");
    
    for (const platform of platformData) {
      await db.insert(platforms).values(platform).onConflictDoNothing();
    }
    
    console.log("✅ Platforms seeded successfully!");
  } catch (error) {
    console.error("❌ Error seeding platforms:", error);
    throw error;
  } finally {
    await client.end();
  }
}

// Run seeder if this file is executed directly
if (require.main === module) {
  seedPlatforms()
    .then(() => {
      console.log("✨ Seeding completed!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Failed to seed:", error);
      process.exit(1);
    });
}
