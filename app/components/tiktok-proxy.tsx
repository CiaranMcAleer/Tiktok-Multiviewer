"use client"

import { useState, useEffect } from "react"

interface TikTokProxyProps {
  username: string
  onLoad: () => void
  onError: () => void
  theme: "light" | "dark"
}

export default function TikTokProxy({ username, onLoad, onError, theme }: TikTokProxyProps) {
  const [embedMethod, setEmbedMethod] = useState<"script" | "iframe" | "widget">("script")

  useEffect(() => {
    // Load TikTok embed script
    const script = document.createElement("script")
    script.src = "https://www.tiktok.com/embed.js"
    script.async = true
    script.onload = onLoad
    script.onerror = onError
    document.head.appendChild(script)

    return () => {
      document.head.removeChild(script)
    }
  }, [])

  const renderScriptEmbed = () => (
    <div className="w-full h-full flex items-center justify-center">
      <blockquote
        className="tiktok-embed"
        cite={`https://www.tiktok.com/@${username}`}
        data-unique-id={username}
        data-embed-type="creator"
        style={{ maxWidth: "100%", minWidth: "288px", margin: 0 }}
      >
        <section>
          <a
            target="_blank"
            title={`@${username}`}
            href={`https://www.tiktok.com/@${username}`}
            className={theme === "dark" ? "text-white" : "text-black"}
            rel="noreferrer"
          >
            @{username}
          </a>
        </section>
      </blockquote>
    </div>
  )

  const renderIframeEmbed = () => (
    <iframe
      src={`https://www.tiktok.com/@${username}/live`}
      className="w-full h-full border-0"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowFullScreen
      sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
    />
  )

  const renderWidgetEmbed = () => (
    <div className="w-full h-full">
      <div
        id={`tiktok-widget-${username}`}
        className="w-full h-full"
        data-mc-src={`https://www.tiktok.com/@${username}`}
      />
    </div>
  )

  switch (embedMethod) {
    case "script":
      return renderScriptEmbed()
    case "iframe":
      return renderIframeEmbed()
    case "widget":
      return renderWidgetEmbed()
    default:
      return renderScriptEmbed()
  }
}
