import { test, expect, type Page } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

async function waitForIdle(page: Page) {
  try {
    await page.waitForLoadState('networkidle', { timeout: 10000 })
  } catch {
    // Segue mesmo que vídeos/imagens/fontes mantenham a rede ativa
  }
}

test.describe('Testes de Acessibilidade (WCAG 2.1 AA)', () => {
  test('página inicial não deve conter violações graves de acessibilidade', async ({ page }) => {
    await page.goto('/')
    await waitForIdle(page)

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze()

    expect(accessibilityScanResults.violations).toEqual([])
  })

  test('página de catálogo deve ter estrutura semântica acessível', async ({ page }) => {
    await page.goto('/catalogo')
    await waitForIdle(page)

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze()

    expect(accessibilityScanResults.violations).toEqual([])
  })

  test('página de checkout deve ter formulários acessíveis', async ({ page }) => {
    await page.goto('/checkout')
    await waitForIdle(page)

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze()

    expect(accessibilityScanResults.violations).toEqual([])
  })
})
