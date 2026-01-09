import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  checkCreditBalance,
  deductCredits,
  refundCredits,
  CREDIT_COSTS,
} from "@/lib/credits";
import {
  DEFAULT_CREATIVE_DIRECTION_ID,
  buildVideoGenerationPrompt,
} from "@/lib/creative-direction";
import { generateVideoSchema, validateRequest } from "@/lib/validations";
import { checkApiRateLimit } from "@/lib/rate-limit";
import { Errors, handleError } from "@/lib/errors";

// POST /api/generate/video - Generate video ad creative
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return Errors.unauthorized();
    }

    // Check rate limit
    const rateLimitResult = checkApiRateLimit(request, "GENERATION", session.user.id);
    if (!rateLimitResult.allowed) {
      return rateLimitResult.response;
    }

    const body = await request.json();
    const validation = validateRequest(generateVideoSchema, body);
    if (!validation.success) {
      return validation.error;
    }

    const {
      imageUrl,
      prompt,
      aspectRatio,
      duration,
      projectId,
      count,
      creativeDirectionId = DEFAULT_CREATIVE_DIRECTION_ID,
    } = validation.data;

    // Calculate total credits needed
    const totalCredits = CREDIT_COSTS.VIDEO * count;

    // Check if user has enough credits
    const { hasEnough, balance } = await checkCreditBalance(
      session.user.id,
      totalCredits
    );

    if (!hasEnough) {
      return Errors.insufficientCredits(totalCredits, balance);
    }

    // Verify project belongs to user if provided
    if (projectId) {
      const project = await prisma.project.findFirst({
        where: {
          id: projectId,
          userId: session.user.id,
        },
      });

      if (!project) {
        return Errors.notFound("Project");
      }
    }

    // Deduct credits before generation
    let transactionId: string;
    try {
      const result = await deductCredits(
        session.user.id,
        totalCredits,
        "VIDEO_GENERATION",
        `Generated ${count} video${count > 1 ? "s" : ""} (${aspectRatio}, ${duration}s)`
      );
      transactionId = result.transactionId;
    } catch (error) {
      console.error("Credit deduction error:", error);
      return Errors.internalError("Failed to process credits. Please try again.");
    }

    // Create a generation job for tracking
    const job = await prisma.generationJob.create({
      data: {
        userId: session.user.id,
        type: "VIDEO",
        status: "PENDING",
        settings: {
          imageUrl,
          prompt,
          aspectRatio,
          duration,
          count,
          creativeDirectionId,
        },
      },
    });

    try {
      // TODO: Integrate with fal.ai video generation API
      // For now, simulate generation with placeholder
      // In production, this would call the AI service:
      //
      // const fal = require("@fal-ai/client");
      // const result = await fal.subscribe("fal-ai/runway-gen2", {
      //   input: { prompt, image_url: imageUrl },
      // });

      // Simulate generated URLs (replace with actual API call)
      const generatedUrls = Array.from({ length: count }, (_, i) => ({
        url: `https://placeholder.com/generated-${job.id}-${i}.mp4`,
        aspectRatio,
        duration,
      }));

      // Create assets for each generated video
      const assets = await Promise.all(
        generatedUrls.map((gen) =>
          prisma.asset.create({
            data: {
              userId: session.user.id,
              projectId: projectId || null,
              type: "VIDEO",
              aspectRatio: gen.aspectRatio,
              url: gen.url,
              prompt: prompt
                ? buildVideoGenerationPrompt({ creativeDirectionId, prompt })
                : null,
              settings: {
                sourceImage: imageUrl,
                duration: gen.duration,
                generationJobId: job.id,
                creativeDirectionId,
              },
            },
          })
        )
      );

      // Update job status
      await prisma.generationJob.update({
        where: { id: job.id },
        data: {
          status: "COMPLETED",
          result: { assetIds: assets.map((a) => a.id) },
        },
      });

      return NextResponse.json(
        {
          success: true,
          jobId: job.id,
          assets,
          creditsUsed: totalCredits,
        },
        { headers: rateLimitResult.headers }
      );
    } catch (generationError) {
      // Generation failed, refund credits
      await refundCredits(
        session.user.id,
        totalCredits,
        "VIDEO_GENERATION",
        `Refund for failed generation (job: ${job.id})`
      );

      // Update job status
      await prisma.generationJob.update({
        where: { id: job.id },
        data: {
          status: "FAILED",
          error: generationError instanceof Error ? generationError.message : "Unknown error",
        },
      });

      console.error("Video generation error:", generationError);
      return Errors.generationFailed(
        "Video generation failed. Your credits have been refunded."
      );
    }
  } catch (error) {
    console.error("Generate video error:", error);
    return handleError(error);
  }
}
