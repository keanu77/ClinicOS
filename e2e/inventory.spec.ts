import { test, expect } from "@playwright/test";

test.describe("Inventory Management", () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto("/login");
    await page.getByLabel(/email/i).fill("admin@clinic.local");
    await page.getByLabel(/密碼/i).fill("password123");
    await page.getByRole("button", { name: /登入/i }).click();
    await expect(page).toHaveURL(/.*dashboard/);
  });

  test("should navigate to inventory page", async ({ page }) => {
    await page.getByRole("link", { name: /庫存/i }).click();

    await expect(page).toHaveURL(/.*inventory/);
    await expect(page.getByText(/庫存管理/i)).toBeVisible();
  });

  test("should display inventory items", async ({ page }) => {
    await page.goto("/inventory");

    // Should display inventory table or list
    await expect(
      page.locator("table, [data-testid='inventory-list']"),
    ).toBeVisible();
  });

  test("should search inventory items", async ({ page }) => {
    await page.goto("/inventory");

    // Search for an item
    await page.getByPlaceholder(/搜尋/i).fill("消毒");
    await page.keyboard.press("Enter");

    // Results should be filtered
    await page.waitForTimeout(500);
    const items = page.locator("[data-testid='inventory-item']");
    const count = await items.count();

    // If there are results, they should contain the search term
    if (count > 0) {
      await expect(items.first()).toContainText(/消毒/i);
    }
  });

  test("should show low stock warning", async ({ page }) => {
    await page.goto("/inventory");

    // Check for low stock indicator
    const lowStockBadge = page.locator(
      '[data-testid="low-stock"], .low-stock, .bg-red-100',
    );
    await expect(lowStockBadge.first()).toBeVisible();
  });

  test("should record inventory transaction", async ({ page }) => {
    await page.goto("/inventory");

    // Click on an item to view details
    await page.locator("[data-testid='inventory-item']").first().click();

    // Click add transaction
    await page.getByRole("button", { name: /異動|調整/i }).click();

    // Fill transaction form
    await page.getByLabel(/類型/i).selectOption("IN");
    await page.getByLabel(/數量/i).fill("10");
    await page.getByLabel(/備註/i).fill("Test transaction");

    // Submit
    await page.getByRole("button", { name: /確認|儲存/i }).click();

    // Verify transaction was recorded
    await expect(page.getByText(/異動成功/i)).toBeVisible();
  });

  test("should export inventory to CSV", async ({ page }) => {
    await page.goto("/inventory");

    // Click export button
    const [download] = await Promise.all([
      page.waitForEvent("download"),
      page.getByRole("button", { name: /匯出|CSV/i }).click(),
    ]);

    // Verify download
    expect(download.suggestedFilename()).toMatch(/\.csv$/);
  });
});
