// ═══════════════════════════════════════════════════════
// DreamWeave AI — OpenAI Client & AI Utilities
// SECURITY: Input length guards, safe error handling (OWASP A03, A09)
// ═══════════════════════════════════════════════════════

import OpenAI from "openai";
import { logger } from "./logger";

// API key is optional — the app works without it using the built-in dream engine
const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      // Prevent Next.js from caching OpenAI API responses
      // Without this, every dream returns the same cached interpretation
      fetch: (url, init) => fetch(url, { ...init, cache: "no-store" }),
    })
  : null;

export default openai;

/** Returns true if OpenAI is configured and available */
export function isOpenAIAvailable(): boolean {
  return openai !== null;
}

/**
 * SECURITY: Enforce maximum input length before sending to OpenAI.
 * Prevents abuse where excessively long inputs could:
 * 1. Inflate API billing (financial DoS)
 * 2. Trigger context-window overflows / unpredictable behavior
 */
const MAX_MESSAGE_LENGTH = 10_000; // characters per message content

function guardMessageLengths(
  messages: Array<{ role: "system" | "user" | "assistant"; content: string }>
): Array<{ role: "system" | "user" | "assistant"; content: string }> {
  return messages.map((msg) => ({
    ...msg,
    content: msg.content.slice(0, MAX_MESSAGE_LENGTH),
  }));
}

// Stream a chat completion
export async function* streamChatCompletion(
  messages: Array<{ role: "system" | "user" | "assistant"; content: string }>,
  model: string = "gpt-4o"
) {
  if (!openai) {
    logger.warn("OpenAI not configured — streamChatCompletion skipped");
    return;
  }

  // SECURITY: Guard input lengths before sending to API (OWASP A03)
  const safeMessages = guardMessageLengths(messages);

  const stream = await openai.chat.completions.create({
    model,
    messages: safeMessages,
    stream: true,
    temperature: 0.85,
    max_tokens: 2000,
  });

  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content;
    if (content) {
      yield content;
    }
  }
}

// Non-streaming completion for structured data (analysis)
export async function getChatCompletion(
  messages: Array<{ role: "system" | "user" | "assistant"; content: string }>,
  model: string = "gpt-4o-mini"
): Promise<string> {
  if (!openai) {
    logger.warn("OpenAI not configured — getChatCompletion skipped");
    return "";
  }

  // SECURITY: Guard input lengths before sending to API
  const safeMessages = guardMessageLengths(messages);

  const response = await openai.chat.completions.create({
    model,
    messages: safeMessages,
    temperature: 0.7,
    max_tokens: 1000,
  });

  return response.choices[0]?.message?.content || "";
}

// Vision analysis — describe an uploaded dream image
export async function analyzeImage(imageBase64: string): Promise<string> {
  if (!openai) {
    logger.warn("OpenAI not configured — analyzeImage skipped");
    return "";
  }

  // SECURITY: Validate base64 URI prefix before sending to OpenAI Vision API
  const validPrefixes = ["data:image/png", "data:image/jpeg", "data:image/jpg", "data:image/webp", "data:image/gif"];
  const isValidFormat = validPrefixes.some((p) => imageBase64.toLowerCase().startsWith(p));
  if (!isValidFormat) {
    logger.security("Invalid image format passed to analyzeImage");
    throw new Error("Invalid image format");
  }

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: "Describe this image in detail as if it were a scene from a dream. Focus on symbols, emotions, colors, and surreal elements. Be poetic but specific. 2-3 sentences.",
          },
          {
            type: "image_url",
            image_url: {
              url: imageBase64,
              detail: "low",
            },
          },
        ],
      },
    ],
    max_tokens: 300,
  });

  return response.choices[0]?.message?.content || "";
}

// Transcribe audio using Whisper
export async function transcribeAudio(audioBase64: string): Promise<string> {
  if (!openai) {
    logger.warn("OpenAI not configured — transcribeAudio skipped");
    return "";
  }

  // SECURITY: Validate audio MIME type prefix
  const validPrefixes = ["data:audio/webm", "data:audio/mp4", "data:audio/mpeg", "data:audio/ogg", "data:audio/wav"];
  const isValidFormat = validPrefixes.some((p) => audioBase64.toLowerCase().startsWith(p));
  if (!isValidFormat) {
    logger.security("Invalid audio format passed to transcribeAudio");
    throw new Error("Invalid audio format");
  }

  // Convert base64 to buffer
  const base64Data = audioBase64.replace(/^data:audio\/\w+;base64,/, "");
  const buffer = Buffer.from(base64Data, "base64");

  // SECURITY: Enforce max audio size (5MB) to prevent billing abuse
  if (buffer.length > 5 * 1024 * 1024) {
    throw new Error("Audio file too large");
  }

  // Create a File-like object for the API
  const file = new File([buffer], "audio.webm", { type: "audio/webm" });

  const transcription = await openai.audio.transcriptions.create({
    file,
    model: "whisper-1",
    language: "en",
  });

  return transcription.text;
}

// Generate TTS narration
export async function generateNarration(
  text: string
): Promise<Buffer | null> {
  if (!openai) {
    logger.warn("OpenAI not configured — generateNarration skipped");
    return null;
  }

  const mp3 = await openai.audio.speech.create({
    model: "tts-1-hd",
    voice: "nova", // Warm, mystic voice
    input: text.slice(0, 4000), // TTS limit
    speed: 0.95,
  });

  const arrayBuffer = await mp3.arrayBuffer();
  return Buffer.from(arrayBuffer);
}
