import React, { useState, useMemo } from "react"
import { useTheme } from "./theme-provider"
import { Button } from "@/components/ui/button"


interface Camera {
  name: string
  viewerUrl: string
  imageUrl: string
}

interface Props {
  onSelect: (camera: Camera, refreshInterval: number) => void
  onClose: () => void
  onAddAll?: (cameras: Camera[], refreshInterval: number) => void
}

export default function TwniCameraSelector({ onSelect, onClose, onAddAll }: Props) {
  const { theme } = useTheme()
  const [search, setSearch] = useState("")
  const [refresh, setRefresh] = useState(5)
  const [cameras, setCameras] = useState<Camera[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch camera data from static JSON
  React.useEffect(() => {
    setLoading(true)
    fetch("/twni-cameras.json")
      .then(res => {
        if (!res.ok) throw new Error("Failed to load camera data")
        return res.json()
      })
      .then(data => {
        setCameras(data)
        setLoading(false)
      })
      .catch(e => {
        setError("Could not load camera data")
        setLoading(false)
      })
  }, [])

  const filtered = useMemo(() => {
    // Extract ID from viewerUrl for search functionality
    const extractId = (url: string) => {
      const match = url.match(/id=(\d+)/)
      return match ? match[1] : ''
    }
    
    return cameras.filter(c =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      extractId(c.viewerUrl).includes(search)
    )
  }, [search, cameras])

  // Since we don't have regions anymore, no need for duplicate ID detection

  // Theme-based classes for panel and input
  const bgPanel = theme === "dark" ? "bg-gray-800 text-white border-gray-700" : "bg-white text-black border-gray-200"
  const bgInput = theme === "dark" ? "bg-gray-700 text-white border-gray-600" : "bg-white text-black border-gray-300"
  const bgList = theme === "dark" ? "bg-gray-800 text-white border-gray-800" : "bg-gray-50 text-black border-gray-100"
  const hoverList = theme === "dark" ? "hover:bg-gray-700" : "hover:bg-gray-100"
  const textMuted = theme === "dark" ? "text-gray-400" : "text-gray-500"
  const btn = theme === "dark" ? "bg-blue-500 hover:bg-blue-600" : "bg-blue-600 hover:bg-blue-700"

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="flex-1">
          <label htmlFor="twni-search" className="block text-sm font-medium mb-1">Search</label>
          <input
            id="twni-search"
            className={`rounded px-2 py-1 w-full ${bgInput}`}
            placeholder="By name or ID..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>
      <div>
        <label htmlFor="twni-refresh" className="block mb-1 font-medium">Refresh Interval</label>
        <div className="flex items-center gap-2">
          <input
            id="twni-refresh"
            type="range"
            min={2}
            max={60}
            value={refresh}
            onChange={e => setRefresh(Number(e.target.value))}
            className={`w-full accent-blue-600 ${theme === "dark" ? "dark:accent-blue-400" : ""}`}
            onPointerDown={e => e.stopPropagation()}
            onTouchStart={e => e.stopPropagation()}
            onMouseDown={e => e.stopPropagation()}
          />
          <span className="text-xs w-16 text-right">{refresh === 2 ? "Real-time (2s)" : `${refresh}s`}</span>
        </div>
      </div>
      {onAddAll && (
        <Button className="w-full" onClick={() => onAddAll(filtered, refresh)}>
          {search ? "Add Selection" : "Add All"} ({filtered.length})
        </Button>
      )}
      <div className={`max-h-64 overflow-y-auto border rounded transition-colors duration-200 ${bgList}`}>
        {loading ? (
          <div className={`p-4 ${textMuted}`}>Loading cameras...</div>
        ) : error ? (
          <div className={`p-4 text-red-600`}>{error}</div>
        ) : filtered.length === 0 ? (
          <div className={`p-4 ${textMuted}`}>No cameras found.</div>
        ) : (
          <ul>
            {filtered.map((cam, index) => {
              // Extract ID from viewerUrl for display
              const idMatch = cam.viewerUrl.match(/id=(\d+)/)
              const cameraId = idMatch ? idMatch[1] : index
              
              return (
                <li key={`${index}-${cam.name}-${cameraId}`} className={`last:border-b-0 flex items-center justify-between px-3 py-2 border-b transition-colors duration-200 ${bgList} ${hoverList}`}>
                  <div>
                    <div className="font-medium">{cam.name}</div>
                    <div className={`text-xs ${textMuted}`}>ID: {cameraId}</div>
                  </div>
                  <button
                    className={`text-white px-3 py-1 rounded ${btn}`}
                    onClick={() => onSelect(cam, refresh)}
                  >Add</button>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}
