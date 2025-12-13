"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import type { Settings, Goals } from "@/lib/types"

interface SettingsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  settings: Settings
  goals: Goals
  onSettingsChange: (settings: Partial<Settings>) => void
  onGoalsChange: (goals: Partial<Goals>) => void
}

export function SettingsDialog({
  open,
  onOpenChange,
  settings,
  goals,
  onSettingsChange,
  onGoalsChange,
}: SettingsDialogProps) {
  // Local state for inputs to allow intermediate editing (empty values while typing)
  const [pomodoro, setPomodoro] = useState(String(settings.pomodoro))
  const [shortBreak, setShortBreak] = useState(String(settings.shortBreak))
  const [longBreak, setLongBreak] = useState(String(settings.longBreak))
  const [longBreakInterval, setLongBreakInterval] = useState(String(settings.longBreakInterval))

  // Sync local state when settings change externally
  useEffect(() => {
    setPomodoro(String(settings.pomodoro))
    setShortBreak(String(settings.shortBreak))
    setLongBreak(String(settings.longBreak))
    setLongBreakInterval(String(settings.longBreakInterval))
  }, [settings.pomodoro, settings.shortBreak, settings.longBreak, settings.longBreakInterval])

  const handleBlur = (field: keyof Settings, value: string, fallback: number) => {
    const val = Number.parseInt(value)
    if (isNaN(val) || val < 1) {
      // Reset to current setting if invalid
      if (field === "pomodoro") setPomodoro(String(settings.pomodoro))
      else if (field === "shortBreak") setShortBreak(String(settings.shortBreak))
      else if (field === "longBreak") setLongBreak(String(settings.longBreak))
      else if (field === "longBreakInterval") setLongBreakInterval(String(settings.longBreakInterval))
    } else {
      const max = field === "longBreakInterval" ? 10 : 240
      const clamped = Math.min(Math.max(1, val), max)
      onSettingsChange({ [field]: clamped })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-sm font-medium tracking-wide">Settings</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Timer Section */}
          <div className="space-y-4">
            <h3 className="text-xs text-muted-foreground tracking-wide uppercase">Timer (minutes)</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-xs">Focus</Label>
                <Input
                  type="number"
                  min={1}
                  max={240}
                  value={pomodoro}
                  onChange={(e) => setPomodoro(e.target.value)}
                  onBlur={() => handleBlur("pomodoro", pomodoro, 25)}
                  className="text-sm"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Break</Label>
                <Input
                  type="number"
                  min={1}
                  max={240}
                  value={shortBreak}
                  onChange={(e) => setShortBreak(e.target.value)}
                  onBlur={() => handleBlur("shortBreak", shortBreak, 5)}
                  className="text-sm"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Rest</Label>
                <Input
                  type="number"
                  min={1}
                  max={240}
                  value={longBreak}
                  onChange={(e) => setLongBreak(e.target.value)}
                  onBlur={() => handleBlur("longBreak", longBreak, 15)}
                  className="text-sm"
                />
              </div>
            </div>
          </div>

          {/* Auto Start Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-sm">Auto Start Breaks</Label>
              <Switch
                checked={settings.autoStartBreaks}
                onCheckedChange={(checked) => onSettingsChange({ autoStartBreaks: checked })}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-sm">Auto Start Pomodoros</Label>
              <Switch
                checked={settings.autoStartPomodoros}
                onCheckedChange={(checked) => onSettingsChange({ autoStartPomodoros: checked })}
              />
            </div>
          </div>

          {/* Rest Interval */}
          <div className="space-y-2">
            <Label className="text-sm">Rest Interval</Label>
            <Input
              type="number"
              min={1}
              max={10}
              value={longBreakInterval}
              onChange={(e) => setLongBreakInterval(e.target.value)}
              onBlur={() => handleBlur("longBreakInterval", longBreakInterval, 4)}
              className="text-sm w-20"
            />
            <p className="text-xs text-muted-foreground">Rest after every {settings.longBreakInterval} pomodoros</p>
          </div>

          {/* Goals Section */}
          <div className="space-y-4">
            <h3 className="text-xs text-muted-foreground tracking-wide uppercase">Goals (pomodoros)</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs">Daily Pomo Goal</Label>
                <Input
                  type="number"
                  min={0}
                  max={50}
                  value={goals.dailyPomodoros ?? ""}
                  placeholder="Not set"
                  onChange={(e) => {
                    if (e.target.value === "") {
                      onGoalsChange({ dailyPomodoros: null })
                    } else {
                      const val = Number.parseInt(e.target.value)
                      if (!isNaN(val)) onGoalsChange({ dailyPomodoros: Math.min(Math.max(1, val), 50) })
                    }
                  }}
                  className="text-sm"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Weekly Pomo Goal</Label>
                <Input
                  type="number"
                  min={0}
                  max={200}
                  value={goals.weeklyPomodoros ?? ""}
                  placeholder="Not set"
                  onChange={(e) => {
                    if (e.target.value === "") {
                      onGoalsChange({ weeklyPomodoros: null })
                    } else {
                      const val = Number.parseInt(e.target.value)
                      if (!isNaN(val)) onGoalsChange({ weeklyPomodoros: Math.min(Math.max(1, val), 200) })
                    }
                  }}
                  className="text-sm"
                />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Set goals to track your progress. Leave empty to disable.
            </p>
          </div>
        </div>

        <div className="flex justify-end">
          <Button onClick={() => onOpenChange(false)}>Done</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
