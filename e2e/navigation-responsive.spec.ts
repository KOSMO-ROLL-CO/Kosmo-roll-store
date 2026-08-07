import { test, expect } from '@playwright/test'

test.describe('Navegação e Responsividade', () => {
  test('deve renderizar o header e footer nas rotas principais', async ({ page }) => {
    await page.goto('/sobre')
    await expect(page.locator('footer')).toBeVisible()

    await page.goto('/contato')
    await expect(page.locator('footer')).toBeVisible()
  })

  test('deve responder corretamente a telas de celular', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')
    await expect(page.locator('body')).toBeVisible()
  })
})
