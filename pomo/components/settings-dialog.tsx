"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

interface Settings {
  pomodoro: number
  shortBreak: number
  longBreak: number
  autoStartBreaks: boolean
  autoStartPomodoros: boolean
  longBreakInterval: number
}

interface SettingsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  settings: Settings
  onSettingsChange: (settings: Settings) => void
}

export function SettingsDialog({ open, onOpenChange, settings, onSettingsChange }: SettingsDialogProps) {
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
                  max={99}
                  value={settings.pomodoro}
                  onChange={(e) => onSettingsChange({ ...settings, pomodoro: Number.parseInt(e.target.value) || 25 })}
                  className="text-sm"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Break</Label>
                <Input
                  type="number"
                  min={1}
                  max={99}
                  value={settings.shortBreak}
                  onChange={(e) => onSettingsChange({ ...settings, shortBreak: Number.parseInt(e.target.value) || 5 })}
                  className="text-sm"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Rest</Label>
                <Input
                  type="number"
                  min={1}
                  max={99}
                  value={settings.longBreak}
                  onChange={(e) => onSettingsChange({ ...settings, longBreak: Number.parseInt(e.target.value) || 15 })}
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
                onCheckedChange={(checked) => onSettingsChange({ ...settings, autoStartBreaks: checked })}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-sm">Auto Start Pomodoros</Label>
              <Switch
                checked={settings.autoStartPomodoros}
                onCheckedChange={(checked) => onSettingsChange({ ...settings, autoStartPomodoros: checked })}
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
              value={settings.longBreakInterval}
              onChange={(e) =>
                onSettingsChange({
                  ...settings,
                  longBreakInterval: Number.parseInt(e.target.value) || 4,
                })
              }
              className="text-sm w-20"
            />
            <p className="text-xs text-muted-foreground">Rest after every {settings.longBreakInterval} pomodoros</p>
          </div>
        </div>

        <div className="flex justify-end">
          <Button onClick={() => onOpenChange(false)}>Done</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
