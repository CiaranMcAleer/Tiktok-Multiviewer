import { useState, useEffect, useRef } from "react"
import type { Widget } from "../types/widget"

export const useAutoRefresh = (widget: Widget, onRefresh: () => void) => {
  const [lastRefresh, setLastRefresh] = useState(Date.now())
  const refreshTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Set up auto-refresh for traffic cams - changed to 5 seconds
  useEffect(() => {
    if (widget.type === "trafficcam" && widget.refreshInterval) {
      refreshTimerRef.current = setInterval(() => {
        refreshContent()
      }, 5000) // Changed from widget.refreshInterval to fixed 5 seconds
    }

    return () => {
      if (refreshTimerRef.current) {
        clearInterval(refreshTimerRef.current)
      }
    }
  }, [widget])

  const refreshContent = () => {
    setLastRefresh(Date.now())
    onRefresh()
  }

  return {
    lastRefresh,
    refreshContent
  }
}
