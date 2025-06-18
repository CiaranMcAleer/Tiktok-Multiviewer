import { test, expect } from '@playwright/test';

test.describe('TikTok Multiviewer - Main Application', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display the main page with title and controls', async ({ page }) => {
    // Check page title
    await expect(page).toHaveTitle(/TikTok Multiviewer/);
    
    // Check main heading
    await expect(page.getByRole('heading', { name: /TikTok Multiviewer/i })).toBeVisible();
    
    // Check widget count selector
    await expect(page.getByText(/Widget Count:/)).toBeVisible();
    
    // Check theme toggle
    await expect(page.getByRole('button', { name: /toggle theme/i })).toBeVisible();
  });

  test('should change widget count', async ({ page }) => {
    // Find and click the widget count selector
    const widgetCountSelect = page.locator('select').first();
    await widgetCountSelect.selectOption('6');
    
    // Should see more widget dropdowns appear
    const widgets = page.locator('[data-testid^="widget-dropdown-"]');
    await expect(widgets).toHaveCount(6);
  });

  test('should toggle between light and dark theme', async ({ page }) => {
    // Click theme toggle
    const themeToggle = page.getByRole('button', { name: /toggle theme/i });
    await themeToggle.click();
    
    // Check if theme changed (by checking if dark class is applied to html or body)
    const html = page.locator('html');
    await expect(html).toHaveClass(/dark/);
    
    // Toggle back
    await themeToggle.click();
    await expect(html).not.toHaveClass(/dark/);
  });

  test('should add and configure widgets', async ({ page }) => {
    // Select a widget type from the first dropdown
    const firstWidgetSelect = page.locator('select[data-testid="widget-select-0"]');
    await firstWidgetSelect.selectOption('video-stream');
    
    // Check if widget content is displayed
    await expect(page.getByText(/Video Stream/)).toBeVisible();
    
    // Try to add a stream URL
    const urlInput = page.locator('input[placeholder*="stream URL"]').first();
    if (await urlInput.isVisible()) {
      await urlInput.fill('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4');
      await page.getByRole('button', { name: /add stream/i }).first().click();
    }
  });

  test('should persist widget configuration on page reload', async ({ page }) => {
    // Configure a widget
    const firstWidgetSelect = page.locator('select[data-testid="widget-select-0"]');
    await firstWidgetSelect.selectOption('notes');
    
    // Add some content to notes
    const notesTextarea = page.locator('textarea').first();
    await notesTextarea.fill('Test note content');
    await notesTextarea.blur(); // Trigger save
    
    // Reload page
    await page.reload();
    
    // Check if configuration persisted
    await expect(firstWidgetSelect).toHaveValue('notes');
    await expect(notesTextarea).toHaveValue('Test note content');
  });
});

