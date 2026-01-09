import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/projects/[id] - Get a single project
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

    const project = await prisma.project.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
      include: {
        assets: {
          orderBy: { createdAt: "desc" },
        },
        brandAssets: {
          orderBy: { createdAt: "desc" },
        },
        _count: {
          select: { assets: true },
        },
      },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    return NextResponse.json({
      ...project,
      assetCount: project._count.assets,
    });
  } catch (error) {
    console.error("Get project error:", error);
    return NextResponse.json(
      { error: "Failed to get project" },
      { status: 500 }
    );
  }
}

// PATCH /api/projects/[id] - Update a project
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
    const { name, description, websiteUrl, brandData } = await request.json();

    // Check if project exists and belongs to user
    const existingProject = await prisma.project.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!existingProject) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Validate URL if provided
    if (websiteUrl !== undefined && websiteUrl?.trim().length > 0) {
      try {
        new URL(websiteUrl);
      } catch {
        return NextResponse.json(
          { error: "Invalid website URL" },
          { status: 400 }
        );
      }
    }

    const updatedProject = await prisma.project.update({
      where: { id },
      data: {
        name: name?.trim() || existingProject.name,
        description: description?.trim() ?? existingProject.description,
        websiteUrl: websiteUrl !== undefined ? (websiteUrl?.trim() || null) : existingProject.websiteUrl,
        brandData: brandData !== undefined ? brandData : existingProject.brandData,
      },
      include: {
        brandAssets: true,
      },
    });

    return NextResponse.json(updatedProject);
  } catch (error) {
    console.error("Update project error:", error);
    return NextResponse.json(
      { error: "Failed to update project" },
      { status: 500 }
    );
  }
}

// DELETE /api/projects/[id] - Delete a project
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

    // Check if project exists and belongs to user
    const existingProject = await prisma.project.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!existingProject) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Delete the project (assets will have projectId set to null due to onDelete: SetNull)
    await prisma.project.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Project deleted successfully" });
  } catch (error) {
    console.error("Delete project error:", error);
    return NextResponse.json(
      { error: "Failed to delete project" },
      { status: 500 }
    );
  }
}
