import { test, expect } from '@playwright/test';

test.describe('Quran Reader', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/quran');
  });

  test('should display surah list', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Quran');
    await page.waitForSelector('[data-testid="surah-list"]', { timeout: 15000 });
    const surahs = await page.locator('[data-testid="surah-item"]').count();
    expect(surahs).toBeGreaterThan(0);
  });

  test('should show surah details when clicked', async ({ page }) => {
    await page.waitForSelector('[data-testid="surah-list"]', { timeout: 15000 });
    await page.click('[data-testid="surah-item"]:first-child');
    await expect(page.locator('[data-testid="surah-header"]')).toBeVisible();
    await expect(page.locator('[data-testid="verse-list"]')).toBeVisible();
  });

  test('should navigate between verses', async ({ page }) => {
    await page.waitForSelector('[data-testid="surah-list"]', { timeout: 15000 });
    await page.click('[data-testid="surah-item"]:first-child');
    await page.waitForSelector('[data-testid="verse-list"]', { timeout: 15000 });

    const firstVerse = page.locator('[data-testid="verse"]').first();
    await expect(firstVerse).toBeVisible();

    await page.click('[data-testid="next-verse"]');
    await expect(page.locator('[data-testid="verse"]:nth-child(2)')).toBeVisible();

    await page.click('[data-testid="prev-verse"]');
    await expect(page.locator('[data-testid="verse"]:nth-child(1)')).toBeVisible();
  });

  test('should play audio for verse', async ({ page }) => {
    await page.waitForSelector('[data-testid="surah-list"]', { timeout: 15000 });
    await page.click('[data-testid="surah-item"]:first-child');
    await page.waitForSelector('[data-testid="verse-list"]', { timeout: 15000 });

    const audioButton = page.locator('[data-testid="play-audio"]').first();
    await audioButton.click();

    await expect(page.locator('[data-testid="audio-player"]')).toBeVisible();
    await expect(page.locator('[data-testid="playing-indicator"]')).toBeVisible();
  });

  test('should pause audio playback', async ({ page }) => {
    await page.waitForSelector('[data-testid="surah-list"]', { timeout: 15000 });
    await page.click('[data-testid="surah-item"]:first-child');
    await page.waitForSelector('[data-testid="verse-list"]', { timeout: 15000 });

    await page.click('[data-testid="play-audio"]');
    await page.click('[data-testid="pause-audio"]');
    await expect(page.locator('[data-testid="playing-indicator"]')).not.toBeVisible();
  });

  test('should display verse translation', async ({ page }) => {
    await page.waitForSelector('[data-testid="surah-list"]', { timeout: 15000 });
    await page.click('[data-testid="surah-item"]:first-child');
    await page.waitForSelector('[data-testid="verse-list"]', { timeout: 15000 });

    const verse = page.locator('[data-testid="verse"]').first();
    await expect(verse.locator('[data-testid="verse-text"]')).toBeVisible();
    await expect(verse.locator('[data-testid="verse-translation"]')).toBeVisible();
  });

  test('should display verse transliteration', async ({ page }) => {
    await page.waitForSelector('[data-testid="surah-list"]', { timeout: 15000 });
    await page.click('[data-testid="surah-item"]:first-child');
    await page.waitForSelector('[data-testid="verse-list"]', { timeout: 15000 });

    const verse = page.locator('[data-testid="verse"]').first();
    await expect(verse.locator('[data-testid="verse-transliteration"]')).toBeVisible();
  });

  test('should navigate to specific verse', async ({ page }) => {
    await page.waitForSelector('[data-testid="surah-list"]', { timeout: 15000 });
    await page.click('[data-testid="surah-item"]:first-child');
    await page.waitForSelector('[data-testid="verse-list"]', { timeout: 15000 });

    await page.fill('[data-testid="verse-number-input"]', '5');
    await page.click('[data-testid="go-to-verse"]');

    await expect(page.locator('[data-testid="current-verse"]')).toContainText('5');
  });

  test('should support pagination', async ({ page }) => {
    await page.waitForSelector('[data-testid="surah-list"]', { timeout: 15000 });
    await page.click('[data-testid="surah-item"]:nth-child(2)');
    await page.waitForSelector('[data-testid="verse-list"]', { timeout: 15000 });

    const verseCount = await page.locator('[data-testid="verse"]').count();
    expect(verseCount).toBeLessThanOrEqual(50);

    await page.click('[data-testid="next-page"]');
    await expect(page.locator('[data-testid="current-page"]')).toContainText('2');
  });
});

test.describe('Surah List', () => {
  test('should filter surahs by name', async ({ page }) => {
    await page.goto('/quran');
    await page.waitForSelector('[data-testid="surah-list"]', { timeout: 15000 });

    await page.fill('[data-testid="search-input"]', 'Baqara');
    await page.waitForTimeout(500);

    const visibleSurahs = await page.locator('[data-testid="surah-item"]:visible').count();
    expect(visibleSurahs).toBeGreaterThan(0);
    await expect(page.locator('[data-testid="surah-item"]:first-child')).toContainText('Baqara');
  });

  test('should sort surahs by revelation type', async ({ page }) => {
    await page.goto('/quran');
    await page.waitForSelector('[data-testid="surah-list"]', { timeout: 15000 });

    await page.selectOption('[data-testid="sort-select"]', 'revelation-type');
    await page.waitForTimeout(500);

    const firstSurah = page.locator('[data-testid="surah-item"]:first-child');
    await expect(firstSurah.locator('[data-testid="revelation-type"]')).toContainText('Meccan');
  });

  test('should show surah count', async ({ page }) => {
    await page.goto('/quran');
    await page.waitForSelector('[data-testid="surah-list"]', { timeout: 15000 });

    await expect(page.locator('[data-testid="total-surahs"]')).toContainText('114');
  });
});
