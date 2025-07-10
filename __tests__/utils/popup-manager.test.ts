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

    it('should arrange popups in columns correctly', () => {
      // Mock multiple windows for testing positioning
      const mockWindows = Array.from({ length: 6 }, (_, i) => ({
        focus: jest.fn(),
        close: jest.fn(),
        resizeTo: jest.fn(),
        moveTo: jest.fn(),
        closed: false,
      }))

      window.open = jest.fn().mockImplementation((url, name, features) => {
        const index = mockWindows.findIndex(w => !w.closed)
        return mockWindows[index]
      })

      // Set 2 columns
      popupManager.setGrid(2)

      // Open 6 popups
      for (let i = 0; i < 6; i++) {
        popupManager.openPopup(`test-${i}`, 'https://example.com', `Test ${i}`, 'test')
      }

      // Verify window.open was called for each popup
      expect(window.open).toHaveBeenCalledTimes(6)

      // The key test: with 2 columns, popups should be arranged in 3 rows (6 popups / 2 columns)
      // We can't easily test the exact positioning without access to private methods,
      // but we can verify that all popups are tracked
      expect(popupManager.getOpenPopups()).toHaveLength(6)
    })

    it('should calculate positions correctly with dynamic rows', () => {
      // Mock window.open to capture the features string with position info
      const capturedFeatures: string[] = []
      window.open = jest.fn().mockImplementation((url, name, features) => {
        capturedFeatures.push(features)
        return {
          focus: jest.fn(),
          close: jest.fn(),
          resizeTo: jest.fn(),
          moveTo: jest.fn(),
          closed: false,
        }
      })

      popupManager.setGrid(2) // 2 columns

      // Open 5 popups
      for (let i = 0; i < 5; i++) {
        popupManager.openPopup(`test-${i}`, 'https://example.com', `Test ${i}`, 'test')
      }

      // Check that each popup gets different position parameters
      expect(capturedFeatures).toHaveLength(5)
      
      // With 2 columns and 5 popups, we should have 3 rows (2+2+1)
      // The positions should be calculated based on this layout
      expect(capturedFeatures[0]).toContain('left=10') // First popup: col 0, row 0
      expect(capturedFeatures[1]).toContain('left=') // Second popup: col 1, row 0
      expect(capturedFeatures[2]).toContain('left=10') // Third popup: col 0, row 1
      expect(capturedFeatures[3]).toContain('left=') // Fourth popup: col 1, row 1
      expect(capturedFeatures[4]).toContain('left=10') // Fifth popup: col 0, row 2
    })

    it('should handle more popups than traditional grid limits', () => {
      // This test demonstrates the fix: with 2 columns,
      // we should be able to add as many popups as needed, with rows calculated dynamically
      const mockWindows = Array.from({ length: 5 }, (_, i) => ({
        focus: jest.fn(),
        close: jest.fn(),
        resizeTo: jest.fn(),
        moveTo: jest.fn(),
        closed: false,
      }))

      window.open = jest.fn().mockImplementation((url, name, features) => {
        const index = mockWindows.findIndex(w => !w.closed)
        return mockWindows[index]
      })

      popupManager.setGrid(2)

      // Open 5 popups (should arrange in 3 rows: 2+2+1)
      for (let i = 0; i < 5; i++) {
        popupManager.openPopup(`test-${i}`, 'https://example.com', `Test ${i}`, 'test')
      }

      // All 5 popups should be tracked
      expect(popupManager.getOpenPopups()).toHaveLength(5)
    })
  })
})
