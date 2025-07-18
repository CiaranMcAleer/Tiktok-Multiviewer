"use client"

import { useState } from "react"
import { X, RefreshCw, ExternalLink, Maximize2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import type { Widget } from "../types/widget"
import { usePopupManager } from "../hooks/use-popup-manager"
import { useAutoRefresh } from "../hooks/use-auto-refresh"
import { YouTubeEmbed } from "./embeds/youtube-embed"
import { TrafficCamEmbed } from "./embeds/trafficcam-embed"
import { TikTokEmbed } from "./embeds/tiktok-embed"
import { ErrorCard } from "./embeds/error-card"

interface StreamWidgetProps {
  widget: Widget
  onRemove: () => void
  theme: "light" | "dark"
}

export default function StreamWidget({ widget, onRemove, theme }: StreamWidgetProps) {
  const [embedError, setEmbedError] = useState(false)
  
  const { isActive, openPopupWindow, closePopup } = usePopupManager(widget)
  
  const handleRefreshCallback = () => {
    setEmbedError(false)
    if (widget.type === "trafficcam" && isActive) {
      closePopup()
      setTimeout(() => {
        openPopupWindow()
      }, 100)
    }
  }
  
  const { lastRefresh, refreshContent } = useAutoRefresh(widget, handleRefreshCallback)

  const handleError = () => setEmbedError(true)

  const handleRefresh = () => {
    refreshContent()
    setEmbedError(false)
  }

  if (embedError) {
    return (
      <ErrorCard
        widget={widget}
        theme={theme}
        onRemove={onRemove}
        onRefresh={handleRefresh}
        onOpenPopup={openPopupWindow}
      />
    )
  }

  const renderEmbeddedContent = () => {
    switch (widget.type) {
      case "youtube":
        return (
          <YouTubeEmbed
            url={widget.url}
            title={widget.title}
            onError={handleError}
          />
        )
      case "trafficcam":
        return (
          <TrafficCamEmbed
            widget={widget}
            lastRefresh={lastRefresh}
            onError={handleError}
          />
        )
      case "tiktok":
        return (
          <TikTokEmbed
            url={widget.url}
            title={widget.title}
            theme={theme}
            onOpenPopup={openPopupWindow}
          />
        )
      default:
        return null
    }
  }

  return (
    <Card
      className={`relative h-96 ${isActive ? "ring-2 ring-green-500" : ""} bg-background border-border`}
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
          <span className="font-medium truncate text-foreground">{widget.title}</span>
        </div>
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8 bg-background text-foreground hover:bg-accent hover:text-accent-foreground" onClick={handleRefresh} aria-label="Refresh content">
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 bg-background text-foreground hover:bg-accent hover:text-accent-foreground" onClick={() => window.open(widget.url, "_blank")} aria-label="Open in new tab">
            <ExternalLink className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 bg-background text-foreground hover:bg-accent hover:text-accent-foreground" onClick={openPopupWindow} aria-label="Open in popup">
            <Maximize2 className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 bg-background text-foreground hover:bg-accent hover:text-accent-foreground" onClick={onRemove} aria-label="Remove widget">
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-4 h-80">{renderEmbeddedContent()}</CardContent>
    </Card>
  )
}
