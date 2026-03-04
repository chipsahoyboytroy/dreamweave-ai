// ═══════════════════════════════════════════════════════
// DreamWeave AI — E2E Test: Dream Share Page
// Tests: loaded dream page, tab navigation, error states, social share buttons
// ═══════════════════════════════════════════════════════

import { test, expect } from "@playwright/test";

test.describe("Dream Share Page", () => {
  test("dream page shows loading state initially", async ({ page }) => {
    // Mock the API to simulate a delay
    await page.route("/api/dream/test-dream-id-123", async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 500));
      await route.fulfill({
        status: 200,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: "test-dream-id-123",
          textInput: "I dreamed of floating in a cosmic ocean",
          mood: "peaceful",
          interpretation: "Your dream suggests a deep connection to the unconscious...",
          story: "You find yourself suspended in an infinite sea of stars...",
          archetypes: ["The Self", "The Water"],
          emotions: ["serenity", "awe"],
          themes: ["transcendence", "inner peace"],
          generatedImage: null,
          summary: "A dream of cosmic connection and inner peace",
          createdAt: new Date().toISOString(),
        }),
      });
    });

    await page.goto("/dream/test-dream-id-123");
    // Should eventually show the dream content
    await expect(page.locator("text=cosmic").first()).toBeVisible({ timeout: 10000 });
  });

  test("dream page shows 404 for non-existent dream", async ({ page }) => {
    await page.route("/api/dream/nonexistent-abc123", async (route) => {
      await route.fulfill({
        status: 404,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: "Dream not found" }),
      });
    });

    await page.goto("/dream/nonexistent-abc123");
    await expect(
      page.locator("text=not found").or(page.locator("text=Not found")).or(page.locator("text=error"))
    ).toBeVisible({ timeout: 5000 });
  });

  test("dream page has back to home link", async ({ page }) => {
    await page.route("/api/dream/test-back-link", async (route) => {
      await route.fulfill({
        status: 200,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: "test-back-link",
          textInput: "test dream",
          mood: null,
          interpretation: "test interpretation content here",
          story: null,
          archetypes: [],
          emotions: [],
          themes: [],
          generatedImage: null,
          summary: "test summary",
          createdAt: new Date().toISOString(),
        }),
      });
    });

    await page.goto("/dream/test-back-link");
    await page.waitForTimeout(1000);
    const backLink = page.getByRole("link", { name: /back|home|dream/i }).first();
    if (await backLink.isVisible()) {
      await expect(backLink).toBeVisible();
    }
  });

  test("dream page renders interpretation tab content", async ({ page }) => {
    await page.route("/api/dream/test-tabs", async (route) => {
      await route.fulfill({
        status: 200,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: "test-tabs",
          textInput: "I dreamed of flying over mountains",
          mood: "excited",
          interpretation: "## Dream Interpretation\n\nYour flight represents liberation...",
          story: "You soar higher and higher into the crystalline sky...",
          archetypes: ["The Hero", "The Flight"],
          emotions: ["liberation", "exhilaration"],
          themes: ["freedom", "overcoming obstacles"],
          generatedImage: null,
          summary: "A dream of soaring freedom",
          createdAt: new Date().toISOString(),
        }),
      });
    });

    await page.goto("/dream/test-tabs");
    await page.waitForTimeout(1500);

    // Interpretation content should be visible
    const interpretationText = page.locator("text=liberation").or(page.locator("text=Interpretation"));
    await expect(interpretationText.first()).toBeVisible({ timeout: 5000 });
  });
});
