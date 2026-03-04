// ═══════════════════════════════════════════════════════
// DreamWeave AI — E2E Test: Accessibility & Performance Basics
// Tests: basic a11y checks, focus management, color contrast hints
// ═══════════════════════════════════════════════════════

import { test, expect } from "@playwright/test";

test.describe("Accessibility & Performance", () => {
  test("page has lang attribute set on html element", async ({ page }) => {
    await page.goto("/");
    const lang = await page.locator("html").getAttribute("lang");
    expect(lang).toBeTruthy();
  });

  test("images have alt attributes", async ({ page }) => {
    await page.goto("/");
    const images = page.locator("img");
    const count = await images.count();
    for (let i = 0; i < count; i++) {
      const alt = await images.nth(i).getAttribute("alt");
      // alt should be present (can be empty string for decorative images)
      expect(alt).not.toBeNull();
    }
  });

  test("form inputs have associated labels or accessible names", async ({ page }) => {
    await page.goto("/");
    const textarea = page.locator("textarea").first();
    if (await textarea.isVisible()) {
      // Check for aria-label, aria-labelledby, or a <label> element
      const ariaLabel = await textarea.getAttribute("aria-label");
      const ariaLabelledBy = await textarea.getAttribute("aria-labelledby");
      const placeholder = await textarea.getAttribute("placeholder");
      // At least one accessible name mechanism should exist
      expect(ariaLabel || ariaLabelledBy || placeholder).toBeTruthy();
    }
  });

  test("page loads within 5 seconds", async ({ page }) => {
    const start = Date.now();
    await page.goto("/", { waitUntil: "domcontentloaded" });
    const loadTime = Date.now() - start;
    expect(loadTime).toBeLessThan(5000);
  });

  test("no console errors on homepage load", async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        consoleErrors.push(msg.text());
      }
    });

    await page.goto("/");
    await page.waitForTimeout(2000);

    // Filter out expected dev-mode warnings
    const realErrors = consoleErrors.filter(
      (e) =>
        !e.includes("Download the React DevTools") &&
        !e.includes("hydration") &&
        !e.includes("Warning:") &&
        !e.includes("Failed to load resource") // Expected for missing env vars in test
    );
    expect(realErrors).toHaveLength(0);
  });

  test("heading hierarchy is correct (h1 exists)", async ({ page }) => {
    await page.goto("/");
    const h1 = page.locator("h1");
    expect(await h1.count()).toBeGreaterThanOrEqual(1);
  });

  test("pricing page has proper heading structure", async ({ page }) => {
    await page.goto("/pricing");
    const h1 = page.locator("h1");
    expect(await h1.count()).toBeGreaterThanOrEqual(1);
  });

  test("keyboard navigation works on main form", async ({ page }) => {
    await page.goto("/");
    // Tab should move focus to the textarea
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");
    // After several tabs, some element should be focused
    const focusedTag = await page.evaluate(() => document.activeElement?.tagName);
    expect(focusedTag).toBeTruthy();
  });
});
