"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import {
  Moon,
  Sun,
  Plus,
  Map,
  Trash2,
  Download,
  Share2,
  Youtube,
  Camera,
  Grid,
  RefreshCw,
  Clock,
  Globe,
  FileText,
  GripVertical,
  Play,
  Rss,
  CloudSun,
  Tv,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import StreamWidget from "./components/stream-widget"
import VideoStreamWidget from "./components/video-stream-widget"
import MapWidget from "./components/map-widget"
import WorldTimeWidget from "./components/world-time-widget"
import WebsiteWidget from "./components/website-widget"
import NotesWidget from "./components/notes-widget"
import RSSWidget from "./components/rss-widget"
import WeatherWidget from "./components/weather-widget"
import WeatherLocationSelector from "./components/weather-location-selector"
import TwitchWidget from "./components/twitch-widget"
import { ThemeProvider, useTheme } from "./components/theme-provider"
import type { Widget, LayoutData, WidgetType } from "./types/widget"
import PopupManager from "./utils/popup-manager"

function MultiviewerApp() {
  const [widgets, setWidgets] = useState<Widget[]>([])
  const [inputUrl, setInputUrl] = useState("")
  const [inputTitle, setInputTitle] = useState("")
  const [shareCode, setShareCode] = useState("")
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false)
  const [isLoadDialogOpen, setIsLoadDialogOpen] = useState(false)
  const [isGridDialogOpen, setIsGridDialogOpen] = useState(false)
  const [isWebsiteDialogOpen, setIsWebsiteDialogOpen] = useState(false)
  const [isNotesDialogOpen, setIsNotesDialogOpen] = useState(false)
  const [isRSSDialogOpen, setIsRSSDialogOpen] = useState(false)
  const [isWeatherDialogOpen, setIsWeatherDialogOpen] = useState(false)
  const [loadCode, setLoadCode] = useState("")
  const [websiteUrl, setWebsiteUrl] = useState("")
  const [websiteTitle, setWebsiteTitle] = useState("")
  const [notesTitle, setNotesTitle] = useState("")
  const [rssUrl, setRssUrl] = useState("")
  const [rssTitle, setRssTitle] = useState("")
  const [rssRefreshInterval, setRssRefreshInterval] = useState(5) // in minutes
  const [weatherLocation, setWeatherLocation] = useState("")
  const [weatherLatitude, setWeatherLatitude] = useState<number | null>(null)
  const [weatherLongitude, setWeatherLongitude] = useState<number | null>(null)
  const [currentHintIndex, setCurrentHintIndex] = useState(0)
  const [gridColumns, setGridColumns] = useState(2)
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)
  const { theme, toggleTheme } = useTheme()
  const popupManager = useRef<PopupManager>(PopupManager.getInstance())

  // Hints system - cycles through different helpful tips
  const hints = [ //TODO add more hints
    "Try @username for TikTok live streams",
    "Paste YouTube video URLs or video IDs",
    "For usernames: tw:ninja (Twitch), yt:creator (YouTube), @user (TikTok)",
    "Enter Twitch URLs (twitch.tv/username) or use tw:username prefix",
    "For streams: Use direct .m3u8 (HLS) or .mpd (DASH) URLs. CORS-enabled streams work best.",
    "For RSS: Try feeds like https://feeds.bbci.co.uk/news/rss.xml",
    "RSS feeds auto-refresh (adjustable from 5 seconds to 60 minutes)",
    "Weather widgets show current conditions and 3-day forecasts",
    "Weather data updates every 10 minutes automatically",
    "Twitch channels must be live to see content - supports playback controls",
    "Traffic cameras update every 20 seconds",
    "Use the + button for quick widgets like maps and notes",
    "Share your layout with the export button",
  ]

  // Cycle through hints every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentHintIndex((prev) => (prev + 1) % hints.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  // Load layout from URL parameter on initial load
  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search)
    const layoutParam = queryParams.get("layout")

    if (layoutParam) {
      try {
        loadLayoutFromBase64(layoutParam)
      } catch (e) {
        console.error("Failed to load layout from URL", e)
      }
    } else {
      // If no URL parameter, try to load from localStorage
      const savedWidgets = localStorage.getItem("multiviewer-widgets")
      if (savedWidgets) {
        try {
          setWidgets(JSON.parse(savedWidgets))
        } catch (e) {
          console.error("Failed to load saved widgets", e)
        }
      }
    }

    // Clean up on unmount
    return () => {
      popupManager.current.destroy()
    }
  }, [])

  // Save widgets to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("multiviewer-widgets", JSON.stringify(widgets))
  }, [widgets])

  // Update popup grid when grid settings change
  useEffect(() => {
    popupManager.current.setGrid(gridColumns)
  }, [gridColumns])

  const extractTikTokUsername = (url: string): string | null => {
    const patterns = [
      /tiktok\.com\/@([^/?#]+)/,
      /tiktok\.com\/([^/?@#]+)/,
      /vm\.tiktok\.com\/([^/?#]+)/,
      /vt\.tiktok\.com\/([^/?#]+)/,
      /m\.tiktok\.com\/@([^/?#]+)/,
      /@([^/?#\s]+)/, // Handle cases where user just enters @username
      /^([a-zA-Z0-9_.]+)$/, // Handle plain username
    ]

    // Clean the URL first
    const cleanUrl = url.trim()

    for (const pattern of patterns) {
      const match = cleanUrl.match(pattern)
      if (match) {
        // Return the captured group, removing any @ prefix
        return match[1].replace(/^@/, "")
      }
    }
    return null
  }

  const addWidget = (forceType?: WidgetType) => {
    if (widgets.length >= 30) {
      alert("Maximum 30 widgets allowed")
      return
    }

    let url = inputUrl.trim()
    let title = inputTitle.trim()
    let type: WidgetType = forceType || "trafficcam" // Default to traffic cam if no URL and no forced type
    let streamType: "hls" | "dash" | "mp4" | undefined = undefined

    // If forced type is map, create map regardless of URL
    if (forceType === "map") {
      type = "map"
      url = ""
      title = title || "Map"
    } else if (forceType === "worldtime") {
      type = "worldtime"
      url = ""
      title = title || "World Time"
    } else if (forceType === "notes") {
      type = "notes"
      url = ""
      title = title || "Notes"
    } else if (forceType === "rss") {
      type = "rss"
      url = ""
      title = title || "RSS Feed"
    } else if (forceType === "weather") {
      type = "weather"
      url = ""
      title = title || "Weather"
    } else if (forceType === "twitch") {
      type = "twitch"
      url = ""
      title = title || "Twitch Stream"
    } else if (url) {
      // Auto-detect content type based on URL
      if (url.includes("twitch.tv") || url.includes("twitch.com")) {
        type = "twitch"
        let channelName = url
        
        // Extract channel name from Twitch URL formats
        const match = url.match(/twitch\.(?:tv|com)\/([a-zA-Z0-9_]{4,25})/)
        if (match) {
          channelName = match[1]
        } else {
          alert("Please enter a valid Twitch channel URL")
          return
        }
        
        url = `https://twitch.tv/${channelName}`
        title = title || `twitch.tv/${channelName}`
      } else if (url.startsWith("twitch:") || url.startsWith("tw:")) {
        // Handle explicit Twitch prefixes: "twitch:username" or "tw:username"
        type = "twitch"
        const channelName = url.replace(/^(twitch:|tw:)/, "").replace(/^@?/, "")
        if (!/^[a-zA-Z0-9_]{4,25}$/.test(channelName)) {
          alert("Invalid Twitch channel name. Use 4-25 characters (letters, numbers, underscore)")
          return
        }
        
        url = `https://twitch.tv/${channelName}`
        title = title || `twitch.tv/${channelName}`
      } else if (url.includes("tiktok.com") || url.includes("@") || extractTikTokUsername(url)) {
        type = "tiktok"
        const username = extractTikTokUsername(url)
        if (!username) {
          alert("Please enter a valid TikTok username or URL")
          return
        }
        url = `https://www.tiktok.com/@${username}/live`
        title = title || username
      } else if (url.includes("youtube.com") || url.includes("youtu.be") || url.match(/^[a-zA-Z0-9_-]{11}$/)) {
        type = "youtube"
        if (!url.includes("youtube.com") && !url.includes("youtu.be")) {
          if (!url.match(/^[a-zA-Z0-9_-]{11}$/)) {
            alert("Please enter a valid YouTube URL or video ID")
            return
          }
          url = `https://www.youtube.com/watch?v=${url}`
        }
        title = title || "YouTube Video"
      } else if (url.startsWith("yt:") || url.startsWith("youtube:")) {
        // Handle explicit YouTube prefixes: "yt:channel" or "youtube:channel"
        type = "youtube"
        const channelName = url.replace(/^(yt:|youtube:)/, "").replace(/^@?/, "")
        url = `https://www.youtube.com/@${channelName}`
        title = title || `YouTube: ${channelName}`
      } else if (url.includes(".m3u8") || url.includes(".mpd") || url.includes("hls") || url.includes("dash") || url.includes("stream")) {
        type = "stream"
        // Detect stream type based on URL
        if (url.includes(".m3u8") || url.includes("hls")) {
          streamType = "hls"
        } else if (url.includes(".mpd") || url.includes("dash")) {
          streamType = "dash"
        } else if (url.includes(".mp4")) {
          streamType = "mp4"
        } else {
          streamType = "hls" // default
        }
        title = title || `${streamType.toUpperCase()} Stream`
      } else if (url.includes(".xml") || url.includes(".rss") || url.includes("rss") || url.includes("feed") || url.includes("atom")) {
        type = "rss"
        title = title || "RSS Feed"
      } else if (url.includes("trafficwatchni.com") || url.includes("traffic")) {
        type = "trafficcam"
        title = title || "Traffic Camera"
      } else if (/^[a-zA-Z0-9_]{4,25}$/.test(url.replace(/^@?/, ""))) {
        // Handle ambiguous usernames - show options to user
        const cleanUsername = url.replace(/^@?/, "")
        const confirmed = confirm(
          `"${cleanUsername}" could be a username for multiple services.\n\n` +
          `Click OK to treat as TikTok (@${cleanUsername})\n` +
          `Click Cancel to specify the service.\n\n` +
          `For other services, use prefixes:\n` +
          `• tw:${cleanUsername} for Twitch\n` +
          `• yt:${cleanUsername} for YouTube`
        )
        
        if (confirmed) {
          // Default to TikTok for @username pattern
          type = "tiktok"
          url = `https://www.tiktok.com/@${cleanUsername}/live`
          title = title || cleanUsername
        } else {
          alert(
            `To specify the service, use these prefixes:\n\n` +
            `• tw:${cleanUsername} or twitch:${cleanUsername} for Twitch\n` +
            `• yt:${cleanUsername} or youtube:${cleanUsername} for YouTube\n` +
            `• @${cleanUsername} for TikTok (or just use TikTok URL)\n\n` +
            `Or paste the full URL from the service.`
          )
          return
        }
      } else {
        // If URL doesn't match known patterns, treat as traffic cam
        type = "trafficcam"
        title = title || "Camera Feed"
      }
    } else if (!forceType) {
      alert("Please enter a URL or use the dropdown to add other widgets")
      return
    }

    const newWidget: Widget = {
      id: Date.now().toString(),
      type,
      url,
      title,
      refreshInterval: type === "trafficcam" ? 20000 : type === "rss" ? 5 * 60 * 1000 : undefined, // 20 seconds for traffic cam, 5 minutes for RSS
      city: type === "worldtime" ? "Belfast" : undefined,
      timezone: type === "worldtime" ? "Europe/London" : undefined,
      content: type === "notes" ? "" : undefined,
      streamType: type === "stream" ? streamType : undefined,
      feedUrl: type === "rss" ? url : undefined,
      maxItems: type === "rss" ? 10 : undefined,
      twitchChannel: type === "twitch" ? url.split('/').pop() : undefined,
    }

    setWidgets([...widgets, newWidget])
    setInputUrl("")
    setInputTitle("")
  }

  const addWebsiteWidget = () => {
    if (widgets.length >= 10) {
      alert("Maximum 10 widgets allowed")
      return
    }

    if (!websiteUrl.trim()) {
      alert("Please enter a website URL")
      return
    }

    let url = websiteUrl.trim()
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      url = "https://" + url
    }

    const newWidget: Widget = {
      id: Date.now().toString(),
      type: "website",
      url,
      title: websiteTitle.trim() || new URL(url).hostname,
    }

    setWidgets([...widgets, newWidget])
    setWebsiteUrl("")
    setWebsiteTitle("")
    setIsWebsiteDialogOpen(false)
  }

  const addNotesWidget = () => {
    if (widgets.length >= 10) {
      alert("Maximum 10 widgets allowed")
      return
    }

    const newWidget: Widget = {
      id: Date.now().toString(),
      type: "notes",
      url: "",
      title: notesTitle.trim() || "Notes",
      content: "",
    }

    setWidgets([...widgets, newWidget])
    setNotesTitle("")
    setIsNotesDialogOpen(false)
  }

  const addRSSWidget = () => {
    if (widgets.length >= 10) {
      alert("Maximum 10 widgets allowed")
      return
    }

    if (!rssUrl.trim()) {
      alert("Please enter an RSS feed URL")
      return
    }

    const refreshIntervalMs = rssRefreshInterval === 0 ? 5000 : rssRefreshInterval * 60 * 1000 // 0 = realtime (5 sec), otherwise minutes

    const newWidget: Widget = {
      id: Date.now().toString(),
      type: "rss",
      url: rssUrl.trim(),
      title: rssTitle.trim() || "RSS Feed",
      feedUrl: rssUrl.trim(),
      refreshInterval: refreshIntervalMs,
      maxItems: 10,
    }

    setWidgets([...widgets, newWidget])
    setRssUrl("")
    setRssTitle("")
    setRssRefreshInterval(5) // Reset to default
    setIsRSSDialogOpen(false)
  }

  const addWeatherWidget = () => {
    if (widgets.length >= 10) {
      alert("Maximum 10 widgets allowed")
      return
    }
    
    if (!weatherLocation || weatherLatitude === null || weatherLongitude === null) {
      alert("Please select a location")
      return
    }
    
    const newWidget: Widget = {
      id: Date.now().toString(),
      type: "weather",
      url: "",
      title: weatherLocation, // Use location as title
      location: weatherLocation,
      latitude: weatherLatitude,
      longitude: weatherLongitude,
    }
    setWidgets([...widgets, newWidget])
    setWeatherLocation("")
    setWeatherLatitude(null)
    setWeatherLongitude(null)
    setIsWeatherDialogOpen(false)
  }

  const updateWorldTimeWidget = (id: string, city: string, timezone: string) => {
    setWidgets(widgets.map((w) => (w.id === id ? { ...w, city, timezone, title: `${city} Time` } : w)))
  }

  const updateNotesWidget = (id: string, content: string) => {
    setWidgets(widgets.map((w) => (w.id === id ? { ...w, content } : w)))
  }

  const updateWeatherWidget = (id: string, location: string, latitude: number, longitude: number) => {
    setWidgets(widgets.map(w => 
      w.id === id 
        ? { ...w, location, latitude, longitude }
        : w
    ))
  }

  const removeWidget = (id: string) => {
    setWidgets(widgets.filter(w => w.id !== id))
  }

  const updateTwitchWidget = (id: string, channel: string) => {
    setWidgets(widgets.map(w => 
      w.id === id 
        ? { ...w, twitchChannel: channel, url: `https://twitch.tv/${channel}` }
        : w
    ))
  }

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index)
    e.dataTransfer.effectAllowed = "move"
    e.dataTransfer.setData("text/html", "")
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
    setDragOverIndex(index)
  }

  const handleDragLeave = () => {
    setDragOverIndex(null)
  }

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault()

    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null)
      setDragOverIndex(null)
      return
    }

    const newWidgets = [...widgets]
    const draggedWidget = newWidgets[draggedIndex]

    // Remove the dragged widget
    newWidgets.splice(draggedIndex, 1)

    // Insert at the new position
    const insertIndex = draggedIndex < dropIndex ? dropIndex - 1 : dropIndex
    newWidgets.splice(insertIndex, 0, draggedWidget)

    setWidgets(newWidgets)
    setDraggedIndex(null)
    setDragOverIndex(null)
  }

  const handleDragEnd = () => {
    setDraggedIndex(null)
    setDragOverIndex(null)
  }

  const clearAllWidgets = () => {
    if (confirm("Are you sure you want to remove all widgets?")) {
      // Close all popups
      popupManager.current.closeAll()

      // Clear widgets
      setWidgets([])
    }
  }

  const refreshAllWidgets = () => {
    // Close all popups and reopen them
    const openPopups = popupManager.current.getOpenPopups()
    popupManager.current.closeAll()

    // Set a small timeout to allow windows to close
    setTimeout(() => {
      // Reopen popups that were open
      openPopups.forEach((id) => {
        const widget = widgets.find((w) => w.id === id)
        if (widget) {
          popupManager.current.openPopup(
            widget.id,
            widget.type === "trafficcam"
              ? `${widget.url}${widget.url.includes("?") ? "&" : "?"}t=${Date.now()}`
              : widget.url,
            widget.title,
            widget.type,
          )
        }
      })
    }, 500)
  }

  // Convert layout to base64
  const layoutToBase64 = (): string => {
    const layoutData: LayoutData = {
      widgets,
      version: "1.0",
    }

    return btoa(JSON.stringify(layoutData))
  }

  // Load layout from base64
  const loadLayoutFromBase64 = (base64: string): boolean => {
    try {
      const layoutData: LayoutData = JSON.parse(atob(base64))

      if (layoutData.widgets && Array.isArray(layoutData.widgets)) {
        // Close all existing popups
        popupManager.current.closeAll()

        // Set new widgets
        setWidgets(layoutData.widgets)
        return true
      }
      return false
    } catch (e) {
      console.error("Failed to parse layout data", e)
      return false
    }
  }

  const shareLayout = () => {
    const base64Layout = layoutToBase64()

    // Create shareable URL
    const shareableUrl = `${window.location.origin}${window.location.pathname}?layout=${base64Layout}`
    setShareCode(shareableUrl)
    setIsShareDialogOpen(true)
  }

  const loadLayout = () => {
    if (!loadCode.trim()) {
      alert("Please enter a layout code")
      return
    }

    // Extract just the base64 part if a full URL was pasted
    let base64Code = loadCode.trim()
    if (base64Code.includes("?layout=")) {
      base64Code = base64Code.split("?layout=")[1].split("&")[0]
    }

    const success = loadLayoutFromBase64(base64Code)
    if (success) {
      setIsLoadDialogOpen(false)
      setLoadCode("")
    } else {
      alert("Invalid layout code")
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard
      .writeText(shareCode)
      .then(() => alert("Copied to clipboard!"))
      .catch((err) => console.error("Failed to copy: ", err))
  }

  const getGridCols = (count: number): string => {
    if (count === 1) return "grid-cols-1"
    if (count === 2) return "grid-cols-2"
    if (count <= 4) return "grid-cols-2"
    if (count <= 6) return "grid-cols-3"
    if (count <= 9) return "grid-cols-3"
    return "grid-cols-4"
  }

  const updateGridSettings = () => {
    popupManager.current.setGrid(gridColumns)
    setIsGridDialogOpen(false)
  }

  return (
    <div
      className={`min-h-screen transition-colors duration-200 ${
        theme === "dark" ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900"
      }`}
    >
      {/* Header */}
      <div
        className={`border-b transition-colors duration-200 ${
          theme === "dark" ? "border-gray-700 bg-gray-800" : "border-gray-200 bg-white"
        }`}
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Multiviewer</h1>
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <Plus className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => addWidget("worldtime")}>
                    <Clock className="h-4 w-4 mr-2" />
                    World Time
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setIsWebsiteDialogOpen(true)}>
                    <Globe className="h-4 w-4 mr-2" />
                    Website Embed
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setIsNotesDialogOpen(true)}>
                    <FileText className="h-4 w-4 mr-2" />
                    Notes
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setIsRSSDialogOpen(true)}>
                    <Rss className="h-4 w-4 mr-2" />
                    RSS Feed
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setIsWeatherDialogOpen(true)}>
                    <CloudSun className="h-4 w-4 mr-2" />
                    Weather
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button variant="ghost" size="icon" onClick={toggleTheme} className="rounded-full">
                {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>
            </div>
          </div>

          {/* Controls */}
          <div className="flex gap-2 mb-2">
            <Input
              placeholder="YouTube, TikTok, Twitch URLs or tw:ninja, yt:creator, @user"
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && addWidget()}
              className={`flex-1 ${theme === "dark" ? "bg-gray-700 border-gray-600" : ""}`}
            />

            <Input
              placeholder="Title (optional)"
              value={inputTitle}
              onChange={(e) => setInputTitle(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && addWidget()}
              className={`max-w-[200px] ${theme === "dark" ? "bg-gray-700 border-gray-600" : ""}`}
            />

            <Button onClick={() => addWidget()} disabled={widgets.length >= 10}>
              <Plus className="h-4 w-4 mr-2" />
              Add Stream
            </Button>

            <Button
              onClick={() => addWidget("map")}
              disabled={widgets.length >= 10}
              variant="outline"
              className={theme === "dark" ? "text-white border-gray-600 bg-gray-800 hover:bg-gray-700" : ""}
            >
              <Map className="h-4 w-4 mr-2" />
              Add Map
            </Button>
          </div>

          <div className="flex justify-between items-center mt-2">
            <div className="text-sm text-gray-500">
              {widgets.length}/10 widgets •
              {widgets.filter((w) => w.type === "tiktok").length > 0 &&
                ` ${widgets.filter((w) => w.type === "tiktok").length} TikTok •`}
              {widgets.filter((w) => w.type === "youtube").length > 0 &&
                ` ${widgets.filter((w) => w.type === "youtube").length} YouTube •`}
              {widgets.filter((w) => w.type === "stream").length > 0 &&
                ` ${widgets.filter((w) => w.type === "stream").length} Streams •`}
              {widgets.filter((w) => w.type === "trafficcam").length > 0 &&
                ` ${widgets.filter((w) => w.type === "trafficcam").length} Cameras •`}
              {widgets.filter((w) => w.type === "map").length > 0 &&
                ` ${widgets.filter((w) => w.type === "map").length} Maps •`}
              {widgets.filter((w) => w.type === "worldtime").length > 0 &&
                ` ${widgets.filter((w) => w.type === "worldtime").length} Clocks •`}
              {widgets.filter((w) => w.type === "website").length > 0 &&
                ` ${widgets.filter((w) => w.type === "website").length} Websites •`}
              {widgets.filter((w) => w.type === "notes").length > 0 &&
                ` ${widgets.filter((w) => w.type === "notes").length} Notes •`}
              {widgets.filter((w) => w.type === "rss").length > 0 &&
                ` ${widgets.filter((w) => w.type === "rss").length} RSS •`}
              {widgets.filter((w) => w.type === "weather").length > 0 &&
                ` ${widgets.filter((w) => w.type === "weather").length} Weather •`}
              {widgets.filter((w) => w.type === "twitch").length > 0 &&
                ` ${widgets.filter((w) => w.type === "twitch").length} Twitch`}
            </div>

            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={refreshAllWidgets}>
                <RefreshCw className="h-4 w-4 mr-1" />
                Refresh All
              </Button>

              <Dialog open={isGridDialogOpen} onOpenChange={setIsGridDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <Grid className="h-4 w-4 mr-1" />
                    Grid Settings
                  </Button>
                </DialogTrigger>
                <DialogContent className="z-[9999]">
                  <DialogHeader>
                    <DialogTitle>Popup Grid Settings</DialogTitle>
                  </DialogHeader>
                  <div className="mt-4 space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Columns</label>
                      <Select
                        value={gridColumns.toString()}
                        onValueChange={(value) => setGridColumns(Number.parseInt(value))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select columns" />
                        </SelectTrigger>
                        <SelectContent className="z-[10000]">
                          <SelectItem value="1">1 Column</SelectItem>
                          <SelectItem value="2">2 Columns</SelectItem>
                          <SelectItem value="3">3 Columns</SelectItem>
                          <SelectItem value="4">4 Columns</SelectItem>
                          <SelectItem value="5">5 Columns</SelectItem>
                          <SelectItem value="6">6 Columns</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="text-sm text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md">
                      <strong>Note:</strong> Rows are automatically calculated based on the number of popups and columns. 
                      This ensures all popups are properly positioned without overlap.
                    </div>
                    <Button onClick={updateGridSettings} className="w-full">
                      Apply Grid Settings
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              <Dialog open={isShareDialogOpen} onOpenChange={setIsShareDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="sm" onClick={shareLayout} disabled={widgets.length === 0}>
                    <Share2 className="h-4 w-4 mr-1" />
                    Share Layout
                  </Button>
                </DialogTrigger>
                <DialogContent className="z-[9999]">
                  <DialogHeader>
                    <DialogTitle>Share Layout</DialogTitle>
                  </DialogHeader>
                  <div className="mt-4">
                    <p className="text-sm mb-2">Copy this URL to share your layout:</p>
                    <div className="flex gap-2">
                      <Input value={shareCode} readOnly className="font-mono text-xs" />
                      <Button onClick={copyToClipboard}>Copy</Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              <Dialog open={isLoadDialogOpen} onOpenChange={setIsLoadDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <Download className="h-4 w-4 mr-1" />
                    Load Layout
                  </Button>
                </DialogTrigger>
                <DialogContent className="z-[9999]">
                  <DialogHeader>
                    <DialogTitle>Load Layout</DialogTitle>
                  </DialogHeader>
                  <div className="mt-4">
                    <p className="text-sm mb-2">Paste a layout code or URL:</p>
                    <div className="flex gap-2">
                      <Input
                        value={loadCode}
                        onChange={(e) => setLoadCode(e.target.value)}
                        placeholder="Paste layout code or URL here"
                        className="font-mono text-xs"
                      />
                      <Button onClick={loadLayout}>Load</Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              <Dialog open={isWebsiteDialogOpen} onOpenChange={setIsWebsiteDialogOpen}>
                <DialogTrigger asChild>
                  <Button style={{ display: "none" }}>Website Dialog</Button>
                </DialogTrigger>
                <DialogContent className="z-[9999]">
                  <DialogHeader>
                    <DialogTitle>Add Website Embed</DialogTitle>
                  </DialogHeader>
                  <div className="mt-4 space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Website URL</label>
                      <Input
                        value={websiteUrl}
                        onChange={(e) => setWebsiteUrl(e.target.value)}
                        placeholder="https://example.com"
                        onKeyPress={(e) => e.key === "Enter" && addWebsiteWidget()}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Title (optional)</label>
                      <Input
                        value={websiteTitle}
                        onChange={(e) => setWebsiteTitle(e.target.value)}
                        placeholder="Website name"
                        onKeyPress={(e) => e.key === "Enter" && addWebsiteWidget()}
                      />
                    </div>
                    <div className="text-sm text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-md">
                      <strong>Note:</strong> Many websites block embedding for security reasons. If a site doesn't load,
                      use the "Open in New Tab" option instead.
                    </div>
                    <Button onClick={addWebsiteWidget} className="w-full">
                      Add Website
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              <Dialog open={isNotesDialogOpen} onOpenChange={setIsNotesDialogOpen}>
                <DialogTrigger asChild>
                  <Button style={{ display: "none" }}>Notes Dialog</Button>
                </DialogTrigger>
                <DialogContent className="z-[9999]">
                  <DialogHeader>
                    <DialogTitle>Add Notes Widget</DialogTitle>
                  </DialogHeader>
                  <div className="mt-4 space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Notes Title</label>
                      <Input
                        value={notesTitle}
                        onChange={(e) => setNotesTitle(e.target.value)}
                        placeholder="My Notes"
                        onKeyPress={(e) => e.key === "Enter" && addNotesWidget()}
                      />
                    </div>
                    <div className="text-sm text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md">
                      <strong>Note:</strong> Your notes will be saved in the shareable layout URL, making it easy to
                      share important information with others.
                    </div>
                    <Button onClick={addNotesWidget} className="w-full">
                      Add Notes
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              <Dialog open={isRSSDialogOpen} onOpenChange={setIsRSSDialogOpen}>
                <DialogTrigger asChild>
                  <Button style={{ display: "none" }}>RSS Dialog</Button>
                </DialogTrigger>
                <DialogContent className="z-[9999]">
                  <DialogHeader>
                    <DialogTitle>Add RSS Feed Widget</DialogTitle>
                  </DialogHeader>
                  <div className="mt-4 space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Feed URL</label>
                      <Input
                        value={rssUrl}
                        onChange={(e) => setRssUrl(e.target.value)}
                        placeholder="https://example.com/feed.xml"
                        onKeyPress={(e) => e.key === "Enter" && addRSSWidget()}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Feed Title (optional)</label>
                      <Input
                        value={rssTitle}
                        onChange={(e) => setRssTitle(e.target.value)}
                        placeholder="My RSS Feed"
                        onKeyPress={(e) => e.key === "Enter" && addRSSWidget()}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Refresh Interval</label>
                      <Select value={rssRefreshInterval.toString()} onValueChange={(value) => setRssRefreshInterval(Number(value))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="z-[10000]">
                          <SelectItem value="0">Realtime (5 seconds)</SelectItem>
                          <SelectItem value="1">1 minute</SelectItem>
                          <SelectItem value="2">2 minutes</SelectItem>
                          <SelectItem value="5">5 minutes</SelectItem>
                          <SelectItem value="10">10 minutes</SelectItem>
                          <SelectItem value="15">15 minutes</SelectItem>
                          <SelectItem value="30">30 minutes</SelectItem>
                          <SelectItem value="60">60 minutes</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="text-sm text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 p-3 rounded-md">
                      <strong>Tip:</strong> Supports RSS, Atom, and XML feeds. Choose refresh rate based on feed update frequency.
                    </div>
                    <Button onClick={addRSSWidget} className="w-full">
                      Add RSS Feed
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              <Dialog open={isWeatherDialogOpen} onOpenChange={setIsWeatherDialogOpen}>
                <DialogContent className="z-[9999]">
                  <DialogHeader>
                    <DialogTitle>Add Weather Widget</DialogTitle>
                  </DialogHeader>
                  <div className="mt-4 space-y-4">
                    <WeatherLocationSelector
                      onLocationSelect={(location, latitude, longitude) => {
                        setWeatherLocation(location)
                        setWeatherLatitude(latitude)
                        setWeatherLongitude(longitude)
                      }}
                    />
                    <Button 
                      onClick={addWeatherWidget} 
                      className="w-full"
                      disabled={!weatherLocation}
                    >
                      Add Weather Widget
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              <Button variant="ghost" size="sm" onClick={clearAllWidgets} disabled={widgets.length === 0}>
                <Trash2 className="h-4 w-4 mr-1" />
                Clear All
              </Button>
            </div>
          </div>

          {/* Cycling Hint */}
          <div className={`text-center py-2 transition-opacity duration-500 ${
            theme === "dark" ? "text-gray-400" : "text-gray-600"
          }`}>
            <div className="text-sm">
              💡 <span className="italic">{hints[currentHintIndex]}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Widgets Grid */}
      <div className="container mx-auto px-4 py-6">
        {widgets.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-gray-400 mb-4">
              <div className="flex justify-center gap-8 mb-6">
                <Plus className="h-16 w-16 opacity-50" />
                <Youtube className="h-16 w-16 opacity-50" />
                <Play className="h-16 w-16 opacity-50" />
                <Camera className="h-16 w-16 opacity-50" />
                <Map className="h-16 w-16 opacity-50" />
              </div>
              <p className="text-lg">No content added yet</p>
              <p className="text-sm">Add TikTok, YouTube, HLS/DASH streams, traffic cameras, maps, or other widgets to get started</p>
            </div>
          </div>
        ) : (
          <div className={`grid gap-4 ${getGridCols(widgets.length)}`}>
            {widgets.map((widget, index) => (
              <div
                key={widget.id}
                className={`relative group cursor-move ${draggedIndex === index ? "opacity-50" : ""} ${
                  dragOverIndex === index ? "ring-2 ring-blue-500 ring-offset-2" : ""
                }`}
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, index)}
                onDragEnd={handleDragEnd}
              >
                {/* Drag Handle */}
                <div className="absolute top-2 left-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="bg-black bg-opacity-50 text-white p-1 rounded cursor-move">
                    <GripVertical className="h-4 w-4" />
                  </div>
                </div>

                {widget.type === "map" ? (
                  <MapWidget title={widget.title} onRemove={() => removeWidget(widget.id)} theme={theme} />
                ) : widget.type === "worldtime" ? (
                  <WorldTimeWidget
                    title={widget.title}
                    city={widget.city || "Belfast"}
                    timezone={widget.timezone || "Europe/London"}
                    onRemove={() => removeWidget(widget.id)}
                    onCityChange={(city, timezone) => updateWorldTimeWidget(widget.id, city, timezone)}
                    theme={theme}
                  />
                ) : widget.type === "website" ? (
                  <WebsiteWidget
                    title={widget.title}
                    url={widget.url}
                    onRemove={() => removeWidget(widget.id)}
                    theme={theme}
                  />
                ) : widget.type === "notes" ? (
                  <NotesWidget
                    title={widget.title}
                    content={widget.content || ""}
                    onRemove={() => removeWidget(widget.id)}
                    onContentChange={(content) => updateNotesWidget(widget.id, content)}
                    theme={theme}
                  />
                ) : widget.type === "stream" ? (
                  <VideoStreamWidget
                    widget={widget}
                    onRemove={() => removeWidget(widget.id)}
                    theme={theme}
                  />
                ) : widget.type === "rss" ? (
                  <RSSWidget
                    widget={widget}
                    onRemove={() => removeWidget(widget.id)}
                    theme={theme}
                  />
                ) : widget.type === "weather" ? (
                  <WeatherWidget
                    widget={widget}
                    onRemove={() => removeWidget(widget.id)}
                    onLocationChange={(location, latitude, longitude) => {
                      // Update widget location/coords
                      setWidgets((prev) => prev.map((w) =>
                        w.id === widget.id ? { ...w, location, latitude, longitude } : w
                      ))
                    }}
                    theme={theme}
                  />
                ) : widget.type === "twitch" ? (
                  <TwitchWidget
                    widget={widget}
                    onRemove={() => removeWidget(widget.id)}
                    onChannelChange={(channel) => updateTwitchWidget(widget.id, channel)}
                    theme={theme}
                  />
                ) : (
                  <StreamWidget widget={widget} onRemove={() => removeWidget(widget.id)} theme={theme} />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default function Page() {
  return (
    <ThemeProvider>
      <MultiviewerApp />
    </ThemeProvider>
  )
}
