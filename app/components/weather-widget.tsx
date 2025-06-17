"use client"

import React, { useState, useEffect, useRef } from "react"
import { X, RefreshCw, Cloud, Sun, CloudRain, CloudSnow, MapPin, Thermometer, Droplets, Wind, Eye, Sunrise, Sunset, Check, ChevronsUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import type { Widget } from "../types/widget"

interface LocationResult {
  id: number
  name: string
  latitude: number
  longitude: number
  country: string
  admin1?: string
}

interface WeatherData {
  current: {
    temperature_2m: number
    relative_humidity_2m: number
    apparent_temperature: number
    is_day: number
    precipitation: number
    rain: number
    showers: number
    snowfall: number
    weather_code: number
    cloud_cover: number
    surface_pressure: number
    wind_speed_10m: number
    wind_direction_10m: number
    wind_gusts_10m: number
  }
  daily: {
    sunrise: string[]
    sunset: string[]
    temperature_2m_max: number[]
    temperature_2m_min: number[]
    weather_code: number[]
  }
}

interface WeatherWidgetProps {
  widget: Widget
  onRemove: () => void
  onLocationChange: (location: string, latitude: number, longitude: number) => void
  theme: "light" | "dark"
}

export default function WeatherWidget({ widget, onRemove, onLocationChange, theme }: WeatherWidgetProps) {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<LocationResult[]>([])
  const [searchLoading, setSearchLoading] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const refreshTimerRef = useRef<NodeJS.Timeout | null>(null)

  const refreshInterval = widget.refreshInterval || 10 * 60 * 1000 // Default 10 minutes

  // Weather code to icon/description mapping
  const getWeatherInfo = (code: number, isDay: boolean) => {
    const weatherCodes: { [key: number]: { icon: any, description: string, color: string } } = {
      0: { icon: isDay ? Sun : Sun, description: "Clear sky", color: isDay ? "text-yellow-500" : "text-blue-300" },
      1: { icon: isDay ? Sun : Sun, description: "Mainly clear", color: isDay ? "text-yellow-500" : "text-blue-300" },
      2: { icon: Cloud, description: "Partly cloudy", color: "text-gray-400" },
      3: { icon: Cloud, description: "Overcast", color: "text-gray-500" },
      45: { icon: Cloud, description: "Fog", color: "text-gray-400" },
      48: { icon: Cloud, description: "Depositing rime fog", color: "text-gray-400" },
      51: { icon: CloudRain, description: "Light drizzle", color: "text-blue-400" },
      53: { icon: CloudRain, description: "Moderate drizzle", color: "text-blue-500" },
      55: { icon: CloudRain, description: "Dense drizzle", color: "text-blue-600" },
      61: { icon: CloudRain, description: "Slight rain", color: "text-blue-400" },
      63: { icon: CloudRain, description: "Moderate rain", color: "text-blue-500" },
      65: { icon: CloudRain, description: "Heavy rain", color: "text-blue-600" },
      71: { icon: CloudSnow, description: "Slight snow", color: "text-blue-200" },
      73: { icon: CloudSnow, description: "Moderate snow", color: "text-blue-300" },
      75: { icon: CloudSnow, description: "Heavy snow", color: "text-blue-400" },
      95: { icon: CloudRain, description: "Thunderstorm", color: "text-purple-500" },
    }
    return weatherCodes[code] || { icon: Cloud, description: "Unknown", color: "text-gray-400" }
  }

  const fetchWeatherData = async () => {
    if (!widget.latitude || !widget.longitude) return

    setLoading(true)
    setError(null)

    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${widget.latitude}&longitude=${widget.longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,rain,showers,snowfall,weather_code,cloud_cover,surface_pressure,wind_speed_10m,wind_direction_10m,wind_gusts_10m&daily=temperature_2m_max,temperature_2m_min,sunrise,sunset,weather_code&timezone=auto`
      
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`Weather API error: ${response.status}`)
      }

      const data: WeatherData = await response.json()
      setWeatherData(data)
      setLastUpdated(new Date())
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load weather data")
      console.error("Weather fetch error:", err)
    } finally {
      setLoading(false)
    }
  }

  const searchLocations = async (query: string) => {
    if (!query.trim() || query.length < 2) {
      setSearchResults([])
      return
    }

    setSearchLoading(true)

    try {
      const response = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=10&language=en&format=json`
      )
      
      if (!response.ok) {
        throw new Error(`Geocoding error: ${response.status}`)
      }

      const data = await response.json()
      if (data.results && Array.isArray(data.results)) {
        setSearchResults(data.results)
      } else {
        setSearchResults([])
      }
    } catch (err) {
      console.error("Geocoding error:", err)
      setSearchResults([])
    } finally {
      setSearchLoading(false)
    }
  }

  const handleLocationSelect = (location: LocationResult) => {
    const displayName = location.admin1 
      ? `${location.name}, ${location.admin1}, ${location.country}`
      : `${location.name}, ${location.country}`
    
    onLocationChange(displayName, location.latitude, location.longitude)
    setIsEditing(false)
    setSearchOpen(false)
    setSearchQuery("")
    setSearchResults([])
  }

  const formatLocationDisplay = (location: LocationResult) => {
    return location.admin1 
      ? `${location.name}, ${location.admin1}, ${location.country}`
      : `${location.name}, ${location.country}`
  }

  const formatTime = (timeString: string) => {
    try {
      return new Date(timeString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    } catch {
      return timeString
    }
  }

  const getWindDirection = (degrees: number) => {
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW']
    return directions[Math.round(degrees / 22.5) % 16]
  }

  // Initial fetch and setup auto-refresh
  useEffect(() => {
    fetchWeatherData()

    // Set up auto-refresh
    refreshTimerRef.current = setInterval(fetchWeatherData, refreshInterval)

    return () => {
      if (refreshTimerRef.current) {
        clearInterval(refreshTimerRef.current)
      }
    }
  }, [widget.latitude, widget.longitude, refreshInterval])

  const currentWeather = weatherData?.current
  const dailyWeather = weatherData?.daily
  const weatherInfo = currentWeather ? getWeatherInfo(currentWeather.weather_code, currentWeather.is_day === 1) : null

  return (
    <Card className={`relative h-96 ${theme === "dark" ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}>
      <CardHeader className="flex flex-row items-center justify-between p-3 pb-2">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {weatherInfo && (
            <weatherInfo.icon className={`h-4 w-4 ${weatherInfo.color}`} />
          )}
          <span className={`font-medium truncate ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
            {widget.location || widget.title}
          </span>
          {loading && (
            <RefreshCw className={`h-3 w-3 animate-spin ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`} />
          )}
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsEditing(!isEditing)}
            className="h-6 w-6 rounded-full"
          >
            <MapPin className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={fetchWeatherData}
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

      <CardContent className="p-3 pt-0 h-80 overflow-y-auto">
        {isEditing && (
          <div className="mb-4">
            <Popover open={searchOpen} onOpenChange={setSearchOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={searchOpen}
                  className="w-full justify-between"
                >
                  <span className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Search new location...
                  </span>
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent 
                className="w-full p-0 z-super-high" 
                align="start"
                sideOffset={5}
                avoidCollisions={true}
                sticky="always"
              >
                <Command shouldFilter={false}>
                  <CommandInput 
                    placeholder="Search cities..." 
                    value={searchQuery}
                    onValueChange={(search) => {
                      setSearchQuery(search)
                      searchLocations(search)
                    }}
                  />
                  <CommandList>
                    {searchLoading && (
                      <CommandEmpty>Searching...</CommandEmpty>
                    )}
                    {!searchLoading && searchResults.length === 0 && searchQuery.length >= 2 && (
                      <CommandEmpty>No locations found.</CommandEmpty>
                    )}
                    {!searchLoading && searchQuery.length < 2 && (
                      <CommandEmpty>Type at least 2 characters to search.</CommandEmpty>
                    )}
                    {searchResults.length > 0 && (
                      <CommandGroup>
                        {searchResults.map((location) => (
                          <CommandItem
                            key={location.id}
                            value={formatLocationDisplay(location)}
                            onSelect={() => handleLocationSelect(location)}
                            className="cursor-pointer"
                          >
                            <MapPin className="mr-2 h-4 w-4" />
                            <div className="flex flex-col">
                              <span>{formatLocationDisplay(location)}</span>
                              <span className="text-xs text-muted-foreground">
                                {location.latitude.toFixed(2)}, {location.longitude.toFixed(2)}
                              </span>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    )}
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => setIsEditing(false)}
              className="w-full mt-2"
            >
              Cancel
            </Button>
          </div>
        )}

        {error ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <Cloud className={`h-8 w-8 mb-2 ${theme === "dark" ? "text-red-400" : "text-red-500"}`} />
            <p className={`text-sm mb-2 ${theme === "dark" ? "text-red-400" : "text-red-600"}`}>
              Weather data unavailable
            </p>
            <p className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
              {error}
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchWeatherData}
              className="mt-3"
            >
              Try Again
            </Button>
          </div>
        ) : !weatherData || loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <RefreshCw className={`h-6 w-6 animate-spin mx-auto mb-2 ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`} />
              <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                Loading weather...
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Current Weather */}
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                {weatherInfo && (
                  <weatherInfo.icon className={`h-12 w-12 ${weatherInfo.color}`} />
                )}
              </div>
              <div className={`text-3xl font-bold mb-1 ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                {Math.round(currentWeather!.temperature_2m)}°C
              </div>
              <div className={`text-sm mb-2 ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
                {weatherInfo?.description}
              </div>
              <div className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                Feels like {Math.round(currentWeather!.apparent_temperature)}°C
              </div>
            </div>

            {/* Weather Details */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className={`flex items-center gap-2 ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
                <Droplets className="h-3 w-3" />
                <span>{currentWeather!.relative_humidity_2m}%</span>
              </div>
              <div className={`flex items-center gap-2 ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
                <Wind className="h-3 w-3" />
                <span>{Math.round(currentWeather!.wind_speed_10m)} km/h {getWindDirection(currentWeather!.wind_direction_10m)}</span>
              </div>
              <div className={`flex items-center gap-2 ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
                <Eye className="h-3 w-3" />
                <span>{currentWeather!.cloud_cover}% clouds</span>
              </div>
              <div className={`flex items-center gap-2 ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
                <Thermometer className="h-3 w-3" />
                <span>{Math.round(currentWeather!.surface_pressure)} hPa</span>
              </div>
            </div>

            {/* Today's High/Low */}
            {dailyWeather && (
              <div className="flex justify-between items-center text-sm">
                <div className={theme === "dark" ? "text-gray-300" : "text-gray-600"}>
                  <span className="font-medium">H: {Math.round(dailyWeather.temperature_2m_max[0])}°</span>
                </div>
                <div className={theme === "dark" ? "text-gray-300" : "text-gray-600"}>
                  <span className="font-medium">L: {Math.round(dailyWeather.temperature_2m_min[0])}°</span>
                </div>
              </div>
            )}

            {/* Sunrise/Sunset */}
            {dailyWeather && (
              <div className="flex justify-between items-center text-xs">
                <div className={`flex items-center gap-1 ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                  <Sunrise className="h-3 w-3" />
                  <span>{formatTime(dailyWeather.sunrise[0])}</span>
                </div>
                <div className={`flex items-center gap-1 ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                  <Sunset className="h-3 w-3" />
                  <span>{formatTime(dailyWeather.sunset[0])}</span>
                </div>
              </div>
            )}

            {lastUpdated && (
              <div className={`mt-2 pt-2 border-t text-xs text-center ${
                theme === "dark" 
                  ? "border-gray-700 text-gray-400" 
                  : "border-gray-200 text-gray-500"
              }`}>
                Updated: {lastUpdated.toLocaleTimeString()}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
