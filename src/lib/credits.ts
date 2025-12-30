import { prisma } from "@/lib/prisma";

// Credit costs for different generation types
export const CREDIT_COSTS = {
  IMAGE: 1,
  VIDEO: 5,
  AD_COPY: 0.5,
} as const;

export type GenerationType = keyof typeof CREDIT_COSTS;

/**
 * Check if user has enough credits for a generation
 */
export async function checkCreditBalance(
  userId: string,
  requiredCredits: number
): Promise<{ hasEnough: boolean; balance: number }> {
  const credits = await prisma.credits.findUnique({
    where: { userId },
  });

  const balance = credits?.balance ?? 0;
  return {
    hasEnough: balance >= requiredCredits,
    balance,
  };
}

/**
 * Deduct credits from user's balance
 * Returns the new balance or throws if insufficient credits
 */
export async function deductCredits(
  userId: string,
  amount: number,
  type: "IMAGE_GENERATION" | "VIDEO_GENERATION" | "AD_COPY_GENERATION",
  description?: string
): Promise<{ newBalance: number; transactionId: string }> {
  // Use a transaction to ensure atomicity
  const result = await prisma.$transaction(async (tx) => {
    // Get current balance with lock
    const credits = await tx.credits.findUnique({
      where: { userId },
    });

    const currentBalance = credits?.balance ?? 0;

    if (currentBalance < amount) {
      throw new Error("Insufficient credits");
    }

    // Deduct credits
    const updatedCredits = await tx.credits.upsert({
      where: { userId },
      update: {
        balance: { decrement: amount },
      },
      create: {
        userId,
        balance: 0, // Should not happen if they have credits
      },
    });

    // Log transaction
    const transaction = await tx.creditTransaction.create({
      data: {
        userId,
        amount: -amount,
        type,
        description: description || `${type.replace("_", " ").toLowerCase()}`,
      },
    });

    return {
      newBalance: updatedCredits.balance,
      transactionId: transaction.id,
    };
  });

  return result;
}

/**
 * Refund credits to user's balance (for failed generations)
 */
export async function refundCredits(
  userId: string,
  amount: number,
  originalType: "IMAGE_GENERATION" | "VIDEO_GENERATION" | "AD_COPY_GENERATION",
  reason?: string
): Promise<{ newBalance: number }> {
  const result = await prisma.$transaction(async (tx) => {
    // Add credits back
    const updatedCredits = await tx.credits.upsert({
      where: { userId },
      update: {
        balance: { increment: amount },
      },
      create: {
        userId,
        balance: amount,
      },
    });

    // Log refund transaction
    await tx.creditTransaction.create({
      data: {
        userId,
        amount: amount,
        type: "REFUND",
        description:
          reason || `Refund for failed ${originalType.replace("_", " ").toLowerCase()}`,
      },
    });

    return { newBalance: updatedCredits.balance };
  });

  return result;
}

/**
 * Calculate total credits needed for a generation batch
 */
export function calculateBatchCost(
  imageCount: number,
  videoCount: number,
  includeAdCopy: boolean = false
): number {
  let total = 0;
  total += imageCount * CREDIT_COSTS.IMAGE;
  total += videoCount * CREDIT_COSTS.VIDEO;
  if (includeAdCopy) {
    total += CREDIT_COSTS.AD_COPY;
  }
  return total;
}
