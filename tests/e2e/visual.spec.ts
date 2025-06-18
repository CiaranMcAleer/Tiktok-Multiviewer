import { test, expect } from '@playwright/test';

test.describe('Visual Regression Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should match homepage screenshot', async ({ page }) => {
    // Wait for page to fully load
    await page.waitForLoadState('networkidle');
    
    // Take screenshot of the entire page
    await expect(page).toHaveScreenshot('homepage.png', {
      fullPage: true,
      threshold: 0.3, // Allow for minor differences
    });
  });

  test('should match homepage in dark mode', async ({ page }) => {
    // Switch to dark mode
    const themeToggle = page.getByRole('button', { name: /toggle theme/i });
    await themeToggle.click();
    
    // Wait for theme transition
    await page.waitForTimeout(1000);
    
    // Take screenshot
    await expect(page).toHaveScreenshot('homepage-dark.png', {
      fullPage: true,
      threshold: 0.3,
    });
  });

  test('should match widget configuration layout', async ({ page }) => {
    // Set widget count to 6
    const widgetCountSelect = page.locator('select').first();
    await widgetCountSelect.selectOption('6');
    
    // Configure different widgets
    const widgetTypes = ['notes', 'world-time', 'weather', 'stream', 'map', 'video-stream'];
    
    for (let i = 0; i < 6; i++) {
      const widgetSelect = page.locator(`select[data-testid="widget-select-${i}"]`);
      await widgetSelect.selectOption(widgetTypes[i]);
      await page.waitForTimeout(500);
    }
    
    // Wait for all widgets to load
    await page.waitForTimeout(3000);
    
    // Take screenshot
    await expect(page).toHaveScreenshot('widgets-configured.png', {
      fullPage: true,
      threshold: 0.3,
    });
  });

  test('should match notes widget appearance', async ({ page }) => {
    // Configure notes widget
    const widgetSelect = page.locator('select[data-testid="widget-select-0"]');
    await widgetSelect.selectOption('notes');
    
    // Add content
    const textarea = page.locator('textarea').first();
    await textarea.fill('This is a sample note for visual testing.\n\nIt contains multiple lines and demonstrates the notes widget appearance.');
    await textarea.blur();
    
    // Screenshot just the widget area
    const widgetContainer = page.locator('[data-testid="widget-container-0"]').first();
    await expect(widgetContainer).toHaveScreenshot('notes-widget.png', {
      threshold: 0.3,
    });
  });

  test('should match world time widget appearance', async ({ page }) => {
    // Configure world time widget
    const widgetSelect = page.locator('select[data-testid="widget-select-0"]');
    await widgetSelect.selectOption('world-time');
    
    // Wait for time to update
    await page.waitForTimeout(2000);
    
    // Screenshot the widget (mask time values to avoid constant changes)
    const widgetContainer = page.locator('[data-testid="widget-container-0"]').first();
    await expect(widgetContainer).toHaveScreenshot('world-time-widget.png', {
      threshold: 0.3,
      mask: [page.locator('text=/\\d{1,2}:\\d{2}/')], // Mask actual time values
    });
  });

  test('should match mobile layout', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Reload page for mobile layout
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Configure a widget for mobile testing
    const widgetSelect = page.locator('select[data-testid="widget-select-0"]');
    await widgetSelect.selectOption('notes');
    
    // Take mobile screenshot
    await expect(page).toHaveScreenshot('homepage-mobile.png', {
      fullPage: true,
      threshold: 0.3,
    });
  });

  test('should match tablet layout', async ({ page }) => {
    // Set tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    
    // Reload page for tablet layout
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Set widget count appropriate for tablet
    const widgetCountSelect = page.locator('select').first();
    await widgetCountSelect.selectOption('4');
    
    // Configure widgets
    const widgetTypes = ['notes', 'world-time', 'weather', 'stream'];
    for (let i = 0; i < 4; i++) {
      const widgetSelect = page.locator(`select[data-testid="widget-select-${i}"]`);
      await widgetSelect.selectOption(widgetTypes[i]);
      await page.waitForTimeout(300);
    }
    
    // Take tablet screenshot
    await expect(page).toHaveScreenshot('homepage-tablet.png', {
      fullPage: true,
      threshold: 0.3,
    });
  });

  test('should match error states', async ({ page }) => {
    // Block network to simulate errors
    await page.route('**/api/**', route => route.abort());
    
    // Configure weather widget (should show error)
    const widgetSelect = page.locator('select[data-testid="widget-select-0"]');
    await widgetSelect.selectOption('weather');
    
    // Wait for error state
    await page.waitForTimeout(3000);
    
    // Screenshot error state
    const widgetContainer = page.locator('[data-testid="widget-container-0"]').first();
    await expect(widgetContainer).toHaveScreenshot('widget-error-state.png', {
      threshold: 0.3,
    });
  });
});

test.describe('Cross-browser Visual Tests', () => {
  test('should look consistent across browsers', async ({ page, browserName }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Configure some widgets
    const widgetCountSelect = page.locator('select').first();
    await widgetCountSelect.selectOption('3');
    
    const widgetTypes = ['notes', 'world-time', 'weather'];
    for (let i = 0; i < 3; i++) {
      const widgetSelect = page.locator(`select[data-testid="widget-select-${i}"]`);
      await widgetSelect.selectOption(widgetTypes[i]);
      await page.waitForTimeout(300);
    }
    
    // Add content to notes
    const textarea = page.locator('textarea').first();
    await textarea.fill('Cross-browser test content');
    await textarea.blur();
    
    // Wait for everything to settle
    await page.waitForTimeout(2000);
    
    // Take browser-specific screenshot
    await expect(page).toHaveScreenshot(`homepage-${browserName}.png`, {
      fullPage: true,
      threshold: 0.4, // More lenient for cross-browser differences
    });
  });
});
