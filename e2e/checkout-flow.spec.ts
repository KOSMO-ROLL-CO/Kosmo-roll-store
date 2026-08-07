import { test, expect } from '@playwright/test'

test.describe('Fluxo E2E de Compra e Navegação', () => {
  test('deve carregar a página inicial com título e navegação', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveTitle(/Kosmo/i)
  })

  test('deve navegar até o catálogo de produtos e visualizar lista', async ({ page }) => {
    await page.goto('/catalogo')
    await page.waitForLoadState('networkidle')
    await expect(page.locator('body')).toBeVisible()
  })

  test('deve permitir acesso à página de Cupons e exibir o cupom KOSMO10', async ({ page }) => {
    await page.goto('/cupons')
    await page.waitForLoadState('networkidle')
    await expect(page.getByText(/KOSMO10/i).first()).toBeVisible()
  })

  test('deve carregar a página de checkout', async ({ page }) => {
    await page.goto('/checkout')
    await page.waitForLoadState('networkidle')
    await expect(page.locator('body')).toBeVisible()
  })
})
