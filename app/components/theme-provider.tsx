"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

type Theme = "light" | "dark"

interface ThemeContextType {
  theme: Theme
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)


import { useEffect } from "react"

export function ThemeProvider({ children }: { children: ReactNode }) {
  // Get initial theme from localStorage or <html> class
  const getInitialTheme = (): Theme => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("theme") as Theme | null
      if (stored === "light" || stored === "dark") return stored
      // Fallback: check <html> class
      if (document.documentElement.classList.contains("dark")) return "dark"
    }
    return "dark" // default
  }

  const [theme, setTheme] = useState<Theme>(getInitialTheme)

  // Sync theme to <html> class and localStorage
  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark")
      localStorage.setItem("theme", "dark")
    } else {
      document.documentElement.classList.remove("dark")
      localStorage.setItem("theme", "light")
    }
  }, [theme])

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"))
  }

  return <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}
