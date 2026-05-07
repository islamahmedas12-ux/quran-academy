import { test, expect } from '@playwright/test';

test.describe('Class Booking Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/book-class');
  });

  test('should display teacher selection step', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Book a Class');
    await expect(page.locator('[data-testid="teacher-list"]')).toBeVisible();
    await expect(page.locator('[data-testid="step-indicator"]')).toContainText('1');
  });

  test('should show teacher details on hover', async ({ page }) => {
    await page.waitForSelector('[data-testid="teacher-card"]', { timeout: 15000 });
    const teacherCard = page.locator('[data-testid="teacher-card"]').first();
    await teacherCard.hover();
    await expect(page.locator('[data-testid="teacher-tooltip"]')).toBeVisible();
  });

  test('should select a teacher', async ({ page }) => {
    await page.waitForSelector('[data-testid="teacher-card"]', { timeout: 15000 });
    await page.click('[data-testid="teacher-card"]:first-child');
    await expect(page.locator('[data-testid="selected-teacher"]')).toBeVisible();
    await expect(page.locator('[data-testid="step-indicator"]')).toContainText('2');
  });

  test('should filter teachers by availability', async ({ page }) => {
    await page.waitForSelector('[data-testid="teacher-list"]', { timeout: 15000 });
    await page.selectOption('[data-testid="availability-filter"]', 'weekend');
    await page.waitForTimeout(500);
    const teachers = await page.locator('[data-testid="teacher-card"]').count();
    expect(teachers).toBeGreaterThan(0);
  });

  test('should search teachers by name', async ({ page }) => {
    await page.waitForSelector('[data-testid="teacher-list"]', { timeout: 15000 });
    await page.fill('[data-testid="teacher-search"]', 'Ahmed');
    await page.waitForTimeout(500);
    const visibleTeachers = await page.locator('[data-testid="teacher-card"]:visible').count();
    expect(visibleTeachers).toBeGreaterThan(0);
  });
});

test.describe('Time Slot Selection', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/book-class');
    await page.waitForSelector('[data-testid="teacher-card"]', { timeout: 15000 });
    await page.click('[data-testid="teacher-card"]:first-child');
    await page.waitForSelector('[data-testid="time-slot-picker"]', { timeout: 15000 });
  });

  test('should display calendar with available slots', async ({ page }) => {
    await expect(page.locator('[data-testid="calendar"]')).toBeVisible();
    await expect(page.locator('[data-testid="available-slot"]').first()).toBeVisible();
  });

  test('should select a time slot', async ({ page }) => {
    await page.click('[data-testid="available-slot"]:first-child');
    await expect(page.locator('[data-testid="selected-slot"]')).toBeVisible();
    await expect(page.locator('[data-testid="step-indicator"]')).toContainText('3');
  });

  test('should show slot details on selection', async ({ page }) => {
    await page.click('[data-testid="available-slot"]:first-child');
    await expect(page.locator('[data-testid="slot-details"]')).toContainText('Duration');
    await expect(page.locator('[data-testid="slot-details"]')).toContainText('Price');
  });

  test('should navigate between weeks', async ({ page }) => {
    const nextWeekButton = page.locator('[data-testid="next-week"]');
    if (await nextWeekButton.isVisible()) {
      const initialSlots = await page.locator('[data-testid="available-slot"]').count();
      await nextWeekButton.click();
      await page.waitForTimeout(500);
      const nextSlots = await page.locator('[data-testid="available-slot"]').count();
      expect(nextSlots).toBeGreaterThan(0);
    }
  });

  test('should disable past dates', async ({ page }) => {
    const pastDate = page.locator('[data-testid="past-date"]');
    if (await pastDate.isVisible()) {
      await expect(pastDate).toBeDisabled();
    }
  });

  test('should show timezone indicator', async ({ page }) => {
    await expect(page.locator('[data-testid="timezone"]')).toContainText('UTC');
  });
});

test.describe('Booking Confirmation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/book-class');
    await page.waitForSelector('[data-testid="teacher-card"]', { timeout: 15000 });
    await page.click('[data-testid="teacher-card"]:first-child');
    await page.waitForSelector('[data-testid="time-slot-picker"]', { timeout: 15000 });
    await page.click('[data-testid="available-slot"]:first-child');
    await page.waitForSelector('[data-testid="confirmation-step"]', { timeout: 15000 });
  });

  test('should display booking summary', async ({ page }) => {
    await expect(page.locator('[data-testid="booking-summary"]')).toBeVisible();
    await expect(page.locator('[data-testid="summary-teacher"]')).toBeVisible();
    await expect(page.locator('[data-testid="summary-date"]')).toBeVisible();
    await expect(page.locator('[data-testid="summary-time"]')).toBeVisible();
  });

  test('should allow adding topic', async ({ page }) => {
    await page.fill('[data-testid="topic-input"]', 'Quran Reading Practice');
    await expect(page.locator('[data-testid="topic-preview"]')).toContainText('Quran Reading Practice');
  });

  test('should confirm booking', async ({ page }) => {
    await page.click('[data-testid="confirm-booking"]');
    await expect(page.locator('[data-testid="booking-success"]')).toBeVisible({ timeout: 15000 });
    await expect(page.locator('[data-testid="jitsi-link"]')).toBeVisible();
  });

  test('should show Jitsi room link after booking', async ({ page }) => {
    await page.click('[data-testid="confirm-booking"]');
    await page.waitForSelector('[data-testid="jitsi-link"]', { timeout: 15000 });
    const jitsiLink = await page.locator('[data-testid="jitsi-link"]').getAttribute('href');
    expect(jitsiLink).toContain('meet.jit.si');
  });

  test('should add to upcoming classes after booking', async ({ page }) => {
    await page.click('[data-testid="confirm-booking"]');
    await page.waitForSelector('[data-testid="booking-success"]', { timeout: 15000 });
    await page.click('[data-testid="view-schedule"]');
    await expect(page).toHaveURL('/dashboard', { timeout: 10000 });
  });

  test('should cancel booking from confirmation', async ({ page }) => {
    await page.click('[data-testid="cancel-booking"]');
    await expect(page.locator('[data-testid="step-indicator"]')).toContainText('1');
  });
});

test.describe('Booking Error States', () => {
  test('should show error for unavailable slot', async ({ page }) => {
    await page.goto('/book-class');
    await page.waitForSelector('[data-testid="teacher-card"]', { timeout: 15000 });
    await page.click('[data-testid="teacher-card"]:first-child');
    await page.waitForSelector('[data-testid="time-slot-picker"]', { timeout: 15000 });

    await page.evaluate(() => {
      jest.spyOn(fetch, 'fetch').mockRejectedValue(new Error('Slot no longer available'));
    });

    await page.click('[data-testid="available-slot"]:first-child');
    await page.click('[data-testid="confirm-booking"]');
    await expect(page.locator('[data-testid="error-message"]')).toContainText('Slot no longer available');
  });

  test('should retry booking on failure', async ({ page }) => {
    await page.goto('/book-class');
    await page.waitForSelector('[data-testid="teacher-card"]', { timeout: 15000 });
    await page.click('[data-testid="teacher-card"]:first-child');
    await page.waitForSelector('[data-testid="time-slot-picker"]', { timeout: 15000 });
    await page.click('[data-testid="available-slot"]:first-child');
    await page.click('[data-testid="confirm-booking"]');

    await page.click('[data-testid="retry-booking"]');
    await page.waitForSelector('[data-testid="loading"]', { timeout: 15000 });
    await expect(page.locator('[data-testid="booking-success"]')).toBeVisible({ timeout: 30000 });
  });
});
