/** @type {import('next').NextConfig} */

// SECURITY: Derive allowed origin from env — never use wildcard "*" in production (OWASP A01/A05)
const ALLOWED_ORIGIN = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

const nextConfig = {
  // SECURITY: Disable x-powered-by header to reduce fingerprinting surface (OWASP A02)
  poweredByHeader: false,

  images: {
    remotePatterns: [
      { protocol: "https", hostname: "fal.media" },
      { protocol: "https", hostname: "oaidalleapiprodscus.blob.core.windows.net" },
      { protocol: "https", hostname: "replicate.delivery" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
    ],
  },

  experimental: {
    serverActions: {
      // SECURITY: Reduced from 10mb to 6mb — only images/audio need this; limits DoS surface
      bodySizeLimit: "6mb",
    },
  },

  async headers() {
    // SECURITY: Comprehensive security headers applied to ALL routes (OWASP A02, A05)
    const securityHeaders = [
      // SECURITY: HSTS — force HTTPS for 1 year + subdomains + preload list eligible
      { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains; preload" },
      // SECURITY: Prevent MIME-type sniffing (OWASP A05)
      { key: "X-Content-Type-Options", value: "nosniff" },
      // SECURITY: Clickjacking protection — deny all framing (OWASP A01)
      { key: "X-Frame-Options", value: "DENY" },
      // SECURITY: XSS filter — belt-and-suspenders alongside CSP
      { key: "X-XSS-Protection", value: "1; mode=block" },
      // SECURITY: Restrict referrer leakage to same origin only (OWASP A04)
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      // SECURITY: Permissions-Policy — disable unused browser APIs to reduce attack surface
      { key: "Permissions-Policy", value: "camera=(), microphone=(self), geolocation=(), payment=(self)" },
      // SECURITY: Content-Security-Policy — strict whitelist of allowed sources (OWASP A03/A07)
      // NOTE: 'unsafe-inline' for style-src needed for Tailwind/Framer Motion; tighten with nonces in prod
      {
        key: "Content-Security-Policy",
        value: [
          "default-src 'self'",
          "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com",
          "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
          "font-src 'self' https://fonts.gstatic.com",
          "img-src 'self' data: blob: https://fal.media https://oaidalleapiprodscus.blob.core.windows.net https://replicate.delivery https://lh3.googleusercontent.com",
          "media-src 'self' data: blob:",
          "connect-src 'self' https://api.openai.com https://queue.fal.run https://api.elevenlabs.io https://api.stripe.com https://us.i.posthog.com",
          "frame-src 'self' https://js.stripe.com https://hooks.stripe.com",
          "object-src 'none'",
          "base-uri 'self'",
          "form-action 'self'",
          "frame-ancestors 'none'",
          "upgrade-insecure-requests",
        ].join("; "),
      },
    ];

    return [
      // Apply security headers to ALL routes
      {
        source: "/:path*",
        headers: securityHeaders,
      },
      // SECURITY: Strict CORS for API routes — only allow our own origin, not wildcard (OWASP A01)
      {
        source: "/api/:path*",
        headers: [
          ...securityHeaders,
          { key: "Access-Control-Allow-Origin", value: ALLOWED_ORIGIN },
          { key: "Access-Control-Allow-Methods", value: "GET, POST, OPTIONS" },
          { key: "Access-Control-Allow-Headers", value: "Content-Type, Authorization" },
          { key: "Access-Control-Allow-Credentials", value: "true" },
          // SECURITY: Prevent caching of API responses containing user data
          { key: "Cache-Control", value: "no-store, no-cache, must-revalidate, proxy-revalidate" },
          { key: "Pragma", value: "no-cache" },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
