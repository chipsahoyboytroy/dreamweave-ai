// ═══════════════════════════════════════════════════════
// DreamWeave AI — Credit Management
// SECURITY: Atomic operations prevent TOCTOU race conditions (OWASP A04)
// ═══════════════════════════════════════════════════════

import { prisma } from "./db";
import { logger } from "./logger";

export const FREE_DREAM_LIMIT = 3;

export async function getUserCredits(userId: string): Promise<number> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { credits: true },
  });
  return user?.credits ?? 0;
}

/**
 * Count how many dreams a guest user has created (tracked by guestId).
 * Used to enforce the 3-free-dreams limit for unauthenticated users.
 */
export async function getGuestDreamCount(guestId: string): Promise<number> {
  return prisma.dream.count({
    where: { guestId },
  });
}

/**
 * Get remaining free dreams for a guest user.
 */
export async function getGuestRemainingDreams(guestId: string): Promise<number> {
  const count = await getGuestDreamCount(guestId);
  return Math.max(0, FREE_DREAM_LIMIT - count);
}

/**
 * SECURITY: Atomic credit deduction using WHERE clause to prevent race conditions.
 * Previous implementation had a TOCTOU (Time-of-Check-Time-of-Use) vulnerability:
 *   1. Read credits → 2. Check if >= amount → 3. Decrement
 * Between step 1 and step 3, another request could also pass the check.
 *
 * NEW: The WHERE clause `credits: { gte: amount }` makes the check+decrement atomic.
 * If two concurrent requests try to deduct the last credit, only one will succeed
 * because the UPDATE will match 0 rows for the second request (OWASP A04).
 */
export async function deductCredit(userId: string, amount: number = 1): Promise<boolean> {
  try {
    // SECURITY: Atomic check-and-decrement — first verify credits, then log the transaction.
    // This avoids the previous issue where a credit transaction log was created and then
    // rolled back with deleteMany (which could accidentally delete legitimate past entries).
    const updateResult = await prisma.user.updateMany({
      where: {
        id: userId,
        credits: { gte: amount }, // SECURITY: Atomic guard — only succeeds if credits >= amount
      },
      data: { credits: { decrement: amount } },
    });

    // If updateMany matched 0 rows, the user had insufficient credits — nothing was written
    if (updateResult.count === 0) {
      logger.warn("Credit deduction failed — insufficient credits (atomic check)", { userId });
      return false;
    }

    // Only create the transaction log AFTER the credit was successfully deducted
    await prisma.creditTransaction.create({
      data: {
        userId,
        amount: -amount,
        reason: "dream_generation",
      },
    });

    return true;
  } catch (error) {
    logger.error("Credit deduction error", { error: error instanceof Error ? error.message : "unknown", userId });
    return false;
  }
}

export async function addCredits(
  userId: string,
  amount: number,
  reason: string = "purchase",
  stripePaymentId?: string
): Promise<number> {
  const user = await prisma.user.update({
    where: { id: userId },
    data: { credits: { increment: amount } },
  });

  await prisma.creditTransaction.create({
    data: {
      userId,
      amount,
      reason,
      stripePaymentId,
    },
  });

  return user.credits;
}

export async function getOrCreateStripeCustomer(
  userId: string,
  email: string
): Promise<string> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { stripeCustomerId: true },
  });

  if (user?.stripeCustomerId) return user.stripeCustomerId;

  // Import stripe here to avoid circular dependency
  const { stripe } = await import("./stripe");

  if (!stripe) {
    throw new Error("Stripe is not configured. Payment processing unavailable.");
  }

  const customer = await stripe.customers.create({
    email,
    metadata: { userId },
  });

  await prisma.user.update({
    where: { id: userId },
    data: { stripeCustomerId: customer.id },
  });

  return customer.id;
}
