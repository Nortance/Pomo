import { MetadataRoute } from "next"
import i18nConfig from "@/i18nConfig"

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://codefocus.io"
  const locales = i18nConfig.locales
  const defaultLocale = i18nConfig.defaultLocale

  const pages = [
    { path: "", changeFrequency: "weekly" as const, priority: 1 },
    { path: "/premium", changeFrequency: "monthly" as const, priority: 0.7 },
    { path: "/signin", changeFrequency: "monthly" as const, priority: 0.5 },
  ]

  const entries: MetadataRoute.Sitemap = []

  for (const page of pages) {
    for (const locale of locales) {
      const url = locale === defaultLocale
        ? `${baseUrl}${page.path}`
        : `${baseUrl}/${locale}${page.path}`

      const alternates: Record<string, string> = {}
      for (const altLocale of locales) {
        alternates[altLocale] = altLocale === defaultLocale
          ? `${baseUrl}${page.path}`
          : `${baseUrl}/${altLocale}${page.path}`
      }
      alternates['x-default'] = `${baseUrl}${page.path}`

      entries.push({
        url,
        lastModified: new Date(),
        changeFrequency: page.changeFrequency,
        priority: page.priority,
        alternates: {
          languages: alternates,
        },
      })
    }
  }

  return entries
}
