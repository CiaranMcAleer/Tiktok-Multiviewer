import { useState, useEffect } from "react"
import { extractTrafficImageUrl } from "../../utils/embed-utils"
import type { Widget } from "../../types/widget"

interface TrafficCamEmbedProps {
  widget: Widget
  lastRefresh: number
  onError: () => void
}

export const TrafficCamEmbed = ({ widget, lastRefresh, onError }: TrafficCamEmbedProps) => {
  const [trafficImageUrl, setTrafficImageUrl] = useState<string | null>(null)

  // Extract TrafficWatch image URL
  useEffect(() => {
    if (widget.url.includes("trafficwatchni.com")) {
      extractTrafficImageUrl(widget.url).then(setTrafficImageUrl)
    }
  }, [widget.url])

  // For TrafficWatch NI, use the extracted image URL
  if (widget.url.includes("trafficwatchni.com") && trafficImageUrl) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-md relative">
        <img
          src={`${trafficImageUrl}?cache=${lastRefresh}`}
          alt={widget.title}
          className="max-w-full max-h-full object-contain rounded-md"
          onError={onError}
        />
        <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
          Live • Refreshes every {widget.refreshInterval ? Math.round(widget.refreshInterval / 1000) : 20}s
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
          onError={onError}
        />
        <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
          Refreshes every {widget.refreshInterval ? Math.round(widget.refreshInterval / 1000) : 20}s
        </div>
      </div>
    )
  }

  // For other URLs, try iframe
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
