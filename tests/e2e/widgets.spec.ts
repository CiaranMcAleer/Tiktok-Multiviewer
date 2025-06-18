import { test, expect } from '@playwright/test';

test.describe('Video Stream Widget E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    
    // Select video stream widget
    const widgetSelect = page.locator('select[data-testid="widget-select-0"]');
    await widgetSelect.selectOption('video-stream');
  });

  test('should add and manage video streams', async ({ page }) => {
    // Add a test stream
    const urlInput = page.locator('input[placeholder*="stream URL"]').first();
    await urlInput.fill('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4');
    await page.getByRole('button', { name: /add stream/i }).first().click();
    
    // Stream should be added to the list
    await expect(page.getByText(/BigBuckBunny/)).toBeVisible();
    
    // Should be able to play the stream
    const playButton = page.getByRole('button', { name: /play/i }).first();
    if (await playButton.isVisible()) {
      await playButton.click();
      // Video element should be present
      await expect(page.locator('video')).toBeVisible();
    }
  });

  test('should handle multiple stream formats', async ({ page }) => {
    const testStreams = [
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      'https://sample-videos.com/zip/10/mp4/mp4-1024x576.mp4',
    ];

    for (const streamUrl of testStreams) {
      const urlInput = page.locator('input[placeholder*="stream URL"]').first();
      await urlInput.fill(streamUrl);
      await page.getByRole('button', { name: /add stream/i }).first().click();
      
      // Wait a bit for the stream to be processed
      await page.waitForTimeout(1000);
    }
    
    // Should show multiple streams
    const streamItems = page.locator('[data-testid^="stream-item-"]');
    await expect(streamItems).toHaveCount(2);
  });

  test('should handle stream playback controls', async ({ page }) => {
    // Add a test stream
    const urlInput = page.locator('input[placeholder*="stream URL"]').first();
    await urlInput.fill('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4');
    await page.getByRole('button', { name: /add stream/i }).first().click();
    
    // Wait for stream to be added
    await page.waitForTimeout(2000);
    
    // Test play button
    const playButton = page.getByRole('button', { name: /play/i }).first();
    if (await playButton.isVisible()) {
      await playButton.click();
      
      // Video should start playing
      const video = page.locator('video').first();
      await expect(video).toBeVisible();
      
      // Should be able to pause
      const pauseButton = page.getByRole('button', { name: /pause/i }).first();
      if (await pauseButton.isVisible()) {
        await pauseButton.click();
      }
    }
  });

  test('should handle stream removal', async ({ page }) => {
    // Add a test stream
    const urlInput = page.locator('input[placeholder*="stream URL"]').first();
    await urlInput.fill('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4');
    await page.getByRole('button', { name: /add stream/i }).first().click();
    
    // Wait for stream to be added
    await page.waitForTimeout(1000);
    
    // Remove the stream
    const removeButton = page.getByRole('button', { name: /remove/i }).first();
    if (await removeButton.isVisible()) {
      await removeButton.click();
      
      // Stream should be removed
      await expect(page.getByText(/BigBuckBunny/)).not.toBeVisible();
    }
  });
});

test.describe('Map Widget E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    
    // Select map widget
    const widgetSelect = page.locator('select[data-testid="widget-select-0"]');
    await widgetSelect.selectOption('map');
  });

  test('should display interactive map', async ({ page }) => {
    // Map container should be visible
    await expect(page.locator('[data-testid="map-container"]')).toBeVisible();
    
    // Should show map tiles (leaflet map)
    await expect(page.locator('.leaflet-container')).toBeVisible({ timeout: 10000 });
  });

  test('should handle map interactions', async ({ page }) => {
    // Wait for map to load
    await page.waitForTimeout(3000);
    
    // Map should be interactive (test by checking for leaflet controls)
    await expect(page.locator('.leaflet-control-zoom')).toBeVisible();
    
    // Should be able to zoom in
    const zoomInButton = page.locator('.leaflet-control-zoom-in');
    if (await zoomInButton.isVisible()) {
      await zoomInButton.click();
    }
  });
});

test.describe('Weather Widget E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    
    // Select weather widget
    const widgetSelect = page.locator('select[data-testid="widget-select-0"]');
    await widgetSelect.selectOption('weather');
  });

  test('should display weather information', async ({ page }) => {
    // Select a location
    const locationSelect = page.locator('select').last();
    await locationSelect.selectOption('New York');
    
    // Weather info should load (give it time)
    await expect(page.getByText(/°/)).toBeVisible({ timeout: 15000 });
    
    // Should show weather details
    await expect(page.getByText(/New York/)).toBeVisible();
  });

  test('should handle location changes', async ({ page }) => {
    // Select first location
    const locationSelect = page.locator('select').last();
    await locationSelect.selectOption('New York');
    
    // Wait for weather to load
    await page.waitForTimeout(5000);
    
    // Change location
    await locationSelect.selectOption('London');
    
    // New weather should load
    await expect(page.getByText(/London/)).toBeVisible({ timeout: 15000 });
  });
});

test.describe('Performance and Load Testing', () => {
  test('should handle multiple widgets efficiently', async ({ page }) => {
    await page.goto('/');
    
    // Set maximum widget count
    const widgetCountSelect = page.locator('select').first();
    await widgetCountSelect.selectOption('9');
    
    // Configure multiple different widgets
    const widgetTypes = ['notes', 'world-time', 'weather', 'rss', 'stream', 'map', 'video-stream', 'website', 'tiktok-proxy'];
    
    for (let i = 0; i < 9 && i < widgetTypes.length; i++) {
      const widgetSelect = page.locator(`select[data-testid="widget-select-${i}"]`);
      await widgetSelect.selectOption(widgetTypes[i]);
      await page.waitForTimeout(500); // Small delay between widget additions
    }
    
    // Page should remain responsive
    await expect(page.getByRole('heading', { name: /TikTok Multiviewer/i })).toBeVisible();
    
    // All widgets should be visible
    const widgets = page.locator('[data-testid^="widget-dropdown-"]');
    await expect(widgets).toHaveCount(9);
  });

  test('should maintain performance with long-running session', async ({ page }) => {
    await page.goto('/');
    
    // Add some widgets
    const widgetSelect1 = page.locator('select[data-testid="widget-select-0"]');
    await widgetSelect1.selectOption('notes');
    
    const widgetSelect2 = page.locator('select[data-testid="widget-select-1"]');
    await widgetSelect2.selectOption('world-time');
    
    // Simulate user activity over time
    for (let i = 0; i < 5; i++) {
      // Add content to notes
      const textarea = page.locator('textarea').first();
      await textarea.fill(`Test note ${i} - ${new Date().toISOString()}`);
      await textarea.blur();
      
      // Wait and check page is still responsive
      await page.waitForTimeout(2000);
      await expect(page.getByRole('heading', { name: /TikTok Multiviewer/i })).toBeVisible();
    }
    
    // Page should still be responsive after extended use
    await expect(page.getByRole('button', { name: /toggle theme/i })).toBeVisible();
  });
});
