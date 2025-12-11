"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Clock, Calendar, Flame } from "lucide-react"

interface Task {
  id: string
  title: string
  estimatedPomodoros: number
  completedPomodoros: number
  completed: boolean
}

interface ReportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  completedPomodoros: number
  tasks: Task[]
}

export function ReportDialog({ open, onOpenChange, completedPomodoros, tasks }: ReportDialogProps) {
  const totalFocusMinutes = completedPomodoros * 25
  const hours = Math.floor(totalFocusMinutes / 60)
  const minutes = totalFocusMinutes % 60

  const completedTasks = tasks.filter((t) => t.completed).length

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-sm font-medium tracking-wide">Report</DialogTitle>
        </DialogHeader>

        <div className="py-4">
          {/* Activity Summary */}
          <div className="space-y-4 mb-8">
            <h3 className="text-xs text-muted-foreground tracking-wide uppercase">Activity Summary</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="border border-border p-4 text-center">
                <Clock className="h-5 w-5 mx-auto mb-2 text-muted-foreground" />
                <p className="text-2xl font-light tabular-nums">
                  {hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`}
                </p>
                <p className="text-xs text-muted-foreground mt-1">focused</p>
              </div>
              <div className="border border-border p-4 text-center">
                <Calendar className="h-5 w-5 mx-auto mb-2 text-muted-foreground" />
                <p className="text-2xl font-light tabular-nums">{completedPomodoros}</p>
                <p className="text-xs text-muted-foreground mt-1">pomodoros</p>
              </div>
              <div className="border border-border p-4 text-center">
                <Flame className="h-5 w-5 mx-auto mb-2 text-muted-foreground" />
                <p className="text-2xl font-light tabular-nums">{completedTasks}</p>
                <p className="text-xs text-muted-foreground mt-1">tasks done</p>
              </div>
            </div>
          </div>

          {/* Task Summary */}
          {tasks.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-xs text-muted-foreground tracking-wide uppercase">Tasks</h3>
              <div className="space-y-2">
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between text-sm py-2 border-b border-border last:border-0"
                  >
                    <span className={task.completed ? "line-through text-muted-foreground" : ""}>{task.title}</span>
                    <span className="text-xs text-muted-foreground tabular-nums">
                      {task.completedPomodoros}/{task.estimatedPomodoros}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tasks.length === 0 && completedPomodoros === 0 && (
            <div className="text-center py-8 text-muted-foreground text-sm">
              No activity yet. Start your first pomodoro!
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
