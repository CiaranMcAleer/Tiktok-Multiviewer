"use client"

import { useState, useEffect, useRef } from "react"
import { X, RefreshCw, Play, Pause, Volume2, VolumeX, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import type { Widget } from "../types/widget"

interface TwitchWidgetProps {
  widget: Widget
  onRemove: () => void
  onChannelChange: (channel: string) => void
  theme: "light" | "dark"
}

export default function TwitchWidget({ widget, onRemove, onChannelChange, theme }: TwitchWidgetProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [channelInput, setChannelInput] = useState("")
  const [isMuted, setIsMuted] = useState(false)
  const [isPlaying, setIsPlaying] = useState(true)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  const channel = widget.twitchChannel || ""

  const handleChannelChange = () => {
    if (!channelInput.trim()) {
      setError("Please enter a Twitch channel name")
      return
    }

    const cleanChannel = channelInput.trim().replace(/^@?/, "") // Remove @ if present
    if (!/^[a-zA-Z0-9_]{4,25}$/.test(cleanChannel)) {
      setError("Invalid channel name. Use 4-25 characters (letters, numbers, underscore)")
      return
    }

    onChannelChange(cleanChannel)
    setChannelInput("")
    setIsEditing(false)
    setError(null)
  }

  const handleIframeLoad = () => {
    setIsLoading(false)
    setError(null)
  }

  const handleIframeError = () => {
    setIsLoading(false)
    setError("Failed to load Twitch stream")
  }

  const toggleMute = () => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      try {
        // Try to communicate with the iframe to toggle mute
        // Note: This may not work due to CORS restrictions
        iframeRef.current.contentWindow.postMessage(
          { type: isMuted ? "unmute" : "mute" },
          "https://player.twitch.tv"
        )
        setIsMuted(!isMuted)
      } catch (e) {
        console.warn("Cannot control Twitch player audio:", e)
      }
    }
  }

  const togglePlayPause = () => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      try {
        // Try to communicate with the iframe to toggle play/pause
        // Note: This may not work due to CORS restrictions
        iframeRef.current.contentWindow.postMessage(
          { type: isPlaying ? "pause" : "play" },
          "https://player.twitch.tv"
        )
        setIsPlaying(!isPlaying)
      } catch (e) {
        console.warn("Cannot control Twitch player playback:", e)
      }
    }
  }

  const openInTwitch = () => {
    if (channel) {
      window.open(`https://twitch.tv/${channel}`, "_blank")
    }
  }

  const getTwitchEmbedUrl = () => {
    if (!channel) return ""
    
    const params = new URLSearchParams({
      channel: channel,
      parent: window.location.hostname,
      muted: isMuted.toString(),
      autoplay: isPlaying.toString(),
    })

    return `https://player.twitch.tv/?${params.toString()}`
  }

  // Reset loading state when channel changes
  useEffect(() => {
    if (channel) {
      setIsLoading(true)
      setError(null)
    }
  }, [channel])

  return (
    <Card className={`relative h-96 ${theme === "dark" ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}>
      <CardHeader className="flex flex-row items-center justify-between p-3 pb-2">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <div className="w-4 h-4 bg-purple-600 rounded-full flex items-center justify-center">
            <Play className="h-2 w-2 text-white fill-white" />
          </div>
          <span className={`font-medium truncate ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
            {channel ? `twitch.tv/${channel}` : widget.title}
          </span>
          {isLoading && (
            <RefreshCw className={`h-3 w-3 animate-spin ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`} />
          )}
        </div>
        <div className="flex items-center gap-1">
          {channel && (
            <>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleMute}
                className="h-6 w-6 rounded-full"
                title={isMuted ? "Unmute" : "Mute"}
              >
                {isMuted ? <VolumeX className="h-3 w-3" /> : <Volume2 className="h-3 w-3" />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={togglePlayPause}
                className="h-6 w-6 rounded-full"
                title={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={openInTwitch}
                className="h-6 w-6 rounded-full"
                title="Open in Twitch"
              >
                <ExternalLink className="h-3 w-3" />
              </Button>
            </>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsEditing(!isEditing)}
            className="h-6 w-6 rounded-full"
            title="Change channel"
          >
            <RefreshCw className="h-3 w-3" />
          </Button>
          <Button variant="ghost" size="icon" onClick={onRemove} className="h-6 w-6 rounded-full">
            <X className="h-3 w-3" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-3 pt-0 h-80">
        {isEditing && (
          <div className="mb-4 space-y-2">
            <Input
              value={channelInput}
              onChange={(e) => setChannelInput(e.target.value)}
              placeholder="Enter Twitch channel name (e.g., ninja, pokimane)"
              onKeyPress={(e) => e.key === "Enter" && handleChannelChange()}
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={handleChannelChange} className="flex-1">
                Load Channel
              </Button>
              <Button size="sm" variant="outline" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
            </div>
            {error && (
              <p className="text-sm text-red-500">{error}</p>
            )}
          </div>
        )}

        {!channel && !isEditing ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mb-4">
              <Play className="h-8 w-8 text-white fill-white" />
            </div>
            <h3 className={`text-lg font-semibold mb-2 ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
              Twitch Stream
            </h3>
            <p className={`text-sm mb-4 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
              Click the refresh button to set a Twitch channel
            </p>
            <Button onClick={() => setIsEditing(true)} size="sm">
              Set Channel
            </Button>
          </div>
        ) : error && !isEditing ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mb-4">
              <X className="h-8 w-8 text-white" />
            </div>
            <h3 className={`text-lg font-semibold mb-2 ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
              Stream Error
            </h3>
            <p className="text-sm text-red-500 mb-4">{error}</p>
            <Button onClick={() => setIsEditing(true)} size="sm" variant="outline">
              Try Different Channel
            </Button>
          </div>
        ) : channel && !isEditing ? (
          <div className="relative w-full h-full">
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded">
                <div className="text-center">
                  <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-purple-600" />
                  <p className={`text-sm ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
                    Loading stream...
                  </p>
                </div>
              </div>
            )}
            <iframe
              ref={iframeRef}
              src={getTwitchEmbedUrl()}
              className="w-full h-full rounded"
              frameBorder="0"
              scrolling="no"
              allowFullScreen
              onLoad={handleIframeLoad}
              onError={handleIframeError}
              title={`Twitch stream: ${channel}`}
            />
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}
