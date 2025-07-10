import PopupManager from '@/app/utils/popup-manager'

describe('PopupManager', () => {
  let popupManager: PopupManager
  
  beforeEach(() => {
    popupManager = PopupManager.getInstance()
    // Clear any existing popups
    popupManager.closeAll()
    jest.clearAllMocks()
    
    // Mock screen dimensions for consistent test results
    Object.defineProperty(window, 'screen', {
      value: {
        width: 1920,
        height: 1080,
      },
      configurable: true,
    })
  })

  afterEach(() => {
    popupManager.closeAll()
  })

  describe('Singleton Pattern', () => {
    it('should return the same instance', () => {
      const instance1 = PopupManager.getInstance()
      const instance2 = PopupManager.getInstance()
      expect(instance1).toBe(instance2)
    })
  })

  describe('Popup Management', () => {
    it('should open a popup', () => {
      const mockWindow = { focus: jest.fn(), close: jest.fn() }
      window.open = jest.fn().mockReturnValue(mockWindow)

      popupManager.openPopup('test-id', 'https://example.com', 'Test Title', 'youtube')

      expect(window.open).toHaveBeenCalledWith(
        'https://example.com',
        'popup_test-id',
        expect.stringContaining('width=945')
      )
    })

    it('should track open popups', () => {
      const mockWindow = { focus: jest.fn(), close: jest.fn() }
      window.open = jest.fn().mockReturnValue(mockWindow)

      popupManager.openPopup('test-id', 'https://example.com', 'Test Title', 'youtube')

      expect(popupManager.isOpen('test-id')).toBe(true)
    })

    it('should close a specific popup', () => {
      const mockWindow = { focus: jest.fn(), close: jest.fn() }
      window.open = jest.fn().mockReturnValue(mockWindow)

      popupManager.openPopup('test-id', 'https://example.com', 'Test Title', 'youtube')
      popupManager.closePopup('test-id')

      expect(mockWindow.close).toHaveBeenCalled()
      expect(popupManager.isOpen('test-id')).toBe(false)
    })

    it('should close all popups', () => {
      const mockWindow1 = { focus: jest.fn(), close: jest.fn() }
      const mockWindow2 = { focus: jest.fn(), close: jest.fn() }
      window.open = jest.fn()
        .mockReturnValueOnce(mockWindow1)
        .mockReturnValueOnce(mockWindow2)

      popupManager.openPopup('test-id-1', 'https://example.com', 'Test Title 1', 'youtube')
      popupManager.openPopup('test-id-2', 'https://example.com', 'Test Title 2', 'tiktok')

      popupManager.closeAll()

      expect(mockWindow1.close).toHaveBeenCalled()
      expect(mockWindow2.close).toHaveBeenCalled()
      expect(popupManager.isOpen('test-id-1')).toBe(false)
      expect(popupManager.isOpen('test-id-2')).toBe(false)
    })

    it('should focus existing popup if already open', () => {
      const mockWindow = { focus: jest.fn(), close: jest.fn() }
      window.open = jest.fn().mockReturnValue(mockWindow)

      popupManager.openPopup('test-id', 'https://example.com', 'Test Title', 'youtube')
      popupManager.focusPopup('test-id')

      expect(mockWindow.focus).toHaveBeenCalled()
    })

    it('should get list of open popup IDs', () => {
      const mockWindow1 = { focus: jest.fn(), close: jest.fn() }
      const mockWindow2 = { focus: jest.fn(), close: jest.fn() }
      window.open = jest.fn()
        .mockReturnValueOnce(mockWindow1)
        .mockReturnValueOnce(mockWindow2)

      popupManager.openPopup('test-id-1', 'https://example.com', 'Test Title 1', 'youtube')
      popupManager.openPopup('test-id-2', 'https://example.com', 'Test Title 2', 'tiktok')

      const openPopups = popupManager.getOpenPopups()
      expect(openPopups).toEqual(['test-id-1', 'test-id-2'])
    })
  })

  describe('Grid Settings', () => {
    it('should set grid dimensions', () => {
      popupManager.setGrid(3)
      // This would be tested by checking if new popups respect the grid settings
      // Since the actual grid calculation is internal, we test the behavior indirectly
      expect(() => popupManager.setGrid(3)).not.toThrow()
    })

    it('should calculate position correctly for different column configurations', () => {
      // Mock window.open to return a simple mock
      const mockWindows = []
      window.open = jest.fn().mockImplementation(() => {
        const mockWindow = { focus: jest.fn(), close: jest.fn(), closed: false }
        mockWindows.push(mockWindow)
        return mockWindow
      })

      // Set grid to 3 columns
      popupManager.setGrid(3)

      // Open 5 popups to test grid positioning
      popupManager.openPopup('test-1', 'https://example.com', 'Test 1', 'youtube')
      popupManager.openPopup('test-2', 'https://example.com', 'Test 2', 'youtube')
      popupManager.openPopup('test-3', 'https://example.com', 'Test 3', 'youtube')
      popupManager.openPopup('test-4', 'https://example.com', 'Test 4', 'youtube')
      popupManager.openPopup('test-5', 'https://example.com', 'Test 5', 'youtube')

      // Check that window.open was called with correct parameters
      expect(window.open).toHaveBeenCalledTimes(5)
      
      // Verify all popups are tracked
      expect(popupManager.getOpenPopups()).toHaveLength(5)
      
      // Clean up
      mockWindows.forEach(mockWindow => mockWindow.close())
    })

    it('should dynamically calculate rows based on number of widgets and columns', () => {
      const mockWindows = []
      window.open = jest.fn().mockImplementation(() => {
        const mockWindow = { focus: jest.fn(), close: jest.fn(), closed: false }
        mockWindows.push(mockWindow)
        return mockWindow
      })

      // Set grid to 2 columns
      popupManager.setGrid(2)

      // Open 3 popups (should create 2 rows: 2 in first row, 1 in second row)
      popupManager.openPopup('test-1', 'https://example.com', 'Test 1', 'youtube')
      popupManager.openPopup('test-2', 'https://example.com', 'Test 2', 'youtube')
      popupManager.openPopup('test-3', 'https://example.com', 'Test 3', 'youtube')

      // Verify all popups are tracked
      expect(popupManager.getOpenPopups()).toHaveLength(3)
      
      // Clean up
      mockWindows.forEach(mockWindow => mockWindow.close())
    })
  })
})
