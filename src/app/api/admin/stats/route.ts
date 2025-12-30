import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get stats
    const [
      totalUsers,
      totalCredits,
      totalRevenue,
      assetsGenerated,
      projectsCreated,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.credits.aggregate({
        _sum: { balance: true },
      }),
      prisma.payment.aggregate({
        where: { status: "COMPLETED" },
        _sum: { amount: true },
      }),
      prisma.asset.count(),
      prisma.project.count(),
    ]);

    // Get active users (logged in last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const activeUsers = await prisma.session.groupBy({
      by: ["userId"],
      where: {
        expires: { gte: thirtyDaysAgo },
      },
    });

    return NextResponse.json({
      stats: {
        totalUsers,
        activeUsers: activeUsers.length,
        totalCredits: totalCredits._sum.balance || 0,
        totalRevenue: totalRevenue._sum.amount || 0,
        assetsGenerated,
        projectsCreated,
      },
    });
  } catch (error) {
    console.error("Get admin stats error:", error);
    return NextResponse.json(
      { error: "Failed to get stats" },
      { status: 500 }
    );
  }
}
