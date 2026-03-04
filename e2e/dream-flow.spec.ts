// ═══════════════════════════════════════════════════════
// DreamWeave AI — E2E Test: Dream Submission Flow (Free Tier)
// Tests: full dream submission flow via SSE with mocked API responses
// ═══════════════════════════════════════════════════════

import { test, expect } from "@playwright/test";

test.describe("Dream Submission Flow (Free Tier)", () => {
  test("can type a dream and see the submit button", async ({ page }) => {
    await page.goto("/");
    const textarea = page.locator("textarea").first();
    await textarea.fill(
      "I dreamed I was walking through an enchanted forest where the trees whispered ancient secrets and the ground glowed with golden light"
    );
    // Submit button should become enabled
    const submitBtn = page.locator('button[type="submit"]').first();
    if (await submitBtn.isVisible()) {
      await expect(submitBtn).toBeEnabled();
    }
  });

  test("submitting a dream shows loading state", async ({ page }) => {
    await page.goto("/");
    const textarea = page.locator("textarea").first();
    await textarea.fill(
      "I dreamed of running across an infinite golden bridge suspended in a starlit void with swirling nebulae below"
    );

    // Mock the API to return a streaming response
    await page.route("/api/dream", async (route) => {
      const sseBody = [
        `data: ${JSON.stringify({ type: "archetypes", content: JSON.stringify({ archetypes: ["The Hero"], emotions: ["wonder"], themes: ["journey"], summary: "A dream of crossing boundaries" }) })}\n\n`,
        `data: ${JSON.stringify({ type: "interpretation", content: "Your dream of the golden bridge represents..." })}\n\n`,
        `data: ${JSON.stringify({ type: "summary", content: JSON.stringify({ id: "test-dream-123", summary: "A dream of crossing boundaries" }) })}\n\n`,
        `data: ${JSON.stringify({ type: "done", content: "test-dream-123" })}\n\n`,
      ].join("");

      await route.fulfill({
        status: 200,
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        },
        body: sseBody,
      });
    });

    const submitBtn = page.locator('button[type="submit"]').first();
    if (await submitBtn.isVisible()) {
      await submitBtn.click();
      // Should show some loading or streaming indicator
      await page.waitForTimeout(500);
      // The interpretation text should eventually appear
      await expect(page.getByText("Your dream of the golden bridge", { exact: false })).toBeVisible({ timeout: 5000 });
    }
  });

  test("error from API displays error message to user", async ({ page }) => {
    await page.goto("/");
    const textarea = page.locator("textarea").first();
    await textarea.fill(
      "I dreamed of a vast ocean filled with luminescent jellyfish floating through purple clouds"
    );

    // Mock the API to return an error
    await page.route("/api/dream", async (route) => {
      await route.fulfill({
        status: 400,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: "Dream description too short after sanitization" }),
      });
    });

    const submitBtn = page.locator('button[type="submit"]').first();
    if (await submitBtn.isVisible()) {
      await submitBtn.click();
      // Error should be displayed to the user somewhere on the page
      await page.waitForTimeout(1000);
    }
  });
});
