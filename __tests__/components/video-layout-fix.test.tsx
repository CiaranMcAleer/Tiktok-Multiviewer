/**
 * Test for video player layout fix
 * This test ensures the video player properly respects container boundaries
 */

import { render } from '@testing-library/react'
import VideoStreamWidget from '@/app/components/video-stream-widget'
import type { Widget } from '@/app/types/widget'

// Mock Video.js
jest.mock('video.js', () => {
  const mockPlayer = {
    ready: jest.fn((callback) => callback()),
    src: jest.fn(),
    dispose: jest.fn(),
    isDisposed: jest.fn(() => false),
    on: jest.fn(),
    error: jest.fn(),
  }
  
  const mockVideojs = jest.fn(() => mockPlayer)
  mockVideojs.browser = {
    IS_SAFARI: false,
  }
  
  return {
    __esModule: true,
    default: mockVideojs,
  }
})

// Mock DASH.js
jest.mock('dashjs', () => ({
  __esModule: true,
  default: {
    MediaPlayer: jest.fn(() => ({
      create: jest.fn(() => ({
        initialize: jest.fn(),
        on: jest.fn(),
        destroy: jest.fn(),
      })),
      events: {
        ERROR: 'error',
        STREAM_INITIALIZED: 'initialized',
      },
    })),
  },
}))

const mockWidget: Widget = {
  id: 'test-video',
  type: 'stream',
  url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
  title: 'Test HLS Stream',
  streamType: 'hls',
}

describe('VideoStreamWidget Layout Fix', () => {
  it('should configure Video.js with fluid: false to prevent overflow', () => {
    const videojs = require('video.js').default
    
    render(<VideoStreamWidget widget={mockWidget} onRemove={jest.fn()} theme="light" />)
    
    // Verify Video.js was called with fluid: false
    expect(videojs).toHaveBeenCalledWith(
      expect.any(Object),
      expect.objectContaining({
        fluid: false,
        responsive: true,
      }),
      expect.any(Function)
    )
  })

  it('should apply proper container constraints', () => {
    const { container } = render(
      <VideoStreamWidget widget={mockWidget} onRemove={jest.fn()} theme="light" />
    )
    
    // Find the video container div - it should be the one with overflow-hidden class
    const videoContainer = container.querySelector('.overflow-hidden')
    expect(videoContainer).toBeTruthy()
    
    // Check for the style attribute containing max-height (React formats camelCase to kebab-case)
    const hasMaxHeight = videoContainer?.getAttribute('style')?.includes('max-height: 320px')
    expect(hasMaxHeight).toBeTruthy()
  })

  it('should render within fixed widget height', () => {
    const { container } = render(
      <VideoStreamWidget widget={mockWidget} onRemove={jest.fn()} theme="light" />
    )
    
    // Verify the main widget card has fixed height
    const cardElement = container.querySelector('.h-96')
    expect(cardElement).toBeTruthy()
    
    // Verify content area has constrained height
    const contentElement = container.querySelector('.h-80')
    expect(contentElement).toBeTruthy()
  })

  it('should handle all stream types with consistent constraints', () => {
    const streamTypes = ['hls', 'dash', 'mp4'] as const
    
    streamTypes.forEach(streamType => {
      const widget = { ...mockWidget, streamType }
      const { container } = render(
        <VideoStreamWidget widget={widget} onRemove={jest.fn()} theme="light" />
      )
      
      // Each stream type should have overflow-hidden class
      const constrainedElement = container.querySelector('.overflow-hidden')
      expect(constrainedElement).toBeTruthy()
    })
  })

  it('should maintain responsive behavior within bounds', () => {
    const videojs = require('video.js').default
    
    render(<VideoStreamWidget widget={mockWidget} onRemove={jest.fn()} theme="light" />)
    
    // Verify responsive is still enabled but fluid is disabled
    expect(videojs).toHaveBeenCalledWith(
      expect.any(Object),
      expect.objectContaining({
        responsive: true,
        fluid: false,
      }),
      expect.any(Function)
    )
  })
})