# Testing Documentation

This document provides comprehensive information about the testing system implemented for the TikTok Multiviewer application.

## Testing Stack

- **Unit & Integration Tests**: Jest + React Testing Library
- **End-to-End Tests**: Playwright
- **Visual Regression Tests**: Playwright with screenshot comparison
- **Performance Tests**: Lighthouse CI
- **Code Coverage**: Jest coverage reports

## Test Structure

```
__tests__/                     # Unit and integration tests
├── components/               # Component tests
│   ├── video-stream-widget.test.tsx
│   ├── stream-widget.test.tsx
│   ├── map-widget.test.tsx
│   ├── world-time-widget.test.tsx
│   └── notes-widget.test.tsx
├── integration/              # Integration tests
│   └── multiviewer.test.tsx
└── utils/                    # Utility tests
    └── popup-manager.test.ts

tests/e2e/                    # End-to-end tests
├── multiviewer.spec.ts       # Main app E2E tests
├── widgets.spec.ts           # Widget-specific E2E tests
└── visual.spec.ts            # Visual regression tests
```

## Running Tests

### Local Development

```bash
# Install dependencies (including Playwright browsers)
npm ci
npm run playwright:install

# Run all tests
npm run test:all

# Run unit tests only
npm test

# Run unit tests in watch mode
npm run test:watch

# Run unit tests with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e

# Run E2E tests with UI
npm run test:e2e:ui

# Run E2E tests in headed mode (visible browser)
npm run test:e2e:headed

# Run visual regression tests only
npm run test:visual
```

### CI/CD Pipeline

The GitHub Actions workflow (`.github/workflows/ci.yml`) runs automatically on:
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop` branches

The CI pipeline includes:
1. **Unit & Integration Tests** (Node.js 18.x and 20.x)
2. **Build Test**
3. **E2E Tests** (Chromium, Firefox, WebKit)
4. **Visual Regression Tests**
5. **Security & Quality Checks**
6. **Performance Tests** (Lighthouse CI)

## Test Coverage

### Unit & Integration Tests Cover:

1. **PopupManager Utility** (`__tests__/utils/popup-manager.test.ts`)
   - Window management
   - Position calculations
   - Event handling

2. **VideoStreamWidget** (`__tests__/components/video-stream-widget.test.tsx`)
   - Stream URL management
   - Video player initialization
   - Error handling
   - Stream removal

3. **StreamWidget** (`__tests__/components/stream-widget.test.tsx`)
   - YouTube, TikTok, TrafficCam streams
   - Stream type switching
   - Configuration persistence

4. **MapWidget** (`__tests__/components/map-widget.test.tsx`)
   - Map initialization
   - Leaflet integration
   - Error handling

5. **WorldTimeWidget** (`__tests__/components/world-time-widget.test.tsx`)
   - Time zone display
   - Real-time updates
   - Time formatting

6. **NotesWidget** (`__tests__/components/notes-widget.test.tsx`)
   - Text editing
   - Auto-save functionality
   - Persistence

7. **Main Application Integration** (`__tests__/integration/multiviewer.test.tsx`)
   - Widget management
   - Theme switching
   - Layout persistence
   - Error boundaries

### E2E Tests Cover:

1. **Main Application Flow** (`tests/e2e/multiviewer.spec.ts`)
   - Page load and basic UI
   - Widget count management
   - Theme toggling
   - Widget configuration
   - Persistence across reloads
   - Responsive design
   - Error handling

2. **Widget Functionality** (`tests/e2e/widgets.spec.ts`)
   - Video stream playback
   - Map interactions
   - Weather data loading
   - Performance with multiple widgets
   - Long-running sessions

3. **Visual Regression** (`tests/e2e/visual.spec.ts`)
   - Homepage appearance
   - Dark/light mode consistency
   - Widget layouts
   - Mobile/tablet layouts
   - Cross-browser consistency
   - Error state appearance

## Test Configuration

### Jest Configuration (`jest.config.js`)

- **Environment**: jsdom for DOM testing
- **Setup Files**: `jest.setup.js` with comprehensive mocks
- **Test Patterns**: `__tests__/**/*.test.{ts,tsx}`
- **Coverage**: All source files in `app/` directory
- **Transforms**: TypeScript and JSX support

### Jest Setup (`jest.setup.js`)

Includes mocks for:
- Browser APIs (localStorage, sessionStorage, matchMedia)
- Third-party libraries (video.js, dash.js, leaflet)
- Next.js components and hooks
- Fetch API

### Playwright Configuration (`playwright.config.ts`)

- **Browsers**: Chromium, Firefox, WebKit, Mobile Chrome, Mobile Safari
- **Base URL**: http://localhost:3000
- **Test Directory**: `./tests/e2e`
- **Reporters**: HTML, JSON, JUnit
- **Screenshots**: On failure
- **Videos**: On failure
- **Traces**: On retry

## Test Data and Mocking

### Mock Data

All tests use mock data to ensure consistency and reliability:
- Weather API responses
- RSS feed data
- Video stream metadata
- Time zone information

### Test Streams

For video testing, we use publicly available test streams:
- Big Buck Bunny (MP4)
- Sample video files with CORS headers
- HLS and DASH test streams

### Environment Variables

Tests can be configured using environment variables:
- `CI=true`: Enables CI-specific optimizations
- Test-specific API endpoints for external services

## Coverage Reporting

Coverage reports are generated for:
- **Lines**: Statement coverage
- **Functions**: Function coverage
- **Branches**: Branch coverage
- **Statements**: Statement coverage

Coverage thresholds:
- Global: 80% minimum
- Per file: 70% minimum
- Functions: 80% minimum
- Branches: 75% minimum

## Performance Testing

Lighthouse CI tests:
- **Performance**: Minimum score 80%
- **Accessibility**: Minimum score 90%
- **Best Practices**: Minimum score 80%
- **SEO**: Minimum score 80%

## Visual Regression Testing

Visual tests capture screenshots and compare them to baseline images:
- **Threshold**: 30% tolerance for minor differences
- **Cross-browser**: Tests consistency across browsers
- **Responsive**: Tests mobile and tablet layouts
- **Themes**: Tests light and dark mode appearances

## Debugging Tests

### Unit Tests

```bash
# Run specific test file
npm test -- video-stream-widget.test.tsx

