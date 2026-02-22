import { db } from "@/db";
import { platforms } from "@/db/schema";
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

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name } = body;

    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: "Platform name is required" },
        { status: 400 }
      );
    }

    const [newPlatform] = await db
      .insert(platforms)
      .values({ name: name.trim() })
      .returning();

    return NextResponse.json(newPlatform, { status: 201 });
  } catch (error) {
    console.error("Error creating platform:", error);
    return NextResponse.json(
      { error: "Failed to create platform" },
      { status: 500 }
    );
  }
}
