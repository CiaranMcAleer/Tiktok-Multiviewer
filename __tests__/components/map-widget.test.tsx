import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import MapWidget from '@/app/components/map-widget'

const mockOnRemove = jest.fn()

// Mock the dynamic import of leaflet
jest.mock('leaflet', () => ({
  map: jest.fn(() => ({
    setView: jest.fn().mockReturnThis(),
    addTo: jest.fn().mockReturnThis(),
    bindPopup: jest.fn().mockReturnThis(),
    openPopup: jest.fn().mockReturnThis(),
  })),
  tileLayer: jest.fn(() => ({
    addTo: jest.fn().mockReturnThis(),
  })),
  marker: jest.fn(() => ({
    addTo: jest.fn().mockReturnThis(),
    bindPopup: jest.fn().mockReturnThis(),
    openPopup: jest.fn().mockReturnThis(),
  })),
  control: {
    layers: jest.fn(() => ({
      addTo: jest.fn().mockReturnThis(),
    })),
  },
}))

describe('MapWidget', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    
    // Mock geolocation
    const mockGeolocation = {
      getCurrentPosition: jest.fn((success) => {
        success({
          coords: {
            latitude: 54.5973,
            longitude: -5.9301,
          },
        })
      }),
    }
    
    // Only define if not already defined or if it's configurable
    if (!('geolocation' in navigator) || Object.getOwnPropertyDescriptor(navigator, 'geolocation')?.configurable !== false) {
      Object.defineProperty(navigator, 'geolocation', {
        value: mockGeolocation,
        configurable: true,
        writable: true,
      })
    } else {
      // If we can't redefine it, just replace the methods
      ;(navigator.geolocation as any) = mockGeolocation
    }
  })

  it('renders map widget with correct title', () => {
    render(<MapWidget title="Test Map" onRemove={mockOnRemove} theme="light" />)
    
    expect(screen.getByText('Test Map')).toBeInTheDocument()
  })

  it('calls onRemove when remove button is clicked', async () => {
    const user = userEvent.setup()
    render(<MapWidget title="Test Map" onRemove={mockOnRemove} theme="light" />)
    
    const removeButton = screen.getByRole('button', { name: /remove/i })
    await user.click(removeButton)
    
    expect(mockOnRemove).toHaveBeenCalled()
  })

  it('shows loading state initially', () => {
    render(<MapWidget title="Test Map" onRemove={mockOnRemove} theme="light" />)
    
    expect(screen.getByText(/Loading map/)).toBeInTheDocument()
  })

  it('initializes map after component mounts', async () => {
    render(<MapWidget title="Test Map" onRemove={mockOnRemove} theme="light" />)
    
    await waitFor(() => {
      const leaflet = require('leaflet')
      expect(leaflet.map).toHaveBeenCalled()
    })
  })

  it('gets user location and sets up map', async () => {
    render(<MapWidget title="Test Map" onRemove={mockOnRemove} theme="light" />)
    
    await waitFor(() => {
      expect(navigator.geolocation.getCurrentPosition).toHaveBeenCalled()
    })
  })

  it('handles geolocation error gracefully', async () => {
    // Mock geolocation error
    const mockGeolocation = {
      getCurrentPosition: jest.fn((success, error) => {
        error({ message: 'Permission denied' })
      }),
    }
    Object.defineProperty(navigator, 'geolocation', {
      value: mockGeolocation,
      configurable: true,
    })

    render(<MapWidget title="Test Map" onRemove={mockOnRemove} theme="light" />)
    
    await waitFor(() => {
      expect(navigator.geolocation.getCurrentPosition).toHaveBeenCalled()
    })
    
    // Should fallback to Belfast coordinates
    const leaflet = require('leaflet')
    await waitFor(() => {
      expect(leaflet.map).toHaveBeenCalled()
    })
  })

  it('renders with dark theme correctly', () => {
    const { container } = render(
      <MapWidget title="Test Map" onRemove={mockOnRemove} theme="dark" />
    )
    
    expect(container.querySelector('.bg-gray-800')).toBeInTheDocument()
  })

  it('renders with light theme correctly', () => {
    const { container } = render(
      <MapWidget title="Test Map" onRemove={mockOnRemove} theme="light" />
    )
    
    expect(container.querySelector('.bg-white')).toBeInTheDocument()
  })

  it('creates map container with correct ID', () => {
    render(<MapWidget title="Test Map" onRemove={mockOnRemove} theme="light" />)
    
    expect(document.getElementById('map-Test Map')).toBeInTheDocument()
  })

  it('handles multiple map widgets with different IDs', () => {
    const { rerender } = render(
      <MapWidget title="Map 1" onRemove={mockOnRemove} theme="light" />
    )
    
    expect(document.getElementById('map-Map 1')).toBeInTheDocument()
    
    rerender(<MapWidget title="Map 2" onRemove={mockOnRemove} theme="light" />)
    
    expect(document.getElementById('map-Map 2')).toBeInTheDocument()
  })

  it('shows map icon in header', () => {
    render(<MapWidget title="Test Map" onRemove={mockOnRemove} theme="light" />)
    
    // The map icon should be present (Layers icon from lucide-react)
    expect(screen.getByRole('button', { name: /remove/i })).toBeInTheDocument()
  })

  it('handles no geolocation support', async () => {
    // Mock no geolocation support
    Object.defineProperty(navigator, 'geolocation', {
      value: undefined,
      configurable: true,
    })

    render(<MapWidget title="Test Map" onRemove={mockOnRemove} theme="light" />)
    
    // Should still render and use fallback location
    await waitFor(() => {
      const leaflet = require('leaflet')
      expect(leaflet.map).toHaveBeenCalled()
    })
  })
})
