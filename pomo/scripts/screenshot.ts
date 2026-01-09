/**
 * Automated screenshot capture for development
 * Takes viewport-sized segments of the page (not full-page screenshots)
 *
 * Usage:
 *   npx tsx scripts/screenshot.ts                    # Desktop segments (dark theme)
 *   npx tsx scripts/screenshot.ts --mobile           # Mobile segments
 *   npx tsx scripts/screenshot.ts --no-clean         # Keep old screenshots
 *   npx tsx scripts/screenshot.ts --single           # Single viewport only
 *   npx tsx scripts/screenshot.ts --theme=cute       # Custom theme (light, dark, cute)
 */

import { chromium, type Page } from '@playwright/test'
import { existsSync, mkdirSync, rmSync, readdirSync } from 'fs'
import { join } from 'path'

const SCREENSHOTS_DIR = join(process.cwd(), 'screenshots')
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000'

// Viewport presets
const viewports = {
  desktop: { width: 1280, height: 800 },
  mobile: { width: 375, height: 667 },
  tablet: { width: 768, height: 1024 },
}

// Section names for labeling (maps to scroll position)
const SECTION_LABELS = [
  'above-fold',
  'mid-section',
  'lower-section',
  'bottom',
]

function cleanScreenshots() {
  if (existsSync(SCREENSHOTS_DIR)) {
    const files = readdirSync(SCREENSHOTS_DIR)
    for (const file of files) {
      if (file.endsWith('.png')) {
        rmSync(join(SCREENSHOTS_DIR, file))
      }
    }
    console.log(`🧹 Cleaned ${files.length} old screenshot(s)`)
  }
}

async function getPageHeight(page: Page): Promise<number> {
  return await page.evaluate(() => document.documentElement.scrollHeight)
}

async function takeSegmentedScreenshots(
  page: Page,
  viewport: { width: number; height: number },
  prefix: string
) {
  const pageHeight = await getPageHeight(page)
  const viewportHeight = viewport.height
  const segments = Math.ceil(pageHeight / viewportHeight)

  console.log(`📐 Page height: ${pageHeight}px, taking ${segments} segment(s)`)

  const screenshots: string[] = []

  for (let i = 0; i < segments; i++) {
    const scrollY = i * viewportHeight
    const sectionLabel = SECTION_LABELS[i] || `section-${i + 1}`
    const filename = `${String(i + 1).padStart(2, '0')}-${prefix}-${sectionLabel}.png`
    const filepath = join(SCREENSHOTS_DIR, filename)

    await page.evaluate((y) => window.scrollTo(0, y), scrollY)
    await page.waitForTimeout(300) // Let animations settle

    await page.screenshot({
      path: filepath,
      fullPage: false,
    })

    screenshots.push(filepath)
    console.log(`  ✅ ${filename}`)
  }

  return screenshots
}

async function takeSingleScreenshot(
  page: Page,
  prefix: string
) {
  const filename = `${prefix}-viewport.png`
  const filepath = join(SCREENSHOTS_DIR, filename)

  await page.screenshot({
    path: filepath,
    fullPage: false,
  })

  console.log(`  ✅ ${filename}`)
  return [filepath]
}

async function main() {
  const args = process.argv.slice(2)

  // Parse flags
  const isMobile = args.includes('--mobile')
  const isTablet = args.includes('--tablet')
  const noClean = args.includes('--no-clean')
  const singleOnly = args.includes('--single')

  // Parse theme (default: dark)
  const themeArg = args.find(a => a.startsWith('--theme='))
  const theme = themeArg ? themeArg.split('=')[1] : 'dark'
  const validThemes = ['light', 'dark', 'cute']
  if (!validThemes.includes(theme)) {
    console.error(`❌ Invalid theme: ${theme}. Valid options: ${validThemes.join(', ')}`)
    process.exit(1)
  }

  // Determine viewport
  const viewportKey = isMobile ? 'mobile' : isTablet ? 'tablet' : 'desktop'
  const viewport = viewports[viewportKey]
  const prefix = `${viewportKey}-${theme}`

  // Ensure screenshots directory exists
  if (!existsSync(SCREENSHOTS_DIR)) {
    mkdirSync(SCREENSHOTS_DIR, { recursive: true })
  }

  // Clean old screenshots unless --no-clean flag
  if (!noClean) {
    cleanScreenshots()
  }

  // Determine color scheme for browser (cute uses light as base)
  const colorScheme = theme === 'dark' ? 'dark' : 'light'

  const browser = await chromium.launch()
  const context = await browser.newContext({
    viewport,
    colorScheme,
  })
  const page = await context.newPage()

  // Set theme in localStorage before navigating (for next-themes)
  await context.addInitScript((themeName) => {
    window.localStorage.setItem('theme', themeName)
  }, theme)

  try {
    console.log(`\n📸 Capturing ${viewportKey} (${theme} theme) screenshots of ${BASE_URL}...\n`)

    await page.goto(BASE_URL, { waitUntil: 'networkidle' })
    await page.waitForTimeout(500) // Let hydration complete

    let screenshots: string[]

    if (singleOnly) {
      screenshots = await takeSingleScreenshot(page, prefix)
    } else {
      screenshots = await takeSegmentedScreenshots(page, viewport, prefix)
    }

    console.log(`\n✅ Captured ${screenshots.length} screenshot(s) to ./screenshots/`)
    console.log(`\n📋 To analyze with Claude, read files from: ${SCREENSHOTS_DIR}`)

    // List files for easy copy-paste
    console.log(`\n📁 Files:`)
    screenshots.forEach(s => console.log(`   ${s}`))

  } catch (error) {
    console.error('❌ Screenshot failed:', error)
    process.exit(1)
  } finally {
    await browser.close()
  }
}

main()
