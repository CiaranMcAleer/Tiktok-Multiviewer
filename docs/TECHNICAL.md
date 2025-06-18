# Technical Documentation

This document provides detailed technical information about the TikTok Multiviewer project architecture, components, and implementation details.

## Project Overview

TikTok Multiviewer is a Next.js 15 application built with TypeScript, Tailwind CSS, and modern React patterns. It provides a drag-and-drop multiviewer grid system for displaying various types of content including live streams, websites, maps, and utilities in a customizable layout.

## Technology Stack

### Core Framework
- **Next.js 15**: React framework with App Router
- **React 18**: Component library with latest features
- **TypeScript**: Type-safe JavaScript development
- **Tailwind CSS**: Utility-first CSS framework

### UI Components
- **Radix UI**: Headless UI primitives
- **Lucide React**: Icon library
- **shadcn/ui**: Pre-built component library
- **React DnD**: Drag and drop functionality

### Testing & Quality
- **Jest**: Unit testing framework
- **React Testing Library**: Component testing utilities
- **Playwright**: End-to-end testing
- **Lighthouse CI**: Performance testing
- **ESLint**: Code linting
- **Prettier**: Code formatting

### Development Tools
- **pnpm**: Package manager
- **TypeScript**: Static type checking
- **PostCSS**: CSS processing
- **GitHub Actions**: CI/CD pipeline

## Project Structure

```
/
├── app/                      # Next.js App Router
│   ├── components/          # Widget components
│   ├── types/              # TypeScript type definitions
│   ├── utils/              # Utility functions
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Main application page
│   └── globals.css         # Global styles
├── components/             # Shared UI components
│   ├── ui/                # shadcn/ui components
│   └── theme-provider.tsx # Theme management
├── hooks/                  # Custom React hooks
├── lib/                   # Utility libraries
├── public/                # Static assets
├── __tests__/             # Unit and integration tests
├── tests/e2e/             # End-to-end tests
├── docs/                  # Documentation
└── Configuration files
```

## Core Components

### Main Application (`app/page.tsx`)

The main application component manages:
- Widget state and layout
- URL parsing and widget creation
- Drag and drop functionality
- Layout sharing and restoration
- Username disambiguation

Key features:
- **Widget Management**: Creates, updates, and removes widgets
- **Layout Persistence**: Saves layouts to localStorage and URL sharing
- **Input Processing**: Parses URLs and usernames to determine widget types
- **Theme Integration**: Supports dark/light theme switching

### Widget System

All widgets extend a common interface defined in `app/types/widget.ts`:

```typescript
interface Widget {
  id: string;
  type: WidgetType;
  url?: string;
  x: number;
  y: number;
  width: number;
  height: number;
  // Widget-specific properties
}
```

#### Widget Types

1. **TikTok Live Widget** (`tiktok-proxy.tsx`)
   - Opens TikTok Live streams in popup windows
   - Handles platform limitations with iframe embedding

2. **YouTube Widget** (`video-stream-widget.tsx`)
   - Embeds YouTube videos and live streams
   - Supports various YouTube URL formats

3. **Twitch Widget** (`twitch-widget.tsx`)
   - Embeds Twitch streams and channels
   - Auto-detects Twitch URLs and usernames

4. **Stream Widget** (`stream-widget.tsx`)
   - Generic streaming widget for traffic cameras
   - Auto-refresh functionality for live feeds

5. **Website Widget** (`website-widget.tsx`)
   - Generic iframe for embedding websites
   - Configurable refresh intervals

6. **World Time Widget** (`world-time-widget.tsx`)
   - Displays time for different timezones
   - Real-time clock updates

7. **Map Widget** (`map-widget.tsx`)
   - Interactive maps with location search
   - Geolocation support

8. **Notes Widget** (`notes-widget.tsx`)
   - Rich text editor for notes and markdown
   - Persistent storage

9. **Weather Widget** (`weather-widget.tsx`)
   - Weather information display
   - Location-based weather data

10. **RSS Widget** (`rss-widget.tsx`)
    - RSS feed reader
    - Configurable feed sources

### Utility Systems

#### PopupManager (`app/utils/popup-manager.ts`)

Manages popup windows for widgets that can't be embedded:
- Calculates optimal popup positioning
- Handles multiple screen configurations
- Prevents popup blocking issues

#### URL Detection and Processing

The application includes sophisticated URL and username detection:

1. **Full URLs**: Direct platform detection from domain
2. **Prefixed Usernames**: `tw:`, `yt:`, `@` prefixes for explicit service selection
3. **Ambiguous Usernames**: Interactive disambiguation with confirmation dialogs

## State Management

The application uses React's built-in state management:
- **useState**: Local component state
- **useEffect**: Side effects and lifecycle management
- **localStorage**: Persistent state storage
- **URL Parameters**: Layout sharing mechanism

## Styling System

### Tailwind CSS Configuration

The project uses a custom Tailwind configuration with:
- **Design System**: Consistent spacing, colors, and typography
- **Dark Mode**: CSS variables for theme switching
- **Responsive Design**: Mobile-first approach
- **Component Variants**: Pre-defined component styles

### Theme System

Implements a comprehensive theme system:
- **CSS Variables**: Dynamic color switching
- **Theme Provider**: React context for theme management
- **System Preference**: Automatic dark/light mode detection
- **Persistence**: User preference storage

