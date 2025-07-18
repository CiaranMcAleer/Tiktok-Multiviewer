import React, { useState, useMemo } from "react"
import { useTheme } from "./theme-provider"
import cameras from "./twni-cameras.json"


interface Camera {
  id: number
  name: string
  region: string
  url: string
}

interface Props {
  onSelect: (camera: Camera, refreshInterval: number) => void
  onClose: () => void
}

export default function TwniCameraSelector({ onSelect, onClose }: Props) {
  const { theme } = useTheme()
  const [search, setSearch] = useState("")
  const [region, setRegion] = useState("")
  const [refresh, setRefresh] = useState(5)
  const regions = useMemo(() => Array.from(new Set(cameras.map(c => c.region))), [])
  const filtered = useMemo(() => cameras.filter(c =>
    (!region || c.region === region) &&
    (c.name.toLowerCase().includes(search.toLowerCase()) || c.id.toString().includes(search))
  ), [search, region])

  // Detect duplicate IDs across regions
  const duplicateIds = useMemo(() => {
    const seen = new Set();
    const dups = new Set();
    cameras.forEach(c => {
      const key = c.id;
      if (seen.has(key)) dups.add(key);
      else seen.add(key);
    });
    return Array.from(dups);
  }, []);

  // Theme-based classes
  const bgOverlay = theme === "dark" ? "bg-black/80" : "bg-black/60"
  const bgPanel = theme === "dark" ? "bg-gray-900 text-white border-gray-700" : "bg-white text-black border-gray-200"
  const bgInput = theme === "dark" ? "bg-gray-800 text-white border-gray-700" : "bg-white text-black border-gray-300"
  const bgList = theme === "dark" ? "bg-gray-800 text-white border-gray-800" : "bg-gray-50 text-black border-gray-100"
  const hoverList = theme === "dark" ? "hover:bg-gray-800" : "hover:bg-gray-100"
  const textMuted = theme === "dark" ? "text-gray-400" : "text-gray-500"
  const btn = theme === "dark" ? "bg-blue-500 hover:bg-blue-600" : "bg-blue-600 hover:bg-blue-700"

  return (
    <div className={`fixed inset-0 flex items-center justify-center z-50 ${bgOverlay}`}>
      <div className={`rounded-lg shadow-lg p-6 w-full max-w-xl border transition-colors duration-200 ${bgPanel}`}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold">Add TrafficWatchNI Camera</h2>
          <button onClick={onClose} className={`text-gray-500 hover:text-black ${theme === "dark" ? "dark:hover:text-white" : ""}`} aria-label="Close">✕</button>
        </div>
        <div className="mb-2 flex gap-2">
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
          <div>
            <label htmlFor="twni-region" className="block text-sm font-medium mb-1">Region</label>
            <select
              id="twni-region"
              className={`rounded px-2 py-1 ${bgInput}`}
              value={region}
              onChange={e => setRegion(e.target.value)}
            >
              <option value="">All Regions</option>
              {regions.map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="mb-4">
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
        {/* Duplicate ID warning */}
        {duplicateIds.length > 0 && (
          <div className="p-2 mb-2 text-xs text-red-600 bg-red-50 border border-red-200 rounded">
            Warning: Duplicate camera IDs exist (IDs: {duplicateIds.join(", ")}). This may cause confusion when searching by ID.
          </div>
        )}
        <div className={`max-h-64 overflow-y-auto border rounded transition-colors duration-200 ${bgList}`}>
          {filtered.length === 0 ? (
            <div className={`p-4 ${textMuted}`}>No cameras found.</div>
          ) : (
            <ul>
              {filtered.map(cam => (
                <li key={`${cam.region}-${cam.id}`} className={`last:border-b-0 flex items-center justify-between px-3 py-2 border-b transition-colors duration-200 ${bgList} ${hoverList}`}>
                  <div>
                    <div className="font-medium">{cam.name}</div>
                    <div className={`text-xs ${textMuted}`}>{cam.region} &middot; ID: {cam.id}</div>
                  </div>
                  <button
                    className={`text-white px-3 py-1 rounded ${btn}`}
                    onClick={() => onSelect(cam, refresh)}
                  >Add</button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
