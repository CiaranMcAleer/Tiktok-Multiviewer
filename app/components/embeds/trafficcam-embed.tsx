import { useState, useEffect } from "react"
import type { Widget } from "../../types/widget"

interface TrafficCamEmbedProps {
  widget: Widget
  lastRefresh: number
  onError: () => void
}

export const TrafficCamEmbed = ({ widget, lastRefresh, onError }: TrafficCamEmbedProps) => {
  const [trafficImageUrl, setTrafficImageUrl] = useState<string | null>(null)
  const [cameraTitle, setCameraTitle] = useState<string | null>(null)

  // Load camera data from static JSON
  useEffect(() => {
    if (widget.url && widget.url.includes("trafficwatchni.com")) {
      fetch("/twni-cameras.json")
        .then(res => res.json())
        .then((data) => {
          // Extract camera ID from the widget URL
          const urlIdMatch = widget.url.match(/id=(\d+)/)
          const urlCameraId = urlIdMatch ? urlIdMatch[1] : null
          
          // Try to match by camera ID first, then by viewerUrl or name
          const cam = data.find(
            (c: any) => {
              if (urlCameraId) {
                const camIdMatch = c.viewerUrl.match(/id=(\d+)/)
                const camId = camIdMatch ? camIdMatch[1] : null
                if (camId === urlCameraId) return true
              }
              return c.viewerUrl === widget.url ||
                     c.name === widget.title ||
                     (widget.url && widget.url.includes(c.viewerUrl))
            }
          );
          if (cam) {
            setTrafficImageUrl(cam.imageUrl);
            setCameraTitle(cam.name);
          } else {
            setTrafficImageUrl(null);
            setCameraTitle(null);
          }
        })
        .catch(() => {
          setTrafficImageUrl(null);
          setCameraTitle(null);
        });
    }
  }, [widget.url, widget.title]);

  // For TrafficWatch NI, use the static JSON image URL
  if (widget.url && widget.url.includes("trafficwatchni.com") && trafficImageUrl) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-md relative">
        <img
          src={`${trafficImageUrl}?t=${lastRefresh}`}
          alt={cameraTitle || widget.title}
          className="max-w-full max-h-full object-contain rounded-md"
          onError={onError}
        />
        <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
          {cameraTitle || widget.title}
        </div>
        <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
          Static • Refreshes every {widget.refreshInterval ? Math.round(widget.refreshInterval / 1000) : 20}s
        </div>
      </div>
    )
  }

  // For TrafficWatch NI URLs without camera data, show a message
  if (widget.url && widget.url.includes("trafficwatchni.com")) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-md">
        <div className="text-center p-4">
          <div className="text-lg font-medium mb-2">{widget.title}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            TrafficWatch NI camera image not available
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-500">
            Camera data not found in database
          </div>
        </div>
      </div>
    )
  }

  // For direct image URLs, show the image
  if (widget.url && widget.url.match(/\.(jpg|jpeg|png|gif)(\?.*)?$/i)) {
    return (
      <div className="w-full h-full relative">
        <img
          src={`${widget.url}${widget.url && widget.url.includes("?") ? "&" : "?"}t=${lastRefresh}`}
          alt={widget.title}
          className="w-full h-full object-contain rounded-md"
          onError={onError}
        />
        <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
          Refreshes every {widget.refreshInterval ? Math.round(widget.refreshInterval / 1000) : 20}s
        </div>
      </div>
    )
  }

  // For other URLs, try iframe (but avoid if URL is missing)
  if (!widget.url) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-md">
        <div className="text-center text-gray-500">
          No URL provided
        </div>
      </div>
    )
  }

  return (
    <iframe
      src={widget.url}
      className="w-full h-full border-0 rounded-md"
      onError={onError}
      key={lastRefresh}
      title={widget.title}
    />
  )
}
