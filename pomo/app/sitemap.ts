import { MetadataRoute } from "next"
import i18nConfig from "@/i18nConfig"
import { getAllArticles } from "@/lib/articles"

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://codefocus.io"
  const locales = i18nConfig.locales
  const defaultLocale = i18nConfig.defaultLocale

  // Static pages
  const pages = [
    { path: "", changeFrequency: "weekly" as const, priority: 1 },
    { path: "/premium", changeFrequency: "monthly" as const, priority: 0.7 },
    { path: "/signin", changeFrequency: "monthly" as const, priority: 0.5 },
    { path: "/articles", changeFrequency: "weekly" as const, priority: 0.8 },
  ]

  const entries: MetadataRoute.Sitemap = []

  // Add static pages for all locales
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

  // Add articles for all locales
  const articles = getAllArticles()
  for (const article of articles) {
    for (const locale of locales) {
      const articlePath = `/articles/${article.slug}`
      const url = locale === defaultLocale
        ? `${baseUrl}${articlePath}`
        : `${baseUrl}/${locale}${articlePath}`

      const alternates: Record<string, string> = {}
      for (const altLocale of locales) {
        alternates[altLocale] = altLocale === defaultLocale
          ? `${baseUrl}${articlePath}`
          : `${baseUrl}/${altLocale}${articlePath}`
      }
      alternates['x-default'] = `${baseUrl}${articlePath}`

      entries.push({
        url,
        lastModified: new Date(article.frontmatter.date),
        changeFrequency: "monthly" as const,
        priority: 0.6,
        alternates: {
          languages: alternates,
        },
      })
    }
  }

  return entries
}
