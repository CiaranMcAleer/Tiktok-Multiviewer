import { useState, useEffect, useRef } from "react"
import PopupManager from "../utils/popup-manager"
import { extractYouTubeID } from "../utils/embed-utils"
import type { Widget } from "../types/widget"

export const usePopupManager = (widget: Widget) => {
  const [isActive, setIsActive] = useState(false)
  const popupManager = useRef<PopupManager>(PopupManager.getInstance())

  // Check if popup is still open
  useEffect(() => {
    const checkPopupStatus = () => {
      const isOpen = popupManager.current.isOpen(widget.id)
      setIsActive(isOpen)
    }

    const interval = setInterval(checkPopupStatus, 1000)
    return () => clearInterval(interval)
  }, [widget.id])

  // Clean up when component unmounts
  useEffect(() => {
    return () => {
      popupManager.current.closePopup(widget.id)
    }
  }, [widget.id])

  const openPopupWindow = () => {
    if (popupManager.current.isOpen(widget.id)) {
      popupManager.current.focusPopup(widget.id)
      return
    }

    let url = widget.url
    if (widget.type === "trafficcam") {
      url = `${url}${url.includes("?") ? "&" : "?"}t=${Date.now()}`
    }

    if (widget.type === "youtube") {
      const videoId = extractYouTubeID(widget.url)
      if (videoId) {
        const embedHtml = `
          <!DOCTYPE html>
          <html>
          <head>
            <title>${widget.title}</title>
            <style>
              body, html { margin: 0; padding: 0; height: 100%; overflow: hidden; }
              iframe { width: 100%; height: 100%; border: 0; }
            </style>
          </head>
          <body>
            <iframe 
              src="https://www.youtube.com/embed/${videoId}?autoplay=1" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
              allowfullscreen>
            </iframe>
          </body>
          </html>
        `
        url = URL.createObjectURL(new Blob([embedHtml], { type: "text/html" }))
      }
    }

    popupManager.current.openPopup(widget.id, url, widget.title, widget.type)
    setIsActive(true)
  }

  return {
    isActive,
    openPopupWindow,
    closePopup: () => popupManager.current.closePopup(widget.id),
    focusPopup: () => popupManager.current.focusPopup(widget.id)
  }
}
