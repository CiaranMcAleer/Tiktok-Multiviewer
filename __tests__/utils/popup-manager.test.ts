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
      popupManager.setGrid(3, 2)
      // This would be tested by checking if new popups respect the grid settings
      // Since the actual grid calculation is internal, we test the behavior indirectly
      expect(() => popupManager.setGrid(3, 2)).not.toThrow()
    })
  })
})
