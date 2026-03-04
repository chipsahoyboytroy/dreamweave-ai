// ═══════════════════════════════════════════════════════
// DreamWeave AI — Core Dream API Route
// Receives multimodal inputs → streams AI chain back
// SECURITY: Zod-validated inputs, rate limiting via edge middleware,
//           structured logging, no sensitive data in responses (OWASP A03, A09)
// ═══════════════════════════════════════════════════════

import { NextRequest } from "next/server";
import { v4 as uuid } from "uuid";
import { auth } from "@/lib/auth";
import openai, { isOpenAIAvailable, analyzeImage, transcribeAudio, streamChatCompletion, getChatCompletion } from "@/lib/openai";
import { generateDreamImage, isImageGenAvailable } from "@/lib/image-gen";
import { buildInterpretationMessages, buildStoryMessages, buildAnalysisMessages } from "@/lib/ai-prompts";
import { deductCredit, getUserCredits, getGuestDreamCount } from "@/lib/credits";
import { generateAnalysis, streamInterpretation, streamStory } from "@/lib/dream-engine";
import { prisma } from "@/lib/db";
import { dreamInputSchema } from "@/lib/validation";
import { logger } from "@/lib/logger";

// Prevent Next.js from caching this route or any fetch() calls within it
// Without this, OpenAI SDK responses get cached and every dream returns the same result
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

const FREE_DREAM_LIMIT = 1;

// SECURITY: Route-level rate limiter (supplements edge middleware's global limiter).
// This is a tighter per-user/IP limit for the expensive dream generation endpoint.
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_MAX = parseInt(process.env.RATE_LIMIT_MAX || "10");
const RATE_LIMIT_WINDOW = parseInt(process.env.RATE_LIMIT_WINDOW_MS || "60000");

function checkRateLimit(key: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(key);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
    return true;
  }
  if (entry.count >= RATE_LIMIT_MAX) return false;
  entry.count++;
  return true;
}

