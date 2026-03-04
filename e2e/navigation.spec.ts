// ═══════════════════════════════════════════════════════
// DreamWeave AI — E2E Test: Navigation & Layout
// Tests: page loads, navigation links, responsive layout, footer
// ═══════════════════════════════════════════════════════

import { test, expect } from "@playwright/test";

test.describe("Navigation & Layout", () => {
  test("homepage loads with correct title and hero content", async ({ page }) => {
    await page.goto("/");
    // Verify the page title contains DreamWeave
    await expect(page).toHaveTitle(/DreamWeave/i);
    // Verify hero heading is visible
    await expect(
      page.getByRole("heading", { level: 1 })
    ).toBeVisible();
  });

  test("navbar displays logo and navigation links", async ({ page }) => {
    await page.goto("/");
    // Logo text
    await expect(page.getByRole("link", { name: "DreamWeave" }).first()).toBeVisible();
    // Pricing link
    await expect(page.getByRole("link", { name: /pricing/i }).first()).toBeVisible();
  });

  test("pricing page loads correctly", async ({ page }) => {
    await page.goto("/pricing");
    // Should show pricing header
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    // Should have credit pack cards
    await expect(page.locator("text=Starter").or(page.locator("text=Lucid Starter"))).toBeVisible();
  });

  test("navigate from homepage to pricing via nav link", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: /pricing/i }).first().click();
    await expect(page).toHaveURL(/\/pricing/);
  });

  test("pricing page has back link to homepage", async ({ page }) => {
    await page.goto("/pricing");
    const backLink = page.getByRole("link", { name: /back/i });
    await expect(backLink).toBeVisible();
    await backLink.click();
    await expect(page).toHaveURL("/");
  });

  test("footer is visible on homepage", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await expect(page.locator("footer")).toBeVisible();
  });

  test("mobile menu opens and closes", async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/");
    // Look for the mobile menu toggle button (hamburger)
    const menuButton = page.locator("nav button").first();
    if (await menuButton.isVisible()) {
      await menuButton.click();
      // Should show pricing link in mobile menu
      await expect(page.getByRole("link", { name: /pricing/i })).toBeVisible();
    }
  });
});
