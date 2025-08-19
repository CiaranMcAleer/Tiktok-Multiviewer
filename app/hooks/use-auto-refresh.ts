import { useState, useEffect, useRef } from "react"
import type { Widget } from "../types/widget"

export const useAutoRefresh = (widget: Widget, onRefresh: () => void, isVisible: boolean = true) => {
  const [lastRefresh, setLastRefresh] = useState(Date.now())
  const refreshTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Set up auto-refresh for traffic cams - changed to 5 seconds
  useEffect(() => {
    // Always clear any existing timer first
    if (refreshTimerRef.current) {
      clearInterval(refreshTimerRef.current)
      refreshTimerRef.current = null
    }

    // Only set up timer if visible
    if (widget.type === "trafficcam" && widget.refreshInterval && isVisible) {
      refreshTimerRef.current = setInterval(() => {
        refreshContent()
      }, 5000)
    }

    // Optionally, trigger a refresh immediately when becoming visible
    if (widget.type === "trafficcam" && widget.refreshInterval && isVisible) {
      refreshContent()
    }

    return () => {
      if (refreshTimerRef.current) {
        clearInterval(refreshTimerRef.current)
        refreshTimerRef.current = null
      }
    }
  }, [widget, isVisible])

  const refreshContent = () => {
    setLastRefresh(Date.now())
    onRefresh()
  }

  return {
    lastRefresh,
    refreshContent
  }
}
