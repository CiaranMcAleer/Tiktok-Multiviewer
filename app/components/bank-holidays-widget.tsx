import React, { useEffect, useState } from "react"
import { CalendarDays, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

interface BankHoliday {
  title: string
  date: string
  notes?: string
}

const API_URL = "https://www.gov.uk/bank-holidays.json"

function formatDate(dateStr: string) {
  const date = new Date(dateStr)
  return date.toLocaleDateString("en-GB", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

export default function BankHolidaysWidget({ onRemove, theme }: { onRemove?: () => void; theme?: string }) {
  const [holidays, setHolidays] = useState<BankHoliday[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchHolidays = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(API_URL)
      const data = await res.json()
      // Use England and Wales by default
      const events = data["england-and-wales"].events as BankHoliday[]
      const upcoming = events.filter(e => new Date(e.date) > new Date()).slice(0, 3)
      setHolidays(upcoming)
    } catch (err) {
      setError("Failed to fetch bank holidays.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchHolidays()
    const interval = setInterval(fetchHolidays, 2 * 60 * 60 * 1000) // 2 hours
    return () => clearInterval(interval)
  }, [])

  return (
    <div
      className={`w-full max-w-full rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/80 shadow-sm p-4 min-h-[220px] flex flex-col justify-between`}
      style={{ minWidth: 0 }}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <CalendarDays className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          <span className="font-semibold text-base">Upcoming UK Bank Holidays</span>
        </div>
        {onRemove && (
          <Button variant="ghost" size="icon" onClick={onRemove}>
            <RefreshCw className="h-5 w-5" />
          </Button>
        )}
      </div>
      <div className="flex-1 flex flex-col justify-center">
        {loading ? (
          <div className="text-sm text-gray-500">Loading...</div>
        ) : error ? (
          <div className="text-sm text-red-600">{error}</div>
        ) : holidays.length === 0 ? (
          <div className="text-sm text-gray-500">No upcoming bank holidays found.</div>
        ) : (
          <ul className="space-y-3">
            {holidays.map((holiday, idx) => (
              <li key={holiday.date} className="bg-blue-50 dark:bg-blue-900/20 rounded-md p-3 flex flex-col gap-1">
                <span className="font-medium text-blue-700 dark:text-blue-300 text-base">{holiday.title}</span>
                <span className="text-sm text-gray-700 dark:text-gray-300">{formatDate(holiday.date)}</span>
                {holiday.notes && <span className="text-xs text-gray-500 italic">{holiday.notes}</span>}
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="mt-3 text-xs text-gray-400 text-right">Source: gov.uk • Updates every 2 hours</div>
    </div>
  )
}
