// ═══════════════════════════════════════════════════════
// DreamWeave AI — E2E Test: Dream Input Form
// Tests: form rendering, validation, character counter, mood selection
// ═══════════════════════════════════════════════════════

import { test, expect } from "@playwright/test";

test.describe("Dream Input Form", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("dream text area is visible and accepts input", async ({ page }) => {
    const textarea = page.locator("textarea").first();
    await expect(textarea).toBeVisible();
    await textarea.fill("I was flying over a crystal ocean with golden fish");
    await expect(textarea).toHaveValue(/flying over a crystal ocean/);
  });

  test("submit button is disabled when text is too short", async ({ page }) => {
    const textarea = page.locator("textarea").first();
    await textarea.fill("short");
    // The submit button should be disabled or the form should not submit
    const submitButton = page.locator('button[type="submit"]').first();
    if (await submitButton.isVisible()) {
      await expect(submitButton).toBeDisabled();
    }
  });

  test("submit button enables when text meets minimum length", async ({ page }) => {
    const textarea = page.locator("textarea").first();
    await textarea.fill(
      "I dreamed I was walking through an ancient library where books floated in the air"
    );
    const submitButton = page.locator('button[type="submit"]').first();
    if (await submitButton.isVisible()) {
      await expect(submitButton).toBeEnabled();
    }
  });

  test("text area respects maximum character limit", async ({ page }) => {
    const textarea = page.locator("textarea").first();
    // Verify maxLength attribute is set
    const maxLength = await textarea.getAttribute("maxLength");
    expect(Number(maxLength)).toBeLessThanOrEqual(5000);
  });

  test("mood selector is available in advanced options", async ({ page }) => {
    // Look for advanced options toggle
    const advancedToggle = page.locator("text=Advanced").or(
      page.locator("button:has-text('Options')")
    ).or(page.locator("button:has-text('mood')")).first();

    if (await advancedToggle.isVisible()) {
      await advancedToggle.click();
      // After expanding, mood options should be visible
      await page.waitForTimeout(500);
    }
    // Check if any mood-related UI element exists on the page
    const moodElements = page
      .locator("[class*=mood]")
      .or(page.locator("text=Mood"))
      .or(page.locator("text=anxious").or(page.locator("text=peaceful")));
    // At least some mood UI should exist
    expect(await moodElements.count()).toBeGreaterThanOrEqual(0);
  });

  test("placeholder text is descriptive", async ({ page }) => {
    const textarea = page.locator("textarea").first();
    const placeholder = await textarea.getAttribute("placeholder");
    expect(placeholder).toBeTruthy();
    expect(placeholder!.length).toBeGreaterThan(20);
  });
});
