"use client"

import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { AmbientSounds } from "@/components/ambient-sounds"
import { LanguageSwitcher } from "@/components/language-switcher"

interface ArticlesNavbarProps {
  locale: string
  backHref?: string
  backLabel?: string
}

export function ArticlesNavbar({ locale, backHref, backLabel = "Back to App" }: ArticlesNavbarProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link
          href={backHref || `/${locale}`}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          {backLabel}
        </Link>

        <div className="flex items-center gap-1">
          <ThemeToggle />
          <AmbientSounds />
          <LanguageSwitcher />
        </div>
      </div>
    </header>
  )
}
