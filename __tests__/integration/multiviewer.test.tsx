import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import MultiviewerApp from '@/app/page'

// Mock next/dynamic
jest.mock('next/dynamic', () => () => {
  const DynamicComponent = () => null
  DynamicComponent.displayName = 'LoadableComponent'
  DynamicComponent.preload = jest.fn()
  return DynamicComponent
})

describe('MultiviewerApp Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    localStorage.clear()
    
    // Mock successful API responses
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        items: [{
          snippet: {
            title: 'Test Video',
            channelTitle: 'Test Channel',
            thumbnails: {
              medium: { url: 'https://example.com/thumb.jpg' }
            }
          }
        }]
      })
    })
  })

  describe('Initial State', () => {
    it('renders main application title', () => {
      render(<MultiviewerApp />)
      
      expect(screen.getByText('Multiviewer')).toBeInTheDocument()
    })

    it('shows empty state when no widgets are present', () => {
      render(<MultiviewerApp />)
      
      expect(screen.getByText(/No content added yet/)).toBeInTheDocument()
      expect(screen.getByText(/Add TikTok, YouTube/)).toBeInTheDocument()
    })

    it('shows widget counter as 0/10', () => {
      render(<MultiviewerApp />)
      
      expect(screen.getByText('0/10 widgets')).toBeInTheDocument()
    })

    it('renders theme toggle button', () => {
      render(<MultiviewerApp />)
      
      expect(screen.getByRole('button', { name: /theme/i })).toBeInTheDocument()
    })
  })

  describe('Widget Management', () => {
    it('adds YouTube widget successfully', async () => {
      const user = userEvent.setup()
      render(<MultiviewerApp />)

      // Enter YouTube URL
      const urlInput = screen.getByPlaceholderText(/Enter URL/)
      await user.type(urlInput, 'https://www.youtube.com/watch?v=dQw4w9WgXcQ')

      // Add the widget
      const addButton = screen.getByText('Add Stream')
      await user.click(addButton)

      // Wait for widget to appear
      await waitFor(() => {
        expect(screen.getByText(/YouTube Video/)).toBeInTheDocument()
      })

      // Check widget counter
      expect(screen.getByText('1/10 widgets')).toBeInTheDocument()
    })

    it('adds TikTok widget successfully', async () => {
      const user = userEvent.setup()
      render(<MultiviewerApp />)

      const urlInput = screen.getByPlaceholderText(/Enter URL/)
      await user.type(urlInput, 'https://www.tiktok.com/@testuser')

      const addButton = screen.getByText('Add Stream')
      await user.click(addButton)

      await waitFor(() => {
        expect(screen.getByText('testuser')).toBeInTheDocument()
      })
    })

    it('adds HLS stream widget successfully', async () => {
      const user = userEvent.setup()
      render(<MultiviewerApp />)

      const urlInput = screen.getByPlaceholderText(/Enter URL/)
      await user.type(urlInput, 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8')

      const addButton = screen.getByText('Add Stream')
      await user.click(addButton)

      await waitFor(() => {
        expect(screen.getByText('HLS Stream')).toBeInTheDocument()
      })
    })

    it('removes widget successfully', async () => {
      const user = userEvent.setup()
      render(<MultiviewerApp />)

      // Add a widget first
      const urlInput = screen.getByPlaceholderText(/Enter URL/)
      await user.type(urlInput, 'https://www.youtube.com/watch?v=dQw4w9WgXcQ')
      
      const addButton = screen.getByText('Add Stream')
      await user.click(addButton)

      await waitFor(() => {
        expect(screen.getByText(/YouTube Video/)).toBeInTheDocument()
      })

      // Remove the widget
      const removeButton = screen.getByRole('button', { name: /remove/i })
      await user.click(removeButton)

      await waitFor(() => {
        expect(screen.queryByText(/YouTube Video/)).not.toBeInTheDocument()
      })

      expect(screen.getByText('0/10 widgets')).toBeInTheDocument()
    })

    it('prevents adding more than 10 widgets', async () => {
      const user = userEvent.setup()
      render(<MultiviewerApp />)

      // Add 10 widgets
      for (let i = 0; i < 10; i++) {
        const urlInput = screen.getByPlaceholderText(/Enter URL/)
        await user.clear(urlInput)
        await user.type(urlInput, `https://www.youtube.com/watch?v=test${i}`)
        
        const addButton = screen.getByText('Add Stream')
        await user.click(addButton)
      }

      await waitFor(() => {
        expect(screen.getByText('10/10 widgets')).toBeInTheDocument()
      })

      // Try to add 11th widget
      const urlInput = screen.getByPlaceholderText(/Enter URL/)
      await user.clear(urlInput)
      await user.type(urlInput, 'https://www.youtube.com/watch?v=test11')
      
      const addButton = screen.getByText('Add Stream')
      expect(addButton).toBeDisabled()
    })
  })

  describe('Dropdown Menu Widgets', () => {
    it('adds world time widget from dropdown', async () => {
      const user = userEvent.setup()
      render(<MultiviewerApp />)

      const dropdownButton = screen.getByRole('button', { name: /add widget/i })
      await user.click(dropdownButton)

      const worldTimeOption = screen.getByText('World Time')
      await user.click(worldTimeOption)

      await waitFor(() => {
        expect(screen.getByText(/Belfast Time/)).toBeInTheDocument()
      })
    })

    it('adds website widget from dropdown', async () => {
      const user = userEvent.setup()
      render(<MultiviewerApp />)

      const dropdownButton = screen.getByRole('button', { name: /add widget/i })
      await user.click(dropdownButton)

      const websiteOption = screen.getByText('Website Embed')
      await user.click(websiteOption)

      // Should open website dialog
      expect(screen.getByText('Add Website Embed')).toBeInTheDocument()

      // Enter website URL
      const websiteInput = screen.getByPlaceholderText('https://example.com')
      await user.type(websiteInput, 'https://example.com')

      const addWebsiteButton = screen.getByText('Add Website')
      await user.click(addWebsiteButton)

      await waitFor(() => {
        expect(screen.getByText('example.com')).toBeInTheDocument()
      })
    })

    it('adds notes widget from dropdown', async () => {
      const user = userEvent.setup()
      render(<MultiviewerApp />)

      const dropdownButton = screen.getByRole('button', { name: /add widget/i })
      await user.click(dropdownButton)

      const notesOption = screen.getByText('Notes')
      await user.click(notesOption)

      // Should open notes dialog
      expect(screen.getByText('Add Notes Widget')).toBeInTheDocument()

      const addNotesButton = screen.getByText('Add Notes')
      await user.click(addNotesButton)

      await waitFor(() => {
        expect(screen.getByText('Notes')).toBeInTheDocument()
      })
    })

    it('adds map widget', async () => {
      const user = userEvent.setup()
      render(<MultiviewerApp />)

      const mapButton = screen.getByText('Add Map')
      await user.click(mapButton)

      await waitFor(() => {
        expect(screen.getByText('Map')).toBeInTheDocument()
      })
    })
  })

  describe('Layout Management', () => {
    it('generates shareable layout URL', async () => {
      const user = userEvent.setup()
      render(<MultiviewerApp />)

      // Add a widget first
      const urlInput = screen.getByPlaceholderText(/Enter URL/)
      await user.type(urlInput, 'https://www.youtube.com/watch?v=dQw4w9WgXcQ')
      
      const addButton = screen.getByText('Add Stream')
      await user.click(addButton)

      await waitFor(() => {
        expect(screen.getByText(/YouTube Video/)).toBeInTheDocument()
      })

      // Open share dialog
      const shareButton = screen.getByText('Share Layout')
      await user.click(shareButton)

      expect(screen.getByText('Share Layout')).toBeInTheDocument()
      
      const shareUrlInput = screen.getByDisplayValue(/layout=/)
      expect(shareUrlInput).toBeInTheDocument()
    })

    it('loads layout from URL parameter', () => {
      // Mock URL with layout parameter
      Object.defineProperty(window, 'location', {
        value: {
          search: '?layout=eyJ3aWRnZXRzIjpbXSwidmVyc2lvbiI6IjEuMCJ9',
        },
        writable: true,
      })

      render(<MultiviewerApp />)

      // The layout should be loaded (empty in this case)
      expect(screen.getByText('0/10 widgets')).toBeInTheDocument()
    })

    it('clears all widgets', async () => {
      const user = userEvent.setup()
      render(<MultiviewerApp />)

      // Add some widgets first
      const urlInput = screen.getByPlaceholderText(/Enter URL/)
      await user.type(urlInput, 'https://www.youtube.com/watch?v=dQw4w9WgXcQ')
      
      const addButton = screen.getByText('Add Stream')
      await user.click(addButton)

      await waitFor(() => {
        expect(screen.getByText(/YouTube Video/)).toBeInTheDocument()
      })

      // Clear all widgets
      const clearButton = screen.getByText('Clear All')
      await user.click(clearButton)

      await waitFor(() => {
        expect(screen.getByText(/No content added yet/)).toBeInTheDocument()
      })
    })

    it('refreshes all widgets', async () => {
      const user = userEvent.setup()
      render(<MultiviewerApp />)

      // Add some widgets first
      const urlInput = screen.getByPlaceholderText(/Enter URL/)
      await user.type(urlInput, 'https://www.youtube.com/watch?v=dQw4w9WgXcQ')
      
      const addButton = screen.getByText('Add Stream')
      await user.click(addButton)

      await waitFor(() => {
        expect(screen.getByText(/YouTube Video/)).toBeInTheDocument()
      })

      // Refresh all widgets
      const refreshButton = screen.getByText('Refresh All')
      await user.click(refreshButton)

      // Should not throw any errors
      expect(screen.getByText(/YouTube Video/)).toBeInTheDocument()
    })
  })

  describe('Theme Toggle', () => {
    it('toggles between light and dark theme', async () => {
      const user = userEvent.setup()
      render(<MultiviewerApp />)

      const themeButton = screen.getByRole('button', { name: /theme/i })
      
      // Should start with light theme (showing moon icon)
      await user.click(themeButton)
      
      // Should switch to dark theme (showing sun icon)
      await user.click(themeButton)

      // Theme should toggle without errors
      expect(themeButton).toBeInTheDocument()
    })
  })

  describe('Local Storage Persistence', () => {
    it('saves widgets to localStorage', async () => {
      const user = userEvent.setup()
      render(<MultiviewerApp />)

      const urlInput = screen.getByPlaceholderText(/Enter URL/)
      await user.type(urlInput, 'https://www.youtube.com/watch?v=dQw4w9WgXcQ')
      
      const addButton = screen.getByText('Add Stream')
      await user.click(addButton)

      await waitFor(() => {
        expect(localStorage.setItem).toHaveBeenCalledWith(
          'multiviewer-widgets',
          expect.stringContaining('dQw4w9WgXcQ')
        )
      })
    })

    it('loads widgets from localStorage on mount', () => {
      const savedWidgets = JSON.stringify([{
        id: '1',
        type: 'youtube',
        url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        title: 'Saved Video'
      }])

      localStorage.getItem = jest.fn().mockReturnValue(savedWidgets)

      render(<MultiviewerApp />)

      expect(localStorage.getItem).toHaveBeenCalledWith('multiviewer-widgets')
    })
  })

  describe('Error Handling', () => {
    it('handles invalid URLs gracefully', async () => {
      const user = userEvent.setup()
      render(<MultiviewerApp />)

      const urlInput = screen.getByPlaceholderText(/Enter URL/)
      await user.type(urlInput, 'invalid-url')
      
      const addButton = screen.getByText('Add Stream')
      await user.click(addButton)

      // Should still add as traffic cam (fallback)
      await waitFor(() => {
        expect(screen.getByText('Camera Feed')).toBeInTheDocument()
      })
    })

    it('handles localStorage errors gracefully', () => {
      localStorage.getItem = jest.fn().mockImplementation(() => {
        throw new Error('localStorage error')
      })

      expect(() => render(<MultiviewerApp />)).not.toThrow()
    })
  })
})