# Run tests matching pattern
npm test -- --testNamePattern="should handle stream"

# Debug mode
npm test -- --detectOpenHandles --forceExit
```

### E2E Tests

```bash
# Run specific test file
npx playwright test multiviewer.spec.ts

# Debug mode with browser UI
npx playwright test --debug

# Run with headed browser
npx playwright test --headed

# Generate test report
npx playwright show-report
```

### Visual Tests

```bash
# Update visual baselines
npx playwright test --update-snapshots

# Run visual tests only
npm run test:visual
```

## Continuous Integration

The CI pipeline provides:
- **Parallel Testing**: Multiple browsers and Node.js versions
- **Artifact Storage**: Test results, screenshots, videos
- **Coverage Reporting**: Integration with Codecov
- **Performance Monitoring**: Lighthouse CI results
- **Security Scanning**: npm audit checks

## Best Practices

1. **Test Isolation**: Each test is independent and can run in any order
2. **Mock External Dependencies**: All external APIs and services are mocked
3. **Realistic Test Data**: Use data that reflects real-world scenarios
4. **Comprehensive Coverage**: Test both happy paths and error conditions
5. **Performance Awareness**: Tests are optimized for CI environments
6. **Documentation**: All test files include clear descriptions
7. **Maintainability**: Tests are structured for easy updates and debugging

## Troubleshooting

### Common Issues

1. **Playwright Browser Installation**
   ```bash
   npx playwright install --with-deps
   ```

2. **Port Conflicts**
   - Ensure port 3000 is available for test server
   - Check for running development servers

3. **Visual Test Failures**
   - Update snapshots after intentional UI changes
   - Check for timing issues in dynamic content

4. **CI Failures**
   - Check GitHub Actions logs for specific error messages
   - Verify all required secrets are configured

### Getting Help

- Check test output for specific error messages
- Review Playwright test reports in browser
- Examine coverage reports for missed test cases
- Use debug mode for step-by-step test execution

## Related Documentation

- **[Technical Documentation](./TECHNICAL.md)** - Project architecture and implementation details
- **[Username Disambiguation](./USERNAME_DISAMBIGUATION.md)** - Input system documentation
- **[README](../README.md)** - Project overview and quick start guide

---

For more technical details about the project structure and components, see the [Technical Documentation](./TECHNICAL.md).
