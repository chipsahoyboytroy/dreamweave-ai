// ═══════════════════════════════════════════════════════
// DreamWeave AI — Image Generation (Fal.ai / DALL-E fallback)
// SECURITY: Prompt sanitization prevents injection attacks (OWASP A03)
// ═══════════════════════════════════════════════════════

import openai from "./openai";
import { logger } from "./logger";

/** Returns true if any image generation service is configured */
export function isImageGenAvailable(): boolean {
  return !!(process.env.FAL_KEY || process.env.OPENAI_API_KEY);
}

interface ImageGenResult {
  url: string;
}

/**
 * SECURITY: Sanitize prompts before sending to image generation APIs.
 * Prevents prompt injection where user-influenced text could override
 * the system prompt or inject harmful generation instructions (OWASP A03).
 */
function sanitizeImagePrompt(prompt: string): string {
  return prompt
    // Remove newlines that could inject new prompt sections
    .replace(/[\r\n]+/g, " ")
    // Remove common prompt injection delimiters
    .replace(/\b(ignore previous|ignore above|system:|SYSTEM:|Human:|Assistant:)/gi, "")
    // Remove URL-like patterns that could redirect generation
    .replace(/https?:\/\/[^\s]+/gi, "")
    // Remove code/script patterns
    .replace(/<[^>]*>/g, "")
    // Collapse multiple spaces
    .replace(/\s{2,}/g, " ")
    // Truncate to reasonable length for prompt
    .slice(0, 500)
    .trim();
}

// Primary: Fal.ai (Flux.1 schnell — fastest)
async function generateWithFal(prompt: string): Promise<ImageGenResult> {
  const FAL_KEY = process.env.FAL_KEY;
  if (!FAL_KEY) throw new Error("FAL_KEY not configured");

  // SECURITY: Sanitize prompt before sending to external API
  const safePrompt = sanitizeImagePrompt(prompt);

  const response = await fetch("https://queue.fal.run/fal-ai/flux/schnell", {
    method: "POST",
    headers: {
      Authorization: `Key ${FAL_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      prompt: `Surreal dreamscape digital art: ${safePrompt}. Ethereal lighting, painterly quality, cosmic elements, no text, beautiful and mystical.`,
      image_size: "landscape_16_9",
      num_inference_steps: 4,
      num_images: 1,
      enable_safety_checker: true,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    // SECURITY: Don't log the full error body — it may contain API key info
    throw new Error(`Fal.ai error: ${response.status}`);
  }

  const data = await response.json();
  return { url: data.images?.[0]?.url || data.output?.url };
}

// Fallback: DALL-E 3
async function generateWithDalle(prompt: string): Promise<ImageGenResult> {
  if (!openai) throw new Error("OpenAI not configured");

  // SECURITY: Sanitize prompt before sending to external API
  const safePrompt = sanitizeImagePrompt(prompt);

  const response = await openai.images.generate({
    model: "dall-e-3",
    prompt: `Surreal dreamscape digital art: ${safePrompt}. Ethereal lighting, painterly quality, cosmic elements, no text, beautiful and mystical.`,
    n: 1,
    size: "1792x1024",
    quality: "hd",
    style: "vivid",
  });

  return { url: response.data?.[0]?.url || "" };
}

export async function generateDreamImage(prompt: string): Promise<string> {
  // If no image generation service is configured, return empty string
  if (!isImageGenAvailable()) {
    logger.info("No image generation service configured — skipping");
    return "";
  }

  try {
    // Try Fal.ai first (faster, cheaper)
    if (process.env.FAL_KEY) {
      const result = await generateWithFal(prompt);
      return result.url;
    }
  } catch (e) {
    logger.warn("Fal.ai generation failed, falling back to DALL-E", {
      error: e instanceof Error ? e.message : "unknown",
    });
  }

  try {
    // Fallback to DALL-E 3
    if (openai) {
      const result = await generateWithDalle(prompt);
      return result.url;
    }
    return "";
  } catch (e) {
    logger.error("All image generation failed", {
      error: e instanceof Error ? e.message : "unknown",
    });
    return "";
  }
}
