import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Helper to check admin
async function checkAdmin(session: { user?: { id?: string } } | null) {
  if (!session?.user?.id) return false;
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });
  return user?.role === "ADMIN";
}

// GET /api/admin/credits/stats - Get credit statistics
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!(await checkAdmin(session))) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get total credits issued (positive transactions)
    const issuedResult = await prisma.creditTransaction.aggregate({
      where: { amount: { gt: 0 } },
      _sum: { amount: true },
    });
    const totalIssued = issuedResult._sum.amount || 0;

    // Get total credits spent (negative transactions, excluding refunds)
    const spentResult = await prisma.creditTransaction.aggregate({
      where: {
        amount: { lt: 0 },
        type: { not: "REFUND" },
      },
      _sum: { amount: true },
    });
    const totalSpent = Math.abs(spentResult._sum.amount || 0);

    // Get total refunds
    const refundResult = await prisma.creditTransaction.aggregate({
      where: { type: "REFUND" },
      _sum: { amount: true },
    });
    const totalRefunded = refundResult._sum.amount || 0;

    // Get average balance per user
    const balanceResult = await prisma.credits.aggregate({
      _avg: { balance: true },
    });
    const averageBalance = balanceResult._avg.balance || 0;

    return NextResponse.json({
      stats: {
        totalIssued,
        totalSpent,
        totalRefunded,
        averageBalance,
      },
    });
  } catch (error) {
    console.error("Get credit stats error:", error);
    return NextResponse.json(
      { error: "Failed to get credit stats" },
      { status: 500 }
    );
  }
}
