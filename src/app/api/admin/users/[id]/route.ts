import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
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

// GET /api/admin/users/[id] - Get single user details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!(await checkAdmin(session))) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;

    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        credits: true,
        creditTransactions: {
          orderBy: { createdAt: "desc" },
          take: 20,
        },
        _count: {
          select: { projects: true, assets: true },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error("Get user error:", error);
    return NextResponse.json({ error: "Failed to get user" }, { status: 500 });
  }
}

// PATCH /api/admin/users/[id] - Update user (role, credits)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!(await checkAdmin(session))) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const { role, creditAdjustment, creditReason } = await request.json();

    // Update user role if provided
    if (role) {
      await prisma.user.update({
        where: { id },
        data: { role },
      });
    }

    // Adjust credits if provided
    if (creditAdjustment && creditAdjustment !== 0) {
      await prisma.credits.upsert({
        where: { userId: id },
        update: {
          balance: { increment: creditAdjustment },
        },
        create: {
          userId: id,
          balance: creditAdjustment > 0 ? creditAdjustment : 0,
        },
      });

      // Log the transaction
      await prisma.creditTransaction.create({
        data: {
          userId: id,
          amount: creditAdjustment,
          type: creditAdjustment > 0 ? "ADMIN_GRANT" : "ADMIN_DEDUCT",
          description:
            creditReason ||
            `Admin ${creditAdjustment > 0 ? "granted" : "deducted"} ${Math.abs(creditAdjustment)} credits`,
        },
      });
    }

    return NextResponse.json({ message: "User updated successfully" });
  } catch (error) {
    console.error("Update user error:", error);
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/users/[id] - Delete/ban user
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!(await checkAdmin(session))) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;

    // Prevent self-deletion
    if (session?.user?.id === id) {
      return NextResponse.json(
        { error: "Cannot delete your own account" },
        { status: 400 }
      );
    }

    await prisma.user.delete({
      where: { id },
    });

    return NextResponse.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Delete user error:", error);
    return NextResponse.json(
      { error: "Failed to delete user" },
      { status: 500 }
    );
  }
}
