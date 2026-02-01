import { test, expect } from "@playwright/test";

test.describe("Handover Management", () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto("/login");
    await page.getByLabel(/email/i).fill("admin@clinic.local");
    await page.getByLabel(/密碼/i).fill("password123");
    await page.getByRole("button", { name: /登入/i }).click();
    await expect(page).toHaveURL(/.*dashboard/);
  });

  test("should navigate to handover page", async ({ page }) => {
    await page.getByRole("link", { name: /交班/i }).click();

    await expect(page).toHaveURL(/.*handover/);
    await expect(page.getByText(/交班事項/i)).toBeVisible();
  });

  test("should create a new handover item", async ({ page }) => {
    await page.goto("/handover");

    // Click create button
    await page.getByRole("button", { name: /新增/i }).click();

    // Fill in the form
    const title = `Test Handover ${Date.now()}`;
    await page.getByLabel(/標題/i).fill(title);
    await page.getByLabel(/內容/i).fill("This is a test handover item");

    // Submit
    await page.getByRole("button", { name: /儲存|確認/i }).click();

    // Verify the handover was created
    await expect(page.getByText(title)).toBeVisible();
  });

  test("should update handover status", async ({ page }) => {
    await page.goto("/handover");

    // Find a pending handover item and click on it
    const handoverItem = page.locator('[data-status="PENDING"]').first();
    await handoverItem.click();

    // Change status
    await page.getByRole("button", { name: /更新狀態|進行中/i }).click();

    // Verify status changed
    await expect(page.getByText(/進行中/i)).toBeVisible();
  });

  test("should add a comment to handover", async ({ page }) => {
    await page.goto("/handover");

    // Click on a handover item
    await page.locator(".handover-item").first().click();

    // Add comment
    const comment = `Test comment ${Date.now()}`;
    await page.getByPlaceholder(/新增註記/i).fill(comment);
    await page.getByRole("button", { name: /新增/i }).click();

    // Verify comment was added
    await expect(page.getByText(comment)).toBeVisible();
  });

  test("should filter handovers by status", async ({ page }) => {
    await page.goto("/handover");

    // Filter by completed status
    await page.getByRole("combobox", { name: /狀態/i }).click();
    await page.getByRole("option", { name: /已完成/i }).click();

    // All visible items should be completed
    const statusBadges = page.locator('[data-status]');
    const count = await statusBadges.count();

    for (let i = 0; i < count; i++) {
      await expect(statusBadges.nth(i)).toHaveAttribute(
        "data-status",
        "COMPLETED",
      );
    }
  });
});
