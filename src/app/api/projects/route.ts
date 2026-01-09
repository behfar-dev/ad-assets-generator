import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  createProjectSchema,
  paginationSchema,
  validateRequest,
} from "@/lib/validations";
import { checkApiRateLimit } from "@/lib/rate-limit";

// GET /api/projects - Get user's projects
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check rate limit
    const rateLimitResult = checkApiRateLimit(request, "READ", session.user.id);
    if (!rateLimitResult.allowed) {
      return rateLimitResult.response;
    }

    const { searchParams } = new URL(request.url);
    const paginationValidation = validateRequest(paginationSchema, {
      page: searchParams.get("page"),
      limit: searchParams.get("limit"),
    });

    const { page, limit } = paginationValidation.success
      ? paginationValidation.data
      : { page: 1, limit: 12 };
    const skip = (page - 1) * limit;

    const [projects, total] = await Promise.all([
      prisma.project.findMany({
        where: { userId: session.user.id },
        orderBy: { updatedAt: "desc" },
        skip,
        take: limit,
        include: {
          _count: {
            select: { assets: true },
          },
          brandAssets: true,
        },
      }),
      prisma.project.count({
        where: { userId: session.user.id },
      }),
    ]);

    return NextResponse.json({
      projects: projects.map((p) => ({
        ...p,
        assetCount: p._count.assets,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get projects error:", error);
    return NextResponse.json(
      { error: "Failed to get projects" },
      { status: 500 }
    );
  }
}

// POST /api/projects - Create a new project
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check rate limit
    const rateLimitResult = checkApiRateLimit(request, "WRITE", session.user.id);
    if (!rateLimitResult.allowed) {
      return rateLimitResult.response;
    }

    const body = await request.json();
    const validation = validateRequest(createProjectSchema, body);
    if (!validation.success) {
      return validation.error;
    }

    const { name, description, websiteUrl } = validation.data;

    const project = await prisma.project.create({
      data: {
        userId: session.user.id,
        name,
        description,
        websiteUrl,
        extractionStatus: websiteUrl ? null : null,
      },
    });

    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    console.error("Create project error:", error);
    return NextResponse.json(
      { error: "Failed to create project" },
      { status: 500 }
    );
  }
}
