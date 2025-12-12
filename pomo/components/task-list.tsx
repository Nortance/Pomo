"use client"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Plus, MoreVertical, Trash2, Target } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface Task {
  id: string
  title: string
  estimatedPomodoros: number
  completedPomodoros: number
  note?: string
  completed: boolean
}

interface TaskListProps {
  tasks: Task[]
  activeTaskId: string | null
  onSelectTask: (id: string | null) => void
  onAddTask: () => void
  onUpdateTask: (id: string, updates: Partial<Task>) => void
  onDeleteTask: (id: string) => void
}

export function TaskList({ tasks, activeTaskId, onSelectTask, onAddTask, onUpdateTask, onDeleteTask }: TaskListProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <h2 className="text-xs sm:text-sm font-medium tracking-wide">Tasks</h2>
        <div className="flex items-center gap-1">
          <kbd className="hidden sm:flex h-5 px-1.5 bg-muted text-muted-foreground text-[10px] items-center">T</kbd>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Task options">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => tasks.forEach((t) => onUpdateTask(t.id, { completed: false }))}>
                Clear finished
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => tasks.forEach((t) => onDeleteTask(t.id))}>Clear all</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="space-y-2">
        {tasks.length === 0 && (
          <div className="border border-dashed border-border p-6 sm:p-8 text-center">
            <Target className="h-6 w-6 sm:h-8 sm:w-8 mx-auto mb-2 sm:mb-3 text-muted-foreground/50" />
            <p className="text-xs sm:text-sm text-muted-foreground mb-1">No tasks yet</p>
            <p className="text-[10px] sm:text-xs text-muted-foreground">Add a task to track your focus sessions</p>
          </div>
        )}

        {tasks.map((task) => (
          <div
            key={task.id}
            className={`group border border-border p-3 sm:p-4 cursor-pointer transition-all duration-150 ${
              activeTaskId === task.id
                ? "bg-muted border-foreground"
                : "hover:bg-muted/50 hover:border-muted-foreground/30"
            } ${task.completed ? "opacity-50" : ""}`}
            onClick={() => onSelectTask(task.id === activeTaskId ? null : task.id)}
          >
            <div className="flex items-start gap-2 sm:gap-3">
              <Checkbox
                checked={task.completed}
                onCheckedChange={(checked) => {
                  onUpdateTask(task.id, { completed: checked as boolean })
                }}
                onClick={(e) => e.stopPropagation()}
                className="mt-0.5"
              />
              <div className="flex-1 min-w-0">
                <p className={`text-xs sm:text-sm ${task.completed ? "line-through text-muted-foreground" : ""}`}>
                  {task.title}
                </p>
                {task.note && <p className="text-[10px] sm:text-xs text-muted-foreground mt-1 truncate">{task.note}</p>}
              </div>
              <div className="flex items-center gap-1 sm:gap-2">
                <div className="flex gap-0.5 mr-1 hidden sm:flex">
                  {Array.from({ length: task.estimatedPomodoros }).map((_, i) => (
                    <div
                      key={i}
                      className={`w-1.5 h-1.5 ${i < task.completedPomodoros ? "bg-foreground" : "bg-border"}`}
                    />
                  ))}
                </div>
                <span className="text-[10px] sm:text-xs text-muted-foreground tabular-nums">
                  {task.completedPomodoros}/{task.estimatedPomodoros}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation()
                    onDeleteTask(task.id)
                  }}
                  aria-label="Delete task"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>
        ))}

        <button
          onClick={onAddTask}
          className="w-full border border-dashed border-border p-3 sm:p-4 text-xs sm:text-sm text-muted-foreground hover:text-foreground hover:border-foreground hover:bg-muted/30 transition-all duration-150 flex items-center justify-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Task
        </button>
      </div>
    </div>
  )
}
