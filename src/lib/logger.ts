// ═══════════════════════════════════════════════════════
// DreamWeave AI — Secure Logger
// SECURITY: Never log sensitive data (PII, tokens, keys) (OWASP A09)
// ═══════════════════════════════════════════════════════

type LogLevel = "info" | "warn" | "error" | "security";

/**
 * SECURITY: Patterns that MUST be redacted from log output.
 * Prevents accidental exposure of secrets in logs/monitoring (OWASP A02, A09).
 */
const SENSITIVE_PATTERNS = [
  /sk[-_](?:test|live|prod)[a-zA-Z0-9_-]{10,}/gi,    // Stripe keys
  /sk-[a-zA-Z0-9]{20,}/gi,                             // OpenAI keys
  /whsec_[a-zA-Z0-9_-]+/gi,                            // Stripe webhook secrets
  /eyJ[a-zA-Z0-9_-]{20,}\.[a-zA-Z0-9_-]{20,}/gi,     // JWTs
  /data:(?:image|audio)\/[^;]+;base64,[a-zA-Z0-9+/=]{100,}/gi, // Large base64 blobs
  /password["\s:=]+["']?[^"'\s]{3,}/gi,                 // Password values
  /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/gi, // Email addresses
];

/**
 * SECURITY: Redact sensitive data from a string before logging.
 */
function redact(input: string): string {
  let result = input;
  for (const pattern of SENSITIVE_PATTERNS) {
    result = result.replace(pattern, "[REDACTED]");
  }
  return result;
}

/**
 * SECURITY: Redact sensitive values from objects before logging.
 */
function redactObject(obj: unknown): unknown {
  if (typeof obj === "string") return redact(obj);
  if (obj instanceof Error) {
    return {
      name: obj.name,
      message: redact(obj.message),
      // SECURITY: Only include stack traces in development (OWASP A02)
      ...(process.env.NODE_ENV === "development" && { stack: redact(obj.stack || "") }),
    };
  }
  if (typeof obj === "object" && obj !== null) {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      // SECURITY: Redact entire values of known sensitive keys
      const sensitiveKeys = [
        "password", "secret", "token", "apiKey", "api_key",
        "authorization", "cookie", "creditCard", "ssn",
        "access_token", "refresh_token", "id_token",
      ];
      if (sensitiveKeys.some((sk) => key.toLowerCase().includes(sk))) {
        result[key] = "[REDACTED]";
      } else {
        result[key] = redactObject(value);
      }
    }
    return result;
  }
  return obj;
}

class SecureLogger {
  private formatMessage(level: LogLevel, message: string, meta?: unknown): string {
    const timestamp = new Date().toISOString();
    const safeMessage = redact(message);
    const safeMeta = meta ? ` ${JSON.stringify(redactObject(meta))}` : "";
    return `[${timestamp}] [${level.toUpperCase()}] ${safeMessage}${safeMeta}`;
  }

  info(message: string, meta?: unknown) {
    console.log(this.formatMessage("info", message, meta));
  }

  warn(message: string, meta?: unknown) {
    console.warn(this.formatMessage("warn", message, meta));
  }

  error(message: string, meta?: unknown) {
    console.error(this.formatMessage("error", message, meta));
  }

  /**
   * SECURITY: Dedicated method for security-relevant events (auth failures, rate limits, etc.)
   * These should be routed to a SIEM in production.
   */
  security(event: string, meta?: unknown) {
    console.warn(this.formatMessage("security", `[SECURITY_EVENT] ${event}`, meta));
  }
}

export const logger = new SecureLogger();
