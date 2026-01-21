import { test, expect } from "@playwright/test";

test.describe("Admin Portal E2E", () => {
  test("should allow admin to login and see the brand manager", async ({
    page,
  }) => {
    // Navigate to Login
    await page.goto("/auth/login");

    // Fill in credentials (Assuming these work in dev/mock environment)
    await page.fill('input[name="email"]', "admin@test.com");
    await page.fill('input[name="password"]', "password123");
    await page.click('button[type="submit"]');

    // Wait for redirect to dashboard or admin
    await expect(page).toHaveURL(/.*dashboard|.*admin/);

    // Navigate to Admin Brands if not redirected
    await page.goto("/admin/brands");

    // Check if Brand Manager is visible
    await expect(page.locator("h1")).toContainText(/Brands|Brand Manager/);

    // Search for a brand
    const searchInput = page.getByPlaceholder("Search...");
    await searchInput.fill("apple");

    // Verify search results (DataTable might take a moment to debounce)
    await page.waitForTimeout(1000);
    await expect(page.getByText("apple", { exact: false })).toBeVisible();

    // Open Add Brand Modal
    await page.click('button:has-text("Add New Brand")');
    await expect(page.getByText("Add Brand Profile")).toBeVisible();
  });
});
