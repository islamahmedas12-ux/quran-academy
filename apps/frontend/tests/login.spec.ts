import { test, expect } from '@playwright/test';

test.describe('Login Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test('should display login form', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Sign In');
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('should show validation error for invalid email', async ({ page }) => {
    await page.fill('input[type="email"]', 'invalid-email');
    await page.click('button[type="submit"]');
    await expect(page.locator('text=valid email')).toBeVisible();
  });

  test('should show error for non-existent user', async ({ page }) => {
    await page.fill('input[type="email"]', 'nonexistent@example.com');
    await page.click('button[type="submit"]');
    await expect(page.locator('text=User not found')).toBeVisible({ timeout: 10000 });
  });

  test('should navigate to magic link sent page on valid email', async ({ page }) => {
    await page.fill('input[type="email"]', 'test@example.com');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/magic-link-sent', { timeout: 10000 });
    await expect(page.locator('text=Check your email')).toBeVisible();
  });

  test('should allow resending magic link', async ({ page }) => {
    await page.goto('/magic-link-sent');
    await page.click('text=Resend magic link');
    await expect(page.locator('text=Email sent again')).toBeVisible({ timeout: 10000 });
  });
});

test.describe('Magic Link Verification', () => {
  test('should show loading state while verifying', async ({ page }) => {
    await page.goto('/verify?token=test-token');
    await expect(page.locator('text=Verifying...')).toBeVisible();
  });

  test('should redirect to dashboard on successful verification', async ({ page }) => {
    await page.goto('/verify?token=valid-test-token');
    await expect(page).toHaveURL('/dashboard', { timeout: 15000 });
  });

  test('should show error for invalid token', async ({ page }) => {
    await page.goto('/verify?token=invalid-token');
    await expect(page.locator('text=Invalid or expired')).toBeVisible({ timeout: 15000 });
    await expect(page.locator('text=Try again')).toBeVisible();
  });

  test('should show error for expired token', async ({ page }) => {
    await page.goto('/verify?token=expired-token');
    await expect(page.locator('text=Link has expired')).toBeVisible({ timeout: 15000 });
  });
});

test.describe('Logout', () => {
  test('should logout successfully', async ({ page }) => {
    await page.goto('/dashboard');
    await page.click('button:has-text("Logout")');
    await expect(page).toHaveURL('/login');
  });

  test('should clear local storage on logout', async ({ page }) => {
    await page.goto('/dashboard');
    await page.evaluate(() => localStorage.setItem('test', 'value'));
    await page.click('button:has-text("Logout")');
    const storage = await page.evaluate(() => localStorage.getItem('authToken'));
    expect(storage).toBeNull();
  });
});
