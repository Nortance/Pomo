"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ChevronUp, ChevronDown } from "lucide-react"

interface AddTaskDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAddTask: (task: { title: string; estimatedPomodoros: number; note?: string }) => void
}

export function AddTaskDialog({ open, onOpenChange, onAddTask }: AddTaskDialogProps) {
  const [title, setTitle] = useState("")
  const [estimatedPomodoros, setEstimatedPomodoros] = useState(1)
  const [note, setNote] = useState("")
  const [showNote, setShowNote] = useState(false)

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!title.trim()) return

    onAddTask({
      title: title.trim(),
      estimatedPomodoros,
      note: note.trim() || undefined,
    })

    setTitle("")
    setEstimatedPomodoros(1)
    setNote("")
    setShowNote(false)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-sm font-medium tracking-wide">Add Task</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <Input
              placeholder="What are you working on?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-sm"
              autoFocus
            />

            <div className="space-y-2">
              <label className="text-xs text-muted-foreground tracking-wide uppercase">Est. Pomodoros</label>
              <div className="flex items-center gap-2">
                <div className="border border-border px-3 py-2 text-sm tabular-nums w-16 text-center">
                  {estimatedPomodoros}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-9 w-9 bg-transparent"
                  onClick={() => setEstimatedPomodoros((prev) => prev + 1)}
                  aria-label="Increase pomodoros"
                >
                  <ChevronUp className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-9 w-9 bg-transparent"
                  onClick={() => setEstimatedPomodoros((prev) => Math.max(1, prev - 1))}
                  aria-label="Decrease pomodoros"
                >
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {!showNote ? (
              <button
                type="button"
                onClick={() => setShowNote(true)}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                + Add Note
              </button>
            ) : (
              <Textarea
                placeholder="Add a note..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="text-sm min-h-20"
              />
            )}
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!title.trim()}>
              Save
              <kbd className="ml-2 mt-0.5 text-[10px] opacity-60 hidden sm:inline">enter</kbd>
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
