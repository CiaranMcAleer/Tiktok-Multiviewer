"use client"

import { useState, useEffect } from "react"
import { X, Layers, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

interface MapWidgetProps {
  title: string
  onRemove: () => void
  theme: "light" | "dark"
}

export default function MapWidget({ title, onRemove, theme }: MapWidgetProps) {
  const [map, setMap] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [locationError, setLocationError] = useState<string | null>(null)
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null)

  const mapLayers = {
    osm: {
      name: "OpenStreetMap",
      url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      attribution: "© OpenStreetMap contributors",
    },
    dark: {
      name: "Dark Theme",
      url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
      attribution: "© OpenStreetMap contributors © CARTO",
    },
    satellite: {
      name: "Satellite (Esri)",
      url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      attribution: "© Esri",
    },
    stadiasat: {
      name: "Satellite (Stadia)",
      url: "https://tiles.stadiamaps.com/tiles/alidade_satellite/{z}/{x}/{y}{r}.jpg",
      attribution:
        '&copy; CNES, Distribution Airbus DS, © Airbus DS, © PlanetObserver (Contains Copernicus Data) | &copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 20,
    },
  }

  // Get user's current location
  useEffect(() => {
    const getCurrentLocation = () => {
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords
            setUserLocation([latitude, longitude])
          },
          (error) => {
            console.error("Geolocation error:", error)
            setLocationError(error.message)
            // Fallback to Belfast if geolocation fails
            setUserLocation([54.5973, -5.9301])
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 300000, // 5 minutes
          },
        )
      } else {
        setLocationError("Geolocation not supported")
        // Fallback to Belfast if geolocation not supported
        setUserLocation([54.5973, -5.9301])
      }
    }

    getCurrentLocation()
  }, [])

  useEffect(() => {
    if (!userLocation) return

    let leaflet: any
    let mapInstance: any

    const initMap = async () => {
      try {
        // Dynamically import Leaflet
        leaflet = await import("leaflet")

        // Fix for default markers
        delete (leaflet.Icon.Default.prototype as any)._getIconUrl
        leaflet.Icon.Default.mergeOptions({
          iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
          iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
          shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
        })

        const mapContainer = document.getElementById(`map-${title}`)
        if (mapContainer) {
          // Initialize map centered on user's location
          mapInstance = leaflet.map(mapContainer).setView(userLocation, 13)

          // Create base layers
          const baseLayers: Record<string, any> = {}

          // Create each layer
          Object.entries(mapLayers).forEach(([key, layerInfo]) => {
            baseLayers[layerInfo.name] = leaflet.tileLayer(layerInfo.url, {
              attribution: layerInfo.attribution,
              maxZoom: layerInfo.maxZoom || 18,
            })
          })

          // Add the default layer to the map
          baseLayers["OpenStreetMap"].addTo(mapInstance)

          // Add layer control to the map
          leaflet.control.layers(baseLayers, {}).addTo(mapInstance)

          // Add a marker for user's current location
          if (!locationError) {
            leaflet.marker(userLocation).addTo(mapInstance).bindPopup("Your current location").openPopup()
          } else {
            // If using fallback location (Belfast), show different message
            leaflet
              .marker(userLocation)
              .addTo(mapInstance)
              .bindPopup("Belfast, Northern Ireland (fallback location)")
              .openPopup()
          }

          setMap({ instance: mapInstance, leaflet })
          setIsLoading(false)
        }
      } catch (error) {
        console.error("Failed to load map:", error)
        setIsLoading(false)
      }
    }

    initMap()

    return () => {
      if (mapInstance) {
        mapInstance.remove()
      }
    }
  }, [title, userLocation, locationError])

  const centerOnUserLocation = () => {
    if ("geolocation" in navigator && map) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          const newLocation: [number, number] = [latitude, longitude]

          // Update map center
          map.instance.setView(newLocation, 13)

          // Remove existing markers and add new one
          map.instance.eachLayer((layer: any) => {
            if (layer instanceof map.leaflet.Marker) {
              map.instance.removeLayer(layer)
            }
          })

          map.leaflet.marker(newLocation).addTo(map.instance).bindPopup("Your current location").openPopup()

          setUserLocation(newLocation)
          setLocationError(null)
        },
        (error) => {
          console.error("Geolocation error:", error)
          setLocationError(error.message)
        },
      )
    }
  }

  return (
    <>
      {/* Leaflet CSS */}
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.7.1/dist/leaflet.css"
        integrity="sha512-xodZBNTC5n17Xt2atTPuE1HxjVMSvLVW9ocqUKLsCC5CXdbqCmblAshOMAS6/keqq/sMZMZ19scR4PsZChSR7A=="
        crossOrigin=""
      />

      <Card
        className={`relative h-96 ${theme === "dark" ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}
      >
        <CardHeader className="flex flex-row items-center justify-between p-3">
          <div className="flex items-center gap-2 min-w-0">
            <Layers className="h-4 w-4" />
            <span className="font-medium truncate">{title}</span>
            {locationError && (
              <span className="text-xs text-yellow-500" title={locationError}>
                (Fallback)
              </span>
            )}
          </div>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={centerOnUserLocation}
              title="Center on current location"
            >
              <MapPin className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onRemove}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-0 h-80 relative">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-700 z-10">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
              <span className="ml-2 text-sm">{userLocation ? "Loading map..." : "Getting your location..."}</span>
            </div>
          )}
          <div id={`map-${title}`} className="w-full h-full rounded-b-lg" style={{ minHeight: "320px" }} />
        </CardContent>
      </Card>
    </>
  )
}
