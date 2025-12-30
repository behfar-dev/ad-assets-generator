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
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {
      productName,
      productDescription,
      targetAudience,
      tone = "professional",
      platform = "general",
      count = 3,
    } = await request.json();

    if (!productName || !productDescription) {
      return NextResponse.json(
        { error: "Product name and description are required" },
        { status: 400 }
      );
    }

    // Calculate total credits needed
    const totalCredits = CREDIT_COSTS.AD_COPY * count;

    // Check if user has enough credits
    const { hasEnough, balance } = await checkCreditBalance(
      session.user.id,
      totalCredits
    );

    if (!hasEnough) {
      return NextResponse.json(
        {
          error: "Insufficient credits",
          required: totalCredits,
          available: balance,
        },
        { status: 402 }
      );
    }

    // Deduct credits before generation
    try {
      await deductCredits(
        session.user.id,
        totalCredits,
        "AD_COPY_GENERATION",
        `Generated ${count} ad copy variation${count > 1 ? "s" : ""}`
      );
    } catch {
      return NextResponse.json(
        { error: "Failed to deduct credits" },
        { status: 500 }
      );
    }

    // Create a generation job for tracking
    const job = await prisma.generationJob.create({
      data: {
        userId: session.user.id,
        type: "AD_COPY",
        status: "PENDING",
        inputData: {
          productName,
          productDescription,
          targetAudience,
          tone,
          platform,
          count,
        },
      },
    });

    try {
      // TODO: Integrate with OpenAI or Claude API for copy generation
      // For now, generate placeholder copy
      // In production, this would call the AI service:
      //
      // const openai = new OpenAI();
      // const response = await openai.chat.completions.create({
      //   model: "gpt-4",
      //   messages: [{ role: "user", content: buildPrompt(...) }],
      // });

      // Generate placeholder copy (replace with actual AI generation)
      const generatedCopy: AdCopy[] = Array.from({ length: count }, (_, i) => ({
        headline: `${productName} - Your Perfect Solution #${i + 1}`,
        description: `Discover ${productName}. ${productDescription.substring(0, 100)}...`,
        cta: ["Shop Now", "Learn More", "Get Started", "Try Free"][i % 4],
        socialCaption: `Check out ${productName}! Perfect for ${targetAudience || "everyone"}. #ad #${productName.replace(/\s+/g, "")}`,
      }));

      // Update job status
      await prisma.generationJob.update({
        where: { id: job.id },
        data: {
          status: "COMPLETED",
          outputData: { copies: generatedCopy },
        },
      });

      return NextResponse.json({
        success: true,
        jobId: job.id,
        copies: generatedCopy,
        creditsUsed: totalCredits,
        metadata: {
          tone,
          platform,
          targetAudience,
        },
      });
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
      return NextResponse.json(
        { error: "Ad copy generation failed. Credits have been refunded." },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Generate copy error:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}
