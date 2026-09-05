import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test.describe('Acessibilidade crítica', () => {
  test('homepage não possui violações WCAG', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('body')).toBeVisible()

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze()

    expect(results.violations).toEqual([])
  })

  test('catálogo não possui violações WCAG', async ({ page }) => {
    await page.goto('/catalogo')
    await expect(page.locator('body')).toBeVisible()

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze()

    expect(results.violations).toEqual([])
  })
})
