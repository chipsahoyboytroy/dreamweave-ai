// ═══════════════════════════════════════════════════════
// DreamWeave AI — Ollama AI Utilities (llama3.1)
// SECURITY: Input length guards, safe error handling (OWASP A03, A09)
// ═══════════════════════════════════════════════════════

import { logger } from "./logger";

// No external AI client — uses local Ollama instance
const openai = null;

export default openai;

const OLLAMA_BASE = "http://localhost:11434";

/** Returns true — Ollama is always available locally */
export function isOpenAIAvailable(): boolean {
  return true;
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

// Stream a chat completion (yields full Ollama response as one chunk)
export async function* streamChatCompletion(
  messages: Array<{ role: "system" | "user" | "assistant"; content: string }>,
  model: string = "llama3.1"
) {
  // SECURITY: Guard input lengths before sending to Ollama (OWASP A03)
  const safeMessages = guardMessageLengths(messages);

  let content = "";
  try {
    content = await fetch(`${OLLAMA_BASE}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "llama3.1",
        messages: safeMessages,
        stream: false,
      }),
    })
      .then((res) => res.json())
      .then((data) => data.message?.content ?? "");
  } catch (e) {
    logger.warn("Ollama streamChatCompletion failed", { error: e instanceof Error ? e.message : "unknown" });
  }

  if (content) {
    yield content;
  }
}

// Non-streaming completion for structured data (analysis)
export async function getChatCompletion(
  messages: Array<{ role: "system" | "user" | "assistant"; content: string }>,
  model: string = "llama3.1"
): Promise<string> {
  // SECURITY: Guard input lengths before sending to Ollama (OWASP A03)
  const safeMessages = guardMessageLengths(messages);

  try {
    return await fetch(`${OLLAMA_BASE}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "llama3.1",
        messages: safeMessages,
        stream: false,
      }),
    })
      .then((res) => res.json())
      .then((data) => data.message?.content ?? "");
  } catch (e) {
    logger.warn("Ollama getChatCompletion failed", { error: e instanceof Error ? e.message : "unknown" });
    return "";
  }
}

// Vision analysis — llama3.1 is text-only; returns empty string
export async function analyzeImage(imageBase64: string): Promise<string> {
  // SECURITY: Validate base64 URI prefix before processing
  const validPrefixes = ["data:image/png", "data:image/jpeg", "data:image/jpg", "data:image/webp", "data:image/gif"];
  const isValidFormat = validPrefixes.some((p) => imageBase64.toLowerCase().startsWith(p));
  if (!isValidFormat) {
    logger.security("Invalid image format passed to analyzeImage");
    throw new Error("Invalid image format");
  }

  logger.warn("analyzeImage called — llama3.1 does not support vision; returning empty");
  return "";
}

// Transcribe audio — Ollama does not support STT; returns empty string
export async function transcribeAudio(audioBase64: string): Promise<string> {
  // SECURITY: Validate audio MIME type prefix
  const validPrefixes = ["data:audio/webm", "data:audio/mp4", "data:audio/mpeg", "data:audio/ogg", "data:audio/wav"];
  const isValidFormat = validPrefixes.some((p) => audioBase64.toLowerCase().startsWith(p));
  if (!isValidFormat) {
    logger.security("Invalid audio format passed to transcribeAudio");
    throw new Error("Invalid audio format");
  }

  logger.warn("transcribeAudio called — Ollama does not support STT; returning empty");
  return "";
}

// Generate TTS narration — Ollama does not support TTS; returns null
export async function generateNarration(
  text: string
): Promise<Buffer | null> {
  logger.warn("generateNarration called — Ollama does not support TTS; returning null");
  return null;
}
