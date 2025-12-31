import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/assets - Get user's assets with filtering and pagination
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const type = searchParams.get("type"); // IMAGE, VIDEO
    const aspectRatio = searchParams.get("aspectRatio");
    const projectId = searchParams.get("projectId");
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    const skip = (page - 1) * limit;

    // Build where clause
    const where: Record<string, unknown> = {
      userId: session.user.id,
    };

    if (type) {
      where.type = type;
    }

    if (aspectRatio) {
      where.aspectRatio = aspectRatio;
    }

    if (projectId) {
      where.projectId = projectId;
    }

    // Get total count for pagination
    const totalCount = await prisma.asset.count({ where });

    // Get assets with sorting
    const assets = await prisma.asset.findMany({
      where,
      orderBy: {
        [sortBy]: sortOrder,
      },
      skip,
      take: limit,
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json({
      assets,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasMore: skip + assets.length < totalCount,
      },
    });
  } catch (error) {
    console.error("Get assets error:", error);
    return NextResponse.json(
      { error: "Failed to get assets" },
      { status: 500 }
    );
  }
}

// POST /api/assets - Create a new asset (used after generation)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { type, aspectRatio, url, prompt, projectId, settings, metadata } =
      await request.json();

    if (!type || !aspectRatio || !url) {
      return NextResponse.json(
        { error: "Missing required fields: type, aspectRatio, url" },
        { status: 400 }
      );
    }

    // Verify project belongs to user if provided
    if (projectId) {
      const project = await prisma.project.findFirst({
        where: {
          id: projectId,
          userId: session.user.id,
        },
      });

      if (!project) {
        return NextResponse.json(
          { error: "Project not found" },
          { status: 404 }
        );
      }
    }

    const asset = await prisma.asset.create({
      data: {
        userId: session.user.id,
        projectId: projectId || null,
        type,
        aspectRatio,
        url,
        prompt: prompt || null,
        settings: settings || metadata || null, // Use settings, fallback to metadata for backward compatibility
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json({ asset }, { status: 201 });
  } catch (error) {
    console.error("Create asset error:", error);
    return NextResponse.json(
      { error: "Failed to create asset" },
      { status: 500 }
    );
  }
}
