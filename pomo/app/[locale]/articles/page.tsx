import Link from 'next/link';
import Image from 'next/image';
import { getAllArticles } from '@/lib/articles';
import { getTranslations } from '@/lib/translations';
import { ArrowLeft, Clock, Calendar } from 'lucide-react';

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations(locale);

  return {
    title: `Articles | ${t('meta.title')}`,
    description: 'Productivity tips, Pomodoro technique guides, and developer focus strategies.',
  };
}

export default async function ArticlesPage({ params }: Props) {
  const { locale } = await params;
  const articles = getAllArticles();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Link
            href={`/${locale}`}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to App
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="mb-12">
          <h1 className="text-4xl font-bold tracking-tight mb-4">Articles</h1>
          <p className="text-lg text-muted-foreground">
            Productivity tips, Pomodoro technique guides, and strategies for staying focused as a developer.
          </p>
        </div>

        {articles.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-border rounded-lg">
            <p className="text-muted-foreground">No articles yet. Check back soon!</p>
          </div>
        ) : (
          <div className="grid gap-8">
            {articles.map((article) => (
              <Link
                key={article.slug}
                href={`/${locale}/articles/${article.slug}`}
                className="group block"
              >
                <article className="border border-border rounded-lg overflow-hidden hover:border-foreground/20 transition-colors">
                  {article.frontmatter.image && (
                    <div className="relative h-48 sm:h-64 overflow-hidden">
                      <Image
                        src={article.frontmatter.image}
                        alt={article.frontmatter.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 768px) 100vw, 800px"
                      />
                    </div>
                  )}
                  <div className="p-6">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(article.frontmatter.date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {article.readingTime}
                      </span>
                    </div>
                    <h2 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                      {article.frontmatter.title}
                    </h2>
                    <p className="text-muted-foreground line-clamp-2">
                      {article.frontmatter.description}
                    </p>
                    {article.frontmatter.tags && article.frontmatter.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-4">
                        {article.frontmatter.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-1 text-xs bg-muted rounded-md"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </article>
              </Link>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-16">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} CodeFocus</p>
            <Link href={`/${locale}`} className="hover:text-foreground transition-colors">
              Back to App
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
