import { test, expect } from "@playwright/test";

test.describe("Scheduling Management", () => {
  test.beforeEach(async ({ page }) => {
    // Login as supervisor/admin for scheduling access
    await page.goto("/login");
    await page.getByLabel(/email/i).fill("supervisor@clinic.local");
    await page.getByLabel(/密碼/i).fill("password123");
    await page.getByRole("button", { name: /登入/i }).click();
    await expect(page).toHaveURL(/.*dashboard/);
  });

  test("should navigate to scheduling page", async ({ page }) => {
    await page.getByRole("link", { name: /排班/i }).click();

    await expect(page).toHaveURL(/.*scheduling/);
    await expect(page.getByText(/排班管理/i)).toBeVisible();
  });

  test("should display weekly schedule view", async ({ page }) => {
    await page.goto("/scheduling");

    // Should show week days
    await expect(page.getByText(/週一|一/)).toBeVisible();
    await expect(page.getByText(/週日|日/)).toBeVisible();
  });

  test("should navigate between weeks", async ({ page }) => {
    await page.goto("/scheduling");

    // Get current week text
    const weekText = await page.locator('[data-testid="week-display"]').textContent();

    // Click next week button
    await page.getByRole("button", { name: /下週|>/i }).click();
    await page.waitForTimeout(500);

    // Week should have changed
    const newWeekText = await page.locator('[data-testid="week-display"]').textContent();
    expect(newWeekText).not.toBe(weekText);

    // Click previous week
    await page.getByRole("button", { name: /上週|</i }).click();
    await page.waitForTimeout(500);

    // Should be back to original week
    const finalWeekText = await page.locator('[data-testid="week-display"]').textContent();
    expect(finalWeekText).toBe(weekText);
  });

  test("should create a new shift", async ({ page }) => {
    await page.goto("/scheduling");

    // Click on an empty cell or add shift button
    await page.getByRole("button", { name: /新增班次|新增/i }).click();

    // Fill shift form
    await page.getByLabel(/日期/i).fill("2024-01-20");
    await page.getByLabel(/班別/i).selectOption("MORNING");
    await page.getByLabel(/人員/i).click();
    await page.getByRole("option").first().click();

    // Submit
    await page.getByRole("button", { name: /確認|儲存/i }).click();

    // Verify shift was created
    await expect(page.getByText(/新增成功/i)).toBeVisible();
  });

  test("should show today's shifts on dashboard", async ({ page }) => {
    await page.goto("/dashboard");

    // Should display today's shifts section
    await expect(page.getByText(/今日班表/i)).toBeVisible();
  });

  test("should view my shifts", async ({ page }) => {
    await page.goto("/scheduling");

    // Click my shifts tab or button
    await page.getByRole("tab", { name: /我的班表/i }).click();

    // Should show personal shifts view
    await expect(page.getByText(/我的排班/i)).toBeVisible();
  });
});
