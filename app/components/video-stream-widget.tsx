"use client"

import { useState, useEffect, useRef } from "react"
import { X, RefreshCw, ExternalLink, Maximize2, Play } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import type { Widget } from "../types/widget"
import videojs from "video.js"
import "video.js/dist/video-js.css"

// Import the HTTP streaming plugin
import '@videojs/http-streaming'

// Dynamic import for DASH.js
let dashjs: any = null
if (typeof window !== 'undefined') {
  import('dashjs').then((dash) => {
    dashjs = dash.default || dash
    console.log('DASH.js loaded')
  })
}

interface VideoStreamWidgetProps {
  widget: Widget
  onRemove: () => void
  theme: "light" | "dark"
}

export default function VideoStreamWidget({ widget, onRemove, theme }: VideoStreamWidgetProps) {
  const videoRef = useRef<HTMLDivElement>(null)
  const nativeVideoRef = useRef<HTMLVideoElement>(null)
  const playerRef = useRef<any>(null)
  const dashPlayerRef = useRef<any>(null)
  const [isPlayerReady, setIsPlayerReady] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [useNativePlayer, setUseNativePlayer] = useState(false)
  const [useDashPlayer, setUseDashPlayer] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)
  const [errorMessage, setErrorMessage] = useState("")

  const getVideoJSType = (streamType?: string) => {
    switch (streamType) {
      case "hls":
        return "application/x-mpegURL"
      case "dash":
        return "application/dash+xml"
      case "mp4":
        return "video/mp4"
      default:
        // Auto-detect based on URL
        const url = widget.url.toLowerCase()
        if (url.includes(".m3u8") || url.includes("hls")) return "application/x-mpegURL"
        if (url.includes(".mpd") || url.includes("dash")) return "application/dash+xml"
        if (url.includes(".mp4")) return "video/mp4"
        if (url.includes(".webm")) return "video/webm"
        if (url.includes("youtube.com") || url.includes("youtu.be")) return "video/youtube"
        // Default to HLS for live streams
        return "application/x-mpegURL"
    }
  }

  useEffect(() => {
    // For DASH streams, try DASH.js first
    if (widget.streamType === "dash" && dashjs && nativeVideoRef.current && !useDashPlayer) {
      try {
        console.log("Initializing DASH.js for:", widget.url)
        const dashPlayer = dashjs.MediaPlayer().create()
        dashPlayerRef.current = dashPlayer
        
        dashPlayer.initialize(nativeVideoRef.current, widget.url, false)
        dashPlayer.on(dashjs.MediaPlayer.events.ERROR, (e: any) => {
          console.error("DASH.js error:", e)
          setUseDashPlayer(false)
          setHasError(true)
        })
        
        dashPlayer.on(dashjs.MediaPlayer.events.STREAM_INITIALIZED, () => {
          console.log("DASH stream initialized")
          setUseDashPlayer(true)
          setIsPlayerReady(true)
          setHasError(false)
        })
        
        return () => {
          if (dashPlayerRef.current) {
            dashPlayerRef.current.destroy()
            dashPlayerRef.current = null
          }
        }
      } catch (error) {
        console.error("Failed to initialize DASH.js:", error)
        setUseDashPlayer(false)
      }
    }
    
    // For HLS streams or fallback, use Video.js
    if (!useDashPlayer && !playerRef.current && videoRef.current) {
      // Create the video element
      const videoElement = document.createElement("video-js")
      videoElement.classList.add("vjs-default-skin")
      videoElement.setAttribute("controls", "true")
      videoElement.setAttribute("preload", "metadata")
      videoElement.setAttribute("crossorigin", "anonymous")
      videoElement.style.width = "100%"
      videoElement.style.height = "100%"
      
      videoRef.current.appendChild(videoElement)

      // Initialize Video.js player with better HLS/DASH support
      const player = (playerRef.current = videojs(
        videoElement,
        {
          controls: true,
          responsive: true,
          fluid: true,
          autoplay: false,
          preload: "metadata",
          liveui: true,
          crossOrigin: "anonymous",
          html5: {
            vhs: {
              overrideNative: !videojs.browser.IS_SAFARI,
              enableLowInitialPlaylist: true,
              smoothQualityChange: true,
              allowSeeksWithinUnsafeLiveWindow: true,
            },
            nativeVideoTracks: false,
            nativeAudioTracks: false,
            nativeTextTracks: false,
          },
          techOrder: ['html5'],
        },
        () => {
          setIsPlayerReady(true)
          console.log("Video.js player is ready")
          
          // Set source after player is ready
          if (widget.url) {
            player.src({
              src: widget.url,
              type: getVideoJSType(widget.streamType),
            })
          }
        }
      ))

      // Better error handling
      player.on("error", (e) => {
        const error = player.error()
        console.error("Video.js player error:", error)
        
        // Handle specific error codes
        if (error && error.code === 4) {
          setErrorMessage("Media format not supported. Trying native player...")
          console.log("Media format not supported, trying native player...")
          setUseNativePlayer(true)
        } else if (error && error.code === 2) {
          setErrorMessage("Network error or CORS issue. The stream may require special headers or proxy.")
          setHasError(true)
        } else if (error && error.code === 3) {
          setErrorMessage("Decoding error. The stream format may be corrupted.")
          setHasError(true)
        } else {
          setErrorMessage("Failed to load stream. Check URL and format.")
          setHasError(true)
        }
      })

      // Handle loading events
      player.on("loadstart", () => {
        console.log("Started loading stream")
        setHasError(false)
      })

      player.on("canplay", () => {
        console.log("Stream ready to play")
      })

      player.on("loadeddata", () => {
        console.log("Stream data loaded")
      })
    }

    return () => {
      if (playerRef.current && !playerRef.current.isDisposed()) {
        playerRef.current.dispose()
        playerRef.current = null
        setIsPlayerReady(false)
      }
      if (dashPlayerRef.current) {
        dashPlayerRef.current.destroy()
        dashPlayerRef.current = null
      }
    }
  }, [refreshKey, useDashPlayer])

  // Update source when widget URL changes
  useEffect(() => {
    if (useDashPlayer && dashPlayerRef.current && widget.url) {
      console.log("Loading DASH stream:", widget.url)
      dashPlayerRef.current.attachSource(widget.url)
    } else if (playerRef.current && isPlayerReady && widget.url) {
      console.log("Loading stream:", widget.url, "Type:", getVideoJSType(widget.streamType))
      
      // Try multiple loading approaches
      try {
        // First try with explicit type
        playerRef.current.src({
          src: widget.url,
          type: getVideoJSType(widget.streamType),
        })
      } catch (error) {
        console.log("Failed with type, trying without:", error)
        // Fallback: try without explicit type
        playerRef.current.src(widget.url)
      }
      
      setHasError(false)
    }
  }, [widget.url, widget.streamType, isPlayerReady, useDashPlayer])

  const refreshStream = () => {
    setRefreshKey((prev) => prev + 1)
    setHasError(false)
    setUseNativePlayer(false)
    setUseDashPlayer(false)
    setErrorMessage("")
  }

  const openInNewTab = () => {
    window.open(widget.url, "_blank")
  }

  if (hasError) {
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
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={refreshStream}>
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={openInNewTab}>
              <ExternalLink className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onRemove}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-4 h-80 flex flex-col items-center justify-center">
          <div className="text-center">
            <Play className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p className="text-red-500 mb-2">Failed to load stream</p>
            {errorMessage && (
              <p className="text-sm text-red-600 dark:text-red-400 mb-2 font-mono">
                {errorMessage}
              </p>
            )}
            <p className="text-sm text-gray-500 mb-4">
              The stream may be offline, the URL format is not supported, or CORS headers are blocking playback
            </p>
            <div className="text-xs text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 p-2 rounded mb-4">
              <strong>Common issues:</strong><br/>
              • CORS headers blocking cross-origin requests<br/>
              • Stream requires authentication or special headers<br/>
              • URL may not be a direct stream link<br/>
              • Stream may be offline or geo-restricted
            </div>
            <div className="text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 p-2 rounded mb-4">
              <strong>Test streams to try:</strong><br/>
              <code className="text-xs">https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8</code><br/>
              <code className="text-xs">https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8</code>
            </div>
            <div className="space-y-2">
              <Button onClick={refreshStream} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
              <Button onClick={openInNewTab} variant="ghost" size="sm">
                <ExternalLink className="h-4 w-4 mr-2" />
                Open in New Tab
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card
      className={`relative h-96 ${theme === "dark" ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}
    >
      <CardHeader className="flex flex-row items-center justify-between p-3">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-2 h-2 rounded-full bg-green-500" />
          <span className="font-medium truncate">{widget.title}</span>
          {widget.streamType && (
            <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded uppercase">
              {widget.streamType} {useDashPlayer ? "(DASH.js)" : useNativePlayer ? "(Native)" : "(Video.js)"}
            </span>
          )}
        </div>
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={refreshStream}>
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={openInNewTab}>
            <ExternalLink className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onRemove}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-0 h-80">
        {useDashPlayer ? (
          <video
            ref={nativeVideoRef}
            controls
            autoPlay={false}
            muted
            crossOrigin="anonymous"
            className="w-full h-full bg-black rounded-b-lg"
            style={{ minHeight: "320px" }}
            onError={() => setHasError(true)}
            onLoadStart={() => setHasError(false)}
          />
        ) : useNativePlayer ? (
          <video
            ref={nativeVideoRef}
            controls
            autoPlay={false}
            muted
            crossOrigin="anonymous"
            className="w-full h-full bg-black rounded-b-lg"
            style={{ minHeight: "320px" }}
            onError={(e) => {
              const target = e.target as HTMLVideoElement
              const error = target.error
              console.error("Native video error:", error)
              
              if (error) {
                switch (error.code) {
                  case 1:
                    setErrorMessage("Video loading was aborted")
                    break
                  case 2:
                    setErrorMessage("Network error or CORS issue")
                    break
                  case 3:
                    setErrorMessage("Video decoding error")
                    break
                  case 4:
                    setErrorMessage("Video format not supported")
                    break
                  default:
                    setErrorMessage("Unknown video error")
                }
              }
              setHasError(true)
            }}
            onLoadStart={() => setHasError(false)}
          >
            <source src={widget.url} type={getVideoJSType(widget.streamType)} />
            <p>Your browser does not support the video tag.</p>
          </video>
        ) : (
          <div
            ref={videoRef}
            className="w-full h-full bg-black rounded-b-lg"
            style={{ minHeight: "320px" }}
          />
        )}
      </CardContent>
    </Card>
  )
}
