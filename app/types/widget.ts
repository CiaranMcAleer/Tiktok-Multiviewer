export type WidgetType = "tiktok" | "youtube" | "trafficcam" | "map" | "worldtime" | "website" | "notes" | "stream" | "rss"

export interface Widget {
  id: string
  type: WidgetType
  url: string
  title: string
  refreshInterval?: number // For traffic cams that need refreshing
  timezone?: string // For world time widgets
  city?: string // For world time widgets
  content?: string // For notes widgets
  streamType?: "hls" | "dash" | "mp4" // For stream widgets
  feedUrl?: string // For RSS widgets
  maxItems?: number // For RSS widgets - max items to display
}

export interface LayoutData {
  widgets: Widget[]
  version: string
}
