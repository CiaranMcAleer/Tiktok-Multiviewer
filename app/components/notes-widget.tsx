"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { X, FileText, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"

interface NotesWidgetProps {
  title: string
  content: string
  onRemove: () => void
  onContentChange: (content: string) => void
  theme: "light" | "dark"
}

export default function NotesWidget({ title, content, onRemove, onContentChange, theme }: NotesWidgetProps) {
  const [localContent, setLocalContent] = useState(content)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  useEffect(() => {
    setLocalContent(content)
    setHasUnsavedChanges(false)
  }, [content])

  const handleContentChange = (newContent: string) => {
    setLocalContent(newContent)
    setHasUnsavedChanges(newContent !== content)
  }

  const saveContent = () => {
    onContentChange(localContent)
    setHasUnsavedChanges(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.ctrlKey && e.key === "s") {
      e.preventDefault()
      saveContent()
    }
  }

  return (
    <Card className={`relative h-96 ${theme === "dark" ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}>
      <CardHeader className="flex flex-row items-center justify-between p-3">
        <div className="flex items-center gap-2 min-w-0">
          <FileText className="h-4 w-4" />
          <span className={`font-medium truncate ${theme === "dark" ? "text-white" : "text-gray-900"}`}>{title}</span>
          {hasUnsavedChanges && (
            <span className="text-xs text-orange-500" title="Unsaved changes">
              •
            </span>
          )}
        </div>
        <div className="flex gap-1">
          {hasUnsavedChanges && (
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={saveContent} title="Save (Ctrl+S)" aria-label="Save notes">
              <Save className="h-4 w-4" />
            </Button>
          )}
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onRemove} aria-label="Remove widget">
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-4 h-80">
        <Textarea
          value={localContent}
          onChange={(e) => handleContentChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Enter your notes here... (Ctrl+S to save)"
          className={`w-full h-full resize-none border-0 focus:ring-0 focus:border-0 ${
            theme === "dark"
              ? "bg-gray-800 text-white placeholder-gray-400"
              : "bg-white text-gray-900 placeholder-gray-500"
          }`}
          style={{ outline: "none", boxShadow: "none" }}
        />
        {hasUnsavedChanges && (
          <div className="mt-2 text-xs text-orange-500">Press Ctrl+S to save changes or click the save button</div>
        )}
      </CardContent>
    </Card>
  )
}
