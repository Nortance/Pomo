#!/usr/bin/env npx tsx
/**
 * Generate images using OpenAI's DALL-E API
 *
 * Usage:
 *   npx tsx scripts/generate-image.ts "prompt" --name filename
 *   npm run generate-image -- "cute kawaii desk setup" --name hero-image
 *
 * Pricing (as of 2024):
 *   DALL-E 3 1024x1024: $0.04/image
 *   DALL-E 3 1792x1024: $0.08/image
 *   DALL-E 2 1024x1024: $0.02/image
 */

import * as fs from 'fs';
import * as path from 'path';

// Load .env files
function loadEnv() {
  const envFiles = ['.env.local', '.env'];
  for (const file of envFiles) {
    const envPath = path.join(process.cwd(), file);
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf-8');
      for (const line of content.split('\n')) {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#')) {
          const [key, ...valueParts] = trimmed.split('=');
          const value = valueParts.join('=').replace(/^["']|["']$/g, '');
          if (key && value) {
            process.env[key] = value;
          }
        }
      }
    }
  }
}

loadEnv();

const OPENAI_API_KEY = process.env.OPENAI_API_KEY || process.env.OPEN_AI_API_KEY;

if (!OPENAI_API_KEY) {
  console.error('Error: OPENAI_API_KEY or OPEN_AI_API_KEY environment variable not set.');
  console.error('\nAdd to .env.local:');
  console.error('OPENAI_API_KEY=sk-...');
  process.exit(1);
}

interface GenerateOptions {
  prompt: string;
  name: string;
  model?: 'dall-e-3' | 'dall-e-2';
  size?: '1024x1024' | '1792x1024' | '1024x1792';
  quality?: 'standard' | 'hd';
  style?: 'vivid' | 'natural';
}

async function generateImage(options: GenerateOptions): Promise<string> {
  const {
    prompt,
    name,
    model = 'dall-e-3',
    size = '1792x1024', // Wide format for hero images
    quality = 'standard',
    style = 'vivid'
  } = options;

  console.log(`\nGenerating image with DALL-E...`);
  console.log(`Model: ${model}`);
  console.log(`Size: ${size}`);
  console.log(`Prompt: "${prompt}"`);

  const response = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model,
      prompt,
      n: 1,
      size,
      quality,
      style,
      response_format: 'url'
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`OpenAI API error: ${error.error?.message || JSON.stringify(error)}`);
  }

  const data = await response.json();
  const imageUrl = data.data[0].url;
  const revisedPrompt = data.data[0].revised_prompt;

  if (revisedPrompt) {
    console.log(`\nRevised prompt: "${revisedPrompt}"`);
  }

  // Download the image
  console.log('\nDownloading image...');
  const imageResponse = await fetch(imageUrl);
  const imageBuffer = Buffer.from(await imageResponse.arrayBuffer());

  // Save to public/images/articles/
  const outputDir = path.join(process.cwd(), 'public', 'images', 'articles');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const filename = `${name}.png`;
  const outputPath = path.join(outputDir, filename);
  fs.writeFileSync(outputPath, imageBuffer);

  console.log(`\n✓ Image saved to: public/images/articles/${filename}`);
  console.log(`\nFrontmatter for your article:`);
  console.log(`image: /images/articles/${filename}`);
  console.log(`imageAttribution:`);
  console.log(`  photographer: "DALL-E 3"`);
  console.log(`  photographerUrl: "https://openai.com/dall-e-3"`);
  console.log(`  source: openai`);

  return outputPath;
}

// Parse CLI arguments
function parseArgs(): GenerateOptions {
  const args = process.argv.slice(2);

  if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
    console.log(`
Generate images using OpenAI's DALL-E API

Usage:
  npx tsx scripts/generate-image.ts "prompt" --name filename [options]

Options:
  --name, -n     Output filename (without extension) [required]
  --model, -m    Model to use: dall-e-3 (default) or dall-e-2
  --size, -s     Image size: 1024x1024, 1792x1024 (default), 1024x1792
  --quality, -q  Quality: standard (default) or hd
  --style        Style: vivid (default) or natural

Examples:
  npx tsx scripts/generate-image.ts "cute kawaii desk with pink accessories" --name desk-setup
  npx tsx scripts/generate-image.ts "aesthetic study space pastel colors" -n study-hero --style natural
`);
    process.exit(0);
  }

  const prompt = args[0];
  let name = '';
  let model: 'dall-e-3' | 'dall-e-2' = 'dall-e-3';
  let size: '1024x1024' | '1792x1024' | '1024x1792' = '1792x1024';
  let quality: 'standard' | 'hd' = 'standard';
  let style: 'vivid' | 'natural' = 'vivid';

  for (let i = 1; i < args.length; i++) {
    const arg = args[i];
    const next = args[i + 1];

    if (arg === '--name' || arg === '-n') {
      name = next;
      i++;
    } else if (arg === '--model' || arg === '-m') {
      model = next as typeof model;
      i++;
    } else if (arg === '--size' || arg === '-s') {
      size = next as typeof size;
      i++;
    } else if (arg === '--quality' || arg === '-q') {
      quality = next as typeof quality;
      i++;
    } else if (arg === '--style') {
      style = next as typeof style;
      i++;
    }
  }

  if (!name) {
    console.error('Error: --name is required');
    process.exit(1);
  }

  return { prompt, name, model, size, quality, style };
}

// Main
const options = parseArgs();
generateImage(options)
  .then(() => {
    console.log('\nDone!');
  })
  .catch((error) => {
    console.error('\nError:', error.message);
    process.exit(1);
  });
