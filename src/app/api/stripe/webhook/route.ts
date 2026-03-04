// ═══════════════════════════════════════════════════════
// DreamWeave AI — Stripe Webhook Handler
// SECURITY: Signature-verified, validated metadata, secure logging (OWASP A01, A08)
// ═══════════════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server";
import { stripe, CREDIT_PACKS, isStripeAvailable } from "@/lib/stripe";
import { addCredits } from "@/lib/credits";
import { logger } from "@/lib/logger";
import Stripe from "stripe";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  // If Stripe isn't configured, return early
  if (!isStripeAvailable() || !stripe) {
    return NextResponse.json(
      { error: "Stripe not configured" },
      { status: 503 }
    );
  }

  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  // SECURITY: Reject requests without Stripe signature header (OWASP A01)
  if (!signature) {
    logger.security("Webhook request missing stripe-signature header");
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    // SECURITY: Cryptographic signature verification — prevents forged webhook calls (OWASP A08)
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    logger.security("Webhook signature verification failed", {
      error: err instanceof Error ? err.message : "unknown",
    });
    return NextResponse.json(
      { error: "Invalid signature" },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;
        const plan = session.metadata?.plan;

        if (!userId || !plan) {
          logger.error("Missing metadata in checkout session", { sessionId: session.id });
          break;
        }

        // SECURITY: Validate plan is a known value before using it (OWASP A03)
        const creditPack = CREDIT_PACKS[plan];
        if (!creditPack) {
          logger.error("Unknown plan in webhook metadata", { plan: plan.slice(0, 50) });
          break;
        }

        await addCredits(
          userId,
          creditPack.credits,
          "purchase",
          session.payment_intent as string
        );

        logger.info(`Credits added successfully`, {
          credits: creditPack.credits,
          userId,
          packName: creditPack.name,
        });
        break;
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        logger.warn("Payment failed", { paymentIntentId: paymentIntent.id });
        break;
      }

      default:
        logger.info(`Unhandled webhook event type: ${event.type}`);
    }
  } catch (error) {
    // SECURITY: Log error but don't expose internals to Stripe (OWASP A09)
    logger.error("Webhook processing error", { error: error instanceof Error ? error.message : "unknown" });
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }

  return NextResponse.json({ received: true });
}
