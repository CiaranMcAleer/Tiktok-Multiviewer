"use client"

import React, { useState } from "react"
import { MapPin, Check, ChevronsUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
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

interface LocationResult {
  id: number
  name: string
  latitude: number
  longitude: number
  country: string
  admin1?: string
}

interface WeatherLocationSelectorProps {
  onLocationSelect: (location: string, latitude: number, longitude: number) => void
}

export default function WeatherLocationSelector({ onLocationSelect }: WeatherLocationSelectorProps) {
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<LocationResult[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const searchLocations = async (query: string) => {
    if (!query.trim() || query.length < 2) {
      setSearchResults([])
      return
    }

    setLoading(true)
    setError(null)

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
      setError("Failed to search locations")
      setSearchResults([])
    } finally {
      setLoading(false)
    }
  }

  const handleLocationSelect = (location: LocationResult) => {
    const displayName = location.admin1 
      ? `${location.name}, ${location.admin1}, ${location.country}`
      : `${location.name}, ${location.country}`
    
    setValue(displayName)
    onLocationSelect(displayName, location.latitude, location.longitude)
    setOpen(false)
    setSearchQuery("")
    setSearchResults([])
  }

  const formatLocationDisplay = (location: LocationResult) => {
    return location.admin1 
      ? `${location.name}, ${location.admin1}, ${location.country}`
      : `${location.name}, ${location.country}`
  }

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Location</label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            {value ? (
              <span className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                {value}
              </span>
            ) : (
              "Select location..."
            )}
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
              {loading && (
                <CommandEmpty>Searching...</CommandEmpty>
              )}
              {error && (
                <CommandEmpty className="text-red-500">{error}</CommandEmpty>
              )}
              {!loading && !error && searchResults.length === 0 && searchQuery.length >= 2 && (
                <CommandEmpty>No locations found.</CommandEmpty>
              )}
              {!loading && !error && searchQuery.length < 2 && (
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
                      <Check
                        className={`ml-auto h-4 w-4 ${
                          value === formatLocationDisplay(location) ? "opacity-100" : "opacity-0"
                        }`}
                      />
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  )
}
