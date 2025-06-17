"use client"

import React, { useState, useEffect, useRef } from "react"
import { X, RefreshCw, ExternalLink, Rss, AlertCircle, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import type { Widget } from "../types/widget"

// RSS Parser types (since @types/rss-parser doesn't exist)
interface RSSItem {
  title?: string
  link?: string
  pubDate?: string
  creator?: string
  summary?: string
  content?: string
  contentSnippet?: string
  guid?: string
  categories?: string[]
  isoDate?: string
}

interface RSSFeed {
  title?: string
  description?: string
  link?: string
  items: RSSItem[]
  feedUrl?: string
  lastBuildDate?: string
}

interface RSSWidgetProps {
  widget: Widget
  onRemove: () => void
  theme: "light" | "dark"
}

export default function RSSWidget({ widget, onRemove, theme }: RSSWidgetProps) {
  const [feed, setFeed] = useState<RSSFeed | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const refreshTimerRef = useRef<NodeJS.Timeout | null>(null)

  const maxItems = widget.maxItems || 10
  const refreshInterval = widget.refreshInterval || 5 * 60 * 1000 // Default 5 minutes

  const parseFeed = async (feedUrl: string): Promise<RSSFeed> => {
    // Try multiple CORS proxies for better reliability
    const proxies = [
      `https://api.allorigins.win/get?url=${encodeURIComponent(feedUrl)}`,
      `https://corsproxy.io/?${encodeURIComponent(feedUrl)}`,
    ]
    
    let lastError: Error | null = null
    
    for (const proxyUrl of proxies) {
      try {
        const response = await fetch(proxyUrl)
        if (!response.ok) {
          throw new Error(`Failed to fetch feed: ${response.status} - ${response.statusText}`)
        }

        let feedText: string
        
        // Handle different proxy response formats
        if (proxyUrl.includes('allorigins.win')) {
          const data = await response.json()
          if (data.status && data.status.http_code !== 200) {
            throw new Error(`Feed server returned: ${data.status.http_code}`)
          }
          feedText = data.contents
        } else {
          feedText = await response.text()
        }

        if (!feedText) {
          throw new Error("Empty feed content received")
        }

        // Parse XML manually since we can't use rss-parser in browser directly
        const parser = new DOMParser()
        const xmlDoc = parser.parseFromString(feedText, "text/xml")

        // Check for parsing errors
        const parseError = xmlDoc.querySelector("parsererror")
        if (parseError) {
          throw new Error("Invalid RSS/XML format")
        }

        // Determine feed type (RSS or Atom)
        const isAtom = xmlDoc.querySelector("feed")
        const isRSS = xmlDoc.querySelector("rss") || xmlDoc.querySelector("channel")

        if (!isAtom && !isRSS) {
          throw new Error("Not a valid RSS or Atom feed")
        }

        let feedTitle = ""
        let feedDescription = ""
        let feedLink = ""
        const items: RSSItem[] = []

        if (isAtom) {
          // Parse Atom feed
          feedTitle = xmlDoc.querySelector("feed > title")?.textContent || "Atom Feed"
          feedDescription = xmlDoc.querySelector("feed > subtitle")?.textContent || ""
          feedLink = xmlDoc.querySelector("feed > link[rel='alternate']")?.getAttribute("href") || ""

          const entries = xmlDoc.querySelectorAll("entry")
          entries.forEach((entry, index) => {
            if (index >= maxItems) return

            const title = entry.querySelector("title")?.textContent || "Untitled"
            const link = entry.querySelector("link")?.getAttribute("href") || ""
            const pubDate = entry.querySelector("published, updated")?.textContent || ""
            const creator = entry.querySelector("author > name")?.textContent || ""
            const summary = entry.querySelector("summary, content")?.textContent || ""

            items.push({
              title,
              link,
              pubDate,
              creator,
              summary,
              contentSnippet: summary.substring(0, 200) + (summary.length > 200 ? "..." : ""),
              isoDate: pubDate
            })
          })
        } else {
          // Parse RSS feed
          feedTitle = xmlDoc.querySelector("channel > title, title")?.textContent || "RSS Feed"
          feedDescription = xmlDoc.querySelector("channel > description, description")?.textContent || ""
          feedLink = xmlDoc.querySelector("channel > link, link")?.textContent || ""

          const itemElements = xmlDoc.querySelectorAll("item")
          itemElements.forEach((item, index) => {
            if (index >= maxItems) return

            const title = item.querySelector("title")?.textContent || "Untitled"
            const link = item.querySelector("link")?.textContent || ""
            const pubDate = item.querySelector("pubDate, published")?.textContent || ""
            
            // Handle creator/author fields more safely
            let creator = ""
            const authorElement = item.querySelector("author")
            const creatorElement = item.querySelector("creator")
            // Handle Dublin Core creator with namespace
            const dcCreatorElement = item.querySelector('[tagName="dc:creator"], [nodeName="dc:creator"]') || 
                                     Array.from(item.querySelectorAll("*")).find(el => 
                                       el.tagName.toLowerCase().includes("creator") || 
                                       el.nodeName.toLowerCase().includes("creator")
                                     )
            
            if (authorElement) {
              creator = authorElement.textContent || ""
            } else if (creatorElement) {
              creator = creatorElement.textContent || ""
            } else if (dcCreatorElement) {
              creator = dcCreatorElement.textContent || ""
            }

            const description = item.querySelector("description, summary")?.textContent || ""

            items.push({
              title,
              link,
              pubDate,
              creator,
              summary: description,
              contentSnippet: description.substring(0, 200) + (description.length > 200 ? "..." : ""),
              isoDate: pubDate
            })
          })
        }

        return {
          title: feedTitle,
          description: feedDescription,
          link: feedLink,
          items
        }
        
      } catch (error) {
        lastError = error as Error
        console.warn(`Failed to fetch with proxy ${proxyUrl}:`, error)
        // Continue to try next proxy
      }
    }
    
    // If all proxies failed, throw the last error
    throw lastError || new Error("All feed proxies failed")
  }

  const fetchFeed = async () => {
    if (!widget.feedUrl && !widget.url) return

    setLoading(true)
    setError(null)

    try {
      const feedUrl = widget.feedUrl || widget.url
      const feedData = await parseFeed(feedUrl)
      setFeed(feedData)
      setLastUpdated(new Date())
    } catch (err) {
      let errorMessage = "Failed to load RSS feed"
      
      if (err instanceof Error) {
        if (err.message.includes("Failed to fetch feed: 400")) {
          errorMessage = "Feed not accessible (400 error). The feed may be private or the URL incorrect."
        } else if (err.message.includes("Failed to fetch feed: 404")) {
          errorMessage = "Feed not found (404 error). Please check the URL."
        } else if (err.message.includes("Failed to fetch feed: 403")) {
          errorMessage = "Feed access forbidden (403 error). The feed may require authentication."
        } else if (err.message.includes("CORS")) {
          errorMessage = "CORS error. The feed server doesn't allow cross-origin requests."
        } else if (err.message.includes("Invalid RSS/XML format")) {
          errorMessage = "Invalid feed format. Please check if the URL is a valid RSS/Atom feed."
        } else {
          errorMessage = err.message
        }
      }
      
      setError(errorMessage)
      console.error("RSS fetch error:", err)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString)
      const now = new Date()
      const diffMs = now.getTime() - date.getTime()
      const diffMins = Math.floor(diffMs / (1000 * 60))
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

      if (diffMins < 60) {
        return `${diffMins}m ago`
      } else if (diffHours < 24) {
        return `${diffHours}h ago`
      } else if (diffDays < 7) {
        return `${diffDays}d ago`
      } else {
        return date.toLocaleDateString()
      }
    } catch {
      return "Unknown"
    }
  }

  const openLink = (url: string) => {
    if (url) {
      window.open(url, "_blank", "noopener,noreferrer")
    }
  }

  // Initial fetch and setup auto-refresh
  useEffect(() => {
    fetchFeed()

    // Set up auto-refresh
    refreshTimerRef.current = setInterval(fetchFeed, refreshInterval)

    return () => {
      if (refreshTimerRef.current) {
        clearInterval(refreshTimerRef.current)
      }
    }
  }, [widget.url, widget.feedUrl, refreshInterval])

  return (
    <Card className={`relative h-96 overflow-hidden ${theme === "dark" ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}>
      <CardHeader className="flex flex-row items-center justify-between p-3 pb-2 flex-shrink-0">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <Rss className={`h-4 w-4 flex-shrink-0 ${theme === "dark" ? "text-orange-400" : "text-orange-600"}`} />
          <span className={`font-medium truncate ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
            {feed?.title || widget.title}
          </span>
          {loading && (
            <RefreshCw className={`h-3 w-3 animate-spin flex-shrink-0 ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`} />
          )}
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={fetchFeed}
            disabled={loading}
            className="h-6 w-6 rounded-full"
          >
            <RefreshCw className={`h-3 w-3 ${loading ? "animate-spin" : ""}`} />
          </Button>
          <Button variant="ghost" size="icon" onClick={onRemove} className="h-6 w-6 rounded-full">
            <X className="h-3 w-3" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-3 pt-0 h-full overflow-hidden flex flex-col">
        {error ? (
          <div className="flex flex-col items-center justify-center flex-1 text-center px-2">
            <AlertCircle className={`h-8 w-8 mb-2 ${theme === "dark" ? "text-red-400" : "text-red-500"}`} />
            <p className={`text-sm mb-2 ${theme === "dark" ? "text-red-400" : "text-red-600"}`}>
              Failed to load RSS feed
            </p>
            <p className={`text-xs mb-3 ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
              {error}
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchFeed}
              className="mt-1"
            >
              Try Again
            </Button>
          </div>
        ) : !feed || loading ? (
          <div className="flex items-center justify-center flex-1">
            <div className="text-center">
              <RefreshCw className={`h-6 w-6 animate-spin mx-auto mb-2 ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`} />
              <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                Loading RSS feed...
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col flex-1 min-h-0">
            <ScrollArea className="flex-1 -mr-3 pr-6">
              <div className="space-y-2 pr-2">
                {feed.items.slice(0, maxItems).map((item, index) => (
                  <div
                    key={item.guid || item.link || index}
                    className={`p-2 rounded-md border cursor-pointer transition-colors hover:bg-opacity-50 ${
                      theme === "dark"
                        ? "border-gray-600 hover:bg-gray-700"
                        : "border-gray-200 hover:bg-gray-50"
                    }`}
                    onClick={() => openLink(item.link || "")}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h4 className={`font-medium text-xs leading-tight line-clamp-2 ${
                        theme === "dark" ? "text-white" : "text-gray-900"
                      }`}>
                        {item.title}
                      </h4>
                      <ExternalLink className={`h-3 w-3 flex-shrink-0 mt-0.5 ${
                        theme === "dark" ? "text-gray-400" : "text-gray-500"
                      }`} />
                    </div>
                    
                    {item.contentSnippet && (
                      <p className={`text-xs mb-1 line-clamp-2 ${
                        theme === "dark" ? "text-gray-300" : "text-gray-600"
                      }`}>
                        {item.contentSnippet}
                      </p>
                    )}
                    
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1 min-w-0">
                        {item.creator && (
                          <span className={`truncate ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                            {item.creator}
                          </span>
                        )}
                        {item.creator && item.pubDate && (
                          <span className={`${theme === "dark" ? "text-gray-500" : "text-gray-400"}`}>•</span>
                        )}
                        {item.pubDate && (
                          <span className={`flex items-center gap-1 ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                            <Clock className="h-3 w-3 flex-shrink-0" />
                            <span className="truncate">{formatDate(item.pubDate)}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
            
            {lastUpdated && (
              <div className={`mt-2 pt-2 border-t text-xs text-center flex-shrink-0 ${
                theme === "dark" 
                  ? "border-gray-700 text-gray-400" 
                  : "border-gray-200 text-gray-500"
              }`}>
                Last updated: {lastUpdated.toLocaleTimeString()}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
