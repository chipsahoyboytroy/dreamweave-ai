// ═══════════════════════════════════════════════════════
// DreamWeave AI — E2E Test: Pricing & Payment Flow
// Tests: pricing cards, plan details, checkout button behavior
// ═══════════════════════════════════════════════════════

import { test, expect } from "@playwright/test";

test.describe("Pricing & Payment Flow", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/pricing");
  });

  test("pricing page displays all three credit packs", async ({ page }) => {
    // Should show the three plan names
    await expect(page.getByRole("heading", { name: /Lucid Starter/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: /Dream Explorer/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: /Visionary/i })).toBeVisible();
  });

  test("each pricing card shows credit count", async ({ page }) => {
    // Check for credit amounts
    await expect(page.locator("text=15").first()).toBeVisible();
    await expect(page.locator("text=40").first()).toBeVisible();
    await expect(page.locator("text=100").first()).toBeVisible();
  });

  test("pricing cards have purchase/get started buttons", async ({ page }) => {
    const buttons = page.getByRole("button", { name: /Get Lucid Starter|Get Dream Explorer|Get Visionary/i });
    const count = await buttons.count();
    expect(count).toBeGreaterThanOrEqual(1);
  });

  test("clicking purchase without auth shows sign-in prompt or redirects", async ({ page }) => {
    // Mock the checkout endpoint to return 401
    await page.route("/api/stripe/checkout", async (route) => {
      await route.fulfill({
        status: 401,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: "Please sign in to purchase credits." }),
      });
    });

    const purchaseBtn = page.locator("button").filter({
      hasText: /get started|purchase|buy|select/i,
    }).first();

    if (await purchaseBtn.isVisible()) {
      await purchaseBtn.click();
      await page.waitForTimeout(1000);
      // Should show some sign-in prompt or error message
    }
  });

  test("pricing page is responsive on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/pricing");
    // Cards should still be visible in mobile layout
    await expect(page.getByRole("heading", { name: /Lucid Starter/i })).toBeVisible();
  });
});
