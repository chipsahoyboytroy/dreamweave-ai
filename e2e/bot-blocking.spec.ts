// ═══════════════════════════════════════════════════════
// DreamWeave AI — E2E Test: Scanner/Bot Path Blocking
// Tests: middleware rejects common exploit/scanner paths
// ═══════════════════════════════════════════════════════

import { test, expect } from "@playwright/test";

const BLOCKED_PATHS = [
  "/wp-admin",
  "/wp-login",
  "/.env",
  "/phpinfo",
  "/.git",
  "/xmlrpc.php",
  "/wp-content",
  "/vendor",
  "/cgi-bin",
  "/actuator",
];

test.describe("Scanner/Bot Path Blocking", () => {
  for (const path of BLOCKED_PATHS) {
    test(`blocks scanner probe: ${path}`, async ({ request }) => {
      const response = await request.get(path);
      expect(response.status()).toBe(404);
    });
  }

  test("legitimate paths still work", async ({ request }) => {
    const response = await request.get("/");
    expect(response.status()).toBe(200);
  });

  test("API paths still work", async ({ request }) => {
    const response = await request.get("/api/credits");
    expect(response.status()).toBe(200);
  });
});
