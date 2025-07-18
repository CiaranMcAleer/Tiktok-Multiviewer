"use client"

import { useState, useEffect, useRef } from "react"
import { X, Clock, MapPin, Search, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface WorldTimeWidgetProps {
  title: string
  city: string
  timezone: string
  onRemove: () => void
  onCityChange: (city: string, timezone: string) => void
  theme: "light" | "dark"
}

interface WorldTimeData {
  datetime: string
  timezone: string
  abbreviation: string
  dst: boolean
  utc_offset: string
  unixtime: number
}

export default function WorldTimeWidget({
  title,
  city,
  timezone,
  onRemove,
  onCityChange,
  theme,
}: WorldTimeWidgetProps) {
  const [currentTime, setCurrentTime] = useState<string>("")
  const [currentDate, setCurrentDate] = useState<string>("")
  const [timeData, setTimeData] = useState<WorldTimeData | null>(null)
  const [open, setOpen] = useState(false)
  const [searchValue, setSearchValue] = useState("")
  const [availableTimezones, setAvailableTimezones] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [useApiFallback, setUseApiFallback] = useState(false)
  const lastSyncRef = useRef<number>(0)

  // Fallback timezone list in case API fails
  const FALLBACK_TIMEZONES = [
    // Major cities and regions
    "Europe/London",
    "Europe/Paris",
    "Europe/Berlin",
    "Europe/Rome",
    "Europe/Madrid",
    "Europe/Amsterdam",
    "Europe/Brussels",
    "Europe/Vienna",
    "Europe/Zurich",
    "Europe/Stockholm",
    "Europe/Oslo",
    "Europe/Copenhagen",
    "Europe/Helsinki",
    "Europe/Warsaw",
    "Europe/Prague",
    "Europe/Budapest",
    "Europe/Moscow",
    "Europe/Istanbul",
    "Europe/Athens",
    "Europe/Dublin",

    "America/New_York",
    "America/Los_Angeles",
    "America/Chicago",
    "America/Denver",
    "America/Phoenix",
    "America/Toronto",
    "America/Vancouver",
    "America/Montreal",
    "America/Mexico_City",
    "America/Sao_Paulo",
    "America/Argentina/Buenos_Aires",
    "America/Lima",
    "America/Bogota",
    "America/Santiago",

    "Asia/Tokyo",
    "Asia/Shanghai",
    "Asia/Hong_Kong",
    "Asia/Singapore",
    "Asia/Seoul",
    "Asia/Kolkata",
    "Asia/Dubai",
    "Asia/Bangkok",
    "Asia/Manila",
    "Asia/Jakarta",
    "Asia/Kuala_Lumpur",
    "Asia/Taipei",
    "Asia/Ho_Chi_Minh",
    "Asia/Karachi",
    "Asia/Jerusalem", // Tel Aviv

    "Australia/Sydney",
    "Australia/Melbourne",
    "Australia/Brisbane",
    "Australia/Perth",
    "Pacific/Auckland",
    "Pacific/Honolulu",
    "Pacific/Fiji",

    "Africa/Cairo",
    "Africa/Lagos",
    "Africa/Johannesburg",
    "Africa/Nairobi",
    "Africa/Casablanca",
    "Africa/Algiers",
    "Africa/Tunis",
  ]

  // Fetch available timezones on component mount (only once)
  useEffect(() => {
    const fetchTimezones = async () => {
      try {
        // Use CORS proxy for timezone list
        const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent('https://worldtimeapi.org/api/timezone')}`
        
        // Create timeout controller for older browsers
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout
        
        const response = await fetch(proxyUrl, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
          signal: controller.signal
        })

        clearTimeout(timeoutId)

        if (response.ok) {
          const proxyData = await response.json()
          const timezones = JSON.parse(proxyData.contents)
          
          if (Array.isArray(timezones) && timezones.length > 0) {
            setAvailableTimezones(timezones)
            console.log("Loaded timezones from API")
            return
          }
        }
      } catch (error) {
        console.warn("Failed to fetch timezones from API:", error)
      }

      // Use fallback timezones if API fails
      console.log("Using fallback timezone list")
      setAvailableTimezones(FALLBACK_TIMEZONES)
    }

    fetchTimezones()
  }, [])

  // Fetch time data from WorldTimeAPI (only when timezone changes or for periodic sync)
  const fetchTimeData = async (isResync = false) => {
    if (!timezone) return

    // Validate timezone before making API call
    if (!isValidTimezone(timezone)) {
      console.error(`Invalid timezone: ${timezone}`)
      setError("Invalid timezone")
      return
    }

    // Don't fetch too frequently - only resync every 15 minutes
    const now = Date.now()
    if (isResync && now - lastSyncRef.current < 15 * 60 * 1000) {
      return
    }

    try {
      if (!isResync) setLoading(true)
      
      // Use CORS proxy for WorldTimeAPI to avoid CORS issues
      const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(`https://worldtimeapi.org/api/timezone/${timezone}`)}`
      
      // Create timeout controller for older browsers
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout
      
      const response = await fetch(proxyUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const proxyData = await response.json()
      
      if (!proxyData.contents) {
        throw new Error('No data received from proxy')
      }

      const data: WorldTimeData = JSON.parse(proxyData.contents)
      
      // Validate the data structure
      if (!data.datetime || !data.timezone) {
        throw new Error('Invalid time data structure')
      }

      setTimeData(data)
      setError(null)
      setUseApiFallback(false)
      lastSyncRef.current = now

      console.log(`Time synced for ${timezone}${isResync ? " (resync)" : ""}`)
    } catch (error) {
      console.warn("API fetch failed, using browser fallback:", error)

      if (!isResync) {
        setError("Using browser timezone")
        setUseApiFallback(true)

        // Create fallback data using browser's Intl API
        try {
          const now = new Date()
          const formatter = new Intl.DateTimeFormat('en', {
            timeZone: timezone,
            timeZoneName: 'short'
          })
          
          const parts = formatter.formatToParts(now)
          const timeZoneName = parts.find(part => part.type === 'timeZoneName')?.value || 'LOCAL'
          
          const fallbackData: WorldTimeData = {
            datetime: now.toISOString(),
            timezone: timezone,
            abbreviation: timeZoneName,
            dst: false,
            utc_offset: getTimezoneOffset(timezone),
            unixtime: Math.floor(now.getTime() / 1000),
          }
          setTimeData(fallbackData)
        } catch (fallbackError) {
          console.error("Fallback also failed:", fallbackError)
          setError("Timezone not supported")
        }
      }
    } finally {
      if (!isResync) setLoading(false)
    }
  }

  // Helper function to get timezone offset
  const getTimezoneOffset = (tz: string): string => {
    try {
      const now = new Date()
      const utc1 = new Date(now.getTime() + (now.getTimezoneOffset() * 60000))
      const utc2 = new Date(utc1.toLocaleString("en-US", {timeZone: tz}))
      const diff = (utc1.getTime() - utc2.getTime()) / (1000 * 60 * 60)
      const hours = Math.floor(Math.abs(diff))
      const minutes = Math.floor((Math.abs(diff) - hours) * 60)
      const sign = diff <= 0 ? '+' : '-'
      return `${sign}${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
    } catch {
      return '+00:00'
    }
  }

  // Helper function to validate timezone strings
  const isValidTimezone = (tz: string): boolean => {
    try {
      Intl.DateTimeFormat(undefined, { timeZone: tz })
      return true
    } catch {
      return false
    }
  }

  // Initial fetch when timezone changes
  useEffect(() => {
    fetchTimeData(false)
  }, [timezone])

  // Periodic resync every 15 minutes
  useEffect(() => {
    const resyncInterval = setInterval(
      () => {
        fetchTimeData(true)
      },
      15 * 60 * 1000,
    ) // 15 minutes

    return () => clearInterval(resyncInterval)
  }, [timezone])

  // Update displayed time every second
  useEffect(() => {
    if (!timeData) return

    const updateDisplayTime = () => {
      try {
        let targetTime: Date

        if (useApiFallback) {
          // Use browser's built-in timezone support as fallback
          targetTime = new Date()
        } else {
          // Use API data to calculate the correct time
          // Get current UTC time and apply the timezone offset
          const now = new Date()
          const utcTime = now.getTime() + now.getTimezoneOffset() * 60000

          // Parse the UTC offset from the API (e.g., "+02:00" or "-05:00")
          const offsetMatch = timeData.utc_offset.match(/([+-])(\d{2}):(\d{2})/)
          if (offsetMatch) {
            const sign = offsetMatch[1] === "+" ? 1 : -1
            const hours = Number.parseInt(offsetMatch[2])
            const minutes = Number.parseInt(offsetMatch[3])
            const offsetMs = sign * (hours * 60 + minutes) * 60000

            targetTime = new Date(utcTime + offsetMs)
          } else {
            // Fallback if offset parsing fails
            targetTime = new Date()
          }
        }

        // Format time using browser's Intl API with the specific timezone
        const timeFormatter = new Intl.DateTimeFormat("en-GB", {
          timeZone: useApiFallback ? timezone : undefined,
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        })

        const dateFormatter = new Intl.DateTimeFormat("en-GB", {
          timeZone: useApiFallback ? timezone : undefined,
          weekday: "short",
          day: "2-digit",
          month: "short",
          year: "numeric",
        })

        if (useApiFallback) {
          // Use current time with timezone formatting
          const now = new Date()
          setCurrentTime(timeFormatter.format(now))
          setCurrentDate(dateFormatter.format(now))
        } else {
          // Use calculated target time
          setCurrentTime(timeFormatter.format(targetTime))
          setCurrentDate(dateFormatter.format(targetTime))
        }
      } catch (error) {
        console.error("Error formatting time:", error)
        setCurrentTime("--:--:--")
        setCurrentDate("Invalid time")
      }
    }

    updateDisplayTime()
    const interval = setInterval(updateDisplayTime, 1000)

    return () => clearInterval(interval)
  }, [timeData, timezone, useApiFallback])

  const handleCityChange = (selectedTimezone: string) => {
    // Extract city name from timezone (e.g., "America/New_York" -> "New York")
    const parts = selectedTimezone.split("/")
    const cityName = parts[parts.length - 1].replace(/_/g, " ")

    onCityChange(cityName, selectedTimezone)
    setOpen(false)
    setSearchValue("")
  }

  const filteredTimezones = availableTimezones.filter((tz) => tz.toLowerCase().includes(searchValue.toLowerCase()))

  const formatTimezone = (tz: string) => {
    const parts = tz.split("/")
    if (parts.length === 2) {
      return `${parts[1].replace(/_/g, " ")}, ${parts[0]}`
    } else if (parts.length === 3) {
      return `${parts[2].replace(/_/g, " ")}, ${parts[1].replace(/_/g, " ")}, ${parts[0]}`
    }
    return tz.replace(/_/g, " ")
  }

  return (
    <Card className="relative h-96 bg-background border-border">
      <CardHeader className="flex flex-row items-center justify-between p-3">
        <div className="flex items-center gap-2 min-w-0">
          <Clock className="h-4 w-4" />
          <span className="font-medium truncate text-foreground">{title}</span>
          {error && (
            <span className="text-xs text-yellow-500" title={error}>
              (Browser)
            </span>
          )}
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8 bg-background text-foreground hover:bg-accent hover:text-accent-foreground" onClick={onRemove} aria-label="Remove widget">
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>

      <CardContent className="p-4 h-80 flex flex-col">
        <div className="flex-1 flex flex-col items-center justify-center text-center">
          <div className="mb-4">
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" role="combobox" aria-expanded={open} className="w-64 justify-between bg-background text-foreground hover:bg-accent hover:text-accent-foreground">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-3 w-3" />
                    <span className="truncate">{city}</span>
                  </div>
                  <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-0">
                <Command>
                  <CommandInput
                    placeholder="Search timezones (e.g., London, New_York, Jerusalem)..."
                    value={searchValue}
                    onValueChange={setSearchValue}
                  />
                  <CommandList>
                    <CommandEmpty>No timezone found.</CommandEmpty>
                    <CommandGroup>
                      {filteredTimezones.slice(0, 50).map((tz) => (
                        <CommandItem key={tz} value={tz} onSelect={() => handleCityChange(tz)}>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-3 w-3" />
                            <span className="text-sm">{formatTimezone(tz)}</span>
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          <div className="text-center">
            {loading ? (
              <div className="flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : (
              <>
                <div
                  className="text-4xl font-mono font-bold mb-2 text-foreground"
                >
                  {currentTime}
                </div>
                <div className="text-lg mb-1 text-muted-foreground">
                  {currentDate}
                </div>
                <div className="text-sm mb-1 text-muted-foreground">{timezone}</div>
                {timeData && (
                  <div className="text-xs text-muted-foreground">
                    {timeData.abbreviation} • UTC{timeData.utc_offset}
                    {timeData.dst && " • DST"}
                    {useApiFallback && " • Browser timezone"}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
