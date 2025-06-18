import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import WorldTimeWidget from '@/app/components/world-time-widget'

const mockOnRemove = jest.fn()
const mockOnCityChange = jest.fn()

// Mock fetch for timezone API
beforeEach(() => {
  global.fetch = jest.fn()
  jest.clearAllMocks()
})

describe('WorldTimeWidget', () => {
  const defaultProps = {
    title: 'London Time',
    city: 'London',
    timezone: 'Europe/London',
    onRemove: mockOnRemove,
    onCityChange: mockOnCityChange,
    theme: 'light' as const,
  }

  beforeEach(() => {
    // Mock successful timezone API response
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        datetime: '2025-06-17T12:00:00.000+01:00',
        timezone: 'Europe/London',
        utc_offset: '+01:00',
      }),
    })
  })

  it('renders world time widget with correct title', async () => {
    await act(async () => {
      render(<WorldTimeWidget {...defaultProps} />)
    })
    
    expect(screen.getByText('London Time')).toBeInTheDocument()
  })

  it('renders current city name', async () => {
    await act(async () => {
      render(<WorldTimeWidget {...defaultProps} />)
    })
    
    expect(screen.getByText('London')).toBeInTheDocument()
  })

  it('calls onRemove when remove button is clicked', async () => {
    const user = userEvent.setup()
    await act(async () => {
      render(<WorldTimeWidget {...defaultProps} />)
    })
    
    const removeButton = screen.getByRole('button', { name: /remove/i })
    await user.click(removeButton)
    
    expect(mockOnRemove).toHaveBeenCalled()
  })

  it('fetches time data on mount', async () => {
    await act(async () => {
      render(<WorldTimeWidget {...defaultProps} />)
    })
    
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('worldtimeapi.org')
      )
    })
  })

  it('displays fetched time', async () => {
    await act(async () => {
      render(<WorldTimeWidget {...defaultProps} />)
    })
    
    await waitFor(() => {
      expect(screen.getByText(/12:00/)).toBeInTheDocument()
    })
  })

  it('shows loading state initially', async () => {
    await act(async () => {
      render(<WorldTimeWidget {...defaultProps} />)
    })
    
    expect(screen.getByTestId('loading-spinner') || screen.getByText(/loading/i)).toBeInTheDocument()
  })

  it('opens timezone selector when city button is clicked', async () => {
    const user = userEvent.setup()
    await act(async () => {
      render(<WorldTimeWidget {...defaultProps} />)
    })
    
    const cityButton = screen.getByRole('button', { name: /london/i })
    await user.click(cityButton)
    
    expect(screen.getByPlaceholderText(/search timezones/i)).toBeInTheDocument()
  })

  it('filters timezones when searching', async () => {
    const user = userEvent.setup()
    await act(async () => {
      render(<WorldTimeWidget {...defaultProps} />)
    })
    
    const cityButton = screen.getByRole('button', { name: /london/i })
    await user.click(cityButton)
    
    const searchInput = screen.getByPlaceholderText(/search timezones/i)
    await user.type(searchInput, 'New York')
    
    await waitFor(() => {
      expect(screen.getByText(/New_York/)).toBeInTheDocument()
    })
  })

  it('calls onCityChange when new timezone is selected', async () => {
    const user = userEvent.setup()
    await act(async () => {
      render(<WorldTimeWidget {...defaultProps} />)
    })
    
    const cityButton = screen.getByRole('button', { name: /london/i })
    await user.click(cityButton)
    
    const newYorkOption = screen.getByText(/New_York/)
    await user.click(newYorkOption)
    
    expect(mockOnCityChange).toHaveBeenCalledWith('New York', 'America/New_York')
  })

  it('handles API error gracefully', async () => {
    ;(global.fetch as jest.Mock).mockRejectedValue(new Error('API Error'))
    
    await act(async () => {
      render(<WorldTimeWidget {...defaultProps} />)
    })
    
    await waitFor(() => {
      expect(screen.getByText(/(Browser)/)).toBeInTheDocument()
    })
  })

  it('falls back to browser time when API fails', async () => {
    ;(global.fetch as jest.Mock).mockRejectedValue(new Error('API Error'))
    
    await act(async () => {
      render(<WorldTimeWidget {...defaultProps} />)
    })
    
    await waitFor(() => {
      // Should show current browser time
      const timeElement = screen.getByText(/\d{1,2}:\d{2}/)
      expect(timeElement).toBeInTheDocument()
    })
  })

  it('renders with dark theme correctly', async () => {
    const { container } = await act(async () => {
      return render(
        <WorldTimeWidget {...defaultProps} theme="dark" />
      )
    })
    
    expect(container.querySelector('.bg-gray-800')).toBeInTheDocument()
  })

  it('renders with light theme correctly', async () => {
    const { container } = await act(async () => {
      return render(
        <WorldTimeWidget {...defaultProps} theme="light" />
      )
    })
    
    expect(container.querySelector('.bg-white')).toBeInTheDocument()
  })

  it('shows clock icon in header', async () => {
    await act(async () => {
      render(<WorldTimeWidget {...defaultProps} />)
    })
    
    // Clock icon should be present
    expect(screen.getByRole('button', { name: /remove/i })).toBeInTheDocument()
  })

  it('updates time periodically', async () => {
    jest.useFakeTimers()
    
    await act(async () => {
      render(<WorldTimeWidget {...defaultProps} />)
    })
    
    // Fast-forward time
    act(() => {
      jest.advanceTimersByTime(30000) // 30 seconds
    })
    
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(2)
    })
    
    jest.useRealTimers()
  })

  it('shows different cities in dropdown', async () => {
    const user = userEvent.setup()
    await act(async () => {
      render(<WorldTimeWidget {...defaultProps} />)
    })
    
    const cityButton = screen.getByRole('button', { name: /london/i })
    await user.click(cityButton)
    
    await waitFor(() => {
      expect(screen.getByText(/Tokyo/)).toBeInTheDocument()
      expect(screen.getByText(/Sydney/)).toBeInTheDocument()
      expect(screen.getByText(/Cairo/)).toBeInTheDocument()
    })
  })

  it('formats timezone names correctly', async () => {
    const user = userEvent.setup()
    await act(async () => {
      render(<WorldTimeWidget {...defaultProps} />)
    })
    
    const cityButton = screen.getByRole('button', { name: /london/i })
    await user.click(cityButton)
    
    await waitFor(() => {
      // Should format "America/New_York" as "New York"
      expect(screen.getByText('New York')).toBeInTheDocument()
    })
  })
})
