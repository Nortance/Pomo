import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import readingTime from 'reading-time';

const articlesDirectory = path.join(process.cwd(), 'content/articles');

export interface ArticleFrontmatter {
  title: string;
  description: string;
  date: string;
  author: string;
  image?: string;
  imageAttribution?: {
    photographer: string;
    photographerUrl: string;
    source: 'unsplash' | 'pexels' | 'pixabay';
  };
  tags?: string[];
  published?: boolean;
}

export interface Article {
  slug: string;
  frontmatter: ArticleFrontmatter;
  content: string;
  readingTime: string;
}

export interface ArticleMetadata {
  slug: string;
  frontmatter: ArticleFrontmatter;
  readingTime: string;
}

/**
 * Get all article slugs for static generation
 */
export function getArticleSlugs(): string[] {
  if (!fs.existsSync(articlesDirectory)) {
    return [];
  }

  const files = fs.readdirSync(articlesDirectory);
  return files
    .filter((file) => file.endsWith('.mdx'))
    .map((file) => file.replace(/\.mdx$/, ''));
}

/**
 * Get a single article by slug
 */
export function getArticleBySlug(slug: string): Article | null {
  const fullPath = path.join(articlesDirectory, `${slug}.mdx`);

  if (!fs.existsSync(fullPath)) {
    return null;
  }

  const fileContents = fs.readFileSync(fullPath, 'utf8');
  const { data, content } = matter(fileContents);
  const stats = readingTime(content);

  return {
    slug,
    frontmatter: data as ArticleFrontmatter,
    content,
    readingTime: stats.text,
  };
}

/**
 * Get all articles sorted by date (newest first)
 */
export function getAllArticles(): ArticleMetadata[] {
  const slugs = getArticleSlugs();

  const articles = slugs
    .map((slug) => {
      const article = getArticleBySlug(slug);
      if (!article) return null;

      return {
        slug: article.slug,
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
 * Get articles by tag
 */
export function getArticlesByTag(tag: string): ArticleMetadata[] {
  const articles = getAllArticles();
  return articles.filter((article) =>
    article.frontmatter.tags?.includes(tag)
  );
}

/**
 * Get all unique tags
 */
export function getAllTags(): string[] {
  const articles = getAllArticles();
  const tags = new Set<string>();

  articles.forEach((article) => {
    article.frontmatter.tags?.forEach((tag) => tags.add(tag));
  });

  return Array.from(tags).sort();
}
