import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { jobApplications } from "@/db/schema";
import { and, eq, inArray, lt, or, sql } from "drizzle-orm";

export const dynamic = "force-dynamic";
export const maxDuration = 60; // Maximum execution time for the function

export async function GET(request: NextRequest) {
  try {
    // Verify cron secret to prevent unauthorized access
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Calculate the date 35 days ago
    const thirtyFiveDaysAgo = new Date();
    thirtyFiveDaysAgo.setDate(thirtyFiveDaysAgo.getDate() - 35);

    // Find applications that:
    // 1. Have status 'none', 'applied', or 'interview'
    // 2. Haven't been updated in the last 35 days
    const applicationsToUpdate = await db
      .select()
      .from(jobApplications)
      .where(
        and(
          or(
            eq(jobApplications.status, "none"),
            eq(jobApplications.status, "applied"),
            eq(jobApplications.status, "interview")
          ),
          lt(jobApplications.updatedAt, thirtyFiveDaysAgo)
        )
      );

    // Update all found applications to 'unresponded'
    const updatedCount = applicationsToUpdate.length;

    if (updatedCount > 0) {
      const applicationIds = applicationsToUpdate.map((app) => app.id);

      await db
        .update(jobApplications)
        .set({
          status: "unresponded",
          updatedAt: new Date(),
        })
        .where(inArray(jobApplications.id, applicationIds));
    }

    return NextResponse.json({
      success: true,
      message: `Successfully updated ${updatedCount} applications to 'unresponded'`,
      updatedCount,
      checkedStatuses: ["none", "applied", "interview"],
      dayThreshold: 35,
    });
  } catch (error) {
    console.error("Error updating unresponded applications:", error);
    return NextResponse.json(
      {
        error: "Failed to update applications",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// Also support POST method for flexibility
export async function POST(request: NextRequest) {
  return GET(request);
}
