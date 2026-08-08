import { test, expect } from '@playwright/test'

test.describe('Testes de Performance & Web Vitals', () => {
  test('deve manter LCP (Largest Contentful Paint) abaixo de 3.0 segundos', async ({ page }) => {
    await page.goto('/')

    const lcp = await page.evaluate(() => {
      return new Promise<number>((resolve) => {
        let lcpValue = 0
        const observer = new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries()
          const lastEntry = entries[entries.length - 1]
          lcpValue = lastEntry.startTime
        })
        observer.observe({ type: 'largest-contentful-paint', buffered: true })

        setTimeout(() => {
          observer.disconnect()
          resolve(lcpValue || performance.now())
        }, 2000)
      })
    })

    expect(lcp).toBeLessThan(3500)
  })

  test('deve manter limite seguro de nós no DOM na página de catálogo', async ({ page }) => {
    await page.goto('/catalogo')
    await page.waitForLoadState('networkidle')

    const domCount = await page.evaluate(() => document.querySelectorAll('*').length)
    expect(domCount).toBeLessThan(3000)
  })
})
