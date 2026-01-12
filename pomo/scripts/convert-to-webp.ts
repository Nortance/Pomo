#!/usr/bin/env npx ts-node

/**
 * WebP Image Converter
 * Converts JPG/PNG images to WebP format for better SEO and performance
 *
 * Usage:
 *   npx ts-node scripts/convert-to-webp.ts <input> [options]
 *
 * Examples:
 *   npx ts-node scripts/convert-to-webp.ts public/images/articles/hero.jpg
 *   npx ts-node scripts/convert-to-webp.ts public/images/articles/hero.jpg --quality 85
 *   npx ts-node scripts/convert-to-webp.ts public/images/articles --all
 *
 * Options:
 *   --quality <n>  Quality 1-100 (default: 80)
 *   --all          Convert all images in directory
 *   --keep         Keep original files (default: delete after conversion)
 */

import sharp from 'sharp'
import * as fs from 'fs'
import * as path from 'path'

const SUPPORTED_EXTENSIONS = ['.jpg', '.jpeg', '.png']
const DEFAULT_QUALITY = 80

interface Options {
  quality: number
  all: boolean
  keep: boolean
}

function parseArgs(): { input: string; options: Options } {
  const args = process.argv.slice(2)

  if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
    console.log(`
WebP Image Converter - Convert images to WebP for better SEO

Usage:
  npx ts-node scripts/convert-to-webp.ts <input> [options]

Arguments:
  input           Path to image file or directory

Options:
  --quality <n>   Quality 1-100 (default: 80)
  --all           Convert all images in directory
  --keep          Keep original files (default: delete after conversion)
  --help, -h      Show this help message

Examples:
  # Convert single image
  npx ts-node scripts/convert-to-webp.ts public/images/articles/hero.jpg

  # Convert with custom quality
  npx ts-node scripts/convert-to-webp.ts public/images/articles/hero.jpg --quality 85

  # Convert all images in directory
  npx ts-node scripts/convert-to-webp.ts public/images/articles --all

  # Keep original files
  npx ts-node scripts/convert-to-webp.ts public/images/articles --all --keep
`)
    process.exit(0)
  }

  const options: Options = {
    quality: DEFAULT_QUALITY,
    all: false,
    keep: false,
  }

  let input = args[0]

  for (let i = 1; i < args.length; i++) {
    if (args[i] === '--quality' && args[i + 1]) {
      options.quality = parseInt(args[i + 1], 10)
      i++
    } else if (args[i] === '--all') {
      options.all = true
    } else if (args[i] === '--keep') {
      options.keep = true
    }
  }

  return { input, options }
}

async function convertToWebp(inputPath: string, quality: number, keep: boolean): Promise<void> {
  const ext = path.extname(inputPath).toLowerCase()

  if (!SUPPORTED_EXTENSIONS.includes(ext)) {
    console.log(`  Skipping ${inputPath} (unsupported format)`)
    return
  }

  const outputPath = inputPath.replace(/\.(jpg|jpeg|png)$/i, '.webp')

  if (fs.existsSync(outputPath)) {
    console.log(`  Skipping ${inputPath} (webp already exists)`)
    return
  }

  try {
    const inputStats = fs.statSync(inputPath)
    const inputSize = inputStats.size

    await sharp(inputPath)
      .webp({ quality })
      .toFile(outputPath)

    const outputStats = fs.statSync(outputPath)
    const outputSize = outputStats.size
    const savings = ((1 - outputSize / inputSize) * 100).toFixed(1)

    console.log(`  ✓ ${path.basename(inputPath)} → ${path.basename(outputPath)}`)
    console.log(`    ${formatBytes(inputSize)} → ${formatBytes(outputSize)} (${savings}% smaller)`)

    if (!keep) {
      fs.unlinkSync(inputPath)
      console.log(`    Deleted original: ${path.basename(inputPath)}`)
    }
  } catch (error) {
    console.error(`  ✗ Error converting ${inputPath}:`, error)
  }
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

async function main() {
  const { input, options } = parseArgs()

  const fullPath = path.resolve(input)

  if (!fs.existsSync(fullPath)) {
    console.error(`Error: Path not found: ${fullPath}`)
    process.exit(1)
  }

  const stats = fs.statSync(fullPath)

  console.log(`\nWebP Converter (quality: ${options.quality})\n`)

  if (stats.isDirectory()) {
    if (!options.all) {
      console.error('Error: Use --all flag to convert all images in directory')
      process.exit(1)
    }

    const files = fs.readdirSync(fullPath)
    const imageFiles = files.filter(f =>
      SUPPORTED_EXTENSIONS.includes(path.extname(f).toLowerCase())
    )

    if (imageFiles.length === 0) {
      console.log('No images found to convert.')
      return
    }

    console.log(`Converting ${imageFiles.length} image(s) in ${input}:\n`)

    for (const file of imageFiles) {
      await convertToWebp(path.join(fullPath, file), options.quality, options.keep)
    }
  } else {
    console.log(`Converting: ${input}\n`)
    await convertToWebp(fullPath, options.quality, options.keep)
  }

  console.log('\nDone!')
}

main().catch(console.error)
