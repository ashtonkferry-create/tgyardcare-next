import { test, expect } from '@playwright/test'

const PUBLIC_PAGES = [
  { path: '/', name: 'Homepage' },
  { path: '/about', name: 'About' },
  { path: '/services', name: 'Services' },
  { path: '/residential', name: 'Residential' },
  { path: '/commercial', name: 'Commercial' },
  { path: '/contact', name: 'Contact' },
  { path: '/reviews', name: 'Reviews' },
  { path: '/blog', name: 'Blog' },
  { path: '/faq', name: 'FAQ' },
  { path: '/service-areas', name: 'Service Areas' },
]

for (const { path, name } of PUBLIC_PAGES) {
  test(`${name} (${path}) loads successfully`, async ({ page }) => {
    const consoleErrors: string[] = []
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text())
      }
    })
    page.on('pageerror', err => {
      consoleErrors.push(err.message)
    })

    const response = await page.goto(path, { waitUntil: 'networkidle' })

    // Page should return 200
    expect(response?.status()).toBe(200)

    // Page should have a title
    const title = await page.title()
    expect(title).toBeTruthy()

    // Assert zero console errors — Plan 01 fixes all Supabase errors with silent fallbacks
    expect(consoleErrors).toEqual([])
  })
}
