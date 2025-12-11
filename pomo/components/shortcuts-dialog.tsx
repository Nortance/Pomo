"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface ShortcutsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const shortcuts = [
  { key: "Space", action: "Start / Pause timer" },
  { key: "1", action: "Switch to Focus" },
  { key: "2", action: "Switch to Break" },
  { key: "3", action: "Switch to Rest" },
  { key: "T", action: "Add new task" },
  { key: "R", action: "Open / Close Report" },
  { key: "S", action: "Open / Close Settings" },
  { key: "?", action: "Open / Close Shortcuts" },
]

export function ShortcutsDialog({ open, onOpenChange }: ShortcutsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-sm font-medium tracking-wide">Keyboard Shortcuts</DialogTitle>
        </DialogHeader>

        <div className="py-4">
          <div className="space-y-3">
            {shortcuts.map(({ key, action }) => (
              <div key={key} className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{action}</span>
                <kbd className="px-2 py-1 text-xs border border-border bg-muted font-mono">{key}</kbd>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
