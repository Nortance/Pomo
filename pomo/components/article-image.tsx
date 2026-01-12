'use client';

import Image from 'next/image';

type ImageSource = 'unsplash' | 'pexels' | 'pixabay';

interface ArticleImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  // Attribution fields
  photographer?: string;
  photographerUrl?: string;
  source?: ImageSource;
  sourceUrl?: string;
  // Optional custom attribution text
  customAttribution?: string;
}

const sourceLinks: Record<ImageSource, string> = {
  unsplash: 'https://unsplash.com',
  pexels: 'https://www.pexels.com',
  pixabay: 'https://pixabay.com',
};

const sourceNames: Record<ImageSource, string> = {
  unsplash: 'Unsplash',
  pexels: 'Pexels',
  pixabay: 'Pixabay',
};

export function ArticleImage({
  src,
  alt,
  width = 1200,
  height = 630,
  photographer,
  photographerUrl,
  source,
  sourceUrl,
  customAttribution,
}: ArticleImageProps) {
  const sourceName = source ? sourceNames[source] : null;
  const sourceLink = sourceUrl || (source ? sourceLinks[source] : null);

  return (
    <figure className="my-6 sm:my-8">
      <div className="relative overflow-hidden rounded-lg border border-border">
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          className="w-full h-auto object-cover"
          sizes="(max-width: 768px) 100vw, 800px"
        />
      </div>
      {(photographer || customAttribution) && (
        <figcaption className="mt-2 text-xs text-muted-foreground text-center">
          {customAttribution ? (
            customAttribution
          ) : (
            <>
              Photo by{' '}
              {photographerUrl ? (
                <a
                  href={photographerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-foreground transition-colors"
                >
                  {photographer}
                </a>
              ) : (
                photographer
              )}
              {sourceName && (
                <>
                  {' '}on{' '}
                  {sourceLink ? (
                    <a
                      href={sourceLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline hover:text-foreground transition-colors"
                    >
                      {sourceName}
                    </a>
                  ) : (
                    sourceName
                  )}
                </>
              )}
            </>
          )}
        </figcaption>
      )}
    </figure>
  );
}
