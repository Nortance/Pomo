"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useTranslations } from "@/hooks/use-translations"

interface ShortcutsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ShortcutsDialog({ open, onOpenChange }: ShortcutsDialogProps) {
  const { t } = useTranslations()

  const shortcuts = [
    { key: "Space", action: t('shortcuts.startPause') },
    { key: "1", action: t('shortcuts.switchFocus') },
    { key: "2", action: t('shortcuts.switchBreak') },
    { key: "3", action: t('shortcuts.switchRest') },
    { key: "T", action: t('shortcuts.addTask') },
    { key: "R", action: t('shortcuts.openReport') },
    { key: "S", action: t('shortcuts.openSettings') },
    { key: "?", action: t('shortcuts.openShortcuts') },
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-sm font-medium tracking-wide">{t('shortcuts.title')}</DialogTitle>
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