export async function POST(request: NextRequest) {
  try {
    // ─── SECURITY: Parse & validate with Zod (OWASP A03: Injection) ───
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return new Response(
        JSON.stringify({ error: "Invalid JSON payload." }),
        { status: 400 }
      );
    }

    const validation = dreamInputSchema.safeParse(body);
    if (!validation.success) {
      // SECURITY: Return Zod's user-friendly errors, NOT raw internals
      const firstError = validation.error.errors[0]?.message || "Invalid input";
      logger.security("Dream input validation failed", {
        errors: validation.error.errors.map((e: { message: string }) => e.message),
      });
      return new Response(
        JSON.stringify({ error: firstError }),
        { status: 400 }
      );
    }

    // SECURITY: All fields are now validated, sanitized, and typed via Zod
    const { text, mood, imageBase64, audioBase64, guestId } = validation.data;

    // Auth check
    const session = await auth();
    const userId = session?.user?.id;
    const clientIp =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    const rateLimitKey = userId || clientIp;

    // SECURITY: Per-route rate limit for expensive dream generation (tighter than edge middleware)
    if (!checkRateLimit(rateLimitKey)) {
      logger.security("Dream API rate limit hit", { rateLimitKey });
      return new Response(
        JSON.stringify({ error: "Too many requests. Please wait a moment." }),
        { status: 429, headers: { "Retry-After": "60" } }
      );
    }

    // ─── Usage tracking: first free, then require credits ───
    let useFreeCredit = false;
    if (userId) {
      // Authenticated user — check credits (starts with 1 free)
      try {
        const credits = await getUserCredits(userId);
        if (credits < 1) {
          return new Response(
            JSON.stringify({ error: "You've used all your free dreams. Purchase credits to continue." }),
            { status: 402 }
          );
        }
        useFreeCredit = true;
      } catch (dbError) {
        // If DB is unreachable, allow the request rather than blocking authenticated users
        logger.error("User credit check failed — allowing request", {
          error: dbError instanceof Error ? dbError.message : "unknown",
          userId,
        });
        useFreeCredit = false; // Don't try to deduct if we can't verify
      }
    } else if (guestId) {
      // Guest user — count dreams by guestId
      try {
        const guestDreams = await getGuestDreamCount(guestId);
        if (guestDreams >= FREE_DREAM_LIMIT) {
          return new Response(
            JSON.stringify({ error: "You've used your free dream. Sign up and purchase credits to continue." }),
            { status: 402 }
          );
        }
      } catch (dbError) {
        // If DB is unreachable, allow the request rather than blocking a potentially new user
        logger.error("Guest dream count check failed — allowing request", {
          error: dbError instanceof Error ? dbError.message : "unknown",
          guestId,
        });
      }
    }

    const useAI = isOpenAIAvailable();
    const dreamId = uuid();

    // Create streaming response
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const send = (type: string, content: string) => {
          const data = JSON.stringify({ type, content });
          controller.enqueue(encoder.encode(`data: ${data}\n\n`));
        };

        try {
          // ─── Step 1: Process multimodal inputs (if AI available) ───
          let imageDescription = "";
          let audioTranscription = "";

          if (imageBase64 && useAI) {
            try {
              imageDescription = await analyzeImage(imageBase64);
            } catch (e) {
              // SECURITY: Log error without leaking base64 payload (OWASP A09)
              logger.warn("Image analysis failed", { error: e instanceof Error ? e.message : "unknown" });
            }
          }

          if (audioBase64 && useAI) {
            try {
              audioTranscription = await transcribeAudio(audioBase64);
            } catch (e) {
              logger.warn("Audio transcription failed", { error: e instanceof Error ? e.message : "unknown" });
            }
          }

          // ─── Step 2: Structured analysis ───
          let analysis = {
            archetypes: [] as string[],
            emotions: [] as string[],
            themes: [] as string[],
            summary: "",
            imagePrompt: "",
          };

          if (useAI) {
            // Use OpenAI for analysis
            const analysisMessages = buildAnalysisMessages(text, mood);
            const analysisRaw = await getChatCompletion(analysisMessages, "gpt-4o-mini");
            try {
              const cleanJson = analysisRaw
                .replace(/```json\n?/g, "")
                .replace(/```\n?/g, "")
                .trim();
              analysis = JSON.parse(cleanJson);
            } catch {
              logger.warn("Analysis JSON parse failed, falling back to built-in engine");
              analysis = generateAnalysis(text, mood);
            }
          } else {
            // Use built-in engine (no API key needed)
            analysis = generateAnalysis(text, mood);
          }

          send("archetypes", JSON.stringify({
            archetypes: analysis.archetypes,
            emotions: analysis.emotions,
            themes: analysis.themes,
            summary: analysis.summary,
          }));

          // ─── Step 3: Stream interpretation ───────────
          let fullInterpretation = "";
          if (useAI) {
            const interpMessages = buildInterpretationMessages(
              text, mood, imageDescription, audioTranscription
            );
            for await (const chunk of streamChatCompletion(interpMessages, "gpt-4o")) {
              fullInterpretation += chunk;
              send("interpretation", chunk);
            }
          } else {
            // Built-in engine streaming
            for await (const chunk of streamInterpretation(text, mood)) {
              fullInterpretation += chunk;
              send("interpretation", chunk);
            }
          }

          // ─── Step 4: Stream story ───────────────────
          let fullStory = "";
          if (useAI) {
            const storyMessages = buildStoryMessages(text, fullInterpretation.slice(0, 1000));
            for await (const chunk of streamChatCompletion(storyMessages, "gpt-4o")) {
              fullStory += chunk;
              send("story", chunk);
            }
          } else {
            // Built-in engine story
            for await (const chunk of streamStory(text, mood)) {
              fullStory += chunk;
              send("story", chunk);
            }
          }

          // ─── Step 5: Generate image (if service available) ─────
          let generatedImageUrl = "";
          if (isImageGenAvailable() && analysis.imagePrompt) {
            try {
              generatedImageUrl = await generateDreamImage(analysis.imagePrompt);
              send("image", generatedImageUrl);
            } catch (e) {
              logger.warn("Image generation failed", { error: e instanceof Error ? e.message : "unknown" });
              send("image", "");
            }
          } else {
            send("image", "");
          }

          // ─── Step 6: Generate audio (if OpenAI available) ─────
          if (useAI && openai && fullInterpretation) {
            try {
              const narrationText = `${analysis.summary}\n\n${fullInterpretation.slice(0, 2000)}`;
              send("audio", "generating");

              const mp3 = await openai.audio.speech.create({
                model: "tts-1",
                voice: "nova",
                input: narrationText.slice(0, 4000),
                speed: 0.95,
              });
              const arrayBuffer = await mp3.arrayBuffer();
              const base64Audio = Buffer.from(arrayBuffer).toString("base64");
              send("audio", `data:audio/mpeg;base64,${base64Audio}`);
            } catch (e) {
              logger.warn("Audio generation failed", { error: e instanceof Error ? e.message : "unknown" });
              send("audio", "");
            }
          } else {
            // No audio generation — client can use browser SpeechSynthesis
            send("audio", "");
          }

          // ─── Step 7: Deduct credit & save to DB ─────
          if (useFreeCredit && userId) {
            await deductCredit(userId);
            const newCredits = await getUserCredits(userId);
            send("credit_update", String(newCredits));
          }

          // Save dream to database
          try {
            await prisma.dream.create({
              data: {
                id: dreamId,
                userId: userId || null,
                // SECURITY: guestId already validated by Zod schema
                guestId: userId ? null : (guestId || null),
                textInput: text,
                imageInput: imageBase64 ? "uploaded" : null,
                audioInput: audioBase64 ? "uploaded" : null,
                mood: mood || null,
                interpretation: fullInterpretation,
                story: fullStory || null,
                archetypes: JSON.stringify(analysis.archetypes),
                emotions: JSON.stringify(analysis.emotions),
                themes: JSON.stringify(analysis.themes),
                generatedImage: generatedImageUrl || null,
                summary: analysis.summary,
                tier: "free",
                creditsUsed: useFreeCredit ? 1 : 0,
              },
            });
          } catch (e) {
            logger.error("Dream save failed", { error: e instanceof Error ? e.message : "unknown", dreamId });
          }

          send("summary", JSON.stringify({ id: dreamId, summary: analysis.summary }));
          send("done", dreamId);
        } catch (error) {
          // SECURITY: Log the real error server-side but send generic message to client (OWASP A09)
          logger.error("Dream generation stream error", { error: error instanceof Error ? error.message : "unknown" });
          send("error", "An unexpected error occurred. Please try again.");
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    // SECURITY: Never expose stack traces or internal details to the client (OWASP A09)
    logger.error("Dream API top-level error", { error: error instanceof Error ? error.message : "unknown" });
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500 }
    );
  }
}
