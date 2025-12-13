import type React from "react"
import type { Metadata } from "next"

import "./globals.css"

import { ThemeProvider } from "@/components/theme-provider"

import { Geist_Mono as V0_Font_Geist_Mono, Montserrat } from 'next/font/google'

// Initialize fonts
const _geistMono = V0_Font_Geist_Mono({ subsets: ['latin'], weight: ["100","200","300","400","500","600","700","800","900"] })
const montserrat = Montserrat({ subsets: ['latin'], variable: '--font-montserrat' })

export const metadata: Metadata = {
  // Basic Meta
  title: {
    default: "CodeFocus.io — Pomodoro Timer for Developers",
    template: "%s | CodeFocus.io",
  },
  description: "A minimal pomodoro timer for developers and entrepreneurs. Free online focus timer with dark mode, keyboard shortcuts, and clean design to boost your productivity.",
  keywords: [
    "pomodoro timer",
    "pomodoro timer for developers",
    "pomodoro timer for coding",
    "focus timer",
    "productivity timer",
    "pomodoro technique",
    "coding timer",
    "minimalist pomodoro",
    "free pomodoro timer online",
    "dark mode timer",
    "pomodoro app",
    "time management",
    "study timer",
    "work timer",
    "concentration timer",
    "task timer",
    "productivity app",
    "focus app for developers",
  ],
  authors: [{ name: "CodeFocus", url: "https://codefocus.io" }],
  creator: "CodeFocus",
  publisher: "CodeFocus",

  // URL & Canonical
  metadataBase: new URL("https://codefocus.io"),
  alternates: {
    canonical: "/",
    languages: {
      "en-US": "/",
    },
  },

  // Icons & Manifest
  icons: {
    icon: "/icon.png",
    shortcut: "/icon.png",
    apple: "/apple-icon.png",
  },
  manifest: "/manifest.json",

  // App-specific
  applicationName: "CodeFocus.io",
  category: "productivity",
  classification: "Productivity, Time Management, Developer Tools",

  // Open Graph
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://codefocus.io",
    siteName: "CodeFocus.io",
    title: "CodeFocus.io — Pomodoro Timer for Developers",
    description: "A minimal pomodoro timer for developers and entrepreneurs. Free online focus timer with dark mode, keyboard shortcuts, and clean design.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "CodeFocus.io - Pomodoro Timer for Developers",
        type: "image/png",
      },
    ],
  },

  // Twitter
  twitter: {
    card: "summary_large_image",
    title: "CodeFocus.io — Pomodoro Timer for Developers",
    description: "A minimal pomodoro timer for developers and entrepreneurs. Free online focus timer with dark mode and keyboard shortcuts.",
    images: ["/og-image.png"],
    creator: "@codefocus",
    site: "@codefocus",
  },

  // Robots
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  // Verification (add your codes after setup)
  verification: {
    // google: "your-google-verification-code",
    // yandex: "your-yandex-verification-code",
    // bing: "your-bing-verification-code",
  },

  // Other
  referrer: "origin-when-cross-origin",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },

  // App Links
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "CodeFocus.io",
  },

  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "black-translucent",
    "theme-color": "#8b5cf6",
    "msapplication-TileColor": "#8b5cf6",
  },
}

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebApplication",
      "@id": "https://codefocus.io/#app",
      name: "CodeFocus.io",
      description: "A minimal pomodoro timer for developers and entrepreneurs. Free online focus timer with dark mode, keyboard shortcuts, and clean design.",
      url: "https://codefocus.io",
      applicationCategory: "ProductivityApplication",
      operatingSystem: "Any",
      browserRequirements: "Requires JavaScript. Requires HTML5.",
      softwareVersion: "1.0.0",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
        availability: "https://schema.org/InStock",
      },
      featureList: [
        "Pomodoro Timer (25 minutes)",
        "Short Break Timer (5 minutes)",
        "Long Break Timer (15 minutes)",
        "Task Management",
        "Dark Mode",
        "Keyboard Shortcuts",
        "Progress Tracking",
        "Customizable Timer Durations",
        "Auto-start Breaks",
        "Session Statistics",
      ],
      screenshot: "https://codefocus.io/og-image.png",
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: "5",
        ratingCount: "1",
        bestRating: "5",
        worstRating: "1",
      },
    },
    {
      "@type": "WebSite",
      "@id": "https://codefocus.io/#website",
      url: "https://codefocus.io",
      name: "CodeFocus.io",
      description: "Pomodoro Timer for Developers",
      publisher: {
        "@id": "https://codefocus.io/#organization",
      },
    },
    {
      "@type": "Organization",
      "@id": "https://codefocus.io/#organization",
      name: "CodeFocus",
      url: "https://codefocus.io",
      logo: {
        "@type": "ImageObject",
        url: "https://codefocus.io/icon-512.png",
        width: 512,
        height: 512,
      },
      sameAs: [],
    },
    {
      "@type": "BreadcrumbList",
      "@id": "https://codefocus.io/#breadcrumb",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: "https://codefocus.io",
        },
      ],
    },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={`font-sans antialiased ${montserrat.variable}`}>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  )
}
