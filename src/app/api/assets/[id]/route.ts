import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/assets/[id] - Get single asset details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const asset = await prisma.asset.findFirst({
      where: {
        id,
        userId: session.user.id,
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

    if (!asset) {
      return NextResponse.json({ error: "Asset not found" }, { status: 404 });
    }

    return NextResponse.json({ asset });
  } catch (error) {
    console.error("Get asset error:", error);
    return NextResponse.json(
      { error: "Failed to get asset" },
      { status: 500 }
    );
  }
}

// PATCH /api/assets/[id] - Update asset (move to project, update metadata)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { projectId, settings, metadata, isFavorite } = await request.json();

    // Verify asset belongs to user
    const existingAsset = await prisma.asset.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!existingAsset) {
      return NextResponse.json({ error: "Asset not found" }, { status: 404 });
    }

    // If moving to a project, verify project belongs to user
    if (projectId !== undefined && projectId !== null) {
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

    // Build update data
    const updateData: Record<string, unknown> = {};

    if (projectId !== undefined) {
      updateData.projectId = projectId;
    }

    // Use settings, fallback to metadata for backward compatibility
    const settingsToUpdate = settings || metadata;
    if (settingsToUpdate !== undefined) {
      updateData.settings = {
        ...(existingAsset.settings as object || {}),
        ...settingsToUpdate,
      };
    }

    if (isFavorite !== undefined) {
      updateData.isFavorite = isFavorite;
    }

    const asset = await prisma.asset.update({
      where: { id },
      data: updateData,
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json({ asset });
  } catch (error) {
    console.error("Update asset error:", error);
    return NextResponse.json(
      { error: "Failed to update asset" },
      { status: 500 }
    );
  }
}

// DELETE /api/assets/[id] - Delete asset
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Verify asset belongs to user
    const asset = await prisma.asset.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!asset) {
      return NextResponse.json({ error: "Asset not found" }, { status: 404 });
    }

    // TODO: Delete asset from storage (S3/R2) if applicable
    // For now, just delete from database

    await prisma.asset.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Asset deleted successfully" });
  } catch (error) {
    console.error("Delete asset error:", error);
    return NextResponse.json(
      { error: "Failed to delete asset" },
      { status: 500 }
    );
  }
}