test.describe('Widget Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should work with Notes widget', async ({ page }) => {
    // Select notes widget
    const widgetSelect = page.locator('select[data-testid="widget-select-0"]');
    await widgetSelect.selectOption('notes');
    
    // Find notes textarea
    const textarea = page.locator('textarea').first();
    await expect(textarea).toBeVisible();
    
    // Type some content
    await textarea.fill('This is a test note');
    await textarea.blur();
    
    // Content should persist
    await expect(textarea).toHaveValue('This is a test note');
  });

  test('should work with World Time widget', async ({ page }) => {
    // Select world time widget
    const widgetSelect = page.locator('select[data-testid="widget-select-0"]');
    await widgetSelect.selectOption('world-time');
    
    // Should show time zones
    await expect(page.getByText(/UTC/)).toBeVisible();
    await expect(page.getByText(/New York/)).toBeVisible();
    await expect(page.getByText(/London/)).toBeVisible();
    
    // Should show current time (check for time format)
    await expect(page.locator('text=/\\d{1,2}:\\d{2}/')).toBeVisible();
  });

  test('should work with Weather widget', async ({ page }) => {
    // Select weather widget
    const widgetSelect = page.locator('select[data-testid="widget-select-0"]');
    await widgetSelect.selectOption('weather');
    
    // Should show location selector
    await expect(page.getByText(/Select Location/)).toBeVisible();
    
    // Try to select a location
    const locationSelect = page.locator('select').last();
    await locationSelect.selectOption('New York');
    
    // Should show weather info (may take time to load)
    await expect(page.getByText(/°/)).toBeVisible({ timeout: 10000 });
  });

  test('should work with RSS widget', async ({ page }) => {
    // Select RSS widget
    const widgetSelect = page.locator('select[data-testid="widget-select-0"]');
    await widgetSelect.selectOption('rss');
    
    // Should show RSS configuration
    await expect(page.getByText(/RSS Feed/)).toBeVisible();
    
    // Should have RSS URL input
    const rssInput = page.locator('input[placeholder*="RSS"]');
    if (await rssInput.isVisible()) {
      await rssInput.fill('https://feeds.bbci.co.uk/news/rss.xml');
      // RSS feeds may not load due to CORS, but input should accept the URL
      await expect(rssInput).toHaveValue('https://feeds.bbci.co.uk/news/rss.xml');
    }
  });

  test('should work with Stream widgets', async ({ page }) => {
    // Select stream widget
    const widgetSelect = page.locator('select[data-testid="widget-select-0"]');
    await widgetSelect.selectOption('stream');
    
    // Should show stream configuration
    await expect(page.getByText(/Stream Type/)).toBeVisible();
    
    // Should have stream type selector
    const streamTypeSelect = page.locator('select').last();
    await streamTypeSelect.selectOption('youtube');
    
    // Should show YouTube-specific configuration
    await expect(page.getByText(/YouTube/)).toBeVisible();
  });
});

test.describe('Responsive Design', () => {
  test('should work on mobile devices', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    // Main elements should still be visible
    await expect(page.getByRole('heading', { name: /TikTok Multiviewer/i })).toBeVisible();
    await expect(page.getByText(/Widget Count:/)).toBeVisible();
    
    // Widget grid should adapt to mobile
    const widgets = page.locator('[data-testid^="widget-dropdown-"]');
    await expect(widgets.first()).toBeVisible();
  });

  test('should work on tablet devices', async ({ page }) => {
    // Set tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');
    
    // Check layout adapts correctly
    await expect(page.getByRole('heading', { name: /TikTok Multiviewer/i })).toBeVisible();
    
    // Should show multiple widgets in grid
    const widgetCountSelect = page.locator('select').first();
    await widgetCountSelect.selectOption('4');
    
    const widgets = page.locator('[data-testid^="widget-dropdown-"]');
    await expect(widgets).toHaveCount(4);
  });
});

test.describe('Error Handling', () => {
  test('should handle invalid stream URLs gracefully', async ({ page }) => {
    await page.goto('/');
    
    // Select video stream widget
    const widgetSelect = page.locator('select[data-testid="widget-select-0"]');
    await widgetSelect.selectOption('video-stream');
    
    // Try to add an invalid URL
    const urlInput = page.locator('input[placeholder*="stream URL"]').first();
    if (await urlInput.isVisible()) {
      await urlInput.fill('invalid-url');
      await page.getByRole('button', { name: /add stream/i }).first().click();
      
      // Should show some error indication (this depends on implementation)
      // At minimum, the invalid URL should not break the page
      await expect(page.getByRole('heading', { name: /TikTok Multiviewer/i })).toBeVisible();
    }
  });

  test('should handle network errors gracefully', async ({ page }) => {
    // Block network requests to simulate offline mode
    await page.route('**/*', route => route.abort());
    
    await page.goto('/');
    
    // Page should still load (cached resources)
    await expect(page.getByRole('heading', { name: /TikTok Multiviewer/i })).toBeVisible();
    
    // Widgets should still be configurable even if external content fails
    const widgetSelect = page.locator('select[data-testid="widget-select-0"]');
    await widgetSelect.selectOption('notes');
    
    const textarea = page.locator('textarea').first();
    await expect(textarea).toBeVisible();
  });
});
