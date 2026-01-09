import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { uploadToStorage } from "@/lib/supabase";

export const runtime = "nodejs";

// POST /api/projects/[id]/upload-asset - Upload brand asset
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

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

    const { fileName, fileData, contentType, assetType, description, tags } =
      await request.json();

    if (!fileData) {
      return NextResponse.json(
        { error: "No file data provided" },
        { status: 400 }
      );
    }

    if (!assetType) {
      return NextResponse.json(
        { error: "Asset type is required" },
        { status: 400 }
      );
    }

    // Convert base64 to blob
    const base64Data = fileData.split(",")[1] || fileData;
    const buffer = Buffer.from(base64Data, "base64");
    const blob = new Blob([buffer], { type: contentType || "image/png" });

    // Determine file extension
    const extension = fileName?.split(".").pop() || "png";

    // Generate unique filename
    const timestamp = Date.now();
    const filename = `${assetType.toLowerCase()}-${timestamp}.${extension}`;

    // Upload to Supabase
    const path = `brand-assets/${session.user.id}/${id}/${filename}`;
    const publicUrl = await uploadToStorage(
      "brand-assets",
      path,
      blob,
      contentType
    );

    // Create brand asset
    const asset = await prisma.brandAsset.create({
      data: {
        projectId: id,
        type: assetType,
        url: publicUrl,
        description: description || null,
        tags: tags || [],
      },
    });

    return NextResponse.json({
      success: true,
      asset,
    });
  } catch (error) {
    console.error("Upload asset error:", error);
    const isProd = process.env.NODE_ENV === "production";
    const message =
      !isProd && error instanceof Error
        ? error.message
        : "Failed to upload asset";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
