// ═══════════════════════════════════════════════════════
// DreamWeave AI — Input Validation & Sanitization
// SECURITY: Centralized validation layer (OWASP A03: Injection, A07: XSS)
// ═══════════════════════════════════════════════════════

import { z } from "zod";

// ─── Sanitization Helpers ────────────────────────────

/**
 * SECURITY: Strip HTML tags and dangerous characters from user text input.
 * Prevents stored XSS when content is rendered (OWASP A07).
 * Does NOT alter harmless Unicode — only strips HTML/script-bearing patterns.
 */
export function sanitizeText(input: string): string {
  return input
    // Remove HTML tags
    .replace(/<[^>]*>/g, "")
    // Remove javascript: protocol patterns
    .replace(/javascript\s*:/gi, "")
    // Remove data: URI schemes that can execute JS
    .replace(/data\s*:\s*text\/html/gi, "")
    // Remove event handler patterns (onerror, onclick, etc.)
    .replace(/on\w+\s*=/gi, "")
    // Normalize whitespace (prevent null-byte injection)
    .replace(/\0/g, "")
    .trim();
}

/**
 * SECURITY: Validate that a base64 data URI matches expected MIME types.
 * Prevents uploading disguised executables via base64 (OWASP A04).
 */
export function validateBase64DataUri(
  uri: string,
  allowedPrefixes: string[]
): boolean {
  const lower = uri.toLowerCase();
  return allowedPrefixes.some((prefix) => lower.startsWith(prefix));
}

/**
 * SECURITY: Validate and constrain base64 payload size.
 * Prevents memory exhaustion from oversized payloads (DoS).
 */
export function validateBase64Size(uri: string, maxSizeMB: number): boolean {
  // Approximate decoded size: base64 encodes 3 bytes into 4 chars
  const base64Part = uri.split(",")[1] || uri;
  const approximateBytes = (base64Part.length * 3) / 4;
  return approximateBytes <= maxSizeMB * 1024 * 1024;
}

// ─── Zod Schemas ─────────────────────────────────────

/**
 * SECURITY: Strict schema for dream submission input.
 * Every field is validated, typed, and constrained (OWASP A03, A08).
 */
export const dreamInputSchema = z.object({
  text: z
    .string()
    .min(10, "Dream description must be at least 10 characters")
    .max(5000, "Dream description must be under 5000 characters")
    .transform(sanitizeText)
    // SECURITY: After sanitization, re-check min length
    .refine((val: string) => val.length >= 10, {
      message: "Dream description too short after sanitization",
    }),

  mood: z
    .string()
    .max(50)
    .regex(/^[a-zA-Z_-]*$/, "Invalid mood value")
    .optional()
    .transform((val: string | undefined) => val || undefined),

  imageBase64: z
    .string()
    .optional()
    .refine(
      (val: string | undefined) => {
        if (!val) return true;
        // SECURITY: Only allow image/* MIME types in data URIs
        return validateBase64DataUri(val, [
          "data:image/png",
          "data:image/jpeg",
          "data:image/jpg",
          "data:image/webp",
          "data:image/gif",
        ]);
      },
      { message: "Invalid image format. Allowed: PNG, JPEG, WebP, GIF" }
    )
    .refine(
      (val: string | undefined) => {
        if (!val) return true;
        // SECURITY: Max 5MB for images
        return validateBase64Size(val, 5);
      },
      { message: "Image too large. Maximum size is 5MB" }
    ),

  audioBase64: z
    .string()
    .optional()
    .refine(
      (val: string | undefined) => {
        if (!val) return true;
        // SECURITY: Only allow audio/* MIME types
        return validateBase64DataUri(val, [
          "data:audio/webm",
          "data:audio/mp4",
          "data:audio/mpeg",
          "data:audio/ogg",
          "data:audio/wav",
        ]);
      },
      { message: "Invalid audio format" }
    )
    .refine(
      (val: string | undefined) => {
        if (!val) return true;
        // SECURITY: Max 5MB for audio
        return validateBase64Size(val, 5);
      },
      { message: "Audio too large. Maximum size is 5MB" }
    ),

  tier: z.enum(["free", "paid"]).default("free").optional(),

  guestId: z
    .string()
    .max(100)
    .regex(/^guest_[a-f0-9-]+$/i, "Invalid guest ID format")
    .optional(),
});

/**
 * SECURITY: Schema for Stripe checkout request.
 */
export const checkoutSchema = z.object({
  plan: z.enum(["starter", "explorer", "visionary"], {
    errorMap: () => ({ message: "Invalid plan. Choose starter, explorer, or visionary." }),
  }),
});

/**
 * SECURITY: Schema for dream ID path parameter.
 * CUIDs are alphanumeric — reject anything else to prevent path traversal / injection.
 */
export const dreamIdSchema = z
  .string()
  .min(1)
  .max(50)
  .regex(/^[a-zA-Z0-9_-]+$/, "Invalid dream ID format");

export type DreamInputValidated = z.infer<typeof dreamInputSchema>;
export type CheckoutValidated = z.infer<typeof checkoutSchema>;
