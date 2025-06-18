"use client"

import { useState, useEffect, useRef } from "react"
import { X, RefreshCw, ExternalLink, Maximize2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import type { Widget } from "../types/widget"
import PopupManager from "../utils/popup-manager"

interface StreamWidgetProps {
  widget: Widget
  onRemove: () => void
  theme: "light" | "dark"
}

export default function StreamWidget({ widget, onRemove, theme }: StreamWidgetProps) {
  const [isActive, setIsActive] = useState(false)
  const [lastRefresh, setLastRefresh] = useState(Date.now())
  const [embedError, setEmbedError] = useState(false)
  const [trafficImageUrl, setTrafficImageUrl] = useState<string | null>(null)
  const popupManager = useRef<PopupManager>(PopupManager.getInstance())
  const refreshTimerRef = useRef<NodeJS.Timeout | null>(null)
  const iframelyLoadedRef = useRef(false)

  // Check if popup is still open
  useEffect(() => {
    const checkPopupStatus = () => {
      const isOpen = popupManager.current.isOpen(widget.id)
      setIsActive(isOpen)
    }

    const interval = setInterval(checkPopupStatus, 1000)
    return () => clearInterval(interval)
  }, [widget.id])

  // Set up auto-refresh for traffic cams - changed to 20 seconds
  useEffect(() => {
    if (widget.type === "trafficcam" && widget.refreshInterval) {
      refreshTimerRef.current = setInterval(() => {
        refreshContent()
      }, 20000) // Changed from widget.refreshInterval to fixed 20 seconds
    }

    return () => {
      if (refreshTimerRef.current) {
        clearInterval(refreshTimerRef.current)
      }
    }
  }, [widget])

  // Extract TrafficWatch image URL
  useEffect(() => {
    if (widget.type === "trafficcam" && widget.url.includes("trafficwatchni.com")) {
      const extractImageUrl = async () => {
        try {
          const cameraId = extractTrafficWatchID(widget.url)
          if (cameraId) {
            // Try to fetch the page and extract the image URL
            const response = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(widget.url)}`)
            const data = await response.json()

            // Look for the image URL pattern in the HTML
            const imageMatch = data.contents.match(/https:\/\/cctv\.trafficwatchni\.com\/\d+\.jpg/i)
            if (imageMatch) {
              setTrafficImageUrl(imageMatch[0])
            } else {
              // Fallback: construct likely image URL based on camera ID
              setTrafficImageUrl(`https://cctv.trafficwatchni.com/${cameraId}.jpg`)
            }
          }
        } catch (error) {
          console.error("Failed to extract TrafficWatch image URL:", error)
          // Fallback: try to construct the URL
          const cameraId = extractTrafficWatchID(widget.url)
          if (cameraId) {
            setTrafficImageUrl(`https://cctv.trafficwatchni.com/${cameraId}.jpg`)
          }
        }
      }

      extractImageUrl()
    }
  }, [widget.url, widget.type])

  // Load Iframely script for TikTok
  useEffect(() => {
    if (widget.type === "tiktok" && !iframelyLoadedRef.current) {
      const script = document.createElement("script")
      script.src = "//iframely.net/embed.js"
      script.async = true
      document.head.appendChild(script)
      iframelyLoadedRef.current = true

      return () => {
        if (document.head.contains(script)) {
          document.head.removeChild(script)
        }
      }
    }
  }, [widget.type])

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

  const refreshContent = () => {
    setLastRefresh(Date.now())
    setEmbedError(false)

    if (widget.type === "trafficcam" && popupManager.current.isOpen(widget.id)) {
      popupManager.current.closePopup(widget.id)
      setTimeout(() => {
        openPopupWindow()
      }, 100)
    }
  }

  const extractYouTubeID = (url: string): string | null => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
    const match = url.match(regExp)
    return match && match[2].length === 11 ? match[2] : null
  }

  const extractTrafficWatchID = (url: string): string | null => {
    // Extract camera ID from TrafficWatch NI URLs - look for ?id= parameter
    const match = url.match(/[?&]id=(\d+)/i)
    return match ? match[1] : null
  }

  const renderEmbeddedContent = () => {
    if (widget.type === "youtube") {
      const videoId = extractYouTubeID(widget.url)
      if (videoId) {
        return (
          <iframe
            src={`https://www.youtube.com/embed/${videoId}?autoplay=0&mute=1`}
            className="w-full h-full border-0 rounded-md"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            onError={() => setEmbedError(true)}
          />
        )
      }
    }

    if (widget.type === "trafficcam") {
      // For TrafficWatch NI, use the extracted image URL
      if (widget.url.includes("trafficwatchni.com") && trafficImageUrl) {
        return (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-md relative">
            <img
              src={`${trafficImageUrl}?cache=${lastRefresh}`}
              alt={widget.title}
              className="max-w-full max-h-full object-contain rounded-md"
              onError={() => setEmbedError(true)}
            />
            <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
              Live • Refreshes every 20s
            </div>
          </div>
        )
      }

      // For direct image URLs, show the image
      if (widget.url.match(/\.(jpg|jpeg|png|gif)(\?.*)?$/i)) {
        return (
          <div className="w-full h-full relative">
            <img
              src={`${widget.url}${widget.url.includes("?") ? "&" : "?"}t=${lastRefresh}`}
              alt={widget.title}
              className="w-full h-full object-contain rounded-md"
              onError={() => setEmbedError(true)}
            />
            <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
              Refreshes every 20s
            </div>
          </div>
        )
      }

      // For other URLs, try iframe
      return (
        <iframe
          src={widget.url}
          className="w-full h-full border-0 rounded-md"
          onError={() => setEmbedError(true)}
          key={lastRefresh}
        />
      )
    }

    if (widget.type === "tiktok") {
      // Use Iframely embed for better TikTok styling with dark mode support
      const username = widget.url.match(/@([^/]+)/)?.[1] || widget.title
      return (
        <div
          className={`w-full h-full flex flex-col items-center justify-center p-4 ${theme === "dark" ? "bg-gray-800" : "bg-white"}`}
        >
          <div className="w-full max-w-sm">
            <div
              className="iframely-embed"
              style={{
                filter: theme === "dark" ? "invert(1) hue-rotate(180deg)" : "none",
                borderRadius: "8px",
                overflow: "hidden",
              }}
              dangerouslySetInnerHTML={{
                __html: `
                  <div class="iframely-responsive" style="height: 280px; padding-bottom: 0;">
                    <a href="${widget.url}" data-iframely-url="//iframely.net/koAWje4h?card=small"></a>
                  </div>
                `,
              }}
            />
          </div>
          <div className="mt-4 text-center">
            <Button onClick={openPopupWindow} variant="outline" size="sm">
              <Maximize2 className="h-4 w-4 mr-2" />
              Open Full Stream
            </Button>
          </div>
        </div>
      )
    }

    return null
  }

  if (embedError) {
    return (
      <Card
        className={`relative h-96 ${theme === "dark" ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}
      >
        <CardHeader className="flex flex-row items-center justify-between p-3">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-2 h-2 rounded-full bg-red-500" />
            <span className="font-medium truncate">{widget.title}</span>
          </div>
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={refreshContent} aria-label="Refresh content">
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => window.open(widget.url, "_blank")} aria-label="Open in new tab">
              <ExternalLink className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onRemove} aria-label="Remove widget">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-4 h-80 flex flex-col items-center justify-center">
          <div className="text-center">
            <p className="text-red-500 mb-2">Failed to load content</p>
            <Button onClick={openPopupWindow} variant="outline">
              <ExternalLink className="h-4 w-4 mr-2" />
              Open in Popup
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card
      className={`relative h-96 ${isActive ? "ring-2 ring-green-500" : ""} ${
        theme === "dark" ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
      }`}
    >
      <CardHeader className="flex flex-row items-center justify-between p-3">
        <div className="flex items-center gap-2 min-w-0">
          <div
            className={`w-2 h-2 rounded-full ${
              isActive
                ? "bg-green-500"
                : widget.type === "youtube"
                  ? "bg-red-500"
                  : widget.type === "trafficcam"
                    ? "bg-blue-500"
                    : "bg-gray-400"
            }`}
          />
          <span className="font-medium truncate">{widget.title}</span>
        </div>
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={refreshContent} aria-label="Refresh content">
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => window.open(widget.url, "_blank")} aria-label="Open in new tab">
            <ExternalLink className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={openPopupWindow} aria-label="Open in popup">
            <Maximize2 className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onRemove} aria-label="Remove widget">
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-4 h-80">{renderEmbeddedContent()}</CardContent>
    </Card>
  )
}
