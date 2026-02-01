import { test, expect } from "@playwright/test";

test.describe("Authentication", () => {
  test("should display login page", async ({ page }) => {
    await page.goto("/login");

    await expect(page.getByRole("heading", { name: /登入/i })).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/密碼/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /登入/i })).toBeVisible();
  });

  test("should show error for invalid credentials", async ({ page }) => {
    await page.goto("/login");

    await page.getByLabel(/email/i).fill("invalid@example.com");
    await page.getByLabel(/密碼/i).fill("wrongpassword");
    await page.getByRole("button", { name: /登入/i }).click();

    await expect(page.getByText(/帳號或密碼錯誤/i)).toBeVisible();
  });

  test("should login successfully with valid credentials", async ({ page }) => {
    await page.goto("/login");

    await page.getByLabel(/email/i).fill("admin@clinic.local");
    await page.getByLabel(/密碼/i).fill("password123");
    await page.getByRole("button", { name: /登入/i }).click();

    // Should redirect to dashboard
    await expect(page).toHaveURL(/.*dashboard/);
    await expect(page.getByText(/儀表板/i)).toBeVisible();
  });

  test("should redirect unauthenticated users to login", async ({ page }) => {
    await page.goto("/dashboard");

    await expect(page).toHaveURL(/.*login/);
  });

  test("should logout successfully", async ({ page }) => {
    // First login
    await page.goto("/login");
    await page.getByLabel(/email/i).fill("admin@clinic.local");
    await page.getByLabel(/密碼/i).fill("password123");
    await page.getByRole("button", { name: /登入/i }).click();

    await expect(page).toHaveURL(/.*dashboard/);

    // Then logout
    await page.getByRole("button", { name: /登出/i }).click();

    await expect(page).toHaveURL(/.*login/);
  });
});
