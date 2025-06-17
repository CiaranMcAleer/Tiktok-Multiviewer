interface PopupPosition {
  left: number
  top: number
  width: number
  height: number
}

interface PopupWindow {
  window: Window | null
  id: string
  type: string
  position: PopupPosition
}

class PopupManager {
  private static instance: PopupManager
  private popups: Map<string, PopupWindow> = new Map()
  private columns = 2
  private rows = 2
  private padding = 10
  private checkInterval: NodeJS.Timeout | null = null

  private constructor() {
    // Start checking for closed windows
    this.checkInterval = setInterval(() => this.checkClosedWindows(), 1000)
  }

  public static getInstance(): PopupManager {
    if (!PopupManager.instance) {
      PopupManager.instance = new PopupManager()
    }
    return PopupManager.instance
  }

  public setGrid(columns: number, rows: number): void {
    this.columns = columns
    this.rows = rows
    this.rearrangeAll()
  }

  public openPopup(id: string, url: string, title: string, type: string): Window | null {
    // Close existing popup if it exists
    this.closePopup(id)

    // Calculate position based on current popups
    const position = this.calculateNextPosition()

    // Open the popup
    const popup = window.open(
      url,
      `popup_${id}`,
      `width=${position.width},height=${position.height},left=${position.left},top=${position.top},resizable=yes,scrollbars=yes,status=yes`,
    )

    if (popup) {
      // Store the popup reference
      this.popups.set(id, {
        window: popup,
        id,
        type,
        position,
      })

      // Set title if possible
      try {
        popup.document.title = title
      } catch (e) {
        // Ignore errors from cross-origin windows
      }
    }

    return popup
  }

  public closePopup(id: string): void {
    const popup = this.popups.get(id)
    if (popup && popup.window && !popup.window.closed) {
      popup.window.close()
    }
    this.popups.delete(id)
  }

  public closeAll(): void {
    this.popups.forEach((popup) => {
      if (popup.window && !popup.window.closed) {
        popup.window.close()
      }
    })
    this.popups.clear()
  }

  public isOpen(id: string): boolean {
    const popup = this.popups.get(id)
    return !!(popup && popup.window && !popup.window.closed)
  }

  public focusPopup(id: string): void {
    const popup = this.popups.get(id)
    if (popup && popup.window && !popup.window.closed) {
      popup.window.focus()
    }
  }

  public getOpenPopups(): string[] {
    const openPopups: string[] = []
    this.popups.forEach((popup, id) => {
      if (popup.window && !popup.window.closed) {
        openPopups.push(id)
      } else {
        this.popups.delete(id)
      }
    })
    return openPopups
  }

  private calculateNextPosition(): PopupPosition {
    // Get screen dimensions
    const screenWidth = window.screen.width
    const screenHeight = window.screen.height

    // Calculate cell dimensions
    const cellWidth = Math.floor((screenWidth - (this.columns + 1) * this.padding) / this.columns)
    const cellHeight = Math.floor((screenHeight - (this.rows + 1) * this.padding) / this.rows)

    // Count current open popups
    const openCount = this.getOpenPopups().length

    // Calculate row and column for the new popup
    const row = Math.floor(openCount / this.columns) % this.rows
    const col = openCount % this.columns

    // Calculate position
    return {
      left: col * (cellWidth + this.padding) + this.padding,
      top: row * (cellHeight + this.padding) + this.padding,
      width: cellWidth,
      height: cellHeight,
    }
  }

  private rearrangeAll(): void {
    const openPopupIds = this.getOpenPopups()

    // Rearrange each popup
    openPopupIds.forEach((id, index) => {
      const popup = this.popups.get(id)
      if (popup && popup.window && !popup.window.closed) {
        // Calculate new position
        const row = Math.floor(index / this.columns) % this.rows
        const col = index % this.columns

        // Calculate cell dimensions
        const screenWidth = window.screen.width
        const screenHeight = window.screen.height
        const cellWidth = Math.floor((screenWidth - (this.columns + 1) * this.padding) / this.columns)
        const cellHeight = Math.floor((screenHeight - (this.rows + 1) * this.padding) / this.rows)

        // Calculate position
        const left = col * (cellWidth + this.padding) + this.padding
        const top = row * (cellHeight + this.padding) + this.padding

        // Update position
        try {
          popup.window.resizeTo(cellWidth, cellHeight)
          popup.window.moveTo(left, top)
          popup.position = { left, top, width: cellWidth, height: cellHeight }
        } catch (e) {
          // Ignore errors from cross-origin windows
        }
      }
    })
  }

  private checkClosedWindows(): void {
    this.popups.forEach((popup, id) => {
      if (popup.window && popup.window.closed) {
        this.popups.delete(id)
      }
    })
  }

  public destroy(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval)
    }
    this.closeAll()
  }
}

export default PopupManager
