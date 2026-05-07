import { test, expect } from '@playwright/test';

test.describe('Quran Reader - Surah List', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/quran');
  });

  test('should load surah list page successfully', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /quran/i })).toBeVisible({ timeout: 10000 });
  });

  test('should display 114 surahs in the list', async ({ page }) => {
    const surahItems = page.locator('[data-testid="surah-item"]');
    await expect(surahItems).toHaveCount(114, { timeout: 10000 });
  });

  test('should show surah names in Arabic', async ({ page }) => {
    const firstSurah = page.locator('[data-testid="surah-item"]').first();
    await expect(firstSurah).toContainText(/الفاتحة/);
  });

  test('should show verse count for each surah', async ({ page }) => {
    const firstSurah = page.locator('[data-testid="surah-item"]').first();
    await expect(firstSurah.locator('[data-testid="verse-count"]')).toContainText(/7/);
  });

  test('should navigate to surah detail when clicked', async ({ page }) => {
    const firstSurah = page.locator('[data-testid="surah-item"]').first();
    await firstSurah.click();
    await expect(page).toHaveURL(/\/quran\/1/);
  });

  test('should filter surahs by name', async ({ page }) => {
    await page.getByPlaceholder(/search surah/i).fill('yasin');
    await expect(page.locator('[data-testid="surah-item"]')).toHaveCount(1);
  });

  test('should group surahs by juz', async ({ page }) => {
    const juzHeader = page.locator('[data-testid="juz-header"]').first();
    await expect(juzHeader).toBeVisible();
  });

  test('mobile: should display surah list in single column', async ({ page }) => {
    await page.setMobile('/iPhone 12');
    await page.goto('/quran');
    await expect(page.locator('[data-testid="surah-item"]').first()).toBeVisible();
  });
});
