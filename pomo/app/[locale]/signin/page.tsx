"use client"

import { Button } from "@/components/ui/button"
import { Timer, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useTranslations } from "@/hooks/use-translations"

export default function SignInPage() {
  const { t } = useTranslations()
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border">
        <div className="max-w-3xl mx-auto px-4 py-3 sm:py-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            {t('common.back')}
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-sm">
          {/* Logo */}
          <div className="text-center mb-6 sm:mb-8">
            <div className="flex items-center justify-center gap-2 mb-3 sm:mb-4">
              <Timer className="h-6 w-6 sm:h-8 sm:w-8" />
              <span className="text-lg sm:text-xl font-medium tracking-tight">
                CodeFocus<span className="text-muted-foreground">.io</span>
              </span>
            </div>
            <h1 className="text-base sm:text-lg font-medium">{t('signin.title')}</h1>
          </div>

          {/* Coming Soon */}
          <div className="border border-border p-6 sm:p-8 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 text-xs border border-border mb-3 sm:mb-4">
              {t('common.comingSoon')}
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground mb-4 sm:mb-6">
              {t('signin.description')}
            </p>
            <div className="space-y-3">
              <Button className="w-full text-xs sm:text-sm" disabled>
                {t('signin.withGoogle')}
              </Button>
              <Button variant="outline" className="w-full bg-transparent text-xs sm:text-sm" disabled>
                {t('signin.withEmail')}
              </Button>
            </div>
          </div>

          <p className="text-[10px] sm:text-xs text-center text-muted-foreground mt-4 sm:mt-6">
            {t('signin.workingHard')}
          </p>
        </div>
      </main>
    </div>
  )
}
