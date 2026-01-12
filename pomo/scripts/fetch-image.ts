#!/usr/bin/env npx tsx
/**
 * Fetch images from Unsplash for articles
 *
 * Usage:
 *   npx tsx scripts/fetch-image.ts "pomodoro productivity" --name hero-pomodoro
 *   npx tsx scripts/fetch-image.ts "developer coding" --name coding-focus --size 1200x630
 *
 * Prerequisites:
 *   1. Create free Unsplash account: https://unsplash.com/join
 *   2. Create app: https://unsplash.com/oauth/applications
 *   3. Set env var: UNSPLASH_ACCESS_KEY=your_key
 *
 * The script will:
 *   - Search Unsplash for images matching your query
 *   - Download the image to public/images/articles/
 *   - Output the attribution info for your MDX frontmatter
 */

import fs from 'fs';
import path from 'path';
import https from 'https';

const UNSPLASH_API = 'https://api.unsplash.com';
const OUTPUT_DIR = path.join(process.cwd(), 'public/images/articles');

interface UnsplashPhoto {
  id: string;
  urls: {
    raw: string;
    full: string;
    regular: string;
    small: string;
  };
  user: {
    name: string;
    username: string;
    links: {
      html: string;
    };
  };
  links: {
    download_location: string;
  };
}

async function fetchJson<T>(url: string, accessKey: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const urlWithAuth = url.includes('?')
      ? `${url}&client_id=${accessKey}`
      : `${url}?client_id=${accessKey}`;

    https.get(urlWithAuth, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(new Error(`Failed to parse response: ${data}`));
        }
      });
    }).on('error', reject);
  });
}

async function downloadImage(url: string, outputPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(outputPath);
    https.get(url, (response) => {
      // Handle redirects
      if (response.statusCode === 301 || response.statusCode === 302) {
        const redirectUrl = response.headers.location;
        if (redirectUrl) {
          https.get(redirectUrl, (res) => {
            res.pipe(file);
            file.on('finish', () => {
              file.close();
              resolve();
            });
          }).on('error', reject);
          return;
        }
      }
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', reject);
  });
}

async function triggerDownload(downloadLocation: string, accessKey: string): Promise<void> {
  // Unsplash requires you to trigger download endpoint for tracking
  await fetchJson(downloadLocation, accessKey);
}

function parseArgs(args: string[]): { query: string; name: string; size: string } {
  let query = '';
  let name = '';
  let size = '1200x630'; // Default OG image size

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--name' && args[i + 1]) {
      name = args[++i];
    } else if (arg === '--size' && args[i + 1]) {
      size = args[++i];
    } else if (!arg.startsWith('--')) {
      query = arg;
    }
  }

  return { query, name, size };
}

async function main() {
  const accessKey = process.env.UNSPLASH_ACCESS_KEY;

  if (!accessKey) {
    console.error(`
Error: UNSPLASH_ACCESS_KEY environment variable not set.

To get a free API key:
1. Create account: https://unsplash.com/join
2. Create app: https://unsplash.com/oauth/applications
3. Copy the Access Key
4. Run: UNSPLASH_ACCESS_KEY=your_key npx tsx scripts/fetch-image.ts "query"

Or add to .env.local:
UNSPLASH_ACCESS_KEY=your_key
`);
    process.exit(1);
  }

  const args = process.argv.slice(2);
  const { query, name, size } = parseArgs(args);

  if (!query) {
    console.error(`
Usage: npx tsx scripts/fetch-image.ts "search query" --name filename [--size WxH]

Examples:
  npx tsx scripts/fetch-image.ts "pomodoro timer" --name hero-pomodoro
  npx tsx scripts/fetch-image.ts "developer focus" --name coding --size 800x400
`);
    process.exit(1);
  }

  const fileName = name || query.toLowerCase().replace(/\s+/g, '-');
  const [width, height] = size.split('x').map(Number);

  console.log(`Searching Unsplash for: "${query}"...`);

  try {
    // Search for photos
    const searchUrl = `${UNSPLASH_API}/search/photos?query=${encodeURIComponent(query)}&per_page=5&orientation=landscape`;
    const searchResult = await fetchJson<{ results: UnsplashPhoto[] }>(searchUrl, accessKey);

    if (!searchResult.results || searchResult.results.length === 0) {
      console.error('No images found for query:', query);
      process.exit(1);
    }

    console.log(`Found ${searchResult.results.length} images. Showing top results:\n`);

    // Show options
    searchResult.results.forEach((photo, i) => {
      console.log(`[${i + 1}] "${photo.user.name}" - ${photo.urls.small}`);
    });

    // Use first result (or could prompt for selection)
    const photo = searchResult.results[0];

    console.log(`\nDownloading image by ${photo.user.name}...`);

    // Ensure output directory exists
    if (!fs.existsSync(OUTPUT_DIR)) {
      fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }

    // Build download URL with size parameters
    const downloadUrl = `${photo.urls.raw}&w=${width}&h=${height}&fit=crop&auto=format&q=80`;
    const outputPath = path.join(OUTPUT_DIR, `${fileName}.jpg`);

    // Download image
    await downloadImage(downloadUrl, outputPath);

    // Trigger download tracking (required by Unsplash API guidelines)
    await triggerDownload(photo.links.download_location, accessKey);

    console.log(`\n✓ Image saved to: public/images/articles/${fileName}.jpg`);

    // Output attribution info for MDX
    console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
COPY THIS TO YOUR MDX FRONTMATTER:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

image: /images/articles/${fileName}.jpg
imageAttribution:
  photographer: "${photo.user.name}"
  photographerUrl: "${photo.user.links.html}?utm_source=codefocus&utm_medium=referral"
  source: unsplash

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

FOR INLINE IMAGES, USE:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

<ArticleImage
  src="/images/articles/${fileName}.jpg"
  alt="Description here"
  photographer="${photo.user.name}"
  photographerUrl="${photo.user.links.html}?utm_source=codefocus&utm_medium=referral"
  source="unsplash"
/>

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`);

  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main();