## Testing Strategy

### Unit Testing
- **Component Testing**: React Testing Library for component behavior
- **Utility Testing**: Jest for pure function testing
- **Accessibility Testing**: ARIA compliance and screen reader support

### Integration Testing
- **Widget Integration**: Cross-widget functionality testing
- **State Management**: Complex state interactions
- **URL Processing**: Input parsing and widget creation

### End-to-End Testing
- **User Workflows**: Complete user journey testing
- **Cross-Browser**: Multiple browser compatibility
- **Visual Regression**: Screenshot comparison testing

### Performance Testing
- **Lighthouse CI**: Automated performance monitoring
- **Bundle Analysis**: JavaScript bundle optimization
- **Loading Performance**: First contentful paint and interaction metrics

## Build and Deployment

### Build Process
1. **TypeScript Compilation**: Type checking and JavaScript generation
2. **CSS Processing**: Tailwind compilation and optimization
3. **Asset Optimization**: Image and font optimization
4. **Bundle Generation**: Optimized JavaScript bundles

### CI/CD Pipeline
- **GitHub Actions**: Automated testing and deployment
- **Quality Gates**: Test coverage and performance thresholds
- **Multi-Environment**: Development, staging, and production deployments

### Deployment Targets
- **Vercel**: Primary deployment platform
- **Netlify**: Alternative deployment option
- **Self-Hosted**: Docker and static hosting support

## Performance Optimizations

### Code Splitting
- **Dynamic Imports**: Lazy loading of widget components
- **Route-Based Splitting**: Page-level code splitting
- **Vendor Splitting**: Separate vendor bundles

### Asset Optimization
- **Image Optimization**: Next.js automatic image optimization
- **Font Loading**: Optimized web font loading
- **CSS Optimization**: Critical CSS inlining

### Runtime Performance
- **React Optimization**: Memo, useMemo, and useCallback usage
- **Bundle Size**: Tree shaking and dead code elimination
- **Caching**: Aggressive caching strategies

## Security Considerations

### Content Security Policy
- **iframe Restrictions**: Controlled iframe embedding
- **Script Sources**: Restricted script execution
- **Data Validation**: Input sanitization and validation

### Privacy
- **Local Storage**: Client-side data storage only
- **No Tracking**: No analytics or user tracking
- **External Requests**: Minimal external API usage

## Browser Compatibility

### Supported Browsers
- **Chrome**: 90+
- **Firefox**: 88+
- **Safari**: 14+
- **Edge**: 90+

### Progressive Enhancement
- **Core Functionality**: Works without JavaScript
- **Enhanced Features**: JavaScript-dependent features
- **Graceful Degradation**: Fallbacks for unsupported features

## Extension and Customization

### Adding New Widgets

1. Create widget component in `app/components/`
2. Add widget type to `app/types/widget.ts`
3. Update widget factory in `app/page.tsx`
4. Add detection logic for URLs/inputs
5. Create tests in `__tests__/components/`

### Customizing Themes

1. Update CSS variables in `app/globals.css`
2. Modify Tailwind config in `tailwind.config.ts`
3. Update theme provider if needed

### Adding New Features

1. Follow existing patterns for consistency
2. Add appropriate TypeScript types
3. Include comprehensive testing
4. Update documentation

## Known Limitations

### Platform Restrictions
- **TikTok**: Cannot embed live streams directly (popup required)
- **Some Websites**: iframe restrictions prevent embedding
- **CORS**: Cross-origin restrictions for some content

### Browser Limitations
- **Popup Blockers**: May block automated popup windows
- **LocalStorage**: Limited storage capacity
- **Mobile Safari**: Some iframe limitations

## Future Improvements

### Planned Features
- **Widget Templates**: Pre-configured widget layouts
- **Advanced Sharing**: Social media integration
- **User Accounts**: Cloud-based layout storage
- **Widget Marketplace**: Community widget sharing

### Technical Debt
- **Testing Coverage**: Increase to 90%+
- **Performance**: Further bundle size optimization
- **Accessibility**: Enhanced screen reader support
- **Mobile Experience**: Improved touch interactions

## Contributing

### Development Setup
1. Clone repository
2. Install dependencies: `pnpm install`
3. Start development server: `pnpm dev`
4. Run tests: `pnpm test`

### Code Standards
- **TypeScript**: Strict mode enabled
- **ESLint**: Configured for React and TypeScript
- **Prettier**: Automatic code formatting
- **Conventional Commits**: Standardized commit messages

### Pull Request Process
1. Fork repository
2. Create feature branch
3. Implement changes with tests
4. Update documentation
5. Submit pull request

For more information, see the [Testing Documentation](./TESTING.md) and [Username Disambiguation Guide](./USERNAME_DISAMBIGUATION.md).

## Related Documentation

- **[Documentation Index](./README.md)** - Complete documentation overview and navigation
- **[Username Disambiguation](./USERNAME_DISAMBIGUATION.md)** - Input system and URL detection
- **[Testing Guide](./TESTING.md)** - Testing setup, running tests, and best practices
- **[Changelog](./CHANGELOG.md)** - Version history and recent improvements
- **[Main README](../README.md)** - Project overview and quick start guide
