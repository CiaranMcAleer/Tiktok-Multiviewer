"use client"

import { useState } from "react"
import { X, RefreshCw, ExternalLink, Globe, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

interface WebsiteWidgetProps {
  title: string
  url: string
  onRemove: () => void
  theme: "light" | "dark"
}

export default function WebsiteWidget({ title, url, onRemove, theme }: WebsiteWidgetProps) {
  const [embedError, setEmbedError] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)
  const [showWarning, setShowWarning] = useState(true)

  const refreshContent = () => {
    setRefreshKey((prev) => prev + 1)
    setEmbedError(false)
    setShowWarning(false)
  }

  if (embedError) {
    return (
      <Card
        className={`relative h-96 ${theme === "dark" ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}
      >
        <CardHeader className="flex flex-row items-center justify-between p-3">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-2 h-2 rounded-full bg-red-500" />
            <span className="font-medium truncate">{title}</span>
          </div>
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={refreshContent}>
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => window.open(url, "_blank")}>
              <ExternalLink className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onRemove}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-4 h-80 flex flex-col items-center justify-center">
          <div className="text-center">
            <Globe className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p className="text-red-500 mb-2">Failed to load website</p>
            <p className="text-sm text-gray-500 mb-4">
              This website doesn't allow embedding due to security policies (X-Frame-Options or CSP)
            </p>
            <div className="space-y-2">
              <Button onClick={() => window.open(url, "_blank")} variant="outline">
                <ExternalLink className="h-4 w-4 mr-2" />
                Open in New Tab
              </Button>
              <Button onClick={refreshContent} variant="ghost" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={`relative h-96 ${theme === "dark" ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}>
      <CardHeader className="flex flex-row items-center justify-between p-3">
        <div className="flex items-center gap-2 min-w-0">
          <Globe className="h-4 w-4" />
          <span className="font-medium truncate">{title}</span>
        </div>
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={refreshContent}>
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => window.open(url, "_blank")}>
            <ExternalLink className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onRemove}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-0 h-80 relative">
        {showWarning && (
          <div className="absolute top-2 left-2 right-2 z-10 bg-yellow-100 dark:bg-yellow-900 border border-yellow-300 dark:border-yellow-700 rounded-md p-2">
            <div className="flex items-center gap-2 text-sm">
              <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
              <span className="text-yellow-800 dark:text-yellow-200">
                Some websites may not load due to security restrictions
              </span>
              <Button variant="ghost" size="sm" onClick={() => setShowWarning(false)} className="ml-auto h-6 w-6 p-0">
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
        )}
        <iframe
          key={refreshKey}
          src={url}
          className="w-full h-full border-0 rounded-b-lg"
          onError={() => setEmbedError(true)}
          onLoad={() => setShowWarning(false)}
          sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-top-navigation"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </CardContent>
    </Card>
  )
}
