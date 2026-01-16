import { auth } from "@/lib/auth";
import { db } from "@/db";
import { jobApplications } from "@/db/schema";
import { NextResponse } from "next/server";
import { eq, desc } from "drizzle-orm";

// GET all job applications for current user
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const applications = await db.query.jobApplications.findMany({
      where: eq(jobApplications.userId, session.user.id),
      with: {
        platform: true,
      },
      orderBy: [desc(jobApplications.appliedDate)],
    });

    return NextResponse.json(applications);
  } catch (error) {
    console.error("Error fetching applications:", error);
    return NextResponse.json(
      { error: "Failed to fetch applications" },
      { status: 500 }
    );
  }
}

// POST create new job application
export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    const application = await db
      .insert(jobApplications)
      .values({
        userId: session.user.id,
        ...body,
      })
      .returning();

    return NextResponse.json(application[0], { status: 201 });
  } catch (error) {
    console.error("Error creating application:", error);
    return NextResponse.json(
      { error: "Failed to create application" },
      { status: 500 }
    );
  }
}
