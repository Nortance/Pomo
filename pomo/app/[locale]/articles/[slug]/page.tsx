import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { MDXRemote } from 'next-mdx-remote/rsc';
import remarkGfm from 'remark-gfm';
import { getArticleBySlug, getArticleSlugs } from '@/lib/articles';
import { getTranslations } from '@/lib/translations';
import { ArticleImage } from '@/components/article-image';
import { ArticlesNavbar } from '@/components/articles-navbar';
import { Clock, Calendar, User } from 'lucide-react';

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

// Generate static params for all articles
export async function generateStaticParams() {
  const slugs = getArticleSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props) {
  const { locale, slug } = await params;
  const article = getArticleBySlug(slug, locale);

  if (!article) {
    return { title: 'Article Not Found' };
  }

  const t = await getTranslations(locale);

  return {
    title: `${article.frontmatter.title} | ${t('meta.title')}`,
    description: article.frontmatter.description,
    openGraph: {
      title: article.frontmatter.title,
      description: article.frontmatter.description,
      type: 'article',
      publishedTime: article.frontmatter.date,
      authors: [article.frontmatter.author],
      images: article.frontmatter.image ? [article.frontmatter.image] : undefined,
    },
  };
}

// MDX components mapping
const components = {
  ArticleImage,
  // Custom styling for standard elements
  h1: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h1 className="text-3xl font-bold mt-8 mb-4" {...props} />
  ),
  h2: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h2 className="text-2xl font-semibold mt-8 mb-4" {...props} />
  ),
  h3: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h3 className="text-xl font-semibold mt-6 mb-3" {...props} />
  ),
  p: (props: React.HTMLAttributes<HTMLParagraphElement>) => (
    <p className="my-4 leading-relaxed" {...props} />
  ),
  ul: (props: React.HTMLAttributes<HTMLUListElement>) => (
    <ul className="my-4 ml-6 list-disc space-y-2" {...props} />
  ),
  ol: (props: React.HTMLAttributes<HTMLOListElement>) => (
    <ol className="my-4 ml-6 list-decimal space-y-2" {...props} />
  ),
  li: (props: React.HTMLAttributes<HTMLLIElement>) => (
    <li className="leading-relaxed" {...props} />
  ),
  blockquote: (props: React.HTMLAttributes<HTMLQuoteElement>) => (
    <blockquote className="my-6 border-l-4 border-muted pl-4 italic text-muted-foreground" {...props} />
  ),
  a: (props: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a className="text-primary underline hover:no-underline" {...props} />
  ),
  code: (props: React.HTMLAttributes<HTMLElement>) => (
    <code className="px-1.5 py-0.5 bg-muted rounded text-sm font-mono" {...props} />
  ),
  pre: (props: React.HTMLAttributes<HTMLPreElement>) => (
    <pre className="my-4 p-4 bg-muted rounded-lg overflow-x-auto" {...props} />
  ),
  hr: () => <hr className="my-8 border-border" />,
};

export default async function ArticlePage({ params }: Props) {
  const { locale, slug } = await params;
  const article = getArticleBySlug(slug, locale);

  if (!article) {
    notFound();
  }

  const { frontmatter, content, readingTime } = article;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <ArticlesNavbar
        locale={locale}
        backHref={`/${locale}/articles`}
        backLabel="Back to Articles"
      />

      {/* Article */}
      <article className="max-w-3xl mx-auto px-4 py-12">
        {/* Hero Image */}
        {frontmatter.image && (
          <figure className="mb-8">
            <div className="relative aspect-[2/1] overflow-hidden rounded-lg border border-border">
              <Image
                src={frontmatter.image}
                alt={frontmatter.title}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 768px) 100vw, 800px"
              />
            </div>
            {frontmatter.imageAttribution && (
              <figcaption className="mt-2 text-xs text-muted-foreground text-center">
                Photo by{' '}
                <a
                  href={frontmatter.imageAttribution.photographerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-foreground transition-colors"
                >
                  {frontmatter.imageAttribution.photographer}
                </a>
                {' '}on{' '}
                <a
                  href={`https://${frontmatter.imageAttribution.source}.com`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-foreground transition-colors"
                >
                  {frontmatter.imageAttribution.source.charAt(0).toUpperCase() +
                    frontmatter.imageAttribution.source.slice(1)}
                </a>
              </figcaption>
            )}
          </figure>
        )}

        {/* Title & Meta */}
        <header className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight mb-4">
            {frontmatter.title}
          </h1>
          <p className="text-xl text-muted-foreground mb-6">
            {frontmatter.description}
          </p>
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <User className="h-4 w-4" />
              {frontmatter.author}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {new Date(frontmatter.date).toLocaleDateString(locale, {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {readingTime}
            </span>
          </div>
          {frontmatter.tags && frontmatter.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {frontmatter.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-1 text-xs bg-muted rounded-md"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </header>

        {/* Content */}
        <div className="prose prose-neutral dark:prose-invert max-w-none">
          <MDXRemote
            source={content}
            components={components}
            options={{
              mdxOptions: {
                remarkPlugins: [remarkGfm],
              },
            }}
          />
        </div>

        {/* CTA */}
        <div className="mt-12 p-6 border border-border rounded-lg bg-muted/30">
          <h3 className="text-lg font-semibold mb-2">Ready to boost your focus?</h3>
          <p className="text-muted-foreground mb-4">
            Try CodeFocus - the Pomodoro timer built for developers.
          </p>
          <Link
            href={`/${locale}`}
            className="inline-flex items-center px-4 py-2 bg-foreground text-background rounded-md hover:opacity-90 transition-opacity"
          >
            Try CodeFocus Free
          </Link>
        </div>
      </article>

      {/* Footer */}
      <footer className="border-t border-border mt-16">
        <div className="max-w-3xl mx-auto px-4 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} CodeFocus</p>
            <div className="flex gap-4">
              <Link href={`/${locale}/articles`} className="hover:text-foreground transition-colors">
                All Articles
              </Link>
              <Link href={`/${locale}`} className="hover:text-foreground transition-colors">
                Back to App
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
