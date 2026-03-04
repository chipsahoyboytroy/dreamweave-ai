// ═══════════════════════════════════════════════════════
// DreamWeave AI — Credits API
// SECURITY: Auth-gated with secure error handling (OWASP A01, A09)
// ═══════════════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getUserCredits, getGuestRemainingDreams, FREE_DREAM_LIMIT } from "@/lib/credits";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (session?.user?.id) {
      // Authenticated user — return their credit balance
      const credits = await getUserCredits(session.user.id);
      return NextResponse.json({
        credits,
        remaining: credits,
        limit: FREE_DREAM_LIMIT,
        tier: credits > 0 ? "active" : "exhausted",
      });
    }

    // Guest user — check guestId from query param
    const guestId = request.nextUrl.searchParams.get("guestId");
    if (guestId && /^guest_[a-f0-9-]+$/i.test(guestId)) {
      const remaining = await getGuestRemainingDreams(guestId);
      return NextResponse.json({
        credits: remaining,
        remaining,
        limit: FREE_DREAM_LIMIT,
        tier: remaining > 0 ? "free" : "exhausted",
      });
    }

    // No auth, no guestId — return defaults
    return NextResponse.json({
      credits: FREE_DREAM_LIMIT,
      remaining: FREE_DREAM_LIMIT,
      limit: FREE_DREAM_LIMIT,
      tier: "free",
    });
  } catch (error) {
    // SECURITY: Log error, return optimistic fallback so users aren't
    // locked out by transient DB errors (OWASP A09)
    logger.error("Credits API error", { error: error instanceof Error ? error.message : "unknown" });
    return NextResponse.json({
      credits: FREE_DREAM_LIMIT,
      remaining: FREE_DREAM_LIMIT,
      limit: FREE_DREAM_LIMIT,
      tier: "free",
    });
  }
}
