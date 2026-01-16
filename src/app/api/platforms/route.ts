import { db } from "@/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const allPlatforms = await db.query.platforms.findMany({
      orderBy: (platforms, { asc }) => [asc(platforms.name)],
    });

    return NextResponse.json(allPlatforms);
  } catch (error) {
    console.error("Error fetching platforms:", error);
    return NextResponse.json(
      { error: "Failed to fetch platforms" },
      { status: 500 }
    );
  }
}
