// ═══════════════════════════════════════════════════════
// DreamWeave AI — Audio Generation (ElevenLabs / OpenAI TTS)
// ═══════════════════════════════════════════════════════

import { generateNarration } from "./openai";

interface AudioResult {
  audioBase64: string;
  contentType: string;
}

// Primary: ElevenLabs (premium voice + effects)
async function generateWithElevenLabs(text: string): Promise<AudioResult> {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  const voiceId = process.env.ELEVENLABS_VOICE_ID || "pNInz6obpgDQGcFmaJgB";

  if (!apiKey) throw new Error("ELEVENLABS_API_KEY not configured");

  const response = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
    {
      method: "POST",
      headers: {
        "xi-api-key": apiKey,
        "Content-Type": "application/json",
        Accept: "audio/mpeg",
      },
      body: JSON.stringify({
        text: text.slice(0, 5000),
        model_id: "eleven_multilingual_v2",
        voice_settings: {
          stability: 0.6,
          similarity_boost: 0.8,
          style: 0.4,
          use_speaker_boost: true,
        },
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`ElevenLabs error: ${response.statusText}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  const base64 = Buffer.from(arrayBuffer).toString("base64");
  return { audioBase64: base64, contentType: "audio/mpeg" };
}

// Fallback: OpenAI TTS
async function generateWithOpenAI(text: string): Promise<AudioResult> {
  const buffer = await generateNarration(text);
  if (!buffer) throw new Error("OpenAI TTS not configured");
  const base64 = buffer.toString("base64");
  return { audioBase64: base64, contentType: "audio/mpeg" };
}

export async function generateDreamAudio(text: string): Promise<AudioResult> {
  try {
    if (process.env.ELEVENLABS_API_KEY) {
      return await generateWithElevenLabs(text);
    }
  } catch (e) {
    console.warn("ElevenLabs failed, falling back to OpenAI TTS:", e);
  }

  return await generateWithOpenAI(text);
}
