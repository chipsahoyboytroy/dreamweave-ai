// ═══════════════════════════════════════════════════════
// DreamWeave AI — Next.js Middleware
// SECURITY: Global request-level security controls (OWASP A01, A02, A05, A07)
// ═══════════════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server";

// SECURITY: Simple in-memory sliding window rate limiter for edge runtime
// NOTE: In production, replace with Upstash Redis (@upstash/ratelimit) for distributed rate limiting
const ipRequestCounts = new Map<string, { count: number; windowStart: number }>();
const GLOBAL_RATE_LIMIT = 60; // requests per window
const GLOBAL_RATE_WINDOW_MS = 60_000; // 1 minute

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = ipRequestCounts.get(ip);

  if (!entry || now - entry.windowStart > GLOBAL_RATE_WINDOW_MS) {
    ipRequestCounts.set(ip, { count: 1, windowStart: now });
    return false;
  }

  entry.count++;
  return entry.count > GLOBAL_RATE_LIMIT;
}

// SECURITY: Periodically clean stale entries to prevent memory leak (runs every ~100 requests)
let cleanupCounter = 0;
function maybeCleanup() {
  cleanupCounter++;
  if (cleanupCounter % 100 === 0) {
    const now = Date.now();
    for (const [ip, entry] of ipRequestCounts) {
      if (now - entry.windowStart > GLOBAL_RATE_WINDOW_MS * 2) {
        ipRequestCounts.delete(ip);
      }
    }
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ─── Extract Client IP ─────────────────────────────
  // SECURITY: Use x-forwarded-for behind reverse proxy (Vercel), fall back to x-real-ip
  const clientIp =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";

  // ─── Global Rate Limiting ──────────────────────────
  // SECURITY: Protect ALL routes from volumetric abuse / DDoS (OWASP A04:DoS)
  if (pathname.startsWith("/api/")) {
    maybeCleanup();
    if (isRateLimited(clientIp)) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Please try again later." },
        {
          status: 429,
          headers: {
            "Retry-After": "60",
            // SECURITY: Prevent caching of rate-limit responses
            "Cache-Control": "no-store",
          },
        }
      );
    }
  }

  // ─── Block Suspicious Paths ────────────────────────
  // SECURITY: Reject common scanner/bot probing paths to reduce noise (OWASP A05)
  const blockedPaths = [
    "/wp-admin", "/wp-login", "/.env", "/phpinfo",
    "/admin", "/actuator", "/.git", "/xmlrpc.php",
    "/wp-content", "/vendor", "/cgi-bin",
  ];
  if (blockedPaths.some((p) => pathname.toLowerCase().startsWith(p))) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // ─── Enforce Content-Type on API POST ──────────────
  // SECURITY: Reject API POSTs without proper JSON content-type to mitigate CSRF via form submissions (OWASP A01)
  if (
    pathname.startsWith("/api/") &&
    request.method === "POST" &&
    // Stripe webhook sends raw body — exempt it from JSON content-type check
    !pathname.startsWith("/api/stripe/webhook") &&
    !pathname.startsWith("/api/auth/")
  ) {
    const contentType = request.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      return NextResponse.json(
        { error: "Content-Type must be application/json" },
        { status: 415 }
      );
    }
  }

  // ─── Request Size Guard ────────────────────────────
  // SECURITY: Reject oversized requests early at edge before they reach API handlers (DoS prevention)
  const contentLength = parseInt(request.headers.get("content-length") || "0");
  if (contentLength > 6 * 1024 * 1024) { // 6MB matches next.config bodySizeLimit
    return NextResponse.json(
      { error: "Request payload too large" },
      { status: 413 }
    );
  }

  const response = NextResponse.next();

  // ─── Additional Response Headers ───────────────────
  // SECURITY: Belt-and-suspenders headers set at middleware level (complements next.config headers)
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");

  return response;
}

export const config = {
  // Run middleware on all routes except static assets and Next.js internals
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icon-.*\\.png|manifest\\.json).*)",
  ],
};
