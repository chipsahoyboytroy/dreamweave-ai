// ═══════════════════════════════════════════════════════
// DreamWeave AI — Dream Fetch API (for shareable dream pages)
// SECURITY: Path param validated with Zod to prevent injection / traversal (OWASP A03)
// ═══════════════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { dreamIdSchema } from "@/lib/validation";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // ─── SECURITY: Validate dream ID format (OWASP A03: Injection prevention) ───
    const validation = dreamIdSchema.safeParse(id);
    if (!validation.success) {
      logger.security("Invalid dream ID format attempted", { id: id?.slice(0, 50) });
      return NextResponse.json(
        { error: "Invalid dream ID format" },
        { status: 400 }
      );
    }

    const dream = await prisma.dream.findUnique({
      where: { id: validation.data },
      select: {
        id: true,
        textInput: true,
        mood: true,
        interpretation: true,
        story: true,
        archetypes: true,
        emotions: true,
        themes: true,
        generatedImage: true,
        summary: true,
        createdAt: true,
      },
    });

    if (!dream) {
      return NextResponse.json(
        { error: "Dream not found" },
        { status: 404 }
      );
    }

    // Deserialize JSON-encoded array fields from SQLite
    const response = {
      ...dream,
      archetypes: typeof dream.archetypes === 'string' ? JSON.parse(dream.archetypes) : dream.archetypes,
      emotions: typeof dream.emotions === 'string' ? JSON.parse(dream.emotions) : dream.emotions,
      themes: typeof dream.themes === 'string' ? JSON.parse(dream.themes) : dream.themes,
    };

    return NextResponse.json(response);
  } catch (error) {
    // SECURITY: Never expose internal error details to client (OWASP A09)
    logger.error("Dream fetch error", { error: error instanceof Error ? error.message : "unknown" });
    return NextResponse.json(
      { error: "Failed to fetch dream" },
      { status: 500 }
    );
  }
}
