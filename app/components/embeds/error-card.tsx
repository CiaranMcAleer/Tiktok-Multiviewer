import { X, RefreshCw, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import type { Widget } from "../../types/widget"

interface ErrorCardProps {
  widget: Widget
  theme: "light" | "dark"
  onRemove: () => void
  onRefresh: () => void
  onOpenPopup: () => void
}

export const ErrorCard = ({ widget, theme, onRemove, onRefresh, onOpenPopup }: ErrorCardProps) => {
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
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onRefresh} aria-label="Refresh content">
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => window.open(widget.url, "_blank")} aria-label="Open in new tab">
            <ExternalLink className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onRemove} aria-label="Remove widget">
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-4 h-80 flex flex-col items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-2">Failed to load content</p>
          <Button onClick={onOpenPopup} variant="outline">
            <ExternalLink className="h-4 w-4 mr-2" />
            Open in Popup
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
