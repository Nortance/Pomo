import { Button } from "@/components/ui/button"
import { Timer, ArrowLeft, Check, Sparkles } from "lucide-react"
import Link from "next/link"

const features = [
  "Unlimited projects",
  "Advanced analytics & yearly reports",
  "Unlimited task templates",
  "Export data & reports",
  "Priority support",
  "No ads, ever",
  "All future updates",
]

export default function PremiumPage() {
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
            Back
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-8 sm:py-12">
        <div className="w-full max-w-lg">
          {/* Logo */}
          <div className="text-center mb-6 sm:mb-8">
            <div className="flex items-center justify-center gap-2 mb-3 sm:mb-4">
              <Timer className="h-6 w-6 sm:h-8 sm:w-8" />
              <span className="text-lg sm:text-xl font-medium tracking-tight">
                CodeFocus<span className="text-muted-foreground">.io</span>
              </span>
              <Sparkles className="h-4 w-4" />
            </div>
            <h1 className="text-base sm:text-lg font-medium">Premium</h1>
          </div>

          {/* Coming Soon Card */}
          <div className="border border-border p-4 sm:p-8">
            <div className="text-center mb-6 sm:mb-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 text-xs border border-border mb-3 sm:mb-4">
                Coming Soon
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Premium features are in development. Get notified when we launch.
              </p>
            </div>

            {/* Features */}
            <div className="space-y-2 sm:space-y-3 mb-6 sm:mb-8">
              <h3 className="text-[10px] sm:text-xs text-muted-foreground tracking-wide uppercase mb-3 sm:mb-4">
                What&apos;s included
              </h3>
              {features.map((feature) => (
                <div key={feature} className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm">
                  <Check className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>

            {/* Pricing Preview - responsive grid */}
            <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-6 sm:mb-8">
              <div className="border border-border p-2 sm:p-4 text-center">
                <p className="text-[10px] sm:text-xs text-muted-foreground mb-1">Monthly</p>
                <p className="text-lg sm:text-xl font-light">$5</p>
              </div>
              <div className="border border-foreground p-2 sm:p-4 text-center">
                <p className="text-[10px] sm:text-xs text-muted-foreground mb-1">Yearly</p>
                <p className="text-lg sm:text-xl font-light">$36</p>
              </div>
              <div className="border border-border p-2 sm:p-4 text-center">
                <p className="text-[10px] sm:text-xs text-muted-foreground mb-1">Lifetime</p>
                <p className="text-lg sm:text-xl font-light">$99</p>
              </div>
            </div>

            {/* CTA */}
            <Button className="w-full text-xs sm:text-sm" disabled>
              Notify Me
            </Button>
          </div>

          <p className="text-[10px] sm:text-xs text-center text-muted-foreground mt-4 sm:mt-6">
            Free tier will always be available with core features.
          </p>
        </div>
      </main>
    </div>
  )
}
