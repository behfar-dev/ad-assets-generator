import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

// GET /api/assets/history - Get user's asset generation history with advanced filtering
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 100);
    const type = searchParams.get("type");
    const projectId = searchParams.get("projectId");
    const search = searchParams.get("search");
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");

    const skip = (page - 1) * limit;

    // Build where clause
    const where: Prisma.AssetWhereInput = {
      userId: session.user.id,
    };

    if (type && ["IMAGE", "VIDEO", "COPY"].includes(type)) {
      where.type = type as "IMAGE" | "VIDEO" | "COPY";
    }

    if (projectId) {
      where.projectId = projectId;
    }

    // Search by prompt keywords (case-insensitive)
    if (search) {
      where.prompt = {
        contains: search,
        mode: "insensitive",
      };
    }

    // Date range filtering
    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) {
        const fromDate = new Date(dateFrom);
        fromDate.setHours(0, 0, 0, 0);
        where.createdAt.gte = fromDate;
      }
      if (dateTo) {
        const toDate = new Date(dateTo);
        toDate.setHours(23, 59, 59, 999);
        where.createdAt.lte = toDate;
      }
    }

    // Get assets with pagination
    const [assets, totalCount] = await Promise.all([
      prisma.asset.findMany({
        where,
        orderBy: { createdAt: "desc" },
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
      }),
      prisma.asset.count({ where }),
    ]);

    // Calculate credits summary for the filtered results
    // We use a separate query to get totals across all matching assets (not just current page)
    const creditsSummary = await prisma.asset.groupBy({
      by: ["type"],
      where,
      _sum: {
        creditCost: true,
      },
    });

    // Transform credits summary into structured format
    const creditsMap: Record<string, number> = {};
    creditsSummary.forEach((item) => {
      creditsMap[item.type] = item._sum.creditCost || 0;
    });

    const formattedCreditsSummary = {
      totalSpent:
        (creditsMap["IMAGE"] || 0) +
        (creditsMap["VIDEO"] || 0) +
        (creditsMap["COPY"] || 0),
      imageCredits: creditsMap["IMAGE"] || 0,
      videoCredits: creditsMap["VIDEO"] || 0,
      copyCredits: creditsMap["COPY"] || 0,
    };

    return NextResponse.json({
      assets,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasMore: skip + assets.length < totalCount,
      },
      creditsSummary: formattedCreditsSummary,
    });
  } catch (error) {
    console.error("Get asset history error:", error);
    return NextResponse.json(
      { error: "Failed to get asset history" },
      { status: 500 }
    );
  }
}
