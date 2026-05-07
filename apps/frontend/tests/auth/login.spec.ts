import { test, expect } from '@playwright/test';

test.describe('Authentication - Magic Link Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display login page with magic link option', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /sign in/i })).toBeVisible();
    await expect(page.getByPlaceholder(/email/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /send magic link/i })).toBeVisible();
  });

  test('should show error for invalid email format', async ({ page }) => {
    await page.getByPlaceholder(/email/i).fill('invalid-email');
    await page.getByRole('button', { name: /send magic link/i }).click();
    await expect(page.getByText(/valid email/i)).toBeVisible();
  });

  test('should accept valid email and show success message', async ({ page }) => {
    await page.getByPlaceholder(/email/i).fill('student@example.com');
    await page.getByRole('button', { name: /send magic link/i }).click();
    await expect(page.getByText(/check your email/i)).toBeVisible({ timeout: 5000 });
  });

  test('should navigate to registration page', async ({ page }) => {
    await expect(page.getByRole('link', { name: /create account/i })).toBeVisible();
    await page.getByRole('link', { name: /create account/i }).click();
    await expect(page).toHaveURL(/\/register/);
  });

  test('mobile: should display mobile-friendly login form', async ({ page }) => {
    await page.setMobile('/iPhone 12');
    await page.goto('/');
    await expect(page.getByPlaceholder(/email/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /send magic link/i })).toBeVisible();
  });
});
