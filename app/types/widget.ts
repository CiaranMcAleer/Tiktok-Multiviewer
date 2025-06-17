export type WidgetType = "tiktok" | "youtube" | "trafficcam" | "map" | "worldtime" | "website" | "notes" | "stream"

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
}

export interface LayoutData {
  widgets: Widget[]
  version: string
}
