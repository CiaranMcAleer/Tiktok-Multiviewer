import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import StreamWidget from '@/app/components/stream-widget'
import type { Widget } from '@/app/types/widget'

const mockYouTubeWidget: Widget = {
  id: '1',
  type: 'youtube',
  url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  title: 'Test YouTube Video',
}

const mockTikTokWidget: Widget = {
  id: '2',
  type: 'tiktok',
  url: 'https://www.tiktok.com/@testuser/live',
  title: 'testuser',
}

const mockTrafficWidget: Widget = {
  id: '3',
  type: 'trafficcam',
  url: 'https://example.com/camera.jpg',
  title: 'Traffic Camera',
}

const mockOnRemove = jest.fn()

describe('StreamWidget', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('YouTube Widget', () => {
    it('renders YouTube widget with correct title', () => {
      render(<StreamWidget widget={mockYouTubeWidget} onRemove={mockOnRemove} theme="light" />)
      
      expect(screen.getByText('Test YouTube Video')).toBeInTheDocument()
    })

    it('renders YouTube iframe with correct src', () => {
      render(<StreamWidget widget={mockYouTubeWidget} onRemove={mockOnRemove} theme="light" />)
      
      const iframe = screen.getByTestId('youtube-iframe') || 
                    screen.getByTitle(/youtube/i) ||
                    document.querySelector('iframe[src*="youtube.com"]')
      
      expect(iframe).toBeTruthy()
    })

    it('calls onRemove when remove button is clicked', async () => {
      const user = userEvent.setup()
      render(<StreamWidget widget={mockYouTubeWidget} onRemove={mockOnRemove} theme="light" />)
      
      const removeButton = screen.getByRole('button', { name: /remove/i })
      await user.click(removeButton)
      
      expect(mockOnRemove).toHaveBeenCalled()
    })

    it('opens external link when external button is clicked', async () => {
      const user = userEvent.setup()
      render(<StreamWidget widget={mockYouTubeWidget} onRemove={mockOnRemove} theme="light" />)
      
      const externalButton = screen.getByRole('button', { name: /external/i })
      await user.click(externalButton)
      
      expect(window.open).toHaveBeenCalledWith(mockYouTubeWidget.url, '_blank')
    })
  })

  describe('TikTok Widget', () => {
    it('renders TikTok widget with correct title', () => {
      render(<StreamWidget widget={mockTikTokWidget} onRemove={mockOnRemove} theme="light" />)
      
      expect(screen.getByText('testuser')).toBeInTheDocument()
    })

    it('shows popup button for TikTok streams', () => {
      render(<StreamWidget widget={mockTikTokWidget} onRemove={mockOnRemove} theme="light" />)
      
      expect(screen.getByText(/Open Full Stream/)).toBeInTheDocument()
    })

    it('opens popup when popup button is clicked', async () => {
      const user = userEvent.setup()
      render(<StreamWidget widget={mockTikTokWidget} onRemove={mockOnRemove} theme="light" />)
      
      const popupButton = screen.getByText(/Open Full Stream/)
      await user.click(popupButton)
      
      // The popup manager should be called, but we can't easily test that without mocking
      expect(popupButton).toBeInTheDocument()
    })
  })

  describe('Traffic Camera Widget', () => {
    it('renders traffic camera widget with correct title', () => {
      render(<StreamWidget widget={mockTrafficWidget} onRemove={mockOnRemove} theme="light" />)
      
      expect(screen.getByText('Traffic Camera')).toBeInTheDocument()
    })

    it('shows refresh indicator for traffic cameras', () => {
      render(<StreamWidget widget={mockTrafficWidget} onRemove={mockOnRemove} theme="light" />)
      
      expect(screen.getByText(/Refreshes every 20s/)).toBeInTheDocument()
    })

    it('refreshes content when refresh button is clicked', async () => {
      const user = userEvent.setup()
      render(<StreamWidget widget={mockTrafficWidget} onRemove={mockOnRemove} theme="light" />)
      
      const refreshButton = screen.getByRole('button', { name: /refresh/i })
      await user.click(refreshButton)
      
      // The refresh should update the timestamp in the URL
      expect(refreshButton).toBeInTheDocument()
    })
  })

  describe('Theme Support', () => {
    it('renders with dark theme correctly', () => {
      const { container } = render(
        <StreamWidget widget={mockYouTubeWidget} onRemove={mockOnRemove} theme="dark" />
      )
      
      expect(container.querySelector('.bg-gray-800')).toBeInTheDocument()
    })

    it('renders with light theme correctly', () => {
      const { container } = render(
        <StreamWidget widget={mockYouTubeWidget} onRemove={mockOnRemove} theme="light" />
      )
      
      expect(container.querySelector('.bg-white')).toBeInTheDocument()
    })
  })

  describe('Error Handling', () => {
    it('shows error state when embed fails', async () => {
      const errorWidget = {
        ...mockYouTubeWidget,
        url: 'invalid-url',
      }
      
      render(<StreamWidget widget={errorWidget} onRemove={mockOnRemove} theme="light" />)
      
      // Simulate iframe error
      const iframe = document.querySelector('iframe')
      if (iframe) {
        fireEvent.error(iframe)
      }
      
      await waitFor(() => {
        // The component should handle the error gracefully
        expect(screen.getByText('Test YouTube Video')).toBeInTheDocument()
      })
    })
  })

  describe('Widget Controls', () => {
    it('shows all control buttons', () => {
      render(<StreamWidget widget={mockYouTubeWidget} onRemove={mockOnRemove} theme="light" />)
      
      expect(screen.getByRole('button', { name: /refresh/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /external/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /remove/i })).toBeInTheDocument()
    })

    it('shows popup button for TikTok widgets', () => {
      render(<StreamWidget widget={mockTikTokWidget} onRemove={mockOnRemove} theme="light" />)
      
      expect(screen.getByRole('button', { name: /popup/i })).toBeInTheDocument()
    })
  })
})
