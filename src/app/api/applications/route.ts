import { auth } from "@/lib/auth";
import { db } from "@/db";
import { jobApplications } from "@/db/schema";
import { NextResponse } from "next/server";
import { eq, desc, asc, and } from "drizzle-orm";

// GET all job applications for current user
export async function GET(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const sortBy = searchParams.get("sortBy") || "newest";
    const includeArchived = searchParams.get("includeArchived") === "true";
    const whereClause = includeArchived
      ? eq(jobApplications.userId, session.user.id)
      : and(
          eq(jobApplications.userId, session.user.id),
          eq(jobApplications.isArchived, false)
        );

    let orderBy;
    let applications;

    // Status priority mapping (higher number = higher priority)
    const statusPriority: Record<string, number> = {
      offer: 8,
      interview: 7,
      test: 6,
      applied: 5,
      none: 4,
      unresponded: 3,
      closed: 2,
      reject: 1,
    };

    switch (sortBy) {
      case "oldest":
        orderBy = [desc(jobApplications.isPinned), asc(jobApplications.createdAt)];
        break;
      case "company-az":
        orderBy = [desc(jobApplications.isPinned), asc(jobApplications.companyName)];
        break;
      case "company-za":
        orderBy = [desc(jobApplications.isPinned), desc(jobApplications.companyName)];
        break;
      case "position-az":
        orderBy = [desc(jobApplications.isPinned), asc(jobApplications.position)];
        break;
      case "position-za":
        orderBy = [desc(jobApplications.isPinned), desc(jobApplications.position)];
        break;
      case "salary-high":
        orderBy = [desc(jobApplications.isPinned), desc(jobApplications.salaryMax), desc(jobApplications.salaryMin)];
        break;
      case "salary-low":
        orderBy = [desc(jobApplications.isPinned), asc(jobApplications.salaryMin), asc(jobApplications.salaryMax)];
        break;
      case "status-high":
      case "status-low":
        // For status sorting, we'll fetch all and sort in memory
        const allApps = await db.query.jobApplications.findMany({
          where: whereClause,
          with: {
            platform: true,
          },
        });
        
        applications = allApps.sort((a, b) => {
          // First sort by pinned status
          if (a.isPinned !== b.isPinned) {
            return a.isPinned ? -1 : 1;
          }
          
          // Then by status priority
          const priorityA = statusPriority[a.status] || 0;
          const priorityB = statusPriority[b.status] || 0;
          return sortBy === "status-high" 
            ? priorityB - priorityA  // Descending (highest first)
            : priorityA - priorityB; // Ascending (lowest first)
        });
        break;
      case "newest":
      default:
        orderBy = [desc(jobApplications.isPinned), desc(jobApplications.createdAt)];
        break;
    }

    // If not status sorting, fetch normally with orderBy
    if (!applications) {
      applications = await db.query.jobApplications.findMany({
        where: whereClause,
        with: {
          platform: true,
        },
        orderBy,
      });
    }

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

    // Convert appliedDate string to Date object
    const applicationData = {
      ...body,
      appliedDate: body.appliedDate ? new Date(body.appliedDate) : new Date(),
      deadline: body.deadline ? new Date(body.deadline) : null,
    };

    const application = await db
      .insert(jobApplications)
      .values({
        userId: session.user.id,
        ...applicationData,
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
