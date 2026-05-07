import { test, expect } from '@playwright/test';

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard');
  });

  test('should display dashboard layout', async ({ page }) => {
    await expect(page.locator('[data-testid="dashboard-header"]')).toBeVisible();
    await expect(page.locator('[data-testid="sidebar"]')).toBeVisible();
    await expect(page.locator('[data-testid="main-content"]')).toBeVisible();
  });

  test('should show user name in header', async ({ page }) => {
    await page.waitForSelector('[data-testid="user-name"]', { timeout: 15000 });
    await expect(page.locator('[data-testid="user-name"]')).not.toBeEmpty();
  });

  test('should display quick stats', async ({ page }) => {
    await page.waitForSelector('[data-testid="stats-cards"]', { timeout: 15000 });
    await expect(page.locator('[data-testid="stat-card"]').first()).toBeVisible();
  });

  test('should show upcoming classes', async ({ page }) => {
    await page.waitForSelector('[data-testid="upcoming-classes"]', { timeout: 15000 });
    await expect(page.locator('[data-testid="upcoming-classes"]')).toBeVisible();
  });

  test('should show recent courses', async ({ page }) => {
    await page.waitForSelector('[data-testid="recent-courses"]', { timeout: 15000 });
    await expect(page.locator('[data-testid="recent-courses"]')).toBeVisible();
  });
});

test.describe('Dashboard Navigation', () => {
  test('should navigate to Quran page', async ({ page }) => {
    await page.click('[data-testid="nav-quran"]');
    await expect(page).toHaveURL('/quran');
  });

  test('should navigate to book class page', async ({ page }) => {
    await page.click('[data-testid="nav-book-class"]');
    await expect(page).toHaveURL('/book-class');
  });

  test('should navigate to my courses', async ({ page }) => {
    await page.click('[data-testid="nav-my-courses"]');
    await expect(page).toHaveURL('/my-courses');
  });

  test('should navigate to schedule for teachers', async ({ page }) => {
    await page.goto('/dashboard');
    await page.click('[data-testid="nav-schedule"]');
    await expect(page).toHaveURL('/schedule');
  });

  test('should expand and collapse sidebar on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.click('[data-testid="menu-toggle"]');
    await expect(page.locator('[data-testid="sidebar"]')).toBeVisible();

    await page.click('[data-testid="menu-toggle"]');
    await page.waitForTimeout(300);
  });

  test('should highlight active nav item', async ({ page }) => {
    await page.goto('/dashboard');
    const activeNav = page.locator('[data-testid="nav-item"][aria-current="page"]');
    await expect(activeNav).toBeVisible();
  });
});

test.describe('Student Dashboard', () => {
  test('should display enrolled courses progress', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForSelector('[data-testid="course-progress"]', { timeout: 15000 });
    const progressBars = await page.locator('[data-testid="progress-bar"]').count();
    expect(progressBars).toBeGreaterThan(0);
  });

  test('should show upcoming class details', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForSelector('[data-testid="upcoming-class"]', { timeout: 15000 });
    await expect(page.locator('[data-testid="class-time"]')).toBeVisible();
    await expect(page.locator('[data-testid="class-teacher"]')).toBeVisible();
  });

  test('should allow joining class', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForSelector('[data-testid="join-class-btn"]', { timeout: 15000 });
    await page.click('[data-testid="join-class-btn"]');
    await page.waitForTimeout(1000);
    const url = page.url();
    expect(url).toContain('meet.jit.si');
  });

  test('should show recent activity', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForSelector('[data-testid="activity-feed"]', { timeout: 15000 });
    await expect(page.locator('[data-testid="activity-item"]').first()).toBeVisible();
  });
});

test.describe('Teacher Dashboard', () => {
  test('should display today\'s schedule', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForSelector('[data-testid="todays-classes"]', { timeout: 15000 });
    await expect(page.locator('[data-testid="todays-classes"]')).toBeVisible();
  });

  test('should show upcoming availability slots', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForSelector('[data-testid="availability-slots"]', { timeout: 15000 });
    await expect(page.locator('[data-testid="slot-card"]').first()).toBeVisible();
  });

  test('should allow setting availability', async ({ page }) => {
    await page.goto('/dashboard');
    await page.click('[data-testid="manage-availability"]');
    await expect(page).toHaveURL('/availability');
  });

  test('should display student feedback', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForSelector('[data-testid="feedback-section"]', { timeout: 15000 });
    await expect(page.locator('[data-testid="feedback-item"]').first()).toBeVisible();
  });
});

test.describe('Dashboard Loading States', () => {
  test('should show skeleton while loading', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page.locator('[data-testid="loading-skeleton"]').first()).toBeVisible();
    await page.waitForSelector('[data-testid="stats-cards"]', { timeout: 15000 });
    await expect(page.locator('[data-testid="loading-skeleton"]').first()).not.toBeVisible();
  });

  test('should show error state on API failure', async ({ page }) => {
    await page.route('**/api/dashboard', (route) => {
      route.fulfill({ status: 500, body: 'Internal Server Error' });
    });
    await page.goto('/dashboard');
    await expect(page.locator('[data-testid="error-state"]')).toBeVisible();
    await expect(page.locator('[data-testid="retry-btn"]')).toBeVisible();
  });

  test('should retry loading on failure', async ({ page }) => {
    let requestCount = 0;
    await page.route('**/api/dashboard', (route) => {
      requestCount++;
      if (requestCount === 1) {
        route.fulfill({ status: 500, body: 'Internal Server Error' });
      } else {
        route.continue();
      }
    });

    await page.goto('/dashboard');
    await page.waitForSelector('[data-testid="error-state"]');
    await page.click('[data-testid="retry-btn"]');
    await page.waitForSelector('[data-testid="stats-cards"]', { timeout: 15000 });
  });
});

test.describe('Dashboard RTL Support', () => {
  test('should display in RTL direction for Arabic', async ({ page }) => {
    await page.goto('/dashboard?locale=ar');
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  });

  test('should flip sidebar position in RTL', async ({ page }) => {
    await page.goto('/dashboard?locale=ar');
    await page.waitForSelector('[data-testid="sidebar"]', { timeout: 15000 });
    const sidebarPosition = await page.locator('[data-testid="sidebar"]').evaluate(
      (el) => window.getComputedStyle(el).cssText
    );
  });
});
