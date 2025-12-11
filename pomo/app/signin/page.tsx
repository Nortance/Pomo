import { Button } from "@/components/ui/button"
import { Timer, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function SignInPage() {
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
            <h1 className="text-base sm:text-lg font-medium">Sign In</h1>
          </div>

          {/* Coming Soon */}
          <div className="border border-border p-6 sm:p-8 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 text-xs border border-border mb-3 sm:mb-4">
              Coming Soon
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground mb-4 sm:mb-6">
              Account sync and cloud features are on the way. Stay tuned!
            </p>
            <div className="space-y-3">
              <Button className="w-full text-xs sm:text-sm" disabled>
                Sign in with Google
              </Button>
              <Button variant="outline" className="w-full bg-transparent text-xs sm:text-sm" disabled>
                Sign in with Email
              </Button>
            </div>
          </div>

          <p className="text-[10px] sm:text-xs text-center text-muted-foreground mt-4 sm:mt-6">
            We&apos;re working hard to bring you account features.
          </p>
        </div>
      </main>
    </div>
  )
}
