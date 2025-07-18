import { useEffect, useRef } from "react"
import { Maximize2 } from "lucide-react"
import { Button } from "@/components/ui/button"

interface TikTokEmbedProps {
  url: string
  title: string
  theme: "light" | "dark"
  onOpenPopup: () => void
}

export const TikTokEmbed = ({ url, title, theme, onOpenPopup }: TikTokEmbedProps) => {
  const iframelyLoadedRef = useRef(false)

  // Load Iframely script for TikTok
  useEffect(() => {
    if (!iframelyLoadedRef.current) {
      const script = document.createElement("script")
      script.src = "//iframely.net/embed.js"
      script.async = true
      document.head.appendChild(script)
      iframelyLoadedRef.current = true

      return () => {
        if (document.head.contains(script)) {
          document.head.removeChild(script)
        }
      }
    }
  }, [])

  const username = url.match(/@([^/]+)/)?.[1] || title

  return (
    <div
      className={`w-full h-full flex flex-col items-center justify-center p-4 ${
        theme === "dark" ? "bg-gray-800" : "bg-white"
      }`}
    >
      <div className="w-full max-w-sm">
        <div
          className="iframely-embed"
          style={{
            filter: theme === "dark" ? "invert(1) hue-rotate(180deg)" : "none",
            borderRadius: "8px",
            overflow: "hidden",
          }}
          dangerouslySetInnerHTML={{
            __html: `
              <div class="iframely-responsive" style="height: 280px; padding-bottom: 0;">
                <a href="${url}" data-iframely-url="//iframely.net/koAWje4h?card=small"></a>
              </div>
            `,
          }}
        />
      </div>
      <div className="mt-4 text-center">
        <Button onClick={onOpenPopup} variant="outline" size="sm">
          <Maximize2 className="h-4 w-4 mr-2" />
          Open Full Stream
        </Button>
      </div>
    </div>
  )
}
