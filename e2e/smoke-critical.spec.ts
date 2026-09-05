import { test, expect } from '@playwright/test'

test.describe('Smoke crítico', () => {
  test('homepage carrega e permite chegar ao catálogo', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveTitle(/Kosmo/i)

    await page.goto('/catalogo')
    await expect(page.locator('body')).toBeVisible()
    await expect(page.locator('a[href*="/produto/"]').first()).toBeVisible()
  })

  test('catálogo permite abrir um produto', async ({ page }) => {
    await page.goto('/catalogo')

    const productLink = page.locator('a[href*="/produto/"]').first()
    await expect(productLink).toBeVisible()
    await productLink.click()

    await expect(page).toHaveURL(/\/produto\//)
    await expect(page.locator('body')).toBeVisible()
  })

  test('quiz completa o fluxo até o resultado', async ({ page }) => {
    await page.goto('/quiz')

    for (let question = 0; question < 5; question += 1) {
      const options = page.locator('button:visible').filter({ hasNotText: /voltar|anterior/i })
      await expect(options.first()).toBeVisible()
      await options.first().click()
    }

    await expect(page.locator('body')).toContainText(/órbita|resultado|estilo/i)
  })
})
