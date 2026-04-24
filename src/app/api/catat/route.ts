import { auth } from "@/lib/auth";
import { db } from "@/db";
import { userNotes } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

const MAX_CONTENT_LENGTH = 200000;

function sanitizeRichText(input: string): string {
  return input
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, "")
    .replace(/\son\w+="[^"]*"/gi, "")
    .replace(/\son\w+='[^']*'/gi, "")
    .replace(/javascript:/gi, "");
}

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const note = await db.query.userNotes.findFirst({
      where: eq(userNotes.userId, session.user.id),
    });

    return NextResponse.json({
      content: note?.content ?? "",
      updatedAt: note?.updatedAt ?? null,
    });
  } catch (error) {
    console.error("Error fetching note:", error);
    return NextResponse.json(
      { error: "Failed to fetch note" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    if (typeof body?.content !== "string") {
      return NextResponse.json({ error: "Content must be a string" }, { status: 400 });
    }

    const sanitizedContent = sanitizeRichText(body.content).slice(0, MAX_CONTENT_LENGTH);

    const now = new Date();
    const [note] = await db
      .insert(userNotes)
      .values({
        userId: session.user.id,
        content: sanitizedContent,
        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: userNotes.userId,
        set: {
          content: sanitizedContent,
          updatedAt: now,
        },
      })
      .returning();

    return NextResponse.json({
      content: note.content,
      updatedAt: note.updatedAt,
    });
  } catch (error) {
    console.error("Error saving note:", error);
    return NextResponse.json(
      { error: "Failed to save note" },
      { status: 500 }
    );
  }
}
