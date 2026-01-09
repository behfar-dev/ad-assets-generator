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
import { uploadJsonToStorage } from "@/lib/supabase";
import {
  DEFAULT_CREATIVE_DIRECTION_ID,
  getCreativeDirection,
  type CreativeDirectionId,
} from "@/lib/creative-direction";
import { generateCopySchema, validateRequest } from "@/lib/validations";
import { checkApiRateLimit } from "@/lib/rate-limit";
import { Errors, handleError } from "@/lib/errors";
import { retryAsync } from "@/lib/retry";

interface AdCopy {
  headline: string;
  description: string;
  cta: string;
  socialCaption: string;
}

// POST /api/generate/copy - Generate ad copy (headlines, descriptions, CTAs)
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
    const validation = validateRequest(generateCopySchema, body);
    if (!validation.success) {
      return validation.error;
    }

    const {
      productName,
      productDescription,
      targetAudience,
      tone,
      platform,
      count,
      projectId,
      creativeDirectionId = DEFAULT_CREATIVE_DIRECTION_ID,
    } = validation.data;

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

    // Calculate total credits needed
    const totalCredits = CREDIT_COSTS.AD_COPY * count;

    // Check if user has enough credits
    const { hasEnough, balance } = await checkCreditBalance(
      session.user.id,
      totalCredits
    );

    if (!hasEnough) {
      return Errors.insufficientCredits(totalCredits, balance);
    }

    // Deduct credits before generation
    try {
      await deductCredits(
        session.user.id,
        totalCredits,
        "AD_COPY_GENERATION",
        `Generated ${count} ad copy variation${count > 1 ? "s" : ""}`
      );
    } catch (error) {
      console.error("Credit deduction error:", error);
      return Errors.internalError("Failed to process credits. Please try again.");
    }

    // Create a generation job for tracking
    const job = await prisma.generationJob.create({
      data: {
        userId: session.user.id,
        type: "COPY",
        status: "PENDING",
        settings: {
          productName,
          productDescription,
          targetAudience,
          tone,
          platform,
          count,
          creativeDirectionId,
        },
      },
    });

    try {
      // Generate copy with retry logic for transient failures
      // OpenAI API calls are generally fast, but can timeout during high load
      const creativeDirection = getCreativeDirection(
        creativeDirectionId as CreativeDirectionId
      );

      const generatedCopy = await retryAsync<AdCopy[]>(
        async () => {
          // TODO: Integrate with OpenAI or Claude API for copy generation
          // In production, this would call the AI service:
          //
          // const openai = new OpenAI();
          // const response = await openai.chat.completions.create({
          //   model: "gpt-4",
          //   messages: [{ role: "user", content: buildPrompt(...) }],
          // });
          // return parseCopyFromResponse(response);

          // Generate placeholder copy (replace with actual AI generation)
          return Array.from({ length: count }, (_, i) => ({
            headline: `${productName} - Your Perfect Solution #${i + 1}`,
            description: `Discover ${productName}. ${productDescription.substring(0, 100)}...`,
            cta: ["Shop Now", "Learn More", "Get Started", "Try Free"][i % 4],
            socialCaption: `(${creativeDirection.label}) Check out ${productName}! Perfect for ${targetAudience || "everyone"}. #ad #${productName.replace(/\s+/g, "")}`,
          }));
        },
        {
          maxRetries: 3,
          initialDelayMs: 1000, // OpenAI is generally fast
          maxDelayMs: 15000,
          onRetry: (error, attempt, delayMs) => {
            console.log(
              `[Copy Generation] Retry ${attempt}/3 after ${delayMs}ms:`,
              error instanceof Error ? error.message : error
            );
          },
        }
      );

      // Save each copy to Supabase storage and create Asset records
      const createdAssets = await Promise.all(
        generatedCopy.map(async (copy, index) => {
          try {
            // Create a unique path for this copy
            const timestamp = Date.now();
            const storagePath = `ad-copy/${session.user.id}/${job.id}-${index}-${timestamp}.json`;

            // Upload to Supabase storage
            const url = await uploadJsonToStorage("ad-copy", storagePath, copy);

            // Create Asset record in database
            const asset = await prisma.asset.create({
              data: {
                userId: session.user.id,
                projectId: projectId || null,
                type: "COPY",
                aspectRatio: "1:1", // Default aspect ratio for copy
                url,
                prompt: `${productName}: ${productDescription}`,
                settings: {
                  tone,
                  platform,
                  targetAudience,
                  productName,
                  productDescription,
                  creativeDirectionId,
                  copy,
                } as any,
              },
            });

            return asset;
          } catch (error) {
            console.error("Failed to save copy asset:", error);
            return null;
          }
        })
      );

      // Filter out any failed uploads
      const successfulAssets = createdAssets.filter((asset) => asset !== null);

      // Update job status
      await prisma.generationJob.update({
        where: { id: job.id },
        data: {
          status: "COMPLETED",
          result: { copies: generatedCopy, assets: successfulAssets } as any,
        },
      });

      return NextResponse.json(
        {
          success: true,
          jobId: job.id,
          copies: generatedCopy,
          assets: successfulAssets,
          creditsUsed: totalCredits,
          metadata: {
            tone,
            platform,
            targetAudience,
          },
        },
        { headers: rateLimitResult.headers }
      );
    } catch (generationError) {
      // Generation failed, refund credits
      await refundCredits(
        session.user.id,
        totalCredits,
        "AD_COPY_GENERATION",
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

      console.error("Ad copy generation error:", generationError);
      return Errors.generationFailed(
        "Ad copy generation failed. Your credits have been refunded."
      );
    }
  } catch (error) {
    console.error("Generate copy error:", error);
    return handleError(error);
  }
}
