import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/credits - Get user's credit balance
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const credits = await prisma.credits.findUnique({
      where: { userId: session.user.id },
    });

    if (!credits) {
      // Create credits record if it doesn't exist
      const newCredits = await prisma.credits.create({
        data: {
          userId: session.user.id,
          balance: 0,
        },
      });
      return NextResponse.json({ balance: newCredits.balance });
    }

    return NextResponse.json({ balance: credits.balance });
  } catch (error) {
    console.error("Get credits error:", error);
    return NextResponse.json(
      { error: "Failed to get credit balance" },
      { status: 500 }
    );
  }
}
