import { test, expect } from '@playwright/test'

test.describe('Testes de Regressão Visual (Visual Snapshots)', () => {
  test.beforeEach(async ({ browserName }, testInfo) => {
    test.skip(
      browserName !== 'chromium' || testInfo.project.name !== 'chromium',
      'Snapshots de regressão visual apenas no projeto Chromium desktop'
    )
  })

  test('snapshot visual da Home', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.evaluate(() => document.fonts.ready)

    // Esconde elementos dinâmicos com horário ou spinners
    await page.addStyleTag({
      content: '* { animation-duration: 0s !important; transition-duration: 0s !important; }',
    })

    await expect(page).toHaveScreenshot('home-page.png', {
      maxDiffPixelRatio: 0.1,
      fullPage: false,
    })
  })

  test('snapshot visual da página Sobre', async ({ page }) => {
    await page.goto('/sobre')
    await page.waitForLoadState('networkidle')
    await page.evaluate(() => document.fonts.ready)

    await page.addStyleTag({
      content: '* { animation-duration: 0s !important; transition-duration: 0s !important; }',
    })

    await expect(page).toHaveScreenshot('sobre-page.png', {
      maxDiffPixelRatio: 0.1,
      fullPage: false,
    })
  })
})
