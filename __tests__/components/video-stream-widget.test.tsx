import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import VideoStreamWidget from '@/app/components/video-stream-widget'
import type { Widget } from '@/app/types/widget'

const mockWidget: Widget = {
  id: '1',
  type: 'stream',
  url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
  title: 'Test HLS Stream',
  streamType: 'hls',
}

const mockOnRemove = jest.fn()

describe('VideoStreamWidget', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders stream widget with correct title', () => {
    render(<VideoStreamWidget widget={mockWidget} onRemove={mockOnRemove} theme="light" />)
    
    expect(screen.getByText('Test HLS Stream')).toBeInTheDocument()
    expect(screen.getByText('HLS')).toBeInTheDocument()
  })

  it('calls onRemove when remove button is clicked', async () => {
    const user = userEvent.setup()
    render(<VideoStreamWidget widget={mockWidget} onRemove={mockOnRemove} theme="light" />)
    
    const removeButton = screen.getByRole('button', { name: /remove/i })
    await user.click(removeButton)
    
    expect(mockOnRemove).toHaveBeenCalled()
  })

  it('shows refresh button and external link button', () => {
    render(<VideoStreamWidget widget={mockWidget} onRemove={mockOnRemove} theme="light" />)
    
    expect(screen.getByRole('button', { name: /refresh/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /external/i })).toBeInTheDocument()
  })

  it('opens external link when external button is clicked', async () => {
    const user = userEvent.setup()
    render(<VideoStreamWidget widget={mockWidget} onRemove={mockOnRemove} theme="light" />)
    
    const externalButton = screen.getByRole('button', { name: /external/i })
    await user.click(externalButton)
    
    expect(window.open).toHaveBeenCalledWith(mockWidget.url, '_blank')
  })

  it('renders with dark theme correctly', () => {
    const { container } = render(
      <VideoStreamWidget widget={mockWidget} onRemove={mockOnRemove} theme="dark" />
    )
    
    expect(container.querySelector('.bg-gray-800')).toBeInTheDocument()
  })

  it('handles DASH stream type', () => {
    const dashWidget = {
      ...mockWidget,
      url: 'https://example.com/stream.mpd',
      streamType: 'dash' as const,
      title: 'Test DASH Stream',
    }
    
    render(<VideoStreamWidget widget={dashWidget} onRemove={mockOnRemove} theme="light" />)
    
    expect(screen.getByText('Test DASH Stream')).toBeInTheDocument()
    expect(screen.getByText('DASH')).toBeInTheDocument()
  })

  it('handles MP4 stream type', () => {
    const mp4Widget = {
      ...mockWidget,
      url: 'https://example.com/video.mp4',
      streamType: 'mp4' as const,
      title: 'Test MP4 Stream',
    }
    
    render(<VideoStreamWidget widget={mp4Widget} onRemove={mockOnRemove} theme="light" />)
    
    expect(screen.getByText('Test MP4 Stream')).toBeInTheDocument()
    expect(screen.getByText('MP4')).toBeInTheDocument()
  })

  it('shows error state when video fails to load', async () => {
    // Mock Video.js to throw an error
    const mockVideojs = require('video.js').default
    mockVideojs.mockImplementation(() => ({
      ready: jest.fn((callback) => callback()),
      src: jest.fn(),
      dispose: jest.fn(),
      isDisposed: jest.fn(() => false),
      on: jest.fn((event, callback) => {
        if (event === 'error') {
          setTimeout(() => callback(), 100)
        }
      }),
      error: jest.fn(() => ({ code: 2 })),
    }))

    render(<VideoStreamWidget widget={mockWidget} onRemove={mockOnRemove} theme="light" />)
    
    await waitFor(() => {
      expect(screen.getByText('Failed to load stream')).toBeInTheDocument()
    }, { timeout: 2000 })
  })

  it('provides helpful error messages for different error codes', async () => {
    const mockVideojs = require('video.js').default
    mockVideojs.mockImplementation(() => ({
      ready: jest.fn((callback) => callback()),
      src: jest.fn(),
      dispose: jest.fn(),
      isDisposed: jest.fn(() => false),
      on: jest.fn((event, callback) => {
        if (event === 'error') {
          setTimeout(() => callback(), 100)
        }
      }),
      error: jest.fn(() => ({ code: 2 })), // Network error
    }))

    render(<VideoStreamWidget widget={mockWidget} onRemove={mockOnRemove} theme="light" />)
    
    await waitFor(() => {
      expect(screen.getByText(/Network error or CORS issue/)).toBeInTheDocument()
    }, { timeout: 2000 })
  })

  it('shows test streams in error state', async () => {
    const mockVideojs = require('video.js').default
    mockVideojs.mockImplementation(() => ({
      ready: jest.fn((callback) => callback()),
      src: jest.fn(),
      dispose: jest.fn(),
      isDisposed: jest.fn(() => false),
      on: jest.fn((event, callback) => {
        if (event === 'error') {
          setTimeout(() => callback(), 100)
        }
      }),
      error: jest.fn(() => ({ code: 4 })),
    }))

    render(<VideoStreamWidget widget={mockWidget} onRemove={mockOnRemove} theme="light" />)
    
    await waitFor(() => {
      expect(screen.getByText(/Test streams to try:/)).toBeInTheDocument()
      expect(screen.getByText(/test-streams.mux.dev/)).toBeInTheDocument()
    }, { timeout: 2000 })
  })
})
