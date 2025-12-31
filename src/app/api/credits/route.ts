import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  checkCreditBalance,
  deductCredits,
  refundCredits,
} from "@/lib/credits";

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

// POST /api/credits - Check balance and optionally deduct credits
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { action, amount, type, description } = await request.json();

    if (action === "check") {
      // Check if user has enough credits
      const { hasEnough, balance } = await checkCreditBalance(
        session.user.id,
        amount
      );
      return NextResponse.json({
        hasEnough,
        balance,
        required: amount,
      });
    }

    if (action === "deduct") {
      if (!amount || !type) {
        return NextResponse.json(
          { error: "Amount and type are required" },
          { status: 400 }
        );
      }

      try {
        const result = await deductCredits(
          session.user.id,
          amount,
          type,
          description
        );
        return NextResponse.json({
          success: true,
          newBalance: result.newBalance,
          transactionId: result.transactionId,
        });
      } catch (error: any) {
        if (error.message === "Insufficient credits") {
          const { balance } = await checkCreditBalance(session.user.id, amount);
          return NextResponse.json(
            {
              error: "Insufficient credits",
              required: amount,
              available: balance,
            },
            { status: 402 }
          );
        }
        throw error;
      }
    }

    return NextResponse.json(
      { error: "Invalid action. Use 'check' or 'deduct'" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Credits operation error:", error);
    return NextResponse.json(
      { error: "Failed to process credit operation" },
      { status: 500 }
    );
  }
}

// PATCH /api/credits - Refund credits
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { amount, type, reason } = await request.json();

    if (!amount || !type) {
      return NextResponse.json(
        { error: "Amount and type are required" },
        { status: 400 }
      );
    }

    const result = await refundCredits(
      session.user.id,
      amount,
      type,
      reason
    );

    return NextResponse.json({
      success: true,
      newBalance: result.newBalance,
    });
  } catch (error) {
    console.error("Refund credits error:", error);
    return NextResponse.json(
      { error: "Failed to refund credits" },
      { status: 500 }
    );
  }
}
