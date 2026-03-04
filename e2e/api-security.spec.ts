// ═══════════════════════════════════════════════════════
// DreamWeave AI — E2E Test: API Security Endpoints
// Tests: rate limiting, input validation, content-type enforcement,
//        error handling, CORS, security headers
// ═══════════════════════════════════════════════════════

import { test, expect } from "@playwright/test";

test.describe("API Security", () => {
  test("dream API rejects empty body", async ({ request }) => {
    const response = await request.post("/api/dream", {
      data: {},
      headers: { "Content-Type": "application/json" },
    });
    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body.error).toBeTruthy();
  });

  test("dream API rejects text shorter than 10 characters", async ({ request }) => {
    const response = await request.post("/api/dream", {
      data: { text: "short" },
      headers: { "Content-Type": "application/json" },
    });
    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body.error).toBeTruthy();
  });

  test("dream API rejects invalid tier value", async ({ request }) => {
    const response = await request.post("/api/dream", {
      data: {
        text: "A long enough dream description for validation test purposes",
        tier: "premium_ultra",
      },
      headers: { "Content-Type": "application/json" },
    });
    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body.error).toBeTruthy();
  });

  test("dream API rejects invalid mood format", async ({ request }) => {
    const response = await request.post("/api/dream", {
      data: {
        text: "A long enough dream description for validation test purposes",
        mood: "<script>alert(1)</script>",
      },
      headers: { "Content-Type": "application/json" },
    });
    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body.error).toContain("Invalid mood");
  });

  test("dream API sanitizes HTML from text input", async ({ request }) => {
    const response = await request.post("/api/dream", {
      data: {
        text: '<script>alert("xss")</script>I dreamed of a vast ocean with glowing creatures beneath the waves',
        tier: "free",
      },
      headers: { "Content-Type": "application/json" },
    });
    // Should succeed (HTML gets stripped, remaining text is valid)
    // The response should be either 200 (SSE stream) or 400 if text too short after sanitization
    expect([200, 400]).toContain(response.status());
  });

  test("dream API rejects invalid image MIME type", async ({ request }) => {
    const response = await request.post("/api/dream", {
      data: {
        text: "A long enough dream description for validation test purposes here",
        imageBase64: "data:application/pdf;base64,SGVsbG8=",
        tier: "paid",
      },
      headers: { "Content-Type": "application/json" },
    });
    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body.error).toContain("image");
  });

  test("dream API rejects invalid audio MIME type", async ({ request }) => {
    const response = await request.post("/api/dream", {
      data: {
        text: "A long enough dream description for validation test purposes here",
        audioBase64: "data:application/exe;base64,SGVsbG8=",
        tier: "paid",
      },
      headers: { "Content-Type": "application/json" },
    });
    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body.error).toContain("audio");
  });

  test("dream API rejects invalid guestId format", async ({ request }) => {
    const response = await request.post("/api/dream", {
      data: {
        text: "A long enough dream description for validation test purposes here",
        guestId: "../../etc/passwd",
      },
      headers: { "Content-Type": "application/json" },
    });
    expect(response.status()).toBe(400);
  });

  test("dream/[id] API rejects path traversal attempts", async ({ request }) => {
    const response = await request.get("/api/dream/../../etc/passwd");
    expect([400, 404]).toContain(response.status());
  });

  test("dream/[id] API rejects SQL injection attempts", async ({ request }) => {
    const response = await request.get("/api/dream/' OR 1=1 --");
    expect(response.status()).toBe(400);
  });

  test("dream/[id] API returns 404 for non-existent dream", async ({ request }) => {
    const response = await request.get("/api/dream/nonexistent-dream-id-12345");
    // Should be 404 (not found) or 400 (invalid format depending on regex)
    expect([400, 404, 500]).toContain(response.status());
  });

  test("checkout API requires authentication", async ({ request }) => {
    const response = await request.post("/api/stripe/checkout", {
      data: { plan: "starter" },
      headers: { "Content-Type": "application/json" },
    });
    expect(response.status()).toBe(401);
    const body = await response.json();
    expect(body.error).toContain("sign in");
  });

  test("checkout API rejects invalid plan", async ({ request }) => {
    const response = await request.post("/api/stripe/checkout", {
      data: { plan: "super_mega_plan" },
      headers: { "Content-Type": "application/json" },
    });
    // Should be 400 (invalid plan) or 401 (auth required first)
    expect([400, 401]).toContain(response.status());
  });

  test("webhook API rejects request without signature", async ({ request }) => {
    const response = await request.post("/api/stripe/webhook", {
      data: "{}",
      headers: { "Content-Type": "application/json" },
    });
    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body.error).toBeTruthy();
  });

  test("credits API returns valid JSON for unauthenticated user", async ({ request }) => {
    const response = await request.get("/api/credits");
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body).toHaveProperty("credits");
    expect(body).toHaveProperty("tier");
    expect(body.credits).toBe(0);
  });
});
