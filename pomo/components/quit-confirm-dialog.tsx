"use client"

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useTranslations } from "@/hooks/use-translations"
import Image from "next/image"

interface QuitConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
}

export function QuitConfirmDialog({ open, onOpenChange, onConfirm }: QuitConfirmDialogProps) {
  const { t } = useTranslations()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xs text-center">
        <DialogTitle className="sr-only">Quit focus session?</DialogTitle>
        <div className="py-4">
          <div className="flex justify-center mb-4">
            <Image
              src="/ghosts/ghost-surprise.webp"
              alt="Worried ghost"
              width={80}
              height={80}
              className="w-16 h-16 object-contain animate-float-slow"
            />
          </div>
          <h2 className="text-lg font-medium mb-2">{t('quit.title')}</h2>
          <p className="text-sm text-muted-foreground mb-6">{t('quit.description')}</p>
          <div className="flex gap-3 justify-center">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="px-6"
            >
              {t('quit.stay')}
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                onConfirm()
                onOpenChange(false)
              }}
              className="px-6"
            >
              {t('quit.leave')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
