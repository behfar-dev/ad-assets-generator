import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  checkCreditBalance,
  deductCredits,
  refundCredits,
} from "@/lib/credits";
import { extractBrandFromWebsite } from "@/lib/brand-extraction";

// Brand extraction cost (in credits)
const BRAND_EXTRACTION_COST = 2;

// POST /api/projects/[id]/extract-brand - Extract brand data from website
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

    if (!project.websiteUrl) {
      return NextResponse.json(
        { error: "No website URL provided for this project" },
        { status: 400 }
      );
    }

    // Validate URL format
    try {
      new URL(project.websiteUrl);
    } catch {
      return NextResponse.json(
        { error: "Invalid website URL" },
        { status: 400 }
      );
    }

    // Check if user has enough credits
    const { hasEnough, balance } = await checkCreditBalance(
      session.user.id,
      BRAND_EXTRACTION_COST
    );

    if (!hasEnough) {
      return NextResponse.json(
        {
          error: "Insufficient credits",
          required: BRAND_EXTRACTION_COST,
          available: balance,
        },
        { status: 402 }
      );
    }

    // Deduct credits before extraction
    let transactionId: string;
    try {
      const result = await deductCredits(
        session.user.id,
        BRAND_EXTRACTION_COST,
        "BRAND_EXTRACTION",
        `Brand extraction from ${project.websiteUrl}`
      );
      transactionId = result.transactionId;
    } catch {
      return NextResponse.json(
        { error: "Failed to deduct credits" },
        { status: 500 }
      );
    }

    // Update extraction status to PROCESSING
    await prisma.project.update({
      where: { id },
      data: { extractionStatus: "PROCESSING" },
    });

    try {
      // Extract brand data
      const extractionResult = await extractBrandFromWebsite(
        project.websiteUrl,
        session.user.id,
        id
      );

      // Delete existing brand assets for this project
      await prisma.brandAsset.deleteMany({
        where: { projectId: id },
      });

      // Create new brand assets
      const brandAssets = await Promise.all(
        extractionResult.images.map((image) =>
          prisma.brandAsset.create({
            data: {
              projectId: id,
              type: image.type,
              url: image.url,
              description: image.description || null,
              tags: image.tags || [],
            },
          })
        )
      );

      // Update project with brand data and mark as completed
      const updatedProject = await prisma.project.update({
        where: { id },
        data: {
          brandData: extractionResult.brandData as any,
          extractionStatus: "COMPLETED",
        },
        include: {
          brandAssets: true,
        },
      });

      return NextResponse.json({
        success: true,
        project: updatedProject,
        creditsUsed: BRAND_EXTRACTION_COST,
        extractedData: {
          brandData: extractionResult.brandData,
          assetsCount: brandAssets.length,
        },
      });
    } catch (extractionError) {
      console.error("Brand extraction error:", extractionError);

      // Refund credits on failure
      await refundCredits(
        session.user.id,
        BRAND_EXTRACTION_COST,
        "BRAND_EXTRACTION",
        `Refund for failed brand extraction (project: ${id})`
      );

      // Update project status to FAILED
      await prisma.project.update({
        where: { id },
        data: { extractionStatus: "FAILED" },
      });

      return NextResponse.json(
        {
          error:
            extractionError instanceof Error
              ? extractionError.message
              : "Brand extraction failed. Credits have been refunded.",
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Extract brand API error:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}
