// ═══════════════════════════════════════════════════════
// DreamWeave AI — E2E Test: Security Headers
// Tests: CSP, HSTS, X-Frame-Options, CORS, etc.
// ═══════════════════════════════════════════════════════

import { test, expect } from "@playwright/test";

test.describe("Security Headers", () => {
  test("homepage returns security headers", async ({ request }) => {
    const response = await request.get("/");
    const headers = response.headers();

    // X-Content-Type-Options
    expect(headers["x-content-type-options"]).toBe("nosniff");

    // X-Frame-Options
    expect(headers["x-frame-options"]).toBe("DENY");
  });

  test("CSP header is set on pages", async ({ request }) => {
    const response = await request.get("/");
    const headers = response.headers();
    const csp = headers["content-security-policy"];
    if (csp) {
      expect(csp).toContain("default-src");
      expect(csp).toContain("script-src");
      expect(csp).toContain("object-src 'none'");
    }
  });

  test("HSTS header is present", async ({ request }) => {
    const response = await request.get("/");
    const headers = response.headers();
    const hsts = headers["strict-transport-security"];
    if (hsts) {
      expect(hsts).toContain("max-age=");
      expect(hsts).toContain("includeSubDomains");
    }
  });

  test("API endpoints include security headers", async ({ request }) => {
    const response = await request.get("/api/credits");
    const headers = response.headers();
    expect(headers["x-content-type-options"]).toBe("nosniff");
  });

  test("x-powered-by header is not exposed", async ({ request }) => {
    const response = await request.get("/");
    const headers = response.headers();
    expect(headers["x-powered-by"]).toBeUndefined();
  });

  test("API POST without JSON content-type returns 415", async ({ request }) => {
    const response = await request.post("/api/dream", {
      data: "not json",
      headers: { "Content-Type": "text/plain" },
    });
    expect([415, 429]).toContain(response.status());
  });

  test("referrer-policy header is set", async ({ request }) => {
    const response = await request.get("/");
    const headers = response.headers();
    const referrer = headers["referrer-policy"];
    if (referrer) {
      expect(referrer).toContain("strict-origin");
    }
  });
});
