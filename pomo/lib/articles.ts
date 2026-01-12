import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import readingTime from 'reading-time';

const articlesBaseDirectory = path.join(process.cwd(), 'content/articles');
const DEFAULT_LOCALE = 'en';

export interface ArticleFrontmatter {
  title: string;
  description: string;
  date: string;
  author: string;
  image?: string;
  imageAttribution?: {
    photographer: string;
    photographerUrl: string;
    source: 'unsplash' | 'pexels' | 'pixabay' | 'openai';
  };
  tags?: string[];
  published?: boolean;
}

export interface Article {
  slug: string;
  locale: string;
  frontmatter: ArticleFrontmatter;
  content: string;
  readingTime: string;
}

export interface ArticleMetadata {
  slug: string;
  locale: string;
  frontmatter: ArticleFrontmatter;
  readingTime: string;
}

/**
 * Get the articles directory for a specific locale
 */
function getArticlesDirectory(locale: string): string {
  return path.join(articlesBaseDirectory, locale);
}

/**
 * Get all article slugs for static generation
 * Returns slugs from the default locale (en)
 */
export function getArticleSlugs(): string[] {
  const directory = getArticlesDirectory(DEFAULT_LOCALE);

  if (!fs.existsSync(directory)) {
    return [];
  }

  const files = fs.readdirSync(directory);
  return files
    .filter((file) => file.endsWith('.mdx'))
    .map((file) => file.replace(/\.mdx$/, ''));
}

/**
 * Get a single article by slug and locale
 * Falls back to English if translation doesn't exist
 */
export function getArticleBySlug(slug: string, locale: string = DEFAULT_LOCALE): Article | null {
  // Try requested locale first
  let fullPath = path.join(getArticlesDirectory(locale), `${slug}.mdx`);
  let usedLocale = locale;

  // Fall back to English if translation doesn't exist
  if (!fs.existsSync(fullPath) && locale !== DEFAULT_LOCALE) {
    fullPath = path.join(getArticlesDirectory(DEFAULT_LOCALE), `${slug}.mdx`);
    usedLocale = DEFAULT_LOCALE;
  }

  if (!fs.existsSync(fullPath)) {
    return null;
  }

  const fileContents = fs.readFileSync(fullPath, 'utf8');
  const { data, content } = matter(fileContents);
  const stats = readingTime(content);

  return {
    slug,
    locale: usedLocale,
    frontmatter: data as ArticleFrontmatter,
    content,
    readingTime: stats.text,
  };
}

/**
 * Check if an article has a translation for a specific locale
 */
export function hasTranslation(slug: string, locale: string): boolean {
  const fullPath = path.join(getArticlesDirectory(locale), `${slug}.mdx`);
  return fs.existsSync(fullPath);
}

/**
 * Get available locales for an article
 */
export function getArticleLocales(slug: string): string[] {
  const locales: string[] = [];

  if (!fs.existsSync(articlesBaseDirectory)) {
    return locales;
  }

  const localeDirs = fs.readdirSync(articlesBaseDirectory);

  for (const localeDir of localeDirs) {
    const localePath = path.join(articlesBaseDirectory, localeDir);
    if (fs.statSync(localePath).isDirectory()) {
      const articlePath = path.join(localePath, `${slug}.mdx`);
      if (fs.existsSync(articlePath)) {
        locales.push(localeDir);
      }
    }
  }

  return locales;
}

/**
 * Get all articles for a locale, sorted by date (newest first)
 * Falls back to English for articles without translations
 */
export function getAllArticles(locale: string = DEFAULT_LOCALE): ArticleMetadata[] {
  const slugs = getArticleSlugs();

  const articles = slugs
    .map((slug) => {
      const article = getArticleBySlug(slug, locale);
      if (!article) return null;

      return {
        slug: article.slug,
        locale: article.locale,
        frontmatter: article.frontmatter,
        readingTime: article.readingTime,
      };
    })
    .filter((article): article is ArticleMetadata => article !== null)
    .filter((article) => article.frontmatter.published !== false)
    .sort((a, b) => {
      const dateA = new Date(a.frontmatter.date);
      const dateB = new Date(b.frontmatter.date);
      return dateB.getTime() - dateA.getTime();
    });

  return articles;
}

/**
 * Get articles by tag for a specific locale
 */
export function getArticlesByTag(tag: string, locale: string = DEFAULT_LOCALE): ArticleMetadata[] {
  const articles = getAllArticles(locale);
  return articles.filter((article) =>
    article.frontmatter.tags?.includes(tag)
  );
}

/**
 * Get all unique tags across all articles
 */
export function getAllTags(locale: string = DEFAULT_LOCALE): string[] {
  const articles = getAllArticles(locale);
  const tags = new Set<string>();

  articles.forEach((article) => {
    article.frontmatter.tags?.forEach((tag) => tags.add(tag));
  });

  return Array.from(tags).sort();
}
