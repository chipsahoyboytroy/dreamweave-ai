// ═══════════════════════════════════════════════════════
// DreamWeave AI — Stripe Checkout API
// SECURITY: Zod-validated plan input, auth-gated, secure error responses (OWASP A03, A01)
// ═══════════════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { stripe, getPriceId, isStripeAvailable } from "@/lib/stripe";
import { getOrCreateStripeCustomer } from "@/lib/credits";
import { checkoutSchema } from "@/lib/validation";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    // Check if Stripe is configured
    if (!isStripeAvailable() || !stripe) {
      return NextResponse.json(
        { error: "Payment processing is not yet configured. Check back soon!" },
        { status: 503 }
      );
    }

    const session = await auth();
    if (!session?.user?.id || !session?.user?.email) {
      return NextResponse.json(
        { error: "Please sign in to purchase credits." },
        { status: 401 }
      );
    }

    // ─── SECURITY: Parse & validate with Zod (OWASP A03) ───
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON payload." },
        { status: 400 }
      );
    }

    const validation = checkoutSchema.safeParse(body);
    if (!validation.success) {
      logger.security("Checkout validation failed", {
        userId: session.user.id,
        errors: validation.error.errors.map((e: { message: string }) => e.message),
      });
      return NextResponse.json(
        { error: validation.error.errors[0]?.message || "Invalid plan selected." },
        { status: 400 }
      );
    }

    const { plan } = validation.data;
    const priceId = getPriceId(plan);

    if (!priceId) {
      // SECURITY: This means env vars aren't configured — log it but don't expose to user
      logger.error("Stripe price ID not configured for plan", { plan });
      return NextResponse.json(
        { error: "Plan temporarily unavailable. Please try again later." },
        { status: 500 }
      );
    }

    const customerId = await getOrCreateStripeCustomer(
      session.user.id,
      session.user.email
    );

    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/?purchase=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing?purchase=cancelled`,
      metadata: {
        userId: session.user.id,
        plan,
      },
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    // SECURITY: Log real error server-side, send generic message to client (OWASP A09)
    logger.error("Stripe checkout error", { error: error instanceof Error ? error.message : "unknown" });
    return NextResponse.json(
      { error: "Failed to create checkout session." },
      { status: 500 }
    );
  }
}
