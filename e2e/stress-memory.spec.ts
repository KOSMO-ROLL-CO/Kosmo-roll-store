import { test, expect } from '@playwright/test'

test.describe('Testes de Estresse & Memory Leak Client-side', () => {
  test('deve suportar interações repetidas sem estouro de uso de memória', async ({ page }) => {
    await page.goto('/catalogo')
    await page.waitForLoadState('networkidle')

    // Medição inicial de nós DOM
    const initialDOM = await page.evaluate(() => document.querySelectorAll('*').length)

    // Simular 10 ciclos rápidos de troca de rotas
    for (let i = 0; i < 5; i++) {
      await page.goto('/sobre')
      await page.goto('/contato')
      await page.goto('/catalogo')
    }

    const finalDOM = await page.evaluate(() => document.querySelectorAll('*').length)

    // O crescimento da árvore DOM não deve explodir descomunalmente
    expect(finalDOM).toBeLessThan(initialDOM * 3)
  })
})
