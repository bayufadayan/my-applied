import { auth } from "@/lib/auth";
import { db } from "@/db";
import { jobApplications } from "@/db/schema";
import { NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";

// GET single job application
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const application = await db.query.jobApplications.findFirst({
      where: and(
        eq(jobApplications.id, id),
        eq(jobApplications.userId, session.user.id)
      ),
      with: {
        platform: true,
      },
    });

    if (!application) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(application);
  } catch (error) {
    console.error("Error fetching application:", error);
    return NextResponse.json(
      { error: "Failed to fetch application" },
      { status: 500 }
    );
  }
}

// PUT update job application
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();

    const updatedApp = await db
      .update(jobApplications)
      .set({
        ...body,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(jobApplications.id, id),
          eq(jobApplications.userId, session.user.id)
        )
      )
      .returning();

    if (!updatedApp.length) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedApp[0]);
  } catch (error) {
    console.error("Error updating application:", error);
    return NextResponse.json(
      { error: "Failed to update application" },
      { status: 500 }
    );
  }
}

// DELETE job application
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const deletedApp = await db
      .delete(jobApplications)
      .where(
        and(
          eq(jobApplications.id, id),
          eq(jobApplications.userId, session.user.id)
        )
      )
      .returning();

    if (!deletedApp.length) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Application deleted successfully" });
  } catch (error) {
    console.error("Error deleting application:", error);
    return NextResponse.json(
      { error: "Failed to delete application" },
      { status: 500 }
    );
  }
}
