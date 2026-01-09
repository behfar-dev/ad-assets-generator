import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// DELETE /api/projects/[id]/delete-asset/[assetId] - Delete brand asset
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; assetId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, assetId } = await params;

    // Get project and verify ownership
    const project = await prisma.project.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Get asset and verify it belongs to this project
    const asset = await prisma.brandAsset.findFirst({
      where: {
        id: assetId,
        projectId: id,
      },
    });

    if (!asset) {
      return NextResponse.json({ error: "Asset not found" }, { status: 404 });
    }

    // Delete asset from database (Supabase cleanup happens via CASCADE or manually if needed)
    await prisma.brandAsset.delete({
      where: { id: assetId },
    });

    return NextResponse.json({
      success: true,
      message: "Asset deleted successfully",
    });
  } catch (error) {
    console.error("Delete asset error:", error);
    return NextResponse.json(
      { error: "Failed to delete asset" },
      { status: 500 }
    );
  }
}
